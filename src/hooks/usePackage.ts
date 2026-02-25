import { useState, useCallback } from 'react';
import { Package, CreatePackageRequest, UpdatePackageRequest, UpdatePackageStatusRequest } from '@/models/package.model';
import { apiService } from '@/lib/api/api.service';

const PACKAGE_ENDPOINTS = {
  GET_ALL: '/packages',
  GET_ONE: (id: string) => `/packages/${id}`,
  CREATE: '/packages',
  UPDATE: (id: string) => `/packages/${id}`,
  DELETE: (id: string) => `/packages/${id}`,
  UPDATE_STATUS: (id: string) => `/packages/${id}/status`,
};

export const usePackage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPackages = useCallback(
    async (page: number = 1, limit: number = 10, search?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);

        const response = await apiService.get(`${PACKAGE_ENDPOINTS.GET_ALL}?${params}`);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch packages';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPackage = useCallback(
    async (id: string): Promise<Package> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(PACKAGE_ENDPOINTS.GET_ONE(id));
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch package';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createPackage = useCallback(
    async (payload: CreatePackageRequest): Promise<Package> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.post(PACKAGE_ENDPOINTS.CREATE, payload);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create package';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePackage = useCallback(
    async (id: string, payload: UpdatePackageRequest): Promise<Package> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.put(PACKAGE_ENDPOINTS.UPDATE(id), payload);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update package';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePackageStatus = useCallback(
    async (id: string, payload: UpdatePackageStatusRequest): Promise<Package> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.patch(PACKAGE_ENDPOINTS.UPDATE_STATUS(id), payload);
        return response.data || response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update package status';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePackage = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await apiService.delete(PACKAGE_ENDPOINTS.DELETE(id));
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete package';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage,
    updatePackageStatus,
    loading,
    error,
  };
};
