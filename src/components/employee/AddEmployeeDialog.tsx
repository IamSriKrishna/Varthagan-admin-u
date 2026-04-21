'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  Stack,
} from '@mui/material';
import { Upload, X } from 'lucide-react';
import { employeeService } from '@/lib/api/employeeService';
import { EmployeeCreateRequest, EmployeeUpdateRequest } from '@/models/employee.model';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingEmployeeId?: number;
}

export const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  open,
  onClose,
  onSuccess,
  editingEmployeeId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    address: '',
    employee_type: 'full-time' as const,
    monthly_salary: '',
    document_file: null as File | null,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      employee_type: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      document_file: file || null,
    }));
    if (validationErrors.document_file) {
      setValidationErrors((prev) => ({
        ...prev,
        document_file: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.number.trim()) errors.number = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.monthly_salary) errors.monthly_salary = 'Monthly salary is required';
    else if (parseFloat(formData.monthly_salary) <= 0)
      errors.monthly_salary = 'Salary must be greater than 0';

    if (!editingEmployeeId && !formData.document_file) {
      errors.document_file = 'Document is required for new employees';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {


      if (editingEmployeeId) {
        const updateData: EmployeeUpdateRequest = {
          name: formData.name || undefined,
          email: formData.email || undefined,
          number: formData.number || undefined,
          address: formData.address || undefined,
          employee_type: formData.employee_type,
          monthly_salary: parseFloat(formData.monthly_salary),
        };


        const response = await employeeService.updateEmployee(editingEmployeeId, updateData);
        if (response.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 1000);
        } else {
          setError(response.message || 'Failed to update employee');
        }
      } else {
        // Create FormData with all fields and document file
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        if (formData.email) formDataObj.append("email", formData.email);
        formDataObj.append("number", formData.number);
        formDataObj.append("address", formData.address);
        formDataObj.append("employee_type", formData.employee_type);
        formDataObj.append("monthly_salary", formData.monthly_salary);
        if (formData.document_file) {
          formDataObj.append("document", formData.document_file);
        }

        const response = await employeeService.createEmployeeWithFile(formDataObj);
        if (response.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 1000);
        } else {
          setError(response.message || 'Failed to create employee');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      number: '',
      address: '',
      employee_type: 'full-time',
      monthly_salary: '',
      document_file: null,
    });
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            👤
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Add New Employee
            </Typography>
            <Typography variant="caption">Fill in the details below</Typography>
          </Box>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: 0,
            }}
          >
            ✕
          </button>
        </Box>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Employee {editingEmployeeId ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Full Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter full name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Email Address */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Phone Number */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Phone Number *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter phone number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                error={!!validationErrors.number}
                helperText={validationErrors.number}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Address */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Address *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Employment Type */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Employment Type *
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  name="employee_type"
                  value={formData.employee_type}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Monthly Salary */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Monthly Salary *
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter monthly salary"
                name="monthly_salary"
                type="number"
                value={formData.monthly_salary}
                onChange={handleInputChange}
                error={!!validationErrors.monthly_salary}
                helperText={validationErrors.monthly_salary}
                inputProps={{ step: '0.01', min: '0' }}
                size="small"
                sx={{ mt: 0.5 }}
                InputProps={{
                  startAdornment: '₹',
                }}
              />
            </Box>

            {/* Document Upload */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Upload Document {!editingEmployeeId && '*'}
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                type="file"
                id="file-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" style={{ display: 'block', width: '100%', marginTop: 4 }}>
                <Button
                  component="span"
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 2,
                    textAlign: 'left',
                    backgroundColor: formData.document_file ? '#f0f7ff' : 'transparent',
                    borderColor: validationErrors.document_file ? '#d32f2f' : formData.document_file ? '#667eea' : '#ccc',
                    color: formData.document_file ? '#667eea' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: formData.document_file ? '#f0f7ff' : '#fafafa',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {formData.document_file ? (
                      <>
                        <Box sx={{ color: '#667eea', fontSize: '1.2rem' }}>✓</Box>
                        <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formData.document_file.name}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <Typography variant="body2">Choose file (PDF, DOC, JPG, PNG)</Typography>
                      </>
                    )}
                  </Box>
                </Button>
              </label>
              {validationErrors.document_file && (
                <FormHelperText error>{validationErrors.document_file}</FormHelperText>
              )}
              <FormHelperText sx={{ mt: 1 }}>
                {!editingEmployeeId ? 'Required for new employees. Max 5MB' : 'Optional - leave empty to keep current. Max 5MB'}
              </FormHelperText>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              {editingEmployeeId ? 'Update Employee' : 'Create Employee'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
