"use client";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  Chip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Settings, Trash2, Clock, CalendarDays, TrendingUp, Users } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { employeeService } from "@/lib/api/employeeService";
import { attendanceService, AttendanceRecord } from "@/lib/api/attendanceService";
import { Employee } from "@/models/employee.model";
import { showToastMessage } from "@/utils/toastUtil";

/* ─── Design tokens ──────────────────────────────────────────── */
const COLORS = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFD",
  border: "#E3E8F0",
  borderHover: "#C5CDE0",
  accent: "#5B52F0",
  accentGlow: "rgba(91,82,240,0.08)",
  text: "#1A1D2E",
  textMuted: "#7B8299",
  textFaint: "#C5CDE0",

  on_time: { bg: "rgba(16,185,129,0.09)",  text: "#059669", border: "rgba(16,185,129,0.28)", dot: "#10B981" },
  late:    { bg: "rgba(245,158,11,0.10)",  text: "#B45309", border: "rgba(245,158,11,0.30)", dot: "#F59E0B" },
  absent:  { bg: "rgba(239,68,68,0.09)",   text: "#DC2626", border: "rgba(239,68,68,0.28)",  dot: "#EF4444" },
  holiday: { bg: "rgba(139,92,246,0.09)",  text: "#7C3AED", border: "rgba(139,92,246,0.28)", dot: "#8B5CF6" },
  half_day:{ bg: "rgba(14,165,233,0.09)",  text: "#0369A1", border: "rgba(14,165,233,0.28)", dot: "#0EA5E9" },
  leave:   { bg: "rgba(249,115,22,0.09)",  text: "#C2410C", border: "rgba(249,115,22,0.28)", dot: "#F97316" },
};

const STATUS_LABELS: Record<string, string> = {
  on_time: "On Time", absent: "Absent", late: "Late",
  holiday: "Holiday", half_day: "Half Day", leave: "Leave",
};

/* ─── Shared sx helpers ──────────────────────────────────────── */
const glassCard = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "14px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
};

const monoFont = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" };

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, color, pct }: {
  icon: React.ReactNode; label: string; value: string; color: string; pct: number;
}) {
  return (
    <Box sx={{
      ...glassCard, p: 2.5, display: "flex", flexDirection: "column", gap: 1.5,
      position: "relative", overflow: "hidden",
      "&:hover": { borderColor: COLORS.borderHover, transform: "translateY(-2px)", transition: "all 0.2s" },
      transition: "all 0.2s",
    }}>
      <Box sx={{
        position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        borderRadius: "0 14px 0 0",
      }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box sx={{ color, opacity: 0.9 }}>{icon}</Box>
        <Typography sx={{ fontSize: "0.75rem", color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, color: COLORS.text, ...monoFont, lineHeight: 1 }}>
        {value}
      </Typography>
      <Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 4, borderRadius: 2,
            bgcolor: COLORS.border,
            "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 },
          }}
        />
        <Typography sx={{ fontSize: "0.7rem", color: COLORS.textMuted, mt: 0.5, ...monoFont }}>
          {pct}% of total
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const c = (COLORS as any)[status] ?? { bg: COLORS.surfaceAlt, text: COLORS.textMuted, border: COLORS.border, dot: COLORS.textMuted };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.6,
      px: 1.2, py: 0.35, borderRadius: "6px",
      background: c.bg, border: `1px solid ${c.border}`,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: c.text, letterSpacing: "0.04em" }}>
        {STATUS_LABELS[status] ?? status}
      </Typography>
    </Box>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function EmployeeAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs().startOf("week"));
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<Record<number, Record<string, AttendanceRecord>>>({});
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ date: string; employeeId: number } | null>(null);
  const [status, setStatus] = useState<string>("on_time");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState({ onTime: 0, late: 0, absent: 0, total: 0 });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());

  const fetchWeeklyAttendance = async () => {
    try {
      setLoading(true);
      const startDate = currentDate.format("YYYY-MM-DD");
      const endDate = currentDate.add(6, "days").format("YYYY-MM-DD");
      const response = await attendanceService.getCompanyWeekView(startDate, endDate);

      if (response.success && response.data) {
        if (response.data.company_id) setCompanyId(response.data.company_id);

        const employeeList: Employee[] = (response.data.employees || []).map((emp: any) => ({
          id: emp.employee_id, name: emp.employee_name,
          email: emp.email, employee_type: emp.employee_type,
        })) as Employee[];

        setEmployees(employeeList);

        const attendanceMap: Record<number, Record<string, AttendanceRecord>> = {};
        (response.data.employees || []).forEach((emp: any) => {
          const ea: Record<string, AttendanceRecord> = {};
          Object.entries(emp.daily_attendance || {}).forEach(([d, day]: [string, any]) => {
            ea[d] = {
              id: day.id, employee_id: emp.employee_id, company_id: response.data.company_id,
              date: d, status: day.status, reason: day.reason || "", notes: day.notes || "",
              check_in_time: day.check_in_time || null, check_out_time: day.check_out_time || null,
              working_hours: day.working_hours || 0,
            };
          });
          attendanceMap[emp.employee_id] = ea;
        });
        setAttendance(attendanceMap);
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeeklyAttendance(); }, [currentDate]);

  useEffect(() => {
    let onTime = 0, late = 0, absent = 0;
    Object.values(attendance).forEach(ea => Object.values(ea).forEach(r => {
      if (r.status === "on_time") onTime++;
      else if (r.status === "late") late++;
      else if (r.status === "absent") absent++;
    }));
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
    if (record) { setStatus(record.status); setReason(record.reason || ""); setNotes(record.notes || ""); }
    else { setStatus("on_time"); setReason(""); setNotes(""); }
    setDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCell || !companyId) return;
    try {
      setLoading(true);
      const data: AttendanceRecord = {
        employee_id: selectedCell.employeeId, company_id: companyId, date: selectedCell.date,
        status: status as any, reason, notes,
        check_in_time: status === "absent" ? null : dayjs(`${selectedCell.date}T09:00:00Z`).format(),
        check_out_time: status === "absent" ? null : dayjs(`${selectedCell.date}T18:00:00Z`).format(),
        working_hours: status === "absent" ? 0 : 9,
      };
      const existing = attendance[selectedCell.employeeId]?.[selectedCell.date];
      if (existing?.id) {
        await attendanceService.updateAttendance(existing.id, data);
        showToastMessage("Attendance updated", "success");
      } else {
        await attendanceService.createAttendance(data);
        showToastMessage("Attendance marked", "success");
      }
      setDialogOpen(false);
      fetchWeeklyAttendance();
    } catch (error: any) {
      showToastMessage(error.message || "Failed to save", "error");
    } finally { setLoading(false); }
  };

  const handleDeleteAttendance = async () => {
    if (!selectedCell) return;
    try {
      const record = attendance[selectedCell.employeeId]?.[selectedCell.date];
      if (record?.id) {
        await attendanceService.deleteAttendance(record.id);
        showToastMessage("Attendance deleted", "success");
        setDialogOpen(false);
        fetchWeeklyAttendance();
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to delete", "error");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedEmployees(checked ? new Set(employees.map(e => e.id)) : new Set());
  };

  const handleSelectEmployee = (id: number, checked: boolean) => {
    const s = new Set(selectedEmployees);
    checked ? s.add(id) : s.delete(id);
    setSelectedEmployees(s);
    setSelectAll(s.size === employees.length);
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColor = (name: string) => {
    const palette = ["#6C63FF","#34D399","#FBBF24","#F87171","#38BDF8","#A78BFA","#FB923C"];
    return palette[name.charCodeAt(0) % palette.length];
  };

  const datesInWeek = Array.from({ length: 7 }, (_, i) => currentDate.add(i, "days"));
  const startStr = datesInWeek[0].format("D MMM");
  const endStr = datesInWeek[6].format("D MMM YYYY");
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <Box sx={{
      minHeight: "100vh", bgcolor: COLORS.bg, p: { xs: 2, md: 3 },
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      color: COLORS.text,
    }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: `linear-gradient(135deg, ${COLORS.accent}, #9C63FF)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CalendarDays size={18} color="#fff" />
              </Box>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>
                Attendance
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: "0.82rem", color: COLORS.textMuted, ml: "50px" }}>
              Track & manage team presence — {startStr} to {endStr}
            </Typography>
          </Box>

          <Stack direction="row" gap={1}>
            <Button
              size="small"
              onClick={() => setCurrentDate(currentDate.subtract(7, "days"))}
              startIcon={<ChevronLeft size={15} />}
              sx={{
                color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
                borderRadius: "8px", textTransform: "none", fontSize: "0.8rem",
                "&:hover": { borderColor: COLORS.borderHover, color: COLORS.text, bgcolor: COLORS.surfaceAlt },
              }}
            >
              Prev
            </Button>
            <Button
              size="small"
              onClick={() => setCurrentDate(currentDate.add(7, "days"))}
              endIcon={<ChevronRight size={15} />}
              sx={{
                color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
                borderRadius: "8px", textTransform: "none", fontSize: "0.8rem",
                "&:hover": { borderColor: COLORS.borderHover, color: COLORS.text, bgcolor: COLORS.surfaceAlt },
              }}
            >
              Next
            </Button>
            <Tooltip title="Settings">
              <Button
                size="small"
                sx={{
                  minWidth: 36, p: 1, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  "&:hover": { borderColor: COLORS.borderHover, color: COLORS.text, bgcolor: COLORS.surfaceAlt },
                }}
              >
                <Settings size={15} />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2, mb: 3,
      }}>
        <StatCard icon={<Users size={16} />} label="Employees" value={String(employees.length)} color={COLORS.accent} pct={100} />
        <StatCard icon={<TrendingUp size={16} />} label="On Time" value={`${stats.onTime}%`} color={COLORS.on_time.dot} pct={stats.onTime} />
        <StatCard icon={<Clock size={16} />} label="Late" value={`${stats.late}%`} color={COLORS.late.dot} pct={stats.late} />
        <StatCard icon={<CalendarDays size={16} />} label="Absent" value={`${stats.absent}%`} color={COLORS.absent.dot} pct={stats.absent} />
      </Box>

      {/* ── Table ───────────────────────────────────────────── */}
      {loading && (
        <LinearProgress sx={{
          mb: 1, borderRadius: 1, bgcolor: COLORS.border,
          "& .MuiLinearProgress-bar": { bgcolor: COLORS.accent },
        }} />
      )}

      <Box sx={{ ...glassCard, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.surfaceAlt }}>
                {/* Checkbox */}
                <TableCell sx={{ width: 44, p: "10px 8px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <Checkbox
                    checked={selectAll}
                    onChange={e => handleSelectAll(e.target.checked)}
                    size="small"
                    sx={{ color: COLORS.textFaint, "&.Mui-checked": { color: COLORS.accent }, p: 0 }}
                  />
                </TableCell>

                {/* Employee column */}
                <TableCell sx={{
                  width: 220, p: "12px 16px", borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: "0.7rem", fontWeight: 700, color: COLORS.textMuted,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  Team Member
                </TableCell>

                {/* Day columns */}
                {datesInWeek.map(date => {
                  const isToday = date.format("YYYY-MM-DD") === today;
                  return (
                    <TableCell
                      key={date.format("YYYY-MM-DD")}
                      sx={{
                        p: "10px 6px", textAlign: "center",
                        borderBottom: `1px solid ${COLORS.border}`,
                        borderLeft: `1px solid ${COLORS.border}`,
                        minWidth: 88,
                        background: isToday ? `linear-gradient(180deg, ${COLORS.accentGlow}, transparent)` : "transparent",
                      }}
                    >
                      <Typography sx={{
                        fontSize: "0.65rem", fontWeight: 700,
                        color: isToday ? COLORS.accent : COLORS.textMuted,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                      }}>
                        {date.format("ddd")}
                      </Typography>
                      <Typography sx={{
                        fontSize: "1rem", fontWeight: 800, ...monoFont,
                        color: isToday ? COLORS.accent : COLORS.text,
                        lineHeight: 1.1,
                      }}>
                        {date.date()}
                      </Typography>
                      {isToday && (
                        <Box sx={{
                          width: 4, height: 4, borderRadius: "50%", bgcolor: COLORS.accent,
                          mx: "auto", mt: 0.3,
                        }} />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {employees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 8, borderBottom: "none" }}>
                    <Typography sx={{ color: COLORS.textMuted, fontSize: "0.85rem" }}>
                      No employees found for this period
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {employees.map((employee, idx) => (
                <TableRow
                  key={employee.id}
                  sx={{
                    bgcolor: idx % 2 === 0 ? COLORS.surface : COLORS.surfaceAlt,
                    "&:hover": { bgcolor: COLORS.surfaceAlt },
                    transition: "background 0.15s",
                  }}
                >
                  {/* Checkbox */}
                  <TableCell sx={{ p: "10px 8px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <Checkbox
                      size="small"
                      checked={selectedEmployees.has(employee.id)}
                      onChange={e => handleSelectEmployee(employee.id, e.target.checked)}
                      sx={{ color: COLORS.textFaint, "&.Mui-checked": { color: COLORS.accent }, p: 0 }}
                    />
                  </TableCell>

                  {/* Employee info */}
                  <TableCell sx={{ p: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{
                        width: 32, height: 32, fontSize: "0.72rem", fontWeight: 700,
                        bgcolor: avatarColor(employee.name), flexShrink: 0,
                        border: `2px solid ${COLORS.border}`,
                      }}>
                        {getInitials(employee.name)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography sx={{
                          fontSize: "0.82rem", fontWeight: 600, color: COLORS.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {employee.name}
                        </Typography>
                        {employee.email && (
                          <Typography sx={{
                            fontSize: "0.68rem", color: COLORS.textMuted,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {employee.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Attendance cells */}
                  {datesInWeek.map(date => {
                    const dateStr = date.format("YYYY-MM-DD");
                    const record = attendance[employee.id]?.[dateStr];
                    const isToday = dateStr === today;
                    const c = record ? (COLORS as any)[record.status] : null;

                    return (
                      <TableCell
                        key={dateStr}
                        onClick={() => handleCellClick(dateStr, employee.id)}
                        sx={{
                          p: 1, textAlign: "center", cursor: "pointer",
                          borderBottom: `1px solid ${COLORS.border}`,
                          borderLeft: `1px solid ${COLORS.border}`,
                          background: isToday ? `${COLORS.accentGlow}` : "transparent",
                          transition: "all 0.15s",
                          "&:hover": {
                            background: record ? `${c?.bg}` : COLORS.surfaceAlt,
                            "& .cell-add": { opacity: 1 },
                          },
                          position: "relative",
                        }}
                      >
                        {record ? (
                          <Box sx={{
                            display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0.4,
                            px: 1, py: 0.5, borderRadius: "8px",
                            background: c.bg, border: `1px solid ${c.border}`,
                          }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.dot }} />
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: c.text, letterSpacing: "0.03em" }}>
                              {STATUS_LABELS[record.status]}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            className="cell-add"
                            sx={{
                              opacity: 0, transition: "opacity 0.15s",
                              color: COLORS.textFaint, fontSize: "1.2rem", lineHeight: 1,
                            }}
                          >
                            +
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Legend ──────────────────────────────────────────── */}
      <Stack direction="row" gap={1.5} flexWrap="wrap" mt={2}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const c = (COLORS as any)[key];
          return (
            <Box key={key} sx={{
              display: "flex", alignItems: "center", gap: 0.7,
              px: 1.2, py: 0.4, borderRadius: "6px",
              background: c.bg, border: `1px solid ${c.border}`,
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.dot }} />
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: c.text }}>{label}</Typography>
            </Box>
          );
        })}
      </Stack>

      {/* ── Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            ...glassCard,
            backgroundImage: "none",
            color: COLORS.text,
            bgcolor: COLORS.surface,
          },
        }}
      >
        <DialogTitle sx={{
          px: 3, pt: 3, pb: 1,
          fontSize: "1rem", fontWeight: 700, color: COLORS.text,
          borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "8px",
              background: `linear-gradient(135deg, ${COLORS.accent}, #9C63FF)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Clock size={14} color="#fff" />
            </Box>
            Mark Attendance
          </Stack>
          {selectedCell && (
            <Typography sx={{ fontSize: "0.72rem", color: COLORS.textMuted, fontWeight: 400, mt: 0.5 }}>
              {dayjs(selectedCell.date).format("dddd, D MMMM YYYY")}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Stack spacing={2.5}>
            {/* Status grid */}
            <Box>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", mb: 1.2 }}>
                Status
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const c = (COLORS as any)[key];
                  const selected = status === key;
                  return (
                    <Box
                      key={key}
                      onClick={() => setStatus(key)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        px: 1.5, py: 1, borderRadius: "8px", cursor: "pointer",
                        background: selected ? c.bg : COLORS.surfaceAlt,
                        border: `1px solid ${selected ? c.border : COLORS.border}`,
                        transition: "all 0.15s",
                        "&:hover": { border: `1px solid ${c.border}` },
                      }}
                    >
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0 }} />
                      <Typography sx={{
                        fontSize: "0.75rem", fontWeight: selected ? 700 : 500,
                        color: selected ? c.text : COLORS.textMuted,
                      }}>
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Reason */}
            <TextField
              label="Reason"
              size="small"
              fullWidth
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Traffic..."
              sx={dialogInputSx}
            />

            {/* Notes */}
            <TextField
              label="Notes"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes..."
              sx={dialogInputSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
          <Button
            onClick={handleDeleteAttendance}
            size="small"
            startIcon={<Trash2 size={13} />}
            sx={{
              mr: "auto", color: COLORS.absent.text, fontSize: "0.78rem", textTransform: "none",
              "&:hover": { bgcolor: COLORS.absent.bg },
            }}
          >
            Delete
          </Button>
          <Button
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{
              color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
              borderRadius: "8px", textTransform: "none", fontSize: "0.78rem",
              "&:hover": { borderColor: COLORS.borderHover, bgcolor: COLORS.surfaceAlt },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAttendance}
            size="small"
            disabled={loading}
            sx={{
              bgcolor: COLORS.accent, color: "#fff", borderRadius: "8px",
              textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
              px: 2.5,
              "&:hover": { bgcolor: "#5A52E8" },
              "&:disabled": { bgcolor: COLORS.border, color: COLORS.textMuted },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── Dialog input styles ──────────────────────────────────── */
const dialogInputSx = {
  "& .MuiInputBase-root": {
    bgcolor: COLORS.surfaceAlt,
    color: COLORS.text,
    borderRadius: "8px",
    fontSize: "0.82rem",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.borderHover },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.accent },
  "& .MuiInputLabel-root": { color: COLORS.textMuted, fontSize: "0.8rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.accent },
  "& .MuiInputBase-input::placeholder": { color: COLORS.textFaint, opacity: 1 },
};