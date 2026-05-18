// models/product-group.model.ts

// ============================================================================
// Product Group Resource - Request DTOs
// ============================================================================

export interface ProductGroupResourceInput {
  resource_type: string;
  unit: string;
  quantity: number;
  cost: number;
}

export interface ProductGroupResourceOutput extends ProductGroupResourceInput {
  id?: string | number;
  position?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Product Group Component - Request DTOs
// ============================================================================

export interface ProductGroupComponentInput {
  product_id: string;
  quantity: number;
  variant_sku?: string | null;
  position?: number;
  variant_details?: Record<string, string>;
}

// ============================================================================
// Product Group - Request DTO
// ============================================================================

export interface CreateProductGroupInput {
  name: string;
  description?: string;
  status?: string;
  is_active: boolean;
  products: ProductGroupComponentInput[];
  resources?: ProductGroupResourceInput[];
}

export interface UpdateProductGroupInput extends Partial<CreateProductGroupInput> {}

// ============================================================================
// Product Group Component - Response DTOs
// ============================================================================

export interface VariantDetails {
  [key: string]: string;
}

export interface ProductGroupComponentOutput {
  id: number;
  product_id: string;
  product?: ProductOutput;
  quantity: number;
  position?: number;
  variant_sku?: string | null;
  variant_details?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProductOutput {
  id: string;
  name: string;
  sku: string;
  cost_price?: number;
  selling_price?: number;
  is_resource?: boolean;  // Optional: Whether this is a resource product
}

// ============================================================================
// Product Variant Support Types
// ============================================================================

export interface ProductVariant {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  cost_price?: number;
  selling_price?: number;
  stock_quantity?: number;
  reorder_level?: number;
  is_active?: boolean;
}

// ============================================================================
// Product Group - Response DTOs
// ============================================================================

export interface CreateProductGroupOutput {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  cost: number;
  selling_price: number;
  profit: number;
  components: ProductGroupComponentOutput[];
  resources?: ProductGroupResourceOutput[];
  created_at: string;
  updated_at: string;
  message?: string;
}

export interface ProductGroupDetailsOutput {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  cost: number;
  selling_price: number;
  profit: number;
  components: ProductGroupComponentOutput[];
  resources?: ProductGroupResourceOutput[];
  created_at: string;
  updated_at: string;
}

export interface ProductGroupListOutput {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  cost: number;
  selling_price: number;
  profit: number;
  components: ProductGroupComponentOutput[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// List Response DTOs
// ============================================================================

export interface ProductGroupListResponse {
  success: boolean;
  data: ProductGroupListOutput[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface ProductGroupResponse {
  success: boolean;
  data: CreateProductGroupOutput;
  message?: string;
}

export interface ProductGroupDeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Type Aliases for Convenience
// ============================================================================

export type ProductGroup = CreateProductGroupOutput;
export type ProductGroupComponent = ProductGroupComponentOutput;
