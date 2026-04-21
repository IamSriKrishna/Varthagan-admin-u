export const PAYMENT_TERMS = [
  { label: 'Due on Receipt', value: 'due_on_receipt' },
  { label: 'Net 15', value: 'net_15' },
  { label: 'Net 30', value: 'net_30' },
  { label: 'Net 45', value: 'net_45' },
  { label: 'Net 60', value: 'net_60' },
];

export const SHIPMENT_PREFERENCES = [
  { label: 'Standard Shipping', value: 'standard_shipping' },
  { label: 'Express Delivery', value: 'express_delivery' },
  { label: 'Priority Delivery', value: 'priority_delivery' },
  { label: 'Overnight Shipping', value: 'overnight_shipping' },
  { label: 'Courier', value: 'courier' },
];

export const DISCOUNT_TYPES = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Amount', value: 'amount' },
];

export const TAX_TYPES = [
  { label: 'TDS (Tax Deducted at Source)', value: 'tds' },
  { label: 'TCS (Tax Collected at Source)', value: 'tcs' },
];

export const DELIVERY_ADDRESS_TYPES = [
  { label: 'Organization', value: 'organization' },
  { label: 'Customer', value: 'customer' },
];

export const PO_STATUS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Partially Received', value: 'partially_received' },
  { label: 'Received', value: 'received' },];

// API Endpoints
export const PURCHASE_ORDER_ENDPOINTS = {
  GET_ALL: '/purchase-orders',
  GET_ONE: (id: string) => `/purchase-orders/${id}`,
  CREATE: '/purchase-orders',
  UPDATE: (id: string) => `/purchase-orders/${id}`,
  DELETE: (id: string) => `/purchase-orders/${id}`,
  UPDATE_STATUS: (id: string) => `/purchase-orders/${id}/status`, 
  SEARCH: '/purchase-orders/search',
};
