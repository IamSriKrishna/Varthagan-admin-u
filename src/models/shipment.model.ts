// models/shipment.model.ts

export type ShipmentStatus = 'created' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';

// Related type info structures
export interface PackageInfo {
  id: string;
  package_slip_no: string;
  status: string;
}

export interface SalesOrderInfo {
  id: string;
  sales_order_no: string;
  customer_id: number;
  reference_no?: string;
  date: string;
  expected_shipment_date?: string;
  status: string;
}

export interface CustomerInfo {
  id: number;
  display_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

export interface ShipmentLineItem {
  sales_order_line_id?: string;
  product_id: string;
  variant_sku: string;
  quantity: number;
  notes?: string;
}

export interface Shipment {
  id: string;
  shipment_no: string;
  package_id?: string;
  package?: PackageInfo;
  sales_order_id: string;
  sales_order_no?: string;
  sales_order?: SalesOrderInfo;
  customer_id: number;
  customer_name?: string;
  customer?: CustomerInfo;
  ship_date: string;
  shipment_type?: string;
  shipping_method?: string;
  carrier?: string;
  tracking_no?: string;
  tracking_url?: string;
  shipping_address?: string;
  estimated_delivery?: string;
  shipping_charges: number;
  line_items: ShipmentLineItem[];
  total_items: number;
  stock_deducted: boolean;
  status: ShipmentStatus;
  notes?: string;
  message?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ShipmentCreateRequest {
  package_id: string;
  sales_order_id: string;
  customer_id: number;
  ship_date: string;
  carrier?: string;
  tracking_no?: string;
  tracking_url?: string;
  shipping_charges?: number;
  shipping_method?: string;
  shipping_address?: string;
  estimated_delivery?: string;
  line_items?: ShipmentLineItem[];
  auto_deduct_stock?: boolean;
  notes?: string;
}

export interface ShipmentUpdateRequest {
  ship_date?: string;
  carrier?: string;
  tracking_no?: string;
  tracking_url?: string;
  shipping_charges?: number;
  notes?: string;
  status?: ShipmentStatus;
}

export interface ShipmentStatusUpdate {
  status: ShipmentStatus;
}

export interface ShipmentListResponse {
  success: boolean;
  data: Shipment[];
  total: number;
}

export interface ShipmentResponse {
  success: boolean;
  data: Shipment;
}

export interface ShipmentCreateResponse {
  success: boolean;
  message: string;
  data: Shipment;
}

export interface ShipmentUpdateResponse {
  success: boolean;
  message: string;
  data: Shipment;
}
