/**
 * Customer Pricing Model
 * Manages pricing rates for customers across different manufacturers and products
 * Supports both manufacturer-level and product-level pricing with date ranges
 */

/**
 * Line item for pricing - supports either product or manufacturer level
 */
export interface CustomerPricingLineItem {
  id?: string;
  // Product-level pricing (optional)
  product_id?: string;
  product_name?: string;
  // Manufacturer-level pricing (optional)
  manufacturer_id?: string;
  manufacturer_name?: string;
  // Pricing details
  rate: number;
  account: string;
  description?: string;
  // Date ranges
  effective_from?: string | Date | null;
  effective_to?: string | Date | null;
  // Status
  is_active?: boolean;
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Customer pricing record
 */
export interface CustomerPricing {
  id?: string;
  customer_id: number;
  customer_name?: string;
  line_items: CustomerPricingLineItem[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Request to create customer pricing with line items
 */
export interface CreateCustomerPricingRequest {
  customer_id: number;
  line_items: Array<{
    product_id?: string;
    product_name?: string;
    manufacturer_id?: string;
    manufacturer_name?: string;
    rate: number;
    account: string;
    description?: string;
  }>;
}

/**
 * Request to update customer pricing
 */
export interface UpdateCustomerPricingRequest {
  rate: number;
  account: string;
  description?: string;
  is_active: boolean;
}

/**
 * Request to set effective date range
 */
export interface SetEffectiveDateRangeRequest {
  effective_from?: string | Date | null;
  effective_to?: string | Date | null;
}

/**
 * API Response for single pricing record
 */
export interface CustomerPricingResponse {
  success: boolean;
  data: CustomerPricing;
  message?: string;
}

/**
 * API Response for list of pricing records
 */
export interface CustomerPricingListResponse {
  success: boolean;
  data: {
    pricings: CustomerPricing[];
    total_count: number;
  };
}

/**
 * API Response for delete operation
 */
export interface DeleteCustomerPricingResponse {
  success: boolean;
  message: string;
}

/**
 * DTO for filtering customer pricing
 */
export interface FilterCustomerPricingDTO {
  customer_id?: number;
  manufacturer_id?: string;
  product_id?: string;
  is_active?: boolean;
  offset?: number;
  limit?: number;
}
