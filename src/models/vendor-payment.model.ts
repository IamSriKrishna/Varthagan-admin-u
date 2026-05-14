/**
 * Vendor Payment Model
 * Handles payment records for vendor purchase orders
 */

// ============================================================================
// Vendor Payment Input/Request Types
// ============================================================================

export interface CreateVendorPaymentRequest {
  purchase_order_id: string; // UUID format: "38f5b444-4892-4798-a4aa-c3cdfde26f40"
  vendor_id: number;
  payment_mode: 'cash' | 'online';
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export interface RecordVendorPaymentRequest {
  paid_amount: number;
  payment_mode: 'cash' | 'online';
  reference_number?: string;
  notes?: string;
}

// ============================================================================
// Vendor Payment Output/Response Types
// ============================================================================

export interface VendorPaymentVendorInfo {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
}

export interface PurchaseOrderInfo {
  id: string;
  purchase_order_no: string;
  total: number;
  status: string;
}

export interface VendorPayment {
  id: number;
  payment_number: string;
  purchase_order_id: string;
  purchase_order?: PurchaseOrderInfo;
  vendor_id: number;
  vendor?: VendorPaymentVendorInfo;
  payment_mode: 'cash' | 'online';
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'pending' | 'partial' | 'completed';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by_user_name: string;
  created_by_company_name: string;
}

export interface VendorPaymentResponse {
  success: boolean;
  message?: string;
  data: VendorPayment;
}

export interface VendorPaymentListResponse {
  success: boolean;
  data?: VendorPayment[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}
