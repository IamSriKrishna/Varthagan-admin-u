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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from 'next/navigation';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { useDebounce } from '@/hooks/useDebounce';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

const PurchaseOrderList: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const {
    purchaseOrders,
    totalPOs,
    loading,
    getPurchaseOrders,
    searchPurchaseOrders,
    deletePurchaseOrder,
  } = usePurchaseOrder();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchPurchaseOrders(debouncedSearch);
    } else {
      getPurchaseOrders(page + 1, rowsPerPage);
    }
  }, [debouncedSearch, page, rowsPerPage, getPurchaseOrders, searchPurchaseOrders]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id: string) => {
    router.push(`/purchase-orders/purchase-order/${id}`);
  };

  const handleAddNew = () => {
    router.push('/purchase-orders/purchase-order/new');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, po: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedPO(po);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPO(null);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedId) {
      const success = await deletePurchaseOrder(selectedId);
      if (success) {
        setDeleteConfirmOpen(false);
        setSelectedId(null);
        getPurchaseOrders(page + 1, rowsPerPage);
      }
    }
  };

  const getStatusConfig = (status: string | undefined) => {
    const configs: Record<string, any> = {
      draft: {
        color: '#94a3b8',
        bg: alpha('#94a3b8', 0.1),
        icon: <AssignmentIcon fontSize="small" />,
        label: 'Draft'
      },
      confirmed: {
        color: '#22c55e',
        bg: alpha('#22c55e', 0.1),
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Confirmed'
      },
      cancelled: {
        color: '#ef4444',
        bg: alpha('#ef4444', 0.1),
        icon: <CancelIcon fontSize="small" />,
        label: 'Cancelled'
      },
    };
    return configs[status || 'draft'] || configs.draft;
  };

  const filteredPurchaseOrders = statusFilter === 'all' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === statusFilter);

  const stats = [
    {
      title: 'Total Orders',
      value: totalPOs,
      icon: <AssignmentIcon />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      trend: '+12%',
    },
    {
      title: 'Draft',
      value: purchaseOrders.filter((po) => po.status === 'draft').length,
      icon: <EditIcon />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Confirmed',
      value: purchaseOrders.filter((po) => po.status === 'confirmed').length,
      icon: <CheckCircleIcon />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Total Value',
      value: `₹${purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0).toLocaleString('en-IN')}`,
      icon: <TrendingUpIcon />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      subtitle: 'Current Month',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Purchase Orders
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalShippingIcon sx={{ fontSize: 16 }} />
              Manage and track all your purchase orders
            </Typography>
          </Box>
          <BBButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              boxShadow: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            New Purchase Order
          </BBButton>
        </Box>
      </Box>

      {/* Enhanced Statistics Cards */}
      {purchaseOrders.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    background: stat.gradient,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                      <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    {stat.trend && (
                      <Chip
                        label={stat.trend}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          height: 20,
                        }}
                      />
                    )}
                    {stat.subtitle && (
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {stat.subtitle}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Enhanced Search and Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Search by PO number, vendor name, or reference..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 1,
                  },
                  '&.Mui-focused': {
                    boxShadow: 2,
                  },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Table */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: 2,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: `linear-gradient(135deg, ${alpha('#667eea', 0.1)} 0%, ${alpha('#764ba2', 0.1)} 100%)`,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>PO Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Delivery To</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPurchaseOrders.length > 0 ? (
                  filteredPurchaseOrders.map((po, index) => {
                    const statusConfig = getStatusConfig(po.status);
                    return (
                      <Fade in timeout={200 + index * 50} key={po.id}>
                        <TableRow
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              transition: 'all 0.2s ease',
                            },
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 4,
                                  height: 36,
                                  borderRadius: 1,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                                {po.purchase_order_no}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {po.vendor?.display_name || po.vendor?.company_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {po.reference_no || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {po.delivery_address_type === 'organization'
                                ? po.organization_name
                                : po.customer?.display_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`₹${(po.total || 0).toLocaleString('en-IN')}`}
                              sx={{
                                fontWeight: 700,
                                backgroundColor: alpha('#22c55e', 0.1),
                                color: '#22c55e',
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusConfig.icon}
                              label={statusConfig.label}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.color,
                                border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {new Date(po.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(po.id!)}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More Actions" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, po)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <WidgetsIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          No purchase orders found
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.disabled', maxWidth: 400, textAlign: 'center' }}>
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                            : 'Get started by creating your first purchase order'}
                        </Typography>
                        {!searchQuery && statusFilter === 'all' && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddNew}
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Create Purchase Order
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Enhanced Pagination */}
          {filteredPurchaseOrders.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalPOs)} of {totalPOs} orders
              </Typography>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalPOs}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  border: 'none',
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    margin: 0,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => { handleEdit(selectedPO?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEdit(selectedPO?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteClick(selectedPO?.id)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Enhanced Delete Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 6,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DeleteIcon sx={{ color: 'error.main' }} />
            </Box>
            Delete Purchase Order
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this purchase order? This action cannot be undone and all associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PurchaseOrderList;