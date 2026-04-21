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
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Stack,
  Avatar,
  Badge,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useRouter } from 'next/navigation';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import { showToastMessage } from '@/utils/toastUtil';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface SalesOrderRow {
  id: string;
  sales_order_no?: string;
  reference_no: string;
  customer?: { display_name: string };
  so_date?: string;
  status?: string;
  total_amount?: number;
  total?: number;
  line_items_count?: number;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; icon: React.ReactNode }
> = {
  paid: {
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Paid',
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
  },
  confirmed: {
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Confirmed',
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
  },
  draft: {
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fde68a',
    label: 'Draft',
    icon: <AssignmentIcon sx={{ fontSize: 13 }} />,
  },
  cancelled: {
    color: '#991b1b',
    bg: '#fef2f2',
    border: '#fecaca',
    label: 'Cancelled',
    icon: <CancelIcon sx={{ fontSize: 13 }} />,
  },
  completed: {
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
    label: 'Completed',
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
  },
};

function StatusPill({ status }: { status?: string }) {
  const key = status || 'draft';
  const cfg = STATUS_CONFIG[key] || {
    color: '#374151',
    bg: '#f9fafb',
    border: '#e5e7eb',
    label: key,
    icon: null,
  };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.4,
        borderRadius: '20px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: cfg.color,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        textTransform: 'uppercase',
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #f1f5f9',
        borderRadius: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const STATUS_TABS = ['All', 'Draft', 'Confirmed', 'Completed', 'Cancelled'];

export default function SalesOrdersPage() {
  const router = useRouter();
  const { getSalesOrders, deleteSalesOrder, updateSalesOrderStatus, loading, error } =
    useSalesOrder();

  const [salesOrders, setSalesOrders] = useState<SalesOrderRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [updateDialog, setUpdateDialog] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [activeTab, setActiveTab] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; id: string } | null>(null);

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
    setDeleteError(null);
    setDeleteDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      setDeleteLoading(true);
      setDeleteError(null);
      try {
        const result = await deleteSalesOrder(deleteDialog.id);
        showToastMessage('Sales order deleted successfully', 'success');
        setDeleteDialog({ open: false });
        setDeleteLoading(false);
        // Reload the list after successful deletion
        setTimeout(() => {
          loadSalesOrders();
        }, 300);
      } catch (err: any) {
        console.error('Failed to delete sales order:', err);
        const errorMessage = err?.message || 'Failed to delete sales order';
        setDeleteError(errorMessage);
        showToastMessage(errorMessage, 'error');
        setDeleteLoading(false);
      }
    }
  };

  const handleStatusChange = async () => {
    if (!statusDialog.id) return;
    try {
      setStatusChangeLoading(true);
      setStatusChangeError(null);
      await updateSalesOrderStatus(statusDialog.id, { status: 'paid' as any });
      showToastMessage('Sales order marked as paid successfully', 'success');
      setStatusDialog({ open: false });
      loadSalesOrders();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update sales order status';
      setStatusChangeError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const handleStatusClick = (id: string) => {
    setStatusChangeError(null);
    setStatusDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleUpdateClick = (id: string) => {
    setUpdateDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleNavigateToEdit = () => {
    if (updateDialog.id) {
      router.push(`/sales-orders/sales-order/${updateDialog.id}`);
      setUpdateDialog({ open: false });
    }
  };

  const filteredOrders = salesOrders.filter((o) => {
    if (activeTab === 'All') return true;
    return (o.status || 'draft').toLowerCase() === activeTab.toLowerCase();
  });

  const totalAmount = salesOrders.reduce(
    (sum, o) => sum + (o.total_amount || o.total || 0),
    0
  );
  const confirmedCount = salesOrders.filter((o) => o.status === 'paid').length;
  const draftCount = salesOrders.filter((o) => !o.status || o.status === 'draft').length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        fontFamily: '"DM Sans", "Plus Jakarta Sans", sans-serif',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Header ───────────────────────────────────────────────── */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={4}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              Sales Orders
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>
              {salesOrders.length} orders · last updated just now
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/sales-orders/sales-order/new')}
            sx={{
              bgcolor: '#0f172a',
              borderRadius: 2.5,
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: 0,
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
              '&:hover': {
                bgcolor: '#1e293b',
                boxShadow: '0 6px 20px rgba(15,23,42,0.35)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            New Order
          </Button>
        </Stack>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <Grid container spacing={2} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total Orders"
              value={salesOrders.length}
              icon={<InventoryIcon sx={{ fontSize: 22 }} />}
              color="#6366f1"
              bg="#eef2ff"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Confirmed"
              value={confirmedCount}
              icon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
              color="#16a34a"
              bg="#f0fdf4"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Drafts"
              value={draftCount}
              icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
              color="#d97706"
              bg="#fffbeb"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total Revenue"
              value={`₹${(totalAmount / 100000).toFixed(1)}L`}
              icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
              color="#0ea5e9"
              bg="#f0f9ff"
            />
          </Grid>
        </Grid>

        {/* ── Error Alert ─────────────────────────────────────────── */}
        {statusChangeError && (
          <Alert
            severity="error"
            onClose={() => setStatusChangeError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {statusChangeError}
          </Alert>
        )}

        {/* ── Main Table Card ──────────────────────────────────────── */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #f1f5f9',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: '1px solid #f1f5f9',
              bgcolor: '#fff',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              gap={2}
            >
              {/* Status Tabs */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {STATUS_TABS.map((tab) => (
                  <Button
                    key={tab}
                    size="small"
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      borderRadius: 2,
                      px: 1.75,
                      py: 0.6,
                      fontSize: '0.8rem',
                      fontWeight: activeTab === tab ? 700 : 500,
                      textTransform: 'none',
                      color: activeTab === tab ? '#fff' : '#64748b',
                      bgcolor: activeTab === tab ? '#0f172a' : 'transparent',
                      '&:hover': {
                        bgcolor: activeTab === tab ? '#1e293b' : '#f1f5f9',
                      },
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab}
                  </Button>
                ))}
              </Stack>

              {/* Search */}
              <TextField
                placeholder="Search orders…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    fontSize: '0.875rem',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5 },
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Table */}
          <TableContainer sx={{ bgcolor: '#fff' }}>
            {loading ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0f172a' }} />
                <Typography sx={{ mt: 2, color: '#94a3b8', fontSize: '0.875rem' }}>
                  Loading orders…
                </Typography>
              </Box>
            ) : (
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {[
                      'SO Number',
                      'Customer',
                      'Date',
                      'Items',
                      'Amount',
                      'Status',
                      'Actions',
                    ].map((h, i) => (
                      <TableCell
                        key={h}
                        align={['Items', 'Amount'].includes(h) ? 'right' : i === 6 ? 'center' : 'left'}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          py: 1.5,
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8, border: 0 }}>
                        <Box sx={{ color: '#94a3b8' }}>
                          <InventoryIcon sx={{ fontSize: 40, opacity: 0.35, mb: 1 }} />
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            No orders found
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                            Try adjusting your filters or create a new order.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td': { border: 0 },
                          '& td': {
                            borderBottom: '1px solid #f8fafc',
                            py: 1.75,
                          },
                          '&:hover': {
                            bgcolor: '#fafbfe',
                            '& .row-actions': { opacity: 1 },
                          },
                          transition: 'background 0.12s',
                        }}
                      >
                        {/* SO Number */}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                bgcolor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  color: '#64748b',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {String(idx + 1).padStart(2, '0')}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  lineHeight: 1.3,
                                }}
                              >
                                {order.sales_order_no || `SO-${order.id.slice(-6).toUpperCase()}`}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {order.reference_no}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                bgcolor: `hsl(${(order.customer?.display_name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 88%)`,
                                color: `hsl(${(order.customer?.display_name?.charCodeAt(0) || 65) * 5 % 360}, 50%, 35%)`,
                              }}
                            >
                              {(order.customer?.display_name || 'N')[0].toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                              {order.customer?.display_name || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography sx={{ fontSize: '0.875rem', color: '#475569' }}>
                            {order.so_date
                              ? new Date(order.so_date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </Typography>
                        </TableCell>

                        {/* Items */}
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: 1.5,
                              bgcolor: '#f1f5f9',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#475569',
                            }}
                          >
                            {order.line_items_count || 0}
                          </Box>
                        </TableCell>

                        {/* Amount */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              fontVariantNumeric: 'tabular-nums',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            ₹{(order.total_amount || order.total || 0).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                            })}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusPill status={order.status} />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <Stack
                            className="row-actions"
                            direction="row"
                            justifyContent="center"
                            spacing={0.25}
                            sx={{ opacity: 0.4, transition: 'opacity 0.15s' }}
                          >
                            <Tooltip title="View" arrow>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(`/sales-orders/sales-order/${order.id}`)
                                }
                                sx={{
                                  borderRadius: 1.5,
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(
                                    `/sales-orders/sales-order/${order.id}?mode=edit`
                                  )
                                }
                                sx={{
                                  borderRadius: 1.5,
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  setMenuAnchor({ element: e.currentTarget, id: order.id })
                                }
                                sx={{
                                  borderRadius: 1.5,
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                                }}
                              >
                                <MoreVertIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid #f1f5f9', bgcolor: '#fff' }}>
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
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.8rem',
                  color: '#64748b',
                },
                '& .MuiTablePagination-select': {
                  fontSize: '0.8rem',
                },
              }}
            />
          </Box>
        </Card>
      </Container>

      {/* ── More Options Menu ──────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor?.element || null}
        open={Boolean(menuAnchor)}
        onClose={() => !statusChangeLoading && setMenuAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #f1f5f9',
            borderRadius: 2.5,
            boxShadow: '0 8px 30px rgba(15,23,42,0.1)',
            minWidth: 180,
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              borderRadius: 1.5,
              mx: 0.5,
              px: 1.5,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => menuAnchor && handleUpdateClick(menuAnchor.id)}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#0f172a' }} />
          </ListItemIcon>
          <ListItemText sx={{ '& span': { fontWeight: 500 } }}>Update</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => menuAnchor && handleStatusClick(menuAnchor.id)}
          disabled={statusChangeLoading}
        >
          <ListItemIcon>
            {statusChangeLoading ? (
              <CircularProgress size={16} />
            ) : (
              <CheckCircleIcon fontSize="small" sx={{ color: '#16a34a' }} />
            )}
          </ListItemIcon>
          <ListItemText sx={{ '& span': { fontWeight: 500 } }}>
            {statusChangeLoading ? 'Updating…' : 'Mark as Paid'}
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => menuAnchor && handleDeleteClick(menuAnchor.id)}
          sx={{ color: '#dc2626' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#dc2626' }} />
          </ListItemIcon>
          <ListItemText sx={{ '& span': { fontWeight: 500 } }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Delete Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteLoading && setDeleteDialog({ open: false })}
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #f1f5f9',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
            minWidth: 360,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            pb: 1,
            px: 3,
            pt: 3,
          }}
        >
          Delete Sales Order?
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
            This action is permanent and cannot be reversed. The order and all associated data
            will be removed.
          </Typography>
          {deleteError && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {deleteError}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false })}
            disabled={deleteLoading}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
              '&:disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#fff',
              bgcolor: '#dc2626',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#b91c1c', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#fca5a5', color: '#fff' },
            }}
            variant="contained"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Status Update Dialog ─────────────────────────────────── */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            pb: 1,
            px: 3,
            pt: 3,
          }}
        >
          Mark Order as Paid
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to mark this sales order as paid? This will finalize the
            transaction.
          </Typography>
          {statusChangeError && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {statusChangeError}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setStatusDialog({ open: false })}
            disabled={statusChangeLoading}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
              '&:disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={statusChangeLoading}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#fff',
              bgcolor: '#16a34a',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#15803d', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#86efac', color: '#fff' },
            }}
          >
            {statusChangeLoading ? 'Updating...' : 'Mark as Paid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Update Dialog ─────────────────────────────────────────── */}
      <Dialog open={updateDialog.open} onClose={() => setUpdateDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            pb: 1,
            px: 3,
            pt: 3,
          }}
        >
          Edit Sales Order
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Open the sales order editor to view and update order details, line items, and customer information.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setUpdateDialog({ open: false })}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleNavigateToEdit}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.85,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#fff',
              bgcolor: '#0f172a',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
            }}
          >
            Open Editor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}