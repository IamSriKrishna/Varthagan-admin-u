// ============================================================================
// Purchase Order Input/Request Types (from Go backend)
// ============================================================================

export interface PurchaseOrderLineItemInput {
  product_id?: string;
  product_name?: string;
  sku?: string;
  variant_sku?: string; // NEW: Variant-specific SKU
  variant_name?: string; // NEW: Variant display name
  item_id?: string; // NEW: Item identifier
  account: string;
  quantity: number;
  rate: number;
  variant_details?: Record<string, string>; // NEW: Variant attributes (color, size, etc.)
}

export interface CreatePurchaseOrderRequest {
  vendor_id: number;
  delivery_address_type: 'organization' | 'customer';
  delivery_address_id?: number;
  organization_name?: string;
  organization_address?: string;
  customer_id?: number;
  reference_no?: string;
  date: string;
  delivery_date: string;
  payment_terms: string;
  shipment_preference?: string;
  line_items: PurchaseOrderLineItemInput[];
  discount?: number;
  discount_type?: 'percentage' | 'amount';
  tax_type?: string;
  tax_id?: number;
  adjustment?: number;
  notes?: string;
  terms_and_conditions?: string;
  attachments?: string[];
}

export interface UpdatePurchaseOrderRequest {
  vendor_id?: number;
  delivery_address_type?: 'organization' | 'customer';
  delivery_address_id?: number;
  organization_name?: string;
  organization_address?: string;
  customer_id?: number;
  reference_no?: string;
  date?: string;
  delivery_date?: string;
  payment_terms?: string;
  shipment_preference?: string;
  line_items?: PurchaseOrderLineItemInput[];
  discount?: number;
  discount_type?: 'percentage' | 'amount';
  tax_type?: string;
  tax_id?: number;
  adjustment?: number;
  notes?: string;
  terms_and_conditions?: string;
  attachments?: string[];
}

export interface UpdatePurchaseOrderStatusRequest {
  status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
}

// ============================================================================
// Purchase Order Output/Response Types (from Go backend)
// ============================================================================

export interface VendorInfo {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
  work_phone: string;
}

export interface CustomerInfo {
  id: number;
  display_name: string;
  company_name: string;
  email: string;
  phone: string;
}

export interface ItemInfo {
  id: string;
  name: string;
  sku: string;
}

export interface VariantInfo {
  id: string;
  sku: string;
  attribute_map: Record<string, string>;
}

export interface TaxInfo {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

export interface PurchaseOrderLineItemOutput {
  id: number;
  product_id?: string;
  product_name?: string;
  sku?: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  purchase_order_no: string;
  vendor_id: number;
  vendor?: VendorInfo;
  delivery_address_type: string;
  delivery_address_id?: number;
  organization_name?: string;
  organization_address?: string;
  customer_id?: number;
  customer?: CustomerInfo;
  reference_no?: string;
  date: string;
  delivery_date: string;
  payment_terms: string;
  shipment_preference?: string;
  line_items: PurchaseOrderLineItemOutput[];
  sub_total: number;
  discount: number;
  discount_type?: string;
  tax_type?: string;
  tax_id?: number;
  tax?: TaxInfo;
  tax_amount: number;
  adjustment: number;
  total: number;
  notes?: string;
  terms_and_conditions?: string;
  status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
  attachments?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_name?: string;
  company_id?: number;
  company_name?: string;
}

// ============================================================================
// List/Batch Response Types
// ============================================================================

export interface PurchaseOrdersListResponse {
  purchase_orders: PurchaseOrder[];
  total: number;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder;
  success: boolean;
}

export interface PurchaseOrdersListResponse {
  purchase_orders: PurchaseOrder[];
  total: number;
}

export interface DeletePurchaseOrderResponse {
  success: boolean;
  message?: string;
}

export interface SearchPurchaseOrdersResponse {
  purchase_orders: PurchaseOrder[];
  total: number;
}
