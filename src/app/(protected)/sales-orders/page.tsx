'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  Fade,
  Skeleton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WidgetsIcon from '@mui/icons-material/Widgets';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import { showToastMessage } from '@/utils/toastUtil';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface SalesOrderRow {
  id: string;
  sales_order_no?: string;
  reference_no: string;
  customer?: {
    display_name: string;
  };
  so_date?: string;
  status?: string;
  total_amount?: number;
  total?: number;
  line_items_count?: number;
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const {
    getSalesOrders,
    deleteSalesOrder,
    updateSalesOrderStatus,
    loading,
    error,
  } = useSalesOrder();

  const [salesOrders, setSalesOrders] = useState<SalesOrderRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: string;
  }>({
    open: false,
  });
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    id: string;
  } | null>(null);

  const theme = useTheme();

  useEffect(() => {
    loadSalesOrders();
  }, [page, rowsPerPage, searchQuery]);

  const loadSalesOrders = async () => {
    try {
      const data = await getSalesOrders(page + 1, rowsPerPage, searchQuery);
      setSalesOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error('Failed to load sales orders:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      try {
        await deleteSalesOrder(deleteDialog.id);
        setDeleteDialog({ open: false });
        loadSalesOrders();
      } catch (err) {
        console.error('Failed to delete sales order:', err);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setStatusChangeLoading(true);
      setStatusChangeError(null);
      console.log('Updating status for SO:', id, 'to:', newStatus);
      
      const response = await updateSalesOrderStatus(id, { status: newStatus as any });
      console.log('Status update response:', response);
      
      showToastMessage(`Sales order ${newStatus} successfully`, 'success');
      setMenuAnchor(null);
      loadSalesOrders();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      const errorMessage = err.message || 'Failed to update sales order status';
      setStatusChangeError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon fontSize="small" />;
      case 'draft':
        return <AssignmentIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <BBTitle
            title="Sales Orders"
            subtitle="Manage your sales orders efficiently"
          />
          <BBButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/sales-orders/sales-order/new')}
          >
            Create Sales Order
          </BBButton>
        </Box>

        {/* Error Alert */}
        {statusChangeError && (
          <Alert 
            severity="error" 
            onClose={() => setStatusChangeError(null)}
            sx={{ mb: 3 }}
          >
            {statusChangeError}
          </Alert>
        )}

        {/* Filters Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by reference or customer..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  {statusFilter ? `Status: ${statusFilter}` : 'Filter by Status'}
                </Button>
                <Menu
                  anchorEl={filterAnchor}
                  open={Boolean(filterAnchor)}
                  onClose={() => setFilterAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setStatusFilter(null);
                      setFilterAnchor(null);
                    }}
                  >
                    All Status
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => setStatusFilter('draft')}>
                    Draft
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('confirmed')}>
                    Confirmed
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('cancelled')}>
                    Cancelled
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sales Orders Table */}
        <Card>
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>SO Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Items
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No sales orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.sales_order_no || order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.reference_no}</TableCell>
                        <TableCell>
                          {order.customer?.display_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.so_date
                            ? new Date(order.so_date).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {order.line_items_count || 0}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₹{(order.total_amount || order.total || 0).toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status || 'draft'}
                            color={getStatusColor(order.status)}
                            size="small"
                            icon={getStatusIcon(order.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(
                                  `/sales-orders/sales-order/${order.id}`
                                )
                              }
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(
                                  `/sales-orders/sales-order/${order.id}?mode=edit`
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Options">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                setMenuAnchor({
                                  element: e.currentTarget,
                                  id: order.id,
                                })
                              }
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={salesOrders.length > 0 ? rowsPerPage * (page + 1) + 1 : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* More Options Menu */}
        <Menu
          anchorEl={menuAnchor?.element || null}
          open={Boolean(menuAnchor)}
          onClose={() => !statusChangeLoading && setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() =>
              menuAnchor && handleStatusChange(menuAnchor.id, 'confirmed')
            }
            disabled={statusChangeLoading}
          >
            <ListItemIcon>
              {statusChangeLoading ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {statusChangeLoading ? 'Confirming...' : 'Confirm Order'}
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() =>
              menuAnchor && handleDeleteClick(menuAnchor.id)
            }
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this sales order? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
