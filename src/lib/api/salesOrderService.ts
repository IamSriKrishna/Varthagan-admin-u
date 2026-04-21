import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import {
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  UpdateSalesOrderStatusRequest,
  SalesOrderOutput,
  SalesOrderLineItemOutput,
} from '@/models/salesOrder.model';

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
    return { success: true, data: null };
  }
  
  return response.json();
};

export const salesOrderService = {
  /**
   * Create a new sales order
   * Endpoint: POST /api/sales-orders
   */
  async createSalesOrder(input: CreateSalesOrderRequest): Promise<SalesOrderOutput> {
    const response = await fetch(`${API_BASE_URL}/sales-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get all sales orders with pagination
   * Endpoint: GET /api/sales-orders
   */
  async getSalesOrders(limit: number = 10, offset: number = 0): Promise<{ data: SalesOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/sales-orders?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return {
      data: result.data || [],
      total: result.total || 0,
    };
  },

  /**
   * Get a single sales order by ID
   * Endpoint: GET /api/sales-orders/{id}
   */
  async getSalesOrderById(id: string): Promise<SalesOrderOutput> {
    const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Get sales orders by customer
   * Endpoint: GET /api/customers/{customerId}/sales-orders
   */
  async getSalesOrdersByCustomer(customerId: number, limit: number = 10, offset: number = 0): Promise<{ data: SalesOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/sales-orders/customer/${customerId}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return {
      data: result.data || [],
      total: result.total || 0,
    };
  },

  /**
   * Get sales orders by status
   * Endpoint: GET /api/sales-orders (with status filter)
   */
  async getSalesOrdersByStatus(
    status: 'draft' | 'sent' | 'confirmed' | 'partial_shipped' | 'shipped' | 'delivered' | 'paid' | 'cancelled',
    limit: number = 10,
    offset: number = 0
  ): Promise<{ data: SalesOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      status,
      limit: String(limit),
      offset: String(offset),
    });
    const response = await fetch(`${API_BASE_URL}/sales-orders?${params}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return {
      data: result.data || [],
      total: result.total || 0,
    };
  },

  /**
   * Update a sales order
   * Endpoint: PUT /api/sales-orders/{id}
   */
  async updateSalesOrder(id: string, input: UpdateSalesOrderRequest): Promise<SalesOrderOutput> {
    const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Update sales order status
   * Endpoint: PATCH /api/sales-orders/{id}/status
   */
  async updateSalesOrderStatus(id: string, input: UpdateSalesOrderStatusRequest): Promise<SalesOrderOutput> {
    const response = await fetch(`${API_BASE_URL}/sales-orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    const result = await handleResponse(response);
    return result.data || result;
  },

  /**
   * Delete a sales order
   * Endpoint: DELETE /api/sales-orders/{id}
   */
  async deleteSalesOrder(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ========================================================================
  // Helper Functions
  // ========================================================================

  /**
   * Calculate line item amount
   */
  calculateLineItemAmount(quantity: number, rate: number): number {
    return quantity * rate;
  },

  /**
   * Calculate subtotal from line items
   */
  calculateSubtotal(lineItems: SalesOrderLineItemOutput[]): number {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  },

  /**
   * Calculate tax amount
   */
  calculateTaxAmount(subtotal: number, shippingCharges: number, taxRate: number): number {
    return ((subtotal + shippingCharges) * taxRate) / 100;
  },

  /**
   * Calculate total amount
   */
  calculateTotal(
    subtotal: number,
    shippingCharges: number,
    taxAmount: number,
    adjustment: number
  ): number {
    return subtotal + shippingCharges + taxAmount + adjustment;
  },
};
