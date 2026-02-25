import {
  CreateBankInput,
  UpdateBankInput,
  Bank,
  BankListResponse,
  BankResponse,
} from "@/models/bank.model";
import { BANK_ENDPOINTS } from "@/constants/bank.constants";
import { apiService } from "./api.service";

export const bankService = {
  async createBank(data: CreateBankInput): Promise<BankResponse> {
    return apiService.post(BANK_ENDPOINTS.CREATE, data);
  },

  async getBanks(page: number = 1, limit: number = 100): Promise<BankListResponse> {
    return apiService.get(BANK_ENDPOINTS.GET_ALL(page, limit));
  },

  async getBank(id: number): Promise<BankResponse> {
    return apiService.get(BANK_ENDPOINTS.GET_BY_ID(id));
  },

  async updateBank(id: number, data: UpdateBankInput): Promise<BankResponse> {
    return apiService.put(BANK_ENDPOINTS.UPDATE(id), data);
  },

  async deleteBank(id: number): Promise<{ success: boolean; message?: string }> {
    return apiService.delete(BANK_ENDPOINTS.DELETE(id));
  },
};
