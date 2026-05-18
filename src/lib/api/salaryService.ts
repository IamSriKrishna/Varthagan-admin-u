import { apiService } from "./api.service";
import {
  CalculateSalaryRequest,
  SalaryCalculationResponse,
  SalaryCalculationListResponse,
  SalaryApprovalResponse,
} from "@/models/salary.model";

/**
 * Salary Calculation Service
 * Handles all salary-related API calls for employee salary calculations
 *
 * API Endpoints:
 * - POST /admin/salary/calculate - Calculate salary for an employee
 * - GET /admin/salary/:id - Get salary calculation details
 * - GET /admin/salary/employee/:employee_id - Get all salary calculations for an employee
 * - POST /admin/salary/:id/approve - Approve a pending salary calculation
 *
 * Salary Calculation Features:
 * ✅ Automatic calculation based on attendance
 * ✅ Support for both monthly and weekly salaries
 * ✅ Intelligent handling of holidays and leaves
 * ✅ Support for half-day work
 * ✅ Tracking of absent day deductions
 * ✅ Status management (pending/approved)
 * ✅ Detailed breakdown of earning and deductions
 */
class SalaryService {
  private baseUrl = "/admin/salary";

  /**
   * Calculate salary for an employee
   *
   * Calculates the salary based on:
   * - Employee's base salary (monthly or weekly)
   * - Attendance records for the specified month
   * - Working days (excluding Sundays, holidays, and leaves)
   * - Present days, absent days, and half days
   *
   * Formula:
   * - Daily Rate = Base Salary / Total Working Days
   * - Earning = (Present Days × Daily Rate) + (Half Days × Daily Rate / 2)
   * - Deduction = Absent Days × Daily Rate
   * - Net Salary = Earning - Deduction
   *
   * @param data - CalculateSalaryRequest with employee_id, month, year
   * @returns Promise<SalaryCalculationResponse> - Calculated salary details
   *
   * Request:
   * ```json
   * {
   *   "employee_id": 1,
   *   "month": 5,
   *   "year": 2026
   * }
   * ```
   *
   * Success response: Status 201 Created
   * Error response: Status 400 Bad Request
   *
   * Example error cases:
   * - "employee not found"
   * - "Invalid month (must be 1-12)"
   * - "Invalid year (must be >= 2000)"
   * - "No attendance records found for this period"
   */
  async calculateSalary(
    data: CalculateSalaryRequest
  ): Promise<SalaryCalculationResponse> {
    return apiService.post(`${this.baseUrl}/calculate`, data);
  }

  /**
   * Get salary calculation details
   *
   * Retrieves the complete details of a specific salary calculation including:
   * - Employee information
   * - Base salary and salary type
   * - Attendance breakdown (present, absent, half days, etc.)
   * - Daily rate and earning/deduction amounts
   * - Net salary and approval status
   *
   * @param id - Salary calculation ID
   * @returns Promise<SalaryCalculationResponse> - Complete salary details
   *
   * Request:
   * ```
   * GET /admin/salary/1
   * ```
   *
   * Success response: Status 200 OK
   * Error response: Status 404 Not Found
   *
   * Example error cases:
   * - "salary calculation not found"
   */
  async getSalaryById(id: number | string): Promise<SalaryCalculationResponse> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all salary calculations for an employee
   *
   * Retrieves a list of all salary calculations for a specific employee,
   * showing summary information for each month/year combination.
   * Useful for viewing salary history and trends.
   *
   * @param employeeId - Employee ID
   * @returns Promise<SalaryCalculationListResponse> - List of salary records
   *
   * Request:
   * ```
   * GET /admin/salary/employee/1
   * ```
   *
   * Success response: Status 200 OK
   * Returns array of SalaryCalculationListOutput with pagination support
   *
   * Response includes:
   * - id: Salary calculation ID
   * - employee_id: Associated employee
   * - month: Month of calculation (1-12)
   * - year: Year of calculation
   * - base_salary: Employee's base salary for that period
   * - net_salary: Final salary after deductions
   * - status: "pending" or "approved"
   * - created_at: Calculation timestamp
   */
  async getSalariesByEmployeeId(
    employeeId: number | string
  ): Promise<SalaryCalculationListResponse> {
    return apiService.get(`${this.baseUrl}/employee/${employeeId}`);
  }

  /**
   * Approve a pending salary calculation
   *
   * Changes the status of a salary calculation from "pending" to "approved".
   * This typically marks the salary as ready for processing/disbursement.
   *
   * @param salaryId - Salary calculation ID to approve
   * @returns Promise<SalaryApprovalResponse> - Approval confirmation
   *
   * Request:
   * ```json
   * POST /admin/salary/1/approve
   * {}
   * ```
   *
   * Success response: Status 200 OK
   * ```json
   * {
   *   "success": true,
   *   "message": "Salary approved successfully"
   * }
   * ```
   *
   * Error response: Status 404 Not Found
   * ```json
   * {
   *   "error": true,
   *   "message": "salary calculation not found"
   * }
   * ```
   */
  async approveSalary(salaryId: number | string): Promise<SalaryApprovalResponse> {
    return apiService.post(`${this.baseUrl}/${salaryId}/approve`, {});
  }

  /**
   * Get salary calculation summary for a date range
   *
   * Retrieves summary statistics for all salary calculations within a date range.
   * Useful for reports and analytics.
   *
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @returns Promise<any> - Summary data
   */
  async getSalarySummary(
    fromDate: string,
    toDate: string
  ): Promise<any> {
    return apiService.get(
      `${this.baseUrl}/summary?from_date=${fromDate}&to_date=${toDate}`
    );
  }

  /**
   * Get pending salary calculations for approval
   *
   * Retrieves all salary calculations with "pending" status
   * that are waiting for manager approval.
   *
   * @returns Promise<SalaryCalculationListResponse> - List of pending salaries
   */
  async getPendingSalaries(): Promise<SalaryCalculationListResponse> {
    return apiService.get(`${this.baseUrl}/status/pending`);
  }

  /**
   * Export salary calculations to CSV
   *
   * Generates a CSV file with all salary calculations for a given month/year.
   * Useful for payroll processing and record keeping.
   *
   * @param month - Month (1-12)
   * @param year - Year (2000+)
   * @returns Promise<any> - CSV file or download link
   */
  async exportSalaries(month: number, year: number): Promise<any> {
    return apiService.get(`${this.baseUrl}/export?month=${month}&year=${year}`);
  }
}

export const salaryService = new SalaryService();
