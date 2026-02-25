import {
  Bill,
  CreateBillRequest,
  UpdateBillRequest,
  BillResponse,
  BillsListResponse,
  DeleteBillResponse,
} from '@/models/bill.model';
import { BILL_ENDPOINTS } from '@/constants/bill.constants';
import { apiService } from './api.service';

export const billService = {
  async getBills(
    page: number = 1,
    limit: number = 10
  ): Promise<BillsListResponse> {
    const response = await apiService.get(
      `${BILL_ENDPOINTS.GET_ALL}?page=${page}&limit=${limit}`
    );
    
    let bills: Bill[] = [];
    let total = 0;
    
    if (response.data && Array.isArray(response.data)) {
      bills = response.data;
      total = response.total || 0;
    } else if (response.data && response.data.bills && Array.isArray(response.data.bills)) {
      bills = response.data.bills;
      total = response.data.total || 0;
    } else if (Array.isArray(response)) {
      bills = response;
    }
    
    return {
      data: bills,
      total,
      success: true,
      message: response.message || '',
    };
  },

  async getBill(id: string): Promise<BillResponse> {
    const response = await apiService.get(BILL_ENDPOINTS.GET_ONE(id));
    return {
      data: response.data || response,
      success: true,
      message: '',
    };
  },

  async createBill(data: CreateBillRequest): Promise<BillResponse> {
    const response = await apiService.post(BILL_ENDPOINTS.CREATE, data);
    return {
      data: response.data || response,
      success: response.success || true,
      message: response.message || 'Bill created successfully',
    };
  },

  async updateBill(id: string, data: UpdateBillRequest): Promise<BillResponse> {
    const response = await apiService.put(BILL_ENDPOINTS.UPDATE(id), data);
    return {
      data: response.data || response,
      success: response.success || true,
      message: response.message || 'Bill updated successfully',
    };
  },

  async deleteBill(id: string): Promise<DeleteBillResponse> {
    const response = await apiService.delete(BILL_ENDPOINTS.DELETE(id));
    return {
      data: response.data || { message: 'Bill deleted successfully' },
      success: response.success || true,
    };
  },

  async searchBills(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BillsListResponse> {
    const response = await apiService.get(
      BILL_ENDPOINTS.SEARCH(query, page, limit)
    );
    return {
      data: response.data || response,
      success: true,
    };
  },

  async updateBillStatus(id: string, status: string): Promise<BillResponse> {
    const response = await apiService.put(BILL_ENDPOINTS.UPDATE(id), { status });
    return {
      data: response.data || response,
      success: response.success || true,
      message: response.message || 'Bill status updated successfully',
    };
  },
};
