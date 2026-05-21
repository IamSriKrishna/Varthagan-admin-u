/**
 * Salary Calculation Models
 * Handles all salary calculation related data structures
 */

// ─────────────────────────────────────────────────────────────
// Input DTOs
// ─────────────────────────────────────────────────────────────

export interface CalculateSalaryRequest {
  employee_id: number;
  from_date: string; // YYYY-MM-DD format
  to_date: string; // YYYY-MM-DD format
}

export interface ApproveSalaryRequest {
  salary_calculation_id: number;
}

// ─────────────────────────────────────────────────────────────
// Output DTOs
// ─────────────────────────────────────────────────────────────

export interface SalaryCalculationOutput {
  id: number;
  employee_id: number;
  employee_name: string;
  company_id: number;
  month: number;
  year: number;
  base_salary: number;
  salary_type: 'monthly' | 'weekly';
  total_working_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  holiday_days: number;
  leave_days: number;
  daily_rate: number;
  earning_amount: number;
  deduction_amount: number;
  net_salary: number;
  status: 'pending' | 'approved';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryCalculationListOutput {
  id: number;
  employee_id: number;
  employee_name: string;
  month: number;
  year: number;
  base_salary: number;
  net_salary: number;
  status: 'pending' | 'approved';
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// API Response DTOs
// ─────────────────────────────────────────────────────────────

export interface SalaryCalculationResponse {
  success: boolean;
  message?: string;
  data?: SalaryCalculationOutput;
  error?: boolean;
  code?: number;
}

export interface SalaryCalculationListResponse {
  success: boolean;
  message?: string;
  data: SalaryCalculationListOutput[];
  error?: boolean;
}

export interface SalaryApprovalResponse {
  success: boolean;
  message: string;
  error?: boolean;
  code?: number;
}

// ─────────────────────────────────────────────────────────────
// Attendance Status Type
// ─────────────────────────────────────────────────────────────

export type AttendanceStatus = 
  | 'on_time' 
  | 'late' 
  | 'absent' 
  | 'half_day' 
  | 'holiday' 
  | 'leave';

// ─────────────────────────────────────────────────────────────
// Salary Calculation Logic Types
// ─────────────────────────────────────────────────────────────

export interface SalaryCalculationBreakdown {
  base_salary: number;
  salary_type: 'monthly' | 'weekly';
  total_calendar_days: number;
  sundays: number;
  holidays: number;
  leaves: number;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  holiday_days: number;
  leave_days: number;
  daily_rate: number;
  earning_amount: number;
  deduction_amount: number;
  net_salary: number;
}

// ─────────────────────────────────────────────────────────────
// Database Schema Type (for reference)
// ─────────────────────────────────────────────────────────────

export interface SalaryCalculationRecord {
  id: number;
  employee_id: number;
  company_id: number;
  month: number;
  year: number;
  base_salary: number;
  salary_type: 'monthly' | 'weekly';
  total_working_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  holiday_days: number;
  leave_days: number;
  daily_rate: number;
  earning_amount: number;
  deduction_amount: number;
  net_salary: number;
  status: 'pending' | 'approved';
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
