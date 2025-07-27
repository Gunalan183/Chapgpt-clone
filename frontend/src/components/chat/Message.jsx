import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  UserIcon, 
  CpuChipIcon, 
  ClipboardIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';

const Message = ({ message, isLast }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`
      chat-message group
      ${isUser ? 'user-message' : 'assistant-message'}
    `}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex space-x-4">
          {/* Avatar */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-green-600 text-white'
            }
          `}>
            {isUser ? (
              <UserIcon className="h-5 w-5" />
            ) : (
              <CpuChipIcon className="h-5 w-5" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {isUser ? 'You' : 'ChatGPT'}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
                {!isUser && (
                  <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                    title="Copy message"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Message Text */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {isUser ? (
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code 
                          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-3 last:mb-0 text-gray-900 dark:text-gray-100">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="mb-3 last:mb-0 list-disc list-inside text-gray-900 dark:text-gray-100">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="mb-3 last:mb-0 list-decimal list-inside text-gray-900 dark:text-gray-100">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="mb-1">{children}</li>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 mb-3">
                          {children}
                        </blockquote>
                      );
                    },
                    h1({ children }) {
                      return <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h3>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Token usage info for assistant messages */}
            {!isUser && message.tokens && (
              <div className="mt-2 text-xs text-gray-400">
                Tokens used: {message.tokens}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
