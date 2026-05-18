import {
  CreateCustomerPaymentInput,
  RecordCustomerPaymentInput,
  UpdateCustomerPaymentInput,
  CustomerPaymentResponse,
  CustomerPaymentListResponse,
} from '@/models/customer-payment.model';
import { CUSTOMER_PAYMENT_ENDPOINTS } from '@/constants/customer-payment.constants';
import { apiService } from './api.service';

export const customerPaymentService = {
  async getCustomerPayments(
    page: number = 1,
    limit: number = 10
  ): Promise<CustomerPaymentListResponse> {
    const response = await apiService.get(
      CUSTOMER_PAYMENT_ENDPOINTS.GET_ALL(page, limit)
    );
    
    // Handle API response structure: { data: { total, customer_payments: [...] }, success }
    if (response.data?.customer_payments) {
      return {
        success: response.success || true,
        data: response.data.customer_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async getCustomerPayment(id: number | string): Promise<CustomerPaymentResponse> {
    const response = await apiService.get(
      CUSTOMER_PAYMENT_ENDPOINTS.GET_BY_ID(id)
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async getPaymentsBySalesOrder(
    soId: number | string,
    page: number = 1,
    limit: number = 10
  ): Promise<CustomerPaymentListResponse> {
    const response = await apiService.get(
      CUSTOMER_PAYMENT_ENDPOINTS.GET_BY_SO(soId, page, limit)
    );
    
    // Handle API response structure: { data: { total, customer_payments: [...] }, success }
    if (response.data?.customer_payments) {
      return {
        success: response.success || true,
        data: response.data.customer_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async getPaymentsByCustomer(
    customerId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<CustomerPaymentListResponse> {
    const response = await apiService.get(
      CUSTOMER_PAYMENT_ENDPOINTS.GET_BY_CUSTOMER(customerId, page, limit)
    );
    
    // Handle API response structure: { data: { total, customer_payments: [...] }, success }
    if (response.data?.customer_payments) {
      return {
        success: response.success || true,
        data: response.data.customer_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async createCustomerPayment(
    data: CreateCustomerPaymentInput
  ): Promise<CustomerPaymentResponse> {
    const response = await apiService.post(
      CUSTOMER_PAYMENT_ENDPOINTS.CREATE,
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async updateCustomerPayment(
    id: number | string,
    data: UpdateCustomerPaymentInput
  ): Promise<CustomerPaymentResponse> {
    const response = await apiService.put(
      CUSTOMER_PAYMENT_ENDPOINTS.UPDATE(id),
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async recordPayment(
    id: number | string,
    data: RecordCustomerPaymentInput
  ): Promise<CustomerPaymentResponse> {
    const response = await apiService.post(
      CUSTOMER_PAYMENT_ENDPOINTS.RECORD_PAYMENT(id),
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async searchCustomerPayments(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CustomerPaymentListResponse> {
    const response = await apiService.get(
      CUSTOMER_PAYMENT_ENDPOINTS.SEARCH(query, page, limit)
    );
    
    if (response.data?.customer_payments) {
      return {
        success: response.success || true,
        data: response.data.customer_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async deleteCustomerPayment(id: number | string): Promise<{ success: boolean; message?: string }> {
    const response = await apiService.delete(
      CUSTOMER_PAYMENT_ENDPOINTS.DELETE(id)
    );
    return response.data || response;
  },
};
