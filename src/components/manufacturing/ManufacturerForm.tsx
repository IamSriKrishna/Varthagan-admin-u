'use client';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Trash2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductGroupSelect from '@/components/productGroups/ProductGroupSelect';
import { ProductGroupListOutput } from '@/models/product-group.model';
import EmployeeSelect, { Employee } from '@/components/employees/EmployeeSelect';
import {
  CreateManufacturerRequest,
  ManufacturerEmployee,
  Manufacturer,
} from '@/models/manufacturer.model';

interface ManufacturerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateManufacturerRequest | Manufacturer) => Promise<void>;
  initialData?: Manufacturer;
  isLoading?: boolean;
  error?: string;
}

export default function ManufacturerForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  error,
}: ManufacturerFormProps) {
  const [formData, setFormData] = useState<CreateManufacturerRequest & { status?: string }>({
    name: '',
    product_group_id: '',
    quantity: 100,
    description: '',
    employees: [],
    status: 'pending',
  });

  const [employees, setEmployees] = useState<ManufacturerEmployee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<ManufacturerEmployee>({
    employee_id: 0,
    service_cost: 0,
    cost_type: 'fixed',
  });
  const [selectedProductGroup, setSelectedProductGroup] = useState<ProductGroupListOutput | null>(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        product_group_id: initialData.product_group_id,
        quantity: initialData.quantity,
        description: initialData.description || '',
        employees: initialData.employees || [],
        status: initialData.status || 'pending',
      });
      setEmployees(initialData.employees || []);
    } else {
      setFormData({
        name: '',
        product_group_id: '',
        quantity: 100,
        description: '',
        employees: [],
        status: 'pending',
      });
      setEmployees([]);
    }
  }, [initialData, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value as string) || 0 : value,
    }));
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setCurrentEmployee((prev) => ({
      ...prev,
      [name]:
        name === 'employee_id' || name === 'service_cost'
          ? parseFloat(value as string) || 0
          : value,
    }));
  };

  const addEmployee = () => {
    if (currentEmployee.employee_id && currentEmployee.service_cost > 0) {
      setEmployees((prev) => [...prev, { ...currentEmployee }]);
      setCurrentEmployee({
        employee_id: 0,
        service_cost: 0,
        cost_type: 'fixed',
      });
    }
  };

  const removeEmployee = (index: number) => {
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.product_group_id || employees.length === 0) {
      alert('Please fill all required fields and add at least one employee');
      return;
    }

    const submitData = {
      ...formData,
      employees,
    };

    // Remove status if creating new (only include for updates)
    if (!initialData && 'status' in submitData) {
      delete (submitData as any).status;
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Manufacturer' : 'Create Manufacturer'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Manufacturer Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            placeholder="e.g., Batch-001-test5-100units"
          />

          <ProductGroupSelect
            value={formData.product_group_id}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                product_group_id: value || '',
              }));
            }}
            onProductGroupSelect={(productGroup) => {
              setSelectedProductGroup(productGroup);
            }}
            label="Product Group"
            required={true}
            fullWidth
            size="small"
          />

          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            fullWidth
            inputProps={{ min: 1 }}
          />

          {initialData && (
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status || 'pending'}
              onChange={handleInputChange}
              fullWidth
              size="small"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          )}

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Manufacturing description"
          />

          {/* Employee Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Manufacturing Employees
            </Typography>

            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <EmployeeSelect
                    value={currentEmployee.employee_id || undefined}
                    onChange={(value) => {
                      setCurrentEmployee((prev) => ({
                        ...prev,
                        employee_id: value || 0,
                      }));
                    }}
                    onEmployeeSelect={(employee) => {
                      setSelectedEmployeeData(employee);
                    }}
                    label="Select Employee"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Service Cost"
                    name="service_cost"
                    type="number"
                    value={currentEmployee.service_cost || ''}
                    onChange={handleEmployeeChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    label="Cost Type"
                    name="cost_type"
                    value={currentEmployee.cost_type}
                    onChange={handleEmployeeChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="per_unit">Per Unit</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={addEmployee}
                    fullWidth
                  >
                    Add Employee
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Employees Table */}
            {employees.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell align="right">Service Cost</TableCell>
                    <TableCell>Cost Type</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{emp.employee_id}</TableCell>
                      <TableCell align="right">₹{emp.service_cost}</TableCell>
                      <TableCell>{emp.cost_type}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeEmployee(idx)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
