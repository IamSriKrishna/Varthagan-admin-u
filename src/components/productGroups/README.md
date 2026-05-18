# Product Group Selection Components

This directory contains reusable components for selecting and displaying product groups throughout the application.

## Components Overview

### 1. ProductGroupSelect
A simple Material-UI Select dropdown component for selecting product groups.

**Best for:**
- Simple dropdown selection
- Forms with limited space
- Direct product group ID selection

**Features:**
- Fetches product groups automatically
- Displays component count and selling price
- Shows loading state
- Displays groups as menu items with details

**Usage Example:**
```tsx
import ProductGroupSelect from "@/components/productGroups/ProductGroupSelect";

export default function MyComponent() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const handleProductGroupSelect = (productGroup) => {
    console.log("Selected product group:", productGroup);
    // Handle product group selection
  };

  return (
    <ProductGroupSelect
      value={selectedGroupId}
      onChange={setSelectedGroupId}
      label="Choose Product Group"
      required={true}
      onProductGroupSelect={handleProductGroupSelect}
    />
  );
}
```

**Props:**
- `value` (string | undefined): Currently selected product group ID
- `onChange` (function): Callback when selection changes
- `label` (string): Label for the select (default: "Product Group")
- `error` (boolean): Show error state
- `helperText` (string): Helper text below the select
- `disabled` (boolean): Disable the select
- `required` (boolean): Mark as required
- `size` (small | medium): Select size
- `fullWidth` (boolean): Fill parent width
- `onProductGroupSelect` (function): Callback with full product group data

---

### 2. ProductGroupAutocomplete
An Autocomplete component with search capabilities for product groups.

**Best for:**
- Large lists of product groups
- User-typed search/filtering
- Modern autocomplete experience
- Displaying rich product group information

**Features:**
- Search/filter functionality
- Shows component count and selling price
- Active status indicator
- Avatar display
- Full product group object in onChange

**Usage Example:**
```tsx
import ProductGroupAutocomplete from "@/components/productGroups/ProductGroupAutocomplete";
import { ProductGroupListOutput } from "@/models/product-group.model";

export default function MyComponent() {
  const [selectedGroup, setSelectedGroup] = useState<ProductGroupListOutput | null>(null);

  const handleSearch = (searchTerm: string) => {
    console.log("User searched for:", searchTerm);
  };

  return (
    <ProductGroupAutocomplete
      value={selectedGroup}
      onChange={setSelectedGroup}
      label="Search Product Groups"
      filterActive={true}
      onSearch={handleSearch}
    />
  );
}
```

**Props:**
- `value` (ProductGroupListOutput | null): Currently selected product group
- `onChange` (function): Callback when selection changes
- `label` (string): Label for the input
- `error` (boolean): Show error state
- `helperText` (string): Helper text below the input
- `disabled` (boolean): Disable the input
- `required` (boolean): Mark as required
- `size` (small | medium): Input size
- `fullWidth` (boolean): Fill parent width
- `filterActive` (boolean): Only show active product groups
- `onSearch` (function): Callback when user types

---

## Custom Hook

### useProductGroups
A React hook for managing product group data fetching and state.

**Best for:**
- Complex components needing product group data
- Multiple product group operations
- Full control over data fetching

**Features:**
- Fetch all product groups
- Fetch specific product group by ID (with components)
- Loading and error states
- Automatic error toast notifications

**Usage Example:**
```tsx
import { useProductGroups } from "@/hooks/useProductGroups";

export default function ProductGroupDetails() {
  const {
    productGroups,
    selectedGroup,
    loading,
    error,
    fetchProductGroups,
    fetchProductGroupById,
    clearSelectedGroup,
  } = useProductGroups();

  // Fetch specific product group on component mount
  useEffect(() => {
    fetchProductGroupById("pg_4e282459");
  }, [fetchProductGroupById]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{selectedGroup?.name}</h1>
      <p>Components: {selectedGroup?.components?.length}</p>
      <button onClick={() => clearSelectedGroup()}>Clear</button>
    </div>
  );
}
```

**Return Values:**
- `productGroups` (ProductGroupListOutput[]): List of all product groups
- `selectedGroup` (ProductGroupDetailsOutput | null): Currently selected product group with full details
- `loading` (boolean): Loading state
- `error` (string | null): Error message if any
- `fetchProductGroups` (function): Function to fetch all product groups
- `fetchProductGroupById` (function): Function to fetch specific product group by ID
- `clearSelectedGroup` (function): Function to clear the selected group

---

## API Response Structure

The product group API returns the following structure:

```typescript
interface ProductGroupListOutput {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  cost: number;
  selling_price: number;
  profit: number;
  components?: ProductGroupComponentOutput[];
  created_at: string;
  updated_at: string;
}

interface ProductGroupComponentOutput {
  id: number;
  product_id: string;
  product: {
    id: string;
    name: string;
    is_resource: boolean;
    // ... other product details
  };
  variant_sku?: string;
  quantity: number;
  position: number;
  created_at: string;
  updated_at: string;
}
```

---

## Integration Examples

### In a Form (Formik)

```tsx
import { Field, Form, Formik } from "formik";
import ProductGroupSelect from "@/components/productGroups/ProductGroupSelect";

interface FormValues {
  productGroupId: string;
}

export default function ProductForm() {
  return (
    <Formik
      initialValues={{ productGroupId: "" }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <ProductGroupSelect
            value={values.productGroupId}
            onChange={(value) => setFieldValue("productGroupId", value)}
            required
          />
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

### In a Dialog with Autocomplete

```tsx
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import ProductGroupAutocomplete from "@/components/productGroups/ProductGroupAutocomplete";

export default function SelectProductGroupDialog({ open, onClose }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a Product Group</DialogTitle>
      <DialogContent>
        <ProductGroupAutocomplete
          value={selectedGroup}
          onChange={setSelectedGroup}
        />
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            console.log("Selected:", selectedGroup);
            onClose();
          }}
        >
          Select
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## API Endpoints

The components use these API endpoints:

- `GET /api/product-groups` - List all product groups
- `GET /api/product-groups?limit=100&offset=0` - List with pagination
- `GET /api/product-groups?search=term` - Search product groups
- `GET /api/product-groups/{id}` - Get product group details with components

---

## Models

All TypeScript interfaces are defined in:
- `@/models/product-group.model`

Key types:
- `ProductGroupListOutput` - List item
- `ProductGroupDetailsOutput` - Full details with components
- `ProductGroupListResponse` - API response
- `ProductGroupComponentOutput` - Component details
