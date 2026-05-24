import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { CheckIcon, CheckCheckIcon } from 'lucide-react';
import type { ChatMessage } from '../../types/api';

interface ChatMessagesProps {
  messages: ChatMessage[];
  typingUsers: string[];
  currentUserId: string;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  formatTime: (ts: string) => string;
}

const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({
  messages, typingUsers, currentUserId, messagesContainerRef, messagesEndRef, formatTime,
}) => {
  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            const isTemp = message.id.startsWith('temp-');
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  } ${isTemp ? 'opacity-70' : ''}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    <span>{formatTime(message.created_at)}</span>
                    {isOwn && (
                      <div className="flex items-center ml-2">
                        {message.is_read ? <CheckCheckIcon className="w-3 h-3" /> : <CheckIcon className="w-3 h-3" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <p className="text-sm italic">
                  {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';
export default ChatMessages;
