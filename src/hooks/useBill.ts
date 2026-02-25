import { useState, useCallback } from 'react';
import {
  Bill,
  CreateBillRequest,
  UpdateBillRequest,
} from '@/models/bill.model';
import { billService } from '@/lib/api/billService';

interface UseBillReturn {
  loading: boolean;
  error: string | null;
  createBill: (data: CreateBillRequest) => Promise<Bill>;
  updateBill: (id: string, data: UpdateBillRequest) => Promise<Bill>;
  deleteBill: (id: string) => Promise<void>;
  getBill: (id: string) => Promise<Bill>;
  getBills: (page: number, limit: number) => Promise<Bill[]>;
  updateBillStatus: (id: string, status: string) => Promise<Bill>;
}

export const useBill = (): UseBillReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBill = useCallback(async (data: CreateBillRequest): Promise<Bill> => {
    setLoading(true);
    setError(null);

    try {
      const response = await billService.createBill(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create bill');
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create bill';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBill = useCallback(
    async (id: string, data: UpdateBillRequest): Promise<Bill> => {
      setLoading(true);
      setError(null);

      try {
        const response = await billService.updateBill(id, data);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update bill');
        }
        return response.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update bill';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteBill = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await billService.deleteBill(id);
      if (!response.success) {
        throw new Error(response.data?.message || 'Failed to delete bill');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete bill';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBill = useCallback(async (id: string): Promise<Bill> => {
    setLoading(true);
    setError(null);

    try {
      const response = await billService.getBill(id);
      if (!response.success) {
        throw new Error('Failed to fetch bill');
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch bill';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBills = useCallback(async (page: number, limit: number): Promise<Bill[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await billService.getBills(page, limit);
      if (!response.success) {
        throw new Error('Failed to fetch bills');
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch bills';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBillStatus = useCallback(async (id: string, status: string): Promise<Bill> => {
    setLoading(true);
    setError(null);

    try {
      const response = await billService.updateBillStatus(id, status);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update bill status');
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update bill status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    getBill,
    getBills,
    updateBillStatus,
  };
};
