/**
 * Address for Customer Billing/Shipping
 * Supports both billing and shipping address creation
 */
export interface Address {
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
  // Legacy fields - kept for backward compatibility
  country_region?: string;
  address_line1?: string;
  pin_code?: string;
  fax_number?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Shipping Address for Customer
 * Can be same as billing or different delivery location
 */
export interface ShippingAddress extends Address {
  same_as_billing?: boolean;
}

/**
 * Contact Person for Customer
 * Represents a point of contact at the customer organization
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
 * Other Details for Customer
 * Contains tax information, compliance details, financial terms, and additional metadata
 */
export interface OtherDetails {
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
 * Complete Customer Interface
 * Supports customer creation and updates with comprehensive nested details:
 * - Customer type (Business or Individual)
 * - Basic customer information (name, contact, language)
 * - Other details (tax, financial terms, portal access)
 * - Billing & shipping addresses
 * - Multiple contact persons
 */
export interface Customer {
  // Basic Information
  id?: string | number;
  customer_type?: string; // Business or Individual
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
  
  // Nested Objects
  other_details?: OtherDetails;
  billing_address?: Address;
  shipping_address?: ShippingAddress;
  contact_persons?: ContactPerson[];
  
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

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

// API Input Types
export interface CreateCustomerInput extends Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user' | 'company'> {}
export interface UpdateCustomerInput extends Partial<Customer> {}
