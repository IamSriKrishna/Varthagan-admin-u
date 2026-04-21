import { useState, useCallback } from 'react';
import { purchaseOrderService } from '@/lib/api/purchaseOrderService';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrdersListResponse,
  UpdatePurchaseOrderStatusRequest,
} from '@/models/purchaseOrder.model';

interface UsePurchaseOrderReturn {
  loading: boolean;
  error: string | null;
  purchaseOrders: PurchaseOrder[];
  purchaseOrder: PurchaseOrder | null;
  totalPOs: number;
  createPurchaseOrder: (data: CreatePurchaseOrderRequest) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, data: UpdatePurchaseOrderRequest) => Promise<PurchaseOrder>;
  updatePurchaseOrderStatus: (id: string, status: string) => Promise<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => Promise<boolean>;
  getPurchaseOrder: (id: string) => Promise<PurchaseOrder>;
  getPurchaseOrders: (page: number, limit: number) => Promise<void>;
  searchPurchaseOrders: (query: string) => Promise<void>;
}

export const usePurchaseOrder = (): UsePurchaseOrderReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [totalPOs, setTotalPOs] = useState(0);

  const createPurchaseOrder = useCallback(
    async (data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await purchaseOrderService.createPurchaseOrder(data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to create purchase order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePurchaseOrder = useCallback(
    async (id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await purchaseOrderService.updatePurchaseOrder(id, data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to update purchase order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePurchaseOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await purchaseOrderService.deletePurchaseOrder(id);
      setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete purchase order';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPurchaseOrder = useCallback(async (id: string): Promise<PurchaseOrder> => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseOrderService.getPurchaseOrder(id);
      setPurchaseOrder(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to fetch purchase order';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPurchaseOrders = useCallback(
    async (page: number = 1, limit: number = 10): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await purchaseOrderService.getPurchaseOrders(page, limit);
        setPurchaseOrders(response.purchase_orders || []);
        setTotalPOs(response.total || 0);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to fetch purchase orders';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchPurchaseOrders = useCallback(async (query: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseOrderService.searchPurchaseOrders(query);
      setPurchaseOrders(response.purchase_orders || []);
      setTotalPOs(response.total || 0);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to search purchase orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePurchaseOrderStatus = useCallback(
    async (id: string, status: string): Promise<PurchaseOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await purchaseOrderService.updatePurchaseOrderStatus(id, { status: status as any });
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === id ? { ...po, status: status as any } : po))
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to update purchase order status';
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
    purchaseOrders,
    purchaseOrder,
    totalPOs,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    getPurchaseOrder,
    getPurchaseOrders,
    searchPurchaseOrders,
  };
};
