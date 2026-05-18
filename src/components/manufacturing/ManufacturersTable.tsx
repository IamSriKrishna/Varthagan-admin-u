'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Edit2, Trash2, Eye, CheckCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Manufacturer } from '@/models/manufacturer.model';

interface ManufacturersTableProps {
  manufacturers: Manufacturer[];
  loading?: boolean;
  onEdit: (manufacturer: Manufacturer) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
  onView?: (manufacturer: Manufacturer) => void;
}

export default function ManufacturersTable({
  manufacturers,
  loading = false,
  onEdit,
  onDelete,
  onUpdateStatus,
  onView,
}: ManufacturersTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    id: null,
    name: null,
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    id: null,
    name: null,
  });

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    manufacturer: Manufacturer | null;
  }>({
    open: false,
    manufacturer: null,
  });

  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  }, []);

  const handleUpdateStatusClick = useCallback((id: string, name: string) => {
    console.log('Opening status dialog for:', { id, name });
    setStatusDialog({ open: true, id, name });
  }, []);

  const handleConfirmStatusUpdate = useCallback(async () => {
    console.log('🔵 Mark Complete button clicked');
    console.log('statusDialog.id:', statusDialog.id);
    console.log('onUpdateStatus exists:', !!onUpdateStatus);

    if (!statusDialog.id) {
      console.error('❌ No manufacturer ID in status dialog');
      alert('Error: No manufacturer ID found');
      return;
    }

    if (!onUpdateStatus) {
      console.error('❌ onUpdateStatus function not provided to ManufacturersTable');
      alert('Error: Update function not available. Please refresh the page.');
      return;
    }

    setUpdatingStatus(true);
    try {
      console.log('🟡 Attempting to update status for ID:', statusDialog.id);
      const result = await onUpdateStatus(statusDialog.id, 'completed');
      console.log('🟢 Status update successful:', result);
      setStatusDialog({ open: false, id: null, name: null });
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      alert(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  }, [statusDialog.id, onUpdateStatus]);

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      setDeleting(true);
      try {
        await onDelete(deleteDialog.id);
        setDeleteDialog({ open: false, id: null, name: null });
      } catch (error) {
        console.error('Failed to delete:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleViewClick = useCallback((manufacturer: Manufacturer) => {
    setViewDialog({ open: true, manufacturer });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Don't block the entire table on loading - let individual states handle loading UI
  if (manufacturers.length === 0 && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">No manufacturers found</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Manufacturer Name</TableCell>
              <TableCell>Product Group</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id} hover>
                <TableCell>{manufacturer.name}</TableCell>
                <TableCell>{manufacturer.product_group_id}</TableCell>
                <TableCell align="right">{manufacturer.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={manufacturer.status}
                    color={getStatusColor(manufacturer.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{manufacturer.employees?.length || 0}</TableCell>
                <TableCell>{new Date(manufacturer.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleViewClick(manufacturer)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(manufacturer)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </IconButton>
                    {manufacturer.status !== 'completed' && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleUpdateStatusClick(manufacturer.id, manufacturer.name)}
                        title="Mark as Complete"
                      >
                        <CheckCircle size={18} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(manufacturer.id, manufacturer.name)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Confirmation Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, id: null, name: null })}>
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark "{statusDialog.name}" as completed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, id: null, name: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            color="success"
            variant="contained"
            disabled={updatingStatus}
            sx={{ minWidth: 120 }}
          >
            {updatingStatus ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Updating...
              </>
            ) : (
              'Mark Complete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, manufacturer: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Manufacturer Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewDialog.manufacturer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography>{viewDialog.manufacturer.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Product Group ID</Typography>
                <Typography>{viewDialog.manufacturer.product_group_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Quantity</Typography>
                <Typography>{viewDialog.manufacturer.quantity}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip
                  label={viewDialog.manufacturer.status}
                  color={getStatusColor(viewDialog.manufacturer.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography>{viewDialog.manufacturer.description || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Employees ({viewDialog.manufacturer.employees?.length || 0})</Typography>
                {viewDialog.manufacturer.employees && viewDialog.manufacturer.employees.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Cost</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.manufacturer.employees.map((emp, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{emp.employee_id}</TableCell>
                          <TableCell align="right">₹{emp.service_cost}</TableCell>
                          <TableCell>{emp.cost_type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography color="textSecondary">No employees</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Created</Typography>
                <Typography>{new Date(viewDialog.manufacturer.created_at).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, manufacturer: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
