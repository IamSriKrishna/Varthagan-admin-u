import { useState, useCallback, useEffect } from "react";
import { ProductGroupListOutput, ProductGroupDetailsOutput, ProductGroupResponse } from "@/models/product-group.model";
import { showToastMessage } from "@/utils/toastUtil";

interface UseProductGroupsReturn {
  productGroups: ProductGroupListOutput[];
  selectedGroup: ProductGroupDetailsOutput | null;
  loading: boolean;
  error: string | null;
  fetchProductGroups: () => Promise<void>;
  fetchProductGroupById: (id: string) => Promise<void>;
  clearSelectedGroup: () => void;
}

/**
 * Custom hook to manage product groups
 * Provides functionality to fetch product groups and individual product group details
 *
 * @example
 * const { productGroups, selectedGroup, loading, fetchProductGroupById } = useProductGroups();
 *
 * useEffect(() => {
 *   fetchProductGroupById("pg_123");
 * }, []);
 */
export function useProductGroups(): UseProductGroupsReturn {
  const [productGroups, setProductGroups] = useState<ProductGroupListOutput[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroupDetailsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all product groups
   */
  const fetchProductGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/product-groups?limit=100&offset=0");
      if (!response.ok) {
        throw new Error("Failed to fetch product groups");
      }
      const data = await response.json();
      setProductGroups(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific product group by ID with all its components
   * @param id - The product group ID
   */
  const fetchProductGroupById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/product-groups/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product group");
      }
      const data: ProductGroupResponse = await response.json();
      if (data.data) {
        setSelectedGroup(data.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear the selected group
   */
  const clearSelectedGroup = useCallback(() => {
    setSelectedGroup(null);
    setError(null);
  }, []);

  return {
    productGroups,
    selectedGroup,
    loading,
    error,
    fetchProductGroups,
    fetchProductGroupById,
    clearSelectedGroup,
  };
}
