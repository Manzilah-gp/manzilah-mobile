/**
 * useSocket Hook - Real-time messaging with Socket.io
 * Place in: src/hooks/useSocket.js
 * 
 * REQUIRES: npm install socket.io-client
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../constants/config';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    initializeSocket();
    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found');
        return;
      }

      // Create socket connection
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket error:', error.message);
        setIsConnected(false);
      });

      // User status
      socket.on('user:online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      socket.on('user:offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

    } catch (error) {
      console.error('❌ Socket init error:', error);
    }
  };

  const joinConversation = (conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:join', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:leave', conversationId);
    }
  };

  const sendMessage = (data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', data);
    }
  };

  const startTyping = (conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', conversationId);
    }
  };

  const stopTyping = (conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', conversationId);
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

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    on,
    off,
  };
};

export default useSocket;