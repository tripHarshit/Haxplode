import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { hackathonService } from '../services/hackathonService';
import { announcementService } from '../services/announcementService';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { showInfo } = useNotifications();

  useEffect(() => {
    if (isAuthenticated && user && localStorage.getItem('token')) {
      console.log('Socket: Attempting to connect with token:', localStorage.getItem('token') ? 'YES' : 'NO');
      const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      setSocket(newSocket);
      setIsConnected(true);

      // Handle connection
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        // Join user-specific room for direct notifications
        try {
          if (user?.id) {
            newSocket.emit('join_room', { roomType: 'user', roomId: user.id });
          }
        } catch {}
      });

      // Handle disconnection
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle connection errors
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for team updates
      newSocket.on('team_update', (data) => {
        console.log('Team update received:', data);
        // In a real app, this would update the UI or show notifications
      });

      // Listen for event announcements
      newSocket.on('event_announcement', (data) => {
        console.log('Event announcement received:', data);
        try {
          const title = data.title || 'New Announcement';
          const msg = data.body || data.message || 'There is a new update.';
          showInfo(`${title}: ${msg}`, 7000);
          setUnreadCount((c) => c + 1);
        } catch {}
      });

      // Listen for announcement updates/deletes
      newSocket.on('event_announcement_update', (data) => {
        console.log('Announcement updated:', data);
      });
      newSocket.on('event_announcement_delete', (data) => {
        console.log('Announcement deleted:', data);
      });

      // Listen for direct notifications
      newSocket.on('notification', (data) => {
        try {
          const title = data.title || 'Notification';
          const msg = data.body || data.message || '';
          showInfo(`${title}${msg ? ': ' + msg : ''}`, 7000);
          setUnreadCount((c) => c + 1);
        } catch {}
      });

      // Listen for submission updates
      newSocket.on('submission_update', (data) => {
        console.log('Submission update received:', data);
        // In a real app, this would update the UI or show notifications
      });

      // Listen for leaderboard updates
      newSocket.on('leaderboard_update', (data) => {
        console.log('Leaderboard update received:', data);
        // In a real app, this would update the UI or show notifications
      });

      // Q&A channel listeners
      newSocket.on('qna_message', (data) => {
        console.log('Q&A message:', data);
      });
      newSocket.on('qna_update', (data) => {
        console.log('Q&A message updated:', data);
      });
      newSocket.on('qna_delete', (data) => {
        console.log('Q&A message deleted:', data);
      });
      newSocket.on('qna_reaction', (data) => {
        console.log('Q&A reaction:', data);
      });
      newSocket.on('qna_read', (data) => {
        console.log('Q&A read receipt:', data);
      });
      newSocket.on('qna_pin', (data) => {
        console.log('Q&A pin toggled:', data);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Join event rooms the user is participating in OR created (if organizer)
  useEffect(() => {
    const joinEventRooms = async () => {
      if (!socket || !isConnected || !user) return;
      try {
        const { createdEvents, participatingEvents } = await hackathonService.getUserEvents({ page: 1, limit: 100 });
        const createdIds = (createdEvents || []).map(e => e.id);
        const partIds = (participatingEvents || []).map(e => e.id);
        const eventIds = Array.from(new Set([...(createdIds || []), ...(partIds || [])]));
        eventIds.forEach(eventId => {
          socket.emit('join_room', { roomType: 'event', roomId: eventId });
        });
      } catch (err) {
        console.warn('Failed to join event rooms:', err?.message || err);
      }
    };
    joinEventRooms();
  }, [socket, isConnected, user]);

  // Refresh initial unread announcements count
  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const { participatingEvents } = await hackathonService.getUserEvents({ page: 1, limit: 100 });
      const eventIds = (participatingEvents || []).map(e => e.id);
      const results = await Promise.all(
        eventIds.map(eventId => announcementService.getEventAnnouncements(eventId))
      );
      const anns = results.flatMap(r => (r?.data?.announcements || r?.announcements || []));
      const unread = anns.filter(a => !(Array.isArray(a.readBy) && a.readBy.some(rb => rb.userId === user.id))).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Failed to refresh unread count:', err?.message || err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshUnreadCount();
    }
  }, [isAuthenticated, user]);

  const emitTeamUpdate = (teamId, updateType, data) => {
    if (socket && isConnected) {
      socket.emit('team_update', {
        teamId,
        type: updateType,
        data,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitSubmissionUpdate = (submissionId, updateType, data) => {
    if (socket && isConnected) {
      socket.emit('submission_update', {
        submissionId,
        type: updateType,
        data,
        timestamp: new Date().toISOString()
      });
    }
  };

  const value = {
    socket,
    isConnected,
    emitTeamUpdate,
    emitSubmissionUpdate,
    unreadCount,
    refreshUnreadCount,
    setUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
