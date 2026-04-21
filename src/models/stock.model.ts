// ============================================================================
// Stock Management Models - TypeScript Implementation
// Based on Go Backend: app/dto/output/stock_management.output.go
// ============================================================================

// ============================================================================
// Basic Stock Response (Legacy Single Item/Product)
// ============================================================================

export interface BasicStockResponse {
  available_stock: number;
  average_cost: number;
  current_stock: number;
  last_purchased: string;
  last_sold: string;
  product_id: string;
  product_name: string;
  purchased_total: number;
  reserved_stock: number;
  sku: string;
  sold_total: number;
  stock_value: number;
}

// ============================================================================
// Variant Attributes Mapping
// ============================================================================

export interface VariantAttributes {
  [key: string]: string;
}

// ============================================================================
// Variant-Specific Stock Output (For Products With Variants)
// Matches: VariantStockOutput from Go Backend
// ============================================================================

export interface VariantStockOutput {
  // Identifiers
  id: string; // Unique identifier for this variant stock record
  product_id: string; // Parent product ID
  product_name: string; // Parent product name
  variant_sku: string; // Variant-specific SKU (e.g., WB-001-RED)
  variant_name: string; // Variant display name (e.g., "Water Bottle - Red - 500ml")
  variant_attributes: VariantAttributes; // e.g., { "color": "red", "size": "500ml" }

  // Stock Quantities
  current_stock: number; // Units currently in stock
  purchased_total: number; // Total units ever purchased
  sold_total: number; // Total units ever sold
  reserved_stock: number; // Units reserved for pending orders
  available_stock: number; // Can sell immediately (current_stock - reserved_stock)
  in_transit_stock?: number; // Units in shipment

  // Pricing & Cost
  average_cost: number; // Cost per unit
  selling_price: number; // Selling price per unit
  stock_value: number; // Total value (current_stock × average_cost)

  // Reorder Management
  reorder_level: number; // Stock level threshold for alerts
  is_low_stock: boolean; // Alert flag when stock < reorder_level

  // Timestamps
  last_purchased_date?: string; // ISO timestamp of last purchase
  last_sold_date?: string; // ISO timestamp of last sale
}

// ============================================================================
// Product Stock Output (For Products Without Variants)
// Enhanced to optionally contain variants array
// ============================================================================

export interface ProductStockOutput {
  // Identifiers
  id: string;
  product_id: string;
  product_name: string;
  sku: string; // Main product SKU

  // Stock Quantities
  current_stock: number;
  purchased_total: number;
  sold_total: number;
  reserved_stock: number;
  available_stock: number;
  in_transit_stock?: number;

  // Pricing & Cost
  average_cost: number;
  selling_price: number;
  stock_value: number;

  // Reorder Management
  reorder_level?: number;
  is_low_stock?: boolean;

  // Timestamps
  last_purchased_date?: string;
  last_sold_date?: string;

  // NEW: Nested variants (if product has variants)
  variants?: VariantStockOutput[];
}

// ============================================================================
// Stock Management Response Container
// Smart response that includes either variants or products
// ============================================================================

export interface StockManagementResponse {
  stocks: (VariantStockOutput | ProductStockOutput)[]; // Polymorphic array
  total_stock_value: number; // Aggregated value of all stocks
}

// ============================================================================
// Variant-Only Response (When returning only variant stocks)
// ============================================================================

export interface VariantStockResponse {
  stocks: VariantStockOutput[];
  total_stock_value: number;
}

// ============================================================================
// Product-Only Response (When returning only product stocks)
// ============================================================================

export interface ProductStockResponse {
  stocks: ProductStockOutput[];
  total_stock_value: number;
}

// ============================================================================
// Enhanced Stock Response (With Variant Support)
// Type alias for flexibility
// ============================================================================

export type EnhancedStockResponse = StockManagementResponse;

// ============================================================================
// Stock Request / Input Types
// ============================================================================

export interface CreateStockInput {
  product_id: string;
  product_name: string;
  sku?: string;
  variant_sku?: string;
  variant_name?: string;
  variant_attributes?: VariantAttributes;
  current_stock: number;
  average_cost: number;
  selling_price: number;
  reorder_level?: number;
  purchased_total?: number;
  reserved_stock?: number;
  sold_total?: number;
}

export interface UpdateStockInput {
  current_stock?: number;
  reserved_stock?: number;
  average_cost?: number;
  selling_price?: number;
  reorder_level?: number;
  in_transit_stock?: number;
}

// ============================================================================
// Stock Adjustment Types
// ============================================================================

export interface StockAdjustmentInput {
  product_id: string;
  variant_sku?: string;
  adjustment_quantity: number;
  adjustment_type: 'add' | 'subtract' | 'set';
  reason?: string;
  reference_id?: string;
  notes?: string;
}

export interface StockAdjustmentResponse {
  success: boolean;
  previous_stock: number;
  new_stock: number;
  adjusted_amount: number;
  timestamp: string;
}

// ============================================================================
// Stock Batch Operations
// ============================================================================

export interface BatchStockUpdateInput {
  updates: Array<{
    product_id: string;
    variant_sku?: string;
    adjustment_quantity: number;
    adjustment_type?: 'add' | 'subtract' | 'set';
  }>;
}

export interface BatchStockUpdateResponse {
  successful: number;
  failed: number;
  total: number;
  errors?: Array<{
    product_id: string;
    variant_sku?: string;
    error_message: string;
  }>;
}

// ============================================================================
// Stock Transfer Types
// ============================================================================

export interface StockTransferInput {
  from_location: string;
  to_location: string;
  product_id: string;
  variant_sku?: string;
  quantity: number;
  reference_id?: string;
  notes?: string;
}

export interface StockTransferResponse {
  transfer_id: string;
  success: boolean;
  from_location: string;
  to_location: string;
  quantity: number;
  timestamp: string;
}

// ============================================================================
// Stock Level Indicators & Alerts
// ============================================================================

export interface StockLevelStatus {
  product_id: string;
  variant_sku?: string;
  current_stock: number;
  available_stock: number;
  reorder_level: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_percentage?: number; // % of reorder level
  days_to_stockout?: number;
  alert_message?: string;
}

// ============================================================================
// Stock Alert Configuration
// ============================================================================

export interface StockAlertConfig {
  enable_low_stock_alerts: boolean;
  enable_out_of_stock_alerts: boolean;
  low_stock_threshold_percentage?: number; // e.g., 20% of reorder level
  alert_recipients?: string[];
}

// ============================================================================
// Stock Value Summary & Analytics
// ============================================================================

export interface StockValueSummary {
  total_items: number; // Count of unique products/variants
  total_stock_value: number; // Sum of all (current_stock × average_cost)
  average_item_value: number;
  total_units: number; // Sum of all current_stock
  total_in_transit: number; // Sum of in_transit_stock
  low_stock_items: number; // Count of items with is_low_stock = true
  out_of_stock_items: number; // Count of items with current_stock = 0
  total_cost_value?: number; // Total cost of all current stock
  total_selling_value?: number; // Total selling price of all current stock
}

export interface StockCategoryBreakdown {
  category_name: string;
  item_count: number;
  total_units: number;
  total_value: number;
  low_stock_count: number;
}

// ============================================================================
// Historical Stock Records & Audit Trail
// ============================================================================

export interface StockHistoryRecord {
  id: string;
  product_id: string;
  variant_sku?: string;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  change_quantity: number;
  change_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'stock_count';
  reference_id?: string; // PO ID, Invoice ID, etc.
  reference_type?: string; // 'purchase_order', 'sale_invoice', etc.
  notes?: string;
  created_by?: string; // User who made the change
  created_at: string; // ISO timestamp
}

export interface StockHistoryQuery {
  product_ids?: string[];
  variant_skus?: string[];
  change_types?: string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface StockHistoryResponse {
  records: StockHistoryRecord[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Stock Query & Filter Types
// ============================================================================

export interface StockFilterOptions {
  product_ids?: string[];
  variant_skus?: string[];
  min_stock?: number;
  max_stock?: number;
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
  sort_by?: 'stock_value' | 'current_stock' | 'product_name' | 'last_sold' | 'last_purchased' | 'reorder_level';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include_variants?: boolean; // Include variant details
}

export interface StockQueryResponse {
  data: (VariantStockOutput | ProductStockOutput)[];
  total: number;
  limit: number;
  offset: number;
  total_stock_value: number;
}

// ============================================================================
// Reorder & Replenishment Types
// ============================================================================

export interface ReorderSuggestion {
  product_id: string;
  variant_sku?: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
  suggested_quantity: number; // Quantity to reorder
  reason: string;
  estimated_cost: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ReplenishmentPlan {
  plan_id: string;
  created_at: string;
  items: ReorderSuggestion[];
  total_estimated_cost: number;
  critical_count: number;
  high_count: number;
}

// ============================================================================
// Field Mapping Reference (For Documentation)
// ============================================================================

/**
 * Field Mapping: Old Standard → New Variant-Aware
 *
 * | Old Field         | New Field           | Notes                                    |
 * |-------------------|---------------------|------------------------------------------|
 * | sku               | variant_sku         | More specific to variant                 |
 * | -                 | variant_name        | NEW: Shows variant combination           |
 * | -                 | variant_attributes  | NEW: Key-value pairs (color, size)       |
 * | purchased_total   | purchased_total     | Same, renamed for clarity                |
 * | sold_total        | sold_total          | Same, renamed for clarity                |
 * | available_stock   | available_stock     | Same (current - reserved)                |
 * | average_cost      | average_cost        | Same                                     |
 * | stock_value       | stock_value         | Same (current × average_cost)            |
 * | -                 | selling_price       | NEW: Only in variant response            |
 * | -                 | reorder_level       | NEW: Alert threshold                     |
 * | -                 | is_low_stock        | NEW: Alert flag                          |
 * | -                 | in_transit_stock    | NEW: Stock in shipment                   |
 * | last_purchased    | last_purchased_date | Renamed for clarity (ISO timestamp)      |
 * | last_sold         | last_sold_date      | Renamed for clarity (ISO timestamp)      |
 */

// ============================================================================
// Response Builder Helper Types
// ============================================================================

export interface ResponseBuilderConfig {
  include_variants?: boolean;
  include_empty_variants?: boolean;
  include_history?: boolean;
  include_alerts?: boolean;
  calculate_days_to_stockout?: boolean;
}

// ============================================================================
// Validation Response Types
// ============================================================================

export interface StockValidationError {
  product_id: string;
  variant_sku?: string;
  field: string;
  error: string;
  current_value?: unknown;
}

export interface StockValidationResponse {
  is_valid: boolean;
  errors: StockValidationError[];
}

