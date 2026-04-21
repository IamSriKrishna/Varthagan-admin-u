import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  PurchaseOrderLineItemOutput,
  PurchaseOrderLineItemInput,
} from '@/models/purchaseOrder.model';

export const initialPurchaseOrderValues: PurchaseOrder = {
  vendor_id: 0,
  delivery_address_type: 'organization',
  organization_name: '',
  organization_address: '',
  customer_id: undefined,
  reference_no: '',
  date: new Date().toISOString().split('T')[0],
  delivery_date: new Date().toISOString().split('T')[0],
  payment_terms: 'net_30',
  shipment_preference: 'standard_shipping',
  line_items: [],
  discount: 0,
  discount_type: 'amount',
  tax_type: 'tds',
  tax_id: 0,
  adjustment: 0,
  notes: '',
  terms_and_conditions: '',
};

export const transformPOToPayload = (
  po: PurchaseOrder
): CreatePurchaseOrderRequest => {
  // Validate line items
  if (!po.line_items || po.line_items.length === 0) {
    throw new Error('At least one line item is required');
  }

  // Convert date to ISO format if it's just a date string
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    // If it already has T in it, it's probably already ISO format
    if (dateStr.includes('T')) return dateStr;
    // Otherwise, append time and Z for ISO format
    return `${dateStr}T00:00:00Z`;
  };

  const payload: any = {
    vendor_id: po.vendor_id,
    delivery_address_type: po.delivery_address_type,
    date: formatDateToISO(po.date),
    delivery_date: formatDateToISO(po.delivery_date),
    payment_terms: po.payment_terms,
    line_items: po.line_items.map((item: any, index: number) => {
      // Validate required fields for line items
      if (!item.account) throw new Error(`Line item ${index + 1}: account is required`);
      if (item.quantity === undefined || item.quantity === null) throw new Error(`Line item ${index + 1}: quantity is required`);
      if (item.rate === undefined || item.rate === null) throw new Error(`Line item ${index + 1}: rate is required`);

      const lineItem: PurchaseOrderLineItemInput = {
        account: item.account,
        quantity: item.quantity,
        rate: item.rate,
      };

      // Add product/item identifying fields
      if (item.product_id) {
        lineItem.product_id = item.product_id;
      }
      if (item.product_name) {
        lineItem.product_name = item.product_name;
      }
      // Map variant_sku to sku for backend
      if (item.variant_sku) {
        lineItem.sku = item.variant_sku;
      }

      return lineItem;
    }),
  };

  // Add optional fields only if they have values
  if (po.reference_no) {
    payload.reference_no = po.reference_no;
  }
  if (po.shipment_preference) {
    payload.shipment_preference = po.shipment_preference;
  }
  if (po.discount !== undefined && po.discount !== null && po.discount > 0) {
    payload.discount = po.discount;
  }
  if (po.discount_type && po.discount_type !== 'amount') {
    payload.discount_type = po.discount_type;
  }
  if (po.tax_type) {
    payload.tax_type = po.tax_type;
  }
  if (po.tax_id && po.tax_id > 0) {
    payload.tax_id = po.tax_id;
  }
  if (po.adjustment !== undefined && po.adjustment !== null && po.adjustment > 0) {
    payload.adjustment = po.adjustment;
  }
  if (po.notes) {
    payload.notes = po.notes;
  }
  if (po.terms_and_conditions) {
    payload.terms_and_conditions = po.terms_and_conditions;
  }

  // Handle delivery address based on type
  if (po.delivery_address_type === 'organization') {
    if (!po.organization_name) throw new Error('Organization name is required');
    if (!po.organization_address) throw new Error('Organization address is required');

    payload.organization_name = po.organization_name;
    payload.organization_address = po.organization_address;
  } else if (po.delivery_address_type === 'customer') {
    if (!po.customer_id) throw new Error('Customer is required');

    // Ensure customer_id is a number
    payload.customer_id =
      typeof po.customer_id === 'string' ? parseInt(po.customer_id, 10) : po.customer_id;
  }

  console.log('Final payload being sent:', payload);
  return payload as CreatePurchaseOrderRequest;
};

export const calculateLineItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

export const calculateSubTotal = (lineItems: PurchaseOrderLineItemOutput[]): number => {
  return lineItems.reduce((total, item) => total + (item.amount || 0), 0);
};

export const calculateDiscountAmount = (
  subTotal: number,
  discount: number | string,
  discountType: 'percentage' | 'amount'
): number => {
  const discountNum = typeof discount === 'string' ? parseFloat(discount) || 0 : discount || 0;
  if (discountType === 'percentage') {
    return (subTotal * discountNum) / 100;
  }
  return discountNum;
};

export const calculateTaxAmount = (
  subTotal: number,
  discount: number | string,
  discountType: 'percentage' | 'amount',
  taxRate: number | string
): number => {
  const discountAmount = calculateDiscountAmount(subTotal, discount, discountType);
  const taxableAmount = subTotal - discountAmount;
  const taxRateNum = typeof taxRate === 'string' ? parseFloat(taxRate) || 0 : taxRate || 0;
  return (taxableAmount * taxRateNum) / 100;
};

export const calculateTotal = (
  subTotal: number,
  discount: number | string,
  discountType: 'percentage' | 'amount',
  tax: number | string,
  adjustment: number | string
): number => {
  const discountAmount = calculateDiscountAmount(subTotal, discount, discountType);
  const taxNum = typeof tax === 'string' ? parseFloat(tax) || 0 : tax || 0;
  const adjustmentNum = typeof adjustment === 'string' ? parseFloat(adjustment) || 0 : adjustment || 0;
  return subTotal - discountAmount + taxNum + adjustmentNum;
};
