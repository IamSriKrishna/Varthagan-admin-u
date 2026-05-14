'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { showToastMessage } from '@/utils/toastUtil';
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import HighlightedCell from '@/lib/BBTable/HighlightedCell';
import dayjs from 'dayjs';
import { vendorPaymentService } from '@/lib/api/vendorPaymentService';
import { purchaseOrderService } from '@/lib/api/purchaseOrderService';
import { VendorPayment } from '@/models/vendor-payment.model';
import { PurchaseOrder } from '@/models/purchaseOrder.model';

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

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    bg: '#fff5f5',
    color: '#991b1b',
    border: '#fca5a5',
    icon: <Clock size={11} />,
  },
  partial: {
    label: 'Partial',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fcd34d',
    icon: <DollarSign size={11} />,
  },
  completed: {
    label: 'Completed',
    bg: '#f0fdf4',
    color: '#065f46',
    border: '#bbf7d0',
    icon: <CheckCircle2 size={11} />,
  },
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VendorPaymentsPage() {
  const [filters, setFilters] = useState({ search: '' });
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

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setPoLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders(1, 100);
      const orders = response.purchase_orders || [];
      setPurchaseOrders(orders);
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch purchase orders', 'error');
    } finally {
      setPoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (openCreateDialog) {
      fetchPurchaseOrders();
    }
  }, [openCreateDialog, fetchPurchaseOrders]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRows: number) => {
    setRowsPerPage(newRows);
    setPage(0);
  };

  const handleRecordPayment = async (paymentId: number) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
      setOpenRecordPaymentDialog(true);
    }
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

  const columns: ITableColumn<VendorPayment>[] = [
    {
      key: 'payment_number',
      label: 'Payment #',
      render: (row) => (
        <HighlightedCell
          value={row.payment_number}
          search={debouncedSearch}
        />
      ),
    },
    {
      key: 'vendor_id',
      label: 'Vendor',
      render: (row) => {
        const vendorName = row.vendor?.display_name || 'Unknown';
        const avatarStyle = getAvatarStyle(vendorName);
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: avatarStyle.bg,
                color: avatarStyle.color,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {getInitials(vendorName)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {vendorName}
            </Typography>
          </Stack>
        );
      },
    },
    {
      key: 'purchase_order_id',
      label: 'Purchase Order',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {row.purchase_order?.purchase_order_no || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Total Amount',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{row.amount?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'paid_amount',
      label: 'Paid Amount',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{row.paid_amount?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'remaining_amount',
      label: 'Remaining',
      render: (row) => (
        <Typography variant="body2" sx={{ color: row.remaining_amount > 0 ? '#dc2626' : '#059669' }}>
          ₹{row.remaining_amount?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (row) => {
        const config = PAYMENT_STATUS_CONFIG[row.payment_status] || PAYMENT_STATUS_CONFIG.pending;
        return (
          <Chip
            icon={config.icon as any}
            label={config.label}
            sx={{
              backgroundColor: config.bg,
              color: config.color,
              border: `1px solid ${config.border}`,
              fontWeight: 500,
              height: 24,
            }}
          />
        );
      },
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      render: (row) => (
        <Typography variant="body2">
          {dayjs(row.payment_date).format('DD MMM YYYY')}
        </Typography>
      ),
    },
    {
      key: 'action',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => router.push(`/vendor-payments/${row.id}`)}
              sx={{ color: '#0369a1' }}
            >
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          {row.payment_status !== 'completed' && (
            <Tooltip title="Record Payment">
              <IconButton
                size="small"
                onClick={() => handleRecordPayment(row.id)}
                sx={{ color: '#16a34a' }}
              >
                <DollarSign size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <BBTitle title="Vendor Payments" subtitle="Manage vendor payment records" />
        <BBButton
          onClick={() => setOpenCreateDialog(true)}
          startIcon={<Plus size={18} />}
          variant="contained"
          size="small"
        >
          Create Payment
        </BBButton>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <BBInputBase
            name="search"
            label=""
            placeholder="Search payments..."
            value={filters.search}
            onChange={(e) => handleTypeChange('search', e.target.value)}
            sx={{ flex: 1 }}
          />
          <Select
            size="small"
            defaultValue="all"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </Stack>
      </Paper>

      {loading ? (
        <BBLoader enabled={true} />
      ) : null}
      <BBTable
        columns={columns}
        data={payments}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Create Payment Dialog */}
      <CreateVendorPaymentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        purchaseOrders={purchaseOrders}
        loading={poLoading}
        onPaymentCreated={() => {
          setOpenCreateDialog(false);
          fetchPayments();
        }}
      />

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={openRecordPaymentDialog}
        payment={selectedPayment}
        onClose={() => {
          setOpenRecordPaymentDialog(false);
          setSelectedPayment(null);
        }}
        onSubmit={handleRecordPaymentSubmit}
      />
    </Box>
  );
}

// ── Create Vendor Payment Dialog Component ────────────────────────────────────

interface CreateVendorPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  onPaymentCreated: () => void;
}

function CreateVendorPaymentDialog({
  open,
  onClose,
  purchaseOrders,
  loading,
  onPaymentCreated,
}: CreateVendorPaymentDialogProps) {
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    payment_mode: 'online' as 'cash' | 'online',
    amount: 0,
    payment_date: dayjs().format('YYYY-MM-DD'),
    reference_number: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePoChange = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    setSelectedPo(po || null);
    if (po) {
      setFormData((prev) => ({
        ...prev,
        amount: po.total,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      payment_mode: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPo) {
      showToastMessage('Please select a purchase order', 'error');
      return;
    }

    if (formData.amount <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    if (formData.amount > selectedPo.total) {
      showToastMessage('Payment amount cannot exceed PO total', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await vendorPaymentService.createVendorPayment({
        purchase_order_id: selectedPo.id, // UUID string
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

  const resetForm = () => {
    setSelectedPo(null);
    setFormData({
      payment_mode: 'online',
      amount: 0,
      payment_date: dayjs().format('YYYY-MM-DD'),
      reference_number: '',
      notes: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const poTotalAfterPayment = selectedPo ? selectedPo.total - formData.amount : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Create Vendor Payment</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Purchase Order</InputLabel>
            <Select
              label="Purchase Order"
              value={selectedPo?.id || ''}
              onChange={(e) => handlePoChange(e.target.value)}
              disabled={loading}
            >
              {purchaseOrders.map((po) => (
                <MenuItem key={po.id} value={po.id}>
                  {po.purchase_order_no} - ₹{po.total.toFixed(2)} ({po.vendor?.display_name || 'Unknown'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedPo && (
            <>
              <Box sx={{ p: 2, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  PO Details
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      <strong>Total Amount:</strong> ₹{selectedPo.total.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      <strong>Payment Terms:</strong> {selectedPo.payment_terms}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  name="payment_mode"
                  label="Payment Mode"
                  value={formData.payment_mode}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Payment Amount"
                type="number"
                fullWidth
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                inputProps={{ step: '0.01', min: '0', max: selectedPo.total }}
                helperText={`Remaining after payment: ₹${poTotalAfterPayment.toFixed(2)}`}
              />

              <TextField
                label="Payment Date"
                type="date"
                fullWidth
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Reference Number"
                fullWidth
                name="reference_number"
                placeholder="TXN-2026-00001"
                value={formData.reference_number}
                onChange={handleInputChange}
              />

              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                name="notes"
                placeholder="Payment notes..."
                value={formData.notes}
                onChange={handleInputChange}
              />

              <Box sx={{ p: 1.5, backgroundColor: '#eff6ff', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#0369a1' }}>
                  💡 Payment Status will be automatically calculated:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#0369a1', mt: 0.5 }}>
                  • Full Payment (₹{selectedPo.total.toFixed(2)}) → <strong>Completed</strong>
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#0369a1' }}>
                  • Partial Payment → <strong>Partial</strong>
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#0369a1' }}>
                  • Zero Amount → <strong>Pending</strong>
                </Typography>
              </Box>
            </>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting || !selectedPo}
            >
              {submitting ? 'Creating...' : 'Create Payment'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Record Payment Dialog Component ────────────────────────────────────────────

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
    if (payment) {
      setPaidAmount(payment.remaining_amount.toString());
    }
  }, [payment, open]);

  const handleSubmit = async () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    const amount = parseFloat(paidAmount);
    if (!payment || amount > payment.remaining_amount) {
      showToastMessage('Amount cannot exceed remaining balance', 'error');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(amount);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Record Payment</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Vendor
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {payment.vendor?.display_name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Total Outstanding Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626' }}>
              ₹{payment.remaining_amount?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <TextField
            label="Amount to Pay"
            type="number"
            fullWidth
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            helperText={`Remaining: ₹${(payment.remaining_amount - (parseFloat(paidAmount) || 0)).toFixed(2)}`}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
