import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  TrashIcon, 
  PencilIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { chats, currentChat, createChat, deleteChat, loadChat } = useChat();
  const { user, logout } = useAuth();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const handleNewChat = async () => {
    await createChat();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleChatSelect = async (chatId) => {
    await loadChat(chatId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  const handleEditStart = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    // TODO: Implement updateChatTitle
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No chats yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`
                    group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors
                    ${currentChat?.id === chat.id 
                      ? 'bg-gray-700 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'
                    }
                  `}
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  
                  {editingChatId === chat.id ? (
                    <form onSubmit={handleEditSave} className="flex-1 mr-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleEditCancel}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </form>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(chat.lastActivity || chat.createdAt)}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditStart(e, chat)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Rename chat"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="p-1 hover:bg-red-600 rounded"
                      title="Delete chat"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 mr-3" />
            ) : (
              <MoonIcon className="h-5 w-5 mr-3" />
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User info */}
          <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-300">
            <div className="flex items-center min-w-0">
              <UserCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="truncate">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="p-1 hover:bg-gray-800 rounded"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
