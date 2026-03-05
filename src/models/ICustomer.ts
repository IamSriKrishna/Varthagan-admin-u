/**
 * Other Details for Customer - Tax, Financial Info
 */
export interface ICustomerOtherDetails {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  pan?: string;
  currency?: string;
  payment_terms?: string;
  enable_portal?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Address for Customer (Billing/Shipping)
 */
export interface ICustomerAddress {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  address_type?: 'billing' | 'shipping';
  attention?: string;
  street?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  phone_code?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Contact Person for Customer
 */
export interface ICustomerContactPerson {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  mobile?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Complete Customer Interface with all nested details
 * Supports customer creation with customer_type, addresses, contact persons, and compliance info
 */
export interface ICustomer {
  // Complete customer structure
  id?: number;
  customer_type?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email_address?: string;
  work_phone?: string;
  work_phone_code?: string;
  mobile?: string;
  mobile_code?: string;
  customer_language?: string;
  
  // Nested objects
  other_details?: ICustomerOtherDetails;
  billing_address?: ICustomerAddress;
  shipping_address?: ICustomerAddress;
  contact_persons?: ICustomerContactPerson[];
  
  // Relationship fields
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
    company_code: string;
  };
  
  // Legacy fields - kept for backward compatibility
  email?: string;
  phone?: string;
  user_type?: string;
  status?: string;
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
  last_login_at?: string;
  user_id?: string | number;
  latitude?: number;
  longitude?: number;
  member_no?: string;
  member_since?: string;
  member_expiry?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  
  created_at?: string;
  updated_at?: string;
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

export interface ICustomerView {
  addresses?: ICustomerAddress[];
  total?: number;
}
