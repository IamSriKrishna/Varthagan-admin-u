/**
 * Address for Vendor Billing/Shipping
 * Supports both billing and shipping address creation
 */
export interface Address {
  id?: number;
  entity_type?: string;
  entity_id?: number;
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
  // Legacy fields - kept for backward compatibility
  country_region?: string;
  address_line1?: string;
  pin_code?: string;
  fax_number?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Contact Person for Vendor
 * Represents a point of contact at the vendor organization
 */
export interface ContactPerson {
  id?: number;
  entity_id?: number;
  entity_type?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  work_phone?: string;
  work_phone_code?: string;
  mobile?: string;
  mobile_code?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Bank Detail for Vendor
 * Stores vendor bank account information for payments
 * Account number is masked in responses for security
 */
export interface BankDetail {
  id?: number;
  vendor_id?: number;
  bank_id?: number | string;
  account_holder_name?: string;
  account_number?: string;
  reenter_account_number?: string;
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

/**
 * Other Details for Vendor
 * Contains tax information, compliance details, financial terms, and additional metadata
 */
export interface OtherDetails {
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
  twitter?: string;
  skype_name?: string;
  facebook?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Complete Vendor Interface
 * Supports vendor creation and updates with comprehensive nested details:
 * - Basic vendor information (name, contact, language)
 * - Other details (tax, compliance, financial, website)
 * - Billing & shipping addresses
 * - Multiple contact persons
 * - Multiple bank accounts
 */
export interface Vendor {
  // Basic Information
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
  
  // Nested Objects
  other_details?: OtherDetails;
  billing_address?: Address;
  shipping_address?: Address;
  contact_persons?: ContactPerson[];
  bank_details?: BankDetail[];
  documents?: any[];
  
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