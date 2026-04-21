'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Tabs,
  Tab,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Bill } from '@/models/bill.model';
import { useBill } from '@/hooks/useBill';
import BBTitle from '@/lib/BBTitle/BBTitle';

type BillStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft:         { label: 'Draft',          bg: '#f4f5f9', color: '#6b70a3', border: '#d0d3ea' },
  sent:          { label: 'Sent',           bg: '#eef2ff', color: '#4f63d2', border: '#c7cff7' },
  viewed:        { label: 'Viewed',         bg: '#f0f4ff', color: '#3b5bdb', border: '#bac8ff' },
  partially_paid:{ label: 'Partial',        bg: '#fff8eb', color: '#b45309', border: '#fcd34d' },
  paid:          { label: 'Paid',           bg: '#f0fdf6', color: '#15803d', border: '#6ddc98' },
  overdue:       { label: 'Overdue',        bg: '#fff5f5', color: '#c0392b', border: '#f5a5a5' },
  cancelled:     { label: 'Cancelled',      bg: '#f9f9fb', color: '#9196b0', border: '#dde0ee' },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status = 'draft' }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Box component="span" sx={{
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      fontSize: '11px',
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      px: 1.25,
      py: 0.5,
      borderRadius: '20px',
      bgcolor: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </Box>
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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => { fetchBills(); }, []);

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
      setBills(bills.filter((b) => b.id !== selectedBillId));
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
      setBills(bills.map((b) => b.id === selectedBillId ? { ...b, status: newStatus } : b));
      setOpenStatusDialog(false);
      setSelectedBillId(null);
      setSelectedBill(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to update bill status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isUnpaid = (bill: Bill) => !['paid', 'cancelled'].includes(bill.status?.toLowerCase() || 'draft');

  const filteredBills = bills
    .filter((b) =>
      b.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendor?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((b) => filterTab === 'unpaid' ? isUnpaid(b) : true);

  const unpaidCount = bills.filter(isUnpaid).length;
  const totalUnpaid = bills.filter(isUnpaid).reduce((s, b) => s + (b.total || 0), 0);

  if (loadingBills) {
    return (
      <Box sx={{ bgcolor: '#f8f9fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            boxShadow: '0 8px 24px rgba(79,99,210,0.3)',
          }}>
            <CircularProgress size={28} sx={{ color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: '#6b70a3', fontWeight: 600 }}>
            Loading Bills…
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fc', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <BBTitle title="Bills" />
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9196b0', mt: 0.5 }}>
              {bills.length} total · {unpaidCount} unpaid
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/bills/new')}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              textTransform: 'none',
              px: 2.5,
              py: 1.2,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(79,99,210,0.35)',
              '&:hover': { boxShadow: '0 6px 20px rgba(79,99,210,0.45)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s',
            }}
          >
            New Bill
          </Button>
        </Box>

        {pageError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontFamily: "'DM Sans', sans-serif" }} onClose={() => setPageError(null)}>
            {pageError}
          </Alert>
        )}

        {/* ── Unpaid Banner ── */}
        {unpaidCount > 0 && (
          <Box sx={{
            mb: 3,
            p: '16px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fffbeb, #fff3cd)',
            border: '1px solid #fcd34d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '8px',
                bgcolor: '#fef3c7',
                border: '1px solid #fcd34d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <WarningAmberIcon sx={{ fontSize: 18, color: '#d97706' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#92400e' }}>
                  {unpaidCount} unpaid bill{unpaidCount > 1 ? 's' : ''}
                </Typography>
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#b45309' }}>
                  ₹{totalUnpaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })} outstanding
                </Typography>
              </Box>
            </Box>
            <Button size="small" onClick={() => setFilterTab('unpaid')} sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: 12,
              color: '#b45309',
              textTransform: 'none',
              px: 1.5, py: 0.6,
              borderRadius: '8px',
              bgcolor: '#fef3c7',
              border: '1px solid #fcd34d',
              '&:hover': { bgcolor: '#fde68a' },
            }}>
              View All →
            </Button>
          </Box>
        )}

        {/* ── Main Card ── */}
        <Box sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e8eaf0',
          boxShadow: '0 4px 24px rgba(79,99,210,0.06)',
          overflow: 'hidden',
        }}>
          {/* Card top bar: tabs + search */}
          <Box sx={{
            px: 3, pt: 2,
            borderBottom: '1px solid #ecedf5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}>
            <Tabs
              value={filterTab}
              onChange={(_, v) => setFilterTab(v)}
              sx={{
                minHeight: 42,
                '& .MuiTab-root': {
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: 'none',
                  minHeight: 42,
                  px: 2,
                  color: '#9196b0',
                },
                '& .Mui-selected': { color: '#4f63d2 !important' },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(90deg, #4f63d2, #7c3aed)',
                  height: 2.5,
                  borderRadius: 2,
                },
              }}
            >
              <Tab label={`All Bills (${bills.length})`} value="all" />
              <Tab
                label={`Unpaid (${unpaidCount})`}
                value="unpaid"
                sx={{ color: unpaidCount > 0 ? '#d97706 !important' : undefined }}
              />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search bill #, order #, vendor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: '#9196b0' }} />
                  </InputAdornment>
                ),
                sx: {
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  borderRadius: '8px',
                  bgcolor: '#f8f9fc',
                  '& fieldset': { borderColor: '#e8eaf0' },
                },
              }}
              sx={{ minWidth: 260 }}
            />
          </Box>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafbff' }}>
                {['Bill #', 'Vendor', 'Order #', 'Due Date', 'Amount', 'Status', ''].map((h) => (
                  <TableCell key={h} sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: '#9196b0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.7px',
                    py: '12px',
                    borderColor: '#ecedf5',
                    ...(h === 'Amount' ? { textAlign: 'right' } : {}),
                    ...(h === '' ? { width: 120, textAlign: 'right', pr: 2 } : {}),
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, borderBottom: 'none' }}>
                    <ReceiptLongIcon sx={{ fontSize: 40, color: '#dde0ee', mb: 1.5, display: 'block', mx: 'auto' }} />
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: '#9196b0', fontSize: 14 }}>
                      {searchQuery ? 'No bills match your search' : filterTab === 'unpaid' ? 'No unpaid bills' : 'No bills yet'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => {
                  const isPaid = ['paid', 'cancelled'].includes(bill.status?.toLowerCase() || 'draft');
                  const isHovered = hoveredRow === bill.id;
                  return (
                    <TableRow
                      key={bill.id}
                      onMouseEnter={() => setHoveredRow(bill.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        bgcolor: isPaid ? '#fafbff' : 'inherit',
                        '&:last-child td': { borderBottom: 'none' },
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#f8f9ff' },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell sx={{ borderColor: '#ecedf5', py: '14px' }}>
                        <Typography sx={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#4f63d2',
                          bgcolor: '#eef0fb',
                          border: '1px solid #d4d9f7',
                          borderRadius: '6px',
                          px: 1,
                          py: 0.25,
                          display: 'inline-block',
                        }}>
                          {bill.bill_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#ecedf5' }}>
                        <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1d2e' }}>
                          {bill.vendor?.display_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#ecedf5' }}>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#9196b0' }}>
                          {bill.order_number || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#ecedf5' }}>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: '#4b5180' }}>
                          {new Date(bill.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: '#ecedf5' }}>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13.5, color: '#1a1d2e' }}>
                          ₹{(bill.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#ecedf5' }}>
                        <StatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: '#ecedf5', pr: 2 }}>
                        <Box sx={{
                          display: 'flex',
                          gap: 0.5,
                          justifyContent: 'flex-end',
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.15s',
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/bills/${bill.id}`)}
                            sx={{ color: '#4f63d2', bgcolor: '#eef0fb', borderRadius: '7px', '&:hover': { bgcolor: '#d4d9f7' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBill(bill);
                              setSelectedBillId(bill.id || null);
                              setNewStatus((bill.status as BillStatus) || 'sent');
                              setOpenStatusDialog(true);
                            }}
                            sx={{ color: '#7c3aed', bgcolor: '#f3eeff', borderRadius: '7px', '&:hover': { bgcolor: '#e9d8fd' } }}
                          >
                            <TuneIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedBillId(bill.id || null); setOpenDeleteDialog(true); }}
                            sx={{ color: '#e53e3e', bgcolor: '#fff5f5', borderRadius: '7px', '&:hover': { bgcolor: '#fed7d7' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* ── Status Dialog ── */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #e8eaf0', boxShadow: '0 20px 60px rgba(79,99,210,0.15)' } }}
      >
        <Box sx={{ p: '4px', background: 'linear-gradient(135deg, #4f63d2, #7c3aed)', borderRadius: '16px 16px 0 0', height: 4 }} />
        <DialogTitle sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, pb: 1 }}>
          Update Bill Status
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#9196b0', mb: 0.5 }}>Bill</Typography>
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 13, color: '#4f63d2' }}>
              {selectedBill?.bill_number}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#9196b0', mb: 0.75 }}>Current Status</Typography>
            <StatusBadge status={selectedBill?.status} />
          </Box>
          <FormControl fullWidth>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#6b70a3', mb: 0.75, fontWeight: 600 }}>New Status</Typography>
            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent<BillStatus>) => setNewStatus(e.target.value as BillStatus)}
              size="small"
              sx={{ fontFamily: "'DM Sans', sans-serif", borderRadius: '8px', fontSize: 13 }}
            >
              {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                <MenuItem key={value} value={value} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {cfg.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenStatusDialog(false)} sx={{ fontFamily: "'DM Sans', sans-serif", textTransform: 'none', borderRadius: '8px', color: '#6b70a3' }}>
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
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              boxShadow: '0 4px 12px rgba(79,99,210,0.3)',
            }}
          >
            {updatingStatus ? 'Updating…' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #fee2e2', boxShadow: '0 20px 60px rgba(220,38,38,0.12)' } }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '16px 16px 0 0' }} />
        <DialogTitle sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>
          Delete Bill?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: '#6b70a3', lineHeight: 1.6 }}>
            This action is permanent and cannot be undone. The bill and all its data will be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ fontFamily: "'DM Sans', sans-serif", textTransform: 'none', borderRadius: '8px', color: '#6b70a3' }}>
            Cancel
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