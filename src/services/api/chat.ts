import type { AxiosInstance } from 'axios';
import type {
  APIResponse, ChatRoom, ChatMessage, ChatRoomsResponse, MessagesResponse,
  MessageReadReceipt, CreateChatRoomRequest, SendMessageRequest,
  SendFileMessageRequest, EditMessageRequest, MarkReadRequest, TypingIndicatorRequest,
} from '../../types/api';

// Chat Rooms
export function createChatRoom(apiV2: AxiosInstance, data: CreateChatRoomRequest): Promise<APIResponse<ChatRoom>> {
  return apiV2.post('/chat/rooms', data).then(r => r.data);
}

export function getChatRooms(apiV2: AxiosInstance, page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
  return apiV2.get(`/chat/rooms?page=${page}&limit=${limit}`).then(r => r.data);
}

export function getChatRoom(apiV2: AxiosInstance, roomId: string): Promise<APIResponse<ChatRoom>> {
  return apiV2.get(`/chat/rooms/${roomId}`).then(r => r.data);
}

// Messages
export function getRoomMessages(apiV2: AxiosInstance, roomId: string, limit = 50, before?: string, after?: string): Promise<APIResponse<MessagesResponse>> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) params.append('before', before);
  if (after) params.append('after', after);
  return apiV2.get(`/chat/rooms/${roomId}/messages?${params}`).then(r => r.data);
}

export function sendMessage(apiV2: AxiosInstance, data: SendMessageRequest): Promise<APIResponse<ChatMessage>> {
  return apiV2.post('/chat/messages', data).then(r => r.data);
}

export function sendFileMessage(apiV2: AxiosInstance, data: SendFileMessageRequest): Promise<APIResponse<ChatMessage>> {
  const formData = new FormData();
  formData.append('room_id', data.room_id);
  formData.append('file', data.file);
  if (data.reply_to_id) formData.append('reply_to_id', data.reply_to_id);
  return apiV2.post('/chat/messages/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
}

export function editMessage(apiV2: AxiosInstance, messageId: string, data: EditMessageRequest): Promise<APIResponse<ChatMessage>> {
  return apiV2.patch(`/chat/messages/${messageId}`, data).then(r => r.data);
}

export function deleteMessage(apiV2: AxiosInstance, messageId: string): Promise<APIResponse> {
  return apiV2.delete(`/chat/messages/${messageId}`).then(r => r.data);
}

export function markMessagesAsRead(apiV2: AxiosInstance, data: MarkReadRequest): Promise<APIResponse<MessageReadReceipt[]>> {
  return apiV2.post('/chat/messages/read', data).then(r => r.data);
}

export function sendTypingIndicator(apiV2: AxiosInstance, data: TypingIndicatorRequest): Promise<APIResponse> {
  return apiV2.post('/chat/realtime/typing', data).then(r => r.data);
}

// Bengkel Chat
export function getBengkelChatRooms(apiV2: AxiosInstance, bengkelId: string, page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
  return apiV2.get(`/chat/bengkel/rooms?bengkel_id=${bengkelId}&page=${page}&limit=${limit}`).then(r => r.data);
}

export function getBengkelChatRoom(apiV2: AxiosInstance, roomId: string): Promise<APIResponse<ChatRoom>> {
  return apiV2.get(`/chat/bengkel/rooms/${roomId}`).then(r => r.data);
}

export function getBengkelRoomMessages(apiV2: AxiosInstance, roomId: string, limit = 50, before?: string, after?: string): Promise<APIResponse<MessagesResponse>> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) params.append('before', before);
  if (after) params.append('after', after);
  return apiV2.get(`/chat/bengkel/rooms/${roomId}/messages?${params}`).then(r => r.data);
}

// Legacy Chat (v1)
export function getUserAppToken(api: AxiosInstance): Promise<APIResponse<{ token: string }>> {
  return api.get('/chats/appToken').then(r => r.data);
}

export function getUserChatToken(api: AxiosInstance): Promise<APIResponse<{ token: string }>> {
  return api.get('/chats/chatToken').then(r => r.data);
}

export function getMitraAppToken(api: AxiosInstance): Promise<APIResponse<{ token: string }>> {
  return api.get('/chats/appTokenMitra').then(r => r.data);
}

export function getMitraChatToken(api: AxiosInstance): Promise<APIResponse<{ token: string }>> {
  return api.get('/chats/chatTokenMitra').then(r => r.data);
}

export function createUserChatHistory(api: AxiosInstance, data: { message: string; recipient_id: string }): Promise<APIResponse> {
  return api.post('/chats/user/history', data).then(r => r.data);
}

export function createMitraChatHistory(api: AxiosInstance, data: { message: string; recipient_id: string }): Promise<APIResponse> {
  return api.post('/chats/bengkel/history', data).then(r => r.data);
}

export function getUserChatHistory(api: AxiosInstance, page = 1, limit = 50): Promise<APIResponse> {
  return api.get(`/chats/user/history?page=${page}&limit=${limit}`).then(r => r.data);
}

export function getMitraChatHistory(api: AxiosInstance, page = 1, limit = 50): Promise<APIResponse> {
  return api.get(`/chats/bengkel/history?page=${page}&limit=${limit}`).then(r => r.data);
}
