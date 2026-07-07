'use client';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { attendanceService, AttendanceRecord } from '@/lib/api/attendanceService';
import { Employee } from '@/models/employee.model';
import { showToastMessage } from '@/utils/toastUtil';
import SalaryView from '@/components/salary/SalaryView';

const STATUS_LABELS: Record<string, string> = {
  on_time: 'On Time',
  absent: 'Absent',
  late: 'Late',
  holiday: 'Holiday',
  half_day: 'Half Day',
  leave: 'Leave',
};

const STATUS_COLORS: Record<string, any> = {
  on_time: { bg: '#f0fdf6', text: '#15803d', border: '#6ddc98', dot: '#16a34a' },
  late: { bg: '#fff8eb', text: '#b45309', border: '#fcd34d', dot: '#f59e0b' },
  absent: { bg: '#fff5f5', text: '#ef4444', border: '#fecaca', dot: '#ef4444' },
  holiday: { bg: '#f3eeff', text: '#7c3aed', border: '#ddd6fe', dot: '#7c3aed' },
  half_day: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', dot: '#0ea5e9' },
  leave: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', dot: '#f97316' },
};

function StatCard({
  icon,
  label,
  value,
  color,
  pct,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  pct: number;
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
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
              fontSize: '1.55rem',
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

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: '#eeeff5',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 2,
          },
        }}
      />
    </Box>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? {
    bg: '#f8f9fc',
    text: '#6b7280',
    border: '#eeeff5',
    dot: '#9ca3af',
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.1,
        py: 0.4,
        borderRadius: '7px',
        bgcolor: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: c.dot,
        }}
      />

      <Typography
        sx={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: c.text,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {STATUS_LABELS[status] ?? status}
      </Typography>
    </Box>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getAvatarStyle(name: string) {
  const palette = [
    { bg: '#e8edff', color: '#3d52c7' },
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#d1fae5', color: '#065f46' },
    { bg: '#fff3cd', color: '#92400e' },
    { bg: '#ede9fe', color: '#6d28d9' },
    { bg: '#fee2e2', color: '#991b1b' },
    { bg: '#e0f2fe', color: '#0369a1' },
  ];

  const idx =
    name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    palette.length;

  return palette[idx];
}

export default function EmployeeAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs().startOf('week'));
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<
    Record<number, Record<string, AttendanceRecord>>
  >({});
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    employeeId: number;
  } | null>(null);
  const [status, setStatus] = useState<string>('on_time');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState({
    onTime: 0,
    late: 0,
    absent: 0,
    total: 0,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(
    new Set()
  );

  const fetchWeeklyAttendance = async () => {
    try {
      setLoading(true);

      const startDate = currentDate.format('YYYY-MM-DD');
      const endDate = currentDate.add(6, 'days').format('YYYY-MM-DD');

      const response = await attendanceService.getCompanyWeekView(
        startDate,
        endDate
      );

      if (response.success && response.data) {
        if (response.data.company_id) setCompanyId(response.data.company_id);

        const employeeList: Employee[] = (response.data.employees || []).map(
          (emp: any) =>
            ({
              id: emp.employee_id,
              name: emp.employee_name,
              email: emp.email,
              employee_type: emp.employee_type,
            }) as Employee
        );

        setEmployees(employeeList);

        const attendanceMap: Record<number, Record<string, AttendanceRecord>> =
          {};

        (response.data.employees || []).forEach((emp: any) => {
          const ea: Record<string, AttendanceRecord> = {};

          Object.entries(emp.daily_attendance || {}).forEach(
            ([d, day]: [string, any]) => {
              ea[d] = {
                id: day.id,
                employee_id: emp.employee_id,
                company_id: response.data.company_id,
                date: d,
                status: day.status,
                reason: day.reason || '',
                notes: day.notes || '',
                check_in_time: day.check_in_time || null,
                check_out_time: day.check_out_time || null,
                working_hours: day.working_hours || 0,
              };
            }
          );

          attendanceMap[emp.employee_id] = ea;
        });

        setAttendance(attendanceMap);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyAttendance();
  }, [currentDate]);

  useEffect(() => {
    let onTime = 0;
    let late = 0;
    let absent = 0;

    Object.values(attendance).forEach((ea) =>
      Object.values(ea).forEach((r) => {
        if (r.status === 'on_time') onTime++;
        else if (r.status === 'late') late++;
        else if (r.status === 'absent') absent++;
      })
    );

    const total = onTime + late + absent || 1;

    setStats({
      onTime: Math.round((onTime / total) * 100),
      late: Math.round((late / total) * 100),
      absent: Math.round((absent / total) * 100),
      total: onTime + late + absent,
    });
  }, [attendance]);

  const handleCellClick = (date: string, employeeId: number) => {
    setSelectedCell({ date, employeeId });

    const record = attendance[employeeId]?.[date];

    if (record) {
      setStatus(record.status);
      setReason(record.reason || '');
      setNotes(record.notes || '');
    } else {
      setStatus('on_time');
      setReason('');
      setNotes('');
    }

    setDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCell || !companyId) return;

    try {
      setLoading(true);

      const data: AttendanceRecord = {
        employee_id: selectedCell.employeeId,
        company_id: companyId,
        date: selectedCell.date,
        status: status as any,
        reason,
        notes,
        check_in_time:
          status === 'absent'
            ? null
            : dayjs(`${selectedCell.date}T09:00:00Z`).format(),
        check_out_time:
          status === 'absent'
            ? null
            : dayjs(`${selectedCell.date}T18:00:00Z`).format(),
        working_hours: status === 'absent' ? 0 : 9,
      };

      const existing = attendance[selectedCell.employeeId]?.[selectedCell.date];

      if (existing?.id) {
        await attendanceService.updateAttendance(existing.id, data);
        showToastMessage('Attendance updated', 'success');
      } else {
        await attendanceService.createAttendance(data);
        showToastMessage('Attendance marked', 'success');
      }

      setDialogOpen(false);
      fetchWeeklyAttendance();
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!selectedCell) return;

    try {
      const record = attendance[selectedCell.employeeId]?.[selectedCell.date];

      if (record?.id) {
        await attendanceService.deleteAttendance(record.id);
        showToastMessage('Attendance deleted', 'success');
        setDialogOpen(false);
        fetchWeeklyAttendance();
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to delete', 'error');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedEmployees(
      checked ? new Set(employees.map((e) => e.id)) : new Set()
    );
  };

  const handleSelectEmployee = (id: number, checked: boolean) => {
    const s = new Set(selectedEmployees);
    checked ? s.add(id) : s.delete(id);
    setSelectedEmployees(s);
    setSelectAll(s.size === employees.length);
  };

  const datesInWeek = Array.from({ length: 7 }, (_, i) =>
    currentDate.add(i, 'days')
  );

  const startStr = datesInWeek[0].format('D MMM');
  const endStr = datesInWeek[6].format('D MMM YYYY');
  const today = dayjs().format('YYYY-MM-DD');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f0f0f5',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <CalendarDays size={22} color="white" />
            </Box>

            <Box>
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
                Attendance
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Track team presence — {startStr} to {endStr}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" gap={1}>
            <Button
              size="small"
              onClick={() => setCurrentDate(currentDate.subtract(7, 'days'))}
              startIcon={<ChevronLeft size={15} />}
              sx={{
                border: '1px solid #eeeff5',
                borderRadius: '9px',
                color: '#6b7280',
                textTransform: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                '&:hover': { bgcolor: '#f8fbff', borderColor: '#c7d2fe' },
              }}
            >
              Prev
            </Button>

            <Button
              size="small"
              onClick={() => setCurrentDate(currentDate.add(7, 'days'))}
              endIcon={<ChevronRight size={15} />}
              sx={{
                border: '1px solid #eeeff5',
                borderRadius: '9px',
                color: '#6b7280',
                textTransform: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                '&:hover': { bgcolor: '#f8fbff', borderColor: '#c7d2fe' },
              }}
            >
              Next
            </Button>

            <Tooltip title="Settings" arrow>
              <Button
                size="small"
                sx={{
                  minWidth: 38,
                  border: '1px solid #eeeff5',
                  borderRadius: '9px',
                  color: '#6b7280',
                  '&:hover': { bgcolor: '#f8fbff', borderColor: '#c7d2fe' },
                }}
              >
                <Settings size={15} />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <StatCard
          icon={<Users size={22} />}
          label="Employees"
          value={String(employees.length)}
          color="#4f63d2"
          bg="#f0f4ff"
          pct={100}
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          label="On Time"
          value={`${stats.onTime}%`}
          color="#15803d"
          bg="#f0fdf6"
          pct={stats.onTime}
        />

        <StatCard
          icon={<Clock size={22} />}
          label="Late"
          value={`${stats.late}%`}
          color="#d97706"
          bg="#fffbeb"
          pct={stats.late}
        />

        <StatCard
          icon={<CalendarDays size={22} />}
          label="Absent"
          value={`${stats.absent}%`}
          color="#ef4444"
          bg="#fef2f2"
          pct={stats.absent}
        />
      </Box>

      {loading && (
        <LinearProgress
          sx={{
            mx: 3,
            mt: 2,
            borderRadius: 1,
            bgcolor: '#eeeff5',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#6366f1',
            },
          }}
        />
      )}

      {/* Table */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          mb: 3,
          borderRadius: '14px',
          border: '1px solid #eeeff5',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: 44,
                    bgcolor: '#f8fbff',
                    borderBottom: '1px solid #eeeff5',
                  }}
                >
                  <Checkbox
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                    sx={{
                      color: '#d1d5db',
                      '&.Mui-checked': { color: '#6366f1' },
                    }}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    width: 240,
                    bgcolor: '#f8fbff',
                    color: '#6b7280',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: "'DM Sans', sans-serif",
                    borderBottom: '1px solid #eeeff5',
                  }}
                >
                  Team Member
                </TableCell>

                {datesInWeek.map((date) => {
                  const isToday = date.format('YYYY-MM-DD') === today;

                  return (
                    <TableCell
                      key={date.format('YYYY-MM-DD')}
                      sx={{
                        minWidth: 95,
                        textAlign: 'center',
                        bgcolor: isToday ? '#f0f4ff' : '#f8fbff',
                        borderBottom: '1px solid #eeeff5',
                        borderLeft: '1px solid #eeeff5',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: isToday ? '#4f63d2' : '#9ca3af',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {date.format('ddd')}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: isToday ? '#4f63d2' : '#1a1d2e',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {date.date()}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {employees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      No employees found for this period
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {employees.map((employee) => {
                const style = getAvatarStyle(employee.name);

                return (
                  <TableRow
                    key={employee.id}
                    sx={{
                      '&:hover': { bgcolor: '#f8fbff' },
                      '& td': {
                        borderBottom: '1px solid #f5f5fa',
                        fontFamily: "'DM Sans', sans-serif",
                      },
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={(e) =>
                          handleSelectEmployee(employee.id, e.target.checked)
                        }
                        sx={{
                          color: '#d1d5db',
                          '&.Mui-checked': { color: '#6366f1' },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: style.bg,
                            color: style.color,
                            fontFamily: "'DM Sans', sans-serif",
                            border: '1.5px solid',
                            borderColor: style.color + '33',
                          }}
                        >
                          {getInitials(employee.name)}
                        </Avatar>

                        <Box minWidth={0}>
                          <Typography
                            sx={{
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color: '#1a1d2e',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.name}
                          </Typography>

                          {employee.email && (
                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                color: '#9ca3af',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {employee.email}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    {datesInWeek.map((date) => {
                      const dateStr = date.format('YYYY-MM-DD');
                      const record = attendance[employee.id]?.[dateStr];
                      const isToday = dateStr === today;
                      const c = record ? STATUS_COLORS[record.status] : null;

                      return (
                        <TableCell
                          key={dateStr}
                          onClick={() => handleCellClick(dateStr, employee.id)}
                          sx={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderLeft: '1px solid #f5f5fa',
                            bgcolor: isToday ? '#fbfdff' : 'transparent',
                            '&:hover': {
                              bgcolor: record ? c?.bg : '#f8fbff',
                              '& .cell-add': { opacity: 1 },
                            },
                          }}
                        >
                          {record ? (
                            <StatusBadge status={record.status} />
                          ) : (
                            <Box
                              className="cell-add"
                              sx={{
                                opacity: 0,
                                color: '#d1d5db',
                                fontSize: '1.2rem',
                                transition: 'opacity 0.15s',
                              }}
                            >
                              +
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Legend */}
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mx: 3, mb: 3 }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const c = STATUS_COLORS[key];

          return (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                px: 1.2,
                py: 0.45,
                borderRadius: '7px',
                bgcolor: c.bg,
                border: `1px solid ${c.border}`,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: c.dot,
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: c.text,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e8eaf0',
            boxShadow: '0 20px 60px rgba(79,99,210,0.15)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
            borderRadius: '16px 16px 0 0',
          }}
        />

        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Mark Attendance
          {selectedCell && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: 500,
                mt: 0.5,
              }}
            >
              {dayjs(selectedCell.date).format('dddd, D MMMM YYYY')}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#6b7280',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  mb: 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Status
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1,
                }}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const c = STATUS_COLORS[key];
                  const selected = status === key;

                  return (
                    <Box
                      key={key}
                      onClick={() => setStatus(key)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        bgcolor: selected ? c.bg : '#f8f9fc',
                        border: `1px solid ${selected ? c.border : '#eeeff5'}`,
                        '&:hover': {
                          borderColor: c.border,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: c.dot,
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: selected ? 800 : 600,
                          color: selected ? c.text : '#6b7280',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <TextField
              label="Reason"
              size="small"
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Traffic..."
              sx={dialogInputSx}
            />

            <TextField
              label="Notes"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              sx={dialogInputSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleDeleteAttendance}
            size="small"
            startIcon={<Trash2 size={13} />}
            sx={{
              mr: 'auto',
              color: '#ef4444',
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              '&:hover': { bgcolor: '#fef2f2' },
            }}
          >
            Delete
          </Button>

          <Button
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{
              color: '#6b7280',
              border: '1px solid #eeeff5',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              '&:hover': { bgcolor: '#f8fbff' },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveAttendance}
            size="small"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              px: 2.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mx: 3, mb: 3 }}>
        <SalaryView />
      </Box>
    </Box>
  );
}

const dialogInputSx = {
  '& .MuiInputBase-root': {
    bgcolor: '#f8f9fc',
    color: '#1a1d2e',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#eeeff5',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#c7d2fe',
  },
  '& .MuiInputLabel-root': {
    color: '#9ca3af',
    fontSize: '0.8rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6366f1',
  },
};