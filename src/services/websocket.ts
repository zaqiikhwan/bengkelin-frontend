import type { 
  WebSocketMessage, 
  ChatMessage, 
  TypingIndicatorRequest,
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
  | 'disconnected'
  | 'debug';

export interface WebSocketEventHandler {
  (data: any): void;
}

export interface WebSocketDebugInfo {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'connection' | 'message' | 'auth' | 'reconnect' | 'general';
  message: string;
  data?: any;
}

export interface ConnectionDiagnostics {
  url: string;
  readyState: string;
  isConnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  userType: string;
  hasToken: boolean;
  lastError?: string;
  connectionHistory: Array<{
    timestamp: string;
    event: 'connect_attempt' | 'connected' | 'disconnected' | 'error';
    details?: any;
  }>;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<WebSocketEventType, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private baseURL: string;
  private debugMode = true; // Enable debug mode by default
  private connectionHistory: Array<{
    timestamp: string;
    event: 'connect_attempt' | 'connected' | 'disconnected' | 'error';
    details?: any;
  }> = [];
  private lastError?: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000/api/v2/chat/ws';
    this.debug('connection', 'WebSocket service initialized', { baseURL: this.baseURL });
    this.initializeEventHandlers();
  }

  private debug(category: WebSocketDebugInfo['category'], message: string, data?: any, level: WebSocketDebugInfo['level'] = 'debug') {
    if (!this.debugMode && level === 'debug') {
      return; // Skip debug messages when debug mode is disabled
    }

    const debugInfo: WebSocketDebugInfo = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    // Always log to console for debugging
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logMethod(`[WebSocket ${category.toUpperCase()}] ${message}`, data || '');

    // Emit debug event for UI components to listen
    this.emit('debug', debugInfo);
  }

  private addToHistory(event: 'connect_attempt' | 'connected' | 'disconnected' | 'error', details?: any) {
    this.connectionHistory.push({
      timestamp: new Date().toISOString(),
      event,
      details
    });

    // Keep only last 20 entries
    if (this.connectionHistory.length > 20) {
      this.connectionHistory = this.connectionHistory.slice(-20);
    }
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
    this.eventHandlers.set('debug', []);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.debug('connection', 'Already connected, skipping connection attempt');
        resolve();
        return;
      }

      if (this.isConnecting) {
        this.debug('connection', 'Connection already in progress', null, 'warn');
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      const token = localStorage.getItem('access_token');
      const storedUserType = localStorage.getItem('user_type') || 'users';
      
      // Convert plural user types to singular for v2 API
      const userType = storedUserType === 'users' ? 'user' : storedUserType === 'mitras' ? 'mitra' : 'user';
      
      this.debug('auth', 'Authentication check', {
        hasToken: !!token,
        storedUserType,
        convertedUserType: userType,
        tokenLength: token ? token.length : 0
      });

      if (!token) {
        this.isConnecting = false;
        this.lastError = 'No access token available';
        this.debug('auth', 'No access token available', null, 'error');
        this.addToHistory('error', { error: 'No access token' });
        reject(new Error('No access token available'));
        return;
      }

      try {
        // Add token and user_type as query parameters for WebSocket authentication
        const wsUrl = `${this.baseURL}?token=${encodeURIComponent(token)}&user_type=${userType}`;
        
        this.debug('connection', 'Attempting WebSocket connection', {
          url: this.baseURL,
          userType,
          fullUrl: wsUrl.replace(token, '[REDACTED]'), // Hide token in logs
          attempt: this.reconnectAttempts + 1
        });

        this.addToHistory('connect_attempt', { 
          url: this.baseURL, 
          userType, 
          attempt: this.reconnectAttempts + 1 
        });

        // Test if WebSocket is supported
        if (typeof WebSocket === 'undefined') {
          throw new Error('WebSocket is not supported in this environment');
        }

        this.ws = new WebSocket(wsUrl);

        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.debug('connection', 'Connection timeout after 10 seconds', null, 'error');
            this.ws?.close();
            this.lastError = 'Connection timeout';
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.debug('connection', 'WebSocket connection established successfully', {
            readyState: this.ws?.readyState,
            url: this.baseURL
          }, 'info');
          
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.lastError = undefined;
          this.addToHistory('connected', { url: this.baseURL });
          
          this.emit('connected', { timestamp: new Date().toISOString() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.debug('message', 'Raw WebSocket message received', {
            dataLength: event.data?.length,
            dataType: typeof event.data
          });

          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.debug('message', 'Parsed WebSocket message', {
              type: message.type,
              hasData: !!message.data,
              timestamp: message.timestamp
            });
            this.handleMessage(message);
          } catch (error) {
            this.debug('message', 'Failed to parse WebSocket message', {
              error: error instanceof Error ? error.message : 'Unknown error',
              rawData: event.data
            }, 'error');
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.debug('connection', 'WebSocket connection closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            readyState: this.ws?.readyState
          }, event.code === 1000 ? 'info' : 'warn');

          this.isConnecting = false;
          this.addToHistory('disconnected', { 
            code: event.code, 
            reason: event.reason,
            wasClean: event.wasClean
          });

          this.emit('disconnected', { 
            code: event.code, 
            reason: event.reason,
            timestamp: new Date().toISOString()
          });
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.debug('reconnect', `Scheduling reconnect attempt ${this.reconnectAttempts + 1}`, {
              code: event.code,
              maxAttempts: this.maxReconnectAttempts
            });
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.debug('reconnect', 'Max reconnect attempts reached', {
              attempts: this.reconnectAttempts,
              maxAttempts: this.maxReconnectAttempts
            }, 'error');
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          this.lastError = 'WebSocket connection error';
          this.debug('connection', 'WebSocket error occurred', {
            error: error,
            readyState: this.ws?.readyState,
            url: this.baseURL
          }, 'error');

          this.isConnecting = false;
          this.addToHistory('error', { error: 'WebSocket connection error' });
          
          this.emit('error', { 
            error: 'WebSocket connection error',
            timestamp: new Date().toISOString()
          });
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        this.lastError = error instanceof Error ? error.message : 'Unknown connection error';
        this.debug('connection', 'Exception during connection setup', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'error');
        this.addToHistory('error', { error: this.lastError });
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    this.debug('message', 'Processing WebSocket message', {
      type: message.type,
      timestamp: message.timestamp,
      dataKeys: message.data ? Object.keys(message.data) : []
    });
    
    switch (message.type) {
      case 'success':
        this.debug('message', 'Success message received', message.data, 'info');
        this.emit('success', message.data);
        break;
      case 'new_message':
        this.debug('message', 'New chat message received', {
          messageId: (message.data as ChatMessage)?.id,
          roomId: (message.data as ChatMessage)?.room_id,
          content: (message.data as ChatMessage)?.content?.substring(0, 50) + '...'
        }, 'info');
        this.emit('new_message', message.data as ChatMessage);
        break;
      case 'typing_update':
        this.debug('message', 'Typing update received', message.data);
        this.emit('typing_update', message.data as WebSocketTypingUpdate);
        break;
      case 'message_read':
        this.debug('message', 'Message read update received', message.data, 'info');
        this.emit('message_read', message.data);
        break;
      case 'presence_update':
        this.debug('message', 'Presence update received', message.data, 'info');
        this.emit('presence_update', message.data as WebSocketPresenceUpdate);
        break;
      case 'room_update':
        this.debug('message', 'Room update received', message.data, 'info');
        this.emit('room_update', message.data);
        break;
      case 'error':
        this.debug('message', 'Error message received', {
          error: message.data,
          fullMessage: message
        }, 'error');
        this.emit('error', message);
        break;
      default:
        this.debug('message', 'Unknown message type received', {
          type: message.type,
          data: message.data
        }, 'warn');
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    this.debug('reconnect', `Scheduling reconnect attempt ${this.reconnectAttempts}`, {
      delay,
      maxAttempts: this.maxReconnectAttempts
    });
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.debug('reconnect', `Executing reconnect attempt ${this.reconnectAttempts}`);
        this.connect().catch(error => {
          this.debug('reconnect', 'Reconnect attempt failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            attempt: this.reconnectAttempts
          }, 'error');
        });
      }
    }, delay);
  }

  disconnect() {
    this.debug('connection', 'Initiating disconnect');
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.debug('connection', 'Disconnect completed');
  }

  sendMessage(roomId: string, content: string) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot send message - WebSocket not connected', {
        roomId,
        contentLength: content.length
      }, 'error');
      throw new Error('WebSocket not connected');
    }

    const message: WebSocketMessage = {
      type: 'send_message', // Changed from 'new_message' to match server API
      data: {
        room_id: roomId,
        content: content,
        message_type: 'text'
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Sending message', {
      roomId,
      contentLength: content.length,
      messageType: 'text'
    });

    this.ws!.send(JSON.stringify(message));
  }

  sendTypingIndicator(data: TypingIndicatorRequest) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot send typing indicator - WebSocket not connected', data, 'warn');
      return; // Silently fail for typing indicators
    }

    // Use the correct format from server API documentation
    const message: WebSocketMessage = {
      type: 'typing', // Server expects 'typing'
      data: {
        room_id: data.room_id,
        is_typing: data.is_typing
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Sending typing indicator', {
      messageType: message.type,
      messageData: data,
      fullMessage: message
    });
    
    console.log('Full typing indicator message being sent:', JSON.stringify(message, null, 2));
    this.ws!.send(JSON.stringify(message));
  }

  getMessages(roomId: string, limit = 50, before?: string, after?: string) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot get messages - WebSocket not connected', {
        roomId,
        limit,
        before,
        after
      }, 'warn');
      return;
    }

    const message: WebSocketMessage = {
      type: 'get_messages',
      data: {
        room_id: roomId,
        limit,
        ...(before && { before }),
        ...(after && { after })
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Getting messages via WebSocket', {
      roomId,
      limit,
      before,
      after
    });

    this.ws!.send(JSON.stringify(message));
  }

  markAsRead(roomId: string, messageIds: string[]) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot mark messages as read - WebSocket not connected', {
        roomId,
        messageCount: messageIds.length
      }, 'warn');
      return;
    }

    const message: WebSocketMessage = {
      type: 'mark_read', // Changed from 'message_read' to match server API
      data: {
        message_ids: messageIds // Server expects message_ids array directly
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Marking messages as read', {
      roomId,
      messageCount: messageIds.length
    });

    this.ws!.send(JSON.stringify(message));
  }

  joinRoom(roomId: string) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot join room - WebSocket not connected', { roomId }, 'warn');
      return;
    }

    const message: WebSocketMessage = {
      type: 'join_room',
      data: {
        room_id: roomId
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Joining room', { roomId });
    this.ws!.send(JSON.stringify(message));
  }

  leaveRoom(roomId: string) {
    if (!this.isConnected()) {
      this.debug('message', 'Cannot leave room - WebSocket not connected', { roomId }, 'warn');
      return;
    }

    const message: WebSocketMessage = {
      type: 'leave_room',
      data: {
        room_id: roomId
      },
      timestamp: new Date().toISOString()
    };

    this.debug('message', 'Leaving room', { roomId });
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

  // Diagnostic methods for debugging
  getDiagnostics(): ConnectionDiagnostics {
    const token = localStorage.getItem('access_token');
    const storedUserType = localStorage.getItem('user_type') || 'users';
    const userType = storedUserType === 'users' ? 'user' : storedUserType === 'mitras' ? 'mitra' : 'user';

    return {
      url: this.baseURL,
      readyState: this.getConnectionState(),
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      userType,
      hasToken: !!token,
      lastError: this.lastError,
      connectionHistory: [...this.connectionHistory]
    };
  }

  // Test WebSocket connectivity
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
    diagnostics: ConnectionDiagnostics;
    networkTest?: {
      canReachHost: boolean;
      error?: string;
    };
  }> {
    const diagnostics = this.getDiagnostics();
    
    try {
      // Test basic network connectivity to the host
      const url = new URL(this.baseURL);
      const httpUrl = `http://${url.host}/health`; // Assume there's a health endpoint
      
      let networkTest;
      try {
        const response = await fetch(httpUrl, { 
          method: 'GET',
          timeout: 5000 
        } as any);
        networkTest = {
          canReachHost: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        };
      } catch (error) {
        networkTest = {
          canReachHost: false,
          error: error instanceof Error ? error.message : 'Network error'
        };
      }

      // Try to connect to WebSocket
      await this.connect();
      
      return {
        success: true,
        diagnostics,
        networkTest
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        diagnostics,
        networkTest: undefined
      };
    }
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    this.debug('general', `Debug mode ${enabled ? 'enabled' : 'disabled'}`, null, 'info');
  }

  // Get debug logs (if you want to store them)
  getDebugLogs(): WebSocketDebugInfo[] {
    // This would require storing debug logs in memory
    // For now, just return connection history as debug info
    return this.connectionHistory.map(entry => ({
      timestamp: entry.timestamp,
      level: entry.event === 'error' ? 'error' : 'info',
      category: 'connection',
      message: `Connection ${entry.event}`,
      data: entry.details
    }));
  }

  // Force reconnect (useful for testing)
  forceReconnect() {
    this.debug('connection', 'Force reconnect requested');
    this.disconnect();
    setTimeout(() => {
      this.connect().catch(error => {
        this.debug('connection', 'Force reconnect failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'error');
      });
    }, 1000);
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;