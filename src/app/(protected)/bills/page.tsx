'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Bill } from '@/models/bill.model';
import { useBill } from '@/hooks/useBill';
import BBTitle from '@/lib/BBTitle/BBTitle';

type BillStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

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
      const errorMsg = err?.message || 'Failed to load bills';
      console.error('Error fetching bills:', errorMsg, err);
      setPageError(errorMsg);
    } finally {
      setLoadingBills(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBillId) return;

    try {
      await deleteBill(selectedBillId);
      setBills(bills.filter((bill) => bill.id !== selectedBillId));
      setOpenDeleteDialog(false);
      setSelectedBillId(null);
      setPageError(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to delete bill');
      console.error('Error deleting bill:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBillId) return;

    setUpdatingStatus(true);
    try {
      await updateBillStatus(selectedBillId, newStatus);
      setBills(
        bills.map((bill) =>
          bill.id === selectedBillId ? { ...bill, status: newStatus } : bill
        )
      );
      setOpenStatusDialog(false);
      setSelectedBillId(null);
      setSelectedBill(null);
      setPageError(null);
    } catch (err: any) {
      setPageError(err?.message || 'Failed to update bill status');
      console.error('Error updating bill status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'info';
      case 'viewed':
        return 'primary';
      case 'partially_paid':
        return 'warning';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      partially_paid: 'Partially Paid',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    };
    return labels[status || 'draft'] || status || 'Draft';
  };

  const isUnpaid = (bill: Bill) => {
    return !['paid', 'cancelled'].includes(bill.status?.toLowerCase() || 'draft');
  };

  const filteredBills = bills
    .filter((bill) =>
      bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.vendor?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((bill) => (filterTab === 'unpaid' ? isUnpaid(bill) : true));

  const unpaidBillsCount = bills.filter(isUnpaid).length;
  const totalUnpaidAmount = bills
    .filter(isUnpaid)
    .reduce((sum, bill) => sum + (bill.total || 0), 0);

  if (loadingBills) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Bills...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <BBTitle title="Bills" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/bills/new')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          New Bill
        </Button>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      {/* Unpaid Bills Summary */}
      {unpaidBillsCount > 0 && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)',
            borderLeft: '4px solid #ff9800',
            boxShadow: 1,
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Unpaid Bills
                </Typography>
                <Typography variant="h6" sx={{ color: '#e65100', fontWeight: 600 }}>
                  {unpaidBillsCount} bill(s) totaling ₹
                  {totalUnpaidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setFilterTab('unpaid')}
                sx={{ color: '#e65100', fontWeight: 600 }}
              >
                View All →
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={filterTab}
          onChange={(e, value) => setFilterTab(value)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        >
          <Tab label={`All Bills (${bills.length})`} value="all" />
          <Tab
            label={`Unpaid (${unpaidBillsCount})`}
            value="unpaid"
            sx={{
              color: unpaidBillsCount > 0 ? '#ff9800 !important' : undefined,
            }}
          />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Card sx={{ boxShadow: 1, borderRadius: 2, mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by bill #, order #, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </Card>

      {/* Bills Table */}
      <TableContainer component={Card} sx={{ boxShadow: 1, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Bill #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchQuery
                      ? 'No bills found matching your search'
                      : filterTab === 'unpaid'
                      ? 'No unpaid bills'
                      : 'No bills created yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const isPaid = ['paid', 'cancelled'].includes(bill.status?.toLowerCase() || 'draft');
                return (
                  <TableRow
                    key={bill.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      backgroundColor: isPaid ? '#f5f5f5' : 'inherit',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{bill.bill_number}</TableCell>
                    <TableCell>{bill.order_number}</TableCell>
                    <TableCell>{bill.vendor?.display_name || 'Not specified'}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      ₹ {(bill.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(bill.status)}
                        size="small"
                        color={getStatusColor(bill.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(bill.due_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/bills/${bill.id}`)}
                        color="primary"
                        title="Edit"
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
                        color="primary"
                        title="Update Status"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBillId(bill.id || null);
                          setOpenDeleteDialog(true);
                        }}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Bill Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bill: <strong>{selectedBill?.bill_number}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current Status: <Chip label={getStatusLabel(selectedBill?.status)} size="small" />
          </Typography>
          <FormControl fullWidth>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              New Status
            </Typography>
            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent<BillStatus>) => setNewStatus(e.target.value as BillStatus)}
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="viewed">Viewed</MenuItem>
              <MenuItem value="partially_paid">Partially Paid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
            variant="contained"
            disabled={updatingStatus || loading}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this bill? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
