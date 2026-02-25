export interface IVendor {
  vendor_id?: string;
  name?: string;
  user_id?: string | number;
  password?: string;
  legal_name?: string;
  code?: string;
  ownership_type?: string;
  gst_number?: string;
  status?: string;
  is_active?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: string;
  opening_time?: string;
  closing_time?: string;
  created_at?: string;
  updated_at?: string;
  categories?: Array<{
    vendor_id: string;
    category_id: string;
    created_at: string;
  }>;
}

export interface IVendorsResponse {
  success?: boolean;
  message?: string;
  vendors?: IVendor[];
  total_count: number;
  page: number;
  page_size: number;
}
