import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrdersListResponse,
  DeletePurchaseOrderResponse,
  SearchPurchaseOrdersResponse,
  UpdatePurchaseOrderStatusRequest,
} from '@/models/purchaseOrder.model';
import { PURCHASE_ORDER_ENDPOINTS } from '@/constants/purchaseOrder.constants';
import { apiService } from './api.service';

export const purchaseOrderService = {
  async getPurchaseOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PurchaseOrdersListResponse> {
    const response = await apiService.get(
      `${PURCHASE_ORDER_ENDPOINTS.GET_ALL}?page=${page}&limit=${limit}`
    );
    // Response structure: { purchase_orders: [...], total: number }
    return response.data || response;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
    const response = await apiService.get(
      PURCHASE_ORDER_ENDPOINTS.GET_ONE(id)
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async createPurchaseOrder(
    data: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrderResponse> {
    const response = await apiService.post(
      PURCHASE_ORDER_ENDPOINTS.CREATE,
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderRequest
  ): Promise<PurchaseOrderResponse> {
    const response = await apiService.put(
      PURCHASE_ORDER_ENDPOINTS.UPDATE(id),
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async updatePurchaseOrderStatus(
    id: string,
    data: UpdatePurchaseOrderStatusRequest
  ): Promise<PurchaseOrderResponse> {
    const response = await apiService.patch(
      `${PURCHASE_ORDER_ENDPOINTS.UPDATE_STATUS(id)}`,
      data
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async deletePurchaseOrder(id: string): Promise<DeletePurchaseOrderResponse> {
    const response = await apiService.delete(
      PURCHASE_ORDER_ENDPOINTS.DELETE(id)
    );
    return {
      success: true,
      message: response?.message || 'Purchase order deleted successfully',
    };
  },

  async searchPurchaseOrders(
    query: string
  ): Promise<SearchPurchaseOrdersResponse> {
    const response = await apiService.get(
      `${PURCHASE_ORDER_ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}`
    );
    // Response structure: { purchase_orders: [...], total: number }
    return response.data || response;
  },

  async getPurchaseOrdersByCustomer(customerId: number) {
    const response = await apiService.get(
      `/purchase-orders/customer/${customerId}`
    );
    return response.data || response;
  },
};
