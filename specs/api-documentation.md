# Bengkelin Service API Documentation

## Overview
This document provides comprehensive API documentation for all non-deprecated endpoints in the Bengkelin Service. The API supports both users and mitras (workshop partners) with authentication, real-time chat, workshop management, and service ordering capabilities.

## Base Information
- **Base URL**: `https://api.bengkelin.com`
- **API Versions**: v1, v2
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Rate Limiting**: Enabled with tiered limits

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "failed",
  "message": "Error description",
  "data": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": "Additional error details"
  }
}
```

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

---

# API Endpoints

## Health Check Endpoints

### GET /health
Get application health status and dependencies.

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Health check completed",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0",
    "environment": "production",
    "uptime": "1h30m45s",
    "checks": {
      "database": {
        "status": "healthy",
        "message": "Connection successful",
        "duration": "5ms",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      "redis": {
        "status": "healthy",
        "message": "Connection successful",
        "duration": "2ms",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    }
  }
}
```
**Response Failed (503)**:
```json
{
  "status": "failed",
  "message": "Service unavailable",
  "data": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "One or more dependencies are unhealthy"
  }
}
```

### GET /ready
Readiness check for load balancers.

### GET /live
Liveness check for container orchestration.

---

## Authentication Endpoints (V1)

### POST /api/v1/users/auth/login
User login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation Rules**:
- `email`: Required, valid email format, XSS protection
- `password`: Required, 8-128 characters, XSS protection

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone_number": "+6281234567890",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

**Response Failed (401)**:
```json
{
  "status": "failed",
  "message": "Invalid credentials",
  "data": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

### POST /api/v1/users/auth/register
Register a new user account.

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone_number": "+6281234567890",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Validation Rules**:
- `first_name`: Required, 1-50 characters, alphanumeric with spaces, XSS protection
- `last_name`: Required, 1-50 characters, alphanumeric with spaces, XSS protection
- `email`: Required, valid email format, XSS protection
- `phone_number`: Required, valid phone number format
- `password`: Required, 8-128 characters, strong password, XSS protection
- `confirm_password`: Required, must match password

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone_number": "+6281234567890"
    }
  }
}
```
### POST /api/v1/users/auth/google
Google OAuth authentication for users.

**Request Body**:
```json
{
  "email": "user@example.com",
  "first_name": "John"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Google authentication successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user-uuid",
      "first_name": "John",
      "email": "user@example.com"
    }
  }
}
```

### POST /api/v1/users/auth/refresh
Refresh access token using refresh token.

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

### POST /api/v1/users/auth/logout
Logout user from current device.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Logout successful",
  "data": null
}
```

### POST /api/v1/users/auth/logout-all
Logout user from all devices.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Logged out from all devices",
  "data": null
}
```

---

## Mitra Authentication Endpoints (V1)

### POST /api/v1/mitras/auth/login
Mitra login with email and password.

**Request Body**:
```json
{
  "email": "mitra@example.com",
  "password": "securePassword123"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "mitra@example.com",
      "phone_number": "+6281234567890",
      "bank_name": "BCA",
      "bank_number": "1234567890"
    }
  }
}
```
### POST /api/v1/mitras/auth/register
Register a new mitra account.

**Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "mitra@example.com",
  "phone_number": "+6281234567890",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Mitra registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "mitra@example.com",
      "phone_number": "+6281234567890"
    }
  }
}
```

### POST /api/v1/mitras/auth/google
Google OAuth authentication for mitras.

### POST /api/v1/mitras/auth/refresh
Refresh mitra access token.

### POST /api/v1/mitras/auth/logout
Logout mitra from current device.

### POST /api/v1/mitras/auth/logout-all
Logout mitra from all devices.

---

## User Management Endpoints (V1)

### GET /api/v1/users/profile
Get user profile information.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success get profile",
  "data": {
    "user_id": "user-uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "phone_number": "+6281234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "addresses": [
      {
        "id": "address-uuid",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address_label": "Home",
        "full_address": "Jl. Sudirman No. 1, Jakarta",
        "note": "Near the mall",
        "is_primary": true
      }
    ],
    "vehicles": [
      {
        "id": "vehicle-uuid",
        "brand": "Toyota",
        "model": "Avanza",
        "year": 2020,
        "license_plate": "B 1234 ABC",
        "color": "White"
      }
    ]
  }
}
```

### PUT /api/v1/users/profile
Update user profile information.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "first_name": "John Updated",
  "last_name": "Doe Updated",
  "phone_number": "+6281234567891"
}
```

**Validation Rules**:
- `first_name`: Optional, 1-50 characters, alphanumeric with spaces, XSS protection
- `last_name`: Optional, 1-50 characters, alphanumeric with spaces, XSS protection
- `phone_number`: Optional, valid phone number format

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user_id": "user-uuid",
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "email": "user@example.com",
    "phone_number": "+6281234567891",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```
### POST /api/v1/users/address
Create a new user address.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "address_label": "Home",
  "full_address": "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
  "note": "Near the shopping mall",
  "is_primary": true
}
```

**Validation Rules**:
- `latitude`: Required, valid latitude (-90 to 90)
- `longitude`: Required, valid longitude (-180 to 180)
- `address_label`: Required, 1-100 characters, XSS and SQL injection protection
- `full_address`: Required, 1-500 characters, XSS and SQL injection protection
- `note`: Optional, max 200 characters, XSS and SQL injection protection
- `is_primary`: Optional, boolean

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Address created successfully",
  "data": {
    "id": "address-uuid",
    "user_id": "user-uuid",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_label": "Home",
    "full_address": "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
    "note": "Near the shopping mall",
    "is_primary": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/v1/users/address/:id
Update user address.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "address_label": "Office",
  "full_address": "Jl. Thamrin No. 5, Jakarta Pusat, DKI Jakarta",
  "note": "Building A, Floor 10",
  "is_primary": false
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Address updated successfully",
  "data": {
    "id": "address-uuid",
    "user_id": "user-uuid",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_label": "Office",
    "full_address": "Jl. Thamrin No. 5, Jakarta Pusat, DKI Jakarta",
    "note": "Building A, Floor 10",
    "is_primary": false,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/users/address/:id
Get user address details.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Address retrieved successfully",
  "data": {
    "id": "address-uuid",
    "user_id": "user-uuid",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_label": "Home",
    "full_address": "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
    "note": "Near the shopping mall",
    "is_primary": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/v1/users/address/:id
Delete user address.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Address deleted successfully",
  "data": null
}
```
### POST /api/v1/users/vehicle
Create a new user vehicle.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "brand": "Toyota",
  "model": "Avanza",
  "year": 2020,
  "license_plate": "B 1234 ABC",
  "color": "White",
  "engine_type": "Gasoline"
}
```

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Vehicle created successfully",
  "data": {
    "id": "vehicle-uuid",
    "user_id": "user-uuid",
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2020,
    "license_plate": "B 1234 ABC",
    "color": "White",
    "engine_type": "Gasoline",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/users/vehicles
Get all user vehicles.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": "vehicle-uuid",
      "user_id": "user-uuid",
      "brand": "Toyota",
      "model": "Avanza",
      "year": 2020,
      "license_plate": "B 1234 ABC",
      "color": "White",
      "engine_type": "Gasoline",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/v1/users/vehicle/:id
Get vehicle details.

### DELETE /api/v1/users/vehicle/:id
Delete user vehicle.

### PUT /api/v1/users/avatar
Update user avatar.

**Headers**: `Authorization: Bearer <token>`

**Request**: Multipart form data with image file

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Avatar updated successfully",
  "data": {
    "avatar_url": "https://example.com/avatars/user-uuid.jpg"
  }
}
```

---

## Mitra Management Endpoints (V1)

### GET /api/v1/mitras/profile
Get mitra profile information.

**Headers**: `Authorization: Bearer <mitra-token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success get mitra profile",
  "data": {
    "mitra_id": "mitra-uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "mitra@example.com",
    "phone_number": "+6281234567890",
    "bank_name": "BCA",
    "bank_number": "1234567890",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/v1/mitras/profile
Update mitra profile information.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "first_name": "Jane Updated",
  "last_name": "Smith Updated",
  "phone_number": "+6281234567891"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success update mitra profile",
  "data": {
    "mitra_id": "mitra-uuid",
    "first_name": "Jane Updated",
    "last_name": "Smith Updated",
    "email": "mitra@example.com",
    "phone_number": "+6281234567891",
    "bank_name": "BCA",
    "bank_number": "1234567890"
  }
}
```
### POST /api/v1/mitras/bank
Create mitra bank account.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "bank_name": "BCA",
  "bank_number": "1234567890"
}
```

**Validation Rules**:
- `bank_name`: Required, 2-50 characters, alphanumeric with spaces, XSS protection
- `bank_number`: Required, valid bank account format

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "success create bank account",
  "data": {
    "bank_name": "BCA",
    "bank_number": "1234567890"
  }
}
```

**Response Failed (409)**:
```json
{
  "status": "failed",
  "message": "bank account already exists",
  "data": "Please update existing bank account instead"
}
```

### PUT /api/v1/mitras/bank
Update mitra bank account.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "bank_name": "Mandiri",
  "bank_number": "0987654321"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success update bank account",
  "data": {
    "bank_name": "Mandiri",
    "bank_number": "0987654321"
  }
}
```

**Response Failed (404)**:
```json
{
  "status": "failed",
  "message": "bank account not found",
  "data": "Please create a bank account first"
}
```

---

## Bengkel Management Endpoints (V1)

### POST /api/v1/bengkels/new
Create a new bengkel (workshop).

**Headers**: `Authorization: Bearer <mitra-token>`

### POST /api/v1/bengkels/new
Create a new bengkel (workshop).

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body (New Format - Recommended)**:
```json
{
  "bengkel_name": "Bengkel Jaya Motor",
  "bengkel_phone": "+6281234567890",
  "jumlah_montir": 5,
  "operasionals": [
    {
      "hari": "Senin",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "hari": "Selasa",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "hari": "Rabu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "hari": "Kamis",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "hari": "Jumat",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "hari": "Sabtu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": false
    },
    {
      "hari": "Minggu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": false
    }
  ]
}
```

**Request Body (Legacy Format - Still Supported)**:
```json
{
  "bengkel_name": "Bengkel Jaya Motor",
  "bengkel_phone": "+6281234567890",
  "jumlah_montir": 5,
  "hari": ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
  "jam_buka": ["08:00", "08:00", "08:00", "08:00", "08:00", "08:00", "08:00"]
}
```

**Validation Rules**:
- `bengkel_name`: Required, 2-100 characters, XSS and SQL injection protection
- `bengkel_phone`: Required, valid phone number format
- `jumlah_montir`: Required, 1-50 mechanics

**New Format Rules**:
- `operasionals`: Required array, 1-7 operational items
- `hari`: Required, valid Indonesian day name
- `jam_buka`: Required, opening time in HH:MM format
- `jam_tutup`: Required, closing time in HH:MM format
- `is_active`: Optional boolean pointer, can be `true`, `false`, or `null` (defaults to `true` for new records)

**Legacy Format Rules**:
- `hari`: Required, 1-7 day names, valid Indonesian day names
- `jam_buka`: Required, 1-7 opening hours, arrays must have same length

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success create bengkel",
  "data": null
}
```

### PATCH /api/v1/bengkels/profile
Update bengkel information.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "bengkel_name": "Bengkel Jaya Motor Updated",
  "bengkel_phone": "+6281234567891",
  "jumlah_montir": 7
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkel updated successfully",
  "data": {
    "bengkel_id": "bengkel-uuid",
    "bengkel_name": "Bengkel Jaya Motor Updated",
    "bengkel_phone": "+6281234567891",
    "jumlah_montir": 7
  }
}
```

### PATCH /api/v1/bengkels/montir
Update number of mechanics.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "jumlah_montir": 8
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Mechanic count updated successfully",
  "data": {
    "jumlah_montir": 8
  }
}
```
### PATCH /api/v1/bengkels/operasional
Update bengkel operational hours.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "operasionals": [
    {
      "id": 1,
      "hari": "Senin",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "id": 2,
      "hari": "Selasa",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "id": 3,
      "hari": "Rabu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": null
    },
    {
      "id": 4,
      "hari": "Kamis",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "id": 5,
      "hari": "Jumat",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": true
    },
    {
      "id": 0,
      "hari": "Sabtu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": false
    },
    {
      "id": 0,
      "hari": "Minggu",
      "jam_buka": "08:00",
      "jam_tutup": "17:00",
      "is_active": false
    }
  ]
}
```

**Validation Rules**:
- `operasionals`: Required array, 1-7 operational items
- `id`: Operational record ID (0 for new records, existing ID for updates)
- `hari`: Required, valid Indonesian day name
- `jam_buka`: Required, opening time in HH:MM format
- `jam_tutup`: Required, closing time in HH:MM format
- `is_active`: Optional boolean pointer, can be `true`, `false`, or `null`
  - `true`: Day is operational
  - `false`: Day is not operational
  - `null` or omitted: Uses default value (true for new records, unchanged for updates)

**Valid Day Names**: "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"

**Behavior**:
- If `id` is 0 or not provided: Creates a new operational record
- If `id` is provided and > 0: Updates existing operational record
- `is_active` allows flexible control over which days are operational

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "success update bengkel operasional",
  "data": null
}
```

**Response Failed (400)**:
```json
{
  "status": "failed",
  "message": "failed to bind json",
  "data": {
    "errors": "Field validation for 'Operasionals' failed on the 'required' tag"
  }
}
```

### POST /api/v1/bengkels/address
Create bengkel address.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "address_label": "Main Workshop",
  "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur",
  "note": "Near the gas station"
}
```

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Bengkel address created successfully",
  "data": {
    "id": "address-uuid",
    "bengkel_id": "bengkel-uuid",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_label": "Main Workshop",
    "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur",
    "note": "Near the gas station"
  }
}
```

### POST /api/v1/bengkels/service
Create bengkel services.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "nama_service": [
    "Oil Change",
    "Brake Service",
    "Engine Repair",
    "Tire Replacement"
  ]
}
```

**Validation Rules**:
- `nama_service`: Required, 1-20 services, each 1-100 characters, alphanumeric with spaces, XSS protection

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Services created successfully",
  "data": [
    {
      "id": "service-uuid-1",
      "bengkel_id": "bengkel-uuid",
      "nama_service": "Oil Change"
    },
    {
      "id": "service-uuid-2",
      "bengkel_id": "bengkel-uuid",
      "nama_service": "Brake Service"
    }
  ]
}
```

### POST /api/v1/bengkels/photo
Upload bengkel photos.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request**: Multipart form data with image files

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Photos uploaded successfully",
  "data": [
    {
      "id": "photo-uuid-1",
      "bengkel_id": "bengkel-uuid",
      "photo_url": "https://example.com/bengkels/photo1.jpg"
    },
    {
      "id": "photo-uuid-2",
      "bengkel_id": "bengkel-uuid",
      "photo_url": "https://example.com/bengkels/photo2.jpg"
    }
  ]
}
```

### PATCH /api/v1/bengkels/service/opsi
Update bengkel service options.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "home_service": true,
  "store_service": true,
  "is_open": true
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Service options updated successfully",
  "data": {
    "home_service": true,
    "store_service": true,
    "is_open": true
  }
}
```
### GET /api/v1/bengkels/profile
Get bengkel information for authenticated mitra.

**Headers**: `Authorization: Bearer <mitra-token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkel retrieved successfully",
  "data": {
    "bengkel_id": "bengkel-uuid",
    "mitra_id": "mitra-uuid",
    "bengkel_name": "Bengkel Jaya Motor",
    "bengkel_phone": "+6281234567890",
    "jumlah_montir": 5,
    "home_service": true,
    "store_service": true,
    "is_open": true,
    "avatar_url": "https://example.com/bengkels/avatar.jpg",
    "operasionals": [
      {
        "bengkel_id": "bengkel-uuid",
        "hari": "Senin",
        "jam_buka": "08:00"
      }
    ],
    "photos": [
      {
        "id": "photo-uuid",
        "photo_url": "https://example.com/bengkels/photo1.jpg"
      }
    ],
    "services": [
      {
        "id": "service-uuid",
        "nama_service": "Oil Change"
      }
    ],
    "addresses": [
      {
        "id": "address-uuid",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address_label": "Main Workshop",
        "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur"
      }
    ]
  }
}
```

### GET /api/v1/bengkels/all
Get all bengkels (public endpoint).

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkels retrieved successfully",
  "data": {
    "bengkels": [
      {
        "bengkel_id": "bengkel-uuid",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "+6281234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "https://example.com/bengkels/avatar.jpg",
        "addresses": [
          {
            "latitude": -6.2088,
            "longitude": 106.8456,
            "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

### GET /api/v1/bengkels/search
Search bengkels with filters.

**Query Parameters**:
- `q`: Search query
- `latitude`: User latitude
- `longitude`: User longitude
- `radius`: Search radius in km
- `page`: Page number
- `limit`: Items per page

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Search results retrieved successfully",
  "data": {
    "bengkels": [
      {
        "bengkel_id": "bengkel-uuid",
        "bengkel_name": "Bengkel Jaya Motor",
        "distance": 2.5,
        "rating": 4.5,
        "is_open": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

### GET /api/v1/bengkels/nearest
Get nearest bengkels based on location.

**Query Parameters**:
- `latitude`: Required, user latitude
- `longitude`: Required, user longitude
- `radius`: Search radius in km (default: 10)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Nearest bengkels retrieved successfully",
  "data": {
    "bengkels": [
      {
        "bengkel_id": "bengkel-uuid",
        "bengkel_name": "Bengkel Jaya Motor",
        "distance": 1.2,
        "rating": 4.5,
        "is_open": true,
        "addresses": [
          {
            "latitude": -6.2088,
            "longitude": 106.8456,
            "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "total_pages": 1
    }
  }
}
```
### GET /api/v1/bengkels/:id
Get bengkel details by ID.

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkel details retrieved successfully",
  "data": {
    "bengkel_id": "bengkel-uuid",
    "bengkel_name": "Bengkel Jaya Motor",
    "bengkel_phone": "+6281234567890",
    "jumlah_montir": 5,
    "home_service": true,
    "store_service": true,
    "is_open": true,
    "avatar_url": "https://example.com/bengkels/avatar.jpg",
    "rating": 4.5,
    "total_reviews": 25,
    "operasionals": [
      {
        "hari": "Senin",
        "jam_buka": "08:00"
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/bengkels/photo1.jpg"
      }
    ],
    "services": [
      {
        "nama_service": "Oil Change"
      }
    ],
    "addresses": [
      {
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address_label": "Main Workshop",
        "full_address": "Jl. Raya Bekasi No. 123, Jakarta Timur"
      }
    ],
    "testimonials": [
      {
        "id": "testimonial-uuid",
        "user_name": "John Doe",
        "rating": 5,
        "testimoni": "Excellent service!",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /api/v1/bengkels/:id/testimonial
Create testimonial for bengkel.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "testimoni": "Great service, very professional and quick repair!",
  "rating": 5
}
```

**Validation Rules**:
- `testimoni`: Required, 10-1000 characters, XSS and SQL injection protection
- `rating`: Required, 1-5 rating scale

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Testimonial created successfully",
  "data": {
    "id": "testimonial-uuid",
    "user_id": "user-uuid",
    "bengkel_id": "bengkel-uuid",
    "rating": 5,
    "testimoni": "Great service, very professional and quick repair!",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/v1/bengkels/avatar
Update bengkel avatar.

**Headers**: `Authorization: Bearer <mitra-token>`

**Request**: Multipart form data with image file

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Avatar updated successfully",
  "data": {
    "avatar_url": "https://example.com/bengkels/bengkel-uuid.jpg"
  }
}
```

### GET /api/v1/bengkels/:id/operational/:day
Get bengkel operational hours for specific day.

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Operational hours retrieved successfully",
  "data": {
    "bengkel_id": "bengkel-uuid",
    "hari": "Senin",
    "jam_buka": "08:00",
    "is_open": true
  }
}
```

---

## Order Service Endpoints (V1)

### POST /api/v1/orders
Create a new service order.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "bengkel_id": "bengkel-uuid",
  "vehicle_id": "vehicle-uuid",
  "address_id": "address-uuid",
  "service_type": "home_service",
  "services": ["Oil Change", "Brake Service"],
  "description": "Need oil change and brake inspection",
  "scheduled_date": "2024-01-15",
  "scheduled_time": "10:00"
}
```

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order_id": "order-uuid",
    "user_id": "user-uuid",
    "bengkel_id": "bengkel-uuid",
    "vehicle_id": "vehicle-uuid",
    "address_id": "address-uuid",
    "service_type": "home_service",
    "services": ["Oil Change", "Brake Service"],
    "description": "Need oil change and brake inspection",
    "status": "pending",
    "scheduled_date": "2024-01-15",
    "scheduled_time": "10:00",
    "admin_fee": 5000,
    "total_amount": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
### GET /api/v1/orders/:id
Get order details by ID.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Order retrieved successfully",
  "data": {
    "order_id": "order-uuid",
    "user_id": "user-uuid",
    "bengkel_id": "bengkel-uuid",
    "vehicle_id": "vehicle-uuid",
    "address_id": "address-uuid",
    "service_type": "home_service",
    "services": ["Oil Change", "Brake Service"],
    "description": "Need oil change and brake inspection",
    "status": "in_progress",
    "scheduled_date": "2024-01-15",
    "scheduled_time": "10:00",
    "admin_fee": 5000,
    "service_fee": 150000,
    "total_amount": 155000,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z",
    "bengkel": {
      "bengkel_name": "Bengkel Jaya Motor",
      "bengkel_phone": "+6281234567890"
    },
    "vehicle": {
      "brand": "Toyota",
      "model": "Avanza",
      "license_plate": "B 1234 ABC"
    },
    "address": {
      "full_address": "Jl. Sudirman No. 1, Jakarta",
      "latitude": -6.2088,
      "longitude": 106.8456
    }
  }
}
```

### PATCH /api/v1/orders/:id
Update order details (Mitra only).

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "service_fee": 150000,
  "estimated_completion": "2024-01-15T14:00:00Z",
  "notes": "Parts need to be ordered"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Order updated successfully",
  "data": {
    "order_id": "order-uuid",
    "service_fee": 150000,
    "total_amount": 155000,
    "estimated_completion": "2024-01-15T14:00:00Z",
    "notes": "Parts need to be ordered",
    "updated_at": "2024-01-01T02:00:00Z"
  }
}
```

### PATCH /api/v1/orders/:id/status
Update order status (Mitra only).

**Headers**: `Authorization: Bearer <mitra-token>`

**Request Body**:
```json
{
  "status": "completed",
  "completion_notes": "Service completed successfully"
}
```

**Validation Rules**:
- `status`: Required, one of: "pending", "confirmed", "in_progress", "completed", "cancelled"

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Order status updated successfully",
  "data": {
    "order_id": "order-uuid",
    "status": "completed",
    "completion_notes": "Service completed successfully",
    "completed_at": "2024-01-15T14:00:00Z"
  }
}
```

### GET /api/v1/orders
Get user orders with pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "order_id": "order-uuid",
        "bengkel_name": "Bengkel Jaya Motor",
        "service_type": "home_service",
        "status": "completed",
        "scheduled_date": "2024-01-15",
        "total_amount": 155000,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

### GET /api/v1/bengkels/orders
Get bengkel orders (Mitra only).

**Headers**: `Authorization: Bearer <mitra-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkel orders retrieved successfully",
  "data": {
    "orders": [
      {
        "order_id": "order-uuid",
        "user_name": "John Doe",
        "service_type": "home_service",
        "status": "pending",
        "scheduled_date": "2024-01-15",
        "services": ["Oil Change", "Brake Service"],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```
---

## Chat V2 Endpoints (Real-time Chat)

### WebSocket Connection
Connect to real-time chat via WebSocket.

**Endpoint**: `wss://api.bengkelin.com/api/v2/chat/ws`

**Authentication**: JWT token via query parameter or header
- Query: `?token=<jwt-token>`
- Header: `Authorization: Bearer <jwt-token>`

**Connection Response**:
```json
{
  "type": "success",
  "success": true,
  "message": "Connected successfully",
  "data": {
    "user_id": "user-uuid",
    "user_type": "user",
    "socket_id": "socket-uuid"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### WebSocket Message Types

#### Join Room
```json
{
  "type": "join_room",
  "room_id": "room-uuid",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Send Message
```json
{
  "type": "send_message",
  "room_id": "room-uuid",
  "data": {
    "message_type": "text",
    "content": "Hello, I need help with my car",
    "reply_to_id": null
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "room_id": "room-uuid",
  "data": {
    "is_typing": true
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Mark Messages as Read
```json
{
  "type": "mark_read",
  "room_id": "room-uuid",
  "data": {
    "message_ids": ["message-uuid-1", "message-uuid-2"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### POST /api/v2/chat/rooms
Create or get existing chat room.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "bengkel_id": "bengkel-uuid"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Chat room created or retrieved successfully",
  "data": {
    "id": "room-uuid",
    "user_id": "user-uuid",
    "bengkel_id": "bengkel-uuid",
    "room_name": "user-uuid_bengkel-uuid",
    "is_active": true,
    "last_message": "Hello, I need help with my car",
    "last_message_at": "2024-01-01T00:00:00Z",
    "unread_count": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "bengkel": {
      "id": "bengkel-uuid",
      "bengkel_name": "Bengkel Jaya Motor",
      "avatar_url": "https://example.com/bengkel-avatar.jpg"
    }
  }
}
```

### GET /api/v2/chat/rooms
Get user chat rooms with pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Chat rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "room-uuid",
        "user_id": "user-uuid",
        "bengkel_id": "bengkel-uuid",
        "room_name": "user-uuid_bengkel-uuid",
        "is_active": true,
        "last_message": "Thank you for your help!",
        "last_message_at": "2024-01-01T00:00:00Z",
        "unread_count": 2,
        "created_at": "2024-01-01T00:00:00Z",
        "bengkel": {
          "id": "bengkel-uuid",
          "bengkel_name": "Bengkel Jaya Motor",
          "avatar_url": "https://example.com/bengkel-avatar.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```
### GET /api/v2/chat/bengkel/rooms
Get bengkel chat rooms (Mitra only).

**Headers**: `Authorization: Bearer <mitra-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Bengkel chat rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "room-uuid",
        "user_id": "user-uuid",
        "bengkel_id": "bengkel-uuid",
        "room_name": "user-uuid_bengkel-uuid",
        "is_active": true,
        "last_message": "When can you come to fix my car?",
        "last_message_at": "2024-01-01T00:00:00Z",
        "unread_count": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user-uuid",
          "first_name": "John",
          "last_name": "Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "total_pages": 1
    }
  }
}
```

### GET /api/v2/chat/rooms/:roomId
Get chat room details.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Chat room retrieved successfully",
  "data": {
    "id": "room-uuid",
    "user_id": "user-uuid",
    "bengkel_id": "bengkel-uuid",
    "room_name": "user-uuid_bengkel-uuid",
    "is_active": true,
    "last_message": "Thank you for your help!",
    "last_message_at": "2024-01-01T00:00:00Z",
    "unread_count": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "bengkel": {
      "id": "bengkel-uuid",
      "bengkel_name": "Bengkel Jaya Motor",
      "avatar_url": "https://example.com/bengkel-avatar.jpg"
    }
  }
}
```

### GET /api/v2/chat/rooms/:roomId/messages
Get chat room messages with pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `before`: Message ID to get messages before (for infinite scroll)

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "room_id": "room-uuid",
        "sender_id": "user-uuid",
        "sender_type": "user",
        "message_type": "text",
        "content": "Hello, I need help with my car",
        "file_url": null,
        "file_name": null,
        "file_size": null,
        "is_read": true,
        "read_at": "2024-01-01T00:05:00Z",
        "is_edited": false,
        "edited_at": null,
        "reply_to_id": null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "sender": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg",
          "type": "user"
        },
        "reply_to": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "total_pages": 1
    }
  }
}
```

### POST /api/v2/chat/messages
Send a new message.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "room_id": "room-uuid",
  "message_type": "text",
  "content": "Hello, I need help with my car",
  "reply_to_id": null
}
```

**Validation Rules**:
- `room_id`: Required, valid UUID
- `message_type`: Required, one of: "text", "image", "file"
- `content`: Required, message content
- `reply_to_id`: Optional, valid UUID for reply

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "id": "message-uuid",
    "room_id": "room-uuid",
    "sender_id": "user-uuid",
    "sender_type": "user",
    "message_type": "text",
    "content": "Hello, I need help with my car",
    "is_read": false,
    "is_edited": false,
    "reply_to_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "sender": {
      "id": "user-uuid",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "type": "user"
    }
  }
}
```
### POST /api/v2/chat/messages/file
Send a file message.

**Headers**: `Authorization: Bearer <token>`

**Request**: Multipart form data
- `room_id`: Room UUID
- `file`: File to upload
- `reply_to_id`: Optional, message UUID to reply to

**Response Success (201)**:
```json
{
  "status": "success",
  "message": "File message sent successfully",
  "data": {
    "id": "message-uuid",
    "room_id": "room-uuid",
    "sender_id": "user-uuid",
    "sender_type": "user",
    "message_type": "file",
    "content": "Sent a file",
    "file_url": "https://example.com/files/document.pdf",
    "file_name": "document.pdf",
    "file_size": 1024000,
    "is_read": false,
    "is_edited": false,
    "reply_to_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "sender": {
      "id": "user-uuid",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "type": "user"
    }
  }
}
```

### PUT /api/v2/chat/messages/:messageId
Edit a message.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "content": "Hello, I need urgent help with my car"
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Message updated successfully",
  "data": {
    "id": "message-uuid",
    "room_id": "room-uuid",
    "sender_id": "user-uuid",
    "sender_type": "user",
    "message_type": "text",
    "content": "Hello, I need urgent help with my car",
    "is_read": true,
    "is_edited": true,
    "edited_at": "2024-01-01T00:05:00Z",
    "reply_to_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:05:00Z"
  }
}
```

### DELETE /api/v2/chat/messages/:messageId
Delete a message.

**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Message deleted successfully",
  "data": null
}
```

### POST /api/v2/chat/messages/read
Mark messages as read.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "message_ids": ["message-uuid-1", "message-uuid-2", "message-uuid-3"]
}
```

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Messages marked as read",
  "data": {
    "read_count": 3,
    "read_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Metrics Endpoints

### GET /metrics
Prometheus metrics endpoint.

**Response**: Prometheus format metrics

### GET /metrics/app
Application-specific metrics.

**Response Success (200)**:
```json
{
  "status": "success",
  "message": "Application metrics retrieved",
  "data": {
    "uptime": "1h30m45s",
    "requests_total": 1250,
    "requests_per_second": 12.5,
    "active_connections": 45,
    "memory_usage": {
      "allocated": "25MB",
      "system": "50MB",
      "gc_cycles": 15
    },
    "database": {
      "connections_active": 8,
      "connections_idle": 2,
      "queries_total": 5420
    },
    "redis": {
      "connections_active": 3,
      "commands_processed": 2150
    }
  }
}
```

---

## Error Codes Reference

### Authentication Errors
- `INVALID_CREDENTIALS` - Email or password is incorrect
- `UNAUTHORIZED` - Missing or invalid JWT token
- `TOKEN_EXPIRED` - JWT token has expired
- `REFRESH_TOKEN_INVALID` - Refresh token is invalid or expired

### Validation Errors
- `VALIDATION_FAILED` - Request validation failed
- `INVALID_EMAIL` - Email format is invalid
- `WEAK_PASSWORD` - Password doesn't meet strength requirements
- `PHONE_INVALID` - Phone number format is invalid

### Resource Errors
- `USER_NOT_FOUND` - User does not exist
- `BENGKEL_NOT_FOUND` - Bengkel does not exist
- `ORDER_NOT_FOUND` - Order does not exist
- `ROOM_NOT_FOUND` - Chat room does not exist
- `MESSAGE_NOT_FOUND` - Message does not exist

### Business Logic Errors
- `BANK_ACCOUNT_EXISTS` - Bank account already exists
- `BANK_ACCOUNT_NOT_FOUND` - Bank account not found
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `ORDER_ALREADY_COMPLETED` - Order is already completed
- `BENGKEL_NOT_AVAILABLE` - Bengkel is not available for service

### System Errors
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service is temporarily unavailable
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_UPLOAD_FAILED` - File upload failed
- `DATABASE_ERROR` - Database operation failed

---

## Rate Limiting

The API implements tiered rate limiting:

### General Endpoints
- **Rate**: 100 requests per second
- **Burst**: 200 requests
- **Applies to**: Most API endpoints

### Authentication Endpoints
- **Rate**: 10 requests per second
- **Burst**: 20 requests
- **Applies to**: Login, register, refresh token

### Strict Endpoints
- **Rate**: 5 requests per second
- **Burst**: 10 requests
- **Applies to**: Login and register only

### Chat V2 Endpoints
- **Rate**: 200 requests per second
- **Burst**: 400 requests
- **Applies to**: Real-time chat endpoints

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events Reference

### Client to Server Events
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_read` - Mark messages as read
- `get_messages` - Get room messages

### Server to Client Events
- `new_message` - New message received
- `message_read` - Message read status update
- `typing_update` - Typing indicator update
- `presence_update` - User online/offline status
- `room_update` - Room information update
- `error` - Error occurred
- `success` - Operation successful

---

This documentation covers all non-deprecated API endpoints in the Bengkelin Service. For additional support or questions, please contact the development team.