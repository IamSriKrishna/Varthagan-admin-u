'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  ReceiptIcon,
  TriangleAlert,
  PencilLine,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { Bill } from '@/models/bill.model';
import { useBill } from '@/hooks/useBill';

type BillStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; border: string }
> = {
  draft: { label: 'Draft', bg: '#f4f5f9', color: '#6b7280', border: '#d1d5db' },
  sent: { label: 'Sent', bg: '#eef2ff', color: '#4f63d2', border: '#c7d2fe' },
  viewed: { label: 'Viewed', bg: '#f0f4ff', color: '#3b5bdb', border: '#bac8ff' },
  partially_paid: { label: 'Partial', bg: '#fff8eb', color: '#b45309', border: '#fcd34d' },
  paid: { label: 'Paid', bg: '#f0fdf6', color: '#15803d', border: '#6ddc98' },
  overdue: { label: 'Overdue', bg: '#fff5f5', color: '#c0392b', border: '#f5a5a5' },
  cancelled: { label: 'Cancelled', bg: '#f9f9fb', color: '#9196b0', border: '#dde0ee' },
};

const StatusBadge = ({ status = 'draft' }: { status?: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

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
};

export default function BillsPage() {
  const router = useRouter();
  const { getBills, deleteBill, updateBillStatus, loading, error } = useBill();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'unpaid'>('all');
  const [newStatus, setNewStatus] = useState<BillStatus>('sent');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoadingBills(true);
      const data = await getBills(1, 100);
      setBills(data);
      setPageError(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to load bills');
    } finally {
      setLoadingBills(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBillId) return;

    try {
      await deleteBill(selectedBillId);
      setBills((prev) => prev.filter((b) => b.id !== selectedBillId));
      setOpenDeleteDialog(false);
      setSelectedBillId(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to delete bill');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBillId) return;

    setUpdatingStatus(true);

    try {
      await updateBillStatus(selectedBillId, newStatus);
      setBills((prev) =>
        prev.map((b) =>
          b.id === selectedBillId ? { ...b, status: newStatus } : b
        )
      );
      setOpenStatusDialog(false);
      setSelectedBillId(null);
      setSelectedBill(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to update bill status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isUnpaid = (bill: Bill) =>
    !['paid', 'cancelled'].includes(
      bill.status?.toLowerCase() || 'draft'
    );

  const filteredBills = bills
    .filter(
      (b) =>
        b.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vendor?.display_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    )
    .filter((b) => (filterTab === 'unpaid' ? isUnpaid(b) : true));

  const unpaidCount = bills.filter(isUnpaid).length;
  const totalUnpaid = bills
    .filter(isUnpaid)
    .reduce((s, b) => s + (b.total || 0), 0);

  if (loadingBills) {
    return (
      <Box
        sx={{
          bgcolor: '#f8f9fc',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background:
                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
            }}
          >
            <CircularProgress size={28} sx={{ color: '#fff' }} />
          </Box>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            Loading Bills…
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
      }}
    >
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
              <ReceiptIcon size={22} color="white" />
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
                Bills
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {bills.length} total · {unpaidCount} unpaid
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => router.push('/bills/new')}
            startIcon={<Plus size={16} />}
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
            New Bill
          </Button>
        </Stack>
      </Box>

      {pageError && (
        <Alert
          severity="error"
          onClose={() => setPageError(null)}
          sx={{
            mx: 3,
            mt: 2.5,
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {pageError}
        </Alert>
      )}

      {unpaidCount > 0 && (
        <Box
          sx={{
            mx: 3,
            mt: 2.5,
            p: 2,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #fffbeb, #fff3cd)',
            border: '1px solid #fcd34d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '9px',
                bgcolor: '#fef3c7',
                border: '1px solid #fcd34d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TriangleAlert size={18} color="#d97706" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#92400e',
                }}
              >
                {unpaidCount} unpaid bill{unpaidCount > 1 ? 's' : ''}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#b45309',
                }}
              >
                ₹
                {totalUnpaid.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}{' '}
                outstanding
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            onClick={() => setFilterTab('unpaid')}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#b45309',
              textTransform: 'none',
              px: 1.5,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: '#fef3c7',
              border: '1px solid #fcd34d',
              '&:hover': { bgcolor: '#fde68a' },
            }}
          >
            View All →
          </Button>
        </Box>
      )}

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
        <Tabs
          value={filterTab}
          onChange={(_, value) => setFilterTab(value)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              minHeight: 36,
              px: 1.5,
              color: '#9ca3af',
            },
            '& .Mui-selected': {
              color: '#4f63d2 !important',
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              height: 2.5,
              borderRadius: 2,
            },
          }}
        >
          <Tab label={`All Bills (${bills.length})`} value="all" />
          <Tab label={`Unpaid (${unpaidCount})`} value="unpaid" />
        </Tabs>

        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 380 }}>
          <TextField
            size="small"
            placeholder="Search bill #, order #, vendor…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                '& fieldset': {
                  borderColor: '#e8eaf0',
                },
                '&:hover fieldset': {
                  borderColor: '#c7d2fe',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Box>

        {searchQuery && (
          <Chip
            label={`${filteredBills.length} result${
              filteredBills.length !== 1 ? 's' : ''
            }`}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
            }}
          />
        )}
      </Box>

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
        <Table>
          <TableHead>
            <TableRow>
              {['Bill #', 'Vendor', 'Order #', 'Due Date', 'Amount', 'Status', ''].map(
                (head) => (
                  <TableCell
                    key={head}
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
                      ...(head === 'Amount' && { textAlign: 'right' }),
                      ...(head === '' && {
                        width: 120,
                        textAlign: 'right',
                        pr: 2,
                      }),
                    }}
                  >
                    {head}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    borderBottom: 'none',
                  }}
                >
                  <ReceiptIcon
                    size={42}
                    color="#d1d5db"
                    style={{ marginBottom: 12 }}
                  />

                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {searchQuery
                      ? 'No bills match your search'
                      : filterTab === 'unpaid'
                        ? 'No unpaid bills'
                        : 'No bills yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const isPaid = ['paid', 'cancelled'].includes(
                  bill.status?.toLowerCase() || 'draft'
                );

                return (
                  <TableRow
                    key={bill.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                      bgcolor: isPaid ? '#fafbff' : '#ffffff',
                      '&:hover': {
                        bgcolor: '#f8fbff',
                      },
                      '&:last-child td': {
                        borderBottom: 'none',
                      },
                      '&:hover .row-actions': {
                        opacity: 1,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: '1px solid #f5f5fa',
                        py: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: '#4f63d2',
                          bgcolor: '#f0f4ff',
                          border: '1px solid #c7d2fe',
                          borderRadius: '6px',
                          px: 1,
                          py: 0.25,
                          display: 'inline-block',
                        }}
                      >
                        {bill.bill_number}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #f5f5fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: '#e8edff',
                            color: '#3d52c7',
                            fontFamily: "'DM Sans', sans-serif",
                            border: '1.5px solid #3d52c733',
                          }}
                        >
                          {(bill.vendor?.display_name || 'V')
                            .split(' ')
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              color: '#1a1d2e',
                              lineHeight: 1.3,
                            }}
                          >
                            {bill.vendor?.display_name || '—'}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              color: '#9ca3af',
                              fontFamily: "'DM Mono', monospace",
                              letterSpacing: '0.02em',
                            }}
                          >
                            Vendor
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #f5f5fa' }}>
                      <Typography
                        sx={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '0.75rem',
                          color: bill.order_number ? '#6b7280' : '#d1d5db',
                        }}
                      >
                        {bill.order_number || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #f5f5fa' }}>
                      <Typography
                        sx={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '0.8rem',
                          color: '#6b7280',
                        }}
                      >
                        {new Date(bill.due_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ borderBottom: '1px solid #f5f5fa' }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#1a1d2e',
                        }}
                      >
                        ₹
                        {(bill.total || 0).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #f5f5fa' }}>
                      <StatusBadge status={bill.status} />
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: '1px solid #f5f5fa',
                        pr: 2,
                      }}
                    >
                      <Box
                        className="row-actions"
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          justifyContent: 'flex-end',
                          opacity: 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        <Tooltip title="Edit bill" arrow>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/bills/${bill.id}`)}
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
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <PencilLine size={14} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Update status" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBill(bill);
                              setSelectedBillId(bill.id || null);
                              setNewStatus((bill.status as BillStatus) || 'sent');
                              setOpenStatusDialog(true);
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
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <SlidersHorizontal size={14} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete bill" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBillId(bill.id || null);
                              setOpenDeleteDialog(true);
                            }}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '8px',
                              color: '#ef4444',
                              bgcolor: '#fef2f2',
                              '&:hover': {
                                bgcolor: '#fee2e2',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
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
          Update Bill Status
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem',
                color: '#9ca3af',
                mb: 0.5,
              }}
            >
              Bill
            </Typography>

            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#4f63d2',
              }}
            >
              {selectedBill?.bill_number}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem',
                color: '#9ca3af',
                mb: 0.75,
              }}
            >
              Current Status
            </Typography>

            <StatusBadge status={selectedBill?.status} />
          </Box>

          <FormControl fullWidth>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem',
                color: '#6b7280',
                mb: 0.75,
                fontWeight: 700,
              }}
            >
              New Status
            </Typography>

            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent<BillStatus>) =>
                setNewStatus(e.target.value as BillStatus)
              }
              size="small"
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: '8px',
                fontSize: '0.8125rem',
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8125rem',
                  }}
                >
                  {cfg.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenStatusDialog(false)}
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
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updatingStatus || loading}
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
            {updatingStatus ? 'Updating…' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
          Delete Bill
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
                  mt: 0.25,
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
                  The bill and all related data will be permanently removed.
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Are you sure you want to permanently delete this bill?
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Keep Bill
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={loading}
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
            Delete Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}