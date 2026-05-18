// ============================================================================
// Sales Order Input/Request Types (aligned with Go backend)
// ============================================================================

/**
 * Sales Order Line Item Input
 * Uses Manufacturers for manufacturing batch management
 */
export interface SalesOrderLineItemInput {
  manufacturer_id: string;          // Required: Manufacturer identifier
  manufacturer_name: string;        // Required: Manufacturer name
  quantity: number;                 // Required: Order quantity (must be > 0)
  rate: number;                     // Required: Unit price (must be > 0)
  account: string;                  // Required: Accounting code (e.g., SALES)
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
  delivery_method?: string;         // Optional: Delivery method (e.g., courier)
  salesperson_id?: number;          // Optional: Salesperson identifier
  line_items: SalesOrderLineItemInput[]; // Required: Line items (min 1)
  shipping_charges?: number;        // Optional: Shipping charges (default 0)
  tax_id?: number;                  // Optional: Tax configuration ID
  tax_rate?: number;                // Optional: Tax rate percentage (0-100)
  adjustment?: number;              // Optional: Adjustment amount (default 0)
  customer_notes?: string;          // Optional: Notes for customer
  terms_and_conditions?: string;    // Optional: Specific T&C for this order
  created_by?: string;              // Optional: Created by user identifier
}

/**
 * Update Sales Order Request
 * All fields optional
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
  tax_id?: number;
  tax_rate?: number;
  adjustment?: number;
  customer_notes?: string;
  terms_and_conditions?: string;
}

/**
 * Update Sales Order Status Request
 * Valid status transitions: draft → sent → confirmed → partial_delivered → delivered → paid/cancelled
 */
export interface UpdateSalesOrderStatusRequest {
  status: 'draft' | 'sent' | 'confirmed' | 'partial_delivered' | 'delivered' | 'paid' | 'cancelled';
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
  manufacturer_id: string;          // Manufacturer identifier
  manufacturer_name: string;        // Manufacturer name
  account: string;                  // Accounting code
  quantity: number;                 // Order quantity
  delivered_quantity: number;       // Delivered quantity
  rate: number;                     // Unit price
  amount: number;                   // Total amount (quantity × rate)
  // Item details (optional, included in some responses)
  item_id?: string;                 // Item identifier
  item?: any;                       // Item details object
  variant_sku?: string;             // Variant SKU
  variant?: any;                    // Variant details object
  variant_details?: any;            // Variant details mapping
}

/**
 * Sales Order Output
 * Matches Go: SalesOrderOutput
 */
export interface SalesOrderOutput {
  id: string;                       // Unique identifier
  sales_order_no: string;           // Sales order number (e.g., SO-2024-0001)
  customer_id: number;              // Customer identifier
  customer?: CustomerInfo;          // Customer details
  reference_no?: string;            // Reference number/PO number
  status: 'draft' | 'sent' | 'confirmed' | 'partial_delivered' | 'delivered' | 'paid' | 'cancelled'; // Order status
  date: string;                     // Sales order date (ISO 8601)
  sales_order_date?: string;        // Sales order date alias (for backward compatibility)
  expected_shipment_date: string;   // Expected shipment date (ISO 8601)
  delivery_method?: string;         // Delivery method
  payment_terms: string;            // Payment terms
  line_items: SalesOrderLineItemOutput[]; // Line items
  sub_total: number;                // Subtotal (before tax and shipping)
  shipping_charges: number;         // Shipping charges
  adjustment: number;               // Adjustment amount
  tax_id?: number;                  // Tax configuration ID
  tax_type?: string;                // Tax type
  tax_rate: number;                 // Tax rate percentage
  tax_total: number;                // Total tax amount
  total: number;                    // Total amount (including tax and shipping)
  customer_notes?: string;          // Notes for customer
  terms_and_conditions?: string;    // T&C for this order
  salesperson_id?: number;          // Salesperson identifier
  created_at: string;               // Creation timestamp
  updated_at: string;               // Last update timestamp
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
  delivery_date?: string;
  shipment_preference?: string;
  subtotal?: number;
  shipping?: number;
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
