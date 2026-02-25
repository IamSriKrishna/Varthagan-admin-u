import { useState, useCallback } from "react";
import { CreateVendorInput, UpdateVendorInput, Vendor } from "@/models/vendor.model";
import { vendorService } from "@/lib/api/vendorService";

interface UseVendorReturn {
  loading: boolean;
  error: string | null;
  createVendor: (data: CreateVendorInput) => Promise<Vendor>;
  updateVendor: (id: string | number, data: UpdateVendorInput) => Promise<Vendor>;
  deleteVendor: (id: string | number) => Promise<void>;
  getVendor: (id: string | number) => Promise<Vendor>;
}

export const useVendor = (): UseVendorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVendor = useCallback(async (data: CreateVendorInput): Promise<Vendor> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vendorService.createVendor(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create vendor");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create vendor";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (id: string | number, data: UpdateVendorInput): Promise<Vendor> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vendorService.updateVendor(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update vendor");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update vendor";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVendor = useCallback(async (id: string | number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vendorService.deleteVendor(id);
      if (!response.success) {
        throw new Error("Failed to delete vendor");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete vendor";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getVendor = useCallback(async (id: string | number): Promise<Vendor> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vendorService.getVendor(id);
      if (!response.success) {
        throw new Error("Failed to fetch vendor");
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch vendor";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
    getVendor,
  };
};
