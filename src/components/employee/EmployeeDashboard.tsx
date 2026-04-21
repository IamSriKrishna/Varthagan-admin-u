import React, { useEffect, useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { EmployeeManager } from '@/components/employee/EmployeeManager';
import { EmployeeCard } from '@/components/employee/EmployeeCard';
import { useEmployeeManager } from '@/hooks/useEmployeeManager';
import { Employee } from '@/models/employee.model';

/**
 * Example Employee Dashboard Component
 * Demonstrates different ways to use the employee management system
 * 
 * Features:
 * - Table view (EmployeeManager component)
 * - Card grid view (EmployeeCard components with custom hook)
 * - Tab navigation between views
 * - Custom business logic
 */

interface EmployeeDashboardProps {
  companyId?: number;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ companyId = 8 }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const {
    employees,
    loading,
    error,
    currentPage,
    rowsPerPage,
    fetchEmployees,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeManager(1, 10);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees(1, 10);
  }, []);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    // You can open a modal or dialog here
    console.log('Edit employee:', employee);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_document`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <h1>Employee Management Dashboard</h1>
        <p>Manage employees, update salaries, and handle document uploads</p>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Table View" />
          <Tab label="Card View" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* TABLE VIEW */}
      {tabIndex === 0 && <EmployeeManager companyId={companyId} />}

      {/* CARD VIEW */}
      {tabIndex === 1 && (
        <Box>
          {error && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1, color: 'error.main' }}>
              {error}
            </Box>
          )}

          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <p>Loading employees...</p>
            </Box>
          ) : employees.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <p>No employees found</p>
            </Box>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}>
              {employees.map((employee) => (
                <Box key={employee.id}>
                  <EmployeeCard
                    employee={employee}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDownloadDocument={handleDownload}
                    variant="full"
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* STATISTICS VIEW */}
      {tabIndex === 2 && (
        <Box>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}>
            {/* Total Employees */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                  {employees.length}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Total Employees</Box>
              </Box>
            </Box>

            {/* Full-time Employees */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#e8f5e9',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                  {employees.filter((e) => e.employee_type === 'full-time').length}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Full-time</Box>
              </Box>
            </Box>

            {/* Part-time Employees */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#fff3e0',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                  {employees.filter((e) => e.employee_type === 'part-time').length}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Part-time</Box>
              </Box>
            </Box>

            {/* Total Salary */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#f3e5f5',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9c27b0' }}>
                  ₹
                  {(employees.reduce((sum, e) => sum + e.monthly_salary, 0) / 100000).toFixed(1)}
                  L
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Total Monthly Salary</Box>
              </Box>
            </Box>

            {/* Average Salary */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#fce4ec',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e91e63' }}>
                  ₹
                  {(
                    employees.reduce((sum, e) => sum + e.monthly_salary, 0) /
                    Math.max(employees.length, 1) /
                    1000
                  ).toFixed(0)}
                  K
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Avg Monthly Salary</Box>
              </Box>
            </Box>

            {/* Highest Salary */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#c8e6c9',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                  ₹{Math.max(0, ...employees.map((e) => e.monthly_salary)).toLocaleString()}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Highest Salary</Box>
              </Box>
            </Box>

            {/* Lowest Salary */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#ffccbc',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d84315' }}>
                  ₹{Math.min(...employees.map((e) => e.monthly_salary)).toLocaleString()}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Lowest Salary</Box>
              </Box>
            </Box>

            {/* Documents Uploaded */}
            <Box>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#b2dfdb',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#00796b' }}>
                  {employees.filter((e) => e.document_url).length}
                </Box>
                <Box sx={{ color: '#666', marginTop: 1 }}>Documents Uploaded</Box>
              </Box>
            </Box>
          </Box>

          {/* Detailed Statistics */}
          <Box sx={{ mt: 4 }}>
            <h3>Employee List Summary</h3>
            {employees.length === 0 ? (
              <p>No employees to display</p>
            ) : (
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th': { textAlign: 'left', padding: 1.5, borderBottom: '2px solid #ddd' },
                  '& td': { textAlign: 'left', padding: 1.5, borderBottom: '1px solid #ddd' },
                }}
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Document</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.employee_type}</td>
                      <td>₹{emp.monthly_salary.toLocaleString()}</td>
                      <td>{emp.document_url ? '✓ Yes' : '✗ No'}</td>
                      <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default EmployeeDashboard;
