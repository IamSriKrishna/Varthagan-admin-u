'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tooltip,
  InputAdornment,
  Checkbox,
  alpha,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useRouter } from 'next/navigation';
import { usePackage } from '@/hooks/usePackage';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface PackageRow {
  id: string;
  package_slip_no?: string;
  sales_order_id?: string;
  sales_order_no?: string;
  customer?: {
    display_name: string;
  };
  package_date?: string;
  sales_order_date?: string;
  status?: string;
  total_items?: number;
}

interface PackageColumn {
  status: string;
  title: string;
  headerColor: string;
  packages: PackageRow[];
}

export default function PackagesPage() {
  const router = useRouter();
  const { getPackages, deletePackage, loading, error } = usePackage();

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false });
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<{ el: HTMLElement | null; status: string }>({ el: null, status: '' });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await getPackages(1, 100, searchQuery);
      console.log('Raw response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      // Handle different response formats
      let packagesData: PackageRow[] = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        packagesData = response;
      } else if (response && typeof response === 'object') {
        // Object response - check for data property
        if (Array.isArray(response.data)) {
          packagesData = response.data;
        } else if (Array.isArray(response.packages)) {
          packagesData = response.packages;
        } else {
          console.warn('Unexpected response structure:', response);
        }
      }
      
      console.log('Processed packages data:', packagesData);
      console.log('Package count:', packagesData.length);
      setPackages(packagesData);
    } catch (err) {
      console.error('Failed to load packages:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deletePackage(deleteDialog.id);
      setDeleteDialog({ open: false });
      loadPackages();
    } catch (err) {
      console.error('Failed to delete package:', err);
    }
  };

  const handleCheckboxChange = (packageId: string) => {
    const newSelected = new Set(selectedPackages);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedPackages(newSelected);
  };

  const kanbanColumns = useMemo<PackageColumn[]>(() => {
    console.log('Calculating kanban columns...');
    console.log('Total packages:', packages.length);
    console.log('Packages:', packages);
    
    // Get unique statuses from packages
    const uniqueStatuses = [...new Set(packages.map(p => p.status || 'draft'))];
    console.log('Unique statuses:', uniqueStatuses);
    
    // Define status configuration
    const statusConfig: Record<string, { title: string; color: string }> = {
      draft: { title: 'Draft', color: '#e0e0e0' },
      confirmed: { title: 'Confirmed', color: '#fff9c4' },
      processing: { title: 'Processing', color: '#b2dfdb' },
      shipped: { title: 'Shipped', color: '#bbdefb' },
      delivered: { title: 'Delivered', color: '#c8e6c9' },
      cancelled: { title: 'Cancelled', color: '#ffccbc' },
    };

    // Create columns for each unique status
    const columns = uniqueStatuses.map(status => ({
      status,
      title: statusConfig[status]?.title || status.charAt(0).toUpperCase() + status.slice(1),
      headerColor: statusConfig[status]?.color || '#f5f5f5',
      packages: packages.filter(p => (p.status || 'draft') === status),
    }));
    
    console.log('Generated columns:', columns);
    return columns;
  }, [packages]);

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: 3 }}>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a' }}>
            All Packages
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* View toggle buttons matching screenshot */}
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                borderRadius: 1,
                overflow: 'hidden',
                '& .MuiIconButton-root': { borderRadius: 0 },
              }}
            >
              <IconButton size="small" sx={{ px: 1.5, py: 0.75 }}>
                <ViewListIcon fontSize="small" />
              </IconButton>
              <Box sx={{ width: '1px', backgroundColor: '#e0e0e0' }} />
              <IconButton size="small" sx={{ px: 1.5, py: 0.75, backgroundColor: alpha('#1976d2', 0.08) }}>
                <ViewModuleIcon fontSize="small" sx={{ color: '#1976d2' }} />
              </IconButton>
            </Paper>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/packages/package/new')}
              sx={{
                backgroundColor: '#1976d2',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                px: 2,
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              New
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: '#ffebee',
              borderLeft: '4px solid #d32f2f',
              borderRadius: 1,
            }}
          >
            <Typography sx={{ color: '#d32f2f', fontWeight: 500, fontSize: '0.875rem' }}>
              Error: {error}
            </Typography>
          </Paper>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : packages.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              No packages found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/packages/package/new')}
              sx={{
                backgroundColor: '#1976d2',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              Create Package
            </Button>
          </Box>
        ) : (
          /* Kanban Layout */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {kanbanColumns.map((column) => (
              <Box key={column.status}>
                {/* Column Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    backgroundColor: column.headerColor,
                    borderRadius: '6px 6px 0 0',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#333',
                      fontSize: '0.9rem',
                    }}
                  >
                    {column.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => setColumnMenuAnchor({ el: e.currentTarget, status: column.status })}
                    sx={{ p: 0.5, color: '#666' }}
                  >
                    <MenuIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Column Body */}
                <Paper
                  variant="outlined"
                  sx={{
                    minHeight: 300,
                    borderRadius: '0 0 6px 6px',
                    borderTop: 'none',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                  }}
                >
                  {column.packages.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        No Records Found
                      </Typography>
                    </Box>
                  ) : (
                    column.packages.map((pkg, idx) => (
                      <Box
                        key={pkg.id}
                        onClick={() => router.push(`/packages/package/${pkg.id}`)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 1.25,
                          borderBottom: idx < column.packages.length - 1 ? '1px solid #f0f0f0' : 'none',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: alpha(column.headerColor, 0.4) },
                          gap: 1,
                        }}
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedPackages.has(pkg.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(pkg.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                          sx={{ p: 0.25 }}
                        />

                        {/* Main Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Customer Name */}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1a1a1a',
                              fontSize: '0.875rem',
                              mb: 0.25,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {pkg.customer?.display_name || 'N/A'}
                          </Typography>

                          {/* Package slip no + SO number */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#1976d2',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                              }}
                            >
                              {pkg.package_slip_no || pkg.sales_order_no || '-'}
                            </Typography>
                            {(pkg.sales_order_id || pkg.sales_order_no) && (
                              <>
                                <Typography variant="caption" sx={{ color: '#bbb' }}>|</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#999', fontSize: '0.78rem' }}
                                >
                                  {pkg.sales_order_id || pkg.sales_order_no}
                                </Typography>
                              </>
                            )}
                          </Box>

                          {/* Date */}
                          <Typography
                            variant="caption"
                            sx={{ color: '#999', fontSize: '0.75rem' }}
                          >
                            {pkg.package_date
                              ? new Date(pkg.package_date).toLocaleDateString('en-IN')
                              : pkg.sales_order_date
                              ? new Date(pkg.sales_order_date).toLocaleDateString('en-IN')
                              : '-'}
                          </Typography>
                        </Box>

                        {/* Quantity */}
                        {pkg.total_items !== undefined && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: '#555',
                              fontSize: '0.875rem',
                              flexShrink: 0,
                            }}
                          >
                            {pkg.total_items.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        )}

        {/* Column context menu */}
        <Menu
          anchorEl={columnMenuAnchor.el}
          open={Boolean(columnMenuAnchor.el)}
          onClose={() => setColumnMenuAnchor({ el: null, status: '' })}
          PaperProps={{ sx: { borderRadius: 1.5, boxShadow: 3, minWidth: 140 } }}
        >
          <MenuItem onClick={() => setColumnMenuAnchor({ el: null, status: '' })} sx={{ fontSize: '0.875rem' }}>
            Collapse
          </MenuItem>
          <MenuItem onClick={() => setColumnMenuAnchor({ el: null, status: '' })} sx={{ fontSize: '0.875rem' }}>
            Sort
          </MenuItem>
          <MenuItem onClick={() => setColumnMenuAnchor({ el: null, status: '' })} sx={{ fontSize: '0.875rem' }}>
            Filter
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false })}
          PaperProps={{ sx: { borderRadius: 2, width: '100%', maxWidth: 420 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Delete Package</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Are you sure you want to delete this package? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setDeleteDialog({ open: false })}
              sx={{ textTransform: 'none', borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDelete}
              sx={{ textTransform: 'none', borderRadius: 1 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}