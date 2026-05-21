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
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
} from '@mui/material';
import { Download, Eye, Check, Clock, TrendingUp, Users, IndianRupee, AlertCircle, X, CalendarDays, Banknote, ChevronRight, Zap } from 'lucide-react';
import { salaryService } from '@/lib/api/salaryService';
import { employeeService } from '@/lib/api/employeeService';
import { SalaryCalculationOutput, SalaryCalculationListOutput } from '@/models/salary.model';
import { Employee } from '@/models/employee.model';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs, { Dayjs } from 'dayjs';

interface SalaryViewProps {
  companyId?: number;
}

export default function SalaryView({ companyId }: SalaryViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Map<number, SalaryCalculationOutput>>(new Map());
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryCalculationOutput | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Dayjs>(dayjs().startOf('month'));
  const [toDate, setToDate] = useState<Dayjs>(dayjs().endOf('month'));
  const [calculatingIds, setCalculatingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeService.getEmployees(1, 100);
        if (response.success && response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        showToastMessage('Failed to fetch employees', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

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
        const payload: any = {
          employee_id: employee.id,
          from_date: fromDate.format('YYYY-MM-DD'),
          to_date: toDate.format('YYYY-MM-DD'),
        };
        const response = await salaryService.calculateSalary(payload);
        if (response.success && response.data) {
          newSalaries.set(employee.id, response.data);
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
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

  const handleCalculateSalary = async (employeeId: number) => {
    setCalculatingIds(prev => new Set(prev).add(employeeId));
    try {
      const payload: any = {
        employee_id: employeeId,
        from_date: fromDate.format('YYYY-MM-DD'),
        to_date: toDate.format('YYYY-MM-DD'),
      };
      const response = await salaryService.calculateSalary(payload);
      if (response.success && response.data) {
        setSalaries(new Map(salaries).set(employeeId, response.data));
        showToastMessage('Salary calculated successfully', 'success');
      } else {
        showToastMessage(response.message || 'Failed to calculate salary', 'error');
      }
    } catch {
      showToastMessage('Failed to calculate salary', 'error');
    } finally {
      setCalculatingIds(prev => {
        const next = new Set(prev);
        next.delete(employeeId);
        return next;
      });
    }
  };

  const handleApproveSalary = async (salaryId: number) => {
    try {
      const response = await salaryService.approveSalary(salaryId);
      if (response.success) {
        const updatedSalary = selectedSalary ? { ...selectedSalary, status: 'approved' } : null;
        if (updatedSalary) {
          setSelectedSalary(updatedSalary as SalaryCalculationOutput);
          setSalaries(new Map(salaries).set(updatedSalary.employee_id, updatedSalary as SalaryCalculationOutput));
        }
        showToastMessage('Salary approved successfully', 'success');
      } else {
        showToastMessage(response.message || 'Failed to approve salary', 'error');
      }
    } catch {
      showToastMessage('Failed to approve salary', 'error');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const avatarColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#10b981', '#06b6d4', '#3b82f6',
  ];
  const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

  const totalNet = Array.from(salaries.values()).reduce((s, v) => s + v.net_salary, 0);
  const pendingCount = Array.from(salaries.values()).filter(s => s.status === 'pending').length;
  const approvedCount = Array.from(salaries.values()).filter(s => s.status === 'approved').length;

  const summaryCards = [
    {
      label: 'Employees',
      value: `${salaries.size}/${employees.length}`,
      icon: <Users size={18} />,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'Total Payout',
      value: salaries.size > 0 ? formatCurrency(totalNet) : '—',
      icon: <IndianRupee size={18} />,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: <Clock size={18} />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: <Check size={18} />,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
  ];

  return (
    <Box sx={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Google Font Import via style tag approach */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}
          >
            <Banknote size={18} color="white" />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              fontSize: '1.5rem',
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Payroll
          </Typography>
          <Chip
            label={`${dayjs().format('MMM YYYY')}`}
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              border: '1px solid #e2e8f0',
            }}
          />
        </Box>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', ml: '52px' }}>
          Calculate and approve employee salaries based on attendance records
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 2,
          mb: 3,
        }}
      >
        {summaryCards.map((card) => (
          <Box
            key={card.label}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: '14px',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {card.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Controls */}
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #f1f5f9',
          borderRadius: '14px',
          p: 2.5,
          mb: 3,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
          <CalendarDays size={16} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Period</Typography>
        </Box>

        <TextField
          label="From"
          type="date"
          size="small"
          value={fromDate.format('YYYY-MM-DD')}
          onChange={(e) => setFromDate(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.85rem',
              bgcolor: '#f8fafc',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#6366f1' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
          }}
        />

        <Box sx={{ width: 20, height: 1, bgcolor: '#e2e8f0' }} />

        <TextField
          label="To"
          type="date"
          size="small"
          value={toDate.format('YYYY-MM-DD')}
          onChange={(e) => setToDate(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.85rem',
              bgcolor: '#f8fafc',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#6366f1' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
          }}
        />

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          startIcon={calculating ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <Zap size={16} />}
          onClick={handleCalculateAllSalaries}
          disabled={calculating || employees.length === 0}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            fontWeight: 600,
            fontSize: '0.85rem',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
            },
            '&.Mui-disabled': { opacity: 0.6, color: 'white' },
          }}
        >
          {calculating ? 'Calculating…' : 'Calculate All'}
        </Button>
      </Box>

      {/* Info Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          p: 2,
          mb: 3,
        }}
      >
        <AlertCircle size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.6 }}>
          Mark attendance first, then calculate salaries based on attendance records.
          Negative salary indicates deductions exceeded earnings due to absences.
        </Typography>
      </Box>

      {/* Table */}
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {loading ? (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={32} sx={{ color: '#6366f1' }} />
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading employees…</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Employee', 'Type', 'Base Salary', 'Net Salary', 'Attendance', 'Status', ''].map((h) => (
                  <TableCell
                    key={h}
                    align={['Base Salary', 'Net Salary'].includes(h) ? 'right' : h === '' ? 'center' : 'left'}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#94a3b8',
                      borderBottom: '1px solid #f1f5f9',
                      py: 1.75,
                      px: 2.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Users size={32} color="#e2e8f0" />
                    <Typography sx={{ color: '#94a3b8', mt: 1, fontSize: '0.875rem' }}>No employees found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee, idx) => {
                  const salary = salaries.get(employee.id);
                  const isCalc = calculatingIds.has(employee.id);
                  const attendancePct = salary
                    ? Math.round((salary.present_days / Math.max(salary.total_working_days, 1)) * 100)
                    : null;

                  return (
                    <TableRow
                      key={employee.id}
                      sx={{
                        borderBottom: idx === employees.length - 1 ? 'none' : '1px solid #f8fafc',
                        '&:hover': { bgcolor: '#fafbff' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Employee */}
                      <TableCell sx={{ px: 2.5, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: getAvatarColor(employee.id),
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(employee.name)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                              {employee.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              EMP-{String(employee.id).padStart(4, '0')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Type */}
                      <TableCell sx={{ px: 2.5 }}>
                        {salary ? (
                          <Chip
                            label={salary.salary_type === 'weekly' ? 'Weekly' : 'Monthly'}
                            size="small"
                            sx={{
                              bgcolor: salary.salary_type === 'weekly' ? '#eff6ff' : '#f5f3ff',
                              color: salary.salary_type === 'weekly' ? '#3b82f6' : '#7c3aed',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              border: 'none',
                              height: 22,
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Base Salary */}
                      <TableCell align="right" sx={{ px: 2.5 }}>
                        {salary ? (
                          <Typography sx={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                            {formatCurrency(salary.base_salary)}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: '#e2e8f0' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Net Salary */}
                      <TableCell align="right" sx={{ px: 2.5 }}>
                        {salary ? (
                          <Tooltip
                            title={
                              salary.net_salary < 0
                                ? `${salary.absent_days} absences: deductions (${formatCurrency(salary.deduction_amount)}) exceed earnings (${formatCurrency(salary.earning_amount)})`
                                : ''
                            }
                            arrow
                          >
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  color: salary.net_salary >= 0 ? '#059669' : '#dc2626',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {formatCurrency(salary.net_salary)}
                              </Typography>
                              {salary.net_salary < 0 && (
                                <AlertCircle size={13} color="#dc2626" />
                              )}
                            </Box>
                          </Tooltip>
                        ) : (
                          <Typography sx={{ color: '#e2e8f0' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Attendance */}
                      <TableCell sx={{ px: 2.5, minWidth: 120 }}>
                        {attendancePct !== null ? (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                                {salary!.present_days}/{salary!.total_working_days} days
                              </Typography>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: attendancePct >= 75 ? '#059669' : '#f59e0b' }}>
                                {attendancePct}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={attendancePct}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  bgcolor: attendancePct >= 75 ? '#10b981' : '#f59e0b',
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ px: 2.5 }}>
                        {salary ? (
                          salary.status === 'approved' ? (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', px: 1.25, py: 0.4 }}>
                              <Check size={11} color="#059669" strokeWidth={3} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>Approved</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '20px', px: 1.25, py: 0.4 }}>
                              <Clock size={11} color="#d97706" strokeWidth={2.5} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>Pending</Typography>
                            </Box>
                          )
                        ) : (
                          <Typography sx={{ color: '#cbd5e1', fontSize: '0.78rem', fontStyle: 'italic' }}>
                            Not calculated
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ px: 2, pr: 2.5 }}>
                        <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                          {!salary ? (
                            <Button
                              size="small"
                              onClick={() => handleCalculateSalary(employee.id)}
                              disabled={isCalc}
                              startIcon={isCalc ? <CircularProgress size={12} /> : undefined}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                px: 1.5,
                                py: 0.6,
                                bgcolor: '#f5f3ff',
                                color: '#6366f1',
                                border: '1px solid #e0e7ff',
                                '&:hover': { bgcolor: '#ede9fe', border: '1px solid #c7d2fe' },
                              }}
                            >
                              {isCalc ? 'Calc…' : 'Calculate'}
                            </Button>
                          ) : (
                            <>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => { setSelectedSalary(salary); setDetailsOpen(true); }}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#64748b',
                                    '&:hover': { bgcolor: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' },
                                  }}
                                >
                                  <Eye size={14} />
                                </IconButton>
                              </Tooltip>
                              {salary.status === 'pending' && (
                                <Button
                                  size="small"
                                  onClick={() => handleApproveSalary(salary.id)}
                                  startIcon={<Check size={13} strokeWidth={3} />}
                                  sx={{
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 1.5,
                                    py: 0.6,
                                    bgcolor: '#f0fdf4',
                                    color: '#059669',
                                    border: '1px solid #bbf7d0',
                                    '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac' },
                                  }}
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
        )}
      </Box>

      {/* Detail Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          },
        }}
      >
        {selectedSalary && (
          <>
            {/* Dialog Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                px: 3,
                pt: 3,
                pb: 2.5,
                position: 'relative',
              }}
            >
              <IconButton
                onClick={() => setDetailsOpen(false)}
                size="small"
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.15)' },
                }}
              >
                <X size={16} />
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {getInitials(selectedSalary.employee_name)}
                </Avatar>
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>
                    {selectedSalary.employee_name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                    {selectedSalary.month}/{selectedSalary.year} · {selectedSalary.salary_type === 'weekly' ? 'Weekly' : 'Monthly'} Salary
                  </Typography>
                </Box>
              </Box>

              {/* Net Salary Hero */}
              <Box
                sx={{
                  mt: 2.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
                    Net Salary
                  </Typography>
                  <Typography
                    sx={{
                      color: selectedSalary.net_salary >= 0 ? '#a7f3d0' : '#fca5a5',
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      fontFamily: '"Syne", sans-serif',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(Math.abs(selectedSalary.net_salary))}
                  </Typography>
                  {selectedSalary.net_salary < 0 && (
                    <Typography sx={{ color: '#fca5a5', fontSize: '0.72rem', mt: 0.25 }}>
                      Employee owes the company
                    </Typography>
                  )}
                </Box>
                {selectedSalary.status === 'approved' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(167,243,208,0.2)', border: '1px solid rgba(167,243,208,0.4)', borderRadius: '20px', px: 1.5, py: 0.6 }}>
                    <Check size={12} color="#a7f3d0" strokeWidth={3} />
                    <Typography sx={{ color: '#a7f3d0', fontSize: '0.75rem', fontWeight: 700 }}>Approved</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(253,230,138,0.2)', border: '1px solid rgba(253,230,138,0.4)', borderRadius: '20px', px: 1.5, py: 0.6 }}>
                    <Clock size={12} color="#fde68a" strokeWidth={2.5} />
                    <Typography sx={{ color: '#fde68a', fontSize: '0.75rem', fontWeight: 700 }}>Pending</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {/* Earning vs Deduction */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
                <Box sx={{ bgcolor: '#f0fdf4', borderRadius: '12px', p: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Earnings
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#059669' }}>
                    {formatCurrency(selectedSalary.earning_amount)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', mt: 0.25 }}>
                    {selectedSalary.present_days} present days
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#fef2f2', borderRadius: '12px', p: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Deductions
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#dc2626' }}>
                    {formatCurrency(selectedSalary.deduction_amount)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', mt: 0.25 }}>
                    {selectedSalary.absent_days} absent days
                  </Typography>
                </Box>
              </Box>

              {selectedSalary.deduction_amount > selectedSalary.earning_amount && (
                <Alert
                  severity="error"
                  sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem' }}
                >
                  Deductions exceed earnings by {formatCurrency(selectedSalary.deduction_amount - selectedSalary.earning_amount)}.
                </Alert>
              )}

              {/* Attendance Grid */}
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', mb: 1.5 }}>
                Attendance Breakdown
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
                {[
                  { label: 'Total Days', value: selectedSalary.total_working_days, color: '#64748b', bg: '#f8fafc' },
                  { label: 'Present', value: selectedSalary.present_days, color: '#059669', bg: '#f0fdf4' },
                  { label: 'Absent', value: selectedSalary.absent_days, color: '#dc2626', bg: '#fef2f2' },
                  { label: 'Half Day', value: selectedSalary.half_days, color: '#0284c7', bg: '#f0f9ff' },
                  { label: 'Holiday', value: selectedSalary.holiday_days, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Leave', value: selectedSalary.leave_days, color: '#7c3aed', bg: '#f5f3ff' },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      bgcolor: item.bg,
                      borderRadius: '10px',
                      p: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: item.color, lineHeight: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Calculation Details */}
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', mb: 1.5 }}>
                Calculation Details
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: '12px', p: 2 }}>
                {[
                  { label: 'Base Salary', value: formatCurrency(selectedSalary.base_salary) },
                  { label: 'Daily Rate', value: formatCurrency(selectedSalary.daily_rate) },
                ].map((row, i) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: i < 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>

              {selectedSalary.notes && (
                <Box sx={{ mt: 2, bgcolor: '#fafbff', border: '1px solid #e0e7ff', borderRadius: '10px', p: 1.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#6366f1' }}>{selectedSalary.notes}</Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={() => setDetailsOpen(false)}
                sx={{
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  color: '#64748b',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                Close
              </Button>
              {selectedSalary.status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<Check size={15} strokeWidth={3} />}
                  onClick={() => { handleApproveSalary(selectedSalary.id); setDetailsOpen(false); }}
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 2.5,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                    },
                  }}
                >
                  Approve Salary
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}