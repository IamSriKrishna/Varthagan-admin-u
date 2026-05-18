/**
 * Customer Pricing Model
 * Manages pricing rates for customers across different manufacturers
 */

export interface CustomerPricingLineItem {
  id?: string;
  manufacturer_id: string;
  manufacturer_name: string;
  rate: number;
  account: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPricing {
  id?: string;
  customer_id: number;
  customer_name?: string;
  line_items: CustomerPricingLineItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerPricingRequest {
  customer_id: number;
  line_items: Omit<CustomerPricingLineItem, 'id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateCustomerPricingRequest {
  line_items: Omit<CustomerPricingLineItem, 'id' | 'created_at' | 'updated_at'>[];
}

export interface CustomerPricingResponse {
  success: boolean;
  data: CustomerPricing;
  message?: string;
}

export interface CustomerPricingListResponse {
  success: boolean;
  data: {
    pricings: CustomerPricing[];
    total_count: number;
  };
}

export interface DeleteCustomerPricingResponse {
  success: boolean;
  message: string;
}
