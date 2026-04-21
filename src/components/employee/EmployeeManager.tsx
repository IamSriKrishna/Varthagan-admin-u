'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Typography,
} from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';
import { employeeService } from '@/lib/api/employeeService';
import { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from '@/models/employee.model';

interface EmployeeManagerProps {
  companyId?: number;
}

interface FormData {
  name: string;
  email: string;
  number: string;
  address: string;
  employee_type: 'full-time' | 'part-time';
  monthly_salary: string;
  document_file: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ companyId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    number: '',
    address: '',
    employee_type: 'full-time',
    monthly_salary: '',
    document_file: null,
  });

  // Fetch employees on mount and page change
  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.getEmployees(page + 1, rowsPerPage);
      if (response.success) {
        setEmployees(response.data);
        if (response.meta) {
          setTotalEmployees(response.meta.total);
        }
      } else {
        setError(response.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError(`Error fetching employees: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 1) {
      errors.name = 'Name must be at least 1 character';
    }

    if (!formData.number.trim()) {
      errors.number = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 1) {
      errors.address = 'Address must be at least 1 character';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (formData.employee_type !== 'full-time' && formData.employee_type !== 'part-time') {
      errors.employee_type = 'Employment type must be either part-time or full-time';
    }

    if (!formData.monthly_salary) {
      errors.monthly_salary = 'Monthly salary is required';
    } else {
      const salary = parseFloat(formData.monthly_salary);
      if (isNaN(salary)) {
        errors.monthly_salary = 'Invalid monthly salary format';
      } else if (salary <= 0) {
        errors.monthly_salary = 'Monthly salary must be greater than 0';
      }
    }

    if (!editingId && !formData.document_file) {
      errors.document_file = 'Document file is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email || '',
        number: employee.number,
        address: employee.address,
        employee_type: employee.employee_type,
        monthly_salary: employee.monthly_salary.toString(),
        document_file: null,
      });
    } else {
      setEditingId(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      number: '',
      address: '',
      employee_type: 'full-time',
      monthly_salary: '',
      document_file: null,
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const value = e.target.value as 'full-time' | 'part-time';
    setFormData((prev) => ({
      ...prev,
      employee_type: value,
    }));
    // Clear employee_type error if it exists
    if (formErrors.employee_type) {
      setFormErrors((prev) => ({
        ...prev,
        employee_type: '',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      document_file: file || null,
    }));
    if (file && formErrors.document_file) {
      setFormErrors((prev) => ({
        ...prev,
        document_file: '',
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        // Update existing employee - use JSON body
        const updateData: EmployeeUpdateRequest = {
          name: formData.name || undefined,
          email: formData.email || undefined,
          number: formData.number || undefined,
          address: formData.address || undefined,
          employee_type: formData.employee_type,
          monthly_salary: parseFloat(formData.monthly_salary),
        };

        const response = await employeeService.updateEmployee(editingId, updateData);
        if (response.success) {
          setSuccess('Employee updated successfully');
          handleCloseDialog();
          fetchEmployees();
        } else {
          setError(response.message || 'Failed to update employee');
        }
      } else {
        // Create new employee - use form-data with file
        if (!formData.document_file) {
          setError('Document file is required');
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email || '');
        formDataToSend.append('number', formData.number);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('employee_type', formData.employee_type);
        formDataToSend.append('monthly_salary', formData.monthly_salary);
        formDataToSend.append('document', formData.document_file);

        const response = await employeeService.createEmployeeWithFile(formDataToSend);
        if (response.success) {
          setSuccess('Employee created successfully');
          handleCloseDialog();
          fetchEmployees();
        } else {
          setError(response.message || 'Failed to create employee');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await employeeService.deleteEmployee(deleteTargetId);
      if (response.success) {
        setSuccess('Employee deleted successfully');
        setDeleteConfirmOpen(false);
        setDeleteTargetId(null);
        fetchEmployees();
      } else {
        setError(response.message || 'Failed to delete employee');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h2>Employee Management</h2>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Salary</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.number}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.employee_type}
                      size="small"
                      color={employee.employee_type === 'full-time' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">₹{employee.monthly_salary.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(employee)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(employee.id)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalEmployees}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pb: 1 }}>
          {editingId ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name || 'Min 1 character'}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                error={!!formErrors.number}
                helperText={formErrors.number}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address || 'Min 1 character'}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <FormControl fullWidth error={!!formErrors.employee_type}>
                <InputLabel id="employee-type-label">Employment Type</InputLabel>
                <Select
                  labelId="employee-type-label"
                  id="employee-type-select"
                  value={formData.employee_type || 'full-time'}
                  onChange={handleSelectChange}
                  label="Employment Type"
                >
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                </Select>
                {formErrors.employee_type && (
                  <FormHelperText error>{formErrors.employee_type}</FormHelperText>
                )}
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
              <TextField
                fullWidth
                label="Monthly Salary"
                name="monthly_salary"
                type="number"
                value={formData.monthly_salary}
                onChange={handleInputChange}
                error={!!formErrors.monthly_salary}
                helperText={formErrors.monthly_salary}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <FormControl fullWidth error={!!formErrors.document_file}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Upload Document
                  </Typography>
                  <input
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    type="file"
                    id="document-input"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="document-input" style={{ width: '100%', display: 'block' }}>
                    <Button
                      component="span"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        textAlign: 'left',
                        py: 1.5,
                        backgroundColor: formData.document_file ? '#f0f7ff' : 'transparent',
                        borderColor: formData.document_file ? '#1976d2' : '#ccc'
                      }}
                    >
                      {formData.document_file ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>✓</span>
                          {formData.document_file.name}
                        </Box>
                      ) : (
                        'Choose Document (PDF, DOC, JPG, PNG)'
                      )}
                    </Button>
                  </label>
                  {formErrors.document_file && (
                    <FormHelperText error>{formErrors.document_file}</FormHelperText>
                  )}
                  <FormHelperText sx={{ mt: 1 }}>
                    {!editingId ? '✱ Required for new employees' : 'Optional - leave empty to keep current'}
                  </FormHelperText>
                </Box>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this employee? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
