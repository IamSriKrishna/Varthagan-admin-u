import { apiService } from "./api.service";
import {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeListResponse,
  EmployeeResponse,
} from "@/models/employee.model";
import { localStorageAuthKey } from "@/constants/localStorageConstant";

/**
 * Employee Service
 * Handles all employee-related API calls
 *
 * API Endpoints:
 * - POST /api/employees - Create new employee (form-data)
 * - GET /api/employees?page=1&limit=10 - Get paginated list of employees
 * - GET /api/employees/{id} - Get single employee by ID
 * - PATCH /api/employees/{id} - Update employee (JSON)
 * - DELETE /api/employees/{id} - Delete employee
 *
 * Field Validations:
 * - name: string, required, min 1 character
 * - email: string, optional, valid email format
 * - number: string, required, phone number
 * - address: string, required, min 1 character
 * - employee_type: string, required, must be "full-time" or "part-time"
 * - monthly_salary: number, required, must be > 0
 *
 * POST Response (201 Created):
 * {
 *   "success": true,
 *   "message": "",
 *   "data": { ...employee object }
 * }
 *
 * PATCH Response (200 OK):
 * {
 *   "success": true,
 *   "message": "",
 *   "data": { ...updated employee object }
 * }
 *
 * DELETE Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Employee deleted successfully",
 *   "data": null
 * }
 *
 * Error Response (400 Bad Request):
 * {
 *   "error": true,
 *   "message": "Error message describing the issue",
 *   "code": 400
 * }
 */
class EmployeeService {
  private baseUrl = "/auth/manage/employees";

  /**
   * Convert file to Base64 string
   * @param file - File object to convert
   * @returns Promise<string> - Base64 encoded string
   */
  async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extract base64 part after comma
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => {
        reject(new Error(`Failed to convert file to base64: ${error}`));
      };
    });
  }

  /**
   * Create a new employee
   * @param data - Employee creation data (name, email, number, address, employee_type, monthly_salary)
   * @returns Promise<EmployeeResponse> - Created employee details with ID and timestamps
   *
   * Possible error messages:
   * - "Name is required"
   * - "Invalid employee type. Must be 'part-time' or 'full-time'"
   * - "Invalid email format"
   * - "Invalid monthly salary format"
   * - "Document file is required"
   *
   * Success response: Status 201 Created
   * Error response: Status 400 Bad Request
   */
  async createEmployee(data: EmployeeCreateRequest): Promise<EmployeeResponse> {
    return apiService.post(`${this.baseUrl}`, data);
  }

  /**
   * Create a new employee with file upload (form-data)
   * @param formData - FormData object containing employee fields and document file
   * @returns Promise<EmployeeResponse> - Created employee details with document URL
   *
   * Form data fields:
   * - name: string (required)
   * - email: string (optional)
   * - number: string (required)
   * - address: string (required)
   * - employee_type: string (required, 'part-time' or 'full-time')
   * - monthly_salary: number (required, > 0)
   * - document: File (required)
   *
   * Success response: Status 201 Created
   * Error response: Status 400 Bad Request
   */
  async createEmployeeWithFile(formData: FormData): Promise<EmployeeResponse> {
    return apiService.postFormData(`${this.baseUrl}`, formData);
  }

  /**
   * Get a paginated list of employees
   * @param page - Page number (default: 1)
   * @param limit - Records per page (default: 10)
   * @returns Promise<EmployeeListResponse> - List of employees with pagination metadata
   *
   * Response includes:
   * - data: Array of employee objects
   * - meta: { current_page, per_page, total, total_pages }
   *
   * Success response: Status 200 OK
   */
  async getEmployees(
    page: number = 1,
    limit: number = 10
  ): Promise<EmployeeListResponse> {
    return apiService.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  /**
   * Get a specific employee by ID
   * @param id - Employee ID
   * @returns Promise<EmployeeResponse> - Complete employee details
   *
   * Success response: Status 200 OK
   * Returns full employee object including: id, name, email, number, address,
   * employee_type, monthly_salary, document_url, user_id, company_id, created_at, updated_at
   */
  async getEmployeeById(id: number | string): Promise<EmployeeResponse> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Update employee information (all fields optional)
   * @param id - Employee ID
   * @param data - Partial employee data to update
   * @returns Promise<EmployeeResponse> - Updated employee details
   *
   * Possible error messages:
   * - "Invalid employee ID"
   * - "Invalid request body"
   * - "Invalid email format"
   * - "Invalid employee type. Must be 'part-time' or 'full-time'"
   * - "Monthly salary must be greater than 0"
   * - "Employee not found or you don't have permission to update it"
   *
   * Success response: Status 200 OK
   * Error response: Status 400 Bad Request
   */
  async updateEmployee(
    id: number | string,
    data: EmployeeUpdateRequest
  ): Promise<EmployeeResponse> {
    return apiService.patch(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an employee record (soft delete)
   * @param id - Employee ID
   * @returns Promise<EmployeeResponse> - Success message with deleted employee confirmation
   *
   * Possible error messages:
   * - "Invalid employee ID"
   * - "Employee not found or you don't have permission to delete it"
   *
   * Success response: Status 200 OK with message "Employee deleted successfully"
   * Error response: Status 400 Bad Request
   */
  async deleteEmployee(id: number | string): Promise<EmployeeResponse> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Download employee document via backend proxy
   * @param id - Employee ID
   * @returns Promise<Blob> - Document file blob for download
   *
   * Success response: Status 200 OK with file blob
   * Error response: Status 400 Bad Request
   */
  async downloadEmployeeDocument(id: number | string): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8088';
    
    let token = '';
    try {
      if (typeof window !== 'undefined') {
        const persistedRoot = localStorage.getItem(localStorageAuthKey);
        if (persistedRoot) {
          const rootData = JSON.parse(persistedRoot);
          if (rootData.auth) {
            const authData = JSON.parse(rootData.auth);
            token = authData.access_token || '';
          }
        }
      }
    } catch (e) {
      console.error('Failed to get token:', e);
    }

    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/${id}/download-document`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to download document: ${response.statusText}`);
    }
    
    return response.blob();
  }
}

export const employeeService = new EmployeeService();
