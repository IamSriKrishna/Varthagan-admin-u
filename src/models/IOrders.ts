import { PaymentMethod, PaymentStatus, PaymentType } from "@/constants/payment";

export interface IOrder {
  id?: string;
  product_id: string;
  quantity: number | string;
  unit_price: number | string;
  description: string;
  is_active?: boolean;
  notes?: string;
  customer_name?: string;
  items?: IOrderItem[];
  customer_id?: string;
  product_discount: string;
  discount_type: string;
  bb_coins_used?: number | string;
  created_at?: string;
  updated_at?: string;
  order_status_display?: string;
  // 🆕 Payment fields
  payment_id?: string;
  payment_status: PaymentStatus; // NOT NULL in DB: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  razorpay_order_id?: string;
  paid_amount?: number;
  paid_at?: string;
  failure_reason?: string;
  error_code?: string;

  // 🆕 Vendor/Partner Workflow Fields
  vendor_id?: string;
  partner_id?: string;
  order_status: string; // NOT NULL in DB: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

  // 🆕 Workflow Timing Fields
  partner_assigned_at?: string;
  work_started_at?: string;
  completed_at?: string;
}
export interface IOrders {
  success: boolean;
  message: string;
  data: IOrder[];
}

export interface IOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  type: "coin_usage" | "product";
  unit_price: number;
  quantity: number;
  membership_discount_amount: number;
  membership_discount_type?: string;
  partner_id?: string;
  partner_name?: string;
  gst_percentage?: number;
  total_price: number;
  bb_coins_used: number;
  bb_coins_discount: number;
  created_at: string;
  updated_at: string;
}

export interface IOrderList {
  id: string;
  customer_id: string;
  description: string;
  order_status: string;
  is_active: boolean | string;
  items: IOrderItem[];
  subtotal_amount: number;
  discount_amount: number;
  vendor_email: string;
  vendor_state: string;
  membership_discount_amount: number;
  total_amount: number;
  bb_coins_used: number;
  bb_coins_discount: number;
  product_id: string;
  product_discount: string;
  discount_type: string;
  unit_price: number;
  quantity: number;

  payment_id: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  razorpay_order_id: string;
  paid_amount: number;
  gst_percentage: number;
  gst: number; // Total GST amount (CGST + SGST)
  paid_at: string;
  created_at: string;
  final_amount: number;
  updated_at: string;
  // 🆕 Payment workflow fields
  payment_type?: PaymentType; // Customer payment selection
  failure_reason?: string;
  error_code?: string;

  // 🆕 Vendor/Partner Workflow Fields
  vendor_id?: string;
  partner_id?: string;

  // 🆕 Workflow Timing Fields
  partner_assigned_at?: string;
  work_started_at?: string;
  completed_at?: string;

  // 🆕 Enriched Data Fields (Human-readable names)
  customer_name?: string;
  vendor_name?: string;
  partner_name?: string;
  partner_email?: string;
  product_name?: string;
  // 🆕 Enhanced Pricing Fields (calculated from items)
  tax_amount?: number; // Tax applied (18% in India)
  tax_percentage?: number; // Tax rate (default 18%)

  // 🆕 Customer Details (enriched)
  customer_email?: string; // Customer contact email
  customer_phone?: string; // Customer contact phone
  // 🆕 Delivery Details
  delivery_address?: string;
  delivery_phone_number?: string;
  delivery_email?: string;
  delivery_landmark?: string;
  delivery_address_type?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_google_maps_link?: string;

  // 🆕 Vendor Details (enriched)
  vendor_city?: string; // Vendor location
  vendor_phone?: string; // Vendor contact
  vendor_legal_name?: string; // Vendor legal business name

  // 🆕 Partner Details (enriched)
  partner_phone?: string; // Partner contact phone

  // 🆕 Payment Details (enhanced)
  error_source?: string; // Error source for failed payments
  payment_tax?: number; // Tax amount in payment (for CGST/SGST breakdown)
}

export interface OrderApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    orders: T;
    meta: {
      total: number;
      page: number;
      per_page: number;
    };
  };
}

export interface IOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: IOrder[];
    meta: {
      total: number;
      page: number;
      per_page: number;
    };
  };
}

//order report interfaces
export interface IOrderReport {
  order_id: string;
  created_at: string;
  customer_id: string;
  vendor_id: string;
  partner_id: string;
  partner_name: string;
  total_amount: number;
  partner_commission: number;
  cost_after_commission: number;
  customer_name: string;
  status: string;
}

export interface IOrderSummary {
  summary: boolean;
  total_orders: number;
  total_revenue: number;
  total_partner_commission: number;
  total_gross_revenue: number;
}

export interface IReportFilters {
  fromDate?: string;
  toDate?: string;
  partner_id?: string[];
  vendor_id?: string[];
}

export interface IReportData {
  filters: IReportFilters;
  period: {
    from: string;
    to: string;
  };
  report: {
    orders: IOrderReport[];
    summary: IOrderSummary;
  };
}

export interface IOrderApiResponse {
  success: boolean;
  message: string;
  data: IReportData;
}
