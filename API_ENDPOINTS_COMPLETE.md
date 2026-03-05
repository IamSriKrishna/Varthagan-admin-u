# Complete API Endpoints Documentation

**Last Updated: March 4, 2026**

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## VENDOR ENDPOINTS

### 1. Create Vendor
**Method**: POST  
**Endpoint**: `/auth/manage/vendors`  
**Authentication**: Required  

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Request Body**:
```json
{
  "salutation": "Mr.",
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "display_name": "AquaPlast Industries",
  "email_address": "rajesh.kumar@aquaplast.com",
  "work_phone": "08041234567",
  "work_phone_code": "+91",
  "mobile": "9876543210",
  "mobile_code": "+91",
  "vendor_language": "English",
  "other_details": {
    "pan": "BBCDE1234H",
    "is_msme_registered": true,
    "currency": "INR",
    "payment_terms": "Net 45",
    "tds": "2%",
    "enable_portal": true,
    "website_url": "https://www.aquaplast.com",
    "department": "Sales",
    "designation": "Regional Manager"
  },
  "billing_address": {
    "attention": "Accounts Department",
    "street": "123 Industrial Estate",
    "address_line2": "Block A",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560001",
    "phone": "08041234567",
    "phone_code": "+91"
  },
  "shipping_address": {
    "attention": "Warehouse Manager",
    "street": "123 Industrial Estate",
    "address_line2": "Block A, Warehouse 1",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560001",
    "phone": "08041234567"
  },
  "contact_persons": [
    {
      "salutation": "Mr.",
      "first_name": "Suresh",
      "last_name": "Singh",
      "email_address": "suresh.singh@aquaplast.com",
      "mobile": "9876543211"
    }
  ],
  "bank_details": [
    {
      "bank_id": 1,
      "account_holder_name": "AquaPlast Industries Pvt Ltd",
      "account_number": "1234567890123456",
      "reenter_account_number": "1234567890123456"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "id": 1,
    "salutation": "Mr.",
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "display_name": "AquaPlast Industries",
    "email_address": "rajesh.kumar@aquaplast.com",
    "work_phone": "08041234567",
    "work_phone_code": "+91",
    "mobile": "9876543210",
    "mobile_code": "+91",
    "vendor_language": "English",
    "gstin": null,
    "user": {
      "id": 9,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@company.com"
    },
    "company": {
      "id": 3,
      "name": "Main Company",
      "company_code": "MC001"
    },
    "created_at": "2026-03-04T15:30:45.123+05:30",
    "updated_at": "2026-03-04T15:30:45.123+05:30",
    "other_details": { ... },
    "billing_address": { ... },
    "shipping_address": { ... },
    "contact_persons": [ ... ],
    "bank_details": [ ... ]
  }
}
```

**Service Usage**:
```typescript
import { vendorService } from '@/services/vendorService';

const response = await vendorService.createVendor({
  first_name: 'Rajesh',
  display_name: 'AquaPlast Industries',
  mobile: '9876543210',
  // ... other fields
});
```

---

### 2. Get All Vendors
**Method**: GET  
**Endpoint**: `/auth/manage/vendors?page=1&limit=10&search=`  
**Authentication**: Required  
**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search keyword

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": [
    {
      "id": 1,
      "salutation": "Mr.",
      "first_name": "Rajesh",
      "last_name": "Kumar",
      "display_name": "AquaPlast Industries",
      "email_address": "rajesh.kumar@aquaplast.com",
      "work_phone": "08041234567",
      "mobile": "9876543210",
      "vendor_language": "English",
      "user": { ... },
      "company": { ... },
      "created_at": "2026-03-04T15:30:45.123+05:30",
      "updated_at": "2026-03-04T15:30:45.123+05:30"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Service Usage**:
```typescript
const response = await vendorService.getVendors(1, 10, 'search_term');
```

---

### 3. Get Vendor by ID
**Method**: GET  
**Endpoint**: `/auth/manage/vendors/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Vendor ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Vendor retrieved successfully",
  "data": {
    "id": 1,
    "salutation": "Mr.",
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "display_name": "AquaPlast Industries",
    "email_address": "rajesh.kumar@aquaplast.com",
    "work_phone": "08041234567",
    "mobile": "9876543210",
    "vendor_language": "English",
    "gstin": null,
    "user": { ... },
    "company": { ... },
    "created_at": "2026-03-04T15:30:45.123+05:30",
    "updated_at": "2026-03-04T15:30:45.123+05:30",
    "other_details": { ... },
    "billing_address": { ... },
    "shipping_address": { ... },
    "contact_persons": [ ... ],
    "bank_details": [ ... ]
  }
}
```

**Service Usage**:
```typescript
const response = await vendorService.getVendor(1);
```

---

### 4. Update Vendor
**Method**: PUT  
**Endpoint**: `/auth/manage/vendors/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Vendor ID

**Request Body** (Partial update - send only fields to update):
```json
{
  "display_name": "AquaPlast Industries Updated",
  "email_address": "rajesh.kumar.updated@aquaplast.com",
  "mobile": "9876543215",
  "vendor_language": "Hindi",
  "other_details": {
    "pan": "BBCDE1234H",
    "currency": "USD",
    "payment_terms": "Net 60",
    "enable_portal": false
  },
  "billing_address": {
    "attention": "Billing Department",
    "street": "456 Industrial Estate",
    "address_line2": "Block B",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560002",
    "phone": "08041234570",
    "phone_code": "+91"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Vendor updated successfully",
  "data": { ... updated vendor data ... }
}
```

**Service Usage**:
```typescript
const response = await vendorService.updateVendor(1, {
  display_name: 'Updated Name',
  mobile: '9876543215'
});
```

---

### 5. Delete Vendor
**Method**: DELETE  
**Endpoint**: `/auth/manage/vendors/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Vendor ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Vendor deleted successfully",
  "data": null
}
```

**Service Usage**:
```typescript
await vendorService.deleteVendor(1);
```

---

## CUSTOMER ENDPOINTS

### 1. Create Customer
**Method**: POST  
**Endpoint**: `/auth/manage/customers`  
**Authentication**: Required  

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Request Body**:
```json
{
  "customer_type": "Business",
  "salutation": "Mr.",
  "first_name": "Amit",
  "last_name": "Singh",
  "display_name": "Fresh Water Retail",
  "email_address": "amit.singh@freshwaterretail.com",
  "work_phone": "08041234500",
  "work_phone_code": "+91",
  "mobile": "9876543200",
  "mobile_code": "+91",
  "customer_language": "English",
  "other_details": {
    "pan": "BBCDE1234H",
    "currency": "INR",
    "payment_terms": "Net 30",
    "enable_portal": true
  },
  "billing_address": {
    "attention": "Finance Department",
    "street": "456 Market Street",
    "address_line2": "Building B",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560002",
    "phone": "08041234500",
    "phone_code": "+91"
  },
  "shipping_address": {
    "attention": "Store Manager",
    "street": "789 Retail Plaza",
    "address_line2": "Store 1",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560003",
    "phone": "08041234501"
  },
  "contact_persons": [
    {
      "salutation": "Mr.",
      "first_name": "Pradeep",
      "last_name": "Sharma",
      "email_address": "pradeep.sharma@freshwaterretail.com",
      "mobile": "9876543201"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 1,
    "customer_type": "Business",
    "salutation": "Mr.",
    "first_name": "Amit",
    "last_name": "Singh",
    "display_name": "Fresh Water Retail",
    "email_address": "amit.singh@freshwaterretail.com",
    "work_phone": "08041234500",
    "mobile": "9876543200",
    "customer_language": "English",
    "user": { ... },
    "company": { ... },
    "created_at": "2026-03-04T16:00:30.456+05:30",
    "updated_at": "2026-03-04T16:00:30.456+05:30",
    "other_details": { ... },
    "billing_address": { ... },
    "shipping_address": { ... },
    "contact_persons": [ ... ]
  }
}
```

**Service Usage**:
```typescript
import { customerService } from '@/services/customerService';

const response = await customerService.createCustomer({
  customer_type: 'Business',
  first_name: 'Amit',
  display_name: 'Fresh Water Retail',
  mobile: '9876543200',
  // ... other fields
});
```

---

### 2. Get All Customers
**Method**: GET  
**Endpoint**: `/auth/manage/customers?page=1&limit=10&search=`  
**Authentication**: Required  
**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search keyword

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": 1,
      "customer_type": "Business",
      "salutation": "Mr.",
      "first_name": "Amit",
      "last_name": "Singh",
      "display_name": "Fresh Water Retail",
      "email_address": "amit.singh@freshwaterretail.com",
      "mobile": "9876543200",
      "customer_language": "English",
      "user": { ... },
      "company": { ... },
      "created_at": "2026-03-04T16:00:30.456+05:30",
      "updated_at": "2026-03-04T16:00:30.456+05:30"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

**Service Usage**:
```typescript
const response = await customerService.getCustomers(1, 10, 'search_term');
```

---

### 3. Get Customer by ID
**Method**: GET  
**Endpoint**: `/auth/manage/customers/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Customer ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": 1,
    "customer_type": "Business",
    "salutation": "Mr.",
    "first_name": "Amit",
    "last_name": "Singh",
    "display_name": "Fresh Water Retail",
    "email_address": "amit.singh@freshwaterretail.com",
    "work_phone": "08041234500",
    "mobile": "9876543200",
    "customer_language": "English",
    "user": { ... },
    "company": { ... },
    "created_at": "2026-03-04T16:00:30.456+05:30",
    "updated_at": "2026-03-04T16:00:30.456+05:30",
    "other_details": { ... },
    "billing_address": { ... },
    "shipping_address": { ... },
    "contact_persons": [ ... ]
  }
}
```

**Service Usage**:
```typescript
const response = await customerService.getCustomer(1);
```

---

### 4. Update Customer
**Method**: PUT  
**Endpoint**: `/auth/manage/customers/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Customer ID

**Request Body** (Partial update - send only fields to update):
```json
{
  "display_name": "Fresh Water Retail Premium",
  "email_address": "amit.singh.updated@freshwaterretail.com",
  "mobile": "9876543205",
  "customer_language": "Hindi",
  "other_details": {
    "pan": "BBCDE1234H",
    "currency": "USD",
    "payment_terms": "Net 45",
    "enable_portal": true
  },
  "shipping_address": {
    "attention": "Premium Store Manager",
    "street": "999 Premium Retail Plaza",
    "address_line2": "Premium Store 1",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "postal_code": "560004",
    "phone": "08041234502"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": { ... updated customer data ... }
}
```

**Service Usage**:
```typescript
const response = await customerService.updateCustomer(1, {
  display_name: 'Updated Name',
  mobile: '9876543205'
});
```

---

### 5. Delete Customer
**Method**: DELETE  
**Endpoint**: `/auth/manage/customers/:id`  
**Authentication**: Required  
**Parameters**:
- `:id` (required) - Customer ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": null
}
```

**Service Usage**:
```typescript
await customerService.deleteCustomer(1);
```

---

## Error Response Format

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "first_name": "First name is required",
    "email_address": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization required",
  "code": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Vendor not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Important Notes

### Authentication
- All endpoints require valid JWT token
- Token must be passed in `Authorization: Bearer {JWT_TOKEN}` header
- If token is invalid or expired, API returns 401 Unauthorized

### Company & User Context
- `user_id` and `company_id` are automatically set from JWT token
- DO NOT send these in request body
- Company information is automatically fetched from user's profile

### Nested Objects
- All nested objects (other_details, addresses, contact_persons, bank_details) are optional
- Can be updated independently
- Empty arrays and objects are handled gracefully

### Pagination
- Default page: 1
- Default limit: 10
- Limit should not exceed 100
- Response includes total count and page information

### Search
- Search works across display_name, email_address, and phone fields
- Case-insensitive search
- Partial matching supported

### Field Requirements
**Vendor Required Fields**:
- first_name
- display_name
- mobile

**Customer Required Fields**:
- customer_type (Business/Individual)
- first_name
- display_name
- mobile

---

## cURL Examples

### Create Vendor
```bash
curl -X POST http://localhost:3000/auth/manage/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Rajesh",
    "display_name": "AquaPlast Industries",
    "mobile": "9876543210"
  }'
```

### Get All Vendors
```bash
curl -X GET "http://localhost:3000/auth/manage/vendors?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Single Vendor
```bash
curl -X GET http://localhost:3000/auth/manage/vendors/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Vendor
```bash
curl -X PUT http://localhost:3000/auth/manage/vendors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "display_name": "Updated Name",
    "mobile": "9876543215"
  }'
```

### Delete Vendor
```bash
curl -X DELETE http://localhost:3000/auth/manage/vendors/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Service Integration

### In Components
```typescript
import { vendorService } from '@/services/vendorService';
import { customerService } from '@/services/customerService';

// Create vendor
try {
  const response = await vendorService.createVendor(vendorData);
  console.log('Vendor created:', response.data);
} catch (error) {
  console.error('Error creating vendor:', error);
}

// Get vendors list
try {
  const response = await vendorService.getVendors(1, 10);
  console.log('Vendors:', response.data);
  console.log('Total:', response.pagination.total);
} catch (error) {
  console.error('Error fetching vendors:', error);
}

// Get single vendor
try {
  const response = await vendorService.getVendor(1);
  console.log('Vendor:', response.data);
} catch (error) {
  console.error('Error fetching vendor:', error);
}

// Update vendor
try {
  const response = await vendorService.updateVendor(1, updateData);
  console.log('Vendor updated:', response.data);
} catch (error) {
  console.error('Error updating vendor:', error);
}

// Delete vendor
try {
  await vendorService.deleteVendor(1);
  console.log('Vendor deleted');
} catch (error) {
  console.error('Error deleting vendor:', error);
}
```

---

Generated: March 4, 2026  
Complete API Endpoints with Service Integration Guide
