import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';

const MessageItem = ({ msg, onMarkRead }) => {
  return (
    <div className="p-3 rounded-lg border border-neutral-200 bg-white">
      <div className="text-sm text-neutral-800 mb-1">{msg.message}</div>
      <div className="text-xs text-neutral-500 flex items-center justify-between">
        <span>From: {msg.senderId}</span>
        <span>{new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleString()}</span>
      </div>
    </div>
  );
};

const QnA = ({ eventId }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const initial = await chatService.getMessages(eventId, { page: 1, limit: 50 });
        setMessages(Array.isArray(initial) ? initial : []);
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
  }, [sortedMessages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      await chatService.sendMessage({ eventId, message: text, messageType: 'Question' });
      setInput('');
      // Do not optimistically add; the server broadcast (qna_message) will append it.
    } catch (e) {
      console.warn('Failed to send message:', e?.message || e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold text-neutral-900">Q&A</div>
      <div ref={listRef} className="h-64 overflow-y-auto space-y-2 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading...</div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-sm text-neutral-500">No messages yet. Ask the first question!</div>
        ) : (
          sortedMessages.map((msg) => <MessageItem key={msg._id || msg.id} msg={msg} />)
        )}
      </div>
      <div className="flex items-center space-x-2">
        <input
          className="flex-1 input"
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button className="btn-primary px-4 py-2" onClick={send}>Send</button>
      </div>
    </div>
  );
};

export default QnA; 