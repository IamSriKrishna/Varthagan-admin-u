// Variant attribute mapping
export interface IProductVariantAttribute {
  key: string;
  value: string;
}

// Product variant input
export interface IProductVariant {
  sku: string;
  variant_name?: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  is_active: boolean;
}

// Attribute definition for variants
export interface IProductAttributeDefinition {
  key: string;
  options: string[];
}

// Product details section
export interface IProductDetails {
  unit: string;
  base_sku?: string;
  upc?: string;
  ean?: string;
  mpn?: string;
  isbn?: string;
  description: string;
  manufacturer_id?: number;
  attribute_definitions?: IProductAttributeDefinition[];
  variants?: IProductVariant[];
}

// Sales information
export interface ISalesInfo {
  account?: string;
  selling_price: number;
  currency?: string;
  description?: string;
}

// Purchase information
export interface IPurchaseInfo {
  account?: string;
  cost_price?: number;
  currency?: string;
  preferred_vendor_id?: string;
  description?: string;
}

// Inventory tracking
export interface IInventory {
  track_inventory: boolean;
  inventory_account?: string;
  inventory_valuation_method?: string;
  reorder_point?: number;
}

// Return policy
export interface IReturnPolicy {
  returnable: boolean;
}

// Main form interface - Create Product
export interface IProductForm {
  name: string;
  product_details: IProductDetails;
  sales_info: ISalesInfo;
  purchase_info?: IPurchaseInfo;
  inventory?: IInventory;
  return_policy?: IReturnPolicy;
  has_style?: boolean; // For UI state, whether to show style/variant builder
}

// Legacy interface for backward compatibility (deprecated)
export interface ILegacyProductForm {
  productName: string;
  description: string;
  type: string;
  max_bb_coins: string | number;
  deal_amount?: string | number;
  gst_percentage?: string | number;
  list_price: string | number;
  product_discount?: string | number;
  profile_id?: string | number;
  discount_type?: string;
  categoryId: string;
  tagIds?: string[];
  images: unknown[];
  is_combo?: boolean;
  is_popular?: boolean;
  is_active?: boolean;
  has_style?: boolean;
  is_dynamic?: boolean;
  is_deliverable?: boolean;
  style_data?: string;
}
