import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChat } from '../hooks/useChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';

const ChatPage: React.FC = () => {
  const {
    rooms, selectedRoom, messages, newMessage, setNewMessage,
    typingUsers, loading, sending, wsConnected,
    messagesEndRef, fileInputRef, messagesContainerRef,
    loadChatRooms, sendMessage, onUserTyping, stopTyping,
    handleRoomSelection, formatTime, formatLastSeen, getOtherParticipant,
    getCurrentUserId,
  } = useChat();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const participant = selectedRoom ? getOtherParticipant(selectedRoom) : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      <ChatSidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        wsConnected={wsConnected}
        onRoomSelect={handleRoomSelection}
        onRefresh={loadChatRooms}
        formatTime={formatTime}
        getOtherParticipant={getOtherParticipant}
      />

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <ChatHeader participant={participant} formatLastSeen={formatLastSeen} />
            <ChatMessages
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={getCurrentUserId()}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
              formatTime={formatTime}
            />
            <ChatInput
              newMessage={newMessage}
              sending={sending}
              fileInputRef={fileInputRef}
              onMessageChange={setNewMessage}
              onSend={sendMessage}
              onTyping={onUserTyping}
              onStopTyping={stopTyping}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
