"use client";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Employee, EmployeeCreateRequest, EmployeeListResponse } from "@/models/employee.model";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Filter, PencilLine, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { employeeService } from "@/lib/api/employeeService";

const validateForm = (values: EmployeeCreateRequest) => {
  const errors: Record<string, string> = {};
  if (!values.name || values.name.trim() === "") {
    errors.name = "Name is required";
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email";
  }
  if (!values.number || values.number.trim() === "") {
    errors.number = "Phone number is required";
  } else if (values.number.length < 10) {
    errors.number = "Phone number must be at least 10 digits";
  }
  if (!values.address || values.address.trim() === "") {
    errors.address = "Address is required";
  }
  return errors;
};

export default function EmployeesPage() {
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState({ search: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<EmployeeCreateRequest>({
    name: "",
    email: "",
    number: "",
    address: "",
  });
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response: EmployeeListResponse = await employeeService.getEmployees(
        page + 1,
        rowsPerPage
      );
      
      if (response.success) {
        setEmployees(response.data || []);
        setTotalCount(response.pagination?.total || response.meta?.total || 0);
        setTotalPages(response.pagination?.total_pages || response.meta?.total_pages || 0);
      } else {
        showToastMessage("Failed to fetch employees", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch employees", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleDeleteEmployee = useCallback(async (id: string | number) => {
    try {
      await employeeService.deleteEmployee(id);
      showToastMessage("Employee deleted successfully", "success");
      fetchEmployees();
      setOpen(false);
    } catch (error: any) {
      showToastMessage(error.message || "Failed to delete employee", "error");
    }
  }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!selectedId) return;
    await handleDeleteEmployee(selectedId);
  };

  const handleCreateEmployee = async (values: EmployeeCreateRequest) => {
    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    
    try {
      if (editingId) {
        await employeeService.updateEmployee(editingId, values);
        showToastMessage("Employee updated successfully", "success");
      } else {
        await employeeService.createEmployee(values);
        showToastMessage("Employee created successfully", "success");
      }
      setOpenCreateDialog(false);
      setEditingId(null);
      setFormValues({ name: "", email: "", number: "", address: "" });
      fetchEmployees();
    } catch (error: any) {
      showToastMessage(error.message || "Failed to save employee", "error");
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    setSelectedEmployee(employee);
    setFormValues({
      name: employee.name,
      email: employee.email || "",
      number: employee.number,
      address: employee.address,
    });
    setFormErrors({});
    setOpenCreateDialog(true);
  };

  const handleViewClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenViewDialog(true);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.number.includes(debouncedSearch)
  );

  const columns: ITableColumn<Employee>[] = [
    {
      key: "id" as keyof Employee,
      label: "Employee ID",
      render: (row) => <HighlightedCell value={String(row.id || "")} search={filters.search} />,
    },
    {
      key: "name" as keyof Employee,
      label: "Name",
      render: (row) => <HighlightedCell value={row.name || ""} search={filters.search} />,
    },
    {
      key: "email" as keyof Employee,
      label: "Email",
      render: (row) => <HighlightedCell value={row.email || "Not provided"} search={filters.search} />,
    },
    {
      key: "number" as keyof Employee,
      label: "Phone",
      render: (row) => <HighlightedCell value={row.number || ""} search={filters.search} />,
    },
    {
      key: "address" as keyof Employee,
      label: "Address",
      render: (row) => <HighlightedCell value={row.address || "Not provided"} search={filters.search} />,
    },
    {
      key: "created_at" as keyof Employee,
      label: "Created",
      render: (row) => (
        <HighlightedCell value={dayjs(row.created_at).format("DD MMM YYYY")} search={filters.search} />
      ),
    },
    {
      key: "action" as any,
      label: "Action",
      render: (row) => (
        <>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleViewClick(row)}
            title="View"
          >
            <Eye size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditClick(row)}
            title="Edit"
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row.id || "");
              setOpen(true);
            }}
            title="Delete"
          >
            <Trash2 size={16} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
      <BBLoader enabled={loading} />

      <BBTitle
        title="Employees Management"
        rightContent={
          <BBButton variant="outlined" startIcon={<Filter size={18} />} onClick={() => setFilterOpen(!filteropen)}>
            {filteropen ? "Hide Filters" : "Show Filters"}
          </BBButton>
        }
      />

      <Box
        sx={{
          borderRadius: "10px 10px 0 0",
          boxShadow: "none",
        }}
        component={Paper}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ p: 2 }}
        >
          <Box>
            <BBInputBase
              label=""
              name="search"
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search by name, email, or phone"
            />
          </Box>
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingId(null);
              setSelectedEmployee(null);
              setOpenCreateDialog(true);
            }}
            startIcon={<Plus size={18} />}
          >
            Add New Employee
          </BBButton>
        </Stack>
      </Box>
      
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <BBTable
          data={filteredEmployees}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
        />
      </Box>
      
      {/* Create/Edit Employee Dialog */}
      <BBDialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setEditingId(null);
          setSelectedEmployee(null);
          setFormValues({ name: "", email: "", number: "", address: "" });
          setFormErrors({});
        }}
        title={editingId ? "Edit Employee" : "Create New Employee"}
        maxWidth="sm"
        content={
          <Stack spacing={2} sx={{ mt: 2 }}>
            <BBInputBase
              label="Name"
              name="name"
              value={formValues.name}
              onInputChange={(e, name, value) => {
                setFormValues((prev) => ({ ...prev, [name]: value }));
                if (formErrors[name]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                  });
                }
              }}
              isError={!!formErrors.name}
              errorMessage={formErrors.name}
              placeholder="Enter employee name"
            />
            <BBInputBase
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onInputChange={(e, name, value) => {
                setFormValues((prev) => ({ ...prev, [name]: value }));
                if (formErrors[name]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                  });
                }
              }}
              isError={!!formErrors.email}
              errorMessage={formErrors.email}
              placeholder="Enter email address"
            />
            <BBInputBase
              label="Phone Number"
              name="number"
              value={formValues.number}
              onInputChange={(e, name, value) => {
                setFormValues((prev) => ({ ...prev, [name]: value }));
                if (formErrors[name]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                  });
                }
              }}
              isError={!!formErrors.number}
              errorMessage={formErrors.number}
              placeholder="Enter phone number"
            />
            <BBInputBase
              label="Address"
              name="address"
              value={formValues.address}
              onInputChange={(e, name, value) => {
                setFormValues((prev) => ({ ...prev, [name]: value }));
                if (formErrors[name]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                  });
                }
              }}
              isError={!!formErrors.address}
              errorMessage={formErrors.address}
              placeholder="Enter address"
              rows={3}
            />
          </Stack>
        }
        onConfirm={() => handleCreateEmployee(formValues)}
        confirmText={editingId ? "Update" : "Create"}
        cancelText="Cancel"
      />

      {/* View Employee Dialog */}
      <BBDialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedEmployee(null);
        }}
        title="View Employee Details"
        maxWidth="sm"
        content={
          selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">ID</Typography>
                  <Typography variant="body2">{selectedEmployee.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Name</Typography>
                  <Typography variant="body2">{selectedEmployee.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  <Typography variant="body2">{selectedEmployee.email || "Not provided"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Phone</Typography>
                  <Typography variant="body2">{selectedEmployee.number}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Address</Typography>
                  <Typography variant="body2">{selectedEmployee.address}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Created At</Typography>
                  <Typography variant="body2">{dayjs(selectedEmployee.created_at).format("DD MMM YYYY HH:mm")}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Updated At</Typography>
                  <Typography variant="body2">{dayjs(selectedEmployee.updated_at).format("DD MMM YYYY HH:mm")}</Typography>
                </Box>
              </Stack>
            </Box>
          )
        }
        HideCancelButton={false}
        cancelText="Close"
      />

      {/* Delete Confirmation Dialog */}
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Employee"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete this employee?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this employee will be permanently removed.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}
