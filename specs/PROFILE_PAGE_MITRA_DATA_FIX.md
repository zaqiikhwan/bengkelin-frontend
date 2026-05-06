# Profile Page Mitra Data Display Fix

## Issue
The Profile page was not displaying email and phone data for mitra users because it was only reading from the `user` object instead of checking the user type and using the appropriate data source.

## Root Cause
The ProfilePage component was hardcoded to display `user?.email` and `user?.phone_number`, but when a mitra is logged in, their data is stored in the `mitra` object from the useAuth hook.

## Solution

### 1. **Dynamic Profile Data Selection**
Added logic to select the correct profile data based on user type:

```typescript
// Get current profile data based on user type
const currentProfile = userType === 'users' ? user : mitra;
```

### 2. **Updated Display Logic**
Changed all profile data displays to use `currentProfile`:

**Before:**
```typescript
<p className="text-sm text-gray-500">{user?.email}</p>
<p className="text-sm text-gray-500">{user?.phone_number}</p>
```

**After:**
```typescript
<p className="text-sm text-gray-500">{currentProfile?.email}</p>
<p className="text-sm text-gray-500">{currentProfile?.phone_number}</p>
```

### 3. **Added Mitra-Specific Fields**
Added display of bank information for mitra users:

```typescript
{/* Show bank information for mitras */}
{userType === 'mitras' && mitra && (
  <>
    {mitra.bank_name && (
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 flex items-center justify-center">
          <span className="text-gray-400 text-sm">🏦</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Bank Name</p>
          <p className="text-sm text-gray-500">{mitra.bank_name}</p>
        </div>
      </div>
    )}
    {mitra.bank_number && (
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 flex items-center justify-center">
          <span className="text-gray-400 text-sm">#</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Bank Number</p>
          <p className="text-sm text-gray-500">{mitra.bank_number}</p>
        </div>
      </div>
    )}
  </>
)}
```

### 4. **Avatar Handling**
Fixed avatar display logic since mitras don't have personal avatars:

- **Users**: Can upload and view personal avatars
- **Mitras**: Show default avatar with note that avatar is managed via Bengkel Management

```typescript
{/* Avatar Upload Button - Only show for users, not mitras */}
{userType === 'users' && (
  <button onClick={handleAvatarClick}>
    {/* Avatar upload button */}
  </button>
)}
```

### 5. **Profile Update API Calls**
Updated profile update to use correct endpoints:

```typescript
// Update profile first
let profileResponse;
if (userType === 'users') {
  profileResponse = await apiService.updateUserProfile(profileData);
} else {
  profileResponse = await apiService.updateMitraProfile(profileData);
}
```

### 6. **Form Data Initialization**
Updated form initialization to use current profile data:

```typescript
const [formData, setFormData] = useState<ProfileFormData>({
  first_name: currentProfile?.first_name || '',
  last_name: currentProfile?.last_name || '',
  phone_number: currentProfile?.phone_number || '',
  // ... other fields
});
```

### 7. **TypeScript Fixes**
Fixed TypeScript errors related to `MitraInfo` not having `avatar_url` property:

- Used type guards to check user type before accessing avatar_url
- Added proper type casting for address data
- Removed unused imports

## Result

### **For Regular Users:**
- ✅ Email and phone display correctly
- ✅ Avatar upload/preview works
- ✅ Profile editing works with user endpoints

### **For Mitra Users:**
- ✅ Email and phone display correctly from mitra profile
- ✅ Bank name and bank number display when available
- ✅ Default avatar with appropriate messaging
- ✅ Profile editing works with mitra endpoints
- ✅ No TypeScript errors

## Files Modified
- `src/pages/ProfilePage.tsx` - Complete rewrite to support both user types

## API Endpoints Used
- **Users**: `GET /api/v1/users/profile`, `PATCH /api/v1/users/profile`
- **Mitras**: `GET /api/v1/mitras/profile`, `PATCH /api/v1/mitras/profile`

## Testing
1. **Login as regular user** - Email and phone should display correctly
2. **Login as mitra** - Email, phone, and bank info should display correctly
3. **Edit profile as user** - Should call user endpoints
4. **Edit profile as mitra** - Should call mitra endpoints
5. **Avatar functionality** - Should work for users, be disabled for mitras

The Profile page now correctly displays data for both user types and provides appropriate functionality based on the logged-in user type.