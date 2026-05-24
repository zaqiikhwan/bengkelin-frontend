import React from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  newMessage: string;
  sending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({
  newMessage, sending, fileInputRef, onMessageChange, onSend, onTyping, onStopTyping,
}) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Attach file">
          <PaperClipIcon className="w-5 h-5" />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) console.log('File selected:', f); }} />
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => { onMessageChange(e.target.value); onTyping(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onStopTyping(); onSend(); } }}
            placeholder="Type a message..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            disabled={sending}
            aria-label="Message input"
          />
        </div>
        <button
          onClick={() => { onStopTyping(); onSend(); }}
          disabled={!newMessage.trim() || sending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
export default ChatInput;
