import {
  SalesOrder,
  CreateSalesOrderRequest,
  LineItem,
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
      if (!item.item_id) throw new Error(`Line item ${index + 1}: item_id is required`);
      if (item.quantity === undefined || item.quantity === null) throw new Error(`Line item ${index + 1}: quantity is required`);
      if (item.rate === undefined || item.rate === null) throw new Error(`Line item ${index + 1}: rate is required`);

      const lineItem: any = {
        item_id: item.item_id,
        quantity: item.quantity,
        rate: item.rate,
      };
      
      // Only include optional fields if they have values
      if (item.description) {
        lineItem.description = item.description;
      }
      if (item.variant_id !== undefined && item.variant_id !== null) {
        lineItem.variant_id = item.variant_id;
      }
      // Include variant_sku if available
      if (item.variant_sku) {
        lineItem.variant_sku = item.variant_sku;
      }
      // Include variant_details if available
      if (item.variant_details && Object.keys(item.variant_details).length > 0) {
        lineItem.variant_details = item.variant_details;
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

export const calculateTotal = (so: SalesOrder): number => {
  const subtotal = so.line_items.reduce((sum, item) => {
    return sum + (item.quantity * item.rate);
  }, 0);

  const taxAmount = so.tax_id && so.tax ? (subtotal * so.tax.rate / 100) : 0;
  const total = subtotal + (so.shipping_charges || 0) + taxAmount + (so.adjustment || 0);

  return Math.round(total * 100) / 100;
};

export const calculateSubtotal = (so: SalesOrder): number => {
  return so.line_items.reduce((sum, item) => {
    return sum + (item.quantity * item.rate);
  }, 0);
};

export const calculateTax = (so: SalesOrder): number => {
  const subtotal = calculateSubtotal(so);
  return so.tax_id && so.tax ? (subtotal * so.tax.rate / 100) : 0;
};
