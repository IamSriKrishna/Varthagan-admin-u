'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Plus,
  Search,
  ClipboardList,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Package,
  Eye,
  PencilLine,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import { showToastMessage } from '@/utils/toastUtil';

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
  line_items?: any[];
  expected_shipment_date?: string;
}

const STATUS_TABS = ['All', 'Draft', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  paid: {
    color: '#15803d',
    bg: '#f0fdf6',
    border: '#6ddc98',
    label: 'Paid',
  },
  confirmed: {
    color: '#15803d',
    bg: '#f0fdf6',
    border: '#6ddc98',
    label: 'Confirmed',
  },
  draft: {
    color: '#b45309',
    bg: '#fff8eb',
    border: '#fcd34d',
    label: 'Draft',
  },
  cancelled: {
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    label: 'Cancelled',
  },
  completed: {
    color: '#4f63d2',
    bg: '#f0f4ff',
    border: '#c7d2fe',
    label: 'Completed',
  },
};

function StatusPill({ status }: { status?: string }) {
  const key = status || 'draft';
  const cfg =
    STATUS_CONFIG[key] || {
      color: '#6b7280',
      bg: '#f9fafb',
      border: '#e5e7eb',
      label: key,
    };

  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    />
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
        border: '1px solid #eeeff5',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}22`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 0.75,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: '#1a1d2e',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              bgcolor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              border: `1px solid ${color}22`,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const { getSalesOrders, deleteSalesOrder, updateSalesOrderStatus, loading } =
    useSalesOrder();

  const [salesOrders, setSalesOrders] = useState<SalesOrderRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    id: string;
  } | null>(null);

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

  const filteredOrders = salesOrders.filter((o) => {
    if (activeTab === 'All') return true;
    return (o.status || 'draft').toLowerCase() === activeTab.toLowerCase();
  });

  const totalAmount = salesOrders.reduce(
    (sum, o) => sum + (o.total_amount || o.total || 0),
    0
  );

  const totalLineItemsCount = salesOrders.reduce((sum, o) => {
    return sum + (Array.isArray(o.line_items) ? o.line_items.length : 0);
  }, 0);

  const confirmedCount = salesOrders.filter((o) => o.status === 'paid').length;
  const draftCount = salesOrders.filter((o) => !o.status || o.status === 'draft').length;

  const handleDeleteClick = (id: string) => {
    setDeleteError(null);
    setDeleteDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteSalesOrder(deleteDialog.id);
      showToastMessage('Sales order deleted successfully', 'success');
      setDeleteDialog({ open: false });
      await loadSalesOrders();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete sales order';
      setDeleteError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusClick = (id: string) => {
    setStatusChangeError(null);
    setStatusDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleStatusChange = async () => {
    if (!statusDialog.id) return;

    try {
      setStatusChangeLoading(true);
      setStatusChangeError(null);
      await updateSalesOrderStatus(statusDialog.id, { status: 'paid' as any });
      showToastMessage('Sales order marked as paid successfully', 'success');
      setStatusDialog({ open: false });
      await loadSalesOrders();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update sales order status';
      setStatusChangeError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const handleUpdateClick = (id: string) => {
    setUpdateDialog({ open: true, id });
    setMenuAnchor(null);
  };

  const handleNavigateToEdit = () => {
    if (!updateDialog.id) return;
    router.push(`/sales-orders/sales-order/${updateDialog.id}`);
    setUpdateDialog({ open: false });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f0f0f5',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <ClipboardList size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#1a1d2e',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.4px',
                  lineHeight: 1.15,
                }}
              >
                Sales Orders
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalLineItemsCount} items across {salesOrders.length} order
                {salesOrders.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => router.push('/sales-orders/sales-order/new')}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '11px',
              background:
                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            New Order
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <StatCard
          label="Total Items"
          value={totalLineItemsCount}
          icon={<Package size={22} />}
          color="#4f63d2"
          bg="#f0f4ff"
        />

        <StatCard
          label="Confirmed"
          value={confirmedCount}
          icon={<CheckCircle2 size={22} />}
          color="#15803d"
          bg="#f0fdf6"
        />

        <StatCard
          label="Drafts"
          value={draftCount}
          icon={<Clock3 size={22} />}
          color="#d97706"
          bg="#fffbeb"
        />

        <StatCard
          label="Revenue"
          value={`₹${totalAmount.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}`}
          icon={<TrendingUp size={22} />}
          color="#0ea5e9"
          bg="#e0f2fe"
        />
      </Box>

      {statusChangeError && (
        <Alert
          severity="error"
          onClose={() => setStatusChangeError(null)}
          sx={{
            mx: 3,
            mt: 2.5,
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {statusChangeError}
        </Alert>
      )}

      {/* Toolbar */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: '14px 14px 0 0',
          border: '1px solid #eeeff5',
          borderBottom: 'none',
          bgcolor: '#ffffff',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab}
              size="small"
              onClick={() => setActiveTab(tab)}
              sx={{
                borderRadius: '9px',
                px: 1.75,
                py: 0.65,
                fontSize: '0.8rem',
                fontWeight: activeTab === tab ? 700 : 600,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'none',
                color: activeTab === tab ? '#4f63d2' : '#9ca3af',
                bgcolor: activeTab === tab ? '#f0f4ff' : 'transparent',
                border:
                  activeTab === tab
                    ? '1px solid #c7d2fe'
                    : '1px solid transparent',
                '&:hover': {
                  bgcolor: activeTab === tab ? '#e0e7ff' : '#f8fbff',
                },
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>

        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 380 }}>
          <TextField
            placeholder="Search orders…"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: '10px',
                bgcolor: '#f8f9fc',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8125rem',
                '& fieldset': { borderColor: '#e8eaf0' },
                '&:hover fieldset': { borderColor: '#c7d2fe' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: '0 0 14px 14px',
          border: '1px solid #eeeff5',
          borderTop: 'none',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        <TableContainer sx={{ bgcolor: '#fff' }}>
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={32} sx={{ color: '#6366f1' }} />
              <Typography
                sx={{
                  mt: 2,
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loading orders…
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  {[
                    'SO Number',
                    'Expected Shipment Date',
                    'Items',
                    'Amount',
                    'Status',
                    'Actions',
                  ].map((head) => (
                    <TableCell
                      key={head}
                      align={
                        ['Items', 'Amount'].includes(head)
                          ? 'right'
                          : head === 'Actions'
                            ? 'center'
                            : 'left'
                      }
                      sx={{
                        bgcolor: '#f8fbff',
                        color: '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: "'DM Sans', sans-serif",
                        borderBottom: '1px solid #eeeff5',
                        py: 1.5,
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8, border: 0 }}>
                      <Package size={42} color="#d1d5db" />
                      <Typography
                        sx={{
                          mt: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#9ca3af',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                        '&:hover': {
                          bgcolor: '#f8fbff',
                          '& .row-actions': { opacity: 1 },
                        },
                        '& td': {
                          borderBottom: '1px solid #f5f5fa',
                          py: 1.5,
                        },
                        '&:last-child td': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '9px',
                              bgcolor: '#f0f4ff',
                              color: '#4f63d2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #c7d2fe',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {String(idx + 1).padStart(2, '0')}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: '#1a1d2e',
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {order.sales_order_no ||
                                `SO-${order.id.slice(-6).toUpperCase()}`}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                color: '#9ca3af',
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {order.reference_no || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {order.expected_shipment_date
                            ? new Date(order.expected_shipment_date).toLocaleDateString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )
                            : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Chip
                          label={order.line_items_count || 0}
                          size="small"
                          sx={{
                            height: 24,
                            minWidth: 32,
                            fontWeight: 700,
                            fontFamily: "'DM Mono', monospace",
                            bgcolor: '#f0f4ff',
                            color: '#4f63d2',
                            border: '1px solid #c7d2fe',
                            borderRadius: '7px',
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: '#1a1d2e',
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          ₹
                          {(order.total_amount || order.total || 0).toLocaleString(
                            'en-IN',
                            {
                              maximumFractionDigits: 0,
                            }
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <StatusPill status={order.status} />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          className="row-actions"
                          direction="row"
                          justifyContent="center"
                          spacing={0.5}
                          sx={{
                            opacity: 0,
                            transition: 'opacity 0.15s ease',
                          }}
                        >
                          <Tooltip title="View" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/sales-orders/sales-order/${encodeURIComponent(
                                    order.id
                                  )}?mode=view`
                                );
                              }}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                color: '#4f63d2',
                                bgcolor: '#f0f4ff',
                                '&:hover': {
                                  bgcolor: '#e0e7ff',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/sales-orders/sales-order/${encodeURIComponent(
                                    order.id
                                  )}?mode=edit`
                                );
                              }}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                color: '#059669',
                                bgcolor: '#ecfdf5',
                                '&:hover': {
                                  bgcolor: '#d1fae5',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <PencilLine size={14} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAnchor({
                                  element: e.currentTarget,
                                  id: order.id,
                                });
                              }}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                color: '#7c3aed',
                                bgcolor: '#f3eeff',
                                '&:hover': {
                                  bgcolor: '#e9d8fd',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <MoreVertical size={14} />
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

        <Box sx={{ borderTop: '1px solid #eeeff5', bgcolor: '#ffffff' }}>
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
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                {
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  fontFamily: "'DM Sans', sans-serif",
                },
              '& .MuiTablePagination-select': {
                fontSize: '0.8rem',
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor?.element || null}
        open={Boolean(menuAnchor)}
        onClose={() => !statusChangeLoading && setMenuAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #eeeff5',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(15,23,42,0.1)',
            minWidth: 180,
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              borderRadius: '8px',
              mx: 0.5,
              px: 1.5,
              py: 1,
              fontFamily: "'DM Sans', sans-serif",
            },
          },
        }}
      >
        <MenuItem onClick={() => menuAnchor && handleUpdateClick(menuAnchor.id)}>
          <ListItemIcon>
            <PencilLine size={16} color="#4f63d2" />
          </ListItemIcon>
          <ListItemText>Update</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => menuAnchor && handleStatusClick(menuAnchor.id)}
          disabled={statusChangeLoading}
        >
          <ListItemIcon>
            {statusChangeLoading ? (
              <CircularProgress size={16} />
            ) : (
              <CheckCircle2 size={16} color="#15803d" />
            )}
          </ListItemIcon>
          <ListItemText>
            {statusChangeLoading ? 'Updating…' : 'Mark as Paid'}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => menuAnchor && handleDeleteClick(menuAnchor.id)}
          sx={{ color: '#ef4444' }}
        >
          <ListItemIcon>
            <Trash2 size={16} color="#ef4444" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteLoading && setDeleteDialog({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Delete Sales Order
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              p: 2,
              bgcolor: '#fff5f5',
              border: '1px solid #fee2e2',
              borderRadius: '10px',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Trash2 size={16} color="#ef4444" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#991b1b',
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 0.5,
                }}
              >
                This action cannot be undone
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: '#b91c1c',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.5,
                }}
              >
                The sales order and all associated data will be permanently removed.
              </Typography>
            </Box>
          </Box>

          {deleteError && (
            <Alert severity="error" sx={{ borderRadius: '10px' }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false })}
            disabled={deleteLoading}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Keep Order
          </Button>

          <Button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            variant="contained"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            }}
          >
            {deleteLoading ? 'Deleting…' : 'Delete Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e8eaf0',
            boxShadow: '0 20px 60px rgba(79,99,210,0.15)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
            borderRadius: '16px 16px 0 0',
          }}
        />

        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Mark Order as Paid
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to mark this sales order as paid? This will finalize
            the transaction.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setStatusDialog({ open: false })}
            disabled={statusChangeLoading}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleStatusChange}
            disabled={statusChangeLoading}
            variant="contained"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            {statusChangeLoading ? 'Updating…' : 'Mark as Paid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Dialog */}
      <Dialog
        open={updateDialog.open}
        onClose={() => setUpdateDialog({ open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e8eaf0',
            boxShadow: '0 20px 60px rgba(79,99,210,0.15)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
            borderRadius: '16px 16px 0 0',
          }}
        />

        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Edit Sales Order
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Open the sales order editor to update order details, line items, and
            customer information.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setUpdateDialog({ open: false })}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleNavigateToEdit}
            variant="contained"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
            }}
          >
            Open Editor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}