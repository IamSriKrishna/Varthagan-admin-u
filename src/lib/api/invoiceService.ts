import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import { IInvoice } from '@/models/IInvoice';

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
  async createInvoice(data: any) {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async getInvoices(page: number = 1, pageSize: number = 10) {
    const response = await fetch(`${API_BASE_URL}/invoices?page=${page}&page_size=${pageSize}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getInvoiceById(id: string) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateInvoice(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteInvoice(id: string) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateInvoiceStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  async getInvoicesByStatus(status: string) {
    const response = await fetch(`${API_BASE_URL}/invoices/status/${status}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getInvoicesByCustomer(customerId: string) {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/invoices`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
