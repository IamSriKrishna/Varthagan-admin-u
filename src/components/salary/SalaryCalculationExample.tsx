/**
 * Example Component: SalaryCalculationExample
 * 
 * This component demonstrates how to use the Salary Calculation API
 * with both monthly and weekly salary calculations.
 * 
 * Features:
 * - Calculate monthly salary
 * - Calculate weekly salary
 * - View salary details
 * - Get employee salary history
 * - Approve pending salaries
 * - View pending salaries
 */

'use client';

import React, { useState } from 'react';
import useSalaryCalculation from '@/hooks/useSalaryCalculation';
import { SalaryCalculationOutput } from '@/models/salary.model';

interface CalculationFilters {
  employeeId: number;
  fromDate: string;
  toDate: string;
}

export function SalaryCalculationExample() {
  const {
    salary,
    salaries,
    loading,
    error,
    calculateSalary,
    getSalariesByEmployee,
    approveSalary,
    getPendingSalaries,
    clearError,
  } = useSalaryCalculation();

  const [filters, setFilters] = useState<CalculationFilters>({
    employeeId: 1,
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
  });

  const [activeTab, setActiveTab] = useState<'calculate' | 'history' | 'pending'>('calculate');

  // Handle salary calculation
  const handleCalculateSalary = async () => {
    const result = await calculateSalary({
      employee_id: filters.employeeId,
      from_date: filters.fromDate,
      to_date: filters.toDate,
    });

    if (result) {
      console.log('Salary calculated:', result);
    }
  };

  // Handle fetching employee salary history
  const handleGetHistory = async () => {
    const result = await getSalariesByEmployee(filters.employeeId);
    if (result) {
      console.log('Salary history:', result);
    }
  };

  // Handle fetching pending salaries
  const handleGetPending = async () => {
    const result = await getPendingSalaries();
    if (result) {
      console.log('Pending salaries:', result);
    }
  };

  // Handle salary approval
  const handleApproveSalary = async (salaryId: number) => {
    const result = await approveSalary(salaryId);
    if (result) {
      console.log('Salary approved successfully');
      // Refresh pending salaries list
      handleGetPending();
    }
  };

  // Render salary details card
  const renderSalaryDetails = (sal: SalaryCalculationOutput) => (
    <div key={sal.id} className="border rounded p-4 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Employee</p>
          <p className="font-semibold">{sal.employee_name}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Period</p>
          <p className="font-semibold">
            {sal.month}/{sal.year}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Base Salary</p>
          <p className="font-semibold">₹{sal.base_salary.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Salary Type</p>
          <p className="font-semibold capitalize">{sal.salary_type}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Working Days</p>
          <p className="font-semibold">{sal.total_working_days}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Daily Rate</p>
          <p className="font-semibold">₹{sal.daily_rate.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Present Days</p>
          <p className="text-green-600 font-semibold">{sal.present_days}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Absent Days</p>
          <p className="text-red-600 font-semibold">{sal.absent_days}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Half Days</p>
          <p className="font-semibold">{sal.half_days}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Earning Amount</p>
          <p className="text-green-600 font-semibold">₹{sal.earning_amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Deduction Amount</p>
          <p className="text-red-600 font-semibold">₹{sal.deduction_amount.toLocaleString()}</p>
        </div>
        <div className="col-span-2 bg-blue-50 p-3 rounded">
          <p className="text-gray-600 text-sm">Net Salary</p>
          <p className="text-blue-600 font-bold text-lg">₹{sal.net_salary.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Status</p>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            sal.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {sal.status.toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Calculated On</p>
          <p className="font-semibold">{new Date(sal.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      {sal.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-gray-600 text-sm">Notes</p>
          <p className="text-gray-800">{sal.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Salary Calculation Demo</h1>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={clearError}
            className="text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Filters */}
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h2 className="font-semibold mb-4">Salary Calculation Filters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Employee ID</label>
            <input
              type="number"
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: parseInt(e.target.value) })}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['calculate', 'history', 'pending'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'calculate' && (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleCalculateSalary}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate Salary'}
              </button>
            </div>

            {salary && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Salary Calculation Result</h3>
                {renderSalaryDetails(salary)}
                {salary.status === 'pending' && (
                  <button
                    onClick={() => handleApproveSalary(salary.id)}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Approving...' : 'Approve Salary'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <button
              onClick={handleGetHistory}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Loading...' : 'Load Salary History'}
            </button>

            {salaries.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Salary History</h3>
                {salaries.map(sal => (
                  <div key={sal.id} className="border rounded p-4 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{sal.employee_name}</p>
                        <p className="text-sm text-gray-600">{sal.month}/{sal.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{sal.net_salary.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          sal.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sal.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <button
              onClick={handleGetPending}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Loading...' : 'Load Pending Salaries'}
            </button>

            {salaries.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Pending Salaries ({salaries.length})</h3>
                {salaries.map(sal => (
                  <div key={sal.id} className="border rounded p-4 mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{sal.employee_name}</p>
                        <p className="text-sm text-gray-600">{sal.month}/{sal.year}</p>
                        <p className="text-sm text-gray-600">Base: ₹{sal.base_salary.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{sal.net_salary.toLocaleString()}</p>
                        <button
                          onClick={() => handleApproveSalary(sal.id)}
                          disabled={loading}
                          className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export default SalaryCalculationExample;
