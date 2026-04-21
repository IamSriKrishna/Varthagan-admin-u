import { useState, useCallback } from 'react';
import { employeeService } from '@/lib/api/employeeService';
import {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeListResponse,
} from '@/models/employee.model';
import { validateEmployeeData } from '@/utils/employeeUtils';

export interface UseEmployeeManagerState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalEmployees: number;
  currentPage: number;
  rowsPerPage: number;
}

export interface UseEmployeeManagerActions {
  fetchEmployees: (page: number, limit: number) => Promise<void>;
  createEmployee: (data: EmployeeCreateRequest) => Promise<boolean>;
  updateEmployee: (id: number, data: EmployeeUpdateRequest) => Promise<boolean>;
  deleteEmployee: (id: number) => Promise<boolean>;
  resetError: () => void;
}

export function useEmployeeManager(
  initialPage: number = 1,
  initialLimit: number = 10
): UseEmployeeManagerState & UseEmployeeManagerActions {
  const [state, setState] = useState<UseEmployeeManagerState>({
    employees: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalEmployees: 0,
    currentPage: initialPage,
    rowsPerPage: initialLimit,
  });

  const fetchEmployees = useCallback(async (page: number, limit: number) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response: EmployeeListResponse = await employeeService.getEmployees(page, limit);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          employees: response.data,
          totalEmployees: response.meta?.total || 0,
          totalPages: response.meta?.total_pages || 1,
          currentPage: page,
          rowsPerPage: limit,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || 'Failed to fetch employees',
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        loading: false,
      }));
    }
  }, []);

  const createEmployee = useCallback(async (data: EmployeeCreateRequest): Promise<boolean> => {
    // Validate data
    const validation = validateEmployeeData({
      ...data,
      monthly_salary: data.monthly_salary,
      employee_type: data.employee_type,
    });

    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        error: `Validation error: ${Object.values(validation.errors).join(', ')}`,
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await employeeService.createEmployee(data);

      if (response.success) {
        // Refresh the list
        await fetchEmployees(state.currentPage, state.rowsPerPage);
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || 'Failed to create employee',
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        loading: false,
      }));
      return false;
    }
  }, [state.currentPage, state.rowsPerPage, fetchEmployees]);

  const updateEmployee = useCallback(
    async (id: number, data: EmployeeUpdateRequest): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const response = await employeeService.updateEmployee(id, data);

        if (response.success) {
          // Refresh the list
          await fetchEmployees(state.currentPage, state.rowsPerPage);
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || 'Failed to update employee',
            loading: false,
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          loading: false,
        }));
        return false;
      }
    },
    [state.currentPage, state.rowsPerPage, fetchEmployees]
  );

  const deleteEmployee = useCallback(async (id: number): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await employeeService.deleteEmployee(id);

      if (response.success) {
        // Refresh the list
        await fetchEmployees(state.currentPage, state.rowsPerPage);
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || 'Failed to delete employee',
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        loading: false,
      }));
      return false;
    }
  }, [state.currentPage, state.rowsPerPage, fetchEmployees]);

  const resetError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    resetError,
  };
}
