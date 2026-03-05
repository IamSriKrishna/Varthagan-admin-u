import { apiService } from "./api.service";

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  company_id?: number;
  date: string;
  status: "on_time" | "absent" | "late" | "holiday" | "half_day" | "leave";
  reason?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  working_hours?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data?: AttendanceRecord;
  error?: boolean;
  message?: string;
}

export interface AttendanceListResponse {
  success: boolean;
  data?: AttendanceRecord[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AttendanceStatsResponse {
  success: boolean;
  data?: {
    total: number;
    on_time: number;
    absent: number;
    late: number;
    holiday: number;
    half_day: number;
    leave: number;
  };
}

class AttendanceService {
  private baseUrl = "/auth/manage/attendance";

  // Create attendance record
  async createAttendance(data: AttendanceRecord): Promise<AttendanceResponse> {
    return apiService.post(`${this.baseUrl}`, data);
  }

  // Get all attendance records
  async getAttendance(page: number = 1, limit: number = 10): Promise<AttendanceListResponse> {
    return apiService.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  // Get attendance for specific employee
  async getAttendanceByEmployee(
    employeeId: number | string,
    page: number = 1,
    limit: number = 10
  ): Promise<AttendanceListResponse> {
    return apiService.get(`${this.baseUrl}/employee/${employeeId}?page=${page}&limit=${limit}`);
  }

  // Get attendance by date range
  async getAttendanceByDateRange(
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AttendanceListResponse> {
    return apiService.get(
      `${this.baseUrl}/date-range?from_date=${fromDate}&to_date=${toDate}&page=${page}&limit=${limit}`
    );
  }

  // Get attendance for employee in date range
  async getAttendanceByEmployeeAndDateRange(
    employeeId: number | string,
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AttendanceListResponse> {
    return apiService.get(
      `${this.baseUrl}/employee/${employeeId}/date-range?from_date=${fromDate}&to_date=${toDate}&page=${page}&limit=${limit}`
    );
  }

  // Get attendance statistics
  async getAttendanceStats(fromDate: string, toDate: string): Promise<AttendanceStatsResponse> {
    return apiService.get(`${this.baseUrl}/stats/report?from_date=${fromDate}&to_date=${toDate}`);
  }

  // Quick check-in
  async checkIn(employeeId: number | string): Promise<AttendanceResponse> {
    return apiService.post(`${this.baseUrl}/checkin/${employeeId}`, {});
  }

  // Quick check-out
  async checkOut(employeeId: number | string): Promise<AttendanceResponse> {
    return apiService.post(`${this.baseUrl}/checkout/${employeeId}`, {});
  }

  // Update attendance record
  async updateAttendance(id: number | string, data: Partial<AttendanceRecord>): Promise<AttendanceResponse> {
    return apiService.put(`${this.baseUrl}/${id}`, data);
  }

  // Delete attendance record
  async deleteAttendance(id: number | string): Promise<AttendanceResponse> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  // Get single attendance record
  async getAttendanceById(id: number | string): Promise<AttendanceResponse> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  // Get company-wide week view attendance
  async getCompanyWeekView(
    fromDate: string,
    toDate: string
  ): Promise<any> {
    return apiService.get(
      `${this.baseUrl}/company/week-view?from_date=${fromDate}&to_date=${toDate}`
    );
  }
}

export const attendanceService = new AttendanceService();
