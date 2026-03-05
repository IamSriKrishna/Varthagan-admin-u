/**
 * Nested Details for Vendor - Tax, Compliance, Financial Info
 */
export interface IOtherDetails {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  pan?: string;
  is_msme_registered?: boolean;
  currency?: string;
  payment_terms?: string;
  tds?: string;
  enable_portal?: boolean;
  website_url?: string;
  department?: string;
  designation?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Address for Billing/Shipping
 */
export interface IAddress {
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
 * Contact Person for Vendor
 */
export interface IContactPerson {
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
 * Bank Details for Vendor
 */
export interface IBankDetail {
  id?: number;
  vendor_id?: number;
  bank_id?: number;
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Complete Vendor Interface with all nested details
 * Supports vendor creation with addresses, contact persons, bank details, and compliance info
 */
export interface IVendor {
  // Legacy fields - kept for backward compatibility
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
  categories?: Array<{
    vendor_id: string;
    category_id: string;
    created_at: string;
  }>;
  
  // New complete vendor structure fields
  id?: string | number;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email_address?: string;
  work_phone?: string;
  work_phone_code?: string;
  mobile?: string;
  mobile_code?: string;
  vendor_language?: string;
  gstin?: string;
  
  // Nested objects
  other_details?: IOtherDetails;
  billing_address?: IAddress;
  shipping_address?: IAddress;
  contact_persons?: IContactPerson[];
  bank_details?: IBankDetail[];
  
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
  
  created_at?: string;
  updated_at?: string;
}

export interface IVendorsResponse {
  success?: boolean;
  message?: string;
  vendors?: IVendor[];
  data?: IVendor[];
  total_count?: number;
  page?: number;
  page_size?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
