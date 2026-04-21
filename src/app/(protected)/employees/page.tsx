"use client";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Employee, EmployeeCreateRequest, EmployeeListResponse } from "@/models/employee.model";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import {
  Briefcase,
  CalendarDays,
  Download,
  Eye,
  Hash,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { employeeService } from "@/lib/api/employeeService";

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#e8edff", color: "#3d52c7" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fff3cd", color: "#92400e" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#fef9c3", color: "#854d0e" },
];

function getAvatarStyle(name: string) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ── Validation ─────────────────────────────────────────────────────────────────

const validateForm = (v: any): Record<string, string> => {
  const e: Record<string, string> = {};
  if (!v.name?.trim()) e.name = "Name is required";
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email address";
  if (!v.number?.trim()) e.number = "Phone number is required";
  else if (v.number.length < 10) e.number = "Must be at least 10 digits";
  if (!v.address?.trim()) e.address = "Address is required";
  if (!v.monthly_salary) e.monthly_salary = "Monthly salary is required";
  else if (parseFloat(v.monthly_salary) <= 0) e.monthly_salary = "Salary must be greater than 0";
  if (!v.employee_type) e.employee_type = "Employment type is required";
  return e;
};

// ── Detail row used in View dialog ────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value, mono = false }: {
  icon: any; label: string; value: string; mono?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "8px",
          bgcolor: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mt: 0.1,
        }}
      >
        <Icon size={14} color="#4f63d2" />
      </Box>
      <Box>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", mb: 0.25 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#1a1d2e", fontFamily: mono ? "'DM Mono', monospace" : "'DM Sans', sans-serif", fontWeight: 500 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Form field wrapper ─────────────────────────────────────────────────────────

function FormField({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "absolute", left: 11, top: 13, zIndex: 1, color: "#9ca3af", pointerEvents: "none" }}>
        <Icon size={15} />
      </Box>
      <Box sx={{ "& input, & textarea": { paddingLeft: "34px !important" } }}>
        {children}
      </Box>
    </Box>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<any>({
    name: "",
    email: "",
    number: "",
    address: "",
    employee_type: "full-time",
    monthly_salary: "",
    document_file: null,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response: EmployeeListResponse = await employeeService.getEmployees(page + 1, rowsPerPage);
      if (response.success) {
        setEmployees(response.data || []);
        setTotalCount(response.meta?.total || 0);
      } else {
        showToastMessage("Failed to fetch employees", "error");
      }
    } catch (err: any) {
      showToastMessage(err.message || "Failed to fetch employees", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev: { search: string }) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleDeleteEmployee = useCallback(async (id: string | number) => {
    try {
      await employeeService.deleteEmployee(id);
      showToastMessage("Employee deleted successfully", "success");
      fetchEmployees();
      setOpen(false);
    } catch (err: any) {
      showToastMessage(err.message || "Failed to delete employee", "error");
    }
  }, [fetchEmployees]);

  const handleViewDocument = (documentUrl: string) => {
    if (!documentUrl) {
      showToastMessage("No document available", "info");
      return;
    }
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    if (!editingId && !formValues.document_file) {
      setFormErrors({ document_file: "Document is required for new employees" });
      return;
    }
    setFormErrors({});
    try {
      let savedEmployee: Employee | null = null;
      if (editingId) {
        const updateData: any = {
          name: formValues.name,
          email: formValues.email,
          number: formValues.number,
          address: formValues.address,
          employee_type: formValues.employee_type,
          monthly_salary: parseFloat(formValues.monthly_salary),
        };
        if (formValues.document_file) {
          const base64 = await employeeService.convertFileToBase64(formValues.document_file);
          updateData.document_base64 = base64;
          updateData.document_name = formValues.document_file.name;
        }
        const response = await employeeService.updateEmployee(editingId, updateData);
        if (response.success && response.data) {
          savedEmployee = response.data;
        }
        showToastMessage("Employee updated successfully", "success");
      } else {
        // Create FormData with all fields and document file
        const formData = new FormData();
        formData.append("name", formValues.name);
        if (formValues.email) formData.append("email", formValues.email);
        formData.append("number", formValues.number);
        formData.append("address", formValues.address);
        formData.append("employee_type", formValues.employee_type);
        formData.append("monthly_salary", formValues.monthly_salary);
        if (formValues.document_file) {
          formData.append("document", formValues.document_file);
        }
        
        const response = await employeeService.createEmployeeWithFile(formData);
        if (response.success && response.data) {
          savedEmployee = response.data;
        }
        showToastMessage("Employee created successfully", "success");
      }
      closeCreateDialog();
      
      // Refetch employees list
      await fetchEmployees();
      
      // If we have the saved employee data, update selectedEmployee and show view dialog
      if (savedEmployee) {
        setSelectedEmployee(savedEmployee);
        setTimeout(() => {
          setOpenViewDialog(true);
        }, 300);
      }
    } catch (err: any) {
      showToastMessage(err.message || "Failed to save employee", "error");
    }
  };

  const closeCreateDialog = () => {
    setOpenCreateDialog(false);
    setEditingId(null);
    setSelectedEmployee(null);
    setFormValues({
      name: "",
      email: "",
      number: "",
      address: "",
      employee_type: "full-time",
      monthly_salary: "",
      document_file: null,
    });
    setFormErrors({});
  };

  const handleEditClick = (emp: Employee) => {
    setEditingId(emp.id);
    setSelectedEmployee(emp);
    setFormValues({
      name: emp.name,
      email: emp.email || "",
      number: emp.number,
      address: emp.address,
      employee_type: emp.employee_type || "full-time",
      monthly_salary: emp.monthly_salary?.toString() || "",
      document_file: null,
    });
    setFormErrors({});
    setOpenCreateDialog(true);
  };

  const handleViewClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setOpenViewDialog(true);
  };

  const setField = (name: string, value: string) => {
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev: Record<string, string>) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.number.includes(debouncedSearch)
  );

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: ITableColumn<Employee>[] = [
    {
      key: "name" as keyof Employee,
      label: "Employee",
      render: (row) => {
        const style = getAvatarStyle(row.name);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem", fontWeight: 700, bgcolor: style.bg, color: style.color, fontFamily: "'DM Sans', sans-serif", border: "1.5px solid", borderColor: style.color + "33" }}>
              {getInitials(row.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                <HighlightedCell value={row.name} search={filters.search} />
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", fontFamily: "'DM Mono', monospace", letterSpacing: "0.02em" }}>
                #{String(row.id || "").padStart(5, "0")}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: "email" as keyof Employee,
      label: "Email",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.email ? (
            <><Mail size={13} color="#9ca3af" /><Typography sx={{ fontSize: "0.8rem", color: "#4f63d2", fontFamily: "'DM Sans', sans-serif" }}><HighlightedCell value={row.email} search={filters.search} /></Typography></>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "number" as keyof Employee,
      label: "Phone",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Phone size={13} color="#9ca3af" />
          <Typography sx={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "#374151", letterSpacing: "0.02em" }}>
            <HighlightedCell value={row.number} search={filters.search} />
          </Typography>
        </Box>
      ),
    },
    {
      key: "address" as keyof Employee,
      label: "Address",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.address ? (
            <><MapPin size={13} color="#9ca3af" /><Typography sx={{ fontSize: "0.8rem", color: "#374151", fontFamily: "'DM Sans', sans-serif", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><HighlightedCell value={row.address} search={filters.search} /></Typography></>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "employee_type" as keyof Employee,
      label: "Type",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={row.employee_type?.charAt(0).toUpperCase() + row.employee_type?.slice(1) || "—"}
            size="small"
            sx={{
              fontSize: "0.7rem",
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: row.employee_type === "full-time" ? "#dbeafe" : "#fef3c7",
              color: row.employee_type === "full-time" ? "#0369a1" : "#92400e",
              border: row.employee_type === "full-time" ? "1px solid #bae6fd" : "1px solid #fcd34d",
              fontWeight: 600,
            }}
          />
        </Box>
      ),
    },
    {
      key: "monthly_salary" as keyof Employee,
      label: "Salary",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "#065f46", fontWeight: 700, letterSpacing: "0.01em" }}>
          {row.monthly_salary ? `₹${row.monthly_salary.toLocaleString()}` : "—"}
        </Typography>
      ),
    },
    {
      key: "created_at" as keyof Employee,
      label: "Joined",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "#6b7280", letterSpacing: "0.01em" }}>
          {dayjs(row.created_at).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      key: "action" as any,
      label: "",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.15s ease", ".MuiTableRow-root:hover &": { opacity: 1 } }}>
          <Tooltip title="View details" arrow>
            <IconButton size="small" onClick={() => handleViewClick(row)} sx={{ width: 30, height: 30, borderRadius: "8px", color: "#0369a1", bgcolor: "#e0f2fe", "&:hover": { bgcolor: "#bae6fd", transform: "scale(1.05)" }, transition: "all 0.15s ease" }}>
              <Eye size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View document" arrow>
            <IconButton size="small" onClick={() => handleViewDocument(row.document_url || "")} sx={{ width: 30, height: 30, borderRadius: "8px", color: row.document_url ? "#059669" : "#d1d5db", bgcolor: row.document_url ? "#d1fae5" : "#f3f4f6", "&:hover": { bgcolor: row.document_url ? "#a7f3d0" : "#f3f4f6", transform: row.document_url ? "scale(1.05)" : "none" }, transition: "all 0.15s ease", cursor: row.document_url ? "pointer" : "not-allowed" }}>
              <Download size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit employee" arrow>
            <IconButton size="small" onClick={() => handleEditClick(row)} sx={{ width: 30, height: 30, borderRadius: "8px", color: "#4f63d2", bgcolor: "#f0f4ff", "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.05)" }, transition: "all 0.15s ease" }}>
              <PencilLine size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete employee" arrow>
            <IconButton size="small" onClick={() => { setSelectedId(row.id || ""); setOpen(true); }} sx={{ width: 30, height: 30, borderRadius: "8px", color: "#ef4444", bgcolor: "#fef2f2", "&:hover": { bgcolor: "#fee2e2", transform: "scale(1.05)" }, transition: "all 0.15s ease" }}>
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8f9fc" }}>
      <BBLoader enabled={loading} />

      {/* ── Page header ────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, bgcolor: "#ffffff", borderBottom: "1px solid #f0f0f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: "13px", background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(79,99,210,0.3)", flexShrink: 0 }}>
              <Briefcase size={22} color="white" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                Employees
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                {totalCount} employee{totalCount !== 1 ? "s" : ""} in your team
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            onClick={() => { setEditingId(null); setSelectedEmployee(null); setFormValues({ name: "", email: "", number: "", address: "" }); setFormErrors({}); setOpenCreateDialog(true); }}
            startIcon={<Plus size={16} />}
            sx={{ px: 2.5, py: 1.1, borderRadius: "11px", background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)", boxShadow: "0 4px 14px rgba(79,99,210,0.35)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.875rem", textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)", boxShadow: "0 6px 20px rgba(79,99,210,0.45)", transform: "translateY(-1px)" }, transition: "all 0.2s ease" }}
          >
            Add Employee
          </BBButton>
        </Stack>
      </Box>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <Box component={Paper} elevation={0} sx={{ mx: 3, mt: 2.5, borderRadius: "14px 14px 0 0", border: "1px solid #eeeff5", borderBottom: "none", bgcolor: "#ffffff", px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 380 }}>
          <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <Search size={15} />
          </Box>
          <BBInputBase label="" name="search" value={filters.search} onChange={(e) => handleTypeChange("search", e.target.value)} placeholder="Search by name, email, or phone…" sx={{ pl: 4.5 }} />
        </Box>
        {filters.search && (
          <Chip label={`${filteredEmployees.length} result${filteredEmployees.length !== 1 ? "s" : ""}`} size="small" sx={{ fontSize: "0.75rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", bgcolor: "#f0f4ff", color: "#4f63d2", border: "1px solid #c7d2fe", borderRadius: "8px" }} />
        )}
      </Box>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Box sx={{ mx: 3, mb: 3, borderRadius: "0 0 14px 14px", border: "1px solid #eeeff5", borderTop: "none", bgcolor: "#ffffff", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
        <BBTable
          data={filteredEmployees}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
          sx={{
            "& .MuiTableHead-root .MuiTableCell-root": { bgcolor: "#fafbff", color: "#6b7280", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid #eeeff5", py: 1.5 },
            "& .MuiTableBody-root .MuiTableRow-root": { cursor: "pointer", transition: "background 0.12s ease", "&:hover": { bgcolor: "#fafbff" } },
            "& .MuiTableBody-root .MuiTableCell-root": { borderBottom: "1px solid #f5f5fa", py: 1.5, fontFamily: "'DM Sans', sans-serif" },
          }}
        />
      </Box>

      {/* ── Create / Edit dialog ────────────────────────────────────────── */}
      <BBDialog
        open={openCreateDialog}
        onClose={closeCreateDialog}
        title={editingId ? "Edit Employee" : "Add New Employee"}
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            {/* Dialog header strip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, pb: 2, borderBottom: "1px solid #f0f0f5" }}>
              <Avatar
                sx={{ width: 44, height: 44, fontSize: "0.8rem", fontWeight: 700, bgcolor: editingId && selectedEmployee ? getAvatarStyle(selectedEmployee.name).bg : "#f0f4ff", color: editingId && selectedEmployee ? getAvatarStyle(selectedEmployee.name).color : "#4f63d2", border: "1.5px solid", borderColor: editingId && selectedEmployee ? getAvatarStyle(selectedEmployee.name).color + "33" : "#c7d2fe", fontFamily: "'DM Sans', sans-serif" }}
              >
                {editingId && selectedEmployee ? getInitials(selectedEmployee.name) : <UserRound size={18} />}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif" }}>
                  {editingId && selectedEmployee ? selectedEmployee.name : "New Employee"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                  {editingId ? "Update employee information" : "Fill in the details below"}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2}>
              <BBInputBase label="Full Name *" name="name" value={formValues.name}
                onInputChange={(e, name, value) => setField(name, String(value))}
                isError={!!formErrors.name} errorMessage={formErrors.name}
                placeholder="Enter full name" />
              <BBInputBase label="Email Address" name="email" type="email" value={formValues.email}
                onInputChange={(e, name, value) => setField(name, String(value))}
                isError={!!formErrors.email} errorMessage={formErrors.email}
                placeholder="Enter email address" />
              <BBInputBase label="Phone Number *" name="number" value={formValues.number}
                onInputChange={(e, name, value) => setField(name, String(value))}
                isError={!!formErrors.number} errorMessage={formErrors.number}
                placeholder="Enter phone number" />
              <BBInputBase label="Address *" name="address" value={formValues.address}
                onInputChange={(e, name, value) => setField(name, String(value))}
                isError={!!formErrors.address} errorMessage={formErrors.address}
                placeholder="Enter address" rows={3} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#1a1d2e", mb: 0.5, display: "block" }}>
                  Employment Type *
                </Typography>
                <select
                  value={formValues.employee_type || "full-time"}
                  onChange={(e) => {
                    setFormValues((prev: any) => ({ ...prev, employee_type: e.target.value }));
                    if (formErrors.employee_type) {
                      setFormErrors((prev: Record<string, string>) => { const n = { ...prev }; delete n.employee_type; return n; });
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
                {formErrors.employee_type && (
                  <Typography variant="caption" sx={{ color: "#dc2626", display: "block", mt: 0.5 }}>
                    {formErrors.employee_type}
                  </Typography>
                )}
              </Box>
              <BBInputBase label="Monthly Salary *" name="monthly_salary" type="number" value={formValues.monthly_salary}
                onInputChange={(e, name, value) => setField(name, String(value))}
                isError={!!formErrors.monthly_salary} errorMessage={formErrors.monthly_salary}
                placeholder="Enter monthly salary" inputProps={{ step: "0.01", min: "0" }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#1a1d2e", mb: 0.5, display: "block" }}>
                  Upload Document {!editingId ? "*" : ""}
                </Typography>
                <input
                  type="file"
                  id="doc-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    setField("document_file", e.target.files?.[0]?.name || "");
                    setFormValues((prev: any) => ({ ...prev, document_file: e.target.files?.[0] || null }));
                  }}
                  style={{ display: "none" }}
                />
                <label htmlFor="doc-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    fullWidth
                    sx={{
                      textAlign: "left",
                      py: 1,
                      backgroundColor: formValues.document_file ? "#f0f4ff" : "transparent",
                      borderColor: formErrors.document_file ? "#dc2626" : formValues.document_file ? "#4f63d2" : "#d1d5db",
                      color: formValues.document_file ? "#4f63d2" : "#6b7280",
                      fontFamily: "'DM Sans', sans-serif",
                      textTransform: "none",
                    }}
                  >
                    {formValues.document_file ? `✓ ${formValues.document_file.name}` : "+  Choose Document (PDF, DOC, JPG, PNG)"}
                  </Button>
                </label>
                {formErrors.document_file && (
                  <Typography variant="caption" sx={{ color: "#dc2626", display: "block", mt: 0.5 }}>
                    {formErrors.document_file}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mt: 0.5 }}>
                  {!editingId ? "Required for new employees. Max 5MB" : "Optional - leave empty to keep current"}
                </Typography>
              </Box>
            </Stack>
          </Box>
        }
        onConfirm={handleSave}
        confirmText={editingId ? "Save Changes" : "Create Employee"}
        cancelText="Cancel"
        confirmColor="primary"
      />

      {/* ── View dialog ─────────────────────────────────────────────────── */}
      <BBDialog
        open={openViewDialog}
        onClose={() => { setOpenViewDialog(false); setSelectedEmployee(null); }}
        title="Employee Details"
        maxWidth="sm"
        content={
          selectedEmployee && (
            <Box sx={{ pt: 1 }}>
              {/* Profile header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "#fafbff", border: "1px solid #c7d2fe", borderRadius: "12px", mb: 2.5 }}>
                <Avatar
                  sx={{ width: 52, height: 52, fontSize: "1rem", fontWeight: 800, bgcolor: getAvatarStyle(selectedEmployee.name).bg, color: getAvatarStyle(selectedEmployee.name).color, fontFamily: "'DM Sans', sans-serif", border: "2px solid", borderColor: getAvatarStyle(selectedEmployee.name).color + "33" }}
                >
                  {getInitials(selectedEmployee.name)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.2px" }}>
                    {selectedEmployee.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", fontFamily: "'DM Mono', monospace", mt: 0.25 }}>
                    EMP #{String(selectedEmployee.id).padStart(5, "0")}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#f5f5fa", mb: 1 }} />

              <DetailRow icon={Hash} label="Employee ID" value={`#${String(selectedEmployee.id).padStart(5, "0")}`} mono />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={Mail} label="Email Address" value={selectedEmployee.email || "Not provided"} />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={Phone} label="Phone Number" value={selectedEmployee.number} mono />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={MapPin} label="Address" value={selectedEmployee.address} />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={Briefcase} label="Employment Type" value={selectedEmployee.employee_type?.charAt(0).toUpperCase() + selectedEmployee.employee_type?.slice(1) || "Not specified"} />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={Hash} label="Monthly Salary" value={`₹${selectedEmployee.monthly_salary?.toLocaleString() || "Not specified"}`} mono />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={CalendarDays} label="Joined" value={dayjs(selectedEmployee.created_at).format("DD MMM YYYY, HH:mm")} mono />
              <Divider sx={{ borderColor: "#f5f5fa" }} />
              <DetailRow icon={CalendarDays} label="Last Updated" value={dayjs(selectedEmployee.updated_at).format("DD MMM YYYY, HH:mm")} mono />
            </Box>
          )
        }
        HideCancelButton={false}
        cancelText="Close"
      />

      {/* ── Delete dialog ───────────────────────────────────────────────── */}
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Employee"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2, bgcolor: "#fff5f5", border: "1px solid #fee2e2", borderRadius: "10px", mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.25 }}>
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#991b1b", fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
                  This action cannot be undone
                </Typography>
                <Typography sx={{ fontSize: "0.8125rem", color: "#b91c1c", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                  All data associated with this employee — including payroll records and activity history — will be permanently removed.
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              Are you sure you want to permanently delete this employee?
            </Typography>
          </Box>
        }
        onConfirm={() => selectedId && handleDeleteEmployee(selectedId)}
        confirmText="Delete Employee"
        cancelText="Keep Employee"
        confirmColor="error"
      />
    </Box>
  );
}