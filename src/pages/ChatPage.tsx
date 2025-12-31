import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  PhoneIcon,
  VideoCameraIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckIcon, CheckCheckIcon } from 'lucide-react';
import { apiService } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from '../hooks/useAuth';
import type { ChatRoom, ChatMessage, ChatRoomsResponse, MessagesResponse } from '../types/api';

const ChatPage: React.FC = () => {
  const { user, mitra, userType } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatParticipantId, setNewChatParticipantId] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUser = user || mitra;
  const getCurrentUserId = () => currentUser?.id || '';

  useEffect(() => {
    loadChatRooms();
    connectWebSocket();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = async () => {
    try {
      await webSocketService.connect();
      setWsConnected(true);
      
      // Set up event listeners
      webSocketService.on('new_message', handleNewMessage);
      webSocketService.on('typing_update', handleTypingIndicator);
      webSocketService.on('message_read', handleMessageRead);
      webSocketService.on('connected', () => setWsConnected(true));
      webSocketService.on('disconnected', () => setWsConnected(false));
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsConnected(false);
    }
  };

  const loadChatRooms = async () => {
    try {
      const response = userType === 'mitras' 
        ? await apiService.getBengkelChatRooms(currentUser?.id || '', 1, 20)
        : await apiService.getChatRooms(1, 20);
      
      if (response.success && response.data) {
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = userType === 'mitras'
        ? await apiService.getBengkelRoomMessages(roomId, 1, 50)
        : await apiService.getRoomMessages(roomId, 1, 50);
      
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        
        // Mark messages as read
        const unreadMessages = response.data.messages?.filter(msg => 
          !msg.is_read && msg.sender_id !== getCurrentUserId()
        ) || [];
        
        if (unreadMessages.length > 0) {
          await apiService.markMessagesAsRead({
            message_ids: unreadMessages.map(msg => msg.id)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    if (selectedRoom && message.room_id === selectedRoom.id) {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if not from current user
      if (message.sender_id !== getCurrentUserId()) {
        apiService.markMessagesAsRead({
          message_ids: [message.id]
        });
      }
    }
    
    // Update room's last message
    setRooms(prev => prev.map(room => 
      room.id === message.room_id 
        ? { ...room, last_message: message.content, last_message_at: message.created_at }
        : room
    ));
  };

  const handleTypingIndicator = (data: { room_id: string; user_id: string; is_typing: boolean; user_name: string }) => {
    if (selectedRoom && data.room_id === selectedRoom.id && data.user_id !== getCurrentUserId()) {
      setTypingUsers(prev => {
        if (data.is_typing) {
          return prev.includes(data.user_name) ? prev : [...prev, data.user_name];
        } else {
          return prev.filter(name => name !== data.user_name);
        }
      });
    }
  };

  const handleMessageRead = (data: { room_id: string; message_id: string; reader_id: string }) => {
    if (selectedRoom && data.room_id === selectedRoom.id) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id
          ? { ...msg, is_read: true, read_at: new Date().toISOString() }
          : msg
      ));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;
    
    setSending(true);
    try {
      const response = await apiService.sendMessage({
        room_id: selectedRoom.id,
        content: newMessage.trim(),
        message_type: 'text'
      });
      
      if (response.success) {
        setNewMessage('');
        // Message will be added via WebSocket
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const sendFileMessage = async (file: File) => {
    if (!selectedRoom || sending) return;
    
    setSending(true);
    try {
      const response = await apiService.sendFileMessage({
        room_id: selectedRoom.id,
        file
      });
      
      if (response.success) {
        // Message will be added via WebSocket
      }
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!selectedRoom) return;
    
    setIsTyping(true);
    webSocketService.sendTypingIndicator({
      room_id: selectedRoom.id,
      is_typing: true
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      webSocketService.sendTypingIndicator({
        room_id: selectedRoom.id,
        is_typing: false
      });
    }, 3000);
  };

  const createNewChatRoom = async () => {
    if (!newChatParticipantId.trim()) return;
    
    try {
      const response = await apiService.createChatRoom({
        bengkel_id: newChatParticipantId.trim()
      });
      
      if (response.success && response.data) {
        setRooms(prev => [response.data!, ...prev]);
        setSelectedRoom(response.data!);
        setShowNewChatModal(false);
        setNewChatParticipantId('');
        setNewChatMessage('');
        
        // Load messages for the new room
        await loadMessages(response.data!.id);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = (room: ChatRoom) => {
    if (userType === 'mitras') {
      return room.user ? {
        name: `${room.user.first_name} ${room.user.last_name}`,
        avatar_url: room.user.avatar_url,
        is_online: false // This would come from presence data
      } : null;
    } else {
      return room.bengkel ? {
        name: room.bengkel.bengkel_name,
        avatar_url: room.bengkel.avatar_url,
        is_online: false // This would come from presence data
      } : null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="New Chat"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 mb-2" />
              <p>No conversations yet</p>
            </div>
          ) : (
            rooms.map((room) => {
              const otherParticipant = getOtherParticipant(room);
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {otherParticipant?.avatar_url ? (
                      <img
                        src={otherParticipant.avatar_url}
                        alt={otherParticipant.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.name || 'Unknown User'}
                        </p>
                        {room.last_message_at && (
                          <p className="text-xs text-gray-500">
                            {formatTime(room.last_message_at)}
                          </p>
                        )}
                      </div>
                      {room.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.last_message}
                        </p>
                      )}
                    </div>
                    {room.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getOtherParticipant(selectedRoom)?.avatar_url ? (
                    <img
                      src={getOtherParticipant(selectedRoom)!.avatar_url}
                      alt={getOtherParticipant(selectedRoom)!.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {getOtherParticipant(selectedRoom)?.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getOtherParticipant(selectedRoom)?.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === getCurrentUserId();
                const isRead = message.is_read;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.message_type === 'text' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="text-sm">{message.file_name}</span>
                        </div>
                      )}
                      <div className={`flex items-center justify-between mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.created_at)}</span>
                        {isOwn && (
                          <div className="ml-2">
                            {isRead ? (
                              <CheckCheckIcon className="w-3 h-3" />
                            ) : (
                              <CheckIcon className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      sendFileMessage(file);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  disabled={sending}
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">Select a conversation</h3>
              <p className="text-gray-500 mt-2">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bengkel ID
                </label>
                <input
                  type="text"
                  value={newChatParticipantId}
                  onChange={(e) => setNewChatParticipantId(e.target.value)}
                  placeholder="Enter bengkel ID"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Message (Optional)
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type your first message..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={createNewChatRoom}
                disabled={!newChatParticipantId.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;