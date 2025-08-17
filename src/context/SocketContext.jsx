import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // In a real app, this would connect to your Socket.io server
      // const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      //   auth: {
      //     token: localStorage.getItem('token')
      //   }
      // });
      
      // For demo purposes, we'll simulate socket connection
      const newSocket = {
        on: (event, callback) => {
          // Simulate real-time events
          if (event === 'connect') {
            setTimeout(() => callback(), 100);
          } else if (event === 'team_update') {
            // Simulate team updates every 30 seconds
            setInterval(() => {
              callback({
                type: 'member_joined',
                teamId: 1,
                message: 'New team member joined',
                timestamp: new Date().toISOString()
              });
            }, 30000);
          } else if (event === 'event_announcement') {
            // Simulate event announcements every 2 minutes
            setInterval(() => {
              callback({
                type: 'deadline_reminder',
                eventId: 1,
                message: 'Submission deadline approaching',
                timestamp: new Date().toISOString()
              });
            }, 120000);
          }
        },
        emit: (event, data) => {
          console.log('Socket emit:', event, data);
        },
        disconnect: () => {
          console.log('Socket disconnected');
        }
      };

      setSocket(newSocket);
      setIsConnected(true);

      // Simulate connection
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
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
