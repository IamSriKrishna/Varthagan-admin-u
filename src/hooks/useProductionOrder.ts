import { useState, useCallback } from 'react';
import { productionOrderService } from '@/lib/api/productionOrderService';
import {
  ProductionOrder,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
} from '@/models/productionOrder.model';

interface UseProductionOrderReturn {
  loading: boolean;
  error: string | null;
  productionOrders: ProductionOrder[];
  productionOrder: ProductionOrder | null;
  totalPOs: number;
  createProductionOrder: (data: CreateProductionOrderRequest) => Promise<ProductionOrder>;
  updateProductionOrder: (id: string, data: UpdateProductionOrderRequest) => Promise<ProductionOrder>;
  deleteProductionOrder: (id: string) => Promise<boolean>;
  getProductionOrder: (id: string) => Promise<ProductionOrder>;
  getProductionOrders: (page: number, limit: number) => Promise<void>;
  searchProductionOrders: (query: string) => Promise<void>;
  consumeProductionItem: (id: string, data: { production_order_item_id: number; quantity_consumed: number; notes?: string }) => Promise<ProductionOrder>;
}

export const useProductionOrder = (): UseProductionOrderReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [productionOrder, setProductionOrder] = useState<ProductionOrder | null>(null);
  const [totalPOs, setTotalPOs] = useState(0);

  const createProductionOrder = useCallback(
    async (data: CreateProductionOrderRequest): Promise<ProductionOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await productionOrderService.createProductionOrder(data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to create production order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProductionOrder = useCallback(
    async (id: string, data: UpdateProductionOrderRequest): Promise<ProductionOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await productionOrderService.updateProductionOrder(id, data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to update production order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProductionOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await productionOrderService.deleteProductionOrder(id);
      setProductionOrders((prev) => prev.filter((po) => po.id !== id));
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete production order';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductionOrder = useCallback(async (id: string): Promise<ProductionOrder> => {
    setLoading(true);
    setError(null);
    try {
      const response = await productionOrderService.getProductionOrder(id);
      setProductionOrder(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to fetch production order';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductionOrders = useCallback(
    async (page: number = 1, limit: number = 10): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await productionOrderService.getProductionOrders(page, limit);
        setProductionOrders(response.data.production_orders);
        setTotalPOs(response.data.total);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to fetch production orders';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchProductionOrders = useCallback(async (query: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await productionOrderService.searchProductionOrders(query);
      setProductionOrders(response.data.production_orders);
      setTotalPOs(response.data.total);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to search production orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const consumeProductionItem = useCallback(
    async (id: string, data: { production_order_item_id: number; quantity_consumed: number; notes?: string }): Promise<ProductionOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await productionOrderService.consumeProductionItem(id, data);
        console.log('Hook - Consume response data:', response.data);
        setProductionOrder(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to consume item';
        console.error('Hook - Consume error:', errorMessage, err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    productionOrders,
    productionOrder,
    totalPOs,
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    getProductionOrder,
    getProductionOrders,
    searchProductionOrders,
    consumeProductionItem,
  }};
