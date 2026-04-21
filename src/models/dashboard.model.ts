// Dashboard Models - Business Analytics and Metrics

export interface UserInfo {
  user_id: number;
  user_name: string;
  user_role: "superadmin" | "admin" | "user";
  company_id: number;
  company_name: string;
  email: string;
}

export interface CustomerMetrics {
  total: number;
  active: number;
  inactive: number;
  created_today: number;
}

export interface VendorMetrics {
  total: number;
  active: number;
  inactive: number;
  created_today: number;
}

export interface ItemMetrics {
  total: number;
  total_stock: number;
  low_stock_items: number;
  item_groups: number;
  created_today: number;
  out_of_stock_items: number;
}

export interface ShipmentMetrics {
  total: number;
  shipped: number;
  pending: number;
  in_transit: number;
  delivered: number;
  cancelled_shipped: number;
  average_delivery_time_days: number;
}

export interface InvoiceMetrics {
  total: number;
  total_amount: number;
  outstanding_amount: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface SalesOrderMetrics {
  total: number;
  total_amount: number;
  completed_count: number;
  pending_count: number;
  cancelled_count: number;
  created_today: number;
}

export interface PurchaseOrderMetrics {
  total: number;
  total_amount: number;
  completed_count: number;
  pending_count: number;
  cancelled_count: number;
  created_today: number;
}

export interface PackageMetrics {
  total: number;
  shipped_count: number;
  pending_count: number;
  in_transit_count: number;
  delivered_count: number;
  created_today: number;
}

export interface DashboardMetrics {
  user_info?: UserInfo;
  customer_metrics: CustomerMetrics;
  vendor_metrics: VendorMetrics;
  item_metrics: ItemMetrics;
  shipment_metrics: ShipmentMetrics;
  invoice_metrics: InvoiceMetrics;
  sales_order_metrics: SalesOrderMetrics;
  purchase_order_metrics: PurchaseOrderMetrics;
  package_metrics: PackageMetrics;
  last_updated_at: string;
  generated_at: string;
}

export interface ActivitySummary {
  created_customers_today: number;
  created_vendors_today: number;
  created_items_today: number;
  created_sales_orders_today: number;
  created_purchase_orders_today: number;
  shipped_today: number;
  delivered_today: number;
}

export interface StockItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  available_stock: number;
  reserved_stock: number;
  purchased_stock: number;
  sold_stock: number;
  average_cost: number;
  revaluation_amount: number;
  last_purchased_date: string;
  last_sold_date: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface StockInfo {
  data: StockItem[];
  total_products: number;
  in_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_quantity: number;
}

export interface TrackingRecord {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  notes: string;
  timestamp: string;
}

export interface ShipmentTracking {
  data: TrackingRecord[];
  total: number;
}

export interface AddTrackingRequest {
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  notes: string;
}

export interface TrackingResponse {
  message: string;
}

export interface TrendData {
  date: string;
  count: number;
  active_count?: number;
  created_today?: number;
}

export interface EntityTrends {
  entity_type: string;
  data: TrendData[];
}

export interface DashboardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RefreshResponse {
  message: string;
  timestamp?: string;
}
