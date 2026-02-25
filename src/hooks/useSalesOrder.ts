import { useState, useCallback } from 'react';
import { SalesOrder, CreateSalesOrderRequest, UpdateSalesOrderRequest, UpdateSalesOrderStatusRequest } from '@/models/salesOrder.model';
import { apiService } from '@/lib/api/api.service';

const SALES_ORDER_ENDPOINTS = {
  GET_ALL: '/sales-orders',
  GET_ONE: (id: string) => `/sales-orders/${id}`,
  CREATE: '/sales-orders',
  UPDATE: (id: string) => `/sales-orders/${id}`,
  DELETE: (id: string) => `/sales-orders/${id}`,
  UPDATE_STATUS: (id: string) => `/sales-orders/${id}/status`,
};

export const useSalesOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSalesOrders = useCallback(
    async (page: number = 1, limit: number = 10, search?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);

        const response = await apiService.get(`${SALES_ORDER_ENDPOINTS.GET_ALL}?${params}`);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch sales orders';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSalesOrder = useCallback(
    async (id: string): Promise<SalesOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(SALES_ORDER_ENDPOINTS.GET_ONE(id));
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch sales order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createSalesOrder = useCallback(
    async (payload: CreateSalesOrderRequest): Promise<SalesOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.post(SALES_ORDER_ENDPOINTS.CREATE, payload);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create sales order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateSalesOrder = useCallback(
    async (id: string, payload: UpdateSalesOrderRequest): Promise<SalesOrder> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.put(SALES_ORDER_ENDPOINTS.UPDATE(id), payload);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update sales order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateSalesOrderStatus = useCallback(
    async (id: string, payload: UpdateSalesOrderStatusRequest): Promise<SalesOrder> => {
      setLoading(true);
      setError(null);
      try {
        console.log('API Call - Updating status:', {
          url: SALES_ORDER_ENDPOINTS.UPDATE_STATUS(id),
          payload,
        });
        const response = await apiService.patch(SALES_ORDER_ENDPOINTS.UPDATE_STATUS(id), payload);
        console.log('API Response:', response);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update sales order status';
        setError(errorMessage);
        console.error('API Error:', errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteSalesOrder = useCallback(
    async (id: string): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.delete(SALES_ORDER_ENDPOINTS.DELETE(id));
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete sales order';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getSalesOrders,
    getSalesOrder,
    createSalesOrder,
    updateSalesOrder,
    updateSalesOrderStatus,
    deleteSalesOrder,
    loading,
    error,
  };
};
