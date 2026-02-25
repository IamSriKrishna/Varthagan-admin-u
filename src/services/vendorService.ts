import { apiService } from '@/lib/api/api.service';
import { Vendor, VendorListResponse, VendorResponse } from '@/models/vendor.model';

export const vendorService = {
  async getVendors(page: number = 1, limit: number = 100, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/vendors?${params.toString()}`) as Promise<VendorListResponse>;
  },

  async getVendor(id: string | number) {
    return apiService.get(`/vendors/${id}`) as Promise<VendorResponse>;
  },

  async createVendor(data: any) {
    return apiService.post('/vendors', data);
  },

  async updateVendor(id: string | number, data: any) {
    return apiService.put(`/vendors/${id}`, data);
  },

  async deleteVendor(id: string | number) {
    return apiService.delete(`/vendors/${id}`);
  },
};
