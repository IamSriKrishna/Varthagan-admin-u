import { apiService } from '@/lib/api/api.service';
import {
  CreateProductGroupInput,
  UpdateProductGroupInput,
  CreateProductGroupOutput,
  ProductGroupListResponse,
  ProductGroupResponse,
  ProductGroupDeleteResponse,
  ProductGroupDetailsOutput,
} from '@/models/product-group.model';

const PRODUCT_GROUPS_ENDPOINT = '/product-groups';

export const productGroupService = {
  /**
   * Get all product groups with pagination
   */
  async getProductGroups(page: number = 1, limit: number = 10, search?: string): Promise<ProductGroupListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
      ...(search && { search }),
    });

    const response = await apiService.get(`${PRODUCT_GROUPS_ENDPOINT}?${params.toString()}`);
    return response as ProductGroupListResponse;
  },

  /**
   * Get a single product group by ID with all components
   */
  async getProductGroup(id: string): Promise<ProductGroupResponse> {
    const response = await apiService.get(`${PRODUCT_GROUPS_ENDPOINT}/${id}`);
    return response as ProductGroupResponse;
  },

  /**
   * Create a new product group with components
   */
  async createProductGroup(data: CreateProductGroupInput): Promise<ProductGroupResponse> {
    const response = await apiService.post(PRODUCT_GROUPS_ENDPOINT, data);
    return response as ProductGroupResponse;
  },

  /**
   * Update an existing product group
   */
  async updateProductGroup(id: string, data: UpdateProductGroupInput): Promise<ProductGroupResponse> {
    const response = await apiService.put(`${PRODUCT_GROUPS_ENDPOINT}/${id}`, data);
    return response as ProductGroupResponse;
  },

  /**
   * Delete a product group
   */
  async deleteProductGroup(id: string): Promise<ProductGroupDeleteResponse> {
    const response = await apiService.delete(`${PRODUCT_GROUPS_ENDPOINT}/${id}`);
    return response as ProductGroupDeleteResponse;
  },
};
