import {
  Manufacturer,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
  ManufacturerResponse,
  ManufacturersListResponse,
  DeleteManufacturerResponse,
} from '@/models/manufacturer.model';
import { MANUFACTURER_ENDPOINTS } from '@/constants/manufacturer.constants';
import { apiService } from './api.service';

export const manufacturerService = {
  async getManufacturers(
    page: number = 1,
    limit: number = 10
  ): Promise<ManufacturersListResponse> {
    const response = await apiService.get(
      `${MANUFACTURER_ENDPOINTS.GET_ALL}?limit=${limit}&offset=${(page - 1) * limit}`
    );
    
    // Handle different response structures
    const responseData = response.data || response;
    const manufacturers = responseData?.data?.manufacturers || 
                         responseData?.manufacturers || 
                         (Array.isArray(responseData?.data) ? responseData?.data : []);
    const totalCount = responseData?.data?.total_count || 
                      responseData?.total_count || 
                      (Array.isArray(manufacturers) ? manufacturers.length : 0);
    
    return {
      success: responseData?.success || true,
      data: {
        manufacturers: Array.isArray(manufacturers) ? manufacturers : [],
        total_count: totalCount,
      },
    };
  },

  async getManufacturer(id: string): Promise<ManufacturerResponse> {
    const response = await apiService.get(MANUFACTURER_ENDPOINTS.GET_ONE(id));
    return {
      success: response.data?.success || true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Manufacturer retrieved successfully',
    };
  },

  async createManufacturer(
    data: CreateManufacturerRequest
  ): Promise<ManufacturerResponse> {
    const response = await apiService.post(MANUFACTURER_ENDPOINTS.CREATE, data);
    return {
      success: response.data?.success || true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Manufacturer created successfully',
    };
  },

  async updateManufacturer(
    id: string,
    data: UpdateManufacturerRequest
  ): Promise<ManufacturerResponse> {
    const response = await apiService.put(
      MANUFACTURER_ENDPOINTS.UPDATE(id),
      data
    );
    return {
      success: response.data?.success || true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Manufacturer updated successfully',
    };
  },

  async deleteManufacturer(id: string): Promise<DeleteManufacturerResponse> {
    const response = await apiService.delete(MANUFACTURER_ENDPOINTS.DELETE(id));
    return {
      success: response.data?.success || true,
      message: response.data?.message || 'Manufacturer deleted successfully',
    };
  },

  async getManufacturersByProductGroup(
    productGroupId: string
  ): Promise<ManufacturersListResponse> {
    const response = await apiService.get(
      MANUFACTURER_ENDPOINTS.GET_BY_PRODUCT_GROUP(productGroupId)
    );
    return {
      success: response.data?.success || true,
      data: {
        manufacturers: response.data?.data || [],
        total_count: (response.data?.data || []).length,
      },
    };
  },
};
