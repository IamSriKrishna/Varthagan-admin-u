// models/item-group.model.ts

export interface VariantDetails {
  [key: string]: string | number;
}

export interface ItemGroupComponent {
  id?: number;
  item_group_id?: string;
  item_id: string;
  item?: {
    item_id: string;
    name: string;
    sku?: string;
  };
  variant_sku: string; // SKU of selected variant (required if item has variants)
  quantity: number; // Must be > 0
  description?: string; // Component-specific notes (quality specs, source, handling)
  variant_details?: VariantDetails; // Additional variant attribute mapping
  created_at?: string;
  updated_at?: string;
}

export interface ItemGroupComponentInput {
  item_id: string;
  variant_sku: string; // SKU of selected variant (required if item has variants)
  quantity: number; // Must be > 0
  description?: string; // Component-specific notes
  variant_details?: VariantDetails; // Additional variant attribute mapping
}

export interface ItemGroup {
  id: string;
  name: string;
  description: string;
  account?: string; // Accounting code or GL account (e.g., "WIP - Assembly Bundles")
  is_active: boolean;
  components: ItemGroupComponent[];
  created_at?: string;
  updated_at?: string;
}

export interface ItemGroupInput {
  name: string;
  description: string;
  account?: string; // Accounting code or GL account
  is_active?: boolean; // Default: true
  components: ItemGroupComponentInput[];
}

export interface ItemGroupListResponse {
  success: boolean;
  data: ItemGroup[];
  total: number;
  page: number;
  page_size: number;
}

export interface ItemGroupResponse {
  success: boolean;
  data: ItemGroup;
  message?: string;
}

export interface ItemGroupDeleteResponse {
  success: boolean;
  message: string;
}
