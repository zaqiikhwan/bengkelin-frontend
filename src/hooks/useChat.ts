import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from './useAuth';
import type { ChatRoom, ChatMessage } from '../types/api';

type MessagesAction =
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'REPLACE_TEMP_MESSAGE'; payload: { tempId: string; realMessage: ChatMessage } }
  | { type: 'REMOVE_TEMP_MESSAGE'; payload: string }
  | { type: 'UPDATE_MESSAGE_READ'; payload: { messageId: string; readAt: string } }
  | { type: 'CONFIRM_MESSAGE'; payload: { tempId: string; realMessage: ChatMessage } }
  | { type: 'CLEAR_MESSAGES' };

const messagesReducer = (state: ChatMessage[], action: MessagesAction): ChatMessage[] => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return action.payload;
    case 'ADD_MESSAGE':
      if (state.some((msg) => msg.id === action.payload.id)) return state;
      return [...state, action.payload];
    case 'REPLACE_TEMP_MESSAGE': {
      const idx = state.findIndex((msg) => msg.id === action.payload.tempId);
      if (idx !== -1) {
        const next = [...state];
        next[idx] = action.payload.realMessage;
        return next;
      }
      return [...state, action.payload.realMessage];
    }
    case 'REMOVE_TEMP_MESSAGE':
      return state.filter((msg) => msg.id !== action.payload);
    case 'UPDATE_MESSAGE_READ':
      return state.map((msg) =>
        msg.id === action.payload.messageId
          ? { ...msg, is_read: true, read_at: action.payload.readAt }
          : msg
      );
    case 'CONFIRM_MESSAGE': {
      const idx = state.findIndex((msg) => msg.id === action.payload.tempId);
      if (idx !== -1) {
        const next = [...state];
        next[idx] = action.payload.realMessage;
        return next;
      }
      return [...state, action.payload.realMessage];
    }
    case 'CLEAR_MESSAGES':
      return [];
    default:
      return state;
  }
};

export function useChat() {
  const { user, mitra, userType } = useAuth();
  const location = useLocation();
  const currentUser = user || mitra;
  const getCurrentUserId = useCallback(() => currentUser?.id || '', [currentUser?.id]);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, dispatchMessages] = useReducer(messagesReducer, []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [, setForceUpdateCounter] = useState(0);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [presenceData, setPresenceData] = useState<Map<string, { isOnline: boolean; lastSeen: string }>>(new Map());

  const selectedRoomRef = useRef<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const roomActivityRef = useRef<Map<string, number>>(new Map());

  useEffect(() => { selectedRoomRef.current = selectedRoom; }, [selectedRoom]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Periodic re-render for activity-based presence
  useEffect(() => {
    const interval = setInterval(() => setForceUpdateCounter((p) => p + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Room Loading ──
  const loadChatRooms = useCallback(async () => {
    try {
      let response;
      if (userType === 'mitras') {
        const profileResponse = await apiService.getMitraProfile();
        const bengkel = profileResponse.data?.bengkel?.[0];
        const bengkelId = bengkel?.bengkel_id || (bengkel as any)?.id;
        if (profileResponse.success && bengkelId) {
          response = await apiService.getBengkelChatRooms(bengkelId, 1, 20);
        } else {
          setRooms([]);
          return;
        }
      } else {
        response = await apiService.getChatRooms(1, 20);
      }
      if (response?.success && response.data) {
        setRooms(response.data.rooms || []);
      } else {
        setRooms([]);
      }
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [userType]);

  // ── Message Loading ──
  const loadLatestMessages = useCallback(async (roomId: string) => {
    try {
      const response = userType === 'mitras'
        ? await apiService.getBengkelRoomMessages(roomId, 50)
        : await apiService.getRoomMessages(roomId, 50);

      if (response.success && response.data) {
        const msgs = response.data.messages || [];
        const sorted = msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        dispatchMessages({ type: 'SET_MESSAGES', payload: sorted });

        const unread = msgs.filter((msg) => !msg.is_read && msg.sender_id !== getCurrentUserId());
        if (unread.length > 0) {
          await apiService.markMessagesAsRead({ message_ids: unread.map((m) => m.id) });
          setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, unread_count: Math.max(0, r.unread_count - unread.length) } : r));
        }
      } else {
        dispatchMessages({ type: 'CLEAR_MESSAGES' });
      }
    } catch {
      dispatchMessages({ type: 'CLEAR_MESSAGES' });
    }
  }, [userType, getCurrentUserId]);

  const loadMessages = useCallback(async (roomId: string) => {
    await loadLatestMessages(roomId);
  }, [loadLatestMessages]);

  // ── WebSocket Setup ──
  useEffect(() => {
    loadChatRooms();

    const initialConnectionState = webSocketService.isConnected();
    setWsConnected(initialConnectionState);

    const newMessageHandler = (message: ChatMessage) => {
      const currentRoom = selectedRoomRef.current;
      if (message.sender_id !== getCurrentUserId()) {
        roomActivityRef.current.set(message.room_id, Date.now());
      }

      setRooms((prev) => {
        const updated = prev.map((room) => {
          if (room.id === message.room_id) {
            const isFromOther = message.sender_id !== getCurrentUserId();
            const isNotCurrent = currentRoom?.id !== message.room_id;
            return {
              ...room,
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: isFromOther && isNotCurrent ? room.unread_count + 1 : room.unread_count,
            };
          }
          return room;
        });
        return [...updated.sort((a, b) => new Date(b.last_message_at || b.updated_at).getTime() - new Date(a.last_message_at || a.updated_at).getTime())];
      });

      if (currentRoom && message.room_id === currentRoom.id) {
        if (message.sender_id === getCurrentUserId()) {
          const tempMsgs = messagesRef.current.filter((m) => m.id.startsWith('temp-'));
          if (tempMsgs.length > 0) {
            dispatchMessages({ type: 'REPLACE_TEMP_MESSAGE', payload: { tempId: tempMsgs[tempMsgs.length - 1].id, realMessage: message } });
          } else {
            dispatchMessages({ type: 'ADD_MESSAGE', payload: message });
          }
        } else {
          dispatchMessages({ type: 'ADD_MESSAGE', payload: message });
          apiService.markMessagesAsRead({ message_ids: [message.id] }).catch(() => {});
        }
      }
    };

    const typingHandler = (data: { room_id: string; user_id: string; user_type?: string; is_typing: boolean; user_name?: string }) => {
      const currentRoom = selectedRoomRef.current;
      if (data.user_id === getCurrentUserId()) return;
      if (data.is_typing) roomActivityRef.current.set(data.room_id, Date.now());

      if (currentRoom && currentRoom.id === data.room_id) {
        let displayName = data.user_name || `User ${data.user_id.substring(0, 8)}`;
        if (userType === 'users' && currentRoom.bengkel) displayName = currentRoom.bengkel.bengkel_name;
        else if (userType === 'mitras' && currentRoom.user) displayName = `${currentRoom.user.first_name} ${currentRoom.user.last_name}`;

        setTypingUsers((prev) => data.is_typing ? (prev.includes(displayName) ? prev : [...prev, displayName]) : prev.filter((n) => n !== displayName));

        if (data.is_typing) {
          setTimeout(() => setTypingUsers((prev) => prev.filter((n) => n !== displayName)), 5000);
        }
      }
    };

    const messageReadHandler = (data: { room_id?: string; message_id?: string; message_ids?: string[]; reader_id: string; read_at?: string }) => {
      const currentRoom = selectedRoomRef.current;
      if (!currentRoom || data.reader_id === getCurrentUserId()) return;
      if (data.room_id && data.room_id !== currentRoom.id) return;
      const readAt = data.read_at || new Date().toISOString();
      const ids = data.message_ids || (data.message_id ? [data.message_id] : []);
      ids.forEach((id) => dispatchMessages({ type: 'UPDATE_MESSAGE_READ', payload: { messageId: id, readAt } }));
      setForceUpdateCounter((p) => p + 1);
    };

    const presenceHandler = (data: { user_id: string; user_type: string; is_online: boolean; user_name?: string; last_seen?: string }) => {
      setPresenceData((prev) => {
        const next = new Map(prev);
        next.set(`${data.user_id}:${data.user_type}`, { isOnline: data.is_online, lastSeen: data.last_seen || new Date().toISOString() });
        return next;
      });
      setForceUpdateCounter((p) => p + 1);
    };

    webSocketService.on('new_message', newMessageHandler);
    webSocketService.on('typing_update', typingHandler);
    webSocketService.on('message_read', messageReadHandler);
    webSocketService.on('presence_update', presenceHandler);
    webSocketService.on('connected', () => setWsConnected(true));
    webSocketService.on('disconnected', () => setWsConnected(false));

    if (!initialConnectionState) webSocketService.connect().catch(() => {});

    return () => {
      webSocketService.off('new_message', newMessageHandler);
      webSocketService.off('typing_update', typingHandler);
      webSocketService.off('message_read', messageReadHandler);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // ── Navigation state ──
  useEffect(() => {
    if (location.state?.selectedRoomId && rooms.length > 0) {
      if (location.state.newRoom) {
        const newRoom = location.state.newRoom as ChatRoom;
        setRooms((prev) => prev.find((r) => r.id === newRoom.id) ? prev : [newRoom, ...prev]);
        setSelectedRoom(newRoom);
        window.history.replaceState({}, document.title);
      } else {
        const target = rooms.find((r) => r.id === location.state.selectedRoomId);
        if (target) {
          setSelectedRoom(target);
          window.history.replaceState({}, document.title);
        } else {
          loadChatRooms();
        }
      }
    }
  }, [location.state, rooms, loadChatRooms]);

  // ── Load messages on room change ──
  useEffect(() => {
    if (!selectedRoom) return;
    loadMessages(selectedRoom.id);
    if (wsConnected) return;
    const poll = setInterval(() => { if (!wsConnected) loadMessages(selectedRoom.id); }, 5000);
    return () => clearInterval(poll);
  }, [selectedRoom, wsConnected, loadMessages]);

  // ── Scroll ──
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const smartScrollToBottom = useCallback((force = false) => {
    if (force) { scrollToBottom(); return; }
    const c = messagesContainerRef.current;
    if (c && c.scrollTop + c.clientHeight >= c.scrollHeight - 100) scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (!loadingMoreMessages) smartScrollToBottom(true);
  }, [messages.length, loadingMoreMessages, smartScrollToBottom]);

  // ── Send Message ──
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;
    setSending(true);
    const content = newMessage.trim();

    try {
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        room_id: selectedRoom.id,
        sender_id: getCurrentUserId(),
        sender_type: userType === 'mitras' ? 'mitra' : 'user',
        content,
        message_type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        is_edited: false,
        sender: {
          id: getCurrentUserId(),
          name: userType === 'mitras' ? mitra?.first_name || 'Mitra' : user ? `${user.first_name} ${user.last_name}` : 'You',
          avatar_url: userType === 'mitras' ? undefined : user?.avatar_url,
          type: userType === 'mitras' ? 'mitra' : 'user',
        },
      };

      dispatchMessages({ type: 'ADD_MESSAGE', payload: tempMessage });
      setNewMessage('');
      setRooms((prev) => prev.map((r) => r.id === selectedRoom.id ? { ...r, last_message: content, last_message_at: new Date().toISOString() } : r));
      setTimeout(() => smartScrollToBottom(true), 50);

      if (wsConnected) {
        try {
          webSocketService.sendMessage(selectedRoom.id, content);
          setTimeout(async () => {
            if (messagesRef.current.some((m) => m.id === tempMessage.id)) {
              dispatchMessages({ type: 'REMOVE_TEMP_MESSAGE', payload: tempMessage.id });
              await loadLatestMessages(selectedRoom.id);
            }
          }, 2000);
        } catch {
          const response = await apiService.sendMessage({ room_id: selectedRoom.id, content, message_type: 'text' });
          if (response.success && response.data) {
            dispatchMessages({ type: 'REPLACE_TEMP_MESSAGE', payload: { tempId: tempMessage.id, realMessage: response.data } });
          }
        }
      } else {
        const response = await apiService.sendMessage({ room_id: selectedRoom.id, content, message_type: 'text' });
        if (response.success && response.data) {
          dispatchMessages({ type: 'REPLACE_TEMP_MESSAGE', payload: { tempId: tempMessage.id, realMessage: response.data } });
        }
      }
    } catch {
      // Failed to send message
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedRoom, sending, getCurrentUserId, userType, mitra, user, wsConnected, smartScrollToBottom, loadLatestMessages]);

  // ── Typing ──
  const sendTypingStatus = useCallback((status: boolean) => {
    if (!selectedRoom) return;
    if (wsConnected) {
      try { webSocketService.sendTypingIndicator({ room_id: selectedRoom.id, is_typing: status }); } catch {
        apiService.sendTypingIndicator({ room_id: selectedRoom.id, is_typing: status }).catch(() => {});
      }
    } else {
      apiService.sendTypingIndicator({ room_id: selectedRoom.id, is_typing: status }).catch(() => {});
    }
  }, [selectedRoom, wsConnected]);

  const onUserTyping = useCallback(() => {
    if (!selectedRoom) return;
    if (!isTyping) { sendTypingStatus(true); setIsTyping(true); }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      sendTypingStatus(false);
      setIsTyping(false);
      typingTimerRef.current = null;
    }, 2000);
  }, [selectedRoom, isTyping, sendTypingStatus]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; }
      sendTypingStatus(false);
      setIsTyping(false);
    }
  }, [isTyping, sendTypingStatus]);

  // ── Room Selection ──
  const handleRoomSelection = useCallback((room: ChatRoom) => {
    stopTyping();
    if (selectedRoom && webSocketService.isConnected()) webSocketService.leaveRoom(selectedRoom.id);
    setSelectedRoom(room);
    dispatchMessages({ type: 'CLEAR_MESSAGES' });
    setLoadingMoreMessages(false);
    setTypingUsers([]);
    if (room.unread_count > 0) setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, unread_count: 0 } : r));
    setForceUpdateCounter((p) => p + 1);

    if (webSocketService.isConnected()) {
      try { webSocketService.joinRoom(room.id); } catch {}
      setTimeout(() => loadMessages(room.id), 500);
    } else {
      loadMessages(room.id);
    }
  }, [selectedRoom, stopTyping, loadMessages]);

  // ── Utilities ──
  const formatTime = useCallback((ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), []);

  const formatLastSeen = useCallback((ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Last seen just now';
    if (mins < 60) return `Last seen ${mins} min${mins === 1 ? '' : 's'} ago`;
    if (hrs < 24) return `Last seen ${hrs} hr${hrs === 1 ? '' : 's'} ago`;
    if (days === 1) return `Last seen yesterday`;
    if (days < 7) return `Last seen ${days} days ago`;
    return `Last seen on ${new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, []);

  const getOtherParticipant = useCallback((room: ChatRoom) => {
    const ACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
    if (userType === 'mitras') {
      if (!room.user) return null;
      const presence = presenceData.get(`${room.user.id}:user`);
      const lastActivity = roomActivityRef.current.get(room.id);
      const isRecentlyActive = !!lastActivity && Date.now() - lastActivity < ACTIVITY_TIMEOUT_MS;
      return {
        name: `${room.user.first_name} ${room.user.last_name}`,
        avatar_url: room.user.avatar_url,
        is_online: presence ? presence.isOnline : isRecentlyActive,
        last_seen: presence?.lastSeen,
      };
    } else {
      if (!room.bengkel) return null;
      let mitraPresence = null;
      for (const [key, value] of presenceData.entries()) {
        if (key.endsWith(':mitra')) { mitraPresence = value; break; }
      }
      const lastActivity = roomActivityRef.current.get(room.id);
      const isRecentlyActive = !!lastActivity && Date.now() - lastActivity < ACTIVITY_TIMEOUT_MS;
      return {
        name: room.bengkel.bengkel_name,
        avatar_url: room.bengkel.avatar_url,
        is_online: mitraPresence ? mitraPresence.isOnline : isRecentlyActive,
        last_seen: mitraPresence?.lastSeen,
      };
    }
  }, [userType, presenceData]);

  return {
    rooms, selectedRoom, messages, newMessage, setNewMessage,
    isTyping, typingUsers, loading, sending, wsConnected,
    loadingMoreMessages, messagesEndRef, fileInputRef, messagesContainerRef,
    loadChatRooms, sendMessage, onUserTyping, stopTyping,
    handleRoomSelection, formatTime, formatLastSeen, getOtherParticipant,
    getCurrentUserId, userType, currentUser,
  };
}
