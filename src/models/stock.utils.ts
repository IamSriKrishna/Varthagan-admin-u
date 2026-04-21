// ============================================================================
// Stock Management Utility Functions
// Helper functions for working with stock models and responses
// ============================================================================

import {
  VariantStockOutput,
  ProductStockOutput,
  StockManagementResponse,
  StockLevelStatus,
  StockValueSummary,
  VariantAttributes,
  BatchStockUpdateInput,
  ReorderSuggestion,
} from './stock.model';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Determines if a stock record is a variant stock
 * @param stock - Stock record to check
 * @returns true if stock is a VariantStockOutput
 */
export function isVariantStock(
  stock: VariantStockOutput | ProductStockOutput
): stock is VariantStockOutput {
  return 'variant_sku' in stock && stock.variant_sku !== undefined;
}

/**
 * Determines if a stock record is a product stock
 * @param stock - Stock record to check
 * @returns true if stock is a ProductStockOutput
 */
export function isProductStock(
  stock: VariantStockOutput | ProductStockOutput
): stock is ProductStockOutput {
  return !isVariantStock(stock);
}

/**
 * Determines if a product has no variants
 * @param product - Product stock to check
 * @returns true if product has no variants array or empty variants
 */
export function hasNoVariants(product: ProductStockOutput): boolean {
  return !product.variants || product.variants.length === 0;
}

/**
 * Determines if a product has variants
 * @param product - Product stock to check
 * @returns true if product has variants
 */
export function hasVariants(product: ProductStockOutput): boolean {
  return product.variants !== undefined && product.variants.length > 0;
}

// ============================================================================
// Stock Level Utilities
// ============================================================================

/**
 * Checks if a stock item is low on inventory
 * @param stock - Stock record
 * @returns true if stock is below reorder level
 */
export function isLowStock(stock: VariantStockOutput | ProductStockOutput): boolean {
  return stock.is_low_stock || (stock.reorder_level !== undefined && stock.current_stock < stock.reorder_level);
}

/**
 * Checks if a stock item is out of stock
 * @param stock - Stock record
 * @returns true if current stock is 0
 */
export function isOutOfStock(stock: VariantStockOutput | ProductStockOutput): boolean {
  return stock.current_stock === 0;
}

/**
 * Gets the stock level as a percentage of reorder level
 * @param stock - Stock record
 * @returns percentage (0-100+)
 */
export function getStockPercentage(stock: VariantStockOutput | ProductStockOutput): number {
  const reorderLevel = stock.reorder_level || 50;
  return (stock.current_stock / reorderLevel) * 100;
}

/**
 * Gets stock level status with detailed information
 * @param stock - Stock record
 * @returns StockLevelStatus object
 */
export function getStockStatus(stock: VariantStockOutput | ProductStockOutput): StockLevelStatus {
  const reorderLevel = stock.reorder_level || 50;
  const currentStock = stock.current_stock;
  const stockPercentage = (currentStock / reorderLevel) * 100;
  
  return {
    product_id: stock.product_id,
    variant_sku: isVariantStock(stock) ? stock.variant_sku : undefined,
    current_stock: currentStock,
    available_stock: stock.available_stock,
    reorder_level: reorderLevel,
    is_low_stock: isLowStock(stock),
    is_out_of_stock: isOutOfStock(stock),
    stock_percentage: stockPercentage,
    alert_message: getAlertMessage(currentStock, reorderLevel, isOutOfStock(stock)),
  };
}

/**
 * Generates an alert message based on stock level
 * @param currentStock - Current stock quantity
 * @param reorderLevel - Reorder level threshold
 * @param isOutOfStock - Whether item is out of stock
 * @returns Alert message string
 */
function getAlertMessage(currentStock: number, reorderLevel: number, outOfStock: boolean): string {
  if (outOfStock) return '🔴 Out of Stock';
  if (currentStock < reorderLevel / 2) return '🔴 Critical Low Stock';
  if (currentStock < reorderLevel) return '🟡 Low Stock';
  return '🟢 Adequate Stock';
}

// ============================================================================
// Stock Value Calculations
// ============================================================================

/**
 * Calculates the value of a stock item
 * @param stock - Stock record
 * @returns Stock value (units × average_cost)
 */
export function calculateStockValue(stock: VariantStockOutput | ProductStockOutput): number {
  return stock.current_stock * stock.average_cost;
}

/**
 * Calculates the potential selling value
 * @param stock - Stock record
 * @returns Selling value (units × selling_price)
 */
export function calculateSellingValue(stock: VariantStockOutput | ProductStockOutput): number {
  return stock.current_stock * (stock.selling_price || 0);
}

/**
 * Calculates the gross profit for a stock item
 * @param stock - Stock record
 * @returns Gross profit value
 */
export function calculateGrossProfit(stock: VariantStockOutput | ProductStockOutput): number {
  const sellingValue = calculateSellingValue(stock);
  const costValue = calculateStockValue(stock);
  return sellingValue - costValue;
}

/**
 * Calculates profit margin percentage
 * @param stock - Stock record
 * @returns Profit margin as percentage (0-100)
 */
export function calculateProfitMargin(stock: VariantStockOutput | ProductStockOutput): number {
  if (!stock.average_cost || !stock.selling_price) return 0;
  const profitPerUnit = stock.selling_price - stock.average_cost;
  return (profitPerUnit / stock.selling_price) * 100;
}

// ============================================================================
// Response Aggregation & Summaries
// ============================================================================

/**
 * Calculates a comprehensive stock value summary
 * @param response - Stock management response
 * @returns StockValueSummary object
 */
export function calculateStockSummary(response: StockManagementResponse | { stocks: (VariantStockOutput | ProductStockOutput)[] }): StockValueSummary {
  const stocks = response.stocks;
  
  const summary: StockValueSummary = {
    total_items: stocks.length,
    total_stock_value: 0,
    average_item_value: 0,
    total_units: 0,
    total_in_transit: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_cost_value: 0,
    total_selling_value: 0,
  };
  
  stocks.forEach(stock => {
    summary.total_stock_value += stock.stock_value;
    summary.total_units += stock.current_stock;
    summary.total_in_transit += stock.in_transit_stock || 0;
    summary.total_cost_value += stock.current_stock * stock.average_cost;
    summary.total_selling_value += stock.current_stock * (stock.selling_price || 0);
    
    if (isLowStock(stock)) summary.low_stock_items++;
    if (isOutOfStock(stock)) summary.out_of_stock_items++;
  });
  
  summary.average_item_value = stocks.length > 0 ? summary.total_stock_value / stocks.length : 0;
  
  return summary;
}

/**
 * Gets all low stock items from response
 * @param response - Stock management response
 * @returns Array of low stock items
 */
export function getLowStockItems(response: StockManagementResponse | { stocks: (VariantStockOutput | ProductStockOutput)[] }): (VariantStockOutput | ProductStockOutput)[] {
  return response.stocks.filter(isLowStock);
}

/**
 * Gets all out of stock items from response
 * @param response - Stock management response
 * @returns Array of out of stock items
 */
export function getOutOfStockItems(response: StockManagementResponse | { stocks: (VariantStockOutput | ProductStockOutput)[] }): (VariantStockOutput | ProductStockOutput)[] {
  return response.stocks.filter(isOutOfStock);
}

/**
 * Gets total stock for a specific product (all variants combined)
 * @param product - Product stock with variants
 * @returns Total units in stock
 */
export function getTotalProductStock(product: ProductStockOutput): number {
  if (hasVariants(product)) {
    return product.variants!.reduce((sum, v) => sum + v.current_stock, 0);
  }
  return product.current_stock;
}

/**
 * Gets available stock for a specific product (all variants combined)
 * @param product - Product stock with variants
 * @returns Total available units
 */
export function getTotalProductAvailable(product: ProductStockOutput): number {
  if (hasVariants(product)) {
    return product.variants!.reduce((sum, v) => sum + v.available_stock, 0);
  }
  return product.available_stock;
}

/**
 * Gets total value for a specific product (all variants combined)
 * @param product - Product stock with variants
 * @returns Total stock value
 */
export function getTotalProductValue(product: ProductStockOutput): number {
  if (hasVariants(product)) {
    return product.variants!.reduce((sum, v) => sum + v.stock_value, 0);
  }
  return product.stock_value;
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Filters stocks by low stock status
 * @param stocks - Array of stocks
 * @returns Filtered array
 */
export function filterLowStock(stocks: (VariantStockOutput | ProductStockOutput)[]): (VariantStockOutput | ProductStockOutput)[] {
  return stocks.filter(isLowStock);
}

/**
 * Filters stocks by out of stock status
 * @param stocks - Array of stocks
 * @returns Filtered array
 */
export function filterOutOfStock(stocks: (VariantStockOutput | ProductStockOutput)[]): (VariantStockOutput | ProductStockOutput)[] {
  return stocks.filter(isOutOfStock);
}

/**
 * Filters stocks by minimum stock level
 * @param stocks - Array of stocks
 * @param minStock - Minimum stock threshold
 * @returns Filtered array
 */
export function filterByMinStock(stocks: (VariantStockOutput | ProductStockOutput)[], minStock: number): (VariantStockOutput | ProductStockOutput)[] {
  return stocks.filter(s => s.current_stock >= minStock);
}

/**
 * Filters stocks by maximum stock level
 * @param stocks - Array of stocks
 * @param maxStock - Maximum stock threshold
 * @returns Filtered array
 */
export function filterByMaxStock(stocks: (VariantStockOutput | ProductStockOutput)[], maxStock: number): (VariantStockOutput | ProductStockOutput)[] {
  return stocks.filter(s => s.current_stock <= maxStock);
}

/**
 * Sorts stocks by specified criteria
 * @param stocks - Array of stocks
 * @param sortBy - Sort key
 * @param sortOrder - 'asc' or 'desc'
 * @returns Sorted array
 */
export function sortStocks(
  stocks: (VariantStockOutput | ProductStockOutput)[],
  sortBy: 'stock_value' | 'current_stock' | 'product_name' | 'available_stock' | 'reorder_level' = 'stock_value',
  sortOrder: 'asc' | 'desc' = 'desc'
): (VariantStockOutput | ProductStockOutput)[] {
  const sorted = [...stocks].sort((a, b) => {
    let compareA: any = a[sortBy as keyof typeof a];
    let compareB: any = b[sortBy as keyof typeof b];
    
    if (sortBy === 'product_name') {
      compareA = isVariantStock(a) ? a.variant_name : a.product_name;
      compareB = isVariantStock(b) ? b.variant_name : b.product_name;
    }
    
    if (typeof compareA === 'string') {
      return sortOrder === 'asc'
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    }
    
    return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
  });
  
  return sorted;
}

// ============================================================================
// Display Formatting
// ============================================================================

/**
 * Formats a stock name for display
 * @param stock - Stock record
 * @returns Formatted name string
 */
export function formatStockName(stock: VariantStockOutput | ProductStockOutput): string {
  if (isVariantStock(stock)) {
    return stock.variant_name;
  }
  return stock.product_name;
}

/**
 * Formats stock with attributes for display
 * @param stock - Stock record
 * @returns Formatted display string with attributes if applicable
 */
export function formatStockDisplay(stock: VariantStockOutput | ProductStockOutput): string {
  const name = formatStockName(stock);
  
  if (isVariantStock(stock)) {
    const attrs = Object.entries(stock.variant_attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `${name} (${attrs})`;
  }
  
  return name;
}

/**
 * Formats stock quantity with status
 * @param stock - Stock record
 * @returns Formatted quantity string
 */
export function formatStockQuantity(stock: VariantStockOutput | ProductStockOutput): string {
  const available = stock.available_stock;
  const current = stock.current_stock;
  const status = getAlertMessage(current, stock.reorder_level || 50, isOutOfStock(stock));
  
  if (stock.reserved_stock > 0) {
    return `${available}/${current} available/${current} total ${status}`;
  }
  
  return `${current} ${status}`;
}

/**
 * Formats monetary value
 * @param value - Numeric value
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats percentage value
 * @param value - Numeric percentage value
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// ============================================================================
// Batch Operations Helpers
// ============================================================================

/**
 * Builds a batch update input from multiple stocks
 * @param stocks - Array of stocks to update
 * @param adjustmentType - Type of adjustment ('add', 'subtract', 'set')
 * @param quantity - Quantity to adjust
 * @returns BatchStockUpdateInput ready for API call
 */
export function buildBatchUpdate(
  stocks: (VariantStockOutput | ProductStockOutput)[],
  adjustmentType: 'add' | 'subtract' | 'set',
  quantity: number
): BatchStockUpdateInput {
  return {
    updates: stocks.map(stock => ({
      product_id: stock.product_id,
      variant_sku: isVariantStock(stock) ? stock.variant_sku : undefined,
      adjustment_quantity: quantity,
      adjustment_type: adjustmentType,
    })),
  };
}

// ============================================================================
// Reorder Suggestions
// ============================================================================

/**
 * Generates reorder suggestions for low stock items
 * @param stocks - Array of stocks to analyze
 * @param defaultReorderQty - Default reorder quantity (e.g., 100)
 * @returns Array of reorder suggestions
 */
export function generateReorderSuggestions(
  stocks: (VariantStockOutput | ProductStockOutput)[],
  defaultReorderQty: number = 100
): ReorderSuggestion[] {
  return getLowStockItems({ stocks } as any)
    .map(stock => ({
      product_id: stock.product_id,
      variant_sku: isVariantStock(stock) ? stock.variant_sku : undefined,
      product_name: isVariantStock(stock) ? stock.variant_name : stock.product_name,
      current_stock: stock.current_stock,
      reorder_level: stock.reorder_level || 50,
      suggested_quantity: Math.max(defaultReorderQty, (stock.reorder_level || 50) * 2),
      reason: stock.current_stock === 0 ? 'Out of Stock' : 'Low Stock',
      estimated_cost: Math.max(defaultReorderQty, (stock.reorder_level || 50) * 2) * stock.average_cost,
      priority: stock.current_stock === 0 ? 'critical' : isLowStock(stock) ? 'high' : 'medium',
    }));
}

// ============================================================================
// Variant Utilities
// ============================================================================

/**
 * Parses variant attributes from variant name
 * @param variantName - Variant name string
 * @param separator - Separator character (default: ' - ')
 * @returns VariantAttributes object (simplified)
 */
export function parseVariantName(variantName: string, separator: string = ' - '): string[] {
  return variantName.split(separator).slice(1); // Skip product name
}

/**
 * Builds variant name from product name and attributes
 * @param productName - Product name
 * @param attributes - Variant attributes
 * @returns Formatted variant name
 */
export function buildVariantName(productName: string, attributes: VariantAttributes): string {
  const attrStr = Object.values(attributes).join(' - ');
  return `${productName} - ${attrStr}`;
}

/**
 * Builds variant SKU from base SKU and attribute values
 * @param baseSku - Base product SKU
 * @param attributes - Variant attributes
 * @param separator - Separator character (default: '-')
 * @returns Formatted variant SKU
 */
export function buildVariantSku(baseSku: string, attributes: VariantAttributes, separator: string = '-'): string {
  const attrValues = Object.values(attributes)
    .map(v => v.toUpperCase().substring(0, 3)) // First 3 chars
    .join(separator);
  return `${baseSku}${separator}${attrValues}`;
}

export default {
  // Type Guards
  isVariantStock,
  isProductStock,
  hasVariants,
  hasNoVariants,
  
  // Stock Level Utilities
  isLowStock,
  isOutOfStock,
  getStockPercentage,
  getStockStatus,
  
  // Stock Value Calculations
  calculateStockValue,
  calculateSellingValue,
  calculateGrossProfit,
  calculateProfitMargin,
  
  // Response Aggregation
  calculateStockSummary,
  getLowStockItems,
  getOutOfStockItems,
  getTotalProductStock,
  getTotalProductAvailable,
  getTotalProductValue,
  
  // Filtering & Sorting
  filterLowStock,
  filterOutOfStock,
  filterByMinStock,
  filterByMaxStock,
  sortStocks,
  
  // Display Formatting
  formatStockName,
  formatStockDisplay,
  formatStockQuantity,
  formatCurrency,
  formatPercentage,
  
  // Batch Operations
  buildBatchUpdate,
  
  // Reorder Suggestions
  generateReorderSuggestions,
  
  // Variant Utilities
  parseVariantName,
  buildVariantName,
  buildVariantSku,
};
