import {
  SalesOrder,
  CreateSalesOrderRequest,
  LineItem,
  SalesOrderLineItemInput,
  SalesOrderLineItemOutput,
} from '@/models/salesOrder.model';

export const initialSalesOrderValues: SalesOrder = {
  customer_id: 0,
  reference_no: '',
  sales_order_date: new Date().toISOString().split('T')[0],
  expected_shipment_date: new Date().toISOString().split('T')[0],
  payment_terms: 'Net 15',
  delivery_method: 'Courier',
  salesperson_id: undefined,
  line_items: [],
  shipping_charges: 0,
  tax_id: 0,
  adjustment: 0,
  customer_notes: '',
  terms_and_conditions: '',
};

/**
 * Create a new blank line item with optional defaults
 */
export const createBlankLineItem = (
  overrides?: Partial<SalesOrderLineItemInput>
): SalesOrderLineItemInput => {
  return {
    quantity: 1,
    rate: 0,
    ...overrides,
  };
};

export const transformSOToPayload = (
  so: SalesOrder
): CreateSalesOrderRequest => {
  // Validate line items
  if (!so.line_items || so.line_items.length === 0) {
    throw new Error('At least one line item is required');
  }

  // Convert date to ISO format if it's just a date string
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    // If it already has T in it, it's probably already ISO format
    if (dateStr.includes('T')) return dateStr;
    // Otherwise, append time (10:00:00) and Z for ISO format
    return `${dateStr}T10:00:00Z`;
  };

  const payload: any = {
    customer_id: so.customer_id,
    reference_no: so.reference_no,
    sales_order_date: formatDateToISO(so.sales_order_date),
    expected_shipment_date: formatDateToISO(so.expected_shipment_date),
    payment_terms: so.payment_terms,
    delivery_method: so.delivery_method,
    line_items: so.line_items.map((item, index) => {
      // Validate required fields
      if (!item.product_id) throw new Error(`Line item ${index + 1}: product is required`);
      if (item.quantity === undefined || item.quantity === null) throw new Error(`Line item ${index + 1}: quantity is required`);
      if (item.rate === undefined || item.rate === null) throw new Error(`Line item ${index + 1}: rate is required`);

      const lineItem: any = {
        product_id: item.product_id,
        product_name: item.product_name || '',
        quantity: item.quantity,
        rate: item.rate,
      };
      
      // Include optional fields if they have values
      if (item.description) {
        lineItem.description = item.description;
      }
      if (item.sku) {
        lineItem.sku = item.sku;
      }
      if (item.account) {
        lineItem.account = item.account;
      }
      if (item.variant_id !== undefined && item.variant_id !== null) {
        lineItem.variant_id = item.variant_id;
      }
      // Include variant_sku if available
      if (item.variant_sku) {
        lineItem.variant_sku = item.variant_sku;
      }
      // Include variant_name if available
      if (item.variant_name) {
        lineItem.variant_name = item.variant_name;
      }
      // Include variant_details if available
      if (item.variant_details && Object.keys(item.variant_details).length > 0) {
        lineItem.variant_details = item.variant_details;
      }
      // Include item_id if available (for cross-reference)
      if (item.item_id) {
        lineItem.item_id = item.item_id;
      }
      
      return lineItem;
    }),
    shipping_charges: so.shipping_charges || 0,
    tax_id: so.tax_id,
    adjustment: so.adjustment || 0,
    customer_notes: so.customer_notes || '',
    terms_and_conditions: so.terms_and_conditions || '',
  };

  // Only add tax_rate if it's a valid number
  if (so.tax?.rate && typeof so.tax.rate === 'number') {
    payload.tax_rate = so.tax.rate;
  }

  if (so.salesperson_id) {
    payload.salesperson_id = so.salesperson_id;
  }

  return payload;
};

/**
 * Validate a line item
 */
export const validateLineItem = (item: SalesOrderLineItemInput | LineItem): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.product_id && !('product_name' in item && item.product_name)) {
    errors.push('Product ID or Product name is required');
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (item.rate === undefined || item.rate === null || item.rate < 0) {
    errors.push('Rate must be greater than or equal to 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Check if line item is a variant line item
 */
export const isVariantLineItem = (
  item: SalesOrderLineItemInput | LineItem | SalesOrderLineItemOutput
): boolean => {
  return !!('variant_sku' in item && item.variant_sku);
};

/**
 * Get variant display information
 */
export const getVariantDisplay = (
  item: SalesOrderLineItemInput | LineItem | SalesOrderLineItemOutput
): { name: string; attributes: string } => {
  const name = 'variant_name' in item ? item.variant_name || '' : '';
  
  let attributes = '';
  if ('variant_details' in item && item.variant_details && Object.keys(item.variant_details).length > 0) {
    attributes = Object.entries(item.variant_details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  return { name, attributes };
};

/**
 * Format line item for display
 */
export const formatLineItemDisplay = (
  item: SalesOrderLineItemInput | LineItem | SalesOrderLineItemOutput
): string => {
  const productName = 'product_name' in item ? item.product_name || 'Unknown Product' : 'Unknown Product';
  
  if (isVariantLineItem(item)) {
    const { name, attributes } = getVariantDisplay(item);
    if (name) {
      return attributes ? `${name} (${attributes})` : name;
    }
  }

  const sku = 'variant_sku' in item && item.variant_sku ? item.variant_sku : 'sku' in item ? item.sku : '';
  if (sku) {
    return `${productName} (${sku})`;
  }

  return productName;
};

/**
 * Calculate line item amount
 */
export const calculateLineItemAmount = (quantity: number, rate: number): number => {
  return Number((quantity * rate).toFixed(2));
};;

export const calculateTotal = (so: SalesOrder): number => {
  const subtotal = so.line_items.reduce((sum, item) => {
    return sum + (item.quantity * item.rate);
  }, 0);

  const taxAmount = so.tax_id && so.tax ? (subtotal * so.tax.rate / 100) : 0;
  const total = subtotal + (so.shipping_charges || 0) + taxAmount + (so.adjustment || 0);

  return Math.round(total * 100) / 100;
};

export const calculateSubtotal = (so: SalesOrder | SalesOrderLineItemInput[] | LineItem[]): number => {
  if (Array.isArray(so)) {
    return so.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);
  }
  
  return so.line_items.reduce((sum, item) => {
    return sum + (item.quantity * item.rate);
  }, 0);
};

export const calculateTax = (so: SalesOrder): number => {
  const subtotal = Array.isArray(so) ? calculateSubtotal(so) : calculateSubtotal(so);
  return so.tax_id && 'tax' in so && so.tax ? (subtotal * so.tax.rate / 100) : 0;
};

/**
 * Calculate tax amount from subtotal and tax rate
 */
export const calculateTaxAmount = (subtotal: number, shippingCharges: number, taxRate: number): number => {
  const taxableAmount = subtotal + shippingCharges;
  return Number(((taxableAmount * taxRate) / 100).toFixed(2));
};

/**
 * Calculate total with all components
 */
export const calculateTotalAmount = (
  subtotal: number,
  shippingCharges: number,
  taxAmount: number,
  adjustment: number = 0
): number => {
  return Number((subtotal + shippingCharges + taxAmount + adjustment).toFixed(2));
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch {
    return dateString;
  }
};

/**
 * Get sales order status badge color
 */
export const getStatusBadgeColor = (
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'destructive' => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'default';
    case 'sent':
    case 'confirmed':
      return 'primary';
    case 'partial_shipped':
    case 'shipped':
      return 'warning';
    case 'delivered':
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  return status
    ?.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Unknown';
};

/**
 * Generate sales order reference number
 */
export const generateSOReference = (prefix: string = 'SO'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export default {
  initialSalesOrderValues,
  createBlankLineItem,
  transformSOToPayload,
  validateLineItem,
  isVariantLineItem,
  getVariantDisplay,
  formatLineItemDisplay,
  calculateLineItemAmount,
  calculateTotal,
  calculateSubtotal,
  calculateTax,
  calculateTaxAmount,
  calculateTotalAmount,
  formatCurrency,
  formatDate,
  getStatusBadgeColor,
  formatStatus,
  generateSOReference,
};
