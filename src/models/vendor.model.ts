export interface Address {
  id?: number;
  entity_type?: string;
  entity_id?: number;
  attention: string;
  country_region: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pin_code: string;
  phone: string;
  phone_code: string;
  fax_number?: string;
  address_type: 'billing' | 'shipping';
  created_at?: string;
  updated_at?: string;
}

export interface ContactPerson {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  salutation: string;
  first_name: string;
  last_name: string;
  email_address: string;
  work_phone: string;
  work_phone_code: string;
  mobile: string;
  mobile_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface BankDetail {
  id?: number;
  vendor_id?: number;
  bank_id: number | string;
  account_holder_name: string;
  account_number: string;
  ifsc_code?: string;
  branch_name?: string;
  is_primary?: boolean;
  is_active?: boolean;
  bank?: {
    id: number;
    bank_name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface OtherDetails {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  pan: string;
  is_msme_registered: boolean;
  currency: string;
  payment_terms: string;
  tds: string;
  enable_portal: boolean;
  website_url: string;
  department: string;
  designation: string;
  twitter: string;
  skype_name: string;
  facebook: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  // Basic Information
  id?: string | number;
  salutation: string;
  first_name: string;
  last_name: string;
  company_name: string;
  display_name: string;
  email_address: string;
  work_phone: string;
  work_phone_code: string;
  mobile: string;
  mobile_code: string;
  vendor_language: string;
  gstin: string;
  
  // Nested Objects
  other_details: OtherDetails;
  billing_address: Address;
  shipping_address: Address;
  contact_persons: ContactPerson[];
  bank_details: BankDetail[];
  documents?: any[];
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface VendorListResponse {
  success: boolean;
  data: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

// API Input Types
export interface CreateVendorInput extends Omit<Vendor, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateVendorInput extends Partial<Vendor> {}