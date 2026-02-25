# Product Management System - Setup Guide

## Overview
The Product Management System is a comprehensive inventory management interface for managing:
- **Bottle Sizes**: Create and manage different bottle size specifications
- **Bottles**: Create and manage bottles with specific properties
- **Caps**: Create and manage caps with compatibility specifications
- **Products**: Create and manage final products by combining bottles and caps

## Features

### 1. Bottle Sizes Management
- Create new bottle sizes with ML capacity and labels
- Edit existing bottle sizes
- Delete bottle sizes
- List all bottle sizes with pagination
- Validation: Size must be between 100-20000 ML

### 2. Bottles Management
- Create bottles with specific specifications:
  - Bottle type (e.g., "Glass", "Plastic")
  - Neck size in MM (18-100 MM)
  - Thread type (400, 410, 415, 425, 450)
  - Stock quantity
  - Associated bottle size
- Edit and delete bottles
- List all bottles with pagination
- View compatible caps for each bottle

### 3. Caps Management
- Create caps with specifications:
  - Neck size in MM
  - Thread type compatibility
  - Cap type
  - Material (plastic, metal, silicone)
  - Optional color
  - Stock quantity
- Edit and delete caps
- List all caps with pagination

### 4. Products Management
- Create products by combining:
  - Product name
  - Bottle selection
  - Cap selection
  - Quantity
  - MRP (Price)
- Automatic compatibility checking:
  - Validates neck size compatibility
  - Validates thread type compatibility
  - Prevents incompatible combinations
- Stock management:
  - Automatically deducts stock when creating products
  - Shows available stock for bottles and caps
- Edit and delete products
- List all products with pagination

## File Structure

```
src/
├── lib/
│   └── api/
│       └── productService.ts          # API service layer
├── components/
│   └── products/
│       ├── ProductManagement.tsx      # Main management component
│       ├── BottleSizeForm.tsx        # Bottle size form modal
│       ├── BottleForm.tsx            # Bottle form modal
│       ├── CapForm.tsx               # Cap form modal
│       └── ProductForm.tsx           # Product form modal
└── app/
    └── (protected)/
        └── inventory/
            └── page.tsx              # Inventory page
```

## API Integration

The system integrates with the following backend API endpoints:

### Bottle Sizes
- `GET /api/bottle-sizes` - Get all bottle sizes
- `GET /api/bottle-sizes/:id` - Get specific bottle size
- `POST /api/bottle-sizes` - Create bottle size
- `PUT /api/bottle-sizes/:id` - Update bottle size
- `DELETE /api/bottle-sizes/:id` - Delete bottle size

### Bottles
- `GET /api/bottles` - Get all bottles
- `GET /api/bottles/:id` - Get specific bottle
- `GET /api/bottles/:id/compatible-caps` - Get compatible caps
- `POST /api/bottles` - Create bottle
- `PUT /api/bottles/:id` - Update bottle
- `DELETE /api/bottles/:id` - Delete bottle

### Caps
- `GET /api/caps` - Get all caps
- `GET /api/caps/:id` - Get specific cap
- `POST /api/caps` - Create cap
- `PUT /api/caps/:id` - Update cap
- `DELETE /api/caps/:id` - Delete cap

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/check-compatibility` - Check bottle/cap compatibility

## Usage

### Accessing the Product Management System

1. Navigate to the sidebar menu
2. Select "Inventory" → "Product Management"
3. This will open the Product Management interface with 4 tabs

### Creating a Product (Step-by-Step)

1. **Create Bottle Size** (if not exists)
   - Go to "Bottle Sizes" tab
   - Click "Add Bottle Size"
   - Enter size in ML (100-20000)
   - Enter size label (e.g., "500ML Bottle")
   - Click "Create"

2. **Create Bottle**
   - Go to "Bottles" tab
   - Click "Add Bottle"
   - Select a bottle size
   - Enter bottle type
   - Enter neck size in MM
   - Select thread type
   - Enter stock quantity
   - Click "Create"

3. **Create Cap**
   - Go to "Caps" tab
   - Click "Add Cap"
   - Enter neck size in MM (must match bottle for compatibility)
   - Select thread type (must match bottle)
   - Enter cap type
   - Optionally enter color
   - Select material
   - Enter stock quantity
   - Click "Create"

4. **Create Product**
   - Go to "Products" tab
   - Click "Add Product"
   - Enter product name
   - Select a bottle
   - Select a cap (system checks compatibility)
   - If incompatible, an error message will appear
   - Enter quantity to produce
   - Enter MRP (selling price)
   - Click "Create"

## Validation Rules

### Bottle Sizes
- Size ML: 100-20000
- Size Label: 1-50 characters

### Bottles
- Size ID: Required
- Bottle Type: 1-50 characters
- Neck Size MM: 18-100
- Thread Type: One of [400, 410, 415, 425, 450]
- Stock: Non-negative integer

### Caps
- Neck Size MM: 18-100
- Thread Type: One of [400, 410, 415, 425, 450]
- Cap Type: 1-50 characters
- Color: Optional, max 30 characters
- Material: One of [plastic, metal, silicone]
- Stock: Non-negative integer

### Products
- Product Name: 1-255 characters
- Bottle ID: Required
- Cap ID: Required
- Quantity: Minimum 1
- MRP: Non-negative float
- Compatibility: Bottle and Cap must have matching neck finish

## Error Handling

The system includes comprehensive error handling:
- Network errors are displayed with user-friendly messages
- Validation errors are shown per field
- Compatibility errors prevent product creation
- Stock availability is checked before product creation
- Database transaction failures are handled gracefully

## Authentication

All API calls require authentication token stored in localStorage:
```
Authorization: Bearer {token}
```

The token is automatically included in all requests via the `productService.ts` API layer.

## Pagination

All list views support pagination:
- Default page size: 10 items
- Maximum page size: 100 items
- Navigation using pagination controls

## State Management

The component uses React hooks for state management:
- `useState` for local state
- `useEffect` for data loading
- Formik for form state management
- Yup for form validation

## Dependencies

- Material-UI (MUI) for UI components
- Formik for form management
- Yup for validation schema
- React for UI framework
- Next.js for routing

## Environment Variables

The API base URL is configured via:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

If not set, defaults to `http://localhost:3000/api`

## Performance Considerations

- Pagination limits API calls and reduces memory usage
- Form validation happens on client-side before submission
- API requests include proper error boundaries
- Loading states prevent double submissions
- Modal dialogs prevent page navigation during operations

## Future Enhancements

Potential improvements for the system:
- Bulk operations (import/export)
- Advanced filtering and search
- Stock alerts and notifications
- Product variants and SKUs
- Barcode scanning integration
- Production batch tracking
- Stock history and analytics
- Multi-location inventory support

## Troubleshooting

### API Connection Issues
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend server is running
- Verify CORS configuration on backend

### Token Expiration
- Token stored in localStorage is used for all requests
- If requests fail with 401, user needs to re-login

### Compatibility Not Showing
- Ensure bottle and cap have same neck size MM
- Ensure bottle and cap have same thread type
- Wait for compatibility check to complete (indicated by loading state)

### Stock Issues
- Verify bottle and cap have sufficient stock
- Check if stock was already deducted by other processes
- Use Stock Adjustment to correct inventory

## Support

For issues or questions about the Product Management System, please contact the development team or refer to the backend API documentation.
