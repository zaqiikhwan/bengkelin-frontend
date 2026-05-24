import React from 'react';
import { UserCircleIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface Participant {
  name: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
}

interface ChatHeaderProps {
  participant: Participant | null;
  formatLastSeen: (ts: string) => string;
}

const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({ participant, formatLastSeen }) => {
  if (!participant) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {participant.avatar_url ? (
            <img src={participant.avatar_url} alt={participant.name} loading="lazy" className="w-8 h-8 rounded-full" />
          ) : (
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{participant.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {participant.is_online ? 'Online' : participant.last_seen ? formatLastSeen(participant.last_seen) : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Call">
            <PhoneIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Video call">
            <VideoCameraIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="More options">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';
export default ChatHeader;
