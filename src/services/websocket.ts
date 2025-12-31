import type { 
  WebSocketMessage, 
  ChatMessage, 
  TypingIndicatorRequest,
  WebSocketConnectionSuccess,
  WebSocketTypingUpdate,
  WebSocketPresenceUpdate
} from '../types/api';

export type WebSocketEventType = 
  | 'success' 
  | 'new_message' 
  | 'typing_update' 
  | 'message_read' 
  | 'presence_update' 
  | 'room_update' 
  | 'error' 
  | 'connected' 
  | 'disconnected';

export interface WebSocketEventHandler {
  (data: any): void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<WebSocketEventType, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000/api/v2/chat/ws';
    this.initializeEventHandlers();
  }

  private initializeEventHandlers() {
    this.eventHandlers.set('success', []);
    this.eventHandlers.set('new_message', []);
    this.eventHandlers.set('typing_update', []);
    this.eventHandlers.set('message_read', []);
    this.eventHandlers.set('presence_update', []);
    this.eventHandlers.set('room_update', []);
    this.eventHandlers.set('error', []);
    this.eventHandlers.set('connected', []);
    this.eventHandlers.set('disconnected', []);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        this.isConnecting = false;
        reject(new Error('No access token available'));
        return;
      }

      try {
        // Add token as query parameter for WebSocket authentication
        const wsUrl = `${this.baseURL}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected', { timestamp: new Date().toISOString() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnected', { 
            code: event.code, 
            reason: event.reason,
            timestamp: new Date().toISOString()
          });
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { 
            error: 'WebSocket connection error',
            timestamp: new Date().toISOString()
          });
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'success':
        this.emit('success', message.data);
        break;
      case 'new_message':
        this.emit('new_message', message.data as ChatMessage);
        break;
      case 'typing_update':
        this.emit('typing_update', message.data as WebSocketTypingUpdate);
        break;
      case 'message_read':
        this.emit('message_read', message.data);
        break;
      case 'presence_update':
        this.emit('presence_update', message.data as WebSocketPresenceUpdate);
        break;
      case 'room_update':
        this.emit('room_update', message.data);
        break;
      case 'error':
        this.emit('error', message);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.connect().catch(error => {
          console.error('Reconnect failed:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  sendMessage(roomId: string, content: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const message: WebSocketMessage = {
      type: 'new_message',
      data: {
        room_id: roomId,
        content: content,
        message_type: 'text'
      },
      timestamp: new Date().toISOString()
    };

    this.ws!.send(JSON.stringify(message));
  }

  sendTypingIndicator(data: TypingIndicatorRequest) {
    if (!this.isConnected()) {
      return; // Silently fail for typing indicators
    }

    const message: WebSocketMessage = {
      type: 'typing_update',
      data: data,
      timestamp: new Date().toISOString()
    };

    this.ws!.send(JSON.stringify(message));
  }

  markAsRead(roomId: string, messageIds: string[]) {
    if (!this.isConnected()) {
      return;
    }

    const message: WebSocketMessage = {
      type: 'message_read',
      data: {
        room_id: roomId,
        message_ids: messageIds
      },
      timestamp: new Date().toISOString()
    };

    this.ws!.send(JSON.stringify(message));
  }

  on(event: WebSocketEventType, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: WebSocketEventType, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(event, handlers);
    }
  }

  private emit(event: WebSocketEventType, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket event handler for ${event}:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;