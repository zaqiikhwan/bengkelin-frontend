import React from 'react';
import { ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import type { ChatRoom } from '../../types/api';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  wsConnected: boolean;
  onRoomSelect: (room: ChatRoom) => void;
  onRefresh: () => void;
  formatTime: (ts: string) => string;
  getOtherParticipant: (room: ChatRoom) => { name: string; avatar_url?: string; is_online: boolean; last_seen?: string } | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = React.memo(({
  rooms, selectedRoom, wsConnected, onRoomSelect, onRefresh, formatTime, getOtherParticipant,
}) => {
  return (
    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
          <button onClick={onRefresh} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Refresh room list" aria-label="Refresh room list">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} aria-hidden="true" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{wsConnected ? 'Real-time' : 'Polling mode'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Chat conversations">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No conversations yet</p>
          </div>
        ) : (
          rooms.map((room) => {
            const other = getOtherParticipant(room);
            return (
              <div
                key={room.id}
                role="option"
                aria-selected={selectedRoom?.id === room.id}
                onClick={() => onRoomSelect(room)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} alt={other.name} loading="lazy" className="w-10 h-10 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{other?.name || 'Unknown User'}</p>
                      {room.last_message_at && <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(room.last_message_at)}</p>}
                    </div>
                    {room.last_message && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{room.last_message}</p>}
                  </div>
                  {room.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center" aria-label={`${room.unread_count} unread messages`}>
                      {room.unread_count}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

ChatSidebar.displayName = 'ChatSidebar';
export default ChatSidebar;
