import { apiService } from '@/lib/api/api.service';
import { Item, ItemListResponse, ItemResponse, OpeningStockRequest, OpeningStockResponse } from '@/models/item.model';

export const itemService = {
  async getItems(page: number = 1, limit: number = 1000, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/items?${params.toString()}`) as Promise<ItemListResponse>;
  },

  async getItem(id: string) {
    return apiService.get(`/items/${id}`) as Promise<ItemResponse>;
  },

  async createItem(data: any) {
    return apiService.post('/items', data);
  },

  async updateItem(id: string, data: any) {
    return apiService.put(`/items/${id}`, data);
  },

  async deleteItem(id: string) {
    return apiService.delete(`/items/${id}`);
  },

  async setOpeningStock(id: string, data: OpeningStockRequest) {
    return apiService.put(`/items/${id}/opening-stock`, data) as Promise<OpeningStockResponse>;
  },
};
