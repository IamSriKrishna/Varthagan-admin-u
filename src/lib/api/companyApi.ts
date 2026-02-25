import axios from "axios";
import { localStorageAuthKey } from "@/constants/localStorageConstant";
import { LoginResponse } from "@/models/IUser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to get token from Redux persisted state
const getToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return "";

    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return "";

    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || "";
  } catch (e) {
    console.error("Failed to get token from persisted auth:", e);
    return "";
  }
};

// Helper to get headers with auth
const getHeaders = (contentType: string = "application/json") => ({
  "Content-Type": contentType,
  Authorization: `Bearer ${getToken()}`,
});

// Input Types
export interface CreateCompanyInput {
  company_name: string;
  business_type_id: number;
  gst_number?: string;
  pan_number?: string;
}

export interface UpsertCompanyContactInput {
  mobile: string;
  alternate_mobile?: string;
  email: string;
}

export interface UpsertCompanyAddressInput {
  address_line1: string;
  address_line2?: string;
  city: string;
  state_id: number;
  country_id: number;
  pincode: string;
}

export interface CreateBankDetailInput {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string;
  is_primary: boolean;
}

export interface UpsertUPIDetailInput {
  upi_id: string;
  upi_qr_url?: string;
}

export interface UpsertInvoiceSettingsInput {
  invoice_prefix: string;
  invoice_start_number: number;
  show_logo: boolean;
  show_signature: boolean;
  round_off_total: boolean;
}

export interface UpsertTaxSettingsInput {
  gst_enabled: boolean;
  tax_type_id: number;
}

export interface UpsertRegionalSettingsInput {
  timezone: string;
  date_format: string;
  time_format: string;
  currency_code: string;
  currency_symbol: string;
  language_code: string;
}

export interface CompleteCompanySetupInput {
  company: CreateCompanyInput;
  contact: UpsertCompanyContactInput;
  address: UpsertCompanyAddressInput;
  bank_details?: CreateBankDetailInput;
  upi_details?: UpsertUPIDetailInput;
  invoice_settings?: UpsertInvoiceSettingsInput;
  tax_settings?: UpsertTaxSettingsInput;
  regional_settings?: UpsertRegionalSettingsInput;
}

// Helper types
export interface BusinessType {
  id: number;
  type_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Country {
  id: number;
  country_name: string;
  country_code: string;
  phone_code?: string;
}

export interface State {
  id: number;
  country_id: number;
  state_name: string;
  state_code?: string;
}

export interface TaxType {
  id: number;
  tax_name: string;
  tax_code: string;
  description?: string;
}

// Company List Types
export interface CompanyData {
  company: {
    id: number;
    company_name: string;
    business_type_id: number;
    business_type: BusinessType;
    gst_number?: string;
    pan_number?: string;
    created_at: string;
    updated_at: string;
  };
  contact: {
    id: number;
    company_id: number;
    mobile: string;
    alternate_mobile?: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  address: {
    id: number;
    company_id: number;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_id: number;
    state: State & { country: Country };
    country_id: number;
    country: Country;
    pincode: string;
    created_at: string;
    updated_at: string;
  };
  bank_details?: Array<{
    id: number;
    company_id: number;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    branch_name?: string;
    is_primary: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  upi_details?: {
    id: number;
    company_id: number;
    upi_id: string;
    upi_qr_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  invoice_settings?: {
    id: number;
    company_id: number;
    invoice_prefix: string;
    invoice_start_number: number;
    current_invoice_number?: number;
    show_logo: boolean;
    show_signature: boolean;
    round_off_total: boolean;
    created_at: string;
    updated_at: string;
  };
  tax_settings?: {
    id: number;
    company_id: number;
    gst_enabled: boolean;
    tax_type_id: number;
    tax_type: TaxType;
    created_at: string;
    updated_at: string;
  };
  regional_settings?: {
    id: number;
    company_id: number;
    timezone: string;
    date_format: string;
    time_format: string;
    currency_code: string;
    currency_symbol: string;
    language_code: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CompaniesListResponse {
  data: CompanyData[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

// API Functions
export const companyApi = {
  // Get helper data
  getBusinessTypes: async (): Promise<BusinessType[]> => {
    const response = await axios.get(`${API_BASE_URL}/helpers/business-types`);
    return response.data;
  },

  getCountries: async (): Promise<Country[]> => {
    const response = await axios.get(`${API_BASE_URL}/helpers/countries`);
    return response.data;
  },

  getStatesByCountry: async (countryId: number): Promise<State[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/helpers/countries/${countryId}/states`
    );
    return response.data;
  },

  getTaxTypes: async (): Promise<TaxType[]> => {
    const response = await axios.get(`${API_BASE_URL}/helpers/tax-types`);
    return response.data;
  },

  // Company setup - protected endpoint requiring authentication
  completeCompanySetup: async (input: CompleteCompanySetupInput) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.post(`${API_BASE_URL}/companies/setup`, input, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Get companies list - protected endpoint
  getCompaniesList: async (page: number = 1, pageSize: number = 10): Promise<CompaniesListResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.get(`${API_BASE_URL}/companies`, {
      params: { page, page_size: pageSize },
      headers: getHeaders(),
    });
    return response.data;
  },

  // Get single company details - protected endpoint
  getCompanyById: async (id: number): Promise<{ company: CompanyData }> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.get(`${API_BASE_URL}/companies/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Update company - protected endpoint
  updateCompany: async (id: number, input: Partial<CompleteCompanySetupInput>) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.put(`${API_BASE_URL}/companies/${id}`, input, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Delete company - protected endpoint (requires SuperAdmin)
  deleteCompany: async (id: number) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    await axios.delete(`${API_BASE_URL}/companies/${id}`, {
      headers: getHeaders(),
    });
    return { success: true };
  },
};
