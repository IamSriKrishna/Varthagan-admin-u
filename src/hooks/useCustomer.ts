import { useState, useCallback } from "react";
import { CreateCustomerInput, UpdateCustomerInput, Customer } from "@/models/customer.model";
import { customerService } from "@/lib/api/customerService";

interface UseCustomerReturn {
  loading: boolean;
  error: string | null;
  createCustomer: (data: CreateCustomerInput) => Promise<Customer>;
  updateCustomer: (id: string | number, data: UpdateCustomerInput) => Promise<Customer>;
  deleteCustomer: (id: string | number) => Promise<void>;
  getCustomer: (id: string | number) => Promise<Customer>;
}

export const useCustomer = (): UseCustomerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(async (data: CreateCustomerInput): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.createCustomer(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create customer");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create customer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(async (id: string | number, data: UpdateCustomerInput): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.updateCustomer(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update customer");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update customer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string | number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.deleteCustomer(id);
      if (!response.success) {
        throw new Error("Failed to delete customer");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete customer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomer = useCallback(async (id: string | number): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.getCustomer(id);
      if (!response.success) {
        throw new Error("Failed to fetch customer");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch customer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
  };
};
