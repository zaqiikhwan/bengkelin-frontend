# Chat V2 API - Complete Response Documentation

This document provides comprehensive response examples for all Chat V2 API endpoints in the Bengkelin service.

## Table of Contents

1. [Standard Response Format](#standard-response-format)
2. [Authentication](#authentication)
3. [Chat Room Endpoints](#chat-room-endpoints)
4. [Message Endpoints](#message-endpoints)
5. [Real-time Features](#real-time-features)
6. [WebSocket Responses](#websocket-responses)
7. [Error Handling](#error-handling)
8. [HTTP Status Codes](#http-status-codes)

## Standard Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": "string",
  "errors": "string|object|null",
  "data": "object|array|null"
}
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

## Chat Room Endpoints

### 1. Create or Get Chat Room

**Endpoint:** `POST /api/v2/chat/rooms`

**Request Body:**
```json
{
  "bengkel_id": "789e0123-e45b-67c8-d901-234567890123"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Chat room created or retrieved successfully",
  "errors": null,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "bengkel_id": "789e0123-e45b-67c8-d901-234567890123",
    "room_name": "chat_123e4567-e89b-12d3-a456-426614174000_789e0123-e45b-67c8-d901-234567890123",
    "is_active": true,
    "last_message": "Hello, I need help with my car",
    "last_message_at": "2024-01-15T10:30:00Z",
    "unread_count": 0,
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "bengkel": {
      "id": "789e0123-e45b-67c8-d901-234567890123",
      "bengkel_name": "Honda Service Center",
      "avatar_url": "https://example.com/avatars/bengkel1.jpg"
    }
  }
}
```

#### Error Responses
```json
// 400 - Bad Request
{
  "success": false,
  "message": "Invalid request body",
  "errors": "Key: 'CreateChatRoomRequest.BengkelID' Error:Field validation for 'BengkelID' failed on the 'required' tag",
  "data": null
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Unauthorized",
  "errors": "User ID not found",
  "data": null
}

// 500 - Internal Server Error
{
  "success": false,
  "message": "Failed to create or get chat room",
  "errors": "database connection failed",
  "data": null
}
```

### 2. Get User Chat Rooms

**Endpoint:** `GET /api/v2/chat/rooms?page=1&limit=20`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Chat rooms retrieved successfully",
  "errors": null,
  "data": {
    "rooms": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "bengkel_id": "789e0123-e45b-67c8-d901-234567890123",
        "room_name": "chat_123e4567-e89b-12d3-a456-426614174000_789e0123-e45b-67c8-d901-234567890123",
        "is_active": true,
        "last_message": "Thank you for your help!",
        "last_message_at": "2024-01-15T14:30:00Z",
        "unread_count": 2,
        "created_at": "2024-01-15T09:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z",
        "bengkel": {
          "id": "789e0123-e45b-67c8-d901-234567890123",
          "bengkel_name": "Honda Service Center",
          "avatar_url": "https://example.com/avatars/bengkel1.jpg"
        }
      },
      {
        "id": "660f9511-f3ac-52e5-b827-557766551111",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "bengkel_id": "890f1234-f56c-78d9-e012-345678901234",
        "room_name": "chat_123e4567-e89b-12d3-a456-426614174000_890f1234-f56c-78d9-e012-345678901234",
        "is_active": true,
        "last_message": "When can I bring my car?",
        "last_message_at": "2024-01-14T16:45:00Z",
        "unread_count": 0,
        "created_at": "2024-01-14T15:00:00Z",
        "updated_at": "2024-01-14T16:45:00Z",
        "bengkel": {
          "id": "890f1234-f56c-78d9-e012-345678901234",
          "bengkel_name": "Toyota Auto Repair",
          "avatar_url": "https://example.com/avatars/bengkel2.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

### 3. Get Bengkel Chat Rooms

**Endpoint:** `GET /api/v2/chat/bengkel/rooms?bengkel_id=789e0123-e45b-67c8-d901-234567890123&page=1&limit=20`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Chat rooms retrieved successfully",
  "errors": null,
  "data": {
    "rooms": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "bengkel_id": "789e0123-e45b-67c8-d901-234567890123",
        "room_name": "chat_123e4567-e89b-12d3-a456-426614174000_789e0123-e45b-67c8-d901-234567890123",
        "is_active": true,
        "last_message": "Thank you for your help!",
        "last_message_at": "2024-01-15T14:30:00Z",
        "unread_count": 1,
        "created_at": "2024-01-15T09:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z",
        "user": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "first_name": "John",
          "last_name": "Doe",
          "avatar_url": "https://example.com/avatars/user1.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

### 4. Get Chat Room by ID

**Endpoint:** `GET /api/v2/chat/rooms/{roomId}`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Chat room retrieved successfully",
  "errors": null,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "bengkel_id": "789e0123-e45b-67c8-d901-234567890123",
    "room_name": "chat_123e4567-e89b-12d3-a456-426614174000_789e0123-e45b-67c8-d901-234567890123",
    "is_active": true,
    "last_message": "Thank you for your help!",
    "last_message_at": "2024-01-15T14:30:00Z",
    "unread_count": 0,
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    "bengkel": {
      "id": "789e0123-e45b-67c8-d901-234567890123",
      "bengkel_name": "Honda Service Center",
      "avatar_url": "https://example.com/avatars/bengkel1.jpg"
    }
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Failed to get chat room",
  "errors": "chat room not found",
  "data": null
}
```

## Message Endpoints

### 5. Send Message

**Endpoint:** `POST /api/v2/chat/messages`

**Request Body:**
```json
{
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_type": "text",
  "content": "Hello, I need help with my car maintenance",
  "reply_to_id": null
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Message sent successfully",
  "errors": null,
  "data": {
    "id": "770g0622-g4bd-63f6-c938-668877662222",
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "123e4567-e89b-12d3-a456-426614174000",
    "sender_type": "user",
    "message_type": "text",
    "content": "Hello, I need help with my car maintenance",
    "file_url": null,
    "file_name": null,
    "file_size": null,
    "is_read": false,
    "read_at": null,
    "is_edited": false,
    "edited_at": null,
    "reply_to_id": null,
    "created_at": "2024-01-15T15:30:00Z",
    "updated_at": "2024-01-15T15:30:00Z",
    "sender": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatars/user1.jpg",
      "type": "user"
    },
    "reply_to": null
  }
}
```

#### Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": "Key: 'SendMessageRequest.Content' Error:Field validation for 'Content' failed on the 'required' tag",
  "data": null
}
```

### 6. Send File Message

**Endpoint:** `POST /api/v2/chat/messages/file`

**Request:** Multipart form data with:
- `room_id`: "550e8400-e29b-41d4-a716-446655440000"
- `file`: [binary file data]
- `reply_to_id`: (optional)

#### Success Response (201)
```json
{
  "success": true,
  "message": "File message sent successfully",
  "errors": null,
  "data": {
    "id": "880h1733-h5ce-74g7-d049-779988773333",
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "123e4567-e89b-12d3-a456-426614174000",
    "sender_type": "user",
    "message_type": "file",
    "content": "car_problem.jpg",
    "file_url": "https://example.com/files/car_problem.jpg",
    "file_name": "car_problem.jpg",
    "file_size": 2048576,
    "is_read": false,
    "read_at": null,
    "is_edited": false,
    "edited_at": null,
    "reply_to_id": null,
    "created_at": "2024-01-15T15:35:00Z",
    "updated_at": "2024-01-15T15:35:00Z",
    "sender": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatars/user1.jpg",
      "type": "user"
    },
    "reply_to": null
  }
}
```

### 7. Get Room Messages

**Endpoint:** `GET /api/v2/chat/rooms/{roomId}/messages?page=1&limit=50&before=messageId`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "errors": null,
  "data": {
    "messages": [
      {
        "id": "880h1733-h5ce-74g7-d049-779988773333",
        "room_id": "550e8400-e29b-41d4-a716-446655440000",
        "sender_id": "123e4567-e89b-12d3-a456-426614174000",
        "sender_type": "user",
        "message_type": "file",
        "content": "car_problem.jpg",
        "file_url": "https://example.com/files/car_problem.jpg",
        "file_name": "car_problem.jpg",
        "file_size": 2048576,
        "is_read": true,
        "read_at": "2024-01-15T15:40:00Z",
        "is_edited": false,
        "edited_at": null,
        "reply_to_id": null,
        "created_at": "2024-01-15T15:35:00Z",
        "updated_at": "2024-01-15T15:40:00Z",
        "sender": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatars/user1.jpg",
          "type": "user"
        },
        "reply_to": null
      },
      {
        "id": "770g0622-g4bd-63f6-c938-668877662222",
        "room_id": "550e8400-e29b-41d4-a716-446655440000",
        "sender_id": "123e4567-e89b-12d3-a456-426614174000",
        "sender_type": "user",
        "message_type": "text",
        "content": "Hello, I need help with my car maintenance",
        "file_url": null,
        "file_name": null,
        "file_size": null,
        "is_read": true,
        "read_at": "2024-01-15T15:32:00Z",
        "is_edited": false,
        "edited_at": null,
        "reply_to_id": null,
        "created_at": "2024-01-15T15:30:00Z",
        "updated_at": "2024-01-15T15:32:00Z",
        "sender": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatars/user1.jpg",
          "type": "user"
        },
        "reply_to": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

### 8. Edit Message

**Endpoint:** `PATCH /api/v2/chat/messages/{messageId}`

**Request Body:**
```json
{
  "content": "Hello, I need help with my car maintenance and oil change"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Message edited successfully",
  "errors": null,
  "data": {
    "id": "770g0622-g4bd-63f6-c938-668877662222",
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "123e4567-e89b-12d3-a456-426614174000",
    "sender_type": "user",
    "message_type": "text",
    "content": "Hello, I need help with my car maintenance and oil change",
    "file_url": null,
    "file_name": null,
    "file_size": null,
    "is_read": true,
    "read_at": "2024-01-15T15:32:00Z",
    "is_edited": true,
    "edited_at": "2024-01-15T15:45:00Z",
    "reply_to_id": null,
    "created_at": "2024-01-15T15:30:00Z",
    "updated_at": "2024-01-15T15:45:00Z",
    "sender": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatars/user1.jpg",
      "type": "user"
    },
    "reply_to": null
  }
}
```

#### Error Response (403)
```json
{
  "success": false,
  "message": "Failed to edit message",
  "errors": "you can only edit your own messages",
  "data": null
}
```

### 9. Delete Message

**Endpoint:** `DELETE /api/v2/chat/messages/{messageId}`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "errors": null,
  "data": null
}
```

#### Error Response (403)
```json
{
  "success": false,
  "message": "Failed to delete message",
  "errors": "you can only delete your own messages",
  "data": null
}
```

## Real-time Features

### 10. Mark Messages as Read

**Endpoint:** `POST /api/v2/chat/messages/read`

**Request Body:**
```json
{
  "message_ids": [
    "770g0622-g4bd-63f6-c938-668877662222",
    "880h1733-h5ce-74g7-d049-779988773333"
  ]
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Messages marked as read successfully",
  "errors": null,
  "data": [
    {
      "room_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_id": "770g0622-g4bd-63f6-c938-668877662222",
      "reader_id": "789e0123-e45b-67c8-d901-234567890123",
      "reader_type": "mitra",
      "read_at": "2024-01-15T16:00:00Z"
    },
    {
      "room_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_id": "880h1733-h5ce-74g7-d049-779988773333",
      "reader_id": "789e0123-e45b-67c8-d901-234567890123",
      "reader_type": "mitra",
      "read_at": "2024-01-15T16:00:00Z"
    }
  ]
}
```

### 11. Send Typing Indicator

**Endpoint:** `POST /api/v2/chat/typing`

**Request Body:**
```json
{
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_typing": true
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Typing indicator sent successfully",
  "errors": null,
  "data": null
}
```

#### Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": "Key: 'TypingIndicatorRequest.RoomID' Error:Field validation for 'RoomID' failed on the 'required' tag",
  "data": null
}
```

## WebSocket Responses

### Connection Success
```json
{
  "type": "success",
  "success": true,
  "message": "Connected successfully",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_type": "user",
    "socket_id": "socket_123e4567_user_1642248000",
    "connected_at": "2024-01-15T16:00:00Z"
  },
  "timestamp": "2024-01-15T16:00:00Z"
}
```

### New Message Notification
```json
{
  "type": "new_message",
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "id": "990i2844-i6df-85h8-e150-880099884444",
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "789e0123-e45b-67c8-d901-234567890123",
    "sender_type": "mitra",
    "message_type": "text",
    "content": "Hi! I can help you with your car maintenance. What specific issue are you having?",
    "file_url": null,
    "file_name": null,
    "file_size": null,
    "is_read": false,
    "read_at": null,
    "is_edited": false,
    "edited_at": null,
    "reply_to_id": null,
    "created_at": "2024-01-15T16:05:00Z",
    "updated_at": "2024-01-15T16:05:00Z",
    "sender": {
      "id": "789e0123-e45b-67c8-d901-234567890123",
      "name": "Honda Service Center",
      "avatar_url": "https://example.com/avatars/bengkel1.jpg",
      "type": "mitra"
    }
  },
  "timestamp": "2024-01-15T16:05:00Z"
}
```

### Typing Indicator
```json
{
  "type": "typing_update",
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "789e0123-e45b-67c8-d901-234567890123",
    "user_type": "mitra",
    "user_name": "Honda Service Center",
    "is_typing": true,
    "timestamp": "2024-01-15T16:04:30Z"
  },
  "timestamp": "2024-01-15T16:04:30Z"
}
```

### Message Read Notification
```json
{
  "type": "message_read",
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "room_id": "550e8400-e29b-41d4-a716-446655440000",
    "message_id": "770g0622-g4bd-63f6-c938-668877662222",
    "reader_id": "789e0123-e45b-67c8-d901-234567890123",
    "reader_type": "mitra",
    "read_at": "2024-01-15T16:06:00Z"
  },
  "timestamp": "2024-01-15T16:06:00Z"
}
```

### Presence Update
```json
{
  "type": "presence_update",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_type": "user",
    "user_name": "John Doe",
    "is_online": true,
    "last_seen": "2024-01-15T16:10:00Z"
  },
  "timestamp": "2024-01-15T16:10:00Z"
}
```

### Room Update
```json
{
  "type": "room_update",
  "room_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "last_message": "Thank you for your help!",
    "last_message_at": "2024-01-15T16:15:00Z",
    "unread_count": 1,
    "updated_at": "2024-01-15T16:15:00Z"
  },
  "timestamp": "2024-01-15T16:15:00Z"
}
```

### WebSocket Error Response
```json
{
  "type": "error",
  "success": false,
  "message": "Failed to send message",
  "error": "Room not found or access denied",
  "timestamp": "2024-01-15T16:07:00Z"
}
```

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": "Key: 'SendMessageRequest.Content' Error:Field validation for 'Content' failed on the 'required' tag",
  "data": null
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": "User ID not found",
  "data": null
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "message": "Failed to edit message",
  "errors": "you can only edit your own messages",
  "data": null
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Failed to get chat room",
  "errors": "chat room not found",
  "data": null
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to send message",
  "errors": "database connection failed",
  "data": null
}
```

## HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PATCH, DELETE operations |
| 201 | Created | Successful POST operations (message creation) |
| 400 | Bad Request | Invalid request body, validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Access denied (e.g., editing someone else's message) |
| 404 | Not Found | Resource not found (room, message, etc.) |
| 500 | Internal Server Error | Server-side errors |

## WebSocket Message Types

### Incoming Message Types (Client → Server)
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a new message
- `typing` - Send typing indicator
- `mark_read` - Mark messages as read
- `get_messages` - Get room messages

### Outgoing Message Types (Server → Client)
- `new_message` - New message received
- `message_read` - Message read notification
- `typing_update` - Typing indicator update
- `presence_update` - User online/offline status
- `room_update` - Room information update
- `error` - Error notification
- `success` - Success confirmation

## Rate Limiting

All endpoints are subject to rate limiting:
- General endpoints: 100 requests per minute
- Message sending: 30 messages per minute
- File uploads: 10 files per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248060
```

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination response format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## File Upload Constraints

File uploads have the following constraints:
- Maximum file size: 10MB
- Supported formats: jpg, jpeg, png, gif, pdf, doc, docx
- Files are uploaded to cloud storage (Cloudinary/S3)
- File URLs are returned in the response

## Security Considerations

- All endpoints require JWT authentication
- File uploads are scanned for malware
- Message content is sanitized to prevent XSS
- Rate limiting prevents spam and abuse
- WebSocket connections are authenticated
- CORS is configured for allowed origins

---

*This documentation is automatically generated and kept up-to-date with the latest API changes.*