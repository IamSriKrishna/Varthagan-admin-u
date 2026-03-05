export interface Employee {
  id: number;
  name: string;
  email?: string;
  number: string;
  address: string;
  user_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreateRequest {
  name: string;
  email?: string;
  number: string;
  address: string;
}

export interface EmployeeUpdateRequest {
  name?: string;
  email?: string;
  number?: string;
  address?: string;
}

export interface EmployeeResponse {
  success: boolean;
  data?: Employee;
  error?: boolean;
  message?: string;
}

export interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: boolean;
  message?: string;
}
