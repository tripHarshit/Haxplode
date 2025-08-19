import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && localStorage.getItem('token')) {
      console.log('Socket: Attempting to connect with token:', localStorage.getItem('token') ? 'YES' : 'NO');
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
        // In a real app, this would show notifications or update the UI
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

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
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
    emitSubmissionUpdate
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
