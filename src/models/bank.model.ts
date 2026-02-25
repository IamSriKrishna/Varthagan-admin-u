export interface Bank {
  id: number;
  bank_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankListResponse {
  success: boolean;
  data: Bank[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
}

export interface BankResponse {
  success: boolean;
  data: Bank;
  message: string;
}

// API Input Types
export interface CreateBankInput extends Omit<Bank, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateBankInput extends Partial<Bank> {}
