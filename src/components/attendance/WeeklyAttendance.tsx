"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

// Type definitions
interface DailyAttendance {
  date: string;
  status: "on_time" | "absent" | "late" | "holiday" | "half_day" | "leave";
  reason?: string;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  notes?: string;
}

interface WeekStats {
  total: number;
  on_time: number;
  absent: number;
  late: number;
  holiday: number;
  half_day: number;
  leave: number;
}

interface Employee {
  employee_id: number;
  employee_name: string;
  email: string;
  employee_type: string;
  daily_attendance: Record<string, DailyAttendance>;
  week_stats: WeekStats;
}

interface CompanyStats {
  total_employees: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_holiday: number;
  total_half_day: number;
  total_leave: number;
}

interface WeeklyAttendanceData {
  company_id: number;
  start_date: string;
  end_date: string;
  date_range: string[];
  employees: Employee[];
  company_stats: CompanyStats;
}

interface WeeklyAttendanceProps {
  data: WeeklyAttendanceData;
}

// Status color mapping
const getStatusColor = (status: string) => {
  const colorMap: Record<string, { bg: string; text: string; label: string }> = {
    on_time: {
      bg: "#4CAF50",
      text: "#fff",
      label: "On Time",
    },
    absent: {
      bg: "#F44336",
      text: "#fff",
      label: "Absent",
    },
    late: {
      bg: "#FF9800",
      text: "#fff",
      label: "Late",
    },
    holiday: {
      bg: "#2196F3",
      text: "#fff",
      label: "Holiday",
    },
    half_day: {
      bg: "#9C27B0",
      text: "#fff",
      label: "Half Day",
    },
    leave: {
      bg: "#00BCD4",
      text: "#fff",
      label: "Leave",
    },
  };

  return colorMap[status] || { bg: "#9E9E9E", text: "#fff", label: "Unknown" };
};

const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]}`;
};

export default function WeeklyAttendance({ data }: WeeklyAttendanceProps) {
  if (!data || !data.employees) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No attendance data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Weekly Attendance Report
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatDate(data.start_date)} to {formatDate(data.end_date)}
        </Typography>
      </Box>

      {/* Company Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography color="textSecondary" gutterBottom>
              Total Employees
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.company_stats.total_employees}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography color="textSecondary" gutterBottom>
              Present
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#4CAF50" }}>
              {data.company_stats.total_present}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography color="textSecondary" gutterBottom>
              Absent
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#F44336" }}>
              {data.company_stats.total_absent}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography color="textSecondary" gutterBottom>
              Late
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#FF9800" }}>
              {data.company_stats.total_late}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Attendance Table */}
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  backgroundColor: "#f5f5f5",
                  minWidth: 200,
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                }}
              >
                Employee
              </TableCell>
              {data.date_range.map((date) => (
                <TableCell
                  key={date}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    minWidth: 120,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                      {getDayOfWeek(date)}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", fontSize: "12px" }}>
                      {formatDate(date)}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5", minWidth: 150 }}>
                Weekly Stats
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.employees.map((employee) => (
              <TableRow key={employee.employee_id} hover>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#fff",
                    zIndex: 9,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.employee_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {employee.email}
                    </Typography>
                  </Box>
                </TableCell>

                {data.date_range.map((date) => {
                  const dayAttendance = employee.daily_attendance[date];
                  const statusColor = dayAttendance ? getStatusColor(dayAttendance.status) : null;

                  return (
                    <TableCell key={`${employee.employee_id}-${date}`} sx={{ textAlign: "center" }}>
                      {dayAttendance ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Chip
                            label={getStatusColor(dayAttendance.status).label}
                            size="small"
                            sx={{
                              backgroundColor: statusColor?.bg,
                              color: statusColor?.text,
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          />
                          {dayAttendance.working_hours !== undefined && (
                            <Typography variant="caption" sx={{ fontSize: "10px" }}>
                              {dayAttendance.working_hours}h
                            </Typography>
                          )}
                          {dayAttendance.reason && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "10px",
                                color: "textSecondary",
                                fontStyle: "italic",
                                maxWidth: 100,
                              }}
                            >
                              {dayAttendance.reason}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}

                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {employee.week_stats.on_time > 0 && (
                        <Chip
                          label={`✓ ${employee.week_stats.on_time}`}
                          size="small"
                          sx={{
                            backgroundColor: "#4CAF5020",
                            color: "#4CAF50",
                            fontSize: "11px",
                          }}
                        />
                      )}
                      {employee.week_stats.absent > 0 && (
                        <Chip
                          label={`✗ ${employee.week_stats.absent}`}
                          size="small"
                          sx={{
                            backgroundColor: "#F4433620",
                            color: "#F44336",
                            fontSize: "11px",
                          }}
                        />
                      )}
                      {employee.week_stats.late > 0 && (
                        <Chip
                          label={`⧖ ${employee.week_stats.late}`}
                          size="small"
                          sx={{
                            backgroundColor: "#FF980020",
                            color: "#FF9800",
                            fontSize: "11px",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Status Legend
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {["on_time", "absent", "late", "holiday", "half_day", "leave"].map((status) => {
            const colors = getStatusColor(status);
            return (
              <Box key={status} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: colors.bg,
                    borderRadius: "2px",
                  }}
                />
                <Typography variant="caption">{colors.label}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
