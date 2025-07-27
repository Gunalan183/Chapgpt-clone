import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

const initialState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
  isTyping: false
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false };
    case 'ADD_CHAT':
      return { 
        ...state, 
        chats: [action.payload, ...state.chats],
        currentChat: action.payload,
        loading: false 
      };
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat => 
          chat.id === action.payload.id ? action.payload : chat
        ),
        currentChat: state.currentChat?.id === action.payload.id ? action.payload : state.currentChat,
        loading: false
      };
    case 'DELETE_CHAT':
      return {
        ...state,
        chats: state.chats.filter(chat => chat.id !== action.payload),
        currentChat: state.currentChat?.id === action.payload ? null : state.currentChat,
        loading: false
      };
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload, loading: false };
    case 'ADD_MESSAGE':
      if (!state.currentChat) return state;
      const updatedChat = {
        ...state.currentChat,
        messages: [...state.currentChat.messages, action.payload],
        lastActivity: new Date().toISOString()
      };
      return {
        ...state,
        currentChat: updatedChat,
        chats: state.chats.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        )
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  const loadChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/chat');
      dispatch({ type: 'SET_CHATS', payload: response.data.chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chats' });
    }
  };

  const createChat = async (title = 'New Chat') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/chat', { title });
      dispatch({ type: 'ADD_CHAT', payload: response.data.chat });
      return response.data.chat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create chat' });
      return null;
    }
  };

  const loadChat = async (chatId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`/chat/${chatId}`);
      dispatch({ type: 'SET_CURRENT_CHAT', payload: response.data.chat });
      return response.data.chat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chat' });
      return null;
    }
  };

  const sendMessage = async (message, model = 'gpt-3.5-turbo') => {
    if (!state.currentChat) return;

    try {
      // Add user message immediately
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_TYPING', payload: true });

      const response = await axios.post(`/chat/${state.currentChat.id}/messages`, {
        message,
        model
      });

      // Update chat with new messages from server
      dispatch({ type: 'SET_CURRENT_CHAT', payload: response.data.chat });
      dispatch({ type: 'SET_TYPING', payload: false });

      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      return null;
    }
  };

  const updateChatTitle = async (chatId, title) => {
    try {
      const response = await axios.patch(`/chat/${chatId}`, { title });
      dispatch({ type: 'UPDATE_CHAT', payload: response.data.chat });
      return response.data.chat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update chat title' });
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`/chat/${chatId}`);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete chat' });
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    loadChats,
    createChat,
    loadChat,
    sendMessage,
    updateChatTitle,
    deleteChat,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
