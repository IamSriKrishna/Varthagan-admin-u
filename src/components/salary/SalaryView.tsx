'use client';

import React, { useState, useEffect } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Check,
  Clock,
  Eye,
  IndianRupee,
  Users,
  Zap,
  X,
} from 'lucide-react';
import { salaryService } from '@/lib/api/salaryService';
import { employeeService } from '@/lib/api/employeeService';
import { SalaryCalculationOutput } from '@/models/salary.model';
import { Employee } from '@/models/employee.model';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs, { Dayjs } from 'dayjs';

interface SalaryViewProps {
  companyId?: number;
}

const AVATAR_PALETTE = [
  { bg: '#e8edff', color: '#3d52c7' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fff3cd', color: '#92400e' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fee2e2', color: '#991b1b' },
  { bg: '#e0f2fe', color: '#0369a1' },
];

function getAvatarStyle(name: string) {
  const idx =
    name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_PALETTE.length;

  return AVATAR_PALETTE[idx];
}

function getInitials(name: string) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '??'
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #eeeff5',
        borderRadius: '14px',
        p: 2.5,
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}22`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 0.75,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1a1d2e',
              lineHeight: 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '13px',
            bgcolor: bg,
            color,
            border: `1px solid ${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

export default function SalaryView({ companyId }: SalaryViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Map<number, SalaryCalculationOutput>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedSalary, setSelectedSalary] =
    useState<SalaryCalculationOutput | null>(null);
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
      } catch {
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
        const payload = {
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
      `Calculated ${successCount} salaries${
        errorCount > 0 ? `, ${errorCount} errors` : ''
      }`,
      errorCount > 0 ? 'info' : 'success'
    );
  };

  const handleCalculateSalary = async (employeeId: number) => {
    setCalculatingIds((prev) => new Set(prev).add(employeeId));

    try {
      const payload = {
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
      setCalculatingIds((prev) => {
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
        const updatedSalary = selectedSalary
          ? { ...selectedSalary, status: 'approved' }
          : null;

        if (updatedSalary) {
          setSelectedSalary(updatedSalary as SalaryCalculationOutput);
          setSalaries(
            new Map(salaries).set(
              updatedSalary.employee_id,
              updatedSalary as SalaryCalculationOutput
            )
          );
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
    }).format(amount || 0);

  const totalNet = Array.from(salaries.values()).reduce(
    (s, v) => s + v.net_salary,
    0
  );
  const pendingCount = Array.from(salaries.values()).filter(
    (s) => s.status === 'pending'
  ).length;
  const approvedCount = Array.from(salaries.values()).filter(
    (s) => s.status === 'approved'
  ).length;

  const summaryCards = [
    {
      label: 'Employees',
      value: `${salaries.size}/${employees.length}`,
      icon: <Users size={22} />,
      color: '#4f63d2',
      bg: '#f0f4ff',
    },
    {
      label: 'Total Payout',
      value: salaries.size > 0 ? formatCurrency(totalNet) : '—',
      icon: <IndianRupee size={22} />,
      color: '#15803d',
      bg: '#f0fdf6',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: <Clock size={22} />,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: <Check size={22} />,
      color: '#0369a1',
      bg: '#e0f2fe',
    },
  ];

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
              flexShrink: 0,
            }}
          >
            <Banknote size={22} color="white" />
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#1a1d2e',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.4px',
                  lineHeight: 1.15,
                }}
              >
                Payroll
              </Typography>

              <Chip
                label={dayjs().format('MMM YYYY')}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: '#f0f4ff',
                  color: '#4f63d2',
                  border: '1px solid #c7d2fe',
                  borderRadius: '7px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </Stack>

            <Typography
              sx={{
                fontSize: '0.8rem',
                color: '#9ca3af',
                fontFamily: "'DM Sans', sans-serif",
                mt: 0.25,
              }}
            >
              Calculate and approve employee salaries based on attendance records
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </Box>

      {/* Controls */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #eeeff5',
          borderRadius: '14px',
          p: 2.5,
          mb: 2.5,
          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <CalendarDays size={16} color="#9ca3af" />

          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#6b7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Period
          </Typography>
        </Stack>

        <TextField
          label="From"
          type="date"
          size="small"
          value={fromDate.format('YYYY-MM-DD')}
          onChange={(e) => setFromDate(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={dateInputSx}
        />

        <Box sx={{ width: 20, height: 1, bgcolor: '#eeeff5' }} />

        <TextField
          label="To"
          type="date"
          size="small"
          value={toDate.format('YYYY-MM-DD')}
          onChange={(e) => setToDate(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
          sx={dateInputSx}
        />

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          startIcon={
            calculating ? (
              <CircularProgress size={14} sx={{ color: 'white' }} />
            ) : (
              <Zap size={16} />
            )
          }
          onClick={handleCalculateAllSalaries}
          disabled={calculating || employees.length === 0}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
              boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
              transform: 'translateY(-1px)',
            },
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
          mb: 2.5,
        }}
      >
        <AlertCircle
          size={16}
          color="#3b82f6"
          style={{ marginTop: 2, flexShrink: 0 }}
        />

        <Typography
          sx={{
            fontSize: '0.82rem',
            color: '#1e40af',
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Mark attendance first, then calculate salaries based on attendance
          records. Negative salary indicates deductions exceeded earnings due to
          absences.
        </Typography>
      </Box>

      {/* Table */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #eeeff5',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        {loading ? (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={32} sx={{ color: '#6366f1' }} />

            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Loading employees…
            </Typography>
          </Box>
        ) : (
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr">
                {[
                  'Employee',
                  'Type',
                  'Base Salary',
                  'Net Salary',
                  'Attendance',
                  'Status',
                  '',
                ].map((h) => (
                  <Box
                    component="th"
                    key={h}
                    sx={{
                      bgcolor: '#f8fbff',
                      color: '#6b7280',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: "'DM Sans', sans-serif",
                      borderBottom: '1px solid #eeeff5',
                      py: 1.5,
                      px: 2.5,
                      textAlign:
                        h === 'Base Salary' || h === 'Net Salary'
                          ? 'right'
                          : h === ''
                            ? 'center'
                            : 'left',
                    }}
                  >
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box component="tbody">
              {employees.length === 0 ? (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={7}
                    sx={{ py: 6, textAlign: 'center' }}
                  >
                    <Users size={32} color="#d1d5db" />
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        mt: 1,
                        fontSize: '0.875rem',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      No employees found
                    </Typography>
                  </Box>
                </Box>
              ) : (
                employees.map((employee) => {
                  const salary = salaries.get(employee.id);
                  const isCalc = calculatingIds.has(employee.id);
                  const attendancePct = salary
                    ? Math.round(
                        (salary.present_days /
                          Math.max(salary.total_working_days, 1)) *
                          100
                      )
                    : null;
                  const style = getAvatarStyle(employee.name);

                  return (
                    <Box
                      component="tr"
                      key={employee.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8fbff' },
                        '& td': {
                          borderBottom: '1px solid #f5f5fa',
                          py: 1.5,
                          px: 2.5,
                          fontFamily: "'DM Sans', sans-serif",
                        },
                      }}
                    >
                      <Box component="td">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: style.bg,
                              color: style.color,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: '1.5px solid',
                              borderColor: style.color + '33',
                            }}
                          >
                            {getInitials(employee.name)}
                          </Avatar>

                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                color: '#1a1d2e',
                              }}
                            >
                              {employee.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                color: '#9ca3af',
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              EMP-{String(employee.id).padStart(4, '0')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box component="td">
                        {salary ? (
                          <Chip
                            label={salary.salary_type === 'weekly' ? 'Weekly' : 'Monthly'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                              bgcolor:
                                salary.salary_type === 'weekly'
                                  ? '#e0f2fe'
                                  : '#f3eeff',
                              color:
                                salary.salary_type === 'weekly'
                                  ? '#0369a1'
                                  : '#7c3aed',
                              border:
                                salary.salary_type === 'weekly'
                                  ? '1px solid #bae6fd'
                                  : '1px solid #ddd6fe',
                              borderRadius: '6px',
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: '#d1d5db', fontSize: '0.8rem' }}>
                            —
                          </Typography>
                        )}
                      </Box>

                      <Box component="td" sx={{ textAlign: 'right' }}>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: salary ? '#6b7280' : '#d1d5db',
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {salary ? formatCurrency(salary.base_salary) : '—'}
                        </Typography>
                      </Box>

                      <Box component="td" sx={{ textAlign: 'right' }}>
                        {salary ? (
                          <Tooltip
                            title={
                              salary.net_salary < 0
                                ? `${salary.absent_days} absences: deductions (${formatCurrency(
                                    salary.deduction_amount
                                  )}) exceed earnings (${formatCurrency(
                                    salary.earning_amount
                                  )})`
                                : ''
                            }
                            arrow
                          >
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  color:
                                    salary.net_salary >= 0 ? '#059669' : '#ef4444',
                                  fontFamily: "'DM Mono', monospace",
                                }}
                              >
                                {formatCurrency(salary.net_salary)}
                              </Typography>

                              {salary.net_salary < 0 && (
                                <AlertCircle size={13} color="#ef4444" />
                              )}
                            </Box>
                          </Tooltip>
                        ) : (
                          <Typography sx={{ color: '#d1d5db' }}>—</Typography>
                        )}
                      </Box>

                      <Box component="td" sx={{ minWidth: 130 }}>
                        {attendancePct !== null ? (
                          <Box>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              mb={0.5}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.72rem',
                                  color: '#6b7280',
                                  fontWeight: 600,
                                }}
                              >
                                {salary!.present_days}/{salary!.total_working_days} days
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: attendancePct >= 75 ? '#059669' : '#d97706',
                                }}
                              >
                                {attendancePct}%
                              </Typography>
                            </Stack>

                            <LinearProgress
                              variant="determinate"
                              value={attendancePct}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: '#eeeff5',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  bgcolor:
                                    attendancePct >= 75 ? '#10b981' : '#f59e0b',
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography sx={{ color: '#d1d5db', fontSize: '0.8rem' }}>
                            —
                          </Typography>
                        )}
                      </Box>

                      <Box component="td">
                        {salary ? (
                          salary.status === 'approved' ? (
                            <Chip
                              icon={<Check size={12} />}
                              label="Approved"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                bgcolor: '#f0fdf6',
                                color: '#15803d',
                                border: '1px solid #6ddc98',
                                borderRadius: '6px',
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<Clock size={12} />}
                              label="Pending"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                bgcolor: '#fff8eb',
                                color: '#b45309',
                                border: '1px solid #fcd34d',
                                borderRadius: '6px',
                              }}
                            />
                          )
                        ) : (
                          <Typography
                            sx={{
                              color: '#d1d5db',
                              fontSize: '0.78rem',
                              fontStyle: 'italic',
                            }}
                          >
                            Not calculated
                          </Typography>
                        )}
                      </Box>

                      <Box component="td" sx={{ textAlign: 'right' }}>
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
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                textTransform: 'none',
                                px: 1.5,
                                py: 0.6,
                                bgcolor: '#f0f4ff',
                                color: '#4f63d2',
                                border: '1px solid #c7d2fe',
                                '&:hover': { bgcolor: '#e0e7ff' },
                              }}
                            >
                              {isCalc ? 'Calc…' : 'Calculate'}
                            </Button>
                          ) : (
                            <>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setDetailsOpen(true);
                                  }}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: '8px',
                                    color: '#4f63d2',
                                    bgcolor: '#f0f4ff',
                                    '&:hover': {
                                      bgcolor: '#e0e7ff',
                                      transform: 'scale(1.05)',
                                    },
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
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    textTransform: 'none',
                                    px: 1.5,
                                    py: 0.6,
                                    bgcolor: '#f0fdf6',
                                    color: '#059669',
                                    border: '1px solid #6ddc98',
                                    '&:hover': { bgcolor: '#dcfce7' },
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
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
            borderRadius: '16px',
            border: '1px solid #e8eaf0',
            boxShadow: '0 20px 60px rgba(79,99,210,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        {selectedSalary && (
          <>
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              }}
            />

            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
              <IconButton
                onClick={() => setDetailsOpen(false)}
                size="small"
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: '#9ca3af',
                  '&:hover': { bgcolor: '#f8f9fc', color: '#1a1d2e' },
                }}
              >
                <X size={16} />
              </IconButton>

              <Stack direction="row" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#f0f4ff',
                    color: '#4f63d2',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: '1.5px solid #c7d2fe',
                  }}
                >
                  {getInitials(selectedSalary.employee_name)}
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      color: '#1a1d2e',
                      fontWeight: 800,
                      fontSize: '1rem',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {selectedSalary.employee_name}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {selectedSalary.month}/{selectedSalary.year} ·{' '}
                    {selectedSalary.salary_type === 'weekly' ? 'Weekly' : 'Monthly'}{' '}
                    Salary
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  mt: 2.5,
                  bgcolor:
                    selectedSalary.net_salary >= 0 ? '#f0fdf6' : '#fff5f5',
                  border:
                    selectedSalary.net_salary >= 0
                      ? '1px solid #6ddc98'
                      : '1px solid #fecaca',
                  borderRadius: '12px',
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: selectedSalary.net_salary >= 0 ? '#15803d' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  Net Salary
                </Typography>

                <Typography
                  sx={{
                    color: selectedSalary.net_salary >= 0 ? '#059669' : '#ef4444',
                    fontWeight: 800,
                    fontSize: '1.55rem',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {formatCurrency(Math.abs(selectedSalary.net_salary))}
                </Typography>
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
                <Box sx={{ bgcolor: '#f0fdf6', borderRadius: '12px', p: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
                    Earnings
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#059669', fontFamily: "'DM Mono', monospace" }}>
                    {formatCurrency(selectedSalary.earning_amount)}
                  </Typography>
                </Box>

                <Box sx={{ bgcolor: '#fef2f2', borderRadius: '12px', p: 2 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
                    Deductions
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#dc2626', fontFamily: "'DM Mono', monospace" }}>
                    {formatCurrency(selectedSalary.deduction_amount)}
                  </Typography>
                </Box>
              </Box>

              {selectedSalary.deduction_amount > selectedSalary.earning_amount && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                  Deductions exceed earnings by{' '}
                  {formatCurrency(
                    selectedSalary.deduction_amount - selectedSalary.earning_amount
                  )}
                  .
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={() => setDetailsOpen(false)}
                sx={{
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  textTransform: 'none',
                  px: 2.5,
                  color: '#6b7280',
                }}
              >
                Close
              </Button>

              {selectedSalary.status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<Check size={15} strokeWidth={3} />}
                  onClick={() => {
                    handleApproveSalary(selectedSalary.id);
                    setDetailsOpen(false);
                  }}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: 'none',
                    px: 2.5,
                    bgcolor: '#16a34a',
                    '&:hover': { bgcolor: '#15803d' },
                    boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
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

const dateInputSx = {
  width: 160,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '0.8125rem',
    bgcolor: '#f8f9fc',
    fontFamily: "'DM Sans', sans-serif",
    '& fieldset': { borderColor: '#eeeff5' },
    '&:hover fieldset': { borderColor: '#c7d2fe' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'DM Sans', sans-serif",
    color: '#9ca3af',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6366f1',
  },
};