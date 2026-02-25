export interface ICustomer {
  id?: number;
  email?: string;
  phone?: string;
  user_type?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  preferred_language?: string;
  preferred_currency?: string;
  referral_code?: string;
  order_count?: number;
  membership_status?: boolean;
  membership_active?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  user_id?: string | number;
  // Geo Location
  latitude?: number;
  longitude?: number;
  member_no?: string;
  member_since?: string;
  member_expiry?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface IPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ICustomerResponseData {
  customers: ICustomer[];
  pagination: IPagination;
}

export interface ICustomers {
  data: {
    customers: ICustomer[];
  };
}

export interface ICustomerApiResponse {
  success: boolean;
  message: string;
  data: ICustomerResponseData;
}

// Wrapper for API response
export interface ICustomerDetailResponse {
  success: boolean;
  message: string;
  data: ICustomer;
}
export interface ICustomerAddress {
  full_name: string;
  phone_number: string;
  address: string;
  landmark: string;
  address_type: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}
export interface ICustomerView {
  addresses?: ICustomerAddress[];
  total?: number;
}
