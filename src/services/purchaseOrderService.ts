import { apiService } from '@/lib/api/api.service';
import {
  ReorderProductGroupInput,
  PurchaseOrderResponse,
  PurchaseOrderOutput,
} from '@/models/purchase-order.model';

const PURCHASE_ORDERS_ENDPOINT = '/purchase-orders';

export const purchaseOrderService = {
  /**
   * Create a purchase order by reordering a product group
   */
  async reorderProductGroup(
    data: ReorderProductGroupInput
  ): Promise<PurchaseOrderResponse> {
    const response = await apiService.post(
      `${PURCHASE_ORDERS_ENDPOINT}/reorder/product-group`,
      data
    );
    return response as PurchaseOrderResponse;
  },

  /**
   * Get a single purchase order by ID
   */
  async getPurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
    const response = await apiService.get(`${PURCHASE_ORDERS_ENDPOINT}/${id}`);
    return response as PurchaseOrderResponse;
  },

  /**
   * Get all purchase orders with pagination
   */
  async getPurchaseOrders(
    page: number = 1,
    limit: number = 10,
    filters?: {
      vendorId?: number;
      customerId?: number;
      status?: string;
    }
  ): Promise<{ success: boolean; data: PurchaseOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
      ...(filters?.vendorId && { vendor_id: filters.vendorId.toString() }),
      ...(filters?.customerId && { customer_id: filters.customerId.toString() }),
      ...(filters?.status && { status: filters.status }),
    });

    const response = await apiService.get(
      `${PURCHASE_ORDERS_ENDPOINT}?${params.toString()}`
    );
    return response as {
      success: boolean;
      data: PurchaseOrderOutput[];
      total: number;
    };
  },

  /**
   * Get purchase orders for a specific vendor
   */
  async getPurchaseOrdersByVendor(
    vendorId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ success: boolean; data: PurchaseOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });

    const response = await apiService.get(
      `${PURCHASE_ORDERS_ENDPOINT}/vendor/${vendorId}?${params.toString()}`
    );
    return response as {
      success: boolean;
      data: PurchaseOrderOutput[];
      total: number;
    };
  },

  /**
   * Get purchase orders for a specific customer
   */
  async getPurchaseOrdersByCustomer(
    customerId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ success: boolean; data: PurchaseOrderOutput[]; total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });

    const response = await apiService.get(
      `${PURCHASE_ORDERS_ENDPOINT}/customer/${customerId}?${params.toString()}`
    );
    return response as {
      success: boolean;
      data: PurchaseOrderOutput[];
      total: number;
    };
  },

  /**
   * Update purchase order status
   */
  async updatePurchaseOrderStatus(
    id: string,
    status: string
  ): Promise<PurchaseOrderResponse> {
    const response = await apiService.patch(
      `${PURCHASE_ORDERS_ENDPOINT}/${id}/status`,
      { status }
    );
    return response as PurchaseOrderResponse;
  },

  /**
   * Delete a purchase order
   */
  async deletePurchaseOrder(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiService.delete(`${PURCHASE_ORDERS_ENDPOINT}/${id}`);
    return response as { success: boolean; message: string };
  },
};
