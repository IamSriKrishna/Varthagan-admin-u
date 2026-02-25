// Package Models

export interface PackageLineItem {
  id?: number;
  sales_order_item_id: number;
  item_id: string;
  item?: {
    id: string;
    name: string;
    sku?: string;
  };
  variant_sku?: string;
  variant?: {
    id: number;
    sku: string;
    attribute_map?: Record<string, any>;
  };
  ordered_qty: number;
  packed_qty: number;
  variant_details?: Record<string, any>;
}

export interface SalesOrderRef {
  id: string;
  sales_order_no: string;
  customer_id: number;
  reference_no: string;
  sales_order_date: string;
  expected_shipment_date: string;
  status: string;
}

export interface CustomerRef {
  id: number;
  display_name: string;
  company_name: string;
  email?: string;
  phone?: string;
}

export interface Package {
  id?: string;
  package_slip_no?: string;
  sales_order_id: string;
  sales_order?: SalesOrderRef;
  customer_id: number;
  customer?: CustomerRef;
  package_date: string;
  status?: 'created' | 'packed' | 'shipped' | 'delivered';
  items: PackageLineItem[];
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreatePackageRequest {
  sales_order_id: string;
  customer_id: number;
  package_date: string;
  items?: Array<{
    sales_order_item_id: number;
    packed_qty: number;
  }>;
  internal_notes?: string;
}

export interface UpdatePackageRequest extends CreatePackageRequest {}

export interface UpdatePackageStatusRequest {
  status: 'created' | 'packed' | 'shipped' | 'delivered';
}

export interface PackageResponse {
  data: Package;
  success: boolean;
}

export interface PackagesListResponse {
  data: {
    packages: Package[];
    total: number;
  };
  success: boolean;
}

export interface DeletePackageResponse {
  data: {
    message: string;
  };
  success: boolean;
}
