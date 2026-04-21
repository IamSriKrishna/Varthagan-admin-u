export interface ILineItem {
  id?: string | number;
  item_id: string;
  item?: {
    id: string;
    name: string;
    sku?: string;
  };
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ITax {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

export interface ISalesperson {
  id: number;
  name: string;
  email: string;
}

export interface ICustomerContact {
  id: number;
  display_name: string;
  company_name: string;
  email: string;
  phone: string;
}

export interface IInvoice {
  id?: string;
  invoice_number: string;
  customer_id: number;
  customer?: ICustomerContact;
  order_number?: string;
  invoice_date: string;
  due_date: string;
  terms: string;
  salesperson_id?: number;
  salesperson?: ISalesperson;
  subject: string;
  line_items: ILineItem[];
  sub_total: number;
  shipping_charges: number;
  tax_type?: string;
  tax_id?: number;
  tax?: ITax;
  tax_amount: number;
  adjustment: number;
  total: number;
  customer_notes?: string;
  terms_and_conditions?: string;
  status: "draft" | "issued" | "sent" | "partial" | "paid" | "overdue" | "void";
  payment_received?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IInvoiceResponse {
  success: boolean;
  message: string;
  data?: IInvoice;
  invoices?: IInvoice[];
  total?: number;
}

export interface IInvoiceListResponse {
  success: boolean;
  message: string;
  invoices: IInvoice[];
  total: number;
}

export interface ICreateInvoicePayload {
  customer_id: number;
  invoice_date: string;
  due_date: string;
  terms: string;
  subject: string;
  salesperson_id?: number;
  line_items: ILineItem[];
  shipping_charges: number;
  tax_id?: number;
  adjustment: number;
  customer_notes?: string;
  terms_and_conditions?: string;
  order_number?: string;
}
