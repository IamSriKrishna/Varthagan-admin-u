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
import { customerPaymentService } from '@/lib/api/customerPaymentService';
import { salesOrderService } from '@/lib/api/salesOrderService';
import { CustomerPayment } from '@/models/customer-payment.model';
import { SalesOrderOutput } from '@/models/salesOrder.model';

// ── Avatar Palette ─────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: '#EEF2FF', color: '#4F46E5' },
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
        border: '1px solid #F1F5F9',
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
              color: '#94A3B8',
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
              color: '#0F172A',
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
            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>{sub}</Typography>
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

export default function CustomerPaymentsPage() {
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openRecordPaymentDialog, setOpenRecordPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CustomerPayment | null>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOutput[]>([]);
  const [soLoading, setSoLoading] = useState(false);
  const [expandedSOs, setExpandedSOs] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerPaymentService.getCustomerPayments(page + 1, rowsPerPage);
      if (response.success || response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      } else {
        showToastMessage('Failed to fetch customer payments', 'error');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch customer payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const fetchSalesOrders = useCallback(async () => {
    try {
      setSoLoading(true);
      const response = await salesOrderService.getSalesOrders(100, 0);
      setSalesOrders(response.data || []);
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch sales orders', 'error');
    } finally {
      setSoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (openCreateDialog) fetchSalesOrders();
  }, [openCreateDialog, fetchSalesOrders]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleRecordPayment = (paymentId: number) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) { setSelectedPayment(payment); setOpenRecordPaymentDialog(true); }
  };

  const handleRecordPaymentSubmit = async (receivedAmount: number) => {
    if (!selectedPayment) return;
    try {
      const response = await customerPaymentService.recordPayment(selectedPayment.id, {
        received_amount: receivedAmount,
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
  const totalReceived = payments.reduce((s, p) => s + (p.received_amount || 0), 0);
  const totalRemaining = payments.reduce((s, p) => s + (p.remaining_amount || 0), 0);
  const completedCount = payments.filter((p) => p.payment_status === 'completed').length;

  // Group payments by sales_order_id
  const groupPaymentsBySO = (): { [key: string]: CustomerPayment[] } => {
    const grouped: { [key: string]: CustomerPayment[] } = {};
    payments.forEach((payment) => {
      const soId = payment.sales_order_id;
      if (!grouped[soId]) grouped[soId] = [];
      grouped[soId].push(payment);
    });
    return grouped;
  };

  const groupedPayments = groupPaymentsBySO();
  const groupedPaymentKeys = Object.keys(groupedPayments);

  // Get the first (latest) payment for each group to display in the main row
  const displayPayments = groupedPaymentKeys.map((soId) => {
    const soPayments = groupedPayments[soId].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return {
      ...soPayments[0],
      _groupSize: soPayments.length,
      _allPayments: soPayments,
    };
  });

  const columns: ITableColumn<CustomerPayment>[] = [
    {
      key: 'action' as any,
      label: '',
      render: (row: any) => (
        row._groupSize > 1 ? (
          <IconButton
            size="small"
            onClick={() => {
              const soId = row.sales_order_id;
              const newExpanded = new Set(expandedSOs);
              if (newExpanded.has(soId)) {
                newExpanded.delete(soId);
              } else {
                newExpanded.add(soId);
              }
              setExpandedSOs(newExpanded);
            }}
            sx={{
              color: '#4F46E5',
              width: 30,
              height: 30,
              transition: 'transform 0.2s',
              transform: expandedSOs.has(row.sales_order_id) ? 'rotate(90deg)' : 'rotate(0deg)',
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
              color: '#4F46E5',
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
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                height: 18,
              }}
            />
          )}
        </Stack>
      ),
    },
    {
      key: 'customer_id',
      label: 'Customer',
      render: (row) => {
        const name = row.customer?.display_name || 'Unknown';
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
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                {name}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                {row.sales_order?.sales_order_no || '—'}
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
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace" }}>
          ₹{row.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'received_amount',
      label: 'Received',
      render: (row) => {
        const pct = row.amount ? Math.min(100, Math.round((row.received_amount / row.amount) * 100)) : 0;
        return (
          <Box sx={{ minWidth: 120 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#15803D', fontFamily: "'DM Mono', monospace" }}>
                ₹{row.received_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>{pct}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: pct === 100 ? '#22C55E' : 'linear-gradient(90deg, #4F46E5, #818CF8)',
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
          <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
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
              onClick={() => router.push(`/customer-payments/${row.id}`)}
              sx={{
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                width: 30,
                height: 30,
                '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', color: '#0F172A' },
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
        p: { xs: 2, md: 4 },
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 4 }}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Customer Payments
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.25 }}>
            Track and manage all customer payment records
          </Typography>
        </Box>
        <Button
          onClick={() => setOpenCreateDialog(true)}
          startIcon={<Plus size={16} strokeWidth={2.5} />}
          sx={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            color: '#fff',
            borderRadius: '10px',
            px: 2.5,
            py: 1.1,
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s',
          }}
        >
          Create Payment
        </Button>
      </Stack>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <StatCard
          label="Total Ordered"
          value={`₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${totalCount} payments`}
          icon={<Receipt size={20} />}
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
        />
        <StatCard
          label="Total Received"
          value={`₹${totalReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
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
          mb: 3,
          border: '1px solid #F1F5F9',
          borderRadius: '14px',
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
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              px: 1.5,
              py: '8px',
              backgroundColor: '#F8FAFC',
              '&:focus-within': { borderColor: '#A5B4FC', backgroundColor: '#FAFBFF' },
              transition: 'all 0.15s',
            }}
          >
            <Search size={15} color="#94A3B8" strokeWidth={2.5} />
            <input
              placeholder="Search by payment number, customer..."
              value={filters.search}
              onChange={(e) => handleTypeChange('search', e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#0F172A',
                flex: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {filters.search && (
              <button
                onClick={() => handleTypeChange('search', '')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
              >
                <X size={13} />
              </button>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {['all', 'pending', 'partial', 'completed'].map((s) => {
              const cfg = s === 'all'
                ? { label: 'All', dot: '#64748B', bg: '#F1F5F9', active: '#334155' }
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
                    border: `1px solid ${isActive ? '#4F46E5' : '#E2E8F0'}`,
                    backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                    color: isActive ? '#4F46E5' : '#64748B',
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
                        backgroundColor: (PAYMENT_STATUS_CONFIG[s] as any)?.dot || '#94A3B8',
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
          border: '1px solid #F1F5F9',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          '& .MuiTableHead-root': {
            backgroundColor: '#F8FAFC',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            borderBottom: '1px solid #F1F5F9',
            py: 1.75,
            fontFamily: "'DM Sans', sans-serif",
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            '&:hover': { backgroundColor: '#FAFBFF' },
            transition: 'background-color 0.12s',
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            borderBottom: '1px solid #F8FAFC',
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
                background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
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
        {Array.from(expandedSOs).map((soId) => {
          const soPayments = groupedPayments[soId] || [];
          if (soPayments.length <= 1) return null;
          
          const sortedPayments = soPayments.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return (
            <Box
              key={`timeline-${soId}`}
              sx={{
                backgroundColor: '#F8FAFC',
                borderTop: '2px solid #F1F5F9',
                p: 3,
              }}
            >
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', mb: 2.5 }}>
                Payment Timeline for {soPayments[0].sales_order?.sales_order_no || 'SO'}
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
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              {payment.payment_number}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.25 }}>
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
                          sx={{ mt: 1.5, p: 1.5, backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #F1F5F9' }}
                        >
                          <Box>
                            <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Amount</Typography>
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace" }}>
                              ₹{payment.received_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Mode</Typography>
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
                              {payment.payment_mode}
                            </Typography>
                          </Box>
                          {payment.reference_number && (
                            <Box>
                              <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Reference</Typography>
                              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace" }}>
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
      <CreateCustomerPaymentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        salesOrders={salesOrders}
        loading={soLoading}
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
    border: '1px solid #F1F5F9',
  },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    '&.Mui-focused': { color: '#4F46E5' },
  },
};

// ── Create Customer Payment Dialog ──────────────────────────────────────────────

interface CreateCustomerPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  salesOrders: SalesOrderOutput[];
  loading: boolean;
  onPaymentCreated: () => void;
  payments: CustomerPayment[];
}

function CreateCustomerPaymentDialog({ open, onClose, salesOrders, loading, payments, onPaymentCreated }: CreateCustomerPaymentDialogProps) {
  const [selectedSo, setSelectedSo] = useState<SalesOrderOutput | null>(null);
  const [formData, setFormData] = useState({
    payment_mode: 'online' as 'cash' | 'online',
    amount: 0,
    payment_date: dayjs().format('YYYY-MM-DD'),
    reference_number: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate remaining balance for a SO
  const calculateRemainingBalance = (soId: string): number => {
    const soPayments = payments.filter((p) => p.sales_order_id === soId);
    const totalReceived = soPayments.reduce((sum, p) => sum + (p.received_amount || 0), 0);
    const so = salesOrders.find((p) => p.id === soId);
    return so ? so.total - totalReceived : 0;
  };

  const handleSoChange = (soId: string) => {
    const so = salesOrders.find((p) => p.id === soId);
    setSelectedSo(so || null);
    if (so) {
      const remainingBalance = calculateRemainingBalance(soId);
      setFormData((prev) => ({ ...prev, amount: remainingBalance }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const resetForm = () => {
    setSelectedSo(null);
    setFormData({ payment_mode: 'online', amount: 0, payment_date: dayjs().format('YYYY-MM-DD'), reference_number: '', notes: '' });
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async () => {
    if (!selectedSo) return showToastMessage('Please select a sales order', 'error');
    if (formData.amount <= 0) return showToastMessage('Please enter a valid amount', 'error');
    const remainingBalance = calculateRemainingBalance(selectedSo.id);
    if (formData.amount > remainingBalance) return showToastMessage(`Payment amount cannot exceed remaining balance (₹${remainingBalance.toFixed(2)})`, 'error');
    setSubmitting(true);
    try {
      const response = await customerPaymentService.createCustomerPayment({
        sales_order_id: selectedSo.id,
        customer_id: selectedSo.customer_id,
        payment_mode: formData.payment_mode,
        amount: formData.amount,
        payment_date: dayjs(formData.payment_date).toISOString(),
        reference_number: formData.reference_number,
        notes: formData.notes,
      });
      if (response.success || response.data) {
        showToastMessage('Customer payment created successfully', 'success');
        onPaymentCreated();
        resetForm();
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to create customer payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingBalance = selectedSo ? calculateRemainingBalance(selectedSo.id) : 0;
  const remaining = remainingBalance - formData.amount;
  const completionPct = remainingBalance > 0 ? Math.min(100, (formData.amount / remainingBalance) * 100) : 0;

  const predictedStatus =
    formData.amount <= 0 ? 'pending' :
    selectedSo && formData.amount >= remainingBalance ? 'completed' : 'partial';

  const statusCfg = PAYMENT_STATUS_CONFIG[predictedStatus];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogSx}>
      <DialogTitle
        sx={{
          px: 3, py: 2.5,
          borderBottom: '1px solid #F1F5F9',
          fontWeight: 800,
          fontSize: '18px',
          color: '#0F172A',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #4F46E5, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="#fff" />
            </Box>
            Create Payment
          </Stack>
          <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>

          {/* SO Select */}
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Sales Order</InputLabel>
            <Select
              label="Sales Order"
              value={selectedSo?.id || ''}
              onChange={(e) => handleSoChange(e.target.value)}
              disabled={loading}
            >
              {salesOrders.map((so) => (
                <MenuItem key={so.id} value={so.id} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                    <span>{so.sales_order_no}</span>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>{so.customer?.display_name}</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{so.total.toLocaleString('en-IN')}</span>
                    </Stack>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* SO Summary + form */}
          {selectedSo && (
            <Fade in>
              <Stack spacing={2.5}>
                {/* SO Info */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)',
                    border: '1px solid #C7D2FE',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography sx={{ fontSize: '11px', color: '#6366F1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Remaining Balance
                      </Typography>
                      <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>
                        ₹{calculateRemainingBalance(selectedSo.id).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.5 }}>
                        of ₹{selectedSo.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} SO Total
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8', mb: 0.5 }}>Payment Terms</Typography>
                      <Chip label={selectedSo.payment_terms} size="small" sx={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }} />
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '11px', color: '#6366F1', fontWeight: 600 }}>Paying {completionPct.toFixed(0)}%</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={completionPct}
                      sx={{
                        height: 6, borderRadius: 3, backgroundColor: '#C7D2FE',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: completionPct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #4F46E5, #818CF8)',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Mode Toggle */}
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                          border: `1.5px solid ${formData.payment_mode === mode ? '#4F46E5' : '#E2E8F0'}`,
                          backgroundColor: formData.payment_mode === mode ? '#EEF2FF' : '#FAFAFA',
                          color: formData.payment_mode === mode ? '#4F46E5' : '#64748B',
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
                  inputProps={{ step: '0.01', min: '0', max: calculateRemainingBalance(selectedSo.id) }}
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
                color: '#64748B', border: '1px solid #E2E8F0',
                '&:hover': { backgroundColor: '#F8FAFC' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedSo}
              sx={{
                borderRadius: '10px', px: 3, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #4338CA, #4F46E5)', boxShadow: '0 6px 18px rgba(79,70,229,0.4)' },
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
  payment: CustomerPayment | null;
  onClose: () => void;
  onSubmit: (receivedAmount: number) => void;
}

function RecordPaymentDialog({ open, payment, onClose, onSubmit }: RecordPaymentDialogProps) {
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment) setReceivedAmount(payment.remaining_amount.toString());
  }, [payment, open]);

  const handleSubmit = async () => {
    const amount = parseFloat(receivedAmount);
    if (!receivedAmount || amount <= 0) return showToastMessage('Please enter a valid amount', 'error');
    if (!payment || amount > payment.remaining_amount) return showToastMessage('Amount cannot exceed remaining balance', 'error');
    setLoading(true);
    try { await onSubmit(amount); } finally { setLoading(false); onClose(); }
  };

  if (!payment) return null;

  const remainder = payment.remaining_amount - (parseFloat(receivedAmount) || 0);
  const pct = payment.remaining_amount > 0
    ? Math.min(100, ((parseFloat(receivedAmount) || 0) / payment.remaining_amount) * 100)
    : 0;
  const customerName = payment.customer?.display_name || 'Unknown';
  const avatarStyle = getAvatarStyle(customerName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={dialogSx}>
      <DialogTitle
        sx={{
          px: 3, py: 2.5,
          borderBottom: '1px solid #F1F5F9',
          fontWeight: 800,
          fontSize: '18px',
          color: '#0F172A',
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
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>

          {/* Customer info */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
            <Avatar sx={{ width: 42, height: 42, backgroundColor: avatarStyle.bg, color: avatarStyle.color, fontSize: '14px', fontWeight: 700, border: `2px solid ${avatarStyle.color}22` }}>
              {getInitials(customerName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{customerName}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>{payment.payment_number}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>Outstanding</Typography>
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
              <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                ₹{Math.max(0, remainder).toFixed(2)} left after
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8, borderRadius: 4, backgroundColor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: pct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #16A34A, #4ADE80)',
                },
              }}
            />
          </Box>

          <TextField
            label="Amount to Receive (₹)"
            type="number"
            fullWidth
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            sx={fieldSx}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              onClick={onClose}
              sx={{
                borderRadius: '10px', px: 2.5, fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textTransform: 'none',
                color: '#64748B', border: '1px solid #E2E8F0',
                '&:hover': { backgroundColor: '#F8FAFC' },
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
