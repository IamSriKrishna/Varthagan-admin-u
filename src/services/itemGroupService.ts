import { apiService } from '@/lib/api/api.service';
import { ItemGroup, ItemGroupListResponse, ItemGroupResponse, ItemGroupDeleteResponse } from '@/models/item-group.model';

export const itemGroupService = {
  async getItemGroups(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/item-groups?${params.toString()}`) as Promise<ItemGroupListResponse>;
  },

  async getItemGroup(id: string) {
    return apiService.get(`/item-groups/${id}`) as Promise<ItemGroupResponse>;
  },

  async createItemGroup(data: any) {
    return apiService.post('/item-groups', data) as Promise<ItemGroupResponse>;
  },

  async updateItemGroup(id: string, data: any) {
    return apiService.put(`/item-groups/${id}`, data) as Promise<ItemGroupResponse>;
  },

  async deleteItemGroup(id: string) {
    return apiService.delete(`/item-groups/${id}`) as Promise<ItemGroupDeleteResponse>;
  },
};
