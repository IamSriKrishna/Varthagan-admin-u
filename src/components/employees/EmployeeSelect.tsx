"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
  FormHelperText,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import { User } from "lucide-react";
import useFetch from "@/hooks/useFetch";

export interface Employee {
  id: number;
  name: string;
  email: string;
  number: string;
  address: string;
  employee_type: string;
  monthly_salary: number;
  document_url?: string;
  user_id: number;
  company_id: number;
  created_at: string;
}

interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface EmployeeSelectProps {
  value: number | string | undefined;
  onChange: (value: number | undefined) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  onEmployeeSelect?: (employee: Employee) => void;
}

export default function EmployeeSelect({
  value,
  onChange,
  label = "Employee",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  size = "small",
  fullWidth = true,
  onEmployeeSelect,
}: EmployeeSelectProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch employees
  const { data: response, loading } = useFetch<EmployeeListResponse>({
    url: "/auth/manage/employees?page=1&limit=100",
  });

  const employees: Employee[] = response?.data || [];

  // Update selected employee when value changes
  useEffect(() => {
    if (value && employees.length > 0) {
      const employee = employees.find((emp) => emp.id === Number(value));
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [value, employees]);

  const handleChange = (event: any) => {
    const selectedId = event.target.value;
    const numericId = selectedId ? Number(selectedId) : undefined;
    onChange(numericId);

    // Find and call callback with full employee data
    if (numericId && onEmployeeSelect) {
      const employee = employees.find((emp) => emp.id === numericId);
      if (employee) {
        onEmployeeSelect(employee);
      }
    }
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      size={size}
      disabled={disabled || loading}
    >
      <Select
        value={value ? String(value) : ""}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ opacity: 0.6 }}>Select an employee...</span>;
          }

          const selectedEmp = employees.find((emp) => emp.id === Number(selected));
          if (selectedEmp) {
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                }}
              >
                <span>{selectedEmp.name}</span>
                <Chip
                  label={`₹${selectedEmp.monthly_salary}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            );
          }
          return selected;
        }}
      >
        <MenuItem value="" disabled>
          {loading ? "Loading employees..." : "Select an employee..."}
        </MenuItem>

        {loading && (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading...
          </MenuItem>
        )}

        {!loading && employees.length === 0 && (
          <MenuItem disabled>No employees available</MenuItem>
        )}

        {!loading &&
          employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: "0.9rem",
                  }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {employee.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    {employee.email || employee.number}
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                  ₹{employee.monthly_salary}
                </div>
              </Box>
            </MenuItem>
          ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
