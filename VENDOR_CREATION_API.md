# Vendor Creation API Implementation

## Overview
This document outlines the implementation of the Vendor Creation feature with complete API integration following the specification provided.

## API Endpoints

### Create Vendor
- **HTTP Method**: POST
- **Path**: `/vendors`
- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` environment variable

## Request Body Structure

### 1. Basic Information
- `salutation`: string (Mr, Mrs, Ms, Dr)
- `first_name`: string (required)
- `last_name`: string (required)
- `company_name`: string (required)
- `display_name`: string (required)
- `email_address`: string (required, valid email)
- `work_phone`: string (required)
- `work_phone_code`: string (e.g., "+91")
- `mobile`: string (required)
- `mobile_code`: string (e.g., "+91")
- `vendor_language`: string (defaults to "English")
- `gstin`: string (15-digit format)

### 2. Other Details
```typescript
{
  pan: string (PAN format: AAAAA9999A)
  is_msme_registered: boolean
  currency: string (e.g., "INR- Indian Rupee")
  payment_terms: string (e.g., "Due on Receipt")
  tds: string (e.g., "0%", "5%", "194C", etc.)
  enable_portal: boolean
  website_url: string (valid URL)
  department: string
  designation: string
  twitter: string
  skype_name: string
  facebook: string (URL)
}
```

### 3. Billing Address
```typescript
{
  attention: string
  address_line1: string (required)
  address_line2: string (optional)
  city: string (required)
  state: string (required)
  pin_code: string (required)
  country_region: string (required)
  phone: string
  phone_code: string
  fax_number: string (optional)
  address_type: "billing" (auto-set)
}
```

### 4. Shipping Address
```typescript
{
  attention: string
  address_line1: string
  address_line2: string (optional)
  city: string
  state: string
  pin_code: string
  country_region: string
  phone: string
  phone_code: string
  fax_number: string (optional)
  address_type: "shipping" (auto-set)
}
```

### 5. Contact Persons (Array)
```typescript
{
  salutation: string
  first_name: string (required)
  last_name: string (required)
  email_address: string (required, valid email)
  work_phone: string
  work_phone_code: string
  mobile: string (required)
  mobile_code: string
}
```

### 6. Bank Details (Array)
```typescript
{
  bank_id: number | string (required)
  account_holder_name: string (required)
  account_number: string (required)
  ifsc_code: string (optional)
  branch_name: string (optional)
  is_primary: boolean (optional, defaults to false)
  is_active: boolean (optional, defaults to true)
}
```

## Response Structure

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "id": 1,
    "salutation": "Mr",
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "company_name": "Premium Plastics Manufacturing",
    "display_name": "Premium Plastics Manufacturing",
    "email_address": "sales@premiumplastics.com",
    "work_phone": "08098765432",
    "work_phone_code": "+91",
    "mobile": "09876543212",
    "mobile_code": "+91",
    "vendor_language": "English",
    "gstin": "18AABCU1234H1Z0",
    "other_details": {
      "id": 1,
      "entity_id": 1,
      "entity_type": "vendor",
      "pan": "AABCU5055K",
      "is_msme_registered": true,
      "currency": "INR- Indian Rupee",
      "payment_terms": "Due on Receipt",
      "tds": "0%",
      "enable_portal": false,
      "website_url": "https://www.premiumplastics.com",
      "department": "Sales",
      "designation": "Sales Manager",
      "twitter": "@premiumplastics",
      "skype_name": "rajesh.kumar.premium",
      "facebook": "https://www.facebook.com/premiumplastics",
      "created_at": "2026-02-17T10:30:00.000+05:30",
      "updated_at": "2026-02-17T10:30:00.000+05:30"
    },
    "billing_address": {
      "id": 1,
      "entity_type": "vendor",
      "entity_id": 1,
      "attention": "Rajesh Kumar",
      "address_line1": "Factory Complex, Plot 123",
      "address_line2": "Industrial Area",
      "city": "Pune",
      "state": "Maharashtra",
      "pin_code": "411001",
      "country_region": "India",
      "phone": "08098765432",
      "phone_code": "+91",
      "fax_number": "08098765433",
      "address_type": "billing",
      "created_at": "2026-02-17T10:30:00.000+05:30",
      "updated_at": "2026-02-17T10:30:00.000+05:30"
    },
    "shipping_address": {
      "id": 2,
      "entity_type": "vendor",
      "entity_id": 1,
      "attention": "Logistics Team",
      "address_line1": "Warehouse, Plot 456",
      "address_line2": "Logistics Park",
      "city": "Pune",
      "state": "Maharashtra",
      "pin_code": "411002",
      "country_region": "India",
      "phone": "08098765434",
      "phone_code": "+91",
      "address_type": "shipping",
      "created_at": "2026-02-17T10:30:00.000+05:30",
      "updated_at": "2026-02-17T10:30:00.000+05:30"
    },
    "contact_persons": [
      {
        "id": 1,
        "entity_id": 1,
        "entity_type": "vendor",
        "salutation": "Mr",
        "first_name": "Ramesh",
        "last_name": "Singh",
        "email_address": "ramesh@premiumplastics.com",
        "work_phone": "08098765435",
        "work_phone_code": "+91",
        "mobile": "09876543213",
        "mobile_code": "+91",
        "created_at": "2026-02-17T10:30:00.000+05:30",
        "updated_at": "2026-02-17T10:30:00.000+05:30"
      }
    ],
    "bank_details": [
      {
        "id": 1,
        "vendor_id": 1,
        "bank_id": 1,
        "account_holder_name": "Premium Plastics Manufacturing Pvt Ltd",
        "account_number": "1234567890123456",
        "ifsc_code": "SBIN0000003",
        "branch_name": "Pune Main Branch",
        "is_primary": true,
        "is_active": true,
        "bank": {
          "id": 1,
          "bank_name": "State Bank of India"
        },
        "created_at": "2026-02-17T10:30:00.000+05:30",
        "updated_at": "2026-02-17T10:30:00.000+05:30"
      }
    ],
    "documents": [],
    "created_at": "2026-02-17T10:30:00.000+05:30",
    "updated_at": "2026-02-17T10:30:00.000+05:30"
  }
}
```

## Implementation Files

### 1. Type Definitions
**File**: `src/models/vendor.model.ts`
- Defines all TypeScript interfaces for vendor-related data
- Includes request/response types
- Provides proper typing for nested objects

### 2. Constants
**File**: `src/constants/vendor.constants.ts`
- `SALUTATION_OPTIONS`: Mr, Mrs, Ms, Dr
- `COUNTRY_OPTIONS`: India, USA, UK, UAE
- `CURRENCY_OPTIONS`: INR, USD, EUR, GBP
- `PAYMENT_TERMS_OPTIONS`: Various payment terms
- `TDS_OPTIONS`: Tax deduction options
- `LANGUAGE_OPTIONS`: Available languages
- `PHONE_CODE_OPTIONS`: Country codes
- `VENDOR_ENDPOINTS`: API endpoints configuration

### 3. Service Layer
**File**: `src/lib/api/vendorService.ts` (or `/src/services/vendorService.ts`)
- `createVendor(data: CreateVendorInput)`: Creates a new vendor
- `getVendors(page, limit, search)`: Retrieves vendor list
- `getVendor(id)`: Fetches a single vendor
- `updateVendor(id, data)`: Updates vendor information
- `deleteVendor(id)`: Deletes a vendor
- `searchVendors(query, page, limit)`: Searches vendors

### 4. React Hook
**File**: `src/hooks/useVendor.ts`
- Wraps vendor service with state management
- Handles loading and error states
- Provides callbacks: `createVendor`, `updateVendor`, `deleteVendor`, `getVendor`

### 5. Form Components
**File**: `src/components/vendors/`

#### VendorForm.tsx
- Main form container with tab-based navigation
- Manages form state and submission
- Handles validation and error display

#### VendorBasicInfo.tsx
- Salutation, first name, last name
- Company name, display name
- Email, work phone, mobile
- Language, GSTIN

#### VendorOtherDetails.tsx
- PAN, MSME registration
- Currency, payment terms, TDS
- Enable portal, website URL
- Department, designation
- Social media (Twitter, Skype, Facebook)

#### VendorAddress.tsx
- Billing address with all fields
- Shipping address with copy-from-billing option
- Phone code and contact information

#### VendorContactPersons.tsx
- Array of contact persons
- Add/remove contact person functionality
- Individual contact information fields

#### VendorBankDetails.tsx
- Array of bank accounts
- Bank name dropdown
- Account holder, account number
- IFSC code, branch name
- Primary and active status checkboxes

### 6. Utilities
**File**: `src/components/vendors/vendorForm.utils.ts`
- `initialVendorValues`: Default form values
- `transformVendorToPayload()`: Transforms form data to API format

**File**: `src/components/vendors/vendorForm.validation.ts`
- Yup validation schema
- Field-level validations
- Custom validators for GSTIN, PAN, URLs

## Form Validation Rules

| Field | Rule |
|-------|------|
| First Name | Required |
| Last Name | Required |
| Company Name | Required |
| Display Name | Required |
| Email | Required, valid email format |
| Work Phone | Required |
| Mobile | Required |
| GSTIN | 15-digit alphanumeric (optional) |
| PAN | 5 letters + 4 digits + 1 letter (optional) |
| Currency | Required |
| Payment Terms | Required |
| Billing Address Line 1 | Required |
| City | Required |
| State | Required |
| PIN Code | Required |
| Country | Required |
| Contact First Name | Required |
| Contact Last Name | Required |
| Contact Email | Required, valid email |
| Contact Mobile | Required |
| Bank Name | Required |
| Account Holder Name | Required |
| Account Number | Required |

## Default Values

### Currency
- `INR- Indian Rupee`

### Payment Terms
- `Due on Receipt`

### TDS
- `0%`

### Language
- `English`

### Phone Code
- `+91` (India)

### Country
- `India`

## Salutation Options
- `Mr`
- `Mrs`
- `Ms`
- `Dr`

## Usage Example

```typescript
import { useVendor } from '@/hooks/useVendor';
import { CreateVendorInput } from '@/models/vendor.model';

const { createVendor, loading, error } = useVendor();

const handleCreateVendor = async (formData: CreateVendorInput) => {
  try {
    const result = await createVendor(formData);
    console.log('Vendor created:', result);
  } catch (err) {
    console.error('Error creating vendor:', err);
  }
};
```

## Error Handling

The API returns validation errors in two formats:

### Format 1: Array of Errors
```json
{
  "success": false,
  "errors": [
    "Field validation error 1",
    "Field validation error 2"
  ]
}
```

### Format 2: Field-Specific Errors
```json
{
  "success": false,
  "field_errors": {
    "first_name": "First name is required",
    "email_address": "Invalid email format"
  }
}
```

### Format 3: General Message
```json
{
  "success": false,
  "message": "Error description"
}
```

## Integration Checklist

- [x] Type definitions updated for all nested objects
- [x] Constants configured with proper enum values
- [x] Service layer properly integrated
- [x] Form components updated with new fields
- [x] Validation schema covers all required fields
- [x] Address type auto-set during transformation
- [x] Bank details include IFSC code and branch name
- [x] Contact persons support multiple entries
- [x] Error handling implemented
- [x] Form state management in place
- [x] API endpoint configuration complete

## Testing Checklist

- [ ] Create vendor with all required fields
- [ ] Verify optional fields are handled correctly
- [ ] Test validation rules (PAN, GSTIN formats)
- [ ] Multiple contact persons can be added
- [ ] Multiple bank accounts can be added
- [ ] Shipping address copy-from-billing works
- [ ] Error messages display correctly
- [ ] Success message shows vendor details
- [ ] Form redirects to vendor list after creation
- [ ] Edit vendor returns pre-filled form data

## Notes

1. The `address_type` field is automatically set during form submission
2. The salutation format was updated from "Mr." to "Mr" to match API spec
3. Currency format includes a hyphen: "INR- Indian Rupee"
4. TDS now includes "0%" as default option in addition to section codes
5. Phone codes use the format "+91", "+1", etc.
6. All nested objects (addresses, contact persons, bank details) support arrays
7. The form uses a tab-based interface for better UX with large amounts of data
