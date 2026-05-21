/**
 * useSalaryCalculation Hook
 * 
 * Custom React hook for managing salary calculations with loading and error states
 * 
 * Usage:
 * ```typescript
 * const { 
 *   salary, 
 *   loading, 
 *   error,
 *   calculateSalary,
 *   getSalary,
 *   approveSalary
 * } = useSalaryCalculation();
 * ```
 */

'use client';

import { useState } from 'react';
import { salaryService } from '@/lib/api/salaryService';
import {
  SalaryCalculationOutput,
  SalaryCalculationListOutput,
  CalculateSalaryRequest,
} from '@/models/salary.model';

interface UseSalaryCalculationState {
  salary: SalaryCalculationOutput | null;
  salaries: SalaryCalculationListOutput[];
  loading: boolean;
  error: string | null;
}

export function useSalaryCalculation() {
  const [state, setState] = useState<UseSalaryCalculationState>({
    salary: null,
    salaries: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  /**
   * Calculate salary for an employee
   * @param data - CalculateSalaryRequest with employee_id, month, year, and optional week
   */
  const calculateSalary = async (data: CalculateSalaryRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.calculateSalary(data);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          salary: response.data || null,
          loading: false,
        }));
        return response.data;
      } else {
        const errorMsg = response.error ? 'Failed to calculate salary' : 'Unknown error';
        setError(errorMsg);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error calculating salary';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get salary calculation by ID
   * @param id - Salary calculation ID
   */
  const getSalary = async (id: number | string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.getSalaryById(id);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          salary: response.data || null,
          loading: false,
        }));
        return response.data;
      } else {
        const errorMsg = response.error ? 'Salary calculation not found' : 'Unknown error';
        setError(errorMsg);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error fetching salary';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all salary calculations for an employee
   * @param employeeId - Employee ID
   */
  const getSalariesByEmployee = async (employeeId: number | string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.getSalariesByEmployeeId(employeeId);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          salaries: response.data || [],
          loading: false,
        }));
        return response.data;
      } else {
        const errorMsg = response.error ? 'Failed to fetch salary history' : 'Unknown error';
        setError(errorMsg);
        return [];
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error fetching salary history';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve a pending salary calculation
   * @param salaryId - Salary calculation ID to approve
   */
  const approveSalary = async (salaryId: number | string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.approveSalary(salaryId);

      if (response.success) {
        // Update the salary status to approved if it's currently loaded
        setState(prev => ({
          ...prev,
          salary: prev.salary
            ? { ...prev.salary, status: 'approved' }
            : null,
          salaries: prev.salaries.map(s =>
            s.id === salaryId ? { ...s, status: 'approved' } : s
          ),
          loading: false,
        }));
        return true;
      } else {
        const errorMsg = response.error ? 'Failed to approve salary' : 'Unknown error';
        setError(errorMsg);
        return false;
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error approving salary';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get pending salary calculations
   */
  const getPendingSalaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.getPendingSalaries();

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          salaries: response.data || [],
          loading: false,
        }));
        return response.data;
      } else {
        const errorMsg = response.error ? 'Failed to fetch pending salaries' : 'Unknown error';
        setError(errorMsg);
        return [];
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error fetching pending salaries';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get salary summary for a date range
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   */
  const getSalarySummary = async (fromDate: string, toDate: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.getSalarySummary(fromDate, toDate);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMsg = err?.message || 'Error fetching salary summary';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export salaries to CSV
   * @param month - Month (1-12)
   * @param year - Year (2000+)
   */
  const exportSalaries = async (month: number, year: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salaryService.exportSalaries(month, year);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMsg = err?.message || 'Error exporting salaries';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const reset = () => {
    setState({
      salary: null,
      salaries: [],
      loading: false,
      error: null,
    });
  };

  return {
    // State
    salary: state.salary,
    salaries: state.salaries,
    loading: state.loading,
    error: state.error,

    // Methods
    calculateSalary,
    getSalary,
    getSalariesByEmployee,
    approveSalary,
    getPendingSalaries,
    getSalarySummary,
    exportSalaries,

    // Utilities
    clearError,
    reset,
  };
}

export default useSalaryCalculation;
