// ============================================================================
// Purchase Order Component Input (for Reorder)
// ============================================================================

export interface ReorderComponentInput {
  product_id: string;
  variant_sku?: string | null;
  quantity: number;
}

// ============================================================================
// Purchase Order Request DTOs
// ============================================================================

export interface CreatePurchaseOrderInput {
  product_group_id: string;
  vendor_id: number;
  delivery_address_type: "organization" | "customer";
  delivery_address_id?: number | null;
  organization_name?: string;
  organization_address?: string;
  customer_id?: number | null;
  date: string; // ISO 8601 datetime
  delivery_date: string; // ISO 8601 datetime
  payment_terms: string;
  shipment_preference?: string;
  components: ReorderComponentInput[];
  discount?: number;
  discount_type?: "percentage" | "amount";
  tax_type?: string | null;
  tax_id?: number | null;
  adjustment?: number;
  notes?: string;
  terms_and_conditions?: string;
  attachments?: string[];
}

// ============================================================================
// Purchase Order Line Item Output
// ============================================================================

export interface PurchaseOrderLineItemOutput {
  id: number;
  product_id?: string;
  product_name: string;
  sku: string;
  account: string;
  quantity: number;
  received_quantity: number;
  rate: number;
  amount: number;
}

// ============================================================================
// Vendor Info
// ============================================================================

export interface VendorInfo {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
  work_phone: string;
}

// ============================================================================
// Tax Info
// ============================================================================

export interface TaxInfo {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

// ============================================================================
// Customer Info
// ============================================================================

export interface CustomerInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
}

// ============================================================================
// Purchase Order Output
// ============================================================================

export interface PurchaseOrderOutput {
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
  status: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_name?: string;
  company_id?: number;
  company_name?: string;
}

// ============================================================================
// Purchase Order Response
// ============================================================================

export interface PurchaseOrderResponse {
  success: boolean;
  message?: string;
  data?: PurchaseOrderOutput;
  error?: string;
}

// ============================================================================
// Vendor List Response
// ============================================================================

export interface VendorListOutput {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
  work_phone: string;
}

export interface VendorListResponse {
  success: boolean;
  data: VendorListOutput[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ============================================================================
// Tax List Response
// ============================================================================

export interface TaxListOutput {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

export interface TaxListResponse {
  success: boolean;
  data: TaxListOutput[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ============================================================================
// Customer List Response
// ============================================================================

export interface CustomerListOutput {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: CustomerListOutput[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ============================================================================
// Customer Address Response
// ============================================================================

export interface CustomerAddressOutput {
  id: number;
  customer_id: number;
  address_type: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CustomerAddressListResponse {
  success: boolean;
  data: CustomerAddressOutput[];
  total: number;
  message?: string;
}

// ============================================================================
// Reorder Component Input (Simple)
// ============================================================================

export interface ReorderComponentInput {
  product_id: string;
  variant_sku?: string | null;
  quantity: number;
}

// ============================================================================
// Reorder Product Group Input (Simple)
// ============================================================================

export interface ReorderProductGroupInput {
  products: ReorderComponentInput[];
}

// ============================================================================
// Reorder Response
// ============================================================================

export interface ReorderResponse {
  code: number;
  status: "success" | "error";
  message: string;
  data?: {
    id: string;
    reorder_summary: {
      total_products: number;
      updates: Array<{
        variant_sku: string;
        old_quantity: number;
        new_quantity: number;
        stock_adjusted: number;
      }>;
    };
    updated_at: string;
  };
  error?: string;
}
