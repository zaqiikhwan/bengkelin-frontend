# Profile Edit Modal - Mitra Bank Fields Implementation

## Issue
The edit profile modal was showing the same fields for both users and mitras, including irrelevant address fields for mitras. Mitras needed bank information fields instead of address fields.

## Solution

### 1. **Updated Form Data Interface**
Added bank fields to the ProfileFormData interface:

```typescript
interface ProfileFormData extends UserUpdateRequest {
  // Address fields for users only
  latitude?: number;
  longitude?: number;
  address_label?: string;
  full_address?: string;
  note?: string;
  // Bank fields for mitras only
  bank_name?: string;
  bank_number?: string;
}
```

### 2. **Dynamic Form Initialization**
Updated form state to include bank information for mitras:

```typescript
const [formData, setFormData] = useState<ProfileFormData>({
  first_name: currentProfile?.first_name || '',
  last_name: currentProfile?.last_name || '',
  phone_number: currentProfile?.phone_number || '',
  // User-specific fields
  latitude: 0,
  longitude: 0,
  address_label: '',
  full_address: '',
  note: '',
  // Mitra-specific fields
  bank_name: userType === 'mitras' && mitra ? mitra.bank_name || '' : '',
  bank_number: userType === 'mitras' && mitra ? mitra.bank_number || '' : ''
});
```

### 3. **Conditional Form Fields**
Updated the edit modal to show different fields based on user type:

#### **For Mitras:**
- ✅ First Name
- ✅ Last Name  
- ✅ Phone Number
- ✅ Bank Name
- ✅ Bank Account Number
- ❌ Address fields (removed)

#### **For Users:**
- ✅ First Name
- ✅ Last Name
- ✅ Phone Number
- ✅ Address Label
- ✅ Full Address
- ✅ Latitude/Longitude
- ✅ Note
- ❌ Bank fields (not shown)

### 4. **Bank Information Handling**
Added proper bank information update logic:

```typescript
// Handle bank information update for mitras
const bankData = {
  bank_name: formData.bank_name || '',
  bank_number: formData.bank_number || ''
};

// Update bank information if provided
if (bankData.bank_name && bankData.bank_number) {
  try {
    let bankResponse;
    
    // Check if mitra already has bank info
    const hasBankInfo = mitra?.bank_name && mitra?.bank_number;
    
    if (hasBankInfo) {
      // Update existing bank account
      bankResponse = await apiService.updateMitraBank(bankData);
    } else {
      // Create new bank account
      bankResponse = await apiService.addMitraBank(bankData);
    }
    
    if (!bankResponse.success) {
      console.warn('Bank update failed, but profile was updated:', bankResponse.message);
      additionalUpdateMessage = ' (Bank update failed)';
    }
  } catch (bankError) {
    console.warn('Bank update failed:', bankError);
    additionalUpdateMessage = ' (Bank update failed)';
  }
}
```

### 5. **Form Validation**
Added proper validation for bank account number:

```typescript
<input
  type="text"
  id="bank_number"
  name="bank_number"
  value={formData.bank_number || ''}
  onChange={handleInputChange}
  className="input-field"
  placeholder="Enter your bank account number"
  pattern="[0-9]{10,20}"
  title="Bank account number should be 10-20 digits"
/>
```

### 6. **API Endpoints Used**

#### **For Mitras:**
- `PATCH /api/v1/mitras/profile` - Update basic profile
- `POST /api/v1/mitras/bank` - Create bank account (if doesn't exist)
- `PATCH /api/v1/mitras/bank` - Update bank account (if exists)

#### **For Users:**
- `PATCH /api/v1/users/profile` - Update basic profile
- `POST /api/v1/users/address` - Create address
- `PATCH /api/v1/users/address/:id` - Update address

## Result

### **Mitra Edit Profile Modal:**
- ✅ Shows only relevant fields (name, phone, bank info)
- ✅ Removes unused address fields
- ✅ Properly handles bank account creation/update
- ✅ Uses correct mitra API endpoints
- ✅ Validates bank account number format

### **User Edit Profile Modal:**
- ✅ Shows user-specific fields (name, phone, address)
- ✅ Maintains existing address functionality
- ✅ Uses correct user API endpoints

## Files Modified
- `src/pages/ProfilePage.tsx` - Updated form fields and submission logic

## Testing

### **For Mitra Users:**
1. **Edit Profile** - Should show: First Name, Last Name, Phone, Bank Name, Bank Number
2. **Bank Info Update** - Should call appropriate bank endpoints
3. **No Address Fields** - Address fields should not be visible
4. **Validation** - Bank number should validate 10-20 digits

### **For Regular Users:**
1. **Edit Profile** - Should show: First Name, Last Name, Phone, Address fields
2. **Address Update** - Should call user address endpoints
3. **No Bank Fields** - Bank fields should not be visible

## Benefits
1. **Cleaner UI** - Only shows relevant fields for each user type
2. **Better UX** - Mitras can now manage their bank information
3. **Proper API Usage** - Uses correct endpoints for each user type
4. **Validation** - Proper validation for bank account numbers
5. **Maintainable** - Clear separation between user and mitra functionality

The edit profile modal now provides a tailored experience for each user type with appropriate fields and functionality.