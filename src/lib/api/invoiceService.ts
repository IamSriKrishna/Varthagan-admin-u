import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatusUpdateRequest,
  InvoiceOutput,
  InvoiceListOutput,
  PaymentOutput,
  CreatePaymentRequest,
  TaxOutput,
  TaxListOutput,
  CreateTaxRequest,
  UpdateTaxRequest,
  SalespersonOutput,
  SalespersonListOutput,
  CreateSalespersonRequest,
  UpdateSalespersonRequest,
} from '@/models/invoice.model';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8088';

const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token from persisted auth:', e);
    return '';
  }
};

const getHeaders = (contentType: string = 'application/json') => ({
  'Content-Type': contentType,
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return { success: true, data: [] };
  }
  
  return response.json();
};

export const invoiceService = {
  /**
   * Create a new invoice
   * Endpoint: POST /invoices
   * 
   * Request body (CreateInvoiceRequest):
   * {
   *   "customer_id": 1,
   *   "sales_order_id": "so_abc123",
   *   "invoice_date": "2026-04-05T10:00:00Z",
   *   "due_date": "2026-04-20T10:00:00Z",
   *   "terms": "net_15",
   *   "line_items": [
   *     {
   *       "product_id": "prod_wb001",
   *       "product_name": "Water Bottle",
   *       "quantity": 100,
   *       "rate": 250.00
   *     }
   *   ],
   *   "tax_id": 1,
   *   "shipping_charges": 100,
   *   "adjustment": 0
   * }
   */
  async createInvoice(input: CreateInvoiceRequest): Promise<InvoiceOutput> {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get all invoices with pagination
   * Endpoint: GET /invoices?limit=10&offset=0
   */
  async getAllInvoices(limit: number = 10, offset: number = 0): Promise<InvoiceListOutput> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/invoices?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get a single invoice by ID
   * Endpoint: GET /invoices/{id}
   */
  async getInvoice(id: string): Promise<InvoiceOutput> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Update an invoice
   * Endpoint: PUT /invoices/{id}
   * 
   * Only allows updates to draft invoices
   */
  async updateInvoice(id: string, input: UpdateInvoiceRequest): Promise<InvoiceOutput> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Delete an invoice
   * Endpoint: DELETE /invoices/{id}
   * 
   * Only allows deletion of draft or void invoices
   */
  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse(response);
  },

  /**
   * Update invoice status
   * Endpoint: PATCH /invoices/{id}/status
   * 
   * CRITICAL PROCESS - Stock Deduction:
   * - Changing status to "issued" triggers automatic stock deduction from products
   * - Updates product current_stock, available_stock, and sold_stock
   * - Also creates stock ledger entries for audit trail
   * 
   * Allowed status transitions:
   * - draft -> issued (triggers stock deduction)
   * - issued -> sent
   * - sent -> partial (payment received)
   * - partial -> paid
   * - any -> void (cancellation)
   * 
   * Request body (InvoiceStatusUpdateRequest):
   * {
   *   "status": "issued"
   * }
   */
  async updateInvoiceStatus(id: string, input: InvoiceStatusUpdateRequest): Promise<InvoiceOutput> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get invoices by customer
   * Endpoint: GET /invoices/customer/{customer_id}?limit=10&offset=0
   */
  async getInvoicesByCustomer(
    customerId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<InvoiceListOutput> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/invoices/customer/${customerId}?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get invoices by status
   * Endpoint: GET /invoices/status/{status}?limit=10&offset=0
   */
  async getInvoicesByStatus(
    status: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<InvoiceListOutput> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/invoices/status/${status}?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  // ============================================================================
  // Payment Methods
  // ============================================================================

  /**
   * Create a payment record for an invoice
   * Endpoint: POST /payments
   * 
   * Request body (CreatePaymentRequest):
   * {
   *   "invoice_id": "inv_abc123",
   *   "payment_date": "2026-04-10T10:00:00Z",
   *   "amount": 5000.00,
   *   "payment_mode": "NEFT",
   *   "reference": "REF-123",
   *   "notes": "Partial payment"
   * }
   * 
   * Effect on Invoice Status:
   * - If totalPaid >= invoiceTotal: status -> "paid"
   * - If totalPaid > 0 and totalPaid < invoiceTotal: status -> "partial"
   */
  async createPayment(input: CreatePaymentRequest): Promise<PaymentOutput> {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get a single payment by ID
   * Endpoint: GET /payments/{id}
   */
  async getPayment(id: number): Promise<PaymentOutput> {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get all payments for an invoice
   * Endpoint: GET /invoices/{invoice_id}/payments
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<PaymentOutput[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/payments`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result.payments || [];
  },

  /**
   * Delete a payment record
   * Endpoint: DELETE /payments/{id}
   * 
   * Effect on Invoice Status:
   * - Updates invoice status based on remaining payment balance
   */
  async deletePayment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse(response);
  },

  // ============================================================================
  // Tax Methods
  // ============================================================================

  /**
   * Create a new tax configuration
   * Endpoint: POST /taxes
   */
  async createTax(input: CreateTaxRequest): Promise<TaxOutput> {
    const response = await fetch(`${API_BASE_URL}/taxes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get a single tax by ID
   * Endpoint: GET /taxes/{id}
   */
  async getTax(id: number): Promise<TaxOutput> {
    const response = await fetch(`${API_BASE_URL}/taxes/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get all taxes with pagination
   * Endpoint: GET /taxes?limit=10&offset=0
   */
  async getAllTaxes(limit: number = 10, offset: number = 0): Promise<TaxListOutput> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/taxes?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Update a tax configuration
   * Endpoint: PUT /taxes/{id}
   */
  async updateTax(id: number, input: UpdateTaxRequest): Promise<TaxOutput> {
    const response = await fetch(`${API_BASE_URL}/taxes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Delete a tax configuration
   * Endpoint: DELETE /taxes/{id}
   */
  async deleteTax(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/taxes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse(response);
  },

  // ============================================================================
  // Salesperson Methods
  // ============================================================================

  /**
   * Create a new salesperson
   * Endpoint: POST /salespersons
   */
  async createSalesperson(input: CreateSalespersonRequest): Promise<SalespersonOutput> {
    const response = await fetch(`${API_BASE_URL}/salespersons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get a single salesperson by ID
   * Endpoint: GET /salespersons/{id}
   */
  async getSalesperson(id: number): Promise<SalespersonOutput> {
    const response = await fetch(`${API_BASE_URL}/salespersons/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get all salespersons with pagination
   * Endpoint: GET /salespersons?limit=10&offset=0
   */
  async getAllSalespersons(limit: number = 10, offset: number = 0): Promise<SalespersonListOutput> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/salespersons?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Update a salesperson
   * Endpoint: PUT /salespersons/{id}
   */
  async updateSalesperson(id: number, input: UpdateSalespersonRequest): Promise<SalespersonOutput> {
    const response = await fetch(`${API_BASE_URL}/salespersons/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Delete a salesperson
   * Endpoint: DELETE /salespersons/{id}
   */
  async deleteSalesperson(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/salespersons/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse(response);
  },
};

/**
 * COMPLETE API WORKFLOW: Invoice Management
 * ============================================================================
 * 
 * PHASE 1: Create Invoice
 * Endpoint: POST /invoices
 * Input: CreateInvoiceRequest (customer_id, invoice_date, due_date, line_items, etc.)
 * Returns: InvoiceOutput with status = "draft"
 * 
 * PHASE 2: CRITICAL - Issue Invoice (Stock Deduction)
 * Endpoint: PATCH /invoices/{id}/status
 * Request: { status: "issued" }
 * Effect: 
 *   - Deducts stock from all products for each line item
 *   - Updates product_stock: current_stock, available_stock, sold_stock
 *   - Creates stock ledger entries for audit trail
 *   - Throws error if insufficient stock
 * Stock Deduction Example:
 *   - Water Bottle: 500 - 100 = 400 current, 100 sold
 *   - Bottle Cap: 1000 - 200 = 800 current, 200 sold
 *   - Product Label: 2000 - 300 = 1700 current, 300 sold
 * 
 * PHASE 3: Send Invoice to Customer
 * Endpoint: PATCH /invoices/{id}/status
 * Request: { status: "sent" }
 * Effect: Marks invoice as sent, may trigger email notifications
 * 
 * PHASE 4: Record Payments
 * Endpoint: POST /payments
 * Input: CreatePaymentRequest (invoice_id, amount, payment_date, payment_mode, etc.)
 * Returns: PaymentOutput
 * Effect: 
 *   - Creates payment record
 *   - Updates invoice status based on paid amount:
 *     - If totalPaid >= invoice.total: status = "paid"
 *     - If totalPaid > 0 and < invoice.total: status = "partial"
 * 
 * PHASE 5: Mark as Fully Paid (if not automatic)
 * Endpoint: GET /invoices/{id}/payments (to verify total paid)
 * Endpoint: PATCH /invoices/{id}/status
 * Request: { status: "paid" }
 * 
 * INVOICE STATUS TRANSITIONS:
 * - draft → issued (triggers stock deduction)
 * - issued → sent (send to customer)
 * - sent → partial (partial payment received)
 * - partial → paid (full payment received)
 * - partial → overdue (due date passed)
 * - any → void (cancel invoice)
 * 
 * KEY ENDPOINTS:
 * - POST   /invoices                           - Create invoice
 * - GET    /invoices                           - List invoices (with pagination)
 * - GET    /invoices/{id}                      - Get invoice details
 * - PUT    /invoices/{id}                      - Update invoice (draft only)
 * - DELETE /invoices/{id}                      - Delete invoice (draft or void only)
 * - PATCH  /invoices/{id}/status               - Update invoice status
 * - GET    /invoices/customer/{customer_id}    - Get invoices for customer
 * - GET    /invoices/status/{status}           - Get invoices by status
 * 
 * PAYMENT ENDPOINTS:
 * - POST   /payments                           - Create payment
 * - GET    /payments/{id}                      - Get payment
 * - GET    /invoices/{invoice_id}/payments     - Get payments for invoice
 * - DELETE /payments/{id}                      - Delete payment
 * 
 * TAX ENDPOINTS:
 * - POST   /taxes                              - Create tax configuration
 * - GET    /taxes                              - List taxes (with pagination)
 * - GET    /taxes/{id}                         - Get tax
 * - PUT    /taxes/{id}                         - Update tax
 * - DELETE /taxes/{id}                         - Delete tax
 * 
 * SALESPERSON ENDPOINTS:
 * - POST   /salespersons                       - Create salesperson
 * - GET    /salespersons                       - List salespersons (with pagination)
 * - GET    /salespersons/{id}                  - Get salesperson
 * - PUT    /salespersons/{id}                  - Update salesperson
 * - DELETE /salespersons/{id}                  - Delete salesperson
 */
