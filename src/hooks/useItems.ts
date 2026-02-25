// hooks/useItems.ts

import { useQuery } from "@tanstack/react-query";
import { itemService } from "@/lib/api/itemService";

interface UseItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export const useItems = ({ page = 1, limit = 10, search, enabled = true }: UseItemsParams = {}) => {
  return useQuery({
    queryKey: ["items", page, limit, search],
    queryFn: () => itemService.getItems(page, limit, search),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useItem = (id: string | number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => itemService.getItem(id),
    enabled: enabled && !!id,
  });
};

// New hooks for opening stock data
export const useItemOpeningStock = (itemId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["item-opening-stock", itemId],
    queryFn: () => itemService.getItemOpeningStock(itemId),
    enabled: enabled && !!itemId,
  });
};

export const useVariantOpeningStocks = (itemId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["variant-opening-stocks", itemId],
    queryFn: () => itemService.getVariantOpeningStocks(itemId),
    enabled: enabled && !!itemId,
  });
};