# Bengkel API Response Examples

This document provides example responses for all bengkel (workshop) endpoints in the Bengkelin service.

## Base URL
```
/api/v1/bengkels
```

## Authentication
- `AuthJWTMitra()`: Requires mitra (bengkel owner) authentication
- `AuthJWT()`: Requires user authentication

---

## 1. Create Bengkel
**POST** `/api/v1/bengkels/new`
**Auth**: Mitra JWT

### Request Body
```json
{
  "bengkel_name": "Bengkel Jaya Motor",
  "bengkel_phone": "081234567890",
  "jumlah_montir": 5,
  "home_service": true,
  "store_service": true
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Bengkel created successfully",
  "errors": null,
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "bengkel_name": "Bengkel Jaya Motor",
    "bengkel_phone": "081234567890",
    "jumlah_montir": 5,
    "home_service": true,
    "store_service": true,
    "is_open": false,
    "avatar_url": "",
    "operasionals": [],
    "photos": [],
    "services": [],
    "addresses": [],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 2. Get Bengkel Profile
**GET** `/api/v1/bengkels/profile`
**Auth**: Mitra JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkel profile retrieved successfully",
  "errors": null,
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
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
      }
    ],
    "photos": [
      {
        "photo_id": 1,
        "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234567.jpg"
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
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T15:45:00Z"
  }
}
```

---

## 3. Update Bengkel Profile
**PATCH** `/api/v1/bengkels/profile`
**Auth**: Mitra JWT

### Request Body
```json
{
  "bengkel_name": "Bengkel Jaya Motor Premium",
  "bengkel_phone": "081234567891",
  "jumlah_montir": 7,
  "home_service": true,
  "store_service": true,
  "is_open": true
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkel profile updated successfully",
  "errors": null,
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "bengkel_name": "Bengkel Jaya Motor Premium",
    "bengkel_phone": "081234567891",
    "jumlah_montir": 7,
    "home_service": true,
    "store_service": true,
    "is_open": true,
    "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-avatar-1642234567.jpg",
    "operasionals": [],
    "photos": [],
    "services": [],
    "addresses": [],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T16:20:00Z"
  }
}
```

---

## 4. Get All Bengkels (Paginated)
**GET** `/api/v1/bengkels?page=1&limit=10`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkels retrieved successfully",
  "errors": null,
  "data": {
    "bengkels": [
      {
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "081234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-1.jpg",
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
        "services": [
          {
            "id": 1,
            "nama_service": "Ganti Oli"
          }
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

---

## 5. Create Bengkel Address
**POST** `/api/v1/bengkels/address`
**Auth**: Mitra JWT

### Request Body
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "address_label": "Bengkel Cabang",
  "full_address": "Jl. Thamrin No. 456, Jakarta Pusat",
  "note": "Dekat stasiun MRT"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Bengkel address created successfully",
  "errors": null,
  "data": {
    "id": 2,
    "latitude": -6.2088,
    "longitude": 106.8456,
    "address_label": "Bengkel Cabang",
    "full_address": "Jl. Thamrin No. 456, Jakarta Pusat",
    "note": "Dekat stasiun MRT"
  }
}
```

---

## 6. Create Bengkel Service
**POST** `/api/v1/bengkels/service`
**Auth**: Mitra JWT

### Request Body
```json
{
  "nama_service": "Service AC Mobil"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Bengkel service created successfully",
  "errors": null,
  "data": {
    "id": 3,
    "nama_service": "Service AC Mobil"
  }
}
```

---

## 7. Upload Bengkel Photos
**POST** `/api/v1/bengkels/photo`
**Auth**: Mitra JWT
**Content-Type**: multipart/form-data

### Request Body (Form Data)
```
photos: [file1.jpg, file2.jpg, file3.jpg]
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Bengkel photos uploaded successfully",
  "errors": null,
  "data": {
    "uploaded_photos": [
      {
        "photo_id": 1,
        "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234567.jpg"
      },
      {
        "photo_id": 2,
        "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234568.jpg"
      },
      {
        "photo_id": 3,
        "photo_url": "http://localhost:3000/api/v1/static/bengkel/photo-1642234569.jpg"
      }
    ]
  }
}
```

---

## 8. Update Service Options
**PATCH** `/api/v1/bengkels/service/opsi`
**Auth**: Mitra JWT

### Request Body
```json
{
  "home_service": true,
  "store_service": false
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Service options updated successfully",
  "errors": null,
  "data": {
    "home_service": true,
    "store_service": false
  }
}
```

---

## 9. Update Montir Count
**PATCH** `/api/v1/bengkels/montir`
**Auth**: Mitra JWT

### Request Body
```json
{
  "jumlah_montir": 8
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Montir count updated successfully",
  "errors": null,
  "data": {
    "jumlah_montir": 8
  }
}
```

---

## 10. Update Operational Hours
**PATCH** `/api/v1/bengkels/operasional`
**Auth**: Mitra JWT

### Request Body
```json
{
  "operasionals": [
    {
      "hari": "Senin",
      "jam_buka": "08:00-18:00"
    },
    {
      "hari": "Selasa",
      "jam_buka": "08:00-18:00"
    },
    {
      "hari": "Sabtu",
      "jam_buka": "09:00-15:00"
    }
  ]
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Operational hours updated successfully",
  "errors": null,
  "data": {
    "operasionals": [
      {
        "id": 1,
        "hari": "Senin",
        "jam_buka": "08:00-18:00"
      },
      {
        "id": 2,
        "hari": "Selasa",
        "jam_buka": "08:00-18:00"
      },
      {
        "id": 3,
        "hari": "Sabtu",
        "jam_buka": "09:00-15:00"
      }
    ]
  }
}
```

---

## 11. Search Bengkels
**GET** `/api/v1/bengkels/search?q=motor&latitude=-6.2088&longitude=106.8456&radius=5&page=1&limit=10`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkels search results",
  "errors": null,
  "data": {
    "bengkels": [
      {
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "081234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-1.jpg",
        "distance": 2.5,
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
        "services": [
          {
            "id": 1,
            "nama_service": "Ganti Oli"
          },
          {
            "id": 2,
            "nama_service": "Tune Up Motor"
          }
        ]
      }
    ],
    "search_params": {
      "query": "motor",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "radius": 5
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "total_pages": 1
    }
  }
}
```

---

## 12. Create Bengkel Testimonial
**POST** `/api/v1/bengkels/testimoni/:bengkelId`
**Auth**: User JWT

### Request Body
```json
{
  "order_id": "order-123-456",
  "testimoni": "Pelayanan sangat memuaskan, montir profesional dan harga terjangkau!",
  "rating": 5
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Testimonial created successfully",
  "errors": null,
  "data": {
    "id": 1,
    "order_id": "order-123-456",
    "testimoni": "Pelayanan sangat memuaskan, montir profesional dan harga terjangkau!",
    "rating": 5,
    "user": {
      "id": "user-123",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "http://localhost:3000/api/v1/static/avatar/user-avatar.jpg"
    }
  }
}
```

---

## 13. Get Bengkel Detail with Testimonials
**GET** `/api/v1/bengkels/testimoni/:bengkelId`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkel detail retrieved successfully",
  "errors": null,
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "bengkel_name": "Bengkel Jaya Motor",
    "bengkel_phone": "081234567890",
    "jumlah_montir": 5,
    "home_service": true,
    "store_service": true,
    "is_open": true,
    "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-1.jpg",
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
    "services": [
      {
        "id": 1,
        "nama_service": "Ganti Oli"
      }
    ],
    "testimonials": [
      {
        "id": 1,
        "order_id": "order-123-456",
        "testimoni": "Pelayanan sangat memuaskan!",
        "rating": 5,
        "user": {
          "id": "user-123",
          "first_name": "John",
          "last_name": "Doe",
          "avatar_url": "http://localhost:3000/api/v1/static/avatar/user-avatar.jpg"
        }
      }
    ],
    "average_rating": 4.8,
    "total_testimonials": 25
  }
}
```

---

## 14. Update Bengkel Avatar
**PATCH** `/api/v1/bengkels/avatar`
**Auth**: Mitra JWT
**Content-Type**: multipart/form-data

### Request Body (Form Data)
```
avatar: [avatar.jpg]
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "errors": null,
  "data": {
    "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-avatar-1642234567.jpg"
  }
}
```

---

## 15. Create Order Service
**POST** `/api/v1/bengkels/order/service/:userId`
**Auth**: Mitra JWT

### Request Body
```json
{
  "vehicle_id": 1,
  "is_home_service": true,
  "home_service_schedule": "2024-01-20 10:00",
  "payment_method": "cash",
  "note": "Ganti oli dan filter udara",
  "order_services": [
    {
      "title": "Ganti Oli Mesin",
      "detail": "Oli SAE 10W-40 + Filter",
      "price": 150000
    },
    {
      "title": "Ganti Filter Udara",
      "detail": "Filter udara original",
      "price": 75000
    }
  ]
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Order service created successfully",
  "errors": null,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-123",
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "vehicle_id": 1,
    "status": 1,
    "is_home_service": true,
    "total_price": 250000,
    "admin_fee": 5000,
    "home_service_fee": 25000,
    "home_service_schedule": "2024-01-20 10:00",
    "payment_method": "cash",
    "note": "Ganti oli dan filter udara",
    "order_services": [
      {
        "id": 1,
        "order_id": "order-550e8400-e29b-41d4-a716-446655440001",
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 150000
      },
      {
        "id": 2,
        "order_id": "order-550e8400-e29b-41d4-a716-446655440001",
        "title": "Ganti Filter Udara",
        "detail": "Filter udara original",
        "price": 75000
      }
    ],
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T16:30:00Z"
  }
}
```

---

## 16. Get Order Service by ID
**GET** `/api/v1/bengkels/order/service/:pesananId`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order service retrieved successfully",
  "errors": null,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-123",
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "vehicle_id": 1,
    "status": 2,
    "is_home_service": true,
    "total_price": 250000,
    "admin_fee": 5000,
    "home_service_fee": 25000,
    "home_service_schedule": "2024-01-20 10:00",
    "payment_method": "cash",
    "note": "Ganti oli dan filter udara",
    "user": {
      "id": "user-123",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "081234567890",
      "avatar_url": "http://localhost:3000/api/v1/static/avatar/user-avatar.jpg"
    },
    "bengkel": {
      "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
      "bengkel_name": "Bengkel Jaya Motor",
      "bengkel_phone": "081234567890"
    },
    "vehicle": {
      "vehicle_id": 1,
      "vehicle_type": "Motor",
      "vehicle_number": "B 1234 ACG",
      "vehicle_color": "Hitam"
    },
    "order_services": [
      {
        "id": 1,
        "order_id": "order-550e8400-e29b-41d4-a716-446655440001",
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 150000
      }
    ],
    "confirmed_at": "2024-01-15T17:00:00Z",
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T17:00:00Z"
  }
}
```

---

## 17. Get All User Orders (Paginated)
**GET** `/api/v1/bengkels/orders/list/user?page=1&limit=10&status=all`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User orders retrieved successfully",
  "errors": null,
  "data": {
    "orders": [
      {
        "id": "order-550e8400-e29b-41d4-a716-446655440001",
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
        "vehicle_id": 1,
        "status": 3,
        "is_home_service": true,
        "total_price": 250000,
        "home_service_schedule": "2024-01-20 10:00",
        "bengkel": {
          "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
          "bengkel_name": "Bengkel Jaya Motor",
          "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-1.jpg"
        },
        "vehicle": {
          "vehicle_id": 1,
          "vehicle_type": "Motor",
          "vehicle_number": "B 1234 ACG"
        },
        "order_services": [
          {
            "title": "Ganti Oli Mesin",
            "price": 150000
          }
        ],
        "created_at": "2024-01-15T16:30:00Z"
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

---

## 18. Get All Mitra Orders (Paginated)
**GET** `/api/v1/bengkels/orders/list/mitra?page=1&limit=10&status=pending`
**Auth**: Mitra JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Mitra orders retrieved successfully",
  "errors": null,
  "data": {
    "orders": [
      {
        "id": "order-550e8400-e29b-41d4-a716-446655440001",
        "user_id": "user-123",
        "vehicle_id": 1,
        "status": 1,
        "is_home_service": true,
        "total_price": 250000,
        "home_service_schedule": "2024-01-20 10:00",
        "payment_method": "cash",
        "user": {
          "id": "user-123",
          "first_name": "John",
          "last_name": "Doe",
          "phone_number": "081234567890"
        },
        "vehicle": {
          "vehicle_id": 1,
          "vehicle_type": "Motor",
          "vehicle_number": "B 1234 ACG",
          "vehicle_color": "Hitam"
        },
        "order_services": [
          {
            "title": "Ganti Oli Mesin",
            "detail": "Oli SAE 10W-40 + Filter",
            "price": 150000
          }
        ],
        "created_at": "2024-01-15T16:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "total_pages": 2
    }
  }
}
```

---

## 19. Get Order Service by ID (Mitra View)
**GET** `/api/v1/bengkels/order/mitra/service/:pesananId`
**Auth**: Mitra JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order service retrieved successfully",
  "errors": null,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-123",
    "vehicle_id": 1,
    "status": 2,
    "is_home_service": true,
    "total_price": 250000,
    "admin_fee": 5000,
    "home_service_fee": 25000,
    "home_service_schedule": "2024-01-20 10:00",
    "payment_method": "cash",
    "note": "Ganti oli dan filter udara",
    "user": {
      "id": "user-123",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "081234567890",
      "email": "john.doe@example.com",
      "avatar_url": "http://localhost:3000/api/v1/static/avatar/user-avatar.jpg",
      "addresses": [
        {
          "id": 1,
          "latitude": -6.2088,
          "longitude": 106.8456,
          "address_label": "Rumah",
          "full_address": "Jl. Kebon Jeruk No. 789, Jakarta Barat",
          "note": "Rumah warna putih"
        }
      ]
    },
    "vehicle": {
      "vehicle_id": 1,
      "vehicle_type": "Motor",
      "vehicle_number": "B 1234 ACG",
      "vehicle_color": "Hitam"
    },
    "order_services": [
      {
        "id": 1,
        "title": "Ganti Oli Mesin",
        "detail": "Oli SAE 10W-40 + Filter",
        "price": 150000
      },
      {
        "id": 2,
        "title": "Ganti Filter Udara",
        "detail": "Filter udara original",
        "price": 75000
      }
    ],
    "confirmed_at": "2024-01-15T17:00:00Z",
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T17:00:00Z"
  }
}
```

---

## 20. Get Bengkel Operational Schedule
**GET** `/api/v1/bengkels/order/schedule?bengkel_id=550e8400-e29b-41d4-a716-446655440000&day=Senin`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bengkel operational schedule retrieved successfully",
  "errors": null,
  "data": {
    "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
    "bengkel_name": "Bengkel Jaya Motor",
    "day": "Senin",
    "operational": {
      "id": 1,
      "hari": "Senin",
      "jam_buka": "08:00-17:00"
    },
    "is_open": true,
    "available_slots": [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00"
    ],
    "booked_slots": [
      "12:00"
    ]
  }
}
```

---

## 21. Update Order Service
**PATCH** `/api/v1/bengkels/order/service/:pesananId`
**Auth**: User JWT

### Request Body
```json
{
  "home_service_schedule": "2024-01-21 14:00",
  "note": "Mohon datang tepat waktu, alamat sudah benar"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order service updated successfully",
  "errors": null,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440001",
    "home_service_schedule": "2024-01-21 14:00",
    "note": "Mohon datang tepat waktu, alamat sudah benar",
    "updated_at": "2024-01-15T18:30:00Z"
  }
}
```

---

## 22. Update Order Status
**PATCH** `/api/v1/bengkels/order/status/:pesananId`
**Auth**: Mitra JWT

### Request Body
```json
{
  "status": 3,
  "note": "Pekerjaan selesai, kendaraan siap diambil"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "errors": null,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440001",
    "status": 3,
    "note": "Pekerjaan selesai, kendaraan siap diambil",
    "finished_at": "2024-01-20T15:30:00Z",
    "updated_at": "2024-01-20T15:30:00Z"
  }
}
```

---

## 23. Get User Detail
**GET** `/api/v1/bengkels/order/user/:userId`
**Auth**: Mitra JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User detail retrieved successfully",
  "errors": null,
  "data": {
    "id": "user-123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "081234567890",
    "avatar_url": "http://localhost:3000/api/v1/static/avatar/user-avatar.jpg",
    "addresses": [
      {
        "id": 1,
        "latitude": -6.2088,
        "longitude": 106.8456,
        "address_label": "Rumah",
        "full_address": "Jl. Kebon Jeruk No. 789, Jakarta Barat",
        "note": "Rumah warna putih"
      }
    ],
    "vehicles": [
      {
        "vehicle_id": 1,
        "vehicle_type": "Motor",
        "vehicle_number": "B 1234 ACG",
        "vehicle_color": "Hitam"
      }
    ],
    "total_orders": 5,
    "completed_orders": 3,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

---

## 24. Get Nearest Bengkels
**GET** `/api/v1/bengkels/nearest?latitude=-6.2088&longitude=106.8456&radius=10&page=1&limit=5`
**Auth**: User JWT

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Nearest bengkels retrieved successfully",
  "errors": null,
  "data": {
    "bengkels": [
      {
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440000",
        "bengkel_name": "Bengkel Jaya Motor",
        "bengkel_phone": "081234567890",
        "jumlah_montir": 5,
        "home_service": true,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-1.jpg",
        "distance": 1.2,
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
        "average_rating": 4.8,
        "total_reviews": 25
      },
      {
        "bengkel_id": "550e8400-e29b-41d4-a716-446655440001",
        "bengkel_name": "Auto Service Center",
        "bengkel_phone": "081234567891",
        "jumlah_montir": 3,
        "home_service": false,
        "store_service": true,
        "is_open": true,
        "avatar_url": "http://localhost:3000/api/v1/static/avatar/bengkel-2.jpg",
        "distance": 2.8,
        "addresses": [
          {
            "id": 2,
            "latitude": -6.2100,
            "longitude": 106.8470,
            "address_label": "Workshop",
            "full_address": "Jl. Gatot Subroto No. 456, Jakarta Selatan",
            "note": "Sebelah SPBU"
          }
        ],
        "services": [
          {
            "id": 3,
            "nama_service": "Service AC"
          }
        ],
        "average_rating": 4.5,
        "total_reviews": 18
      }
    ],
    "user_location": {
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "search_radius": 10,
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 8,
      "total_pages": 2
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": "bengkel_name is required"
  },
  "data": null
}
```

### 401 Unauthorized
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

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden",
  "errors": {
    "code": "FORBIDDEN",
    "message": "Access forbidden",
    "details": "You don't own this bengkel"
  },
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bengkel not found",
  "errors": {
    "code": "BENGKEL_NOT_FOUND",
    "message": "Bengkel not found"
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

## Status Codes Reference

### Order Status
- `1`: Pending (Menunggu konfirmasi)
- `2`: Confirmed (Dikonfirmasi)
- `3`: In Progress (Sedang dikerjakan)
- `4`: Completed (Selesai)
- `5`: Cancelled (Dibatalkan)
- `6`: Paid (Sudah dibayar)

### Service Types
- `home_service`: true/false - Layanan ke rumah
- `store_service`: true/false - Layanan di bengkel

### Operational Days
- Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu

### Time Format
- `jam_buka`: "HH:MM-HH:MM" (e.g., "08:00-17:00")
- `home_service_schedule`: "YYYY-MM-DD HH:MM" (e.g., "2024-01-20 10:00")