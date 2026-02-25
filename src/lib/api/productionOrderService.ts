import {
  ProductionOrder,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
  ProductionOrderResponse,
  ProductionOrdersListResponse,
  DeleteProductionOrderResponse,
  SearchProductionOrdersResponse,
} from '@/models/productionOrder.model';
import { PRODUCTION_ORDER_ENDPOINTS } from '@/constants/productionOrder.constants';
import { apiService } from './api.service';

export const productionOrderService = {
  async getProductionOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<ProductionOrdersListResponse> {
    const response = await apiService.get(
      `${PRODUCTION_ORDER_ENDPOINTS.GET_ALL}?page=${page}&limit=${limit}`
    );
    return {
      success: true,
      data: {
        production_orders: response.data.data || response.data,
        total: response.data.pagination?.total || 0,
      },
      pagination: response.data.pagination || { page, limit, total: 0, total_pages: 0 },
      message: response.data.message || 'Production Orders retrieved successfully',
    };
  },

  async getProductionOrder(id: string): Promise<ProductionOrderResponse> {
    const response = await apiService.get(
      PRODUCTION_ORDER_ENDPOINTS.GET_ONE(id)
    );
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Production Order retrieved successfully',
    };
  },

  async createProductionOrder(
    data: CreateProductionOrderRequest
  ): Promise<ProductionOrderResponse> {
    const response = await apiService.post(
      PRODUCTION_ORDER_ENDPOINTS.CREATE,
      data
    );
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Production Order created successfully',
      warnings: response.data.warnings,
    };
  },

  async updateProductionOrder(
    id: string,
    data: UpdateProductionOrderRequest
  ): Promise<ProductionOrderResponse> {
    const response = await apiService.put(
      PRODUCTION_ORDER_ENDPOINTS.UPDATE(id),
      data
    );
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Production Order updated successfully',
    };
  },

  async deleteProductionOrder(id: string): Promise<DeleteProductionOrderResponse> {
    const response = await apiService.delete(
      PRODUCTION_ORDER_ENDPOINTS.DELETE(id)
    );
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Production Order deleted successfully',
    };
  },

  async searchProductionOrders(query: string): Promise<SearchProductionOrdersResponse> {
    const response = await apiService.get(
      `${PRODUCTION_ORDER_ENDPOINTS.SEARCH}?query=${query}`
    );
    return {
      success: true,
      data: {
        production_orders: response.data.data || response.data,
        total: response.data.total || 0,
      },
      message: response.data.message || 'Production Orders search completed',
    };
  },

  async consumeProductionItem(
    id: string,
    data: { production_order_item_id: number; quantity_consumed: number; notes?: string }
  ): Promise<ProductionOrderResponse> {
    const response = await apiService.post(
      PRODUCTION_ORDER_ENDPOINTS.CONSUME_ITEM(id),
      data
    );
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Item consumed successfully',
    };
  },
};
