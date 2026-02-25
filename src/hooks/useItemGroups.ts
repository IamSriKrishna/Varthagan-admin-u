import { useState, useEffect } from "react";
import {
  ItemGroup,
  ItemGroupListResponse,
  ItemGroupResponse,
} from "@/models/item-group.model";
import { itemGroupService } from "@/services/itemGroupService";

interface UseItemGroupsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export const useItemGroups = (options: UseItemGroupsOptions = {}) => {
  const { page = 1, limit = 10, search = "" } = options;
  const [data, setData] = useState<ItemGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItemGroups();
  }, [page, limit, search]);

  const fetchItemGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await itemGroupService.getItemGroups(page, limit, search);
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Fetch item groups error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createItemGroup = async (itemGroup: any): Promise<ItemGroup> => {
    const result = await itemGroupService.createItemGroup(itemGroup);
    return result.data;
  };

  const updateItemGroup = async (id: string, itemGroup: any): Promise<ItemGroup> => {
    const result = await itemGroupService.updateItemGroup(id, itemGroup);
    return result.data;
  };

  const deleteItemGroup = async (id: string): Promise<void> => {
    await itemGroupService.deleteItemGroup(id);
  };

  const getItemGroup = async (id: string): Promise<ItemGroup> => {
    const result = await itemGroupService.getItemGroup(id);
    return result.data;
  };

  return {
    data,
    total,
    isLoading,
    error,
    refetch: fetchItemGroups,
    createItemGroup,
    updateItemGroup,
    deleteItemGroup,
    getItemGroup,
  };
};
