// Bill Models
export interface LineItem {
  id?: number;
  item_id: string;
  product_id?: string;
  product_name?: string;
  sku?: string;
  variant_sku?: string;
  item?: {
    id: string;
    name: string;
  };
  quantity: number;
  rate: number;
  amount?: number;
  description?: string;
  account: string;
  variant_details?: Record<string, any>;
}

export interface Vendor {
  id: number;
  display_name: string;
  company_name: string;
  email_address: string;
  work_phone: string;
}

export interface Tax {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

export interface Bill {
  id: string;
  bill_number: string;
  vendor_id: number;
  vendor?: Vendor;
  purchase_order_id?: string;
  billing_address: string;
  order_number: string;
  bill_date: string;
  due_date: string;
  payment_terms: string;
  subject: string;
  line_items: LineItem[];
  sub_total: number;
  discount: number;
  tax_type?: string;
  tax_id?: number;
  tax?: Tax;
  tax_amount: number;
  adjustment: number;
  total: number;
  notes: string;
  attachments?: string[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateBillRequest {
  vendor_id: number;
  bill_number: string;
  purchase_order_id?: string;
  billing_address: string;
  order_number: string;
  bill_date: string;
  due_date: string;
  payment_terms: string;
  subject: string;
  line_items: LineItem[];
  discount: number;
  tax_type?: string;
  tax_id?: number;
  adjustment: number;
  notes: string;
  attachments?: string[];
}

export interface UpdateBillRequest extends CreateBillRequest {}

export interface BillResponse {
  data: Bill;
  success: boolean;
  message: string;
}

export interface BillsListResponse {
  data: Bill[];
  total?: number;
  success: boolean;
  message?: string;
}

export interface DeleteBillResponse {
  data: {
    message: string;
  };
  success: boolean;
}
