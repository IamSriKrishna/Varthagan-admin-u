import {
  CreateVendorPaymentRequest,
  RecordVendorPaymentRequest,
  VendorPayment,
  VendorPaymentResponse,
  VendorPaymentListResponse,
} from '@/models/vendor-payment.model';
import { VENDOR_PAYMENT_ENDPOINTS } from '@/constants/vendor-payment.constants';
import { apiService } from './api.service';

export const vendorPaymentService = {
  async getVendorPayments(
    page: number = 1,
    limit: number = 10
  ): Promise<VendorPaymentListResponse> {
    const response = await apiService.get(
      VENDOR_PAYMENT_ENDPOINTS.GET_ALL(page, limit)
    );
    
    // Handle API response structure: { data: { total, vendor_payments: [...] }, success }
    if (response.data?.vendor_payments) {
      return {
        success: response.success || true,
        data: response.data.vendor_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async getVendorPayment(id: number | string): Promise<VendorPaymentResponse> {
    const response = await apiService.get(
      VENDOR_PAYMENT_ENDPOINTS.GET_BY_ID(id)
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async getPaymentsByPurchaseOrder(
    poId: number | string,
    page: number = 1,
    limit: number = 10
  ): Promise<VendorPaymentListResponse> {
    const response = await apiService.get(
      VENDOR_PAYMENT_ENDPOINTS.GET_BY_PO(poId, page, limit)
    );
    
    // Handle API response structure: { data: { total, vendor_payments: [...] }, success }
    if (response.data?.vendor_payments) {
      return {
        success: response.success || true,
        data: response.data.vendor_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },

  async createVendorPayment(
    data: CreateVendorPaymentRequest
  ): Promise<VendorPaymentResponse> {
    const response = await apiService.post(
      VENDOR_PAYMENT_ENDPOINTS.CREATE,
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async recordPayment(
    id: number | string,
    data: RecordVendorPaymentRequest
  ): Promise<VendorPaymentResponse> {
    const response = await apiService.post(
      VENDOR_PAYMENT_ENDPOINTS.RECORD_PAYMENT(id),
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async searchVendorPayments(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<VendorPaymentListResponse> {
    const response = await apiService.get(
      VENDOR_PAYMENT_ENDPOINTS.SEARCH(query, page, limit)
    );
    
    // Handle API response structure: { data: { total, vendor_payments: [...] }, success }
    if (response.data?.vendor_payments) {
      return {
        success: response.success || true,
        data: response.data.vendor_payments,
        pagination: {
          total: response.data.total || 0,
          limit,
          offset: (page - 1) * limit,
        },
      };
    }
    
    return response.data || response;
  },
};
