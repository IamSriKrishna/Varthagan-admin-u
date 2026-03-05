"use client";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Avatar,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Settings, Trash2, Edit2 } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { employeeService } from "@/lib/api/employeeService";
import { attendanceService, AttendanceRecord } from "@/lib/api/attendanceService";
import { Employee } from "@/models/employee.model";
import { showToastMessage } from "@/utils/toastUtil";

const statusColors: Record<string, { bg: string; text: string; borderColor: string }> = {
  on_time: { bg: "#E8F5E9", text: "#2E7D32", borderColor: "#4CAF50" },
  absent: { bg: "#FFEBEE", text: "#C62828", borderColor: "#F44336" },
  late: { bg: "#FFF3E0", text: "#E65100", borderColor: "#FF9800" },
  holiday: { bg: "#F3E5F5", text: "#6A1B9A", borderColor: "#9C27B0" },
  half_day: { bg: "#E0F2F1", text: "#00695C", borderColor: "#00BCD4" },
  leave: { bg: "#E3F2FD", text: "#1565C0", borderColor: "#2196F3" },
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    on_time: "On time",
    absent: "Absent",
    late: "Late",
    holiday: "Holiday",
    half_day: "Half day",
    leave: "Leave",
  };
  return labels[status] || status;
};

export default function EmployeeAttendancePage() {
  const theme = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekData, setWeekData] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs().startOf("week"));
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<Record<number, Record<string, AttendanceRecord>>>({});
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ date: string; employeeId: number } | null>(null);
  const [status, setStatus] = useState<string>("on_time");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState({ onTime: 0, late: 0, absent: 0 });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());

  // Fetch attendance data from week-view API
  const fetchWeeklyAttendance = async () => {
    try {
      setLoading(true);
      const startDate = currentDate.format("YYYY-MM-DD");
      const endDate = currentDate.add(6, "days").format("YYYY-MM-DD");

      const response = await attendanceService.getCompanyWeekView(startDate, endDate);

      if (response.success && response.data) {
        // Set company ID from response
        if (response.data.company_id) {
          setCompanyId(response.data.company_id);
        }

        // Extract employees from the week-view response
        const employeeList: Employee[] = (response.data.employees || []).map((emp: any) => ({
          id: emp.employee_id,
          name: emp.employee_name,
          email: emp.email,
          employee_type: emp.employee_type,
        })) as Employee[];

        setEmployees(employeeList);
        setWeekData(response.data);

        // Build attendance map from the daily_attendance data
        const attendanceMap: Record<number, Record<string, AttendanceRecord>> = {};

        (response.data.employees || []).forEach((emp: any) => {
          const empAttendance: Record<string, AttendanceRecord> = {};

          Object.entries(emp.daily_attendance || {}).forEach(([dateStr, dayData]: [string, any]) => {
            empAttendance[dateStr] = {
              id: dayData.id,
              employee_id: emp.employee_id,
              company_id: response.data.company_id,
              date: dateStr,
              status: dayData.status,
              reason: dayData.reason || "",
              notes: dayData.notes || "",
              check_in_time: dayData.check_in_time || null,
              check_out_time: dayData.check_out_time || null,
              working_hours: dayData.working_hours || 0,
            };
          });

          attendanceMap[emp.employee_id] = empAttendance;
        });

        setAttendance(attendanceMap);
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const calculateStats = () => {
    let onTime = 0,
      late = 0,
      absent = 0;

    Object.values(attendance).forEach((empAttendance) => {
      Object.values(empAttendance).forEach((record) => {
        if (record.status === "on_time") onTime++;
        else if (record.status === "late") late++;
        else if (record.status === "absent") absent++;
      });
    });

    const total = onTime + late + absent || 1;
    setStats({
      onTime: Math.round((onTime / total) * 100),
      late: Math.round((late / total) * 100),
      absent: Math.round((absent / total) * 100),
    });
  };

  useEffect(() => {
    fetchWeeklyAttendance();
  }, [currentDate]);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  // Handle cell click
  const handleCellClick = (date: string, employeeId: number) => {
    setSelectedCell({ date, employeeId });
    const record = attendance[employeeId]?.[date];
    if (record) {
      setStatus(record.status);
      setReason(record.reason || "");
      setNotes(record.notes || "");
    } else {
      setStatus("on_time");
      setReason("");
      setNotes("");
    }
    setDialogOpen(true);
  };

  // Handle save attendance
  const handleSaveAttendance = async () => {
    if (!selectedCell || !companyId) return;

    try {
      setLoading(true);
      const attendanceData: AttendanceRecord = {
        employee_id: selectedCell.employeeId,
        company_id: companyId,
        date: selectedCell.date,
        status: status as any,
        reason,
        notes,
        check_in_time: status === "absent" ? null : dayjs(`${selectedCell.date}T09:00:00Z`).format(),
        check_out_time: status === "absent" ? null : dayjs(`${selectedCell.date}T18:00:00Z`).format(),
        working_hours: status === "absent" ? 0 : 9,
      };

      const existingRecord = attendance[selectedCell.employeeId]?.[selectedCell.date];
      if (existingRecord?.id) {
        await attendanceService.updateAttendance(existingRecord.id, attendanceData);
        showToastMessage("Attendance updated successfully", "success");
      } else {
        await attendanceService.createAttendance(attendanceData);
        showToastMessage("Attendance marked successfully", "success");
      }

      setDialogOpen(false);
      fetchWeeklyAttendance();
    } catch (error: any) {
      showToastMessage(error.message || "Failed to save attendance", "error");
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
        showToastMessage("Attendance deleted successfully", "success");
        setDialogOpen(false);
        fetchWeeklyAttendance();
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to delete attendance", "error");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(new Set(employees.map((e) => e.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
    setSelectAll(newSelected.size === employees.length);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getDatesForWeek = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate.add(i, "days"));
    }
    return dates;
  };

  const datesInWeek = getDatesForWeek();
  const startDateStr = datesInWeek[0].format("D MMM");
  const endDateStr = datesInWeek[6].format("D MMM YYYY");
  const monthStr = datesInWeek[0].format("MMMM");

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, p: 2 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Attendance
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage and review records
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Date Range Button */}
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1,
                px: 2,
                borderRadius: 1,
              }}
            >
              📅 {startDateStr} - {endDateStr}
            </Button>

            {/* Month Dropdown */}
            <Button
              variant="text"
              sx={{
                textTransform: "none",
                color: theme.palette.text.secondary,
              }}
            >
              {monthStr}
              <ChevronRight size={16} />
            </Button>
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: statusColors.on_time.borderColor, borderRadius: "50%" }} />
              <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                On time {stats.onTime}%
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: statusColors.late.borderColor, borderRadius: "50%" }} />
              <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Late {stats.late}%
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: statusColors.absent.borderColor, borderRadius: "50%" }} />
              <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Absent {stats.absent}%
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ChevronLeft size={16} />}
              onClick={() => setCurrentDate(currentDate.subtract(7, "days"))}
            >
              Prev
            </Button>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ChevronRight size={16} />}
              onClick={() => setCurrentDate(currentDate.add(7, "days"))}
            >
              Next
            </Button>
            <Tooltip title="Settings">
              <Button variant="outlined" size="small" startIcon={<Settings size={16} />} />
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Attendance Table */}
      <Box sx={{ borderRadius: 2, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead sx={{ bgcolor: "#F5F5F5" }}>
              <TableRow>
                <TableCell sx={{ width: 50, p: 1, textAlign: "center" }}>
                  <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} size="small" />
                </TableCell>
                <TableCell sx={{ width: 200, p: 1, fontWeight: 600, fontSize: "0.85rem" }}>
                  Student Profile
                </TableCell>
                {datesInWeek.map((date) => (
                  <TableCell
                    key={date.format("YYYY-MM-DD")}
                    sx={{
                      width: 80,
                      p: 1,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      borderLeft: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {date.date()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {date.format("ddd")}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} sx={{ "&:hover": { bgcolor: "#F9F9F9" } }}>
                  <TableCell sx={{ p: 1, textAlign: "center" }}>
                    <Checkbox
                      size="small"
                      checked={selectedEmployees.has(employee.id)}
                      onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "#2196F3" }}>
                        {getInitials(employee.name)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {employee.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  {datesInWeek.map((date) => {
                    const dateStr = date.format("YYYY-MM-DD");
                    const record = attendance[employee.id]?.[dateStr];
                    const statusLabel = record ? getStatusLabel(record.status) : "—";
                    const color = record ? statusColors[record.status] : { bg: "transparent", text: "#999", borderColor: "#DDD" };

                    return (
                      <TableCell
                        key={dateStr}
                        onClick={() => handleCellClick(dateStr, employee.id)}
                        sx={{
                          p: 1,
                          textAlign: "center",
                          bgcolor: color.bg,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          border: record ? `2px solid ${color.borderColor}` : `1px solid ${theme.palette.divider}`,
                          "&:hover": {
                            boxShadow: theme.shadows[2],
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                          {record && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: color.borderColor,
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 500,
                              color: color.text,
                              fontSize: "0.75rem",
                            }}
                          >
                            {statusLabel}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Attendance Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {/* Status Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Status
              </Typography>
              <RadioGroup value={status} onChange={(e) => setStatus(e.target.value)}>
                <FormControlLabel value="on_time" control={<Radio size="small" />} label="On time" />
                <FormControlLabel value="absent" control={<Radio size="small" />} label="Absent" />
                <FormControlLabel value="late" control={<Radio size="small" />} label="Late" />
                <FormControlLabel value="holiday" control={<Radio size="small" />} label="Holiday" />
                <FormControlLabel value="half_day" control={<Radio size="small" />} label="Half day" />
                <FormControlLabel value="leave" control={<Radio size="small" />} label="Leave" />
              </RadioGroup>
            </Box>

            {/* Reason */}
            <TextField
              label="Reason"
              size="small"
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Traffic, etc."
            />

            {/* Notes */}
            <TextField
              label="Notes"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAttendance}
            color="error"
            startIcon={<Trash2 size={16} />}
            sx={{ mr: "auto" }}
          >
            Delete
          </Button>
          <Button onClick={handleSaveAttendance} variant="contained" disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
