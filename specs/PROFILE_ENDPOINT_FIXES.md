# Profile Endpoint Fixes - Complete Solution

## Problem Identified

Multiple pages were hardcoded to call `/users/profile` endpoint regardless of user type, causing **401 Unauthorized errors** for mitra users who should be calling `/mitras/profile`.

## Root Cause

Several pages were directly calling `apiService.getUserProfile()` without checking if the current user is a regular user or a mitra:

### Affected Pages:
1. **ProfilePage.tsx** - Profile management page
2. **AddressesPage.tsx** - Address management page  
3. **VehiclesPage.tsx** - Vehicle management page
4. **BookingPage.tsx** - Booking/order page
5. **BengkelManagementPage.tsx** - Bengkel management page

## Error Pattern

**Network Requests Showing:**
```
❌ GET /api/v1/users/profile → 401 Unauthorized (for mitra users)
```

**Should Be:**
```
✅ GET /api/v1/users/profile (for regular users)
✅ GET /api/v1/mitras/profile (for mitra users)
```

## Complete Fix Applied

### 1. **ProfilePage.tsx**
**Problem:** Hardcoded `getUserProfile()` calls in two places

**Fixed:**
```typescript
// Before
const response = await apiService.getUserProfile();

// After
let response;
if (userType === 'users') {
  response = await apiService.getUserProfile();
} else {
  response = await apiService.getMitraProfile();
}
```

**Changes Made:**
- Added `mitra, userType` to useAuth destructuring
- Fixed `handleEditClick()` function
- Fixed profile check in form submission
- Added fallback data for both user types

### 2. **AddressesPage.tsx**
**Problem:** Hardcoded `getUserProfile()` call

**Fixed:**
```typescript
// Added useAuth import
import { useAuth } from '../hooks/useAuth';

// Added userType to component
const { userType } = useAuth();

// Fixed loadAddresses function
let response;
if (userType === 'users') {
  response = await apiService.getUserProfile();
} else {
  response = await apiService.getMitraProfile();
}
```

### 3. **VehiclesPage.tsx**
**Problem:** Hardcoded `getUserProfile()` call

**Fixed:**
```typescript
// Added useAuth import
import { useAuth } from '../hooks/useAuth';

// Added userType to component
const { userType } = useAuth();

// Fixed loadVehicles function
let response;
if (userType === 'users') {
  response = await apiService.getUserProfile();
} else {
  response = await apiService.getMitraProfile();
}
```

### 4. **BookingPage.tsx**
**Problem:** Hardcoded `getUserProfile()` call

**Fixed:**
```typescript
// Updated useAuth destructuring
const { user, userType } = useAuth();

// Fixed loadBookingData function
let profileResponse;
if (userType === 'users') {
  profileResponse = await apiService.getUserProfile();
} else {
  profileResponse = await apiService.getMitraProfile();
}
```

### 5. **BengkelManagementPage.tsx**
**Problem:** Wrong API call and data structure handling

**Fixed:**
```typescript
// Changed from getBengkelProfile() to getMitraProfile()
const mitraResponse = await apiService.getMitraProfile();

// Extract bengkel data from mitra.bengkel array
if (mitraData.bengkel && mitraData.bengkel.length > 0) {
  const bengkelData = mitraData.bengkel[0];
  setBengkel(bengkelData);
}
```

## API Endpoint Mapping

| User Type | Profile Endpoint | Data Structure |
|-----------|------------------|----------------|
| `users` | `GET /api/v1/users/profile` | Direct user data |
| `mitras` | `GET /api/v1/mitras/profile` | Mitra data with bengkel array |

## Data Structure Differences

### User Profile Response:
```json
{
  "success": true,
  "data": {
    "user_id": "...",
    "first_name": "...",
    "addresses": [...],
    "vehicles": [...]
  }
}
```

### Mitra Profile Response:
```json
{
  "success": true,
  "data": {
    "mitra_id": "...",
    "first_name": "...",
    "bengkel": [
      {
        "bengkel_id": "...",
        "bengkel_name": "...",
        "addresses": [...],
        "services": [...]
      }
    ]
  }
}
```

## Testing Scenarios

### 1. **Regular User Login**
1. Login as regular user
2. Navigate to Profile, Addresses, Vehicles pages
3. Should call `GET /api/v1/users/profile`
4. Should load data correctly

### 2. **Mitra User Login**
1. Login as mitra
2. Navigate to Profile, My Bengkel pages
3. Should call `GET /api/v1/mitras/profile`
4. Should load data correctly

### 3. **Error Handling**
1. Network failures should show appropriate errors
2. No more 401 Unauthorized errors for correct user types
3. Graceful fallbacks when profile data is missing

## Benefits of the Fix

1. **✅ No More 401 Errors:** Correct endpoints called for each user type
2. **✅ Proper Data Loading:** All pages now load data correctly
3. **✅ Type Safety:** Proper TypeScript support for both user types
4. **✅ Consistent Behavior:** All pages follow the same pattern
5. **✅ Better UX:** Users see their actual data instead of errors

## Code Pattern Established

For any future pages that need profile data:

```typescript
import { useAuth } from '../hooks/useAuth';

const MyPage: React.FC = () => {
  const { userType } = useAuth();
  
  const loadData = async () => {
    let response;
    if (userType === 'users') {
      response = await apiService.getUserProfile();
    } else {
      response = await apiService.getMitraProfile();
    }
    
    if (response.success && response.data) {
      // Handle data...
    }
  };
};
```

## Network Tab Verification

After the fix, the browser's Network tab should show:

**For Regular Users:**
- ✅ `GET /api/v1/users/profile` → 200 OK

**For Mitra Users:**
- ✅ `GET /api/v1/mitras/profile` → 200 OK

No more 401 Unauthorized errors for profile-related requests!

The mitra profile page should now load correctly without any authentication errors.