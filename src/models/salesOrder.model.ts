// Sales Order Models
export interface LineItem {
  id?: number;
  item_id: string;
  item?: {
    id: string;
    name: string;
    sku?: string;
  };
  variant_id?: number;
  variant_sku?: string;
  variant?: {
    id: number;
    sku: string;
    attribute_map?: Record<string, any>;
  };
  description?: string;
  quantity: number;
  rate: number;
  amount?: number;
  total?: number;
  variant_details?: Record<string, any>;
}

export interface Customer {
  id: number;
  display_name: string;
  company_name: string;
  email?: string;
  phone?: string;
}

export interface Salesperson {
  id: number;
  name: string;
}

export interface Tax {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

export interface SalesOrder {
  id?: string;
  sales_order_id?: string;
  sales_order_no?: string;
  customer_id: number;
  customer?: Customer;
  salesperson_id?: number;
  salesperson?: Salesperson;
  reference_no: string;
  sales_order_date: string;
  so_date?: string;
  expected_shipment_date: string;
  payment_terms: string;
  delivery_method: string;
  line_items: LineItem[];
  sub_total?: number;
  subtotal?: number;
  shipping_charges: number;
  shipping?: number;
  tax_type?: string;
  tax_id: number;
  tax?: Tax;
  tax_amount?: number;
  adjustment: number;
  total?: number;
  total_amount?: number;
  customer_notes?: string;
  notes?: string;
  terms_and_conditions: string;
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  line_items_count?: number;
}

export interface CreateSalesOrderRequest {
  customer_id: number;
  reference_no: string;
  sales_order_date: string;
  expected_shipment_date: string;
  payment_terms: string;
  delivery_method: string;
  salesperson_id?: number;
  line_items: LineItem[];
  shipping_charges: number;
  tax_id: number;
  tax_rate?: number;
  adjustment: number;
  customer_notes?: string;
  notes?: string;
  terms_and_conditions: string;
}

export interface UpdateSalesOrderRequest extends CreateSalesOrderRequest {}

export interface UpdateSalesOrderStatusRequest {
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
}

export interface SalesOrderResponse {
  data: SalesOrder;
  success: boolean;
}
