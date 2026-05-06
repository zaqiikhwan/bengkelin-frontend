# Bengkel Service Enhancements

## Overview
This document outlines the enhancements made to the bengkel service management system to provide detailed service information including descriptions, pricing, and availability control.

## Summary of Changes

### 1. Database Schema Enhancements
- **Added `description` field**: Detailed service description
- **Added `price` field**: Service pricing with decimal precision
- **Added `is_available` field**: Boolean pointer for service availability control

### 2. API Request Format Improvements
- **New detailed format**: Support for comprehensive service information
- **Backward compatibility**: Legacy format still supported
- **ID-based updates**: Support for both creating and updating services

### 3. Enhanced Service Management
- **Pricing control**: Set individual prices for each service
- **Availability management**: Enable/disable services without deletion
- **Detailed descriptions**: Provide comprehensive service information

---

## Database Changes

### Before
```sql
CREATE TABLE bengkel_services (
    id SERIAL PRIMARY KEY,
    bengkel_id VARCHAR(36),
    nama_service VARCHAR(100)
);
```

### After
```sql
CREATE TABLE bengkel_services (
    id SERIAL PRIMARY KEY,
    bengkel_id VARCHAR(36),
    nama_service VARCHAR(100),
    description TEXT DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT true
);
```

### Migration Script
```sql
-- Add new columns
ALTER TABLE bengkel_services 
ADD COLUMN description TEXT DEFAULT '';

ALTER TABLE bengkel_services 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE bengkel_services 
ADD COLUMN is_available BOOLEAN DEFAULT true;

-- Update existing records
UPDATE bengkel_services 
SET description = '', price = 0.00, is_available = true 
WHERE description IS NULL OR price IS NULL OR is_available IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bengkel_services_is_available ON bengkel_services(is_available);
CREATE INDEX IF NOT EXISTS idx_bengkel_services_price ON bengkel_services(price);
CREATE INDEX IF NOT EXISTS idx_bengkel_services_bengkel_id_available ON bengkel_services(bengkel_id, is_available);
```

---

## Model Changes

### Before
```go
type BengkelService struct {
    ID          uint    `gorm:"primary_key;auto_increment" json:"id"`
    BengkelID   string  `gorm:"type:varchar(36);index" json:"-"`
    NamaService string  `gorm:"type:varchar(100)" json:"nama_service"`
    Bengkel     Bengkel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}
```

### After
```go
type BengkelService struct {
    ID          uint     `gorm:"primary_key;auto_increment" json:"id"`
    BengkelID   string   `gorm:"type:varchar(36);index" json:"-"`
    NamaService string   `gorm:"type:varchar(100)" json:"nama_service"`
    Description string   `gorm:"type:text" json:"description"`
    Price       float64  `gorm:"type:decimal(10,2)" json:"price"`
    IsAvailable *bool    `gorm:"type:boolean;default:true" json:"is_available"`
    Bengkel     Bengkel  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}
```

---

## API Request Format Changes

### Legacy Format (Still Supported)
```json
{
  "nama_service": [
    "Oil Change",
    "Brake Service",
    "Engine Repair"
  ]
}
```

### New Enhanced Format
```json
{
  "services": [
    {
      "nama_service": "Ganti Oli Mesin",
      "description": "Oli SAE 10W-40 + Filter",
      "price": 120000,
      "is_available": true
    },
    {
      "nama_service": "Tune Up",
      "description": "Pemeriksaan dan penyetelan mesin",
      "price": 150000,
      "is_available": true
    },
    {
      "nama_service": "Service AC",
      "description": "Pembersihan dan isi freon",
      "price": 100000,
      "is_available": false
    }
  ]
}
```

---

## Validator Changes

### New Validator Structures
```go
type BengkelServiceItem struct {
    ID          uint     `json:"id"`
    NamaService string   `json:"nama_service" binding:"required,min=1,max=100" validate:"alpha_numeric_space,no_xss"`
    Description string   `json:"description" binding:"max=500" validate:"no_xss,no_sql_injection"`
    Price       float64  `json:"price" binding:"required,min=0" validate:"min=0"`
    IsAvailable *bool    `json:"is_available"`
}

type BengkelServiceCreateRequest struct {
    Services []BengkelServiceItem `json:"services" binding:"required,min=1,max=20" validate:"dive"`
}

type BengkelServiceUpdateRequest struct {
    Services []BengkelServiceItem `json:"services" binding:"required,min=1,max=50" validate:"dive"`
}
```

---

## Handler Logic Enhancements

### Key Improvements
1. **Dual format support**: 
   - New detailed format for comprehensive service management
   - Legacy format for backward compatibility

2. **ID-based operations**: 
   - `id = 0` or not provided → Create new service
   - `id > 0` → Update existing service

3. **Null handling for is_available**:
   - `true` → Service is available
   - `false` → Service is unavailable
   - `null` → Use default (true for new, unchanged for updates)

4. **Price validation**:
   - Must be non-negative decimal number
   - Supports up to 2 decimal places

### Handler Code Structure
```go
// Try new format first
var requestDataBengkelServiceV2 validator.BengkelServiceCreateRequest
err = c.ShouldBindJSON(&requestDataBengkelServiceV2)

if err == nil {
    // Handle new detailed format
    for _, serviceItem := range requestDataBengkelServiceV2.Services {
        // Set defaults and create/update service
    }
} else {
    // Fallback to legacy format
    var requestDataBengkelService validator.BengkelServiceRequest
    // Handle legacy format
}
```

---

## Repository Enhancements

### New Methods Added
```go
// Update service by service ID (not bengkel ID)
UpdateBengkelService(serviceId uint, bengkelService *models.BengkelService) error

// Get service by service ID
GetBengkelServiceByServiceId(serviceId uint) (*models.BengkelService, error)
```

### Method Distinction
- `UpdateBengkelServiceById`: Updates by bengkel ID (affects all services)
- `UpdateBengkelService`: Updates specific service by service ID

---

## API Endpoints

### Create Services
- **Endpoint**: `POST /api/v1/bengkels/service`
- **Supports**: Both legacy and new formats
- **Authentication**: Mitra JWT required

### Update Services
- **Endpoint**: `PATCH /api/v1/bengkels/service`
- **Supports**: New format only (with ID-based operations)
- **Authentication**: Mitra JWT required

---

## Benefits of Enhancements

### 1. **Comprehensive Service Information**
- Detailed descriptions help users understand services
- Pricing transparency improves user experience
- Availability control provides operational flexibility

### 2. **Better Business Management**
- Individual service pricing control
- Ability to temporarily disable services
- Detailed service catalog management

### 3. **Enhanced User Experience**
- Clear service descriptions and pricing
- Better service selection interface
- Transparent cost information

### 4. **Operational Flexibility**
- Services can be disabled without deletion
- Price adjustments without recreating services
- Seasonal or promotional service management

---

## Usage Examples

### Example 1: Create Services with Full Details
```json
{
  "services": [
    {
      "nama_service": "Ganti Oli Mesin",
      "description": "Penggantian oli mesin dengan oli berkualitas tinggi SAE 10W-40 termasuk filter oli",
      "price": 120000,
      "is_available": true
    },
    {
      "nama_service": "Tune Up Complete",
      "description": "Pemeriksaan menyeluruh sistem mesin, pembersihan injector, dan penyetelan",
      "price": 250000,
      "is_available": true
    }
  ]
}
```

### Example 2: Update Service Pricing
```json
{
  "services": [
    {
      "id": 1,
      "nama_service": "Ganti Oli Mesin",
      "description": "Penggantian oli mesin dengan oli berkualitas tinggi SAE 10W-40 termasuk filter oli",
      "price": 135000,
      "is_available": true
    }
  ]
}
```

### Example 3: Disable Service Temporarily
```json
{
  "services": [
    {
      "id": 3,
      "nama_service": "Service AC",
      "description": "Pembersihan dan isi freon AC mobil",
      "price": 150000,
      "is_available": false
    }
  ]
}
```

### Example 4: Mixed Operations (Update + Create)
```json
{
  "services": [
    {
      "id": 1,
      "nama_service": "Ganti Oli Premium",
      "description": "Oli full synthetic 5W-30 + filter premium",
      "price": 200000,
      "is_available": true
    },
    {
      "id": 0,
      "nama_service": "Balancing Roda",
      "description": "Penyeimbangan roda untuk kenyamanan berkendara",
      "price": 50000,
      "is_available": true
    }
  ]
}
```

---

## Migration Guide

### For Frontend Developers
1. **Update service creation**: Use new detailed format for better UX
2. **Handle pricing**: Display service prices to users
3. **Manage availability**: Show only available services in selection
4. **Service descriptions**: Display detailed service information

### For Backend Developers
1. **Run migration script**: Add new database columns
2. **Update models**: Use enhanced BengkelService structure
3. **Test endpoints**: Verify both create and update operations
4. **Handle legacy data**: Ensure existing services work with new fields

### For Database Administrators
1. **Backup database**: Before running migration
2. **Run migration script**: Add new columns and indexes
3. **Verify data integrity**: Check existing records have default values
4. **Monitor performance**: New indexes should improve query performance

---

## Testing Scenarios

### 1. **Create Services with New Format**
- Send detailed service information
- Verify all fields are saved correctly
- Check default values for optional fields

### 2. **Legacy Format Compatibility**
- Send old format request
- Verify services are created with defaults
- Check backward compatibility

### 3. **Update Existing Services**
- Update service with existing ID
- Verify only specified service is updated
- Check price and availability changes

### 4. **Service Availability Control**
- Set `is_available: false`
- Verify service appears as unavailable
- Test null value handling

### 5. **Price Validation**
- Test negative prices (should fail)
- Test decimal precision
- Verify price formatting

---

## Future Enhancements

### Potential Improvements
1. **Service categories**: Group services by type
2. **Duration estimates**: Add estimated service time
3. **Service packages**: Bundle multiple services
4. **Seasonal pricing**: Dynamic pricing based on demand
5. **Service ratings**: Customer feedback on specific services

### API Versioning
- Current changes maintain backward compatibility
- Future breaking changes should use API versioning
- Consider deprecation timeline for legacy format

---

## Conclusion

The bengkel service enhancements provide comprehensive service management capabilities while maintaining backward compatibility. The new features enable better business operations, improved user experience, and flexible service catalog management.

These changes establish a solid foundation for advanced service management features while solving current limitations in service information and pricing transparency.