/**
 * Chat API - REST API Functions
 * Place in: src/api/chatApi.js
 * 
 * All HTTP requests for chat functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// Helper: Get auth token
const getToken = async () => {
  return await AsyncStorage.getItem('authToken'); // Changed to match useSocket.js
};

// Helper: Create headers
const getHeaders = async () => {
  const token = await getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Get all conversations for current user
 */
export const getConversations = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, { headers });
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      { headers }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, messageText) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        message_text: messageText,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (conversationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/messages/read`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ conversation_id: conversationId }),
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    throw error;
  }
};

/**
 * Search users - FIXED VERSION
 */
export const searchUsers = async (query) => {
  try {
    // Use proper headers with token
    const headers = await getHeaders();
    
    // Use correct endpoint from chatRoutes.js: /chat/users/search
    const response = await fetch(
      `${API_BASE_URL}/chat/users/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();
    
    console.log('✅ Search API Response:', data);

    // Return consistent format
    return {
      success: data.success || true,
      users: data.users || [],
    };
  } catch (error) {
    console.error('❌ Search users error:', error);
    return {
      success: false,
      users: [],
      error: error.message,
    };
  }
};

/**
 * Create private conversation
 */
export const createPrivateConversation = async (otherUserId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/private`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ other_user_id: otherUserId }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    throw error;
  }
};

/**
 * Create group conversation
 */
export const createGroupConversation = async (name, description, memberIds) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/group`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          description,
          member_ids: memberIds,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Error creating group:', error);
    throw error;
  }
};