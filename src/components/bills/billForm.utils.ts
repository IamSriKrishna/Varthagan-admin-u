import {
  Bill,
  CreateBillRequest,
  LineItem,
} from '@/models/bill.model';

export const initialBillValues: Bill = {
  id: '',
  bill_number: '',
  vendor_id: 0,
  purchase_order_id: '',
  billing_address: '',
  order_number: '',
  bill_date: new Date().toISOString().split('T')[0],
  due_date: new Date().toISOString().split('T')[0],
  payment_terms: 'net_30',
  subject: '',
  line_items: [],
  sub_total: 0,
  discount: 0,
  tax_id: undefined,
  tax_amount: 0,
  adjustment: 0,
  total: 0,
  notes: '',
  status: 'draft',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const transformBillToPayload = (bill: Bill): CreateBillRequest => {
  // Convert date to ISO format if it's just a date string
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    if (dateStr.includes('T')) return dateStr;
    return `${dateStr}T00:00:00Z`;
  };

  const payload: CreateBillRequest = {
    vendor_id: bill.vendor_id,
    bill_number: bill.bill_number,
    purchase_order_id: bill.purchase_order_id,
    billing_address: bill.billing_address,
    order_number: bill.order_number,
    bill_date: formatDateToISO(bill.bill_date),
    due_date: formatDateToISO(bill.due_date),
    payment_terms: bill.payment_terms,
    subject: bill.subject,
    line_items: bill.line_items.map((item) => ({
      item_id: item.item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku || item.variant_sku,
      variant_sku: item.variant_sku,
      quantity: item.quantity,
      rate: item.rate,
      description: item.description || '',
      account: item.account,
      variant_details: item.variant_details,
    })),
    discount: bill.discount,
    tax_type: bill.tax_type,
    tax_id: bill.tax_id ?? 0,
    adjustment: bill.adjustment,
    notes: bill.notes || '',
  };

  return payload;
};

export const calculateLineItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

export const calculateSubTotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((total, item) => total + (item.amount || 0), 0);
};

export const calculateDiscountAmount = (
  subTotal: number,
  discount: number
): number => {
  return discount;
};

export const calculateTaxAmount = (
  subTotal: number,
  discount: number,
  taxRate: number
): number => {
  const taxableAmount = subTotal - discount;
  return (taxableAmount * taxRate) / 100;
};

export const calculateTotal = (
  subTotal: number,
  discount: number,
  tax: number,
  adjustment: number
): number => {
  return subTotal - discount + tax + adjustment;
};
