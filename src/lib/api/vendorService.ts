// app/services/vendor.service.ts
import {
  CreateVendorInput,
  UpdateVendorInput,
  Vendor,
  VendorListResponse,
  VendorResponse,
} from "@/models/vendor.model";
import { VENDOR_ENDPOINTS } from "@/constants/vendor.constants";
import { apiService } from "./api.service";

export const vendorService = {
  async createVendor(data: CreateVendorInput): Promise<VendorResponse> {
    return apiService.post(VENDOR_ENDPOINTS.CREATE, data);
  },

  async getVendors(page: number = 1, limit: number = 10, search?: string): Promise<VendorListResponse> {
    return apiService.get(VENDOR_ENDPOINTS.GET_ALL(page, limit, search));
  },

  async getVendor(id: string | number): Promise<VendorResponse> {
    return apiService.get(VENDOR_ENDPOINTS.GET_BY_ID(id));
  },

  async updateVendor(id: string | number, data: UpdateVendorInput): Promise<VendorResponse> {
    return apiService.put(VENDOR_ENDPOINTS.UPDATE(id), data);
  },

  async deleteVendor(id: string | number): Promise<{ success: boolean; message?: string }> {
    return apiService.delete(VENDOR_ENDPOINTS.DELETE(id));
  },

  async searchVendors(query: string, page: number = 1, limit: number = 10): Promise<VendorListResponse> {
    return apiService.get(VENDOR_ENDPOINTS.SEARCH(query, page, limit));
  },
};
