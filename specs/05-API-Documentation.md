# API Documentation
# Bengkelin Service Backend API

## Base Information

- **Base URL:** `http://localhost:3000/api/v1` (Development)
- **Production URL:** `https://api.bengkelin.com/api/v1`
- **API Version:** v1
- **Authentication:** JWT Bearer Token
- **Content Type:** `application/json`
- **Documentation:** Available at `/swagger/index.html`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Types
- **Access Token:** Short-lived (1 hour), used for API requests
- **Refresh Token:** Long-lived (7 days), used to obtain new access tokens

## Rate Limiting

| Endpoint Category | Rate Limit | Description |
|-------------------|------------|-------------|
| General | 100 requests/minute | Most API endpoints |
| Authentication | 10 requests/minute | Login, register, refresh |
| Strict | 5 requests/minute | Login and register only |

## Standard Response Format

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
  "errors": [
    {
      "field": "field_name",
      "message": "Field-specific error message"
    }
  ]
}
```

## API Endpoints

### 1. Authentication Endpoints

#### 1.1 User Authentication

##### POST /api/v1/users/auth/register
**Description:** Register a new user account

**Authentication:** Not Required

**Rate Limiting:** Strict (5 requests/minute)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+6281234567890",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+6281234567890",
      "avatar_url": ""
    }
  }
}
```

**Business Logic:**
1. Validate input data (email format, password strength, phone number format)
2. Check if email already exists
3. Hash password using bcrypt
4. Create user record in database
5. Generate JWT access and refresh tokens
6. Store refresh token in database
7. Return user data with tokens

##### POST /api/v1/users/auth/login
**Description:** Authenticate user with email and password

**Authentication:** Not Required

**Rate Limiting:** Strict (5 requests/minute)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+6281234567890",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

**Business Logic:**
1. Validate email format
2. Find user by email
3. Compare provided password with stored hash
4. Generate new JWT token pair
5. Store refresh token in database
6. Return user data with tokens

##### POST /api/v1/users/auth/google
**Description:** Authenticate user with Google OAuth

**Authentication:** Not Required

**Rate Limiting:** Auth (10 requests/minute)

**Request Body:**
```json
{
  "email": "john.doe@gmail.com",
  "first_name": "John",
  "google_id": "google_user_id_here"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Google authentication successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "",
      "email": "john.doe@gmail.com",
      "phone_number": "",
      "avatar_url": ""
    }
  }
}
```

##### POST /api/v1/users/auth/refresh
**Description:** Refresh access token using refresh token

**Authentication:** Not Required

**Rate Limiting:** Auth (10 requests/minute)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

##### POST /api/v1/users/auth/logout
**Description:** Logout user and revoke refresh token

**Authentication:** Not Required

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

##### POST /api/v1/users/auth/logout-all
**Description:** Logout from all devices (revoke all refresh tokens)

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out from all devices"
}
```

#### 1.2 Mitra Authentication

##### POST /api/v1/mitras/auth/register
**Description:** Register a new mitra (workshop owner) account

**Authentication:** Not Required

**Rate Limiting:** Strict (5 requests/minute)

**Request Body:**
```json
{
  "first_name": "Ahmad",
  "last_name": "Bengkel",
  "email": "ahmad@bengkelmakmur.com",
  "phone_number": "+6281234567891",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Mitra registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "mitra_id": "550e8400-e29b-41d4-a716-446655440002",
      "first_name": "Ahmad",
      "last_name": "Bengkel",
      "email": "ahmad@bengkelmakmur.com",
      "phone_number": "+6281234567891",
      "bank_name": "",
      "bank_number": ""
    }
  }
}
```

##### POST /api/v1/mitras/auth/login
**Description:** Authenticate mitra with email and password

**Authentication:** Not Required

**Rate Limiting:** Strict (5 requests/minute)

**Request Body:**
```json
{
  "email": "ahmad@bengkelmakmur.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Mitra login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "mitra": {
      "mitra_id": "550e8400-e29b-41d4-a716-446655440002",
      "first_name": "Ahmad",
      "last_name": "Bengkel",
      "email": "ahmad@bengkelmakmur.com",
      "phone_number": "+6281234567891",
      "bank_name": "BCA",
      "bank_number": "1234567890"
    }
  }
}
```

### 2. User Management Endpoints

#### 2.1 User Profile

##### GET /api/v1/users/profile
**Description:** Get current user profile

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "+6281234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "addresses": [
      {
        "id": 1,
        "label": "Home",
        "full_address": "Jl. Thamrin No. 456, Jakarta Pusat",
        "latitude": -6.2297,
        "longitude": 106.8261,
        "is_primary": true
      }
    ],
    "vehicles": [
      {
        "id": 1,
        "vehicle_type": "Mobil",
        "vehicle_number": "B 1234 ABC",
        "vehicle_color": "Putih",
        "vehicle_photo": "https://example.com/vehicle.jpg"
      }
    ]
  }
}
```

##### PATCH /api/v1/users/profile
**Description:** Update user profile

**Authentication:** Required

**Request Body:**
```json
{
  "first_name": "John Updated",
  "last_name": "Doe Updated",
  "phone_number": "+6281234567899"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "email": "john.doe@example.com",
    "phone_number": "+6281234567899",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

##### PATCH /api/v1/users/avatar
**Description:** Update user avatar

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
```
avatar: [image file]
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Avatar updated successfully",
  "data": {
    "avatar_url": "https://example.com/new-avatar.jpg"
  }
}
```

#### 2.2 Address Management

##### POST /api/v1/users/address
**Description:** Create new user address

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Office",
  "full_address": "Jl. Sudirman No. 123, Jakarta Selatan",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "is_primary": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Address created successfully",
  "data": {
    "id": 2,
    "label": "Office",
    "full_address": "Jl. Sudirman No. 123, Jakarta Selatan",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "is_primary": false
  }
}
```

##### GET /api/v1/users/address/:addressId
**Description:** Get address details

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Address retrieved successfully",
  "data": {
    "id": 1,
    "label": "Home",
    "full_address": "Jl. Thamrin No. 456, Jakarta Pusat",
    "latitude": -6.2297,
    "longitude": 106.8261,
    "is_primary": true
  }
}
```

##### PATCH /api/v1/users/address/:addressId
**Description:** Update specific address

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Home Updated",
  "full_address": "Jl. Thamrin No. 456A, Jakarta Pusat",
  "is_primary": true
}
```

##### DELETE /api/v1/users/address/:addressId
**Description:** Delete user address

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Address deleted successfully"
}
```

#### 2.3 Vehicle Management

##### GET /api/v1/users/vehicle/:vehicleId
**Description:** Get vehicle details

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": 1,
    "vehicle_type": "Mobil",
    "vehicle_number": "B 1234 ABC",
    "vehicle_color": "Putih",
    "vehicle_photo": "https://example.com/vehicle.jpg"
  }
}
```

##### DELETE /api/v1/users/vehicle/:vehicleId
**Description:** Delete user vehicle

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Vehicle deleted successfully"
}
```

### 3. Bengkel Management Endpoints

#### 3.1 Bengkel Profile

##### POST /api/v1/bengkels/new
**Description:** Create new bengkel profile

**Authentication:** Required (Mitra)

**Request Body:**
```json
{
  "bengkel_name": "Bengkel Makmur",
  "bengkel_phone": "+6281234567892",
  "jumlah_montir": 5
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Bengkel created successfully",
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440003",
    "bengkel_name": "Bengkel Makmur",
    "bengkel_phone": "+6281234567892",
    "jumlah_montir": 5,
    "home_service": false,
    "store_service": false,
    "is_open": true,
    "avatar_url": ""
  }
}
```

##### GET /api/v1/bengkels/profile
**Description:** Get bengkel profile (for mitra)

**Authentication:** Required (Mitra)

**Response (200):**
```json
{
  "status": "success",
  "message": "Bengkel profile retrieved successfully",
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440003",
    "bengkel_name": "Bengkel Makmur",
    "bengkel_phone": "+6281234567892",
    "jumlah_montir": 5,
    "home_service": true,
    "store_service": true,
    "is_open": true,
    "avatar_url": "https://example.com/bengkel-avatar.jpg",
    "addresses": [
      {
        "id": 1,
        "label": "Main Workshop",
        "full_address": "Jl. Sudirman No. 123, Jakarta Pusat",
        "latitude": -6.2088,
        "longitude": 106.8456
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
      }
    ],
    "operasionals": [
      {
        "id": 1,
        "day": "Senin",
        "opening_time": "08:00:00"
      }
    ],
    "photos": [
      {
        "id": 1,
        "photo_url": "https://example.com/bengkel-photo1.jpg"
      }
    ]
  }
}
```

##### PATCH /api/v1/bengkels/profile
**Description:** Update bengkel profile

**Authentication:** Required (Mitra)

**Request Body:**
```json
{
  "bengkel_name": "Bengkel Makmur Updated",
  "bengkel_phone": "+6281234567893",
  "jumlah_montir": 7
}
```

#### 3.2 Bengkel Discovery

##### GET /api/v1/bengkels
**Description:** Get all bengkels with pagination

**Authentication:** Required

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "message": "Bengkels retrieved successfully",
  "data": {
    "bengkels": [
      {
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440003",
        "bengkel_name": "Bengkel Makmur",
        "bengkel_phone": "+6281234567892",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "https://example.com/bengkel-avatar.jpg",
        "addresses": [
          {
            "full_address": "Jl. Sudirman No. 123, Jakarta Pusat",
            "latitude": -6.2088,
            "longitude": 106.8456
          }
        ],
        "services": [
          {"nama_service": "Ganti Oli"},
          {"nama_service": "Tune Up"}
        ],
        "photos": [
          {"photo_url": "https://example.com/photo1.jpg"}
        ]
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

##### GET /api/v1/bengkels/search
**Description:** Search bengkels with filters

**Authentication:** Required

**Query Parameters:**
- `query` (string): Search query (name, service, address)
- `service` (string): Service type filter (`home_service`, `store_service`)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)

**Example:** `/api/v1/bengkels/search?query=ganti oli&service=home_service&page=1&limit=10`

##### GET /api/v1/bengkels/nearest
**Description:** Find nearest bengkels based on location

**Authentication:** Required

**Query Parameters:**
- `latitude` (float): User's latitude
- `longitude` (float): User's longitude
- `radius` (int): Search radius in kilometers (default: 10)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)

**Example:** `/api/v1/bengkels/nearest?latitude=-6.2088&longitude=106.8456&radius=5`

##### GET /api/v1/bengkels/testimoni/:bengkelId
**Description:** Get bengkel details with testimonials

**Authentication:** Required

**Query Parameters:**
- `page` (int): Testimonial page number (default: 1)
- `size` (int): Testimonials per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "message": "Bengkel details retrieved successfully",
  "data": {
    "bengkel": {
      "bengkel_id": "550e8400-e29b-41d4-a716-446655440003",
      "bengkel_name": "Bengkel Makmur",
      "bengkel_phone": "+6281234567892",
      "jumlah_montir": 5,
      "home_service": true,
      "store_service": true,
      "is_open": true,
      "avatar_url": "https://example.com/bengkel-avatar.jpg"
    },
    "testimonials": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Pelayanan sangat memuaskan!",
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 15
    }
  }
}
```

### 4. Order Management Endpoints

#### 4.1 Order Creation

##### POST /api/v1/bengkels/order/service/:userId
**Description:** Create service order for user

**Authentication:** Required (Mitra)

**Request Body:**
```json
{
  "vehicle_id": 1,
  "is_home_service": true,
  "home_service_schedule": "2024-01-15 10:00",
  "payment_method": "cash",
  "note": "Ganti oli dan filter",
  "services": [
    {
      "title": "Ganti Oli Mesin",
      "detail": "Oli SAE 10W-40 + Filter",
      "price": 120000
    },
    {
      "title": "Cek Kondisi Umum",
      "detail": "Pemeriksaan rutin kendaraan",
      "price": 30000
    }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440004",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440003",
    "vehicle_id": 1,
    "status": 0,
    "is_home_service": true,
    "total_price": 170000,
    "admin_fee": 5000,
    "home_service_fee": 15000,
    "home_service_schedule": "2024-01-15 10:00",
    "payment_method": "cash",
    "note": "Ganti oli dan filter",
    "order_services": [
      {
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 120000
      },
      {
        "title": "Cek Kondisi Umum",
        "detail": "Pemeriksaan rutin kendaraan",
        "price": 30000
      }
    ],
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Business Logic:**
1. Validate user and vehicle existence
2. Validate bengkel availability
3. Calculate service total from order items
4. Add admin fee (from admin_fees table)
5. Add home service fee (10% of service total if home service)
6. Create order with status 0 (pending)
7. Create order service items
8. Return complete order details

#### 4.2 Order Tracking

##### GET /api/v1/bengkels/order/service/:pesananId
**Description:** Get order details (for customer)

**Authentication:** Required

**Response (200):**
```json
{
  "status": "success",
  "message": "Order details retrieved successfully",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440004",
    "status": 1,
    "status_text": "Confirmed",
    "total_price": 170000,
    "admin_fee": 5000,
    "home_service_fee": 15000,
    "is_home_service": true,
    "home_service_schedule": "2024-01-15 10:00",
    "payment_method": "cash",
    "note": "Ganti oli dan filter",
    "bengkel": {
      "bengkel_name": "Bengkel Makmur",
      "bengkel_phone": "+6281234567892",
      "avatar_url": "https://example.com/bengkel-avatar.jpg"
    },
    "vehicle": {
      "vehicle_type": "Mobil",
      "vehicle_number": "B 1234 ABC",
      "vehicle_color": "Putih"
    },
    "order_services": [
      {
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 120000
      }
    ],
    "created_at": "2024-01-01T10:00:00Z",
    "confirmed_at": "2024-01-01T10:30:00Z",
    "finished_at": null
  }
}
```

##### GET /api/v1/bengkels/order/mitra/service/:pesananId
**Description:** Get order details (for mitra)

**Authentication:** Required (Mitra)

**Response (200):**
```json
{
  "status": "success",
  "message": "Order details retrieved successfully",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440004",
    "status": 1,
    "total_price": 170000,
    "admin_fee": 5000,
    "home_service_fee": 15000,
    "is_home_service": true,
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+6281234567890"
    },
    "vehicle": {
      "vehicle_type": "Mobil",
      "vehicle_number": "B 1234 ABC",
      "vehicle_color": "Putih"
    },
    "order_services": [
      {
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 120000
      }
    ],
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### 4.3 Order Status Management

##### PATCH /api/v1/bengkels/order/status/:pesananId
**Description:** Update order status (for mitra)

**Authentication:** Required (Mitra)

**Request Body:**
```json
{
  "status": 1
}
```

**Status Values:**
- `0`: Pending
- `1`: Confirmed
- `2`: In Progress
- `3`: Completed
- `4`: Cancelled

**Response (200):**
```json
{
  "status": "success",
  "message": "Order status updated successfully",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440004",
    "status": 1,
    "status_text": "Confirmed",
    "confirmed_at": "2024-01-01T10:30:00Z"
  }
}
```

#### 4.4 Order History

##### GET /api/v1/bengkels/orders/list/user
**Description:** Get user's order history

**Authentication:** Required

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)
- `status` (int): Filter by status (optional)

**Response (200):**
```json
{
  "status": "success",
  "message": "Order history retrieved successfully",
  "data": {
    "orders": [
      {
        "order_id": "550e8400-e29b-41d4-a716-446655440004",
        "status": 3,
        "status_text": "Completed",
        "total_price": 170000,
        "is_home_service": true,
        "bengkel": {
          "bengkel_name": "Bengkel Makmur",
          "avatar_url": "https://example.com/bengkel-avatar.jpg"
        },
        "vehicle": {
          "vehicle_type": "Mobil",
          "vehicle_number": "B 1234 ABC"
        },
        "created_at": "2024-01-01T10:00:00Z",
        "finished_at": "2024-01-01T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

##### GET /api/v1/bengkels/orders/list/mitra
**Description:** Get mitra's order history

**Authentication:** Required (Mitra)

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)
- `status` (int): Filter by status (optional)

### 5. System Endpoints

#### 5.1 Health Checks

##### GET /health
**Description:** Comprehensive health check

**Authentication:** Not Required

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": "1h30m45s",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Connection successful",
      "duration": "5ms",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    "redis": {
      "status": "healthy",
      "message": "Connection successful",
      "duration": "2ms",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    "system": {
      "status": "healthy",
      "message": "System resources normal",
      "duration": "1ms",
      "timestamp": "2024-01-01T10:00:00Z"
    }
  }
}
```

##### GET /ready
**Description:** Readiness check (Kubernetes)

**Authentication:** Not Required

**Response (200):**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

##### GET /live
**Description:** Liveness check (Kubernetes)

**Authentication:** Not Required

**Response (200):**
```json
{
  "status": "alive",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### 5.2 Metrics

##### GET /metrics
**Description:** Prometheus metrics

**Authentication:** Not Required

**Response (200):**
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
http_requests_total{method="POST",status="201"} 567

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 100
http_request_duration_seconds_bucket{le="0.5"} 200
http_request_duration_seconds_sum 45.67
http_request_duration_seconds_count 300
```

##### GET /metrics/app
**Description:** Application-specific metrics

**Authentication:** Not Required

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "active_users": 1250,
    "active_mitras": 89,
    "total_orders": 5678,
    "pending_orders": 23,
    "completed_orders_today": 45,
    "database_connections": {
      "active": 12,
      "idle": 8,
      "max": 150
    },
    "redis_connections": {
      "active": 5,
      "total_commands": 12345
    }
  }
}
```

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Input validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Status Codes Reference

### Order Status
- `0`: Pending - Order created, waiting for bengkel confirmation
- `1`: Confirmed - Bengkel accepted the order
- `2`: In Progress - Service is being performed
- `3`: Completed - Service finished successfully
- `4`: Cancelled - Order was cancelled

### Rate Limiting Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

This API documentation provides comprehensive coverage of all endpoints in the Bengkelin Service backend, including request/response formats, authentication requirements, business logic, and error handling.