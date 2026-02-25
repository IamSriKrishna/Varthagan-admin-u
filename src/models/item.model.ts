// models/item.model.ts

export type ItemType = "goods" | "service";
export type ItemStructure = "single" | "variants";

export interface AttributeDefinition {
  key: string;
  options: string[];
}

export interface Variant {
  sku: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
}

export interface ItemDetails {
  structure: ItemStructure;
  unit: string;
  sku?: string;
  upc?: string;
  ean?: string;
  mpn?: string;
  isbn?: string;
  description?: string;
  attribute_definitions?: AttributeDefinition[];
  variants?: Variant[];
}

export interface SalesInfo {
  account: string;
  selling_price?: number;
  currency?: string;
  description?: string;
}

export interface PreferredVendor {
  id: number;
  display_name: string;
  company_name?: string;
  email_address?: string;
  work_phone?: string;
}

export interface PurchaseInfo {
  account: string;
  cost_price?: number;
  currency?: string;
  preferred_vendor_id?: number;
  preferred_vendor?: PreferredVendor;
  description?: string;
}

export interface Inventory {
  track_inventory: boolean;
  inventory_account?: string;
  inventory_valuation_method?: string;
  reorder_point?: number;
}

export interface ReturnPolicy {
  returnable: boolean;
}

// Brand and Manufacturer can be either string or object
export interface BrandOrManufacturer {
  id: number;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  brand?: string | BrandOrManufacturer;
  manufacturer?: string | BrandOrManufacturer;
  item_details: ItemDetails;
  sales_info: SalesInfo;
  purchase_info?: PurchaseInfo;
  inventory?: Inventory;
  return_policy?: ReturnPolicy;
  opening_stock?: number;
  opening_stock_value?: number;
  opening_stock_rate_per_unit?: number;
  created_at: string;
  updated_at: string;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
}

export interface ItemResponse {
  success: boolean;
  data: Item;
  message?: string;
}

export interface OpeningStockRequest {
  opening_stock: number;
  opening_stock_rate_per_unit: number;
}

export interface OpeningStockResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    opening_stock: number;
    opening_stock_value: number;
    opening_stock_rate_per_unit: number;
  };
  message?: string;
}