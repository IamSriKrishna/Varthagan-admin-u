// ============================================================================
// Invoice Input/Request Types (aligned with Go backend)
// ============================================================================

/**
 * Invoice Line Item Input
 * Matches Go: InvoiceLineItemInput
 */
export interface InvoiceLineItemInput {
  product_id?: string;              // Optional: Product identifier
  product_name: string;             // Required: Product name
  sku?: string;                     // Optional: Product SKU
  account?: string;                 // Optional: Accounting code
  quantity: number;                 // Required: Quantity (> 0)
  rate: number;                     // Required: Unit price (> 0)
}

/**
 * Payment Split Input
 * Matches Go: PaymentSplitInput
 */
export interface PaymentSplitInput {
  payment_mode: string;             // Required: Payment mode (e.g., CASH, CHEQUE, NEFT)
  deposit_to?: string;              // Optional: Deposit account details
  amount_received: number;          // Required: Amount received (>= 0)
}

/**
 * Create Invoice Request
 * Matches Go: CreateInvoiceInput
 * 
 * Example Request:
 * {
 *   "customer_id": 1,
 *   "sales_order_id": "so_a1b2c3d4",
 *   "order_number": "ORD-2024-001",
 *   "invoice_date": "2024-04-08T10:00:00Z",
 *   "terms": "NET_30",
 *   "due_date": "2024-05-08T10:00:00Z",
 *   "payment_terms": "Due within 30 days",
 *   "salesperson_id": 1,
 *   "subject": "Invoice for Water Bottles Order",
 *   "line_items": [
 *     {
 *       "product_id": "prod_28ccf422",
 *       "product_name": "Water Bottle",
 *       "sku": "WB-001-RED",
 *       "account": "Cost of Goods Sold",
 *       "quantity": 900,
 *       "rate": 500
 *     }
 *   ],
 *   "shipping_charges": 500.00,
 *   "tax_id": 1,
 *   "tax_type": "GST",
 *   "adjustment": 0.00,
 *   "customer_notes": "Please deliver by Friday",
 *   "terms_and_conditions": "Payment terms: Net 30 days...",
 *   "attachments": ["invoice_terms.pdf"],
 *   "payment_splits": [
 *     {
 *       "payment_mode": "bank_transfer",
 *       "deposit_to": "Main Account",
 *       "amount_received": 15000.00
 *     }
 *   ],
 *   "email_recipients": ["buyer@company.com", "admin@company.com"]
 * }
 */
export interface CreateInvoiceRequest {
  customer_id: number;              // Required: Customer identifier
  sales_order_id?: string;          // Optional: Sales order ID (e.g., "so_a1b2c3d4")
  order_number?: string;            // Optional: Order number reference (e.g., "ORD-2024-001")
  invoice_date: string;             // Required: Invoice date (ISO 8601, e.g., "2024-04-08T10:00:00Z")
  terms: string;                    // Required: Payment terms (e.g., "NET_30")
  due_date: string;                 // Required: Due date (ISO 8601)
  payment_terms?: string;           // Optional: Full payment terms description (e.g., "Due within 30 days")
  salesperson_id?: number;          // Optional: Salesperson identifier
  subject?: string;                 // Optional: Invoice subject/description
  line_items: InvoiceLineItemInput[]; // Required: Line items (min 1)
  shipping_charges?: number;        // Optional: Shipping charges (>= 0)
  tax_id?: number;                  // Optional: Tax configuration ID
  tax_type?: string;                // Optional: Tax type (e.g., "GST", "VAT", "TDS")
  adjustment?: number;              // Optional: Adjustment amount (can be positive or negative)
  customer_notes?: string;          // Optional: Notes for customer
  terms_and_conditions?: string;    // Optional: Specific T&C for this invoice
  attachments?: string[];           // Optional: Attachment URLs (e.g., ["invoice_terms.pdf"])
  payment_received?: boolean;       // Optional: Payment received flag
  payment_splits?: PaymentSplitInput[]; // Optional: Payment split details
  email_recipients?: string[];      // Optional: Email addresses for invoice (e.g., ["buyer@company.com"])
}

/**
 * Update Invoice Request
 * All fields optional for partial updates
 * Matches Go: UpdateInvoiceInput
 */
export interface UpdateInvoiceRequest {
  customer_id?: number;
  sales_order_id?: string;
  order_number?: string;
  invoice_date?: string;
  terms?: string;
  due_date?: string;
  payment_terms?: string;
  salesperson_id?: number;
  subject?: string;
  line_items?: InvoiceLineItemInput[];
  shipping_charges?: number;
  tax_type?: string;
  tax_id?: number;
  adjustment?: number;
  customer_notes?: string;
  terms_and_conditions?: string;
  attachments?: string[];
  payment_received?: boolean;
  payment_splits?: PaymentSplitInput[];
  email_recipients?: string[];
}

/**
 * Invoice Status Update Request
 * Matches Go: InvoiceStatusUpdateInput
 */
export interface InvoiceStatusUpdateRequest {
  status: 'draft' | 'issued' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';
}

/**
 * Create Payment Request
 * Matches Go: CreatePaymentInput
 */
export interface CreatePaymentRequest {
  invoice_id: string;               // Required: Invoice ID
  payment_date: string;             // Required: Payment date (ISO 8601)
  amount: number;                   // Required: Payment amount (> 0)
  payment_mode: string;             // Required: Payment mode
  reference?: string;               // Optional: Reference number
  notes?: string;                   // Optional: Payment notes
}

/**
 * Create Salesperson Request
 * Matches Go: CreateSalespersonInput
 */
export interface CreateSalespersonRequest {
  name: string;                     // Required: Salesperson name
  email: string;                    // Required: Salesperson email
}

/**
 * Update Salesperson Request
 * Matches Go: UpdateSalespersonInput
 */
export interface UpdateSalespersonRequest {
  name?: string;
  email?: string;
}

/**
 * Create Tax Request
 * Matches Go: CreateTaxInput
 */
export interface CreateTaxRequest {
  name: string;                     // Required: Tax name
  tax_type: string;                 // Required: Tax type
  rate: number;                     // Required: Tax rate (0-100)
}

/**
 * Update Tax Request
 * Matches Go: UpdateTaxInput
 */
export interface UpdateTaxRequest {
  name?: string;
  tax_type?: string;
  rate?: number;
}

// ============================================================================
// Invoice Output/Response Types (aligned with Go backend)
// ============================================================================

/**
 * Customer Info (embedded in InvoiceOutput)
 * Matches Go: CustomerInfo
 */
export interface CustomerInfo {
  id: number;
  display_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

/**
 * Salesperson Info (embedded in InvoiceOutput)
 * Matches Go: SalespersonInfo
 */
export interface SalespersonInfo {
  id: number;
  name: string;
  email: string;
}

/**
 * Tax Info (embedded in InvoiceOutput)
 * Matches Go: TaxInfo
 */
export interface TaxInfo {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
}

/**
 * Invoice Line Item Output
 * Matches Go: InvoiceLineItemOutput
 */
export interface InvoiceLineItemOutput {
  product_id?: string;              // Product identifier
  product_name: string;             // Product name
  sku: string;                      // Product/variant SKU
  account?: string;                 // Accounting code
  quantity: number;                 // Quantity
  rate: number;                     // Unit price
  amount: number;                   // Total amount (quantity × rate)
  variant_sku?: string;             // Variant-specific SKU
  variant_details?: Record<string, any>; // Variant attributes
}

/**
 * Payment Output
 * Matches Go: PaymentOutput
 */
export interface PaymentOutput {
  id: number;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

/**
 * Payment Split Output
 * Matches Go: PaymentSplitOutput
 */
export interface PaymentSplitOutput {
  id: number;
  invoice_id: string;
  payment_mode: string;
  deposit_to: string;
  amount_received: number;
  created_at: string;
  created_by?: string;
}

/**
 * Email Communication Output
 * Matches Go: EmailCommunicationOutput
 */
export interface EmailCommunicationOutput {
  id: number;
  invoice_id: string;
  email_address: string;
  subject: string;
  status: string;
  created_at: string;
  created_by?: string;
  sent_at?: string;
}

/**
 * Invoice Output
 * Matches Go: InvoiceOutput
 * 
 * Example Response:
 * {
 *   "id": "inv_515d0bc1",
 *   "invoice_number": "INV-000004",
 *   "sales_order_id": "so_a1b2c3d4",
 *   "customer_id": 1,
 *   "customer": {
 *     "id": 1,
 *     "display_name": "Sri Krishna",
 *     "email": "krishna@gmail.com",
 *     "phone": "9345927994"
 *   },
 *   "order_number": "ORD-2024-001",
 *   "invoice_date": "2024-04-08T15:30:00+05:30",
 *   "terms": "NET_30",
 *   "due_date": "2024-05-08T15:30:00+05:30",
 *   "payment_terms": "Due within 30 days",
 *   "salesperson_id": 1,
 *   "salesperson": {
 *     "id": 1,
 *     "name": "Ravi",
 *     "email": "ravi@gmail.com"
 *   },
 *   "subject": "Invoice for Water Bottles Order",
 *   "line_items": [
 *     {
 *       "product_id": "prod_28ccf422",
 *       "product_name": "Water Bottle",
 *       "sku": "WB-001-RED",
 *       "account": "Cost of Goods Sold",
 *       "quantity": 900,
 *       "rate": 500,
 *       "amount": 450000,
 *       "variant_sku": "WB-001-RED",
 *       "variant_details": {
 *         "account": "Cost of Goods Sold",
 *         "sku": "WB-001-RED"
 *       }
 *     }
 *   ],
 *   "sub_total": 450000,
 *   "shipping_charges": 500,
 *   "tax_type": "GST",
 *   "tax_id": 1,
 *   "tax": {
 *     "id": 1,
 *     "name": "GST 5%",
 *     "tax_type": "GST",
 *     "rate": 5
 *   },
 *   "tax_amount": 22525,
 *   "adjustment": 0,
 *   "total": 473025,
 *   "customer_notes": "Please deliver by Friday",
 *   "terms_and_conditions": "Payment terms: Net 30 days...",
 *   "status": "draft",
 *   "payment_received": false,
 *   "attachments": ["invoice_terms.pdf"],
 *   "created_at": "2026-04-08T14:38:50.224+05:30",
 *   "updated_at": "2026-04-08T14:38:50.224+05:30",
 *   "user_id": 2,
 *   "user_name": "krishna@gmail.com",
 *   "company_id": 1,
 *   "company_name": "Tech Innovations Pvt Ltd"
 * }
 */
export interface InvoiceOutput {
  id: string;                       // Unique identifier (e.g., "inv_515d0bc1")
  invoice_number: string;           // Auto-generated invoice number (e.g., "INV-000004")
  sales_order_id?: string;          // Sales order ID reference
  customer_id: number;              // Customer identifier
  customer?: CustomerInfo;          // Full customer details
  order_number?: string;            // Order number reference
  invoice_date: string;             // Invoice date (ISO 8601 with timezone)
  terms: string;                    // Payment terms (e.g., "NET_30")
  payment_terms?: string;           // Full payment terms description
  due_date: string;                 // Due date (ISO 8601 with timezone)
  salesperson_id?: number;          // Salesperson identifier
  salesperson?: SalespersonInfo;    // Full salesperson details
  subject?: string;                 // Invoice subject/description
  line_items: InvoiceLineItemOutput[]; // Line items with computed amounts
  sub_total: number;                // Subtotal before tax and shipping
  shipping_charges: number;         // Shipping charges
  tax_type?: string;                // Tax type (e.g., "GST", "VAT", "TDS")
  tax_id?: number;                  // Tax configuration ID
  tax?: TaxInfo;                    // Full tax details (includes rate)
  tax_amount: number;               // Calculated tax amount
  adjustment: number;               // Adjustment amount (positive or negative)
  total: number;                    // Final total = sub_total + tax + shipping + adjustment
  customer_notes?: string;          // Notes shown on invoice
  terms_and_conditions?: string;    // T&C shown on invoice
  status: 'draft' | 'issued' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void'; // Invoice status
  payment_received: boolean;        // Whether any payment has been received
  attachments?: string[];           // Attachment URLs
  payments?: PaymentOutput[];       // Payment records (if any)
  payment_splits?: PaymentSplitOutput[]; // Payment splits
  email_communications?: EmailCommunicationOutput[]; // Email communication history
  created_at: string;               // Creation timestamp (ISO 8601 with timezone)
  updated_at: string;               // Last update timestamp
  user_id?: number;                 // User ID who created this invoice
  user_name?: string;               // User name/email of creator
  company_id: number;               // Company identifier
  company_name?: string;            // Company name
}

/**
 * Invoice List Output
 * Matches Go: InvoiceListOutput
 */
export interface InvoiceListOutput {
  invoices: InvoiceOutput[];
  total: number;
}

/**
 * Salesperson Output
 * Matches Go: SalespersonOutput
 */
export interface SalespersonOutput {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Salesperson List Output
 * Matches Go: SalespersonListOutput
 */
export interface SalespersonListOutput {
  salespersons: SalespersonOutput[];
  total: number;
}

/**
 * Tax Output
 * Matches Go: TaxOutput
 */
export interface TaxOutput {
  id: number;
  name: string;
  tax_type: string;
  rate: number;
  created_at: string;
  updated_at: string;
}

/**
 * Tax List Output
 * Matches Go: TaxListOutput
 */
export interface TaxListOutput {
  taxes: TaxOutput[];
  total: number;
}

/**
 * Payment List Output
 * Matches Go: PaymentListOutput
 */
export interface PaymentListOutput {
  payments: PaymentOutput[];
  total: number;
}

// ============================================================================
// Response Wrapper Types
// ============================================================================

export interface InvoiceResponse {
  data: InvoiceOutput;
  message?: string;
  success: boolean;
}

export interface InvoiceListResponse {
  data: InvoiceOutput[];
  total: number;
  page?: number;
  limit?: number;
  success: boolean;
}

export interface PaymentResponse {
  data: PaymentOutput;
  message?: string;
  success: boolean;
}

export interface TaxResponse {
  data: TaxOutput;
  message?: string;
  success: boolean;
}

export interface SalespersonResponse {
  data: SalespersonOutput;
  message?: string;
  success: boolean;
}
