/**
 * Customer Pricing Service
 * Handles all API calls related to customer pricing management
 */

import { apiService } from './api.service';
import {
  CreateCustomerPricingRequest,
  UpdateCustomerPricingRequest,
  CustomerPricingLineItem,
  CustomerPricingResponse,
  CustomerPricingListResponse,
} from '@/models/customerPricing.model';

const ENDPOINT = '/api/customer-pricing';

export const customerPricingService = {
  /**
   * Create new customer pricing
   * @param data - Customer pricing data
   * @param options - API options including token
   */
  create: async (
    data: CreateCustomerPricingRequest,
  ): Promise<CustomerPricingResponse> => {
    try {
      const response = await apiService.post(ENDPOINT, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer pricing: ${error}`);
    }
  },

  /**
   * Get specific customer pricing by ID
   * @param id - Customer pricing ID
   * @param options - API options including token
   */
  getById: async (id: string): Promise<CustomerPricingResponse> => {
    try {
      const response = await apiService.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer pricing: ${error}`);
    }
  },

  /**
   * Get all pricings for a specific customer
   * @param customerId - Customer ID
   * @param options - API options including token
   */
  getByCustomerId: async (
    customerId: number,
  ): Promise<CustomerPricingListResponse> => {
    try {
      const response = await apiService.get(`${ENDPOINT}/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer pricing for customer ${customerId}: ${error}`);
    }
  },

  /**
   * List all customer pricings with pagination
   * @param limit - Number of records per page
   * @param offset - Starting record offset
   * @param options - API options including token
   */
  list: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<CustomerPricingListResponse> => {
    try {
      const response = await apiService.get(
        `${ENDPOINT}?limit=${limit}&offset=${offset}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer pricings list: ${error}`);
    }
  },

  /**
   * Update customer pricing
   * @param id - Customer pricing ID
   * @param data - Updated pricing data
   * @param options - API options including token
   */
  update: async (
    id: string,
    data: UpdateCustomerPricingRequest,
  ): Promise<CustomerPricingResponse> => {
    try {
      const response = await apiService.put(`${ENDPOINT}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer pricing: ${error}`);
    }
  },

  /**
   * Add a line item to existing customer pricing
   * @param id - Customer pricing ID
   * @param lineItem - Line item data to add
   * @param options - API options including token
   */
  addLineItem: async (
    id: string,
    lineItem: Omit<CustomerPricingLineItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<CustomerPricingResponse> => {
    try {
      const response = await apiService.post(`${ENDPOINT}/${id}/line-items`, lineItem);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add line item to customer pricing: ${error}`);
    }
  },

  /**
   * Delete a line item from customer pricing
   * @param id - Customer pricing ID
   * @param lineItemId - Line item ID to delete
   * @param options - API options including token
   */
  deleteLineItem: async (
    id: string,
    lineItemId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.delete(
        `${ENDPOINT}/${id}/line-items/${lineItemId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete line item: ${error}`);
    }
  },

  /**
   * Delete entire customer pricing record
   * @param id - Customer pricing ID
   * @param options - API options including token
   */
  delete: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.delete(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer pricing: ${error}`);
    }
  },

  /**
   * Get pricing for specific manufacturer across all customers
   * @param manufacturerId - Manufacturer ID
   * @param options - API options including token
   */
  getByManufacturerId: async (
    manufacturerId: string,
  ): Promise<CustomerPricingListResponse> => {
    try {
      const response = await apiService.get(
        `${ENDPOINT}/manufacturer/${manufacturerId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch pricing for manufacturer ${manufacturerId}: ${error}`);
    }
  },

  /**
   * Get pricing summary/statistics for a customer
   * @param customerId - Customer ID
   * @param options - API options including token
   */
  getCustomerPricingSummary: async (
    customerId: number,
  ): Promise<{
    success: boolean;
    data: {
      total_manufacturers: number;
      average_rate: number;
      lowest_rate: number;
      highest_rate: number;
      total_pricing_records: number;
    };
  }> => {
    try {
      const response = await apiService.get(
        `${ENDPOINT}/customer/${customerId}/summary`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch pricing summary: ${error}`);
    }
  },

  /**
   * Bulk update pricing for multiple customers
   * @param data - Array of pricing updates
   * @param options - API options including token
   */
  bulkUpdate: async (
    data: Array<{ id: string; line_items: any[] }>,
  ): Promise<{
    success: boolean;
    data: { updated: number; failed: number };
  }> => {
    try {
      const response = await apiService.post(`${ENDPOINT}/bulk-update`, { pricings: data });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to perform bulk update: ${error}`);
    }
  },

  /**
   * Export pricing to CSV
   * @param filters - Optional filters (customerId, manufacturerId, etc.)
   * @param options - API options including token
   */
  export: async (
    filters?: Record<string, any>,
  ): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${ENDPOINT}/export?${queryParams.toString()}`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to export customer pricing: ${error}`);
    }
  },

  /**
   * Import pricing from CSV
   * @param file - CSV file to import
   */
  import: async (
    file: File,
  ): Promise<{
    success: boolean;
    data: { imported: number; failed: number; errors: string[] };
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post(`${ENDPOINT}/import`, formData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to import customer pricing: ${error}`);
    }
  },
};
