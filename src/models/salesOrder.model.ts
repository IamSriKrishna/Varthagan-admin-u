// ============================================================================
// Sales Order Input/Request Types (aligned with Go backend)
// ============================================================================

/**
 * Sales Order Line Item Input
 * Supports both variant and non-variant products
 */
export interface SalesOrderLineItemInput {
  product_id?: string;              // Required: Product identifier
  product_name: string;             // Required: Product name
  sku?: string;                     // Optional: Base product SKU or variant SKU (deprecated, use variant_sku)
  variant_sku?: string;             // Optional: Variant-specific SKU (e.g., WB-001-RED)
  variant_name?: string;            // Optional: Variant display name
  quantity: number;                 // Required: Order quantity
  rate: number;                     // Required: Unit price
  account?: string;                 // Optional: Accounting code
  description?: string;             // Optional: Line item description
  variant_details?: Record<string, string>; // Optional: Variant attributes (color, size, etc.)
}

/**
 * Create Sales Order Request
 * Matches Go: CreateSalesOrderInput
 */
export interface CreateSalesOrderRequest {
  customer_id: number;              // Required: Customer identifier
  reference_no?: string;            // Optional: Reference number/PO number
  sales_order_date: string;         // Required: Sales order date (ISO 8601)
  expected_shipment_date: string;   // Required: Expected shipment date (ISO 8601)
  payment_terms: string;            // Required: Payment terms (e.g., NET30, NET60)
  delivery_method?: string;         // Optional: Delivery method (e.g., standard_shipping)
  salesperson_id?: number;          // Optional: Salesperson identifier
  line_items: SalesOrderLineItemInput[]; // Required: Line items (min 1)
  shipping_charges?: number;        // Optional: Shipping charges (default 0)
  tax_type?: string;                // Optional: Tax type (e.g., VAT, GST, TDS)
  tax_id?: number;                  // Optional: Tax configuration ID
  adjustment?: number;              // Optional: Adjustment amount (default 0)
  customer_notes?: string;          // Optional: Notes for customer
  terms_and_conditions?: string;    // Optional: Specific T&C for this order
  attachments?: string[];           // Optional: Attachment URLs
}

/**
 * Update Sales Order Request
 * All fields optional except for line_items validation
 */
export interface UpdateSalesOrderRequest {
  customer_id?: number;
  reference_no?: string;
  sales_order_date?: string;
  expected_shipment_date?: string;
  payment_terms?: string;
  delivery_method?: string;
  salesperson_id?: number;
  line_items?: SalesOrderLineItemInput[];
  shipping_charges?: number;
  tax_type?: string;
  tax_id?: number;
  adjustment?: number;
  customer_notes?: string;
  terms_and_conditions?: string;
  attachments?: string[];
}

/**
 * Update Sales Order Status Request
 */
export interface UpdateSalesOrderStatusRequest {
  status: 'draft' | 'sent' | 'confirmed' | 'partial_shipped' | 'shipped' | 'delivered' | 'paid' | 'cancelled';
}

// ============================================================================
// Sales Order Output/Response Types (aligned with Go backend)
// ============================================================================

/**
 * Customer Info (embedded in SalesOrderOutput)
 */
export interface CustomerInfo {
  id: number;
  display_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

/**
 * Salesperson Info (embedded in SalesOrderOutput)
 */
export interface SalespersonInfo {
  id: number;
  name: string;
}

/**
 * Tax Info (embedded in SalesOrderOutput)
 */
export interface TaxInfo {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

/**
 * Sales Order Line Item Output
 * Matches Go: SalesOrderLineItemOutput
 */
export interface SalesOrderLineItemOutput {
  id?: number;                      // Unique identifier
  product_id?: string;              // Product identifier
  product_name: string;             // Product name
  sku: string;                      // Product/variant SKU (variant_sku if variant, otherwise product sku)
  variant_sku?: string;             // Variant-specific SKU (if variant)
  variant_name?: string;            // Variant display name (if variant)
  account?: string;                 // Accounting code
  description?: string;             // Line item description
  quantity: number;                 // Order quantity
  rate: number;                     // Unit price
  amount: number;                   // Total amount (quantity × rate)
  variant_details?: Record<string, string>; // Variant attributes
}

/**
 * Sales Order Output
 * Matches Go: SalesOrderOutput
 */
export interface SalesOrderOutput {
  id: string;                       // Unique identifier
  sales_order_no: string;           // Sales order number (e.g., SO-20260405-0001)
  customer_id: number;              // Customer identifier
  customer?: CustomerInfo;          // Customer details
  salesperson_id?: number;          // Salesperson identifier
  salesperson?: SalespersonInfo;    // Salesperson details
  reference_no?: string;            // Reference number/PO number
  sales_order_date: string;         // Sales order date (ISO 8601)
  expected_shipment_date: string;   // Expected shipment date (ISO 8601)
  payment_terms: string;            // Payment terms
  delivery_method?: string;         // Delivery method
  line_items: SalesOrderLineItemOutput[]; // Line items
  sub_total: number;                // Subtotal (before tax and shipping)
  shipping_charges: number;         // Shipping charges
  tax_type?: string;                // Tax type
  tax_id?: number;                  // Tax configuration ID
  tax?: TaxInfo;                    // Tax details
  tax_amount: number;               // Total tax amount
  adjustment: number;               // Adjustment amount
  total: number;                    // Total amount (including tax and shipping)
  customer_notes?: string;          // Notes for customer
  terms_and_conditions?: string;    // T&C for this order
  status: 'draft' | 'sent' | 'confirmed' | 'partial_shipped' | 'shipped' | 'delivered' | 'paid' | 'cancelled'; // Order status
  attachments?: string[];           // Attachment URLs
  created_at: string;               // Creation timestamp
  updated_at: string;               // Last update timestamp
  created_by?: string;              // Created by user ID
  updated_by?: string;              // Last updated by user ID
}

// ============================================================================
// Response Wrapper Types
// ============================================================================

export interface SalesOrderResponse {
  data: SalesOrderOutput;
  message?: string;
  success: boolean;
}

export interface SalesOrderListResponse {
  data: SalesOrderOutput[];
  total: number;
  page?: number;
  limit?: number;
  success: boolean;
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use SalesOrderLineItemInput instead
 */
export interface LineItem extends SalesOrderLineItemInput {
  id?: number;
  item_id?: string;
  item?: {
    id: string;
    name: string;
    sku?: string;
  };
  variant_id?: number;
  variant?: {
    id: number;
    sku: string;
    attribute_map?: Record<string, any>;
  };
  delivered_quantity?: number;
  total?: number;
}

/**
 * @deprecated Use SalesOrderOutput instead
 */
export interface SalesOrder extends SalesOrderOutput {
  sales_order_id?: string;
  so_date?: string;
  date?: string;
  delivery_date?: string;
  shipment_preference?: string;
  subtotal?: number;
  shipping?: number;
  tax_rate?: number;
  total_amount?: number;
  notes?: string;
  line_items_count?: number;
  customer?: Customer;
  salesperson?: Salesperson;
  tax?: Tax;
}

/**
 * @deprecated Use CustomerInfo instead
 */
export interface Customer extends CustomerInfo {}

/**
 * @deprecated Use SalespersonInfo instead
 */
export interface Salesperson extends SalespersonInfo {}

/**
 * @deprecated Use TaxInfo instead
 */
export interface Tax extends TaxInfo {}
