import { PurchaseClaim, PurchaseClaimItem } from "@/models/purchaseClaim.model";

export interface PurchaseDispenseFormValues {
  purchase_order_id: string;
  purchase_claim_id: string;
  purchase_claim_item_id: number | "";
  quantity: number | "";
  unit: string;
  dispense_date: string;
  notes: string;
}

export interface CreatePurchaseDispenseRequest {
  purchase_claim_item_id: number;
  quantity: number;
  unit: string;
  dispense_date: string;
  notes: string;
}

export interface PurchaseDispense {
  id: string;
  purchase_claim_id: string;
  purchase_claim_item_id: number;
  purchase_order_id: string;
  product_id: string;
  product_name: string;
  is_raw_material: boolean;
  quantity: number;
  unit: string;
  base_quantity: number;
  base_unit: string;
  dispense_date: string;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface PurchaseDispenseResponse {
  success: boolean;
  message?: string;
  data: PurchaseDispense;
  error?: string;
}

export interface PurchaseDispensesResponse {
  success: boolean;
  total: number;
  data: PurchaseDispense[];
  error?: string;
}

export interface PurchaseClaimsApiResponse {
  success: boolean;
  total: number;
  data: PurchaseClaim[];
  error?: string;
}

export interface PurchaseClaimApiResponse {
  success: boolean;
  data: PurchaseClaim;
  error?: string;
}

export interface PurchaseDispenseClaimItemOption extends PurchaseClaimItem {
  claim_id: string;
  claim_number: string;
  purchase_order_number: string;
  claim_status: string;
}
