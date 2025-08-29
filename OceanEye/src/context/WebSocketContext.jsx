import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      // Initialize socket connection
      const initSocket = async () => {
        try {
          const socketInstance = await socketService.connect(user.id);
          setSocket(socketInstance);
          setIsConnected(true);
          setConnectionAttempts(0);

          // Handle connection events
          socketInstance.on('connect', () => {
            setIsConnected(true);
            setConnectionAttempts(0);
          });

          socketInstance.on('disconnect', () => {
            setIsConnected(false);
          });

          socketInstance.on('connect_error', () => {
            setIsConnected(false);
            setConnectionAttempts(prev => prev + 1);
          });

        } catch (error) {
          console.error('Socket connection failed:', error);
          setConnectionAttempts(prev => prev + 1);
        }
      };

      initSocket();

      return () => {
        if (socket) {
          socketService.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
      };
    }
  }, [user]);

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && connectionAttempts > 0 && connectionAttempts < 5 && user) {
      const timer = setTimeout(() => {
        console.log(`Attempting to reconnect... (${connectionAttempts}/5)`);
        const socketInstance = socketService.connect(user.id);
        setSocket(socketInstance);
      }, 3000 * connectionAttempts); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [connectionAttempts, isConnected, user]);

  const value = {
    socket,
    isConnected,
    connectionAttempts,
    reconnect: () => {
      if (user) {
        const socketInstance = socketService.connect(user.id);
        setSocket(socketInstance);
      }
    },
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
