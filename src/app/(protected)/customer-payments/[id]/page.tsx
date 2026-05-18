'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle2,
  Edit,
  Copy,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { customerPaymentService } from '@/lib/api/customerPaymentService';
import { CustomerPayment } from '@/models/customer-payment.model';
import { showToastMessage } from '@/utils/toastUtil';

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FFF7ED',
    color: '#C2410C',
    dot: '#F97316',
  },
  partial: {
    label: 'Partial',
    bg: '#FFFBEB',
    color: '#B45309',
    dot: '#F59E0B',
  },
  completed: {
    label: 'Completed',
    bg: '#F0FDF4',
    color: '#15803D',
    dot: '#22C55E',
  },
};

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

export default function CustomerPaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    payment_mode: '',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await customerPaymentService.getCustomerPayment(params.id);
        if (response.data) {
          setPayment(response.data);
          setEditData({
            payment_mode: response.data.payment_mode,
            reference_number: response.data.reference_number || '',
            notes: response.data.notes || '',
          });
        }
      } catch (error: any) {
        showToastMessage(error.message || 'Failed to fetch payment', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [params.id]);

  const handleEdit = async () => {
    if (!payment) return;
    try {
      const response = await customerPaymentService.updateCustomerPayment(payment.id, {
        payment_mode: editData.payment_mode as 'cash' | 'online',
        reference_number: editData.reference_number || undefined,
        notes: editData.notes || undefined,
      });
      if (response.data) {
        setPayment(response.data);
        setEditDialogOpen(false);
        showToastMessage('Payment updated successfully', 'success');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to update payment', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Payment not found</Typography>
      </Box>
    );
  }

  const cfg = PAYMENT_STATUS_CONFIG[payment.payment_status] || PAYMENT_STATUS_CONFIG.pending;
  const customerStyle = getAvatarStyle(payment.customer?.display_name || '');
  const pct = payment.amount > 0 ? Math.round((payment.received_amount / payment.amount) * 100) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
          }}
        >
          <ArrowLeft size={18} />
        </IconButton>
        <Box>
          <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            {payment.payment_number}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
            Created on {dayjs(payment.created_at).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button
            onClick={() => setEditDialogOpen(true)}
            startIcon={<Edit size={14} />}
            sx={{
              borderRadius: '8px',
              px: 2,
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid #E2E8F0',
              color: '#64748B',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#F8FAFC' },
            }}
          >
            Edit
          </Button>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Main Details Card */}
        <Box sx={{ flex: { xs: 1, md: '1 1 66.666%' } }}>
          <Card elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Status Section */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, pb: 3, borderBottom: '1px solid #F1F5F9' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Status
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      px: 2,
                      py: '8px',
                      borderRadius: '20px',
                      backgroundColor: cfg.bg,
                      border: `1px solid ${cfg.dot}33`,
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.dot }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: cfg.color }}>
                      {cfg.label}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Payment Mode
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
                    {payment.payment_mode}
                  </Typography>
                </Box>
              </Stack>

              {/* Customer & Sales Order */}
              <Stack direction="row" spacing={3} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #F1F5F9' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Customer
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: customerStyle.bg,
                        color: customerStyle.color,
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(payment.customer?.display_name || '')}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {payment.customer?.display_name}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                        {payment.customer?.company_name}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Sales Order
                  </Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {payment.sales_order?.sales_order_no}
                  </Typography>
                </Box>
              </Stack>

              {/* Amount Details */}
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Total Order Amount
                  </Typography>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace" }}>
                    ₹{payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                        Amount Received
                      </Typography>
                      <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#15803D', fontFamily: "'DM Mono', monospace" }}>
                        ₹{payment.received_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={`${pct}%`} sx={{ backgroundColor: '#F0FDF4', color: '#15803D', fontWeight: 700 }} />
                    </Box>
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Remaining Balance
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: payment.remaining_amount > 0 ? '#DC2626' : '#15803D',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {payment.remaining_amount > 0 ? '−' : ''}₹
                    {payment.remaining_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '16px', mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', mb: 2 }}>
                Payment Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Payment Date
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#0F172A' }}>
                    {dayjs(payment.payment_date).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                </Box>
                {payment.reference_number && (
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                      Reference Number
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: '13px', color: '#0F172A', fontFamily: "'DM Mono', monospace" }}>
                        {payment.reference_number}
                      </Typography>
                      <Tooltip title="Copy">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(payment.reference_number || '');
                            showToastMessage('Copied to clipboard', 'success');
                          }}
                          sx={{ width: 24, height: 24, color: '#64748B' }}
                        >
                          <Copy size={14} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                )}
                {payment.notes && (
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                      Notes
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#0F172A', whiteSpace: 'pre-wrap' }}>
                      {payment.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Audit Info */}
        <Box sx={{ flex: { xs: 1, md: '1 1 33.333%' } }}>
          <Card elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', mb: 2 }}>
                Audit Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Created By
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                    {payment.created_by_user_name}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                    {payment.created_by_company_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Created On
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#0F172A' }}>
                    {dayjs(payment.created_at).format('DD MMM YYYY')}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                    {dayjs(payment.created_at).format('hh:mm A')}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', mb: 0.75 }}>
                    Last Updated
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#0F172A' }}>
                    {dayjs(payment.updated_at).format('DD MMM YYYY')}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                    {dayjs(payment.updated_at).format('hh:mm A')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '18px', color: '#0F172A' }}>
          Edit Payment
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Payment Mode"
              select
              fullWidth
              value={editData.payment_mode}
              onChange={(e) => setEditData({ ...editData, payment_mode: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </TextField>
            <TextField
              label="Reference Number"
              fullWidth
              value={editData.reference_number}
              onChange={(e) => setEditData({ ...editData, reference_number: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            />
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                onClick={() => setEditDialogOpen(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                  textTransform: 'none',
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
