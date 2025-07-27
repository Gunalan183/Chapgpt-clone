import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon, 
  StopIcon 
} from '@heroicons/react/24/outline';

const ChatInput = ({ disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const { sendMessage, isTyping, currentChat } = useChat();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChat || isTyping) return;

    const messageToSend = message.trim();
    setMessage('');
    
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const isDisabled = disabled || !currentChat || isTyping;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            {/* Voice input button */}
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isDisabled}
                className={`
                  flex-shrink-0 p-2 rounded-lg transition-colors
                  ${isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? (
                  <StopIcon className="h-5 w-5" />
                ) : (
                  <MicrophoneIcon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !currentChat 
                    ? "Start a new chat to begin messaging..." 
                    : isTyping 
                    ? "AI is typing..." 
                    : "Type your message here... (Press Enter to send, Shift+Enter for new line)"
                }
                disabled={isDisabled}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
              
              {/* Send button */}
              <button
                type="submit"
                disabled={isDisabled || !message.trim()}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                title="Send message"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="typing-indicator mr-2">
                <div className="typing-dot"></div>
                <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
              AI is typing...
            </div>
          )}

          {/* Voice input indicator */}
          {isListening && (
            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
              Listening... Speak now
            </div>
          )}

          {/* Character count */}
          {message.length > 0 && (
            <div className="mt-1 text-xs text-gray-400 text-right">
              {message.length} characters
            </div>
          )}
        </form>

        {/* Disclaimer */}
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          ChatGPT Clone can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
