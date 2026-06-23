'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  Paper,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  CustomerPricing,
  CreateCustomerPricingRequest,
  CustomerPricingLineItem,
} from '@/models/customerPricing.model';
import { customerPricingService } from '@/lib/api/customerPricing.service';
import { apiService } from '@/lib/api/api.service';
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import CustomerPricingForm from './CustomerPricingForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerPricingScreenProps {
  customerId?: number;
  customerName?: string;
}

interface CustomerWithPricing {
  id: number;
  name: string;
  pricings: CustomerPricing[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token from persisted auth:', e);
    return '';
  }
};

/** Returns initials (up to 2 chars) from a customer name */
const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/** Cycles through a small palette for avatar backgrounds */
const AVATAR_COLORS = [
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EEEDFE', color: '#534AB7' },
];

const getAvatarStyle = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

const fmt = (n: number) => `₹ ${n.toFixed(2)}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

const MetricCard = ({ label, value, accent }: MetricCardProps) => (
  <Box
    sx={{
      flex: '1 1 0',
      minWidth: 0,
      bgcolor: 'background.paper',
      border: '0.5px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: '12px 14px',
    }}
  >
    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="h6"
      sx={{ fontSize: 18, fontWeight: 500, color: accent ? '#0F6E56' : 'text.primary' }}
    >
      {value}
    </Typography>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerPricingScreen({
  customerId,
  customerName,
}: CustomerPricingScreenProps) {
  const [customersWithPricing, setCustomersWithPricing] = useState<CustomerWithPricing[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<CustomerPricing | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerPricings();
  }, [customerId]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchCustomerPricings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { setError('Authentication token not found'); return; }

      // Fetch customer-specific pricing if customerId is provided, otherwise fetch all
      let apiResp;
      if (customerId) {
        apiResp = await customerPricingService.getByCustomerId(customerId, 100, 0);
      } else {
        apiResp = await customerPricingService.list(100, 0);
      }

      // Normalize response shapes: service may return axios response (with .data)
      // or the service may already return the payload. Handle double-wrapped cases too.
      let payload: any = apiResp;
      if (apiResp && typeof apiResp === 'object') {
        if (apiResp.data) payload = apiResp.data;
        if (payload && payload.data) payload = payload.data;
      }

      // Extract pricings array from normalized payload
      const pricingsData: any[] = Array.isArray(payload?.pricings)
        ? payload.pricings
        : Array.isArray(payload)
        ? payload
        : [];
      
      if (pricingsData.length === 0) {
        setCustomersWithPricing([]);
        return;
      }

      // Transform flat pricing entries into CustomerPricing objects grouped by customer.
      // Many APIs return one row per line-item; UI expects `CustomerPricing` with `line_items`.
      const byCustomer: Record<number, { id: number; name: string; line_items: any[] }> = {};

      pricingsData.forEach((row: any) => {
        const cid = row.customer_id;
        if (!byCustomer[cid]) {
          byCustomer[cid] = { id: cid, name: row.customer_name || `Customer ${cid}`, line_items: [] };
        }

        // Map API row to a line item shape
        const lineItem: CustomerPricingLineItem = {
          id: row.id,
          product_id: row.product_id,
          product_name: row.product_name,
          manufacturer_id: row.manufacturer_id,
          manufacturer_name: row.manufacturer_name,
          rate: row.rate ?? 0,
          account: row.account ?? 'SALES_REVENUE',
          description: row.description || row.notes || '',
          effective_from: row.effective_from || null,
          effective_to: row.effective_to || null,
          is_active: row.is_active ?? true,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };

        byCustomer[cid].line_items.push(lineItem);
      });

      // Convert to CustomerWithPricing[] where each customer has one pricing record containing all line items
      const customersArr: CustomerWithPricing[] = Object.values(byCustomer).map(c => ({
        id: c.id,
        name: c.name,
        pricings: [
          {
            customer_id: c.id,
            customer_name: c.name,
            line_items: c.line_items,
          },
        ],
      }));

      setCustomersWithPricing(customersArr);
    } catch (err) {
      console.error('Failed to fetch customer pricing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer pricing');
      setCustomersWithPricing([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Form handlers ──────────────────────────────────────────────────────────

  const openEdit = (pricing?: CustomerPricing) => {
    setSelectedPricing(pricing);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  const openView = (pricing: CustomerPricing) => {
    setSelectedPricing(pricing);
    setIsViewMode(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPricing(undefined);
    setIsViewMode(false);
  };

  const handleFormSubmit = async (data: CreateCustomerPricingRequest) => {
    try {
      setError(null);
      if (!getToken()) { setError('Authentication token not found'); return; }

      if (selectedPricing?.id) {
        // Update individual pricing record
        await customerPricingService.update(selectedPricing.id, {
          rate: data.line_items[0]?.rate || 0,
          account: data.line_items[0]?.account || 'SALES_REVENUE',
          description: data.line_items[0]?.description,
          is_active: true,
        });
        setSuccessMessage('Customer pricing updated successfully');
      } else {
        // Create new customer pricing with line items
        await customerPricingService.create(data);
        setSuccessMessage('Customer pricing created successfully');
      }

      await fetchCustomerPricings();
      handleFormClose();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer pricing');
    }
  };

  const handleDeletePricing = async (pricingId: string) => {
    try {
      setError(null);
      if (!getToken()) { setError('Authentication token not found'); return; }

      await customerPricingService.delete(pricingId);
      setSuccessMessage('Pricing record deleted successfully');
      await fetchCustomerPricings();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pricing');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3, bgcolor: '#F7F8FA', minHeight: '100vh' }}>
      {/* ── Page header ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontSize: 20, fontWeight: 500 }}>
            Customer pricing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Manage manufacturer rates per customer
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEdit()}
          sx={{
            bgcolor: '#185FA5',
            '&:hover': { bgcolor: '#0C447C' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 13,
            boxShadow: 'none',
          }}
        >
          Add pricing
        </Button>
      </Box>

      {/* ── Alerts ── */}
      <Collapse in={!!successMessage}>
        <Alert
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          severity="success"
          sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
        >
          {successMessage}
        </Alert>
      </Collapse>
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
          {error}
        </Alert>
      </Collapse>

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* ── Empty state ── */}
      {!loading && customersWithPricing.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            gap: 1,
          }}
        >
          <Typography color="text.secondary" fontSize={15}>
            No customer pricing data available
          </Typography>
          <Typography color="text.disabled" fontSize={13}>
            Click "Add pricing" to get started
          </Typography>
        </Box>
      )}

      {/* ── Customer cards ── */}
      {!loading && (
        <Stack spacing={2}>
          {customersWithPricing.map((customer, customerIdx) => {
            const avatarStyle = getAvatarStyle(customerIdx);

            return (
              <Paper
                key={customer.id}
                variant="outlined"
                sx={{ borderRadius: 3, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}
              >
                {/* Customer header */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '0.5px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: avatarStyle.bg,
                      color: avatarStyle.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(customer.name)}
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{customer.name}</Typography>
                  <Box
                    sx={{
                      ml: 'auto',
                      px: 1.25,
                      py: '2px',
                      bgcolor: '#E6F1FB',
                      color: '#185FA5',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    ID: {customer.id}
                  </Box>
                </Box>

                {/* Pricing sections */}
                {customer.pricings.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 3, fontSize: 14 }}>
                    No pricing configured for this customer
                  </Typography>
                ) : (
                  customer.pricings.map((pricing) => {
                    const items = pricing.line_items ?? [];
                    const avg = items.length
                      ? items.reduce((s, i) => s + i.rate, 0) / items.length
                      : 0;
                    const min = items.length ? Math.min(...items.map((i) => i.rate)) : 0;
                    const max = items.length ? Math.max(...items.map((i) => i.rate)) : 0;

                    return (
                      <Box key={pricing.id}>
                        {/* Section toolbar */}
                        <Box
                          sx={{
                            px: 2.5,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: '#F7F8FA',
                            borderBottom: '0.5px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                            {items.length} {items.length === 1 ? 'record' : 'records'}
                          </Typography>
                          <Stack direction="row" spacing={0.75}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => openView(pricing)}
                              sx={smBtnSx}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<EditIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => openEdit(pricing)}
                              sx={smBtnSx}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </Box>

                        {/* Line items table */}
                        <TableContainer>
                          <Table size="small" sx={{ tableLayout: 'fixed' }}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#F7F8FA' }}>
                                {[
                                  'Product',
                                  'Rate',
                                  'Account',
                                  'Active',
                                  'Date Range',
                                  'Description',
                                  '',
                                ].map((h, i) => (
                                  <TableCell
                                    key={h + i}
                                    align={i === 6 ? 'center' : 'left'}
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 500,
                                      color: 'text.secondary',
                                      borderBottom: '0.5px solid',
                                      borderColor: 'divider',
                                      py: 1,
                                      width:
                                        ['18%', '12%', '12%', '8%', '18%', '15%', '7%'][i],
                                    }}
                                  >
                                    {h}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map((item) => (
                                <TableRow
                                  key={item.id}
                                  hover
                                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                                >
                                  <TableCell sx={tdSx()}>
                                    {item.product_name || '—'}
                                  </TableCell>
                                  <TableCell sx={{ ...tdSx('#0F6E56'), fontWeight: 500 }}>
                                    {fmt(item.rate)}
                                  </TableCell>
                                  <TableCell sx={tdSx()}>{item.account}</TableCell>
                                  <TableCell sx={tdSx()}>
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: item.is_active ? '#15803d' : '#6b6860',
                                      }}
                                      title={item.is_active ? 'Active' : 'Inactive'}
                                    />
                                  </TableCell>
                                  <TableCell sx={tdSx('text.secondary')}>
                                    {item.effective_from || item.effective_to
                                      ? `${item.effective_from ? new Date(item.effective_from).toLocaleDateString() : 'Start'} - ${item.effective_to ? new Date(item.effective_to).toLocaleDateString() : 'End'}`
                                      : '—'}
                                  </TableCell>
                                  <TableCell sx={tdSx('text.secondary')}>
                                    {item.description || '—'}
                                  </TableCell>
                                  <TableCell align="center" sx={{ py: 0.75 }}>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        handleDeletePricing(item.id ?? '')
                                      }
                                      sx={{
                                        minWidth: 0,
                                        p: '4px 6px',
                                        color: '#A32D2D',
                                        border: '0.5px solid #F7C1C1',
                                        borderRadius: 1.5,
                                        '&:hover': { bgcolor: '#FCEBEB' },
                                      }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 15 }} />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Metric strip */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1.25,
                            px: 2.5,
                            py: 1.75,
                            bgcolor: '#F7F8FA',
                            borderTop: '0.5px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <MetricCard label="Total manufacturers" value={String(items.length)} />
                          <MetricCard label="Average rate" value={fmt(avg)} accent />
                          <MetricCard label="Lowest rate" value={fmt(min)} />
                          <MetricCard label="Highest rate" value={fmt(max)} />
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* ── Form dialog ── */}
      <Dialog open={isFormOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <CustomerPricingForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={selectedPricing}
          isViewMode={isViewMode}
        />
      </Dialog>
    </Box>
  );
}

// ─── Style helpers (avoids repetition inside JSX) ─────────────────────────────

const smBtnSx = {
  fontSize: 12,
  textTransform: 'none',
  fontWeight: 400,
  color: 'text.secondary',
  border: '0.5px solid',
  borderColor: 'divider',
  borderRadius: 1.5,
  px: 1.25,
  py: '3px',
  minWidth: 0,
  '&:hover': { bgcolor: 'background.default', color: 'text.primary' },
} as const;

const tdSx = (color?: string) =>
  ({
    fontSize: 13,
    color: color ?? 'text.primary',
    borderBottom: '0.5px solid',
    borderColor: 'divider',
    py: 1.1,
  } as const);