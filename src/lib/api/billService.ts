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
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token from persisted auth:', e);
    return '';
  }
};

const getHeaders = (contentType: string = 'application/json') => ({
  'Content-Type': contentType,
  'Authorization': `Bearer ${getToken()}`,
});

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
    const response = await fetch(`/api/bills/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update bill status');
    }

    const data = await response.json();
    return {
      data: data.data || data,
      success: true,
      message: data.message || 'Bill status updated successfully',
    };
  },
};
