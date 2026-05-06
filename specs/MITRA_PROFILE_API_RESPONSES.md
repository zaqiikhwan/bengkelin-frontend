# Mitra Profile Management API Response Examples

This document provides example responses for all mitra profile management endpoints in the Bengkelin service.

## Base URL
```
/api/v1/mitras
```

## Authentication
All endpoints require **Mitra JWT Authentication**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1. Get Mitra Profile
**GET** `/api/v1/mitras/profile`
**Auth**: Mitra JWT Required

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "success get mitra profile",
  "errors": null,
  "data": {
    "mitra_id": "mitra-550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Workshop",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567890",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "created_at": "2024-01-10T08:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z",
    "deleted_at": null,
    "bengkel": [
      {
        "bengkel_id": "bengkel-550e8400-e29b-41d4-a716-446655440001",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "081234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-avatar-1642234567.jpg",
        "operasionals": [
          {
            "id": 1,
            "hari": "Senin",
            "jam_buka": "08:00-17:00"
          },
          {
            "id": 2,
            "hari": "Selasa",
            "jam_buka": "08:00-17:00"
          },
          {
            "id": 3,
            "hari": "Sabtu",
            "jam_buka": "09:00-15:00"
          }
        ],
        "photos": [
          {
            "photo_id": 1,
            "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234567.jpg"
          },
          {
            "photo_id": 2,
            "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234568.jpg"
          }
        ],
        "services": [
          {
            "id": 1,
            "nama_service": "Ganti Oli"
          },
          {
            "id": 2,
            "nama_service": "Tune Up"
          },
          {
            "id": 3,
            "nama_service": "Service AC"
          }
        ],
        "addresses": [
          {
            "id": 1,
            "latitude": -6.2088,
            "longitude": 106.8456,
            "address_label": "Bengkel Utama",
            "full_address": "Jl. Sudirman No. 123, Jakarta Pusat",
            "note": "Dekat dengan mall"
          }
        ],
        "created_at": "2024-01-10T09:00:00Z",
        "updated_at": "2024-01-15T16:30:00Z"
      }
    ]
  }
}
```

### Success Response - No Bengkel Yet (200 OK)
```json
{
  "success": true,
  "message": "success get mitra profile",
  "errors": null,
  "data": {
    "mitra_id": "mitra-550e8400-e29b-41d4-a716-446655440002",
    "first_name": "Jane",
    "last_name": "Garage",
    "email": "jane.garage@example.com",
    "phone_number": "081234567891",
    "bank_name": "",
    "bank_number": "",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "deleted_at": null,
    "bengkel": []
  }
}
```

### Error Response - Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errors": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access"
  },
  "data": null
}
```

### Error Response - Mitra Not Found (400 Bad Request)
```json
{
  "success": false,
  "message": "failed to get mitra profile",
  "errors": "mitra not found",
  "data": null
}
```

---

## 2. Update Mitra Profile
**PATCH** `/api/v1/mitras/profile`
**Auth**: Mitra JWT Required

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Body - Full Update
```json
{
  "first_name": "John Updated",
  "last_name": "Workshop Pro",
  "phone_number": "081234567899"
}
```

### Request Body - Partial Update
```json
{
  "first_name": "John Modified"
}
```

### Success Response - Full Update (200 OK)
```json
{
  "success": true,
  "message": "success update mitra profile",
  "errors": null,
  "data": {
    "mitra_id": "mitra-550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John Updated",
    "last_name": "Workshop Pro",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567899",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "created_at": "2024-01-10T08:30:00Z",
    "updated_at": "2024-01-15T18:45:00Z",
    "deleted_at": null,
    "bengkel": [
      {
        "bengkel_id": "bengkel-550e8400-e29b-41d4-a716-446655440001",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "081234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-avatar-1642234567.jpg"
      }
    ]
  }
}
```

### Success Response - Partial Update (200 OK)
```json
{
  "success": true,
  "message": "success update mitra profile",
  "errors": null,
  "data": {
    "mitra_id": "mitra-550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John Modified",
    "last_name": "Workshop",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567890",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "created_at": "2024-01-10T08:30:00Z",
    "updated_at": "2024-01-15T19:15:00Z",
    "deleted_at": null,
    "bengkel": []
  }
}
```

### Success Response - No Changes (200 OK)
```json
{
  "success": true,
  "message": "success update mitra profile",
  "errors": null,
  "data": {
    "mitra_id": "mitra-550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Workshop",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567890",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "created_at": "2024-01-10T08:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z",
    "deleted_at": null,
    "bengkel": []
  }
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "validation failed",
  "errors": "phone_number must be a valid Indonesian phone number",
  "data": null
}
```

### Error Response - Invalid Request Format (400 Bad Request)
```json
{
  "success": false,
  "message": "request doesn't match with validator",
  "errors": "Key: 'MitraUpdateProfileRequest.FirstName' Error:Field validation for 'FirstName' failed on the 'min' tag",
  "data": null
}
```

---

## 3. Create Bank Account
**POST** `/api/v1/mitras/bank`
**Auth**: Mitra JWT Required

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Body
```json
{
  "bank_name": "Bank BCA",
  "bank_number": "1234567890"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "success create bank account",
  "errors": null,
  "data": {
    "bank_name": "Bank BCA",
    "bank_number": "1234567890"
  }
}
```

### Error Response - Bank Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "bank account already exists",
  "errors": "Please update existing bank account instead",
  "data": null
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "validation failed",
  "errors": "bank_name is required; bank_number must be 10-20 digits",
  "data": null
}
```

### Error Response - Invalid Bank Name (400 Bad Request)
```json
{
  "success": false,
  "message": "request doesn't match with validator",
  "errors": "Key: 'MitraBankUpdateRequest.BankName' Error:Field validation for 'BankName' failed on the 'min' tag",
  "data": null
}
```

### Error Response - Invalid Bank Number (400 Bad Request)
```json
{
  "success": false,
  "message": "validation failed",
  "errors": "bank_number must be 10-20 digits",
  "data": null
}
```

### Error Response - Mitra Not Found (400 Bad Request)
```json
{
  "success": false,
  "message": "mitra not found",
  "errors": "record not found",
  "data": null
}
```

---

## 4. Update Bank Account
**PATCH** `/api/v1/mitras/bank`
**Auth**: Mitra JWT Required

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Body
```json
{
  "bank_name": "Bank Mandiri",
  "bank_number": "9876543210"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "success update bank account",
  "errors": null,
  "data": {
    "bank_name": "Bank Mandiri",
    "bank_number": "9876543210"
  }
}
```

### Error Response - Bank Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "bank account not found",
  "errors": "Please create a bank account first",
  "data": null
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "validation failed",
  "errors": "bank_name must contain only letters, numbers, and spaces",
  "data": null
}
```

### Error Response - Invalid Request (400 Bad Request)
```json
{
  "success": false,
  "message": "request doesn't match with validator",
  "errors": "Key: 'MitraBankUpdateRequest.BankNumber' Error:Field validation for 'BankNumber' failed on the 'required' tag",
  "data": null
}
```

---

## Common Error Responses

### 400 Bad Request - Invalid JSON
```json
{
  "success": false,
  "message": "request doesn't match with validator",
  "errors": "invalid character '}' looking for beginning of object key string",
  "data": null
}
```

### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "message": "Unauthorized access",
  "errors": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access"
  },
  "data": null
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "success": false,
  "message": "Invalid token",
  "errors": {
    "code": "TOKEN_INVALID",
    "message": "Invalid token"
  },
  "data": null
}
```

### 401 Unauthorized - Expired Token
```json
{
  "success": false,
  "message": "Token has expired",
  "errors": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired"
  },
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "failed to update mitra profile",
  "errors": "database connection failed",
  "data": null
}
```

---

## Validation Rules

### Profile Update Validation
- **first_name**: 1-50 characters, alphanumeric with spaces, XSS protection
- **last_name**: 1-50 characters, alphanumeric with spaces, XSS protection  
- **phone_number**: Valid Indonesian phone format (+62, 62, or 0 prefix)

### Bank Account Validation
- **bank_name**: 2-50 characters, alphanumeric with spaces, XSS protection
- **bank_number**: 10-20 digits only

### Security Features
- **XSS Protection**: All text inputs sanitized
- **SQL Injection Prevention**: Input validation and parameterized queries
- **Phone Validation**: Indonesian phone number format validation
- **Bank Account Validation**: Numeric validation for account numbers

---

## Usage Examples

### 1. Complete Profile Setup Flow
```bash
# 1. Get current profile
GET /api/v1/mitras/profile
Authorization: Bearer {token}

# 2. Update profile information
PATCH /api/v1/mitras/profile
Authorization: Bearer {token}
{
  "first_name": "John Updated",
  "last_name": "Workshop Pro",
  "phone_number": "081234567899"
}

# 3. Create bank account
POST /api/v1/mitras/bank
Authorization: Bearer {token}
{
  "bank_name": "Bank BCA",
  "bank_number": "1234567890"
}
```

### 2. Bank Account Management Flow
```bash
# 1. Create initial bank account
POST /api/v1/mitras/bank
Authorization: Bearer {token}
{
  "bank_name": "Bank BCA",
  "bank_number": "1234567890"
}

# 2. Update bank account later
PATCH /api/v1/mitras/bank
Authorization: Bearer {token}
{
  "bank_name": "Bank Mandiri",
  "bank_number": "9876543210"
}
```

### 3. Profile Information Update Flow
```bash
# 1. Partial update (only first name)
PATCH /api/v1/mitras/profile
Authorization: Bearer {token}
{
  "first_name": "John Modified"
}

# 2. Phone number update only
PATCH /api/v1/mitras/profile
Authorization: Bearer {token}
{
  "phone_number": "081234567899"
}
```

---

## Response Data Structure

### Mitra Profile Object
```json
{
  "mitra_id": "string",           // UUID of mitra
  "first_name": "string",         // Mitra first name
  "last_name": "string",          // Mitra last name
  "email": "string",              // Email address (read-only)
  "phone_number": "string",       // Indonesian phone number
  "bank_name": "string",          // Bank name (empty if not set)
  "bank_number": "string",        // Bank account number (empty if not set)
  "created_at": "datetime",       // Account creation timestamp
  "updated_at": "datetime",       // Last update timestamp
  "deleted_at": "datetime|null",  // Soft delete timestamp
  "bengkel": []                   // Array of associated bengkels
}
```

### Bengkel Object (in profile)
```json
{
  "bengkel_id": "string",         // UUID of bengkel
  "bengkel_name": "string",       // Bengkel name
  "bengkel_phone": "string",      // Bengkel phone
  "jumlah_montir": "number",      // Number of mechanics
  "home_service": "boolean",      // Home service availability
  "store_service": "boolean",     // Store service availability
  "is_open": "boolean",           // Current open status
  "avatar_url": "string",         // Bengkel avatar URL
  "operasionals": [],             // Operating hours
  "photos": [],                   // Bengkel photos
  "services": [],                 // Available services
  "addresses": []                 // Bengkel addresses
}
```

### Bank Account Object
```json
{
  "bank_name": "string",          // Bank name (e.g., "Bank BCA")
  "bank_number": "string"         // Bank account number (10-20 digits)
}
```

---

## HTTP Status Codes

- **200 OK**: Successful GET/PATCH operations
- **201 Created**: Successful POST operations (bank creation)
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required or invalid token
- **404 Not Found**: Bank account not found (for updates)
- **409 Conflict**: Bank account already exists (for creation)
- **500 Internal Server Error**: Server-side errors