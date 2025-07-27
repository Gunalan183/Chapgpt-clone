import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import Sidebar from './Sidebar';
import Message from './Message';
import ChatInput from './ChatInput';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const ChatLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentChat, isTyping, createChat } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isTyping]);

  // Close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = async () => {
    await createChat();
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Chat title */}
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentChat?.title || 'ChatGPT Clone'}
                </h1>
              </div>
            </div>

            {/* Model indicator */}
            {currentChat && (
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Model:</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                  {currentChat.model || 'gpt-3.5-turbo'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!currentChat ? (
            // Welcome screen
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to ChatGPT Clone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start a conversation with AI. Ask questions, get help with coding, writing, or anything else you need assistance with.
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start New Chat
                </button>

                {/* Example prompts */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      💡 Creative Writing
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      "Write a short story about..."
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      🔧 Code Help
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      "Help me debug this code..."
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      📚 Learning
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      "Explain quantum physics..."
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      🌍 Translation
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      "Translate this to Spanish..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="pb-4">
              {currentChat.messages?.map((message, index) => (
                <Message
                  key={`${message.timestamp}-${index}`}
                  message={message}
                  isLast={index === currentChat.messages.length - 1}
                />
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="chat-message assistant-message">
                  <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ChatGPT
                          </span>
                        </div>
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatLayout;
