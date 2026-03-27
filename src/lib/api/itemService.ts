// lib/api/itemService.ts

import { Item, ItemListResponse } from "@/models/item.model";
import { ITEM_ENDPOINTS } from "@/constants/item.constants";
import { apiService } from "./api.service";

export interface OpeningStockData {
  opening_stock: number;
  opening_stock_rate_per_unit: number;
  updated_at: string;
}

export interface VariantOpeningStock {
  variant_id: number;
  variant_sku: string;
  opening_stock: number;
  opening_stock_rate_per_unit: number;
  updated_at: string;
}

export interface OpeningStockResponse {
  data: OpeningStockData;
}

export interface VariantOpeningStocksResponse {
  data: VariantOpeningStock[];
}

export interface CreateItemPayload {
  name: string;
  type: string;
  brand?: string;
  manufacturer?: string;
  item_details: {
    structure: string;
    unit: string;
    sku?: string;
    upc?: string;
    ean?: string;
    mpn?: string;
    isbn?: string;
    description?: string;
    attribute_definitions?: Array<{
      key: string;
      options: string[];
    }>;
    variants?: Array<{
      sku: string;
      attribute_map: Record<string, string>;
      selling_price: number;
      cost_price: number;
      stock_quantity: number;
    }>;
  };
  sales_info: {
    account: string;
    selling_price?: number;
    currency?: string;
    description?: string;
  };
  purchase_info?: {
    account: string;
    cost_price?: number;
    currency?: string;
    preferred_vendor_id?: number;
    description?: string;
  };
  inventory?: {
    track_inventory: boolean;
    inventory_account?: string;
    inventory_valuation_method?: string;
    reorder_point?: number;
  };
  return_policy?: {
    returnable: boolean;
  };
}

export const itemService = {
  async getItems(page: number = 1, limit: number = 10, search?: string): Promise<ItemListResponse> {
    return apiService.get(ITEM_ENDPOINTS.GET_ALL(page, limit, search));
  },

  async getItem(id: string | number): Promise<Item> {
    return apiService.get(ITEM_ENDPOINTS.GET_BY_ID(id));
  },

  async searchItems(query: string, page: number = 1, limit: number = 10): Promise<ItemListResponse> {
    return apiService.get(ITEM_ENDPOINTS.SEARCH(query, page, limit));
  },

  // Create item
  async createItem(data: CreateItemPayload): Promise<Item> {
    return apiService.post('/items', data);
  },

  // Update item
  async updateItem(itemId: string, data: any): Promise<Item> {
    return apiService.put(`/items/${itemId}`, data);
  },

  // Opening stock methods
  async getItemOpeningStock(itemId: string): Promise<OpeningStockResponse> {
    return apiService.get(`/items/${itemId}/opening-stock`);
  },

  async getVariantOpeningStocks(itemId: string): Promise<VariantOpeningStocksResponse> {
    return apiService.get(`/items/${itemId}/variants/opening-stock`);
  },
};