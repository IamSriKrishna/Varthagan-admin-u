/**
 * Customer Payment Model
 * Handles payment records for customer sales orders
 */

// ============================================================================
// Customer Payment Input/Request Types
// ============================================================================

export interface CreateCustomerPaymentInput {
  sales_order_id: string;
  customer_id: number;
  payment_mode: 'cash' | 'online';
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export interface RecordCustomerPaymentInput {
  received_amount: number;
  payment_mode: 'cash' | 'online';
  reference_number?: string;
  notes?: string;
}

export interface UpdateCustomerPaymentInput {
  payment_mode?: 'cash' | 'online';
  payment_date?: string;
  reference_number?: string;
  notes?: string;
}

// ============================================================================
// Customer Payment Output/Response Types
// ============================================================================

export interface CustomerInfoPayment {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
  work_phone?: string;
}

export interface SalesOrderInfo {
  id: string;
  sales_order_no: string;
  total: number;
  status: string;
}

export interface CustomerPayment {
  id: number;
  payment_number: string;
  sales_order_id: string;
  sales_order?: SalesOrderInfo;
  customer_id: number;
  customer?: CustomerInfoPayment;
  payment_mode: 'cash' | 'online';
  amount: number;
  received_amount: number;
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

export interface CustomerPaymentResponse {
  success: boolean;
  message?: string;
  data: CustomerPayment;
}

export interface CustomerPaymentListResponse {
  success: boolean;
  data?: CustomerPayment[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Legacy aliases for backward compatibility
export type CustomerPaymentRequest = CreateCustomerPaymentInput;
export type RecordPaymentRequest = RecordCustomerPaymentInput;
