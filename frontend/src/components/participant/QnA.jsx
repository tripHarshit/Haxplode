import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import { hackathonService } from '../../services/hackathonService';

const MessageBubble = ({ title, subtitle, children }) => (
  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
    <div className="flex items-center justify-between mb-1">
      <div className="text-sm font-medium text-neutral-800">{title}</div>
      <div className="text-xs text-neutral-500">{subtitle}</div>
    </div>
    {children}
  </div>
);

const QnA = ({ eventId }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [userDisplayById, setUserDisplayById] = useState({});
  const listRef = useRef(null);

  // Build grouped threads Question -> [Answers]
  const { questions, answersByParent } = useMemo(() => {
    const byParent = new Map();
    const qs = [];
    for (const m of messages) {
      const isQ = m.isQuestion || m.messageType === 'Question';
      if (isQ) {
        qs.push(m);
      } else if (m.parentMessageId) {
        const key = String(m.parentMessageId);
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(m);
      }
    }
    // sort by time
    qs.sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
    for (const arr of byParent.values()) {
      arr.sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
    }
    return { questions: qs, answersByParent: byParent };
  }, [messages]);

  const getDisplayName = (userId) => {
    if (userId == null) return 'Unknown';
    return userDisplayById[userId] || `User #${userId}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load initial messages
        const initial = await chatService.getMessages(eventId, { page: 1, limit: 50 });
        setMessages(Array.isArray(initial) ? initial : []);
        // Load participants for display names
        try {
          const resp = await hackathonService.getHackathonParticipants(eventId);
          const parts = resp?.participants || resp?.data?.participants || [];
          const map = {};
          for (const p of parts) {
            const id = p.id || p.userId || p.user?.id;
            if (id != null) map[id] = p.fullName || p.name || p.user?.fullName || p.email || `User #${id}`;
          }
          setUserDisplayById(map);
        } catch {}
      } catch (e) {
        console.warn('Failed to load messages:', e?.message || e);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) load();
  }, [eventId]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const onNew = (data) => {
      if (String(data?.eventId) !== String(eventId)) return;
      const m = data?.message;
      if (!m) return;
      setMessages((prev) => {
        const exists = prev.some((it) => (it._id && m._id && it._id === m._id) || (it.id && m.id && it.id === m.id));
        return exists ? prev : [...prev, m];
      });
    };
    const onUpdate = (data) => {
      if (String(data?.eventId) !== String(eventId)) return;
      const updated = data?.message;
      if (!updated) return;
      setMessages((m) => m.map((it) => ((it._id && updated._id && it._id === updated._id) || (it.id && updated.id && it.id === updated.id)) ? { ...it, ...updated } : it));
    };
    const onDelete = (data) => {
      if (String(data?.eventId) !== String(eventId)) return;
      setMessages((m) => m.filter((it) => it._id !== data?.messageId && it.id !== data?.messageId));
    };

    socket.on('qna_message', onNew);
    socket.on('qna_update', onUpdate);
    socket.on('qna_delete', onDelete);

    return () => {
      socket.off('qna_message', onNew);
      socket.off('qna_update', onUpdate);
      socket.off('qna_delete', onDelete);
    };
  }, [socket, isConnected, eventId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      const payload = replyTo
        ? { eventId, message: text, messageType: 'Answer', parentMessageId: replyTo._id || replyTo.id }
        : { eventId, message: text, messageType: 'Question' };
      await chatService.sendMessage(payload);
      setInput('');
      setReplyTo(null);
      // wait for server broadcast
    } catch (e) {
      console.warn('Failed to send message:', e?.message || e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold text-neutral-900">Q&A</div>
      <div ref={listRef} className="h-64 overflow-y-auto space-y-3 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-neutral-500">No messages yet. Ask the first question!</div>
        ) : (
          questions.map((q) => (
            <div key={q._id || q.id} className="space-y-2">
              <button onClick={() => setReplyTo(q)} className="w-full text-left">
                <MessageBubble
                  title={`Question by ${getDisplayName(q.senderId)}`}
                  subtitle={new Date(q.createdAt || q.timestamp || Date.now()).toLocaleString()}
                >
                  <div className="text-sm text-neutral-800">{q.message}</div>
                </MessageBubble>
              </button>
              {(answersByParent.get(String(q._id || q.id)) || []).map((a) => (
                <div key={a._id || a.id} className="pl-4">
                  <MessageBubble
                    title={`Answer by ${getDisplayName(a.senderId)}`}
                    subtitle={new Date(a.createdAt || a.timestamp || Date.now()).toLocaleString()}
                  >
                    <div className="text-sm text-neutral-800">{a.message}</div>
                  </MessageBubble>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      {replyTo && (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
          Replying to {getDisplayName(replyTo.senderId)}: {replyTo.message?.slice(0, 80)}
          <button className="ml-2 text-blue-600 hover:underline" onClick={() => setReplyTo(null)}>Cancel</button>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <input
          className="flex-1 input"
          placeholder={replyTo ? 'Write a reply' : 'Ask a question'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button className="btn-primary px-4 py-2" onClick={send}>{replyTo ? 'Reply' : 'Send'}</button>
      </div>
    </div>
  );
};

export default QnA; 