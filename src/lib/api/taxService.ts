import { apiService } from './api.service';
import { Tax } from '@/models/purchaseOrder.model';

interface TaxResponse {
  data: Tax[];
  success: boolean;
}

export const taxService = {
  async getTaxes(): Promise<TaxResponse> {
    const response = await apiService.get('/taxes');
    return {
      data: response.taxes || [],
      success: true,
    };
  },

  async getTax(id: number): Promise<{ data: Tax; success: boolean }> {
    const response = await apiService.get(`/taxes/${id}`);
    return {
      data: response,
      success: true,
    };
  },
};
