'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FileX,
  Filter,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { useDebounce } from '@/hooks/useDebounce';
import { showToastMessage } from '@/utils/toastUtil';
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import HighlightedCell from '@/lib/BBTable/HighlightedCell';
import dayjs from 'dayjs';

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: '#e8edff', color: '#3d52c7' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fff3cd', color: '#92400e' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fee2e2', color: '#991b1b' },
  { bg: '#e0f2fe', color: '#0369a1' },
];

function getAvatarStyle(name: string) {
  const idx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    bg: '#f8f9fc',
    color: '#6b7280',
    border: '#e5e7eb',
    icon: <ClipboardList size={11} />,
  },
  sent: {
    label: 'Sent',
    bg: '#eff6ff',
    color: '#0369a1',
    border: '#bae6fd',
    icon: <CheckCircle2 size={11} />,
  },
  partially_received: {
    label: 'Partially Received',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fcd34d',
    icon: <Package size={11} />,
  },
  received: {
    label: 'Received',
    bg: '#f0fdf4',
    color: '#065f46',
    border: '#bbf7d0',
    icon: <CheckCircle2 size={11} />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#fff5f5',
    color: '#991b1b',
    border: '#fee2e2',
    icon: <XCircle size={11} />,
  },
};

function StatusChip({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status || 'draft'] || STATUS_CONFIG.draft;
  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {cfg.icon}
          {cfg.label}
        </Box>
      }
      size="small"
      sx={{
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        height: 22,
        borderRadius: '6px',
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: any; accent: string; sub?: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #eeeff5',
        borderRadius: '14px',
        p: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '11px',
          bgcolor: accent + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        <Icon size={18} color={accent} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px', lineHeight: 1 }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

const PurchaseOrderList: React.FC = () => {
  const router = useRouter();
  const { purchaseOrders, totalPOs, loading, getPurchaseOrders, searchPurchaseOrders, deletePurchaseOrder, updatePurchaseOrderStatus } = usePurchaseOrder();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusDialogError, setStatusDialogError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchPurchaseOrders(debouncedSearch);
    } else {
      getPurchaseOrders(page + 1, rowsPerPage);
    }
  }, [debouncedSearch, page, rowsPerPage, getPurchaseOrders, searchPurchaseOrders]);

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

  const handleStatusUpdate = (po: any) => {
    setSelectedPO(po);
    setNewStatus(po.status || 'draft');
    setStatusDialogError(null);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (selectedPO && newStatus && newStatus !== selectedPO.status) {
      setStatusUpdateLoading(true);
      setStatusDialogError(null);
      try {
        await updatePurchaseOrderStatus(selectedPO.id, newStatus);
        showToastMessage(
          `Purchase order status updated to ${newStatus.replace('_', ' ').toUpperCase()} successfully`,
          'success'
        );
        setStatusDialogOpen(false);
        setSelectedPO(null);
        setNewStatus('');
        setStatusDialogError(null);
        // Refresh the list
        setTimeout(() => getPurchaseOrders(page + 1, rowsPerPage), 500);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update purchase order status';
        setStatusDialogError(errorMessage);
        showToastMessage(errorMessage, 'error');
        console.error('Status update error:', err);
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  const filteredPOs = statusFilter === 'all'
    ? purchaseOrders
    : purchaseOrders.filter((po) => po.status === statusFilter);

  const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ITableColumn<any>[] = [
    {
      key: 'purchase_order_no',
      label: 'PO Number',
      render: (row) => {
        const vendorName = row.vendor?.display_name || row.vendor?.company_name || 'Unknown Vendor';
        const style = getAvatarStyle(vendorName);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => router.push(`/purchase-orders/purchase-order/${row.id}`)}>
            <Avatar sx={{ width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700, bgcolor: style.bg, color: style.color, fontFamily: "'DM Sans', sans-serif", border: '1.5px solid', borderColor: style.color + '33', flexShrink: 0 }}>
              {getInitials(vendorName)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4f63d2', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3, '&:hover': { textDecoration: 'underline' } }}>
                <HighlightedCell value={row.purchase_order_no || '—'} search={searchQuery} />
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", mt: 0.1 }}>
                {dayjs(row.date).format('DD MMM YYYY')}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (row) => {
        const name = row.vendor?.display_name || row.vendor?.company_name || '—';
        return (
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif" }}>
            <HighlightedCell value={name} search={searchQuery} />
          </Typography>
        );
      },
    },
    {
      key: 'reference_no',
      label: 'Reference',
      render: (row) => (
        <Typography sx={{ fontSize: '0.8rem', fontFamily: "'DM Mono', monospace", color: row.reference_no ? '#374151' : '#d1d5db', letterSpacing: '0.02em' }}>
          {row.reference_no || '—'}
        </Typography>
      ),
    },
    {
      key: 'delivery_address_type',
      label: 'Deliver To',
      render: (row) => {
        const dest = row.delivery_address_type === 'organization'
          ? row.organization_name
          : row.customer?.display_name;
        return (
          <Typography sx={{ fontSize: '0.8rem', color: dest ? '#374151' : '#d1d5db', fontFamily: "'DM Sans', sans-serif" }}>
            {dest || '—'}
          </Typography>
        );
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <Chip
          label={`₹${(row.total || 0).toLocaleString('en-IN')}`}
          size="small"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            height: 22,
            borderRadius: '6px',
            bgcolor: '#f0fdf4',
            color: '#065f46',
            border: '1px solid #bbf7d0',
          }}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: 'action' as any,
      label: '',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.15s ease', '.MuiTableRow-root:hover &': { opacity: 1 } }}>
          {row.status === 'draft' && (
            <Tooltip title="Update Status" arrow>
              <IconButton size="small" onClick={() => handleStatusUpdate(row)}
                sx={{ width: 30, height: 30, borderRadius: '8px', color: '#7c3aed', bgcolor: '#ede9fe', '&:hover': { bgcolor: '#ddd6fe', transform: 'scale(1.05)' }, transition: 'all 0.15s ease' }}>
                <Package size={14} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View details" arrow>
            <IconButton size="small" onClick={() => router.push(`/purchase-orders/purchase-order/${row.id}`)}
              sx={{ width: 30, height: 30, borderRadius: '8px', color: '#0369a1', bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd', transform: 'scale(1.05)' }, transition: 'all 0.15s ease' }}>
              <Eye size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <IconButton size="small" onClick={() => router.push(`/purchase-orders/purchase-order/${row.id}`)}
              sx={{ width: 30, height: 30, borderRadius: '8px', color: '#4f63d2', bgcolor: '#f0f4ff', '&:hover': { bgcolor: '#e0e7ff', transform: 'scale(1.05)' }, transition: 'all 0.15s ease' }}>
              <Edit size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton size="small" onClick={() => { setSelectedId(row.id); setDeleteConfirmOpen(true); }}
              sx={{ width: 30, height: 30, borderRadius: '8px', color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2', transform: 'scale(1.05)' }, transition: 'all 0.15s ease' }}>
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fc' }}>
      <BBLoader enabled={loading} />

      {/* ── Page header ────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, bgcolor: '#ffffff', borderBottom: '1px solid #f0f0f5' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: '13px', background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(79,99,210,0.3)', flexShrink: 0 }}>
              <ShoppingCart size={22} color="white" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.4px', lineHeight: 1.15 }}>
                Purchase Orders
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                {totalPOs} order{totalPOs !== 1 ? 's' : ''} total
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            onClick={() => router.push('/purchase-orders/purchase-order/new')}
            startIcon={<Plus size={16} />}
            sx={{
              px: 2.5, py: 1.1, borderRadius: '11px',
              background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(79,99,210,0.35)',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)', boxShadow: '0 6px 20px rgba(79,99,210,0.45)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s ease',
            }}
          >
            New PO
          </BBButton>
        </Stack>
      </Box>

      <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
        {/* ── Stat cards ───────────────────────────────────────────────── */}
        {purchaseOrders.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Total Orders" value={totalPOs} icon={ClipboardList} accent="#4f63d2" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Draft" value={purchaseOrders.filter((po) => po.status === 'draft').length} icon={Package} accent="#6b7280" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Received" value={purchaseOrders.filter((po) => po.status === 'received').length} icon={CheckCircle2} accent="#065f46" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Total Value" value={`₹${totalValue.toLocaleString('en-IN')}`} icon={TrendingUp} accent="#7c3aed" sub="All orders" />
            </Grid>
          </Grid>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <Box
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '14px 14px 0 0',
            border: '1px solid #eeeff5',
            borderBottom: 'none',
            bgcolor: '#ffffff',
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 380 }}>
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Search size={15} />
            </Box>
            <BBInputBase
              label=""
              name="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Search by PO number, vendor, or reference…"
              sx={{ pl: 4.5 }}
            />
          </Box>

          {/* Status filter */}
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                bgcolor: '#fafbff',
                '& fieldset': { borderColor: '#e8eaf0' },
                '&:hover fieldset': { borderColor: '#c7d2fe' },
                '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: '1.5px' },
              },
              '& .MuiSelect-select': { fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', py: '8.5px' },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  <Filter size={14} />
                </Box>
              ),
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>All Status</MenuItem>
            <MenuItem value="draft" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>Draft</MenuItem>
            <MenuItem value="sent" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>Sent</MenuItem>
            <MenuItem value="partially_received" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>Partially Received</MenuItem>
            <MenuItem value="received" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>Received</MenuItem>
            <MenuItem value="cancelled" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}>Cancelled</MenuItem>
          </TextField>

          {/* Active filter chip */}
          {(searchQuery || statusFilter !== 'all') && (
            <Chip
              label={`${filteredPOs.length} result${filteredPOs.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", bgcolor: '#f0f4ff', color: '#4f63d2', border: '1px solid #c7d2fe', borderRadius: '8px' }}
            />
          )}
        </Box>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: '0 0 14px 14px',
            border: '1px solid #eeeff5',
            borderTop: 'none',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            mb: 3,
          }}
        >
          {filteredPOs.length === 0 && !loading ? (
            /* ── Empty state ── */
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 9, gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(79,99,210,0.25)' }}>
                <FileX size={26} color="white" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
                  {searchQuery || statusFilter !== 'all' ? 'No matching orders' : 'No purchase orders yet'}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Create your first purchase order to get started'}
                </Typography>
              </Box>
              {!searchQuery && statusFilter === 'all' && (
                <BBButton
                  variant="contained"
                  onClick={() => router.push('/purchase-orders/purchase-order/new')}
                  startIcon={<Plus size={15} />}
                  sx={{ mt: 1, borderRadius: '10px', textTransform: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)', boxShadow: '0 4px 14px rgba(79,99,210,0.3)', '&:hover': { background: 'linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)' } }}
                >
                  New Purchase Order
                </BBButton>
              )}
            </Box>
          ) : (
            <BBTable
              columns={columns}
              data={filteredPOs}
              pagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalPOs}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => { setRowsPerPage(newRowsPerPage); setPage(0); }}
              sx={{
                '& .MuiTableHead-root .MuiTableCell-root': { bgcolor: '#fafbff', color: '#6b7280', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif", borderBottom: '1px solid #eeeff5', py: 1.5 },
                '& .MuiTableBody-root .MuiTableRow-root': { cursor: 'pointer', transition: 'background 0.12s ease', '&:hover': { bgcolor: '#fafbff' } },
                '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #f5f5fa', py: 1.5, fontFamily: "'DM Sans', sans-serif" },
              }}
            />
          )}
        </Box>
      </Box>

      {/* ── Delete dialog ─────────────────────────────────────────────── */}
      <BBDialog
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setSelectedId(null); }}
        title="Delete Purchase Order"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, bgcolor: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '10px', mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b', fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
                  This action cannot be undone
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#b91c1c', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                  This purchase order and all associated line items, attachments, and approval history will be permanently removed.
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
              Are you sure you want to permanently delete this purchase order?
            </Typography>
          </Box>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Order"
        cancelText="Keep Order"
        confirmColor="error"
      />

      {/* ── Status Update Dialog ─────────────────────────────────────── */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedPO(null);
          setNewStatus('');
          setStatusDialogError(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            border: '1px solid #eeeff5',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            color: '#1a1d2e',
            borderBottom: '1px solid #eeeff5',
            pb: 2,
            pt: 2.5,
            px: 2.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#f0f4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f63d2',
            }}
          >
            <Package size={18} />
          </Box>
          Update Purchase Order Status
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 2.5 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Error Alert */}
            {statusDialogError && (
              <Box sx={{ p: 2, bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px' }}>
                <Stack direction="row" gap={1.5}>
                  <Box sx={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0 }}>
                    <FileX size={20} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
                      Error
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#b91c1c', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                      {statusDialogError}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {selectedPO && (
              <>
                <Box sx={{ p: 2, bgcolor: '#fafbff', border: '1px solid #e8eaf0', borderRadius: '10px' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    PO Number
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif" }}>
                    {selectedPO.purchase_order_no}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#fafbff', border: '1px solid #e8eaf0', borderRadius: '10px' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Current Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <StatusChip status={selectedPO.status} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
                      {dayjs(selectedPO.date).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif", mb: 1 }}>
                    Update Status To
                  </Typography>
                  <Select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      setStatusDialogError(null); // Clear error when user changes selection
                    }}
                    fullWidth
                    size="small"
                    disabled={statusUpdateLoading}
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-root': {
                        borderColor: '#e8eaf0',
                        '&:hover fieldset': { borderColor: '#c7d2fe' },
                        '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: '1.5px' },
                      },
                    }}
                  >
                    <MenuItem value="draft" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Draft</MenuItem>
                    <MenuItem value="sent" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Sent</MenuItem>
                    <MenuItem value="partially_received" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Partially Received</MenuItem>
                    <MenuItem value="received" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Received</MenuItem>
                    <MenuItem value="cancelled" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Cancelled</MenuItem>
                  </Select>
                </Box>

                {newStatus === 'received' && (
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                    <Stack direction="row" gap={1.5}>
                      <Box sx={{ width: 20, height: 20, color: '#065f46', flexShrink: 0 }}>
                        <CheckCircle2 size={20} />
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', color: '#065f46', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                        Marking as received will record this purchase order and update inventory stock levels accordingly.
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            justifyContent: 'flex-end',
            px: 2.5,
            py: 2,
            borderTop: '1px solid #eeeff5',
          }}
        >
          <BBButton
            variant="outlined"
            onClick={() => {
              setStatusDialogOpen(false);
              setSelectedPO(null);
              setNewStatus('');
              setStatusDialogError(null);
            }}
            disabled={statusUpdateLoading}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Cancel
          </BBButton>
          <BBButton
            variant="contained"
            onClick={handleStatusUpdateConfirm}
            disabled={statusUpdateLoading || newStatus === selectedPO?.status}
            loading={statusUpdateLoading}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              background: newStatus === 'received' ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : undefined,
              '&:hover': newStatus === 'received' ? { background: 'linear-gradient(135deg, #064e3b 0%, #036346 100%)' } : undefined,
            }}
          >
            {statusUpdateLoading ? 'Updating...' : 'Update Status'}
          </BBButton>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderList;