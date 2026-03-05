import { apiService } from "./api.service";
import {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeListResponse,
  EmployeeResponse,
} from "@/models/employee.model";

class EmployeeService {
  private baseUrl = "/auth/manage/employees";

  async createEmployee(data: EmployeeCreateRequest): Promise<EmployeeResponse> {
    return apiService.post(`${this.baseUrl}`, data);
  }

  async getEmployees(
    page: number = 1,
    limit: number = 10
  ): Promise<EmployeeListResponse> {
    return apiService.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  async getEmployeeById(id: number | string): Promise<EmployeeResponse> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  async updateEmployee(
    id: number | string,
    data: EmployeeUpdateRequest
  ): Promise<EmployeeResponse> {
    return apiService.put(`${this.baseUrl}/${id}`, data);
  }

  async deleteEmployee(id: number | string): Promise<EmployeeResponse> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }
}

export const employeeService = new EmployeeService();
