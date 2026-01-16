/**
 * ChatScreen - Complete Chat Interface with Fixed UI
 * Place in: src/screens/ChatScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../hooks/useSocket';
import { 
  getConversations, 
  getMessages, 
  sendMessage as sendMessageApi,
  markAsRead,
  searchUsers,
  createPrivateConversation,
} from '../api/Chatapi';
import { API_BASE_URL } from '../constants/config';


const { width } = Dimensions.get('window');

const ChatScreen = ({ navigation }) => {
  // State for conversations and messages
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for new chat modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { isConnected, joinConversation, leaveConversation, sendMessage, on, off } = useSocket();

  // Load user ID and conversations on mount
  useEffect(() => {
    loadData();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    on('message:new', handleNewMessage);
    return () => off('message:new', handleNewMessage);
  }, [selectedConv]);

  // Join conversation when selected
  useEffect(() => {
    if (selectedConv) {
      joinConversation(selectedConv.id);
      loadMessages(selectedConv.id);
      return () => leaveConversation(selectedConv.id);
    }
  }, [selectedConv]);

  // Load user data and conversations
  const loadData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUserId(userData.id?.toString());
      }
      
      const result = await getConversations();
      if (result.success) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (convId) => {
    try {
      const result = await getMessages(convId);
      if (result.success) {
        setMessages(result.messages);
        await markAsRead(convId);
      }
    } catch (error) {
      console.error('Load messages error:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  // Send message handler
  const handleSend = async () => {
    if (!messageText.trim() || !selectedConv) return;

    const tempMessage = messageText;
    setMessageText(''); // Clear input immediately

    try {
      const result = await sendMessageApi(selectedConv.id, tempMessage);
      if (result.success) {
        setMessages(prev => [...prev, result.message]);
        sendMessage({
          conversationId: selectedConv.id,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessageText(tempMessage); // Restore message on error
    }
  };

  // Handle new message from socket
  const handleNewMessage = ({ conversationId, message }) => {
    if (selectedConv?.id === conversationId) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }
    
    // Update conversation list
    loadData();
  };

  // Search users for new chat
// In ChatScreen.js - Update handleSearch function:
const handleSearch = async (text) => {
  setSearchQuery(text);

  if (text.trim().length < 2) {
    setSearchResults([]);
    return;
  }

  setSearchLoading(true); // Add loading state
  
  try {
    console.log('🔍 Searching for:', text);
    console.log('📡 API URL:', `${API_BASE_URL
}/chat/users/search?q=${text}`);
    
    const result = await searchUsers(text);
    
    console.log('✅ Search complete:', {
      success: result.success,
      userCount: result.users?.length || 0,
      users: result.users
    });

    if (result.success && Array.isArray(result.users)) {
      setSearchResults(result.users);
    } else {
      console.warn('⚠️ Invalid response format:', result);
      setSearchResults([]);
    }
  } catch (error) {
    console.error('❌ Search failed:', error);
    setSearchResults([]);
    Alert.alert('Search Error', 'Failed to search users. Please try again.');
  } finally {
    setSearchLoading(false);
  }
};


  // Start new conversation with selected user
  const handleStartChat = async (user) => {
    try {
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);

      const result = await createPrivateConversation(user.id);
      if (result.success) {
        // Reload conversations
        await loadData();
        
        // Find and select the new conversation
        setTimeout(() => {
          const newConv = conversations.find(c => c.id === result.conversation_id);
          if (newConv) {
            setSelectedConv(newConv);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Start chat error:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  // Render conversation item in list
  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.convItem,
        selectedConv?.id === item.id && styles.convItemActive,
      ]}
      onPress={() => setSelectedConv(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.display_name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.convInfo}>
        <Text style={styles.convName} numberOfLines={1}>
          {item.display_name || 'Unknown'}
        </Text>
        <Text style={styles.convMsg} numberOfLines={1}>
          {item.last_message || 'No messages'}
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render message bubble
  const renderMessage = ({ item }) => {
    const isOwn = item.sender_id?.toString() === currentUserId;
    
    return (
      <View style={[styles.msgWrapper, isOwn && styles.msgWrapperOwn]}>
        {!isOwn && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <View style={[styles.msgBubble, isOwn ? styles.msgBubbleOwn : styles.msgBubbleOther]}>
          <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>
            {item.message_text}
          </Text>
        </View>
      </View>
    );
  };

  // Render search result item
 const renderSearchResult = ({ item }) => {
  const name =
    item.full_name ||
    item.name ||
    item.username ||
    'Unknown User';

  return (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleStartChat(item)}
    >
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName}>{name}</Text>
        {item.email && (
          <Text style={styles.searchResultEmail}>{item.email}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};


  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e3c72" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, isConnected && styles.statusDotConnected]} />
          <Text style={styles.headerStatus}>
            {isConnected ? 'Connected' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Main Content - Full Screen Layout */}
      <View style={styles.mainContainer}>
        {/* Show conversation list OR message view */}
        {!selectedConv ? (
          // Conversations List (Full Screen)
          <View style={styles.conversationsFullScreen}>
            <View style={styles.convListHeader}>
              <Text style={styles.convListTitle}>Chats</Text>
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={() => setShowNewChatModal(true)}
              >
                <Ionicons name="create-outline" size={24} color="#1e3c72" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.conversationsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
                  <Text style={styles.emptyText}>No conversations</Text>
                  <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
                  <TouchableOpacity
                    style={styles.startChatBtn}
                    onPress={() => setShowNewChatModal(true)}
                  >
                    <Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.startChatBtnText}>Start a chat</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        ) : (
          // Messages View (Full Screen)
          <KeyboardAvoidingView
            style={styles.messagesFullScreen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.chatBackButton}>
                <Ionicons name="arrow-back" size={24} color="#1e3c72" />
              </TouchableOpacity>
              <View style={styles.chatHeaderInfo}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>
                    {selectedConv.display_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={styles.chatHeaderName}>{selectedConv.display_name}</Text>
              </View>
            </View>

            {/* Messages List */}
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              style={styles.msgsList}
              contentContainerStyle={styles.msgsContent}
              ListEmptyComponent={
                <View style={styles.emptyStateMessages}>
                  <Ionicons name="mail-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No messages yet</Text>
                  <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
                </View>
              }
            />

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!messageText.trim()}
              >
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowNewChatModal(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowNewChatModal(false);
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Ionicons name="close" size={28} color="#1e3c72" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Conversation</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {searchLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e3c72" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              style={styles.searchResultsList}
              contentContainerStyle={styles.searchResultsContent}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No users found</Text>
                    <Text style={styles.emptySubtext}>Try a different search term</Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Search for users</Text>
                    <Text style={styles.emptySubtext}>Enter at least 2 characters to search</Text>
                  </View>
                )
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3c72',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4d4f',
    marginRight: 6,
  },
  statusDotConnected: {
    backgroundColor: '#52c41a',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  mainContainer: {
    flex: 1,
  },
  conversationsFullScreen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  convListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFF',
  },
  convListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3c72',
  },
  newChatButton: {
    padding: 8,
  },
  conversationsList: {
    flexGrow: 1,
  },
  convItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  convItemActive: {
    backgroundColor: '#e3f2fd',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3c72',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  convInfo: {
    flex: 1,
  },
  convName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  convMsg: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#ff4d4f',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesFullScreen: {
    flex: 1,
    backgroundColor: '#EEF2F5',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatBackButton: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3c72',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  msgsList: {
    flex: 1,
  },
  msgsContent: {
    padding: 16,
    flexGrow: 1,
  },
  msgWrapper: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  msgWrapperOwn: {
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 18,
  },
  msgBubbleOwn: {
    backgroundColor: '#1e3c72',
  },
  msgBubbleOther: {
    backgroundColor: '#E4E6EB',
  },
  msgText: {
    fontSize: 15,
    color: '#000',
  },
  msgTextOwn: {
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#000',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e3c72',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
  },
  startChatBtn: {
    marginTop: 24,
    backgroundColor: '#1e3c72',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startChatBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3c72',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContent: {
    flexGrow: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  searchResultEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  searchResultRole: {
    fontSize: 12,
    color: '#2a5298',
    fontWeight: '500',
  },
});

export default ChatScreen;