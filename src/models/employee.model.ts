export interface Employee {
  id: number;
  name: string;
  email?: string;
  number: string;
  address: string;
  employee_type: 'full-time' | 'part-time';
  monthly_salary: number;
  document_url?: string;
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
  employee_type: 'full-time' | 'part-time';
  monthly_salary: number;
  document?: File;
}

export interface EmployeeUpdateRequest {
  name?: string;
  email?: string;
  number?: string;
  address?: string;
  employee_type?: 'full-time' | 'part-time';
  monthly_salary?: number;
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data?: Employee;
  error?: boolean;
  code?: number;
}

export interface EmployeeListResponse {
  success: boolean;
  message?: string;
  data: Employee[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
