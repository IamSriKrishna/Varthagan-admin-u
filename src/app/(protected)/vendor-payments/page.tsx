'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  Fade,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowUpRight,
  Banknote,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { showToastMessage } from '@/utils/toastUtil';
import { BBButton, BBDialog, BBInputBase, BBTable, BBTitle } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import HighlightedCell from '@/lib/BBTable/HighlightedCell';
import dayjs from 'dayjs';
import { vendorPaymentService } from '@/lib/api/vendorPaymentService';
import { purchaseOrderService } from '@/lib/api/purchaseOrderService';
import { VendorPayment } from '@/models/vendor-payment.model';
import { PurchaseOrder } from '@/models/purchaseOrder.model';

// ── Avatar Palette ─────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: '#f0f4ff', color: '#4f63d2' },
  { bg: '#FDF2F8', color: '#C026D3' },
  { bg: '#ECFDF5', color: '#059669' },
  { bg: '#FFFBEB', color: '#D97706' },
  { bg: '#F0F9FF', color: '#0284C7' },
  { bg: '#FFF1F2', color: '#E11D48' },
  { bg: '#F5F3FF', color: '#7C3AED' },
];

function getAvatarStyle(name: string) {
  const idx = (name || '')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ── Status Config ──────────────────────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; dot: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    bg: '#FFF7ED',
    color: '#C2410C',
    dot: '#F97316',
    icon: <Clock size={11} strokeWidth={2.5} />,
  },
  partial: {
    label: 'Partial',
    bg: '#FFFBEB',
    color: '#B45309',
    dot: '#F59E0B',
    icon: <DollarSign size={11} strokeWidth={2.5} />,
  },
  completed: {
    label: 'Completed',
    bg: '#F0FDF4',
    color: '#15803D',
    dot: '#22C55E',
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
};

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down';
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: '20px 24px',
        border: '1px solid #eeeff5',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        flex: 1,
        minWidth: 0,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#9ca3af',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              mb: 0.75,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#1a1d2e',
              lineHeight: 1.1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {value}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
            {trend === 'up' ? (
              <TrendingUp size={12} color="#22C55E" />
            ) : trend === 'down' ? (
              <TrendingDown size={12} color="#EF4444" />
            ) : null}
            <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>{sub}</Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VendorPaymentsPage() {
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openRecordPaymentDialog, setOpenRecordPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<VendorPayment | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poLoading, setPoLoading] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vendorPaymentService.getVendorPayments(page + 1, rowsPerPage);
      if (response.success || response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      } else {
        showToastMessage('Failed to fetch vendor payments', 'error');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch vendor payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setPoLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders(1, 100);
      setPurchaseOrders(response.purchase_orders || []);
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch purchase orders', 'error');
    } finally {
      setPoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (openCreateDialog) fetchPurchaseOrders();
  }, [openCreateDialog, fetchPurchaseOrders]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleRecordPayment = (paymentId: number) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) { setSelectedPayment(payment); setOpenRecordPaymentDialog(true); }
  };

  const handleRecordPaymentSubmit = async (paidAmount: number) => {
    if (!selectedPayment) return;
    try {
      const response = await vendorPaymentService.recordPayment(selectedPayment.id, {
        paid_amount: paidAmount,
        payment_mode: selectedPayment.payment_mode,
        reference_number: '',
        notes: '',
      });
      if (response.success || response.data) {
        showToastMessage('Payment recorded successfully', 'success');
        setOpenRecordPaymentDialog(false);
        setSelectedPayment(null);
        fetchPayments();
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to record payment', 'error');
    }
  };

  // Derived stats
  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + (p.paid_amount || 0), 0);
  const totalRemaining = payments.reduce((s, p) => s + (p.remaining_amount || 0), 0);
  const completedCount = payments.filter((p) => p.payment_status === 'completed').length;

  // Group payments by purchase_order_id
  const groupPaymentsByPO = (): { [key: string]: VendorPayment[] } => {
    const grouped: { [key: string]: VendorPayment[] } = {};
    payments.forEach((payment) => {
      const poId = payment.purchase_order_id;
      if (!grouped[poId]) grouped[poId] = [];
      grouped[poId].push(payment);
    });
    return grouped;
  };

  const groupedPayments = groupPaymentsByPO();
  const groupedPaymentKeys = Object.keys(groupedPayments);

  // Get the first (latest) payment for each group to display in the main row
  const displayPayments = groupedPaymentKeys.map((poId) => {
    const poPayments = groupedPayments[poId].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return {
      ...poPayments[0],
      _groupSize: poPayments.length,
      _allPayments: poPayments,
    };
  });

  const columns: ITableColumn<VendorPayment>[] = [
    {
      key: 'action' as any,
      label: '',
      render: (row: any) => (
        row._groupSize > 1 ? (
          <IconButton
            size="small"
            onClick={() => {
              const poId = row.purchase_order_id;
              const newExpanded = new Set(expandedPOs);
              if (newExpanded.has(poId)) {
                newExpanded.delete(poId);
              } else {
                newExpanded.add(poId);
              }
              setExpandedPOs(newExpanded);
            }}
            sx={{
              color: '#4f63d2',
              width: 30,
              height: 30,
              transition: 'transform 0.2s',
              transform: expandedPOs.has(row.purchase_order_id) ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown size={16} />
          </IconButton>
        ) : null
      ),
    },
    {
      key: 'payment_number',
      label: 'Payment #',
      render: (row: any) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#4f63d2',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.02em',
            }}
          >
            <HighlightedCell value={row.payment_number} search={debouncedSearch} />
          </Typography>
          {row._groupSize > 1 && (
            <Chip
              label={`+${row._groupSize - 1}`}
              size="small"
              sx={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: '#f0f4ff',
                color: '#4f63d2',
                border: '1px solid #c7d2fe',
                height: 18,
              }}
            />
          )}
        </Stack>
      ),
    },
    {
      key: 'vendor_id',
      label: 'Vendor',
      render: (row) => {
        const name = row.vendor?.display_name || 'Unknown';
        const style = getAvatarStyle(name);
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                backgroundColor: style.bg,
                color: style.color,
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                border: `1.5px solid ${style.color}22`,
              }}
            >
              {getInitials(name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e' }}>
                {name}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>
                {row.purchase_order?.purchase_order_no || '—'}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      key: 'amount',
      label: 'Total Amount',
      render: (row) => (
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Mono', monospace" }}>
          ₹{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      render: (row) => {
        const pct = row.amount ? Math.min(100, Math.round((row.paid_amount / row.amount) * 100)) : 0;
        return (
          <Box sx={{ minWidth: 120 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#15803D', fontFamily: "'DM Mono', monospace" }}>
                ₹{row.paid_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>{pct}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#eeeff5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: pct === 100 ? '#22C55E' : 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      key: 'remaining_amount',
      label: 'Remaining',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 700,
            color: row.remaining_amount > 0 ? '#DC2626' : '#15803D',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {row.remaining_amount > 0 ? '−' : ''}₹{row.remaining_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (row) => {
        const cfg = PAYMENT_STATUS_CONFIG[row.payment_status] || PAYMENT_STATUS_CONFIG.pending;
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              px: 1.5,
              py: '4px',
              borderRadius: '20px',
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.dot}33`,
            }}
          >
            <Box
              sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0 }}
            />
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: cfg.color, lineHeight: 1 }}>
              {cfg.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: 'payment_date',
      label: 'Date',
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
            {dayjs(row.payment_date).format('DD MMM YYYY')}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>
            {dayjs(row.payment_date).format('ddd')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'action',
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details" placement="top">
            <IconButton
              size="small"
              onClick={() => router.push(`/vendor-payments/${row.id}`)}
              sx={{
                color: '#6b7280',
                border: '1px solid #eeeff5',
                borderRadius: '8px',
                width: 30,
                height: 30,
                '&:hover': { backgroundColor: '#f8f9fc', borderColor: '#CBD5E1', color: '#1a1d2e' },
              }}
            >
              <Eye size={14} />
            </IconButton>
          </Tooltip>
          {row.payment_status !== 'completed' && (
            <Tooltip title="Record Payment" placement="top">
              <IconButton
                size="small"
                onClick={() => handleRecordPayment(row.id)}
                sx={{
                  color: '#16A34A',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  width: 30,
                  height: 30,
                  backgroundColor: '#F0FDF4',
                  '&:hover': { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                }}
              >
                <DollarSign size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
        fontFamily: "'DM Sans', sans-serif",
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
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <Wallet size={22} color="white" />
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
                Vendor Payments
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Track and manage all vendor payment records
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={() => setOpenCreateDialog(true)}
            startIcon={<Plus size={16} strokeWidth={2.5} />}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Create Payment
          </Button>
        </Stack>
      </Box>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mx: 3, mt: 2.5, mb: 2.5 }}>
        <StatCard
          label="Total Billed"
          value={`₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${totalCount} payments`}
          icon={<Receipt size={20} />}
          iconBg="#f0f4ff"
          iconColor="#4f63d2"
        />
        <StatCard
          label="Total Paid"
          value={`₹${totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${completedCount} completed`}
          icon={<Wallet size={20} />}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
          trend="up"
        />
      
      </Stack>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: '12px 16px',
          mx: 3,
          mt: 0,
          mb: 0,
          border: '1px solid #eeeff5',
          borderBottom: 'none',
          borderRadius: '14px 14px 0 0',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              border: '1px solid #eeeff5',
              borderRadius: '10px',
              px: 1.5,
              py: '8px',
              backgroundColor: '#f8f9fc',
              '&:focus-within': { borderColor: '#A5B4FC', backgroundColor: '#FAFBFF' },
              transition: 'all 0.15s',
            }}
          >
            <Search size={15} color="#9ca3af" strokeWidth={2.5} />
            <input
              placeholder="Search by payment number, vendor..."
              value={filters.search}
              onChange={(e) => handleTypeChange('search', e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#1a1d2e',
                flex: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {filters.search && (
              <button
                onClick={() => handleTypeChange('search', '')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
              >
                <X size={13} />
              </button>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {['all', 'pending', 'partial', 'completed'].map((s) => {
              const cfg = s === 'all'
                ? { label: 'All', dot: '#6b7280', bg: '#eeeff5', active: '#334155' }
                : { ...PAYMENT_STATUS_CONFIG[s], label: PAYMENT_STATUS_CONFIG[s].label };
              const isActive = filters.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleTypeChange('status', s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isActive ? '#4f63d2' : '#eeeff5'}`,
                    backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                    color: isActive ? '#4f63d2' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  {s !== 'all' && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: (PAYMENT_STATUS_CONFIG[s] as any)?.dot || '#9ca3af',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  {cfg.label}
                </button>
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mx: 3,
          mb: 3,
          border: '1px solid #eeeff5',
          borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          '& .MuiTableHead-root': {
            backgroundColor: '#f8f9fc',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontSize: '11px',
            fontWeight: 700,
            color: '#6b7280',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            borderBottom: '1px solid #eeeff5',
            py: 1.75,
            fontFamily: "'DM Sans', sans-serif",
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            '&:hover': { backgroundColor: '#FAFBFF' },
            transition: 'background-color 0.12s',
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            borderBottom: '1px solid #f8f9fc',
            py: 1.75,
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      >
        {loading && (
          <LinearProgress
            sx={{
              height: 2,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              },
            }}
          />
        )}
        <BBTable
          columns={columns}
          data={displayPayments}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={groupedPaymentKeys.length}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
        />

        {/* ── Payment Timeline (Expanded rows) ─────────────────────────────────── */}
        {Array.from(expandedPOs).map((poId) => {
          const poPayments = groupedPayments[poId] || [];
          if (poPayments.length <= 1) return null;
          
          const sortedPayments = poPayments.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return (
            <Box
              key={`timeline-${poId}`}
              sx={{
                backgroundColor: '#f8f9fc',
                borderTop: '2px solid #eeeff5',
                p: 3,
              }}
            >
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', mb: 2.5 }}>
                Payment Timeline for {poPayments[0].purchase_order?.purchase_order_no || 'PO'}
              </Typography>

              <Stack spacing={0}>
                {sortedPayments.map((payment, idx) => {
                  const cfg = PAYMENT_STATUS_CONFIG[payment.payment_status] || PAYMENT_STATUS_CONFIG.pending;
                  const isLast = idx === sortedPayments.length - 1;

                  return (
                    <Stack key={payment.id} direction="row" spacing={2}>
                      {/* Timeline dot and line */}
                      <Stack sx={{ alignItems: 'center', mt: 0.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: cfg.bg,
                            border: `2px solid ${cfg.dot}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.dot }} />
                        </Box>
                        {!isLast && (
                          <Box
                            sx={{
                              width: 2,
                              height: 60,
                              backgroundColor: '#CBD5E1',
                              mt: -1,
                            }}
                          />
                        )}
                      </Stack>

                      {/* Payment details */}
                      <Stack sx={{ flex: 1, pb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1a1d2e' }}>
                              {payment.payment_number}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#6b7280', mt: 0.25 }}>
                              {dayjs(payment.created_at).format('DD MMM YYYY, hh:mm A')}
                            </Typography>
                          </Box>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.dot}33`,
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={3}
                          sx={{ mt: 1.5, p: 1.5, backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #eeeff5' }}
                        >
                          <Box>
                            <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Amount</Typography>
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Mono', monospace" }}>
                              ₹{payment.paid_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Mode</Typography>
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', textTransform: 'capitalize' }}>
                              {payment.payment_mode}
                            </Typography>
                          </Box>
                          {payment.reference_number && (
                            <Box>
                              <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Reference</Typography>
                              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Mono', monospace" }}>
                                {payment.reference_number}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Paper>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <CreateVendorPaymentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        purchaseOrders={purchaseOrders}
        loading={poLoading}
        payments={payments}
        onPaymentCreated={() => { setOpenCreateDialog(false); fetchPayments(); }}
      />
      <RecordPaymentDialog
        open={openRecordPaymentDialog}
        payment={selectedPayment}
        onClose={() => { setOpenRecordPaymentDialog(false); setSelectedPayment(null); }}
        onSubmit={handleRecordPaymentSubmit}
      />
    </Box>
  );
}

// ── Shared dialog sx ───────────────────────────────────────────────────────────

const dialogSx = {
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
    border: '1px solid #eeeff5',
  },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    '& fieldset': { borderColor: '#eeeff5' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    '&.Mui-focused': { color: '#4f63d2' },
  },
};

// ── Create Vendor Payment Dialog ──────────────────────────────────────────────

interface CreateVendorPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  onPaymentCreated: () => void;
  payments: VendorPayment[];
}

function CreateVendorPaymentDialog({ open, onClose, purchaseOrders, loading, payments, onPaymentCreated }: CreateVendorPaymentDialogProps) {
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    payment_mode: 'online' as 'cash' | 'online',
    amount: 0,
    payment_date: dayjs().format('YYYY-MM-DD'),
    reference_number: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate remaining balance for a PO
  const calculateRemainingBalance = (poId: string): number => {
    const poPayments = payments.filter((p) => p.purchase_order_id === poId);
    const totalPaid = poPayments.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
    const po = purchaseOrders.find((p) => p.id === poId);
    return po ? po.total - totalPaid : 0;
  };

  const handlePoChange = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    setSelectedPo(po || null);
    if (po) {
      const remainingBalance = calculateRemainingBalance(poId);
      setFormData((prev) => ({ ...prev, amount: remainingBalance }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const resetForm = () => {
    setSelectedPo(null);
    setFormData({ payment_mode: 'online', amount: 0, payment_date: dayjs().format('YYYY-MM-DD'), reference_number: '', notes: '' });
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async () => {
    if (!selectedPo) return showToastMessage('Please select a purchase order', 'error');
    if (formData.amount <= 0) return showToastMessage('Please enter a valid amount', 'error');
    const remainingBalance = calculateRemainingBalance(selectedPo.id);
    if (formData.amount > remainingBalance) return showToastMessage(`Payment amount cannot exceed remaining balance (₹${remainingBalance.toFixed(2)})`, 'error');
    setSubmitting(true);
    try {
      const response = await vendorPaymentService.createVendorPayment({
        purchase_order_id: selectedPo.id,
        vendor_id: selectedPo.vendor_id,
        payment_mode: formData.payment_mode,
        amount: formData.amount,
        payment_date: dayjs(formData.payment_date).toISOString(),
        reference_number: formData.reference_number,
        notes: formData.notes,
      });
      if (response.success || response.data) {
        showToastMessage('Vendor payment created successfully', 'success');
        onPaymentCreated();
        resetForm();
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to create vendor payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingBalance = selectedPo ? calculateRemainingBalance(selectedPo.id) : 0;
  const remaining = remainingBalance - formData.amount;
  const completionPct = remainingBalance > 0 ? Math.min(100, (formData.amount / remainingBalance) * 100) : 0;

  const predictedStatus =
    formData.amount <= 0 ? 'pending' :
    selectedPo && formData.amount >= remainingBalance ? 'completed' : 'partial';

  const statusCfg = PAYMENT_STATUS_CONFIG[predictedStatus];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogSx}>
      <DialogTitle
        sx={{
          px: 3, py: 2.5,
          borderBottom: '1px solid #eeeff5',
          fontWeight: 800,
          fontSize: '18px',
          color: '#1a1d2e',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #4f63d2, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="#fff" />
            </Box>
            Create Payment
          </Stack>
          <IconButton size="small" onClick={handleClose} sx={{ color: '#9ca3af' }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>

          {/* PO Select */}
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Purchase Order</InputLabel>
            <Select
              label="Purchase Order"
              value={selectedPo?.id || ''}
              onChange={(e) => handlePoChange(e.target.value)}
              disabled={loading}
            >
              {purchaseOrders.map((po) => (
                <MenuItem key={po.id} value={po.id} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                    <span>{po.purchase_order_no}</span>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>{po.vendor?.display_name}</span>
                      <span style={{ fontWeight: 700, color: '#1a1d2e' }}>₹{po.total.toLocaleString('en-IN')}</span>
                    </Stack>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* PO Summary + form */}
          {selectedPo && (
            <Fade in>
              <Stack spacing={2.5}>
                {/* PO Info */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F8FAFF 0%, #f0f4ff 100%)',
                    border: '1px solid #c7d2fe',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography sx={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Remaining Balance
                      </Typography>
                      <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>
                        ₹{calculateRemainingBalance(selectedPo.id).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#9ca3af', mt: 0.5 }}>
                        of ₹{selectedPo.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} PO Total
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '11px', color: '#9ca3af', mb: 0.5 }}>Payment Terms</Typography>
                      <Chip label={selectedPo.payment_terms} size="small" sx={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#f0f4ff', color: '#4f63d2', border: '1px solid #c7d2fe' }} />
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>Paying {completionPct.toFixed(0)}%</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={completionPct}
                      sx={{
                        height: 6, borderRadius: 3, backgroundColor: '#c7d2fe',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: completionPct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Mode Toggle */}
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Payment Mode
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {(['online', 'cash'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFormData((prev) => ({ ...prev, payment_mode: mode }))}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1.5px solid ${formData.payment_mode === mode ? '#4f63d2' : '#eeeff5'}`,
                          backgroundColor: formData.payment_mode === mode ? '#f0f4ff' : '#FAFAFA',
                          color: formData.payment_mode === mode ? '#4f63d2' : '#6b7280',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        {mode === 'online' ? <ArrowUpRight size={14} /> : <Banknote size={14} />}
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </Stack>
                </Box>

                <TextField
                  label="Payment Amount (₹)"
                  type="number"
                  fullWidth name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  inputProps={{ step: '0.01', min: '0', max: calculateRemainingBalance(selectedPo.id) }}
                  sx={fieldSx}
                />

                <TextField
                  label="Payment Date"
                  type="date"
                  fullWidth name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />

                <TextField
                  label="Reference / Transaction ID"
                  fullWidth name="reference_number"
                  placeholder="TXN-2026-00001"
                  value={formData.reference_number}
                  onChange={handleInputChange}
                  sx={fieldSx}
                />

                <TextField
                  label="Notes"
                  fullWidth multiline rows={2}
                  name="notes"
                  placeholder="Optional notes..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  sx={fieldSx}
                />

                {/* Status Preview */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.dot}44`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusCfg.dot }} />
                  <Typography sx={{ fontSize: '12px', color: statusCfg.color, fontWeight: 600 }}>
                    Payment will be marked as <strong>{statusCfg.label}</strong>
                  </Typography>
                </Box>
              </Stack>
            </Fade>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: '10px', px: 2.5, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                color: '#6b7280', border: '1px solid #eeeff5',
                '&:hover': { backgroundColor: '#f8f9fc' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedPo}
              sx={{
                borderRadius: '10px', px: 3, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #0284c7, #4f46e5)', boxShadow: '0 6px 18px rgba(79,70,229,0.4)' },
                '&:disabled': { opacity: 0.5, color: '#fff' },
              }}
            >
              {submitting ? 'Creating…' : 'Create Payment'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Record Payment Dialog ──────────────────────────────────────────────────────

interface RecordPaymentDialogProps {
  open: boolean;
  payment: VendorPayment | null;
  onClose: () => void;
  onSubmit: (paidAmount: number) => void;
}

function RecordPaymentDialog({ open, payment, onClose, onSubmit }: RecordPaymentDialogProps) {
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment) setPaidAmount(payment.remaining_amount.toString());
  }, [payment, open]);

  const handleSubmit = async () => {
    const amount = parseFloat(paidAmount);
    if (!paidAmount || amount <= 0) return showToastMessage('Please enter a valid amount', 'error');
    if (!payment || amount > payment.remaining_amount) return showToastMessage('Amount cannot exceed remaining balance', 'error');
    setLoading(true);
    try { await onSubmit(amount); } finally { setLoading(false); onClose(); }
  };

  if (!payment) return null;

  const remainder = payment.remaining_amount - (parseFloat(paidAmount) || 0);
  const pct = payment.remaining_amount > 0
    ? Math.min(100, ((parseFloat(paidAmount) || 0) / payment.remaining_amount) * 100)
    : 0;
  const vendorName = payment.vendor?.display_name || 'Unknown';
  const avatarStyle = getAvatarStyle(vendorName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={dialogSx}>
      <DialogTitle
        sx={{
          px: 3, py: 2.5,
          borderBottom: '1px solid #eeeff5',
          fontWeight: 800,
          fontSize: '18px',
          color: '#1a1d2e',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #16A34A, #4ADE80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#fff" />
            </Box>
            Record Payment
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: '#9ca3af' }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>

          {/* Vendor info */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, backgroundColor: '#f8f9fc', borderRadius: '12px', border: '1px solid #eeeff5' }}>
            <Avatar sx={{ width: 42, height: 42, backgroundColor: avatarStyle.bg, color: avatarStyle.color, fontSize: '14px', fontWeight: 700, border: `2px solid ${avatarStyle.color}22` }}>
              {getInitials(vendorName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1a1d2e' }}>{vendorName}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>{payment.payment_number}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>Outstanding</Typography>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#DC2626', fontFamily: "'DM Mono', monospace" }}>
                ₹{payment.remaining_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Stack>

          {/* Progress */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography sx={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                Paying {pct.toFixed(0)}%
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                ₹{Math.max(0, remainder).toFixed(2)} left after
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8, borderRadius: 4, backgroundColor: '#eeeff5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: pct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #16A34A, #4ADE80)',
                },
              }}
            />
          </Box>

          <TextField
            label="Amount to Pay (₹)"
            type="number"
            fullWidth
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            sx={fieldSx}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              onClick={onClose}
              sx={{
                borderRadius: '10px', px: 2.5, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                color: '#6b7280', border: '1px solid #eeeff5',
                '&:hover': { backgroundColor: '#f8f9fc' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: '10px', px: 3, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #15803D, #16A34A)', boxShadow: '0 6px 18px rgba(22,163,74,0.4)' },
                '&:disabled': { opacity: 0.5, color: '#fff' },
              }}
            >
              {loading ? 'Recording…' : 'Record Payment'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}