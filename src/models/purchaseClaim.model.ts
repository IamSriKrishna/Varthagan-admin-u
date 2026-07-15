
export type PurchaseClaimType = "missing" | "damaged";

export type PurchaseClaimAction =
  | "replacement"
  | "credit_note"
  | "return_to_vendor"
  | "scrap"
  | "adjustment_only";

export type PurchaseClaimStatus =
  | "open"
  | "partial"
  | "resolved"
  | "cancelled";

export interface PurchaseOrderClaimSourceItem {
  purchase_order_item_id: number;
  product_id: string;
  product_name: string;
  sku: string;
  is_raw_material: boolean;

  ordered_quantity: number;
  ordered_unit: string;
  ordered_base_quantity: number;
  base_unit: string;

  received_quantity: number;
  received_base_quantity: number;

  missing_reported_base: number;
  damaged_reported_base: number;
  missing_remaining_base: number;
  damaged_remaining_base: number;

  replacement_pending_base: number;

  number_of_packs?: number;
  quantity_per_pack?: number;
  received_packs?: number;
  rate: number;
}

export interface PurchaseOrderClaimSource {
  purchase_order_id: string;
  purchase_order_number: string;
  vendor_id: number;
  vendor_name: string;
  status: string;
  inventory_synced: boolean;
  items: PurchaseOrderClaimSourceItem[];
}

export interface PurchaseClaimFormItem {
  purchase_order_item_id: number | "";
  type: PurchaseClaimType;
  quantity: number | "";
  unit: string;
  reason: string;
  action: PurchaseClaimAction;
}

export interface PurchaseClaimFormValues {
  purchase_order_id: string;
  date: string;
  notes: string;
  items: PurchaseClaimFormItem[];
}

export interface CreatePurchaseClaimRequest {
  purchase_order_id: string;
  date: string;
  notes: string;
  items: Array<{
    purchase_order_item_id: number;
    type: PurchaseClaimType;
    quantity: number;
    unit: string;
    reason: string;
    action: PurchaseClaimAction;
  }>;
}

export interface PurchaseClaimItem {
  id: number;
  purchase_claim_id: string;
  purchase_order_item_id: number;
  product_id: string;
  product_name: string;
  sku: string;
  is_raw_material: boolean;
  type: PurchaseClaimType;
  quantity: number;
  unit: string;
  base_quantity: number;
  base_unit: string;
  rate: number;
  amount: number;
  reason: string;
  action: PurchaseClaimAction;
  stock_adjusted: boolean;
  replacement_pending_base: number;
  replacement_received_base: number;
  replacement_completed: boolean;
  replacement_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseClaim {
  id: string;
  claim_number: string;
  purchase_order_id: string;
  purchase_order_number: string;
  vendor_id: number;
  company_id: number;
  date: string;
  status: PurchaseClaimStatus;
  notes: string;
  created_by: string;
  items: PurchaseClaimItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseClaimResponse {
  success: boolean;
  message?: string;
  data: PurchaseClaim;
  error?: string;
}

export interface PurchaseClaimsResponse {
  success: boolean;
  total: number;
  data: PurchaseClaim[];
  error?: string;
}

export interface PurchaseOrderClaimSourceResponse {
  success: boolean;
  data: PurchaseOrderClaimSource;
  error?: string;
}