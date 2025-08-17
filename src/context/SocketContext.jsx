import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        autoConnect: true,
      });

      // Socket event listeners
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (error.message === 'Authentication failed') {
          logout();
        }
      });

      socketRef.current.on('hackathon_update', (data) => {
        console.log('Hackathon update received:', data);
        // Handle hackathon updates
      });

      socketRef.current.on('submission_update', (data) => {
        console.log('Submission update received:', data);
        // Handle submission updates
      });

      socketRef.current.on('notification', (data) => {
        console.log('Notification received:', data);
        // Handle notifications
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, token, logout]);

  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
