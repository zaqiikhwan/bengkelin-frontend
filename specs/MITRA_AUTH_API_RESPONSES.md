# Mitra Authentication API Response Examples

This document provides example responses for all mitra authentication endpoints in the Bengkelin service.

## Base URL
```
/api/v1/mitras/auth
```

## Rate Limiting
- **General Auth Rate Limit**: Applied to all auth endpoints
- **Strict Rate Limit**: Applied to login and register endpoints for additional security
- **Rate Limit Headers**: Included in responses when rate limiting is enabled

---

## 1. Mitra Login
**POST** `/api/v1/mitras/auth/login`
**Rate Limit**: Strict (5 requests per minute)

### Request Body
```json
{
  "email": "john.bengkel@example.com",
  "password": "SecurePass123!"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "errors": null,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDIyMzgxNjcsInR5cGUiOiJtaXRyYSJ9.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-123-456",
      "first_name": "John",
      "last_name": "Workshop",
      "email": "john.bengkel@example.com",
      "phone_number": "081234567890",
      "bank_name": "Bank BCA",
      "bank_number": "1234567890"
    }
  }
}
```

### Error Response - Mitra Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Mitra not found",
  "errors": {
    "code": "MITRA_NOT_FOUND",
    "message": "Mitra not found",
    "details": "Mitra not registered yet. Please register first."
  },
  "data": null
}
```

### Error Response - Invalid Credentials (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "data": null
}
```

### Error Response - Rate Limit Exceeded (429 Too Many Requests)
```json
{
  "success": false,
  "message": "Too many requests",
  "errors": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again later.",
    "details": "Rate limit: 5 requests per minute"
  },
  "data": null
}
```

---

## 2. Mitra Register
**POST** `/api/v1/mitras/auth/register`
**Rate Limit**: Strict (5 requests per minute)

### Request Body
```json
{
  "first_name": "Jane",
  "last_name": "Garage",
  "email": "jane.garage@example.com",
  "phone_number": "081234567891",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Registration successful",
  "errors": null,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU3IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDIyMzgxNjcsInR5cGUiOiJtaXRyYSJ9.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU3IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-123-457",
      "first_name": "Jane",
      "last_name": "Garage",
      "email": "jane.garage@example.com",
      "phone_number": "081234567891",
      "bank_name": "",
      "bank_number": ""
    }
  }
}
```

### Error Response - Email Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered"
  },
  "data": null
}
```

### Error Response - Password Mismatch (400 Bad Request)
```json
{
  "success": false,
  "message": "Passwords do not match",
  "errors": {
    "code": "PASSWORD_MISMATCH",
    "message": "Passwords do not match"
  },
  "data": null
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": "first_name is required; password must contain at least 8 characters with uppercase, lowercase, number, and special character"
  },
  "data": null
}
```

---

## 3. Mitra Google Login
**POST** `/api/v1/mitras/auth/google`
**Rate Limit**: Auth (10 requests per minute)

### Request Body
```json
{
  "email": "google.mitra@example.com",
  "first_name": "Google Mitra"
}
```

### Success Response - Existing Mitra (200 OK)
```json
{
  "success": true,
  "message": "Google login successful",
  "errors": null,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU4IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDIyMzgxNjcsInR5cGUiOiJtaXRyYSJ9.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU4IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-123-458",
      "first_name": "Google",
      "last_name": "Mitra",
      "email": "google.mitra@example.com",
      "phone_number": "081234567892",
      "bank_name": "Bank Mandiri",
      "bank_number": "9876543210"
    }
  }
}
```

### Success Response - New Mitra Created (201 Created)
```json
{
  "success": true,
  "message": "Google login successful",
  "errors": null,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU5IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDIyMzgxNjcsInR5cGUiOiJtaXRyYSJ9.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU5IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "id": "mitra-123-459",
      "first_name": "Google",
      "last_name": "Mitra",
      "email": "google.mitra@example.com",
      "phone_number": "",
      "bank_name": "",
      "bank_number": ""
    }
  }
}
```

---

## 4. Refresh Token
**POST** `/api/v1/mitras/auth/refresh`
**Rate Limit**: Auth (10 requests per minute)

### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "errors": null,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM4MTY3LCJleHAiOjE2NDIyNDE3NjcsInR5cGUiOiJtaXRyYSJ9.signature",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM4MTY3LCJleHAiOjE2NDI4NDI5NjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

### Error Response - Invalid Refresh Token (401 Unauthorized)
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

### Error Response - Expired Refresh Token (401 Unauthorized)
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

---

## 5. Logout
**POST** `/api/v1/mitras/auth/logout`
**Rate Limit**: Auth (10 requests per minute)

### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaXRyYS0xMjMtNDU2IiwiaWF0IjoxNjQyMjM0NTY3LCJleHAiOjE2NDI4MzkzNjcsInR5cGUiOiJyZWZyZXNoX21pdHJhIn0.signature"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful",
  "errors": null,
  "data": null
}
```

### Error Response - Invalid Refresh Token (401 Unauthorized)
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

---

## 6. Logout All Devices
**POST** `/api/v1/mitras/auth/logout-all`
**Auth**: Mitra JWT Required
**Rate Limit**: Auth (10 requests per minute)

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout from all devices successful",
  "errors": null,
  "data": null
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

---

## 7. Create Bank Account
**POST** `/api/v1/mitras/auth/bank`
**Auth**: Mitra JWT Required
**Rate Limit**: Auth (10 requests per minute)

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
  "message": "Bank account created successfully",
  "errors": null,
  "data": {
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "updated_at": "2024-01-15T16:30:00Z"
  }
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": "bank_name is required; bank_number must be 10-20 digits"
  },
  "data": null
}
```

### Error Response - Bank Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "Bank account already exists",
  "errors": {
    "code": "BANK_EXISTS",
    "message": "Bank account already exists",
    "details": "Please update existing bank account instead"
  },
  "data": null
}
```

---

## 8. Update Bank Account
**PATCH** `/api/v1/mitras/auth/bank`
**Auth**: Mitra JWT Required
**Rate Limit**: Auth (10 requests per minute)

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
  "message": "Bank account updated successfully",
  "errors": null,
  "data": {
    "bank_name": "Bank Mandiri",
    "bank_number": "9876543210",
    "updated_at": "2024-01-15T17:45:00Z"
  }
}
```

### Error Response - Bank Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Bank account not found",
  "errors": {
    "code": "BANK_NOT_FOUND",
    "message": "Bank account not found",
    "details": "Please create a bank account first"
  },
  "data": null
}
```

---

## 9. Update Profile
**PATCH** `/api/v1/mitras/auth/profile`
**Auth**: Mitra JWT Required
**Rate Limit**: Auth (10 requests per minute)

### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Body
```json
{
  "first_name": "John Updated",
  "last_name": "Workshop Pro",
  "phone_number": "081234567899"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "errors": null,
  "data": {
    "id": "mitra-123-456",
    "first_name": "John Updated",
    "last_name": "Workshop Pro",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567899",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "updated_at": "2024-01-15T18:20:00Z"
  }
}
```

### Success Response - Partial Update (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "errors": null,
  "data": {
    "id": "mitra-123-456",
    "first_name": "John Updated",
    "last_name": "Workshop",
    "email": "john.bengkel@example.com",
    "phone_number": "081234567890",
    "bank_name": "Bank BCA",
    "bank_number": "1234567890",
    "updated_at": "2024-01-15T18:25:00Z"
  }
}
```

### Error Response - Validation Failed (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": "phone_number must be a valid Indonesian phone number"
  },
  "data": null
}
```

---

## Common Error Responses

### 400 Bad Request - Invalid JSON
```json
{
  "success": false,
  "message": "Invalid request format",
  "errors": {
    "code": "INVALID_INPUT",
    "message": "Invalid input data",
    "details": "Invalid JSON format"
  },
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
    "message": "Unauthorized access",
    "details": "Authorization header is required"
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
    "message": "Invalid token",
    "details": "Token signature verification failed"
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
    "message": "Token has expired",
    "details": "Please refresh your token"
  },
  "data": null
}
```

### 429 Too Many Requests - Rate Limit
```json
{
  "success": false,
  "message": "Too many requests",
  "errors": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": "Rate limit exceeded. Please try again later."
  },
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  },
  "data": null
}
```

---

## Rate Limiting Headers

When rate limiting is enabled, the following headers are included in responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1642238167
Retry-After: 60
```

- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before making another request (only when rate limited)

---

## Authentication Flow Examples

### 1. Complete Registration Flow
```bash
# 1. Register new mitra
POST /api/v1/mitras/auth/register
# Response: 201 Created with access_token and refresh_token

# 2. Add bank account
POST /api/v1/mitras/auth/bank
Authorization: Bearer {access_token}
# Response: 201 Created

# 3. Update profile
PATCH /api/v1/mitras/auth/profile
Authorization: Bearer {access_token}
# Response: 200 OK
```

### 2. Login and Token Refresh Flow
```bash
# 1. Login
POST /api/v1/mitras/auth/login
# Response: 200 OK with tokens

# 2. Use access token for API calls
# When access token expires...

# 3. Refresh token
POST /api/v1/mitras/auth/refresh
# Response: 200 OK with new tokens

# 4. Logout when done
POST /api/v1/mitras/auth/logout
# Response: 200 OK
```

### 3. Google OAuth Flow
```bash
# 1. Google login (creates account if doesn't exist)
POST /api/v1/mitras/auth/google
# Response: 200 OK or 201 Created with tokens

# 2. Complete profile setup
PATCH /api/v1/mitras/auth/profile
Authorization: Bearer {access_token}

# 3. Add bank account
POST /api/v1/mitras/auth/bank
Authorization: Bearer {access_token}
```

---

## Security Notes

1. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
2. **Rate Limiting**: Strict limits on login/register, moderate limits on other endpoints
3. **Token Expiry**: Access tokens expire in 1 hour, refresh tokens in 7 days
4. **Secure Headers**: All responses include security headers
5. **Input Validation**: All inputs are validated and sanitized
6. **Error Handling**: Generic error messages to prevent information disclosure