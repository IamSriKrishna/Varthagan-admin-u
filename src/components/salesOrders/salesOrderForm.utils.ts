import {
  SalesOrder,
  CreateSalesOrderRequest,
  LineItem,
  SalesOrderLineItemInput,
  SalesOrderLineItemOutput,
} from '@/models/salesOrder.model';

export const initialSalesOrderValues: Partial<SalesOrder> = {
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
 * Uses Manufacturers for manufacturing batch management
 */
export const createBlankLineItem = (
  overrides?: Partial<SalesOrderLineItemInput>
): SalesOrderLineItemInput => {
  return {
    manufacturer_id: '',
    manufacturer_name: '',
    account: 'SALES',
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
    sales_order_date: formatDateToISO(so.sales_order_date || new Date().toISOString().split('T')[0]),
    expected_shipment_date: formatDateToISO(so.expected_shipment_date || new Date().toISOString().split('T')[0]),
    payment_terms: so.payment_terms,
    delivery_method: so.delivery_method,
    line_items: so.line_items.map((item, index) => {
      // Validate required fields for manufacturers
      if (!item.manufacturer_id) throw new Error(`Line item ${index + 1}: manufacturer is required`);
      if (!item.manufacturer_name) throw new Error(`Line item ${index + 1}: manufacturer name is required`);
      if (item.quantity === undefined || item.quantity === null) throw new Error(`Line item ${index + 1}: quantity is required`);
      if (item.rate === undefined || item.rate === null) throw new Error(`Line item ${index + 1}: rate is required`);
      if (!item.account) throw new Error(`Line item ${index + 1}: account is required`);

      const lineItem: any = {
        manufacturer_id: item.manufacturer_id,
        manufacturer_name: item.manufacturer_name,
        quantity: item.quantity,
        rate: item.rate,
        account: item.account,
      };
      
      return lineItem;
    }),
    shipping_charges: so.shipping_charges || 0,
    tax_id: so.tax_id,
    tax_rate: so.tax_rate || 0,
    adjustment: so.adjustment || 0,
    customer_notes: so.customer_notes || '',
    terms_and_conditions: so.terms_and_conditions || '',
  };

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

  if (!item.manufacturer_id) {
    errors.push('Manufacturer ID is required');
  }

  if (!item.manufacturer_name) {
    errors.push('Manufacturer name is required');
  }

  if (!item.account) {
    errors.push('Account is required');
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (item.rate === undefined || item.rate === null || item.rate <= 0) {
    errors.push('Rate must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Check if line item is a variant line item (deprecated - kept for backward compatibility)
 */
export const isVariantLineItem = (
  _item: SalesOrderLineItemInput | LineItem | SalesOrderLineItemOutput
): boolean => {
  // For Product Groups, this is always false
  return false;
};

/**
 * Get variant display information (deprecated - kept for backward compatibility)
 */
export const getVariantDisplay = (
  _item: SalesOrderLineItemInput | LineItem | SalesOrderLineItemOutput
): { name: string; attributes: string } => {
  // For Product Groups, return empty values
  return { name: '', attributes: '' };
};

/**
 * Format line item for display
 */
export const formatLineItemDisplay = (
  item: any
): string => {
  // For Manufacturers, use manufacturer_name
  if ('manufacturer_name' in item) {
    return item.manufacturer_name || 'Unknown Manufacturer';
  }
  
  // Fallback for backward compatibility
  if ('product_name' in item) {
    return item.product_name || 'Unknown Product';
  }

  return 'Unknown Manufacturer';
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
 * Transform API response to form initial values
 * Handles field mappings and date conversions
 */
export const transformAPIResponseToFormValues = (apiData: any): SalesOrder => {
  if (!apiData) return initialSalesOrderValues as SalesOrder;

  // Some API responses wrap the object in a `data` field (or double-wrap).
  // Unwrap common shapes so the form gets the actual sales order object.
  let payload = apiData;
  if (payload && payload.data && (payload.data.id || payload.data.sales_order_no || payload.data.line_items)) {
    payload = payload.data;
  }

  // Convert date string to YYYY-MM-DD format if needed
  const formatDateForInput = (dateStr: string | undefined): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Otherwise, parse and format
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return {
    ...payload,
    // Map 'date' to 'sales_order_date' if not already present
    sales_order_date: apiData.sales_order_date || formatDateForInput(apiData.date),
    // Ensure customer_id and salesperson_id are present (handle nested objects)
    customer_id: payload.customer_id ?? (payload.customer && payload.customer.id) ?? 0,
    salesperson_id: payload.salesperson_id ?? (payload.salesperson && payload.salesperson.id) ?? undefined,
    expected_shipment_date: formatDateForInput(payload.expected_shipment_date),
    // Ensure line_items is an array
    line_items: Array.isArray(payload.line_items) ? payload.line_items : [],
    // Ensure shipping_charges is a number
    shipping_charges: payload.shipping_charges ?? 0,
    // Ensure adjustment is a number
    adjustment: payload.adjustment ?? 0,
    // Ensure optional fields exist
    customer_notes: payload.customer_notes || '',
    terms_and_conditions: payload.terms_and_conditions || '',
    payment_terms: payload.payment_terms || 'Net 15',
    delivery_method: payload.delivery_method || 'Courier',
  };
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
  transformAPIResponseToFormValues,
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
