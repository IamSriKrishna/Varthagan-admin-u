// lib/api/customerService.ts
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  Customer,
  CustomerListResponse,
  CustomerResponse,
} from "@/models/customer.model";
import { CUSTOMER_ENDPOINTS } from "@/constants/customer.constants";
import { apiService } from "./api.service";

export const customerService = {
  async createCustomer(data: CreateCustomerInput): Promise<CustomerResponse> {
    return apiService.post(CUSTOMER_ENDPOINTS.CREATE, data);
  },

  async getCustomers(page: number = 1, limit: number = 10, search?: string): Promise<CustomerListResponse> {
    return apiService.get(CUSTOMER_ENDPOINTS.GET_ALL(page, limit, search));
  },

  async getCustomer(id: string | number): Promise<CustomerResponse> {
    return apiService.get(CUSTOMER_ENDPOINTS.GET_BY_ID(id));
  },

  async updateCustomer(id: string | number, data: UpdateCustomerInput): Promise<CustomerResponse> {
    return apiService.put(CUSTOMER_ENDPOINTS.UPDATE(id), data);
  },

  async deleteCustomer(id: string | number): Promise<{ success: boolean; message?: string }> {
    return apiService.delete(CUSTOMER_ENDPOINTS.DELETE(id));
  },

  async searchCustomers(query: string, page: number = 1, limit: number = 10): Promise<CustomerListResponse> {
    return apiService.get(CUSTOMER_ENDPOINTS.SEARCH(query, page, limit));
  },
};
