// ============================================================================
// Product Input/Request Types (from Go backend)
// ============================================================================

export interface AttributeDefinition {
  key: string;
  options: string[];
}

export interface ProductVariantInput {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface ProductDetailsInput {
  unit: string;
  base_sku: string;
  variants?: ProductVariantInput[];
}

export interface SalesInfoInput {
  account: string;
  selling_price: number;
  currency?: string;
}

export interface PurchaseInfoInput {
  account: string;
  cost_price: number;
  currency?: string;
}

export interface CreateProductRequest {
  name: string;
  is_resource?: boolean;
  is_raw?: boolean;
  consumption_per_unit?: number;
  // Optional unit conversion fields for kg-based products
  base_unit?: string;
  purchase_unit?: string;
  conversion_factor?: number;
  product_details: ProductDetailsInput;
  sales_info: SalesInfoInput;
  purchase_info: PurchaseInfoInput;
  inventory?: {
    track_inventory?: boolean;
    inventory_account?: string;
    inventory_valuation_method?: string;
    reorder_point?: number;
  };
  return_policy?: {
    returnable: boolean;
  };
}

export interface UpdateProductRequest extends CreateProductRequest {}

// ============================================================================
// Product Output/Response Types (from Go backend)
// ============================================================================

export interface Manufacturer {
  id: number;
  name: string;
}

export interface ProductVariantOutput {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
}

export interface ProductDetailsOutput {
  unit: string;
  base_sku: string;
  variants: ProductVariantOutput[];
}

export interface SalesInfoOutput {
  account: string;
  selling_price: number;
  currency?: string;
}

export interface PurchaseInfoOutput {
  account: string;
  cost_price: number;
  currency?: string;
  preferred_vendor_id?: number;
  preferred_vendor?: {
    id: number;
    display_name: string;
    email_address: string;
    work_phone: string;
  };
}

export interface InventoryInfo {
  track_inventory: boolean;
}

export interface ReturnPolicy {
  returnable: boolean;
}

export interface Product {
  id: string;
  name: string;
  is_resource?: boolean;
  is_raw?: boolean;
  consumption_per_unit?: number;
  // Optional unit conversion fields for kg-based products
  base_unit?: string;
  purchase_unit?: string;
  conversion_factor?: number;
  product_details: ProductDetailsOutput;
  sales_info: SalesInfoOutput;
  purchase_info: PurchaseInfoOutput;
  inventory: InventoryInfo;
  return_policy: ReturnPolicy;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  company_id: number;
  company_name: string;
  // Raw Material Fields
  raw_name?: string;
  raw_specification?: string;
  raw_cost_per_unit?: number;
  required_gram_per_unit?: number;
  // Resource Fields
  resource_name?: string;
  resource_unit?: string;
  resource_cost_per_unit?: number;
}

// ============================================================================
// List/Batch Response Types
// ============================================================================

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface ProductResponse {
  data: Product;
  success: boolean;
}

// ============================================================================
// Helper Types for Form Operations
// ============================================================================

export interface ProductFormData {
  name: string;
  unit: string;
  base_sku: string;
  upc: string;
  ean: string;
  description: string;
  manufacturer_id: number | null;
  // Sales Info
  sales_account: string;
  selling_price: number;
  markup_percent: number;
  // Purchase Info
  purchase_account: string;
  cost_price: number;
  preferred_vendor_id?: number;
  // Attributes & Variants
  attribute_definitions: AttributeDefinition[];
  variants: ProductVariantInput[];
}

export interface ProductVariantFormData {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  profit: number; // Calculated: selling_price - cost_price
  profit_percent: number; // Calculated: (profit / cost_price) * 100
  stock_quantity: number;
  is_active: boolean;
}
