export interface Address {
  attention: string;
  country_region: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pin_code: string;
  phone: string;
  phone_code: string;
  fax_number: string;
}

export interface ShippingAddress extends Address {
  same_as_billing: boolean;
}

export interface ContactPerson {
  salutation: string;
  first_name: string;
  last_name: string;
  email_address: string;
  work_phone: string;
  work_phone_code: string;
  mobile: string;
  mobile_code: string;
}

export interface OtherDetails {
  pan: string;
  currency: string;
  payment_terms: string;
  enable_portal: boolean;
}

export interface Customer {
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
  customer_language: string;
  
  // Nested Objects
  other_details: OtherDetails;
  billing_address: Address;
  shipping_address: ShippingAddress;
  contact_persons: ContactPerson[];
  
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
export interface CreateCustomerInput extends Omit<Customer, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateCustomerInput extends Partial<Customer> {}
