// Purchase Order Models
export interface LineItem {
  id?: number;
  item_id: string;
  item?: {
    id: string;
    name: string;
  };
  variant_id?: number;
  variant?: {
    id: number;
    sku: string;
    attribute_map?: Record<string, any>;
  };
  account: string;
  quantity: number;
  rate: number;
  amount?: number;
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

export interface PurchaseOrder {
  id?: string;
  purchase_order_no?: string;
  vendor_id: number;
  vendor?: Vendor;
  delivery_address_type: 'organization' | 'customer';
  organization_name?: string;
  organization_address?: string;
  customer_id?: number;
  customer?: {
    id: number;
    display_name: string;
    company_name: string;
  };
  reference_no: string;
  date: string;
  delivery_date: string;
  payment_terms: string;
  shipment_preference: string;
  line_items: LineItem[];
  sub_total?: number;
  discount: number;
  discount_type: 'percentage' | 'amount';
  tax_type: 'tds' | 'tcs';
  tax_id: number;
  tax?: Tax;
  tax_amount?: number;
  adjustment: number;
  total?: number;
  notes: string;
  terms_and_conditions: string;
  status?: 'draft' | 'confirmed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface CreatePurchaseOrderRequest {
  vendor_id: number;
  delivery_address_type: 'organization' | 'customer';
  organization_name?: string;
  organization_address?: string;
  customer_id?: number;
  reference_no: string;
  date: string;
  delivery_date: string;
  payment_terms: string;
  shipment_preference: string;
  line_items: LineItem[];
  discount: number;
  discount_type: 'percentage' | 'amount';
  tax_type: 'tds' | 'tcs';
  tax_id: number;
  adjustment: number;
  notes: string;
  terms_and_conditions: string;
}

export interface UpdatePurchaseOrderRequest extends CreatePurchaseOrderRequest {}

export interface PurchaseOrderResponse {
  data: PurchaseOrder;
  success: boolean;
}

export interface PurchaseOrdersListResponse {
  data: {
    purchase_orders: PurchaseOrder[];
    total: number;
  };
  success: boolean;
}

export interface DeletePurchaseOrderResponse {
  data: {
    message: string;
  };
  success: boolean;
}

export interface SearchPurchaseOrdersResponse {
  data: {
    purchase_orders: PurchaseOrder[];
    total: number;
  };
  success: boolean;
}
