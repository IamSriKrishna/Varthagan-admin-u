'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Download, Eye, Check, Clock } from 'lucide-react';
import { salaryService } from '@/lib/api/salaryService';
import { employeeService } from '@/lib/api/employeeService';
import { SalaryCalculationOutput, SalaryCalculationListOutput } from '@/models/salary.model';
import { Employee } from '@/models/employee.model';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs from 'dayjs';

interface SalaryViewProps {
  companyId?: number;
  selectedMonth?: number;
  selectedYear?: number;
}

export default function SalaryView({
  companyId,
  selectedMonth = dayjs().month() + 1,
  selectedYear = dayjs().year(),
}: SalaryViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Map<number, SalaryCalculationOutput>>(new Map());
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryCalculationOutput | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [month, setMonth] = useState(selectedMonth);
  const [year, setYear] = useState(selectedYear);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getEmployees(1, 100);
        if (response.success && response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        showToastMessage('Failed to fetch employees', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Calculate salary for all employees
  const handleCalculateAllSalaries = async () => {
    if (employees.length === 0) {
      showToastMessage('No employees found', 'info');
      return;
    }

    setCalculating(true);
    const newSalaries = new Map(salaries);
    let successCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        const response = await salaryService.calculateSalary({
          employee_id: employee.id,
          month,
          year,
        });

        if (response.success && response.data) {
          newSalaries.set(employee.id, response.data);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setSalaries(newSalaries);
    setCalculating(false);
    showToastMessage(
      `Calculated ${successCount} salaries${errorCount > 0 ? `, ${errorCount} errors` : ''}`,
        errorCount > 0 ? 'info' : 'success'
    );
  };

  // Calculate salary for a single employee
  const handleCalculateSalary = async (employeeId: number) => {
    try {
      const response = await salaryService.calculateSalary({
        employee_id: employeeId,
        month,
        year,
      });

      if (response.success && response.data) {
        setSalaries(new Map(salaries).set(employeeId, response.data));
        showToastMessage('Salary calculated successfully', 'success');
      } else {
        showToastMessage(response.message || 'Failed to calculate salary', 'error');
      }
    } catch (error) {
      showToastMessage('Failed to calculate salary', 'error');
    }
  };

  // Approve salary
  const handleApproveSalary = async (salaryId: number) => {
    try {
      const response = await salaryService.approveSalary(salaryId);
      if (response.success) {
        // Update the salary status locally
        const updatedSalary = selectedSalary ? { ...selectedSalary, status: 'approved' } : null;
        if (updatedSalary) {
          setSelectedSalary(updatedSalary as SalaryCalculationOutput);
          setSalaries(new Map(salaries).set(updatedSalary.employee_id, updatedSalary as SalaryCalculationOutput));
        }
        showToastMessage('Salary approved successfully', 'success');
      } else {
        showToastMessage(response.message || 'Failed to approve salary', 'error');
      }
    } catch (error) {
      showToastMessage('Failed to approve salary', 'error');
    }
  };

  const getStatusChip = (status: string) => {
    if (status === 'approved') {
      return (
        <Chip
          icon={<Check size={16} />}
          label="Approved"
          color="success"
          variant="outlined"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<Clock size={16} />}
        label="Pending"
        color="warning"
        variant="outlined"
        size="small"
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            💰 Salary Calculation
          </Typography>

          {/* Month/Year Selection */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              label="Month"
              type="number"
              size="small"
              value={month}
              onChange={(e) => setMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 12 }}
              sx={{ width: 100 }}
            />
            <TextField
              label="Year"
              type="number"
              size="small"
              value={year}
              onChange={(e) => setYear(Math.max(2000, parseInt(e.target.value) || 2000))}
              inputProps={{ min: 2000 }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              onClick={handleCalculateAllSalaries}
              disabled={calculating || employees.length === 0}
            >
              {calculating ? <CircularProgress size={20} /> : 'Calculate All'}
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Mark attendance first, then calculate salaries based on attendance records. Negative salary indicates deductions exceeded earnings due to absences.
          </Alert>
        </Box>

        {/* Salary Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Salary Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Base Salary
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Net Salary
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No employees found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => {
                    const salary = salaries.get(employee.id);
                    return (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {employee.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: 'textSecondary' }}>
                              ID: {employee.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={salary?.salary_type === 'weekly' ? 'Weekly' : 'Monthly'}
                            size="small"
                            variant="outlined"
                            color={salary?.salary_type === 'weekly' ? 'info' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {salary ? (
                            formatCurrency(salary.base_salary)
                          ) : (
                            <Typography color="textSecondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {salary ? (
                            <Tooltip
                              title={
                                salary.net_salary < 0
                                  ? `Negative salary: ${salary.absent_days} absences caused deductions (${formatCurrency(salary.deduction_amount)}) to exceed earnings (${formatCurrency(salary.earning_amount)}). Check attendance records.`
                                  : ''
                              }
                              arrow
                              disableHoverListener={salary.net_salary >= 0}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: salary.net_salary > 0 ? '#2e7d32' : '#d32f2f',
                                  fontSize: '1rem',
                                  cursor: salary.net_salary < 0 ? 'help' : 'default',
                                }}
                              >
                                {formatCurrency(salary.net_salary)}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography color="textSecondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {salary ? (
                            getStatusChip(salary.status)
                          ) : (
                            <Typography color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                              Not Calculated
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {!salary ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleCalculateSalary(employee.id)}
                              >
                                Calculate
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<Eye size={16} />}
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  View
                                </Button>
                                {salary.status === 'pending' && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<Check size={16} />}
                                    onClick={() => handleApproveSalary(salary.id)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Summary Cards */}
        {salaries.size > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <Card sx={{ bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Employees Calculated
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {salaries.size} / {employees.length}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Net Salary
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  {formatCurrency(
                    Array.from(salaries.values()).reduce((sum, s) => sum + s.net_salary, 0)
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Approval
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#f57c00' }}>
                  {
                    Array.from(salaries.values()).filter((s) => s.status === 'pending')
                      .length
                  }
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  {Array.from(salaries.values()).filter((s) => s.status === 'approved').length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* Salary Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Salary Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSalary && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Employee Info */}
              <Box sx={{ pb: 2, borderBottom: '1px solid #eee' }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedSalary.employee_name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedSalary.month}/{selectedSalary.year}
                </Typography>
              </Box>

              {/* Salary Breakdown */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Salary Breakdown
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Base Salary ({selectedSalary.salary_type}):</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedSalary.base_salary)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Salary Type:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedSalary.salary_type === 'weekly' ? 'Weekly' : 'Monthly'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Attendance Summary */}
              <Box sx={{ pb: 2, borderTop: '1px solid #eee', pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Attendance Summary
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Working Days:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedSalary.total_working_days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.main">Present Days:</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                      {selectedSalary.present_days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="error.main">Absent Days:</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'error.main' }}>
                      {selectedSalary.absent_days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="info.main">Half Days:</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'info.main' }}>
                      {selectedSalary.half_days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="warning.main">Holiday Days:</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {selectedSalary.holiday_days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="secondary.main">Leave Days:</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'secondary.main' }}>
                      {selectedSalary.leave_days}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Calculation Details */}
              <Box sx={{ pb: 2, borderTop: '1px solid #eee', pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Calculation Details
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Daily Rate:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedSalary.daily_rate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography>Earning Amount:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedSalary.earning_amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                    <Typography>Deduction Amount:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedSalary.deduction_amount)}
                    </Typography>
                  </Box>
                  {selectedSalary.deduction_amount > selectedSalary.earning_amount && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Deductions exceed earnings by {formatCurrency(
                        selectedSalary.deduction_amount - selectedSalary.earning_amount
                      )} due to {selectedSalary.absent_days} absent days.
                    </Alert>
                  )}
                </Stack>
              </Box>

              {/* Final Salary */}
              {selectedSalary.net_salary < 0 ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    Salary Amount Due: {formatCurrency(Math.abs(selectedSalary.net_salary))}
                  </Typography>
                  <Typography variant="caption">
                    Employee owes the company due to excessive absences ({selectedSalary.absent_days} days). 
                    Deductions ({formatCurrency(selectedSalary.deduction_amount)}) exceed earnings ({formatCurrency(selectedSalary.earning_amount)}).
                  </Typography>
                </Alert>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#e8f5e9',
                    borderRadius: 1,
                    borderLeft: '4px solid #2e7d32',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Net Salary
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#2e7d32' }}>
                    {formatCurrency(selectedSalary.net_salary)}
                  </Typography>
                </Box>
              )}

              {/* Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Status:
                </Typography>
                {getStatusChip(selectedSalary.status)}
              </Box>

              {/* Notes */}
              {selectedSalary.notes && (
                <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
                  <Typography variant="caption" color="textSecondary">
                    {selectedSalary.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedSalary && selectedSalary.status === 'pending' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApproveSalary(selectedSalary.id);
                setDetailsOpen(false);
              }}
            >
              Approve Salary
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
