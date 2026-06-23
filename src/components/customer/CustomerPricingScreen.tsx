
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, CircularProgress, Typography,
  Stack, Collapse, IconButton, Tooltip, Avatar,
} from '@mui/material';
import {
  Plus, Eye, PencilLine, Trash2, CheckCircle2, AlertCircle,
  TrendingUp, TrendingDown, Layers, BarChart3, Users, X,
} from 'lucide-react';
import {
  CustomerPricing, CreateCustomerPricingRequest, CustomerPricingLineItem,
} from '@/models/customerPricing.model';
import { customerPricingService } from '@/lib/api/customerPricing.service';
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import CustomerPricingForm from './CustomerPricingForm';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  pageBg: '#F7F8FC',
  cardBg: '#FFFFFF',
  subtleBg: '#F4F5F9',

  brand: '#4F46E5',
  brandMid: '#818CF8',
  brandSoft: '#EEF2FF',
  brandXSoft: '#F5F3FF',
  brandDark: '#3730A3',
  brandGlow: 'rgba(79,70,229,0.18)',

  success: '#059669',
  successSoft: '#ECFDF5',
  successMid: '#6EE7B7',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerMid: '#FECACA',
  warning: '#D97706',
  warningSoft: '#FFFBEB',

  text: '#0F172A',
  textMid: '#334155',
  textLight: '#64748B',
  textXLight: '#CBD5E1',

  border: '#E8EBF2',
  borderMid: '#D1D5DB',

  shadowSm: '0 2px 8px rgba(15,23,42,0.07)',
  shadowMd: '0 4px 16px rgba(15,23,42,0.10)',
  shadowBrand: '0 4px 18px rgba(79,70,229,0.30)',
  shadowBrandHover: '0 8px 28px rgba(79,70,229,0.40)',
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CustomerPricingScreenProps {
  customerId?: number;
  customerName?: string;
}

interface CustomerWithPricing {
  id: number;
  name: string;
  pricings: CustomerPricing[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const root = localStorage.getItem(localStorageAuthKey);
    if (!root) return '';
    const auth = JSON.parse(JSON.parse(root).auth) as LoginResponse;
    return auth.access_token || '';
  } catch { return ''; }
};

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

const fmt = (n: number) => `₹ ${n.toFixed(2)}`;

function colorFromString(str: string) {
  const palette = [
    { bg: '#EEF2FF', fg: '#4F46E5' },
    { bg: '#F0FDF4', fg: '#059669' },
    { bg: '#FFF7ED', fg: '#D97706' },
    { bg: '#FDF2F8', fg: '#BE185D' },
    { bg: '#EFF6FF', fg: '#1D4ED8' },
    { bg: '#F5F3FF', fg: '#7C3AED' },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string; icon?: any; accent?: string;
}) {
  const a = accent ?? T.brand;
  return (
    <Box sx={{
      flex: '1 1 0', minWidth: 0, px: 2, py: 1.75,
      background: T.cardBg, border: `1.5px solid ${T.border}`,
      borderRadius: '12px', boxShadow: T.shadowSm,
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: T.shadowMd },
      '&::before': {
        content: '""', position: 'absolute', top: 0, right: 0,
        width: 64, height: 64, borderRadius: '50%',
        background: `radial-gradient(circle, ${a}18 0%, transparent 70%)`,
        transform: 'translate(16px, -16px)',
      },
    }}>
      {Icon && (
        <Box sx={{ display: 'inline-flex', p: 0.6, borderRadius: '7px', background: `${a}15`, mb: 0.75 }}>
          <Icon size={13} color={a} strokeWidth={2.5} />
        </Box>
      )}
      <Typography sx={{ color: T.textLight, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.2 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1.2rem', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function CustomerPricingScreen({ customerId, customerName }: CustomerPricingScreenProps) {
  const [customersWithPricing, setCustomersWithPricing] = useState<CustomerWithPricing[]>([]);
  const [selectedPricing, setSelectedPricing]           = useState<CustomerPricing | undefined>();
  const [isFormOpen, setIsFormOpen]                     = useState(false);
  const [isViewMode, setIsViewMode]                     = useState(false);
  const [loading, setLoading]                           = useState(false);
  const [error, setError]                               = useState<string | null>(null);
  const [successMessage, setSuccessMessage]             = useState<string | null>(null);

  useEffect(() => { fetchCustomerPricings(); }, [customerId]);

  const fetchCustomerPricings = async () => {
    setLoading(true); setError(null);
    try {
      if (!getToken()) { setError('Authentication token not found'); return; }
      const apiResp = customerId
        ? await customerPricingService.getByCustomerId(customerId, 100, 0)
        : await customerPricingService.list(100, 0);

      let payload: any = apiResp;
      if (apiResp && typeof apiResp === 'object') {
        if (apiResp.data) payload = apiResp.data;
        if (payload?.data) payload = payload.data;
      }

      const pricingsData: any[] = Array.isArray(payload?.pricings) ? payload.pricings : Array.isArray(payload) ? payload : [];
      if (!pricingsData.length) { setCustomersWithPricing([]); return; }

      const byCustomer: Record<number, { id: number; name: string; line_items: CustomerPricingLineItem[] }> = {};
      pricingsData.forEach((row: any) => {
        const cid = row.customer_id;
        if (!byCustomer[cid]) byCustomer[cid] = { id: cid, name: row.customer_name || `Customer ${cid}`, line_items: [] };
        byCustomer[cid].line_items.push({
          id: row.id, product_id: row.product_id, product_name: row.product_name,
          manufacturer_id: row.manufacturer_id, manufacturer_name: row.manufacturer_name,
          rate: row.rate ?? 0, account: row.account ?? 'SALES_REVENUE',
          description: row.description || row.notes || '',
          effective_from: row.effective_from || null, effective_to: row.effective_to || null,
          is_active: row.is_active ?? true, created_at: row.created_at, updated_at: row.updated_at,
        });
      });

      setCustomersWithPricing(Object.values(byCustomer).map(c => ({
        id: c.id, name: c.name,
        pricings: [{ customer_id: c.id, customer_name: c.name, line_items: c.line_items }],
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer pricing');
      setCustomersWithPricing([]);
    } finally { setLoading(false); }
  };

  const openEdit = (pricing?: CustomerPricing) => { setSelectedPricing(pricing); setIsViewMode(false); setIsFormOpen(true); };
  const openView = (pricing: CustomerPricing)  => { setSelectedPricing(pricing); setIsViewMode(true);  setIsFormOpen(true); };
  const handleFormClose = () => { setIsFormOpen(false); setSelectedPricing(undefined); setIsViewMode(false); };

  const handleFormSubmit = async (data: CreateCustomerPricingRequest) => {
    try {
      setError(null);
      if (!getToken()) { setError('Authentication token not found'); return; }
      if (selectedPricing?.id) {
        await customerPricingService.update(selectedPricing.id, {
          rate: data.line_items[0]?.rate || 0,
          account: data.line_items[0]?.account || 'SALES_REVENUE',
          description: data.line_items[0]?.description,
          is_active: true,
        });
        setSuccessMessage('Customer pricing updated successfully');
      } else {
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
      setSuccessMessage('Pricing record deleted');
      await fetchCustomerPricings();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pricing');
    }
  };

  return (
    <Box>
      {/* ── Toolbar ── */}
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Customer Pricing
          </Typography>
          <Typography sx={{ color: T.textLight, fontSize: '0.72rem', mt: 0.3 }}>
            {customersWithPricing.length === 0
              ? 'No customers configured yet'
              : `${customersWithPricing.length} customer${customersWithPricing.length === 1 ? '' : 's'} with pricing rules`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={15} strokeWidth={2.5} />}
          onClick={() => openEdit()}
          sx={{
            background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
            borderRadius: '11px', textTransform: 'none',
            fontWeight: 800, fontSize: '0.82rem', height: 38, px: 2.25,
            boxShadow: T.shadowBrand, border: 'none',
            '&:hover': { background: `linear-gradient(135deg, #6366F1, ${T.brand})`, boxShadow: T.shadowBrandHover, transform: 'translateY(-1.5px)' },
            transition: 'all 0.18s',
          }}
        >
          Add Pricing
        </Button>
      </Box>

      {/* ── Alerts ── */}
      <Collapse in={!!successMessage}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: 2, py: 1.5, mb: 2, borderRadius: '12px',
          background: T.successSoft, border: `1.5px solid ${T.successMid}`,
        }}>
          <Box sx={{ p: 0.5, borderRadius: '7px', background: `${T.success}15` }}>
            <CheckCircle2 size={14} color={T.success} />
          </Box>
          <Typography sx={{ color: T.success, fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>
            {successMessage}
          </Typography>
          <IconButton size="small" onClick={() => setSuccessMessage(null)} sx={{ color: T.success, borderRadius: '6px', p: 0.25 }}>
            <X size={13} />
          </IconButton>
        </Box>
      </Collapse>

      <Collapse in={!!error}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: 2, py: 1.5, mb: 2, borderRadius: '12px',
          background: T.dangerSoft, border: `1.5px solid ${T.dangerMid}`,
        }}>
          <Box sx={{ p: 0.5, borderRadius: '7px', background: `${T.danger}15` }}>
            <AlertCircle size={14} color={T.danger} />
          </Box>
          <Typography sx={{ color: T.danger, fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{error}</Typography>
          <IconButton size="small" onClick={() => setError(null)} sx={{ color: T.danger, borderRadius: '6px', p: 0.25 }}>
            <X size={13} />
          </IconButton>
        </Box>
      </Collapse>

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
          <CircularProgress size={24} sx={{ color: T.brand }} />
          <Typography sx={{ color: T.textLight, fontSize: '0.82rem' }}>Loading pricing data…</Typography>
        </Box>
      )}

      {/* ── Empty state ── */}
      {!loading && customersWithPricing.length === 0 && (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', py: 10, gap: 1,
          border: `2px dashed ${T.borderMid}`, borderRadius: '16px',
          background: T.subtleBg,
        }}>
          <Box sx={{ position: 'relative', width: 72, height: 72, mb: 1.5 }}>
            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px dashed ${T.brandMid}`, animation: 'spin 12s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
            <Box sx={{ position: 'absolute', inset: 10, borderRadius: '50%', border: `1.5px solid ${T.brandSoft}`, animation: 'spin 8s linear infinite reverse' }} />
            <Box sx={{ position: 'absolute', inset: 18, borderRadius: '50%', background: T.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color={T.brand} />
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            No pricing rules yet
          </Typography>
          <Typography sx={{ color: T.textLight, fontSize: '0.82rem', maxWidth: 240, textAlign: 'center', lineHeight: 1.6 }}>
            Add your first customer pricing rule to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={14} strokeWidth={2.5} />}
            onClick={() => openEdit()}
            sx={{
              mt: 1.5,
              background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
              borderRadius: '11px', textTransform: 'none', fontWeight: 800,
              fontSize: '0.82rem', height: 38, px: 2.5, boxShadow: T.shadowBrand,
              '&:hover': { boxShadow: T.shadowBrandHover, transform: 'translateY(-2px)' },
              transition: 'all 0.18s',
            }}
          >
            Add Pricing
          </Button>
        </Box>
      )}

      {/* ── Customer groups ── */}
      {!loading && customersWithPricing.length > 0 && (
        <Stack spacing={2} sx={{
          '& > *': { animation: 'fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both' },
          '@keyframes fadeSlideUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        }}>
          {customersWithPricing.map((customer, gi) => {
            const pricing = customer.pricings[0];
            const items   = pricing?.line_items ?? [];
            const avg = items.length ? items.reduce((s, i) => s + i.rate, 0) / items.length : 0;
            const min = items.length ? Math.min(...items.map((i) => i.rate)) : 0;
            const max = items.length ? Math.max(...items.map((i) => i.rate)) : 0;
            const { bg, fg } = colorFromString(customer.name);

            return (
              <Box
                key={customer.id}
                sx={{
                  borderRadius: '16px', overflow: 'hidden',
                  border: `1.5px solid ${T.border}`,
                  boxShadow: T.shadowSm,
                  animationDelay: `${gi * 60}ms`,
                }}
              >
                {/* Group header */}
                <Box sx={{
                  px: 2.5, py: 1.5,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  borderBottom: `1.5px solid ${T.border}`,
                  background: 'linear-gradient(180deg, #F8F9FF, #F4F5F9)',
                }}>
                  <Avatar sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: bg, color: fg,
                    fontSize: '0.72rem', fontWeight: 800,
                    fontFamily: "'DM Mono', monospace",
                    border: `1.5px solid ${fg}30`,
                    flexShrink: 0,
                  }}>
                    {getInitials(customer.name)}
                  </Avatar>

                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                      {customer.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.75} mt={0.25}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.1, borderRadius: '5px', background: T.subtleBg, border: `1px solid ${T.border}` }}>
                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: T.textLight, fontWeight: 600 }}>
                          ID: {customer.id}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: T.textLight }}>
                        · {items.length} {items.length === 1 ? 'rule' : 'rules'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={0.75} sx={{ ml: 'auto' }}>
                    <Tooltip title="View" placement="top" arrow>
                      <IconButton size="small" onClick={() => pricing && openView(pricing)} sx={{
                        color: T.textLight, background: T.cardBg, borderRadius: '9px', width: 32, height: 32,
                        border: `1.5px solid ${T.border}`,
                        '&:hover': { color: T.brand, background: T.brandSoft, borderColor: T.brandMid },
                        transition: 'all 0.15s',
                      }}>
                        <Eye size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" placement="top" arrow>
                      <IconButton size="small" onClick={() => pricing && openEdit(pricing)} sx={{
                        color: T.brand, background: T.brandSoft, borderRadius: '9px', width: 32, height: 32,
                        border: `1.5px solid ${T.brandMid}`,
                        '&:hover': { background: '#E0E7FF', transform: 'scale(1.08)', boxShadow: T.shadowBrand },
                        transition: 'all 0.15s',
                      }}>
                        <PencilLine size={14} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {items.length === 0 ? (
                  <Typography sx={{ p: 3, fontSize: '0.85rem', color: T.textLight, fontStyle: 'italic' }}>
                    No pricing rules configured for this customer.
                  </Typography>
                ) : (
                  <>
                    {/* Line items table */}
                    <TableContainer>
                      <Table size="small" sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            {['Product', 'Rate', 'Account', 'Active', 'Date Range', 'Description', ''].map((h, i) => (
                              <TableCell key={h + i} align={i === 6 ? 'center' : 'left'} sx={{
                                fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em',
                                color: T.textLight, textTransform: 'uppercase',
                                borderBottom: `2px solid ${T.border}`,
                                background: 'linear-gradient(180deg, #F8F9FF, #F4F5F9)',
                                py: 1.25, px: 2,
                                width: ['18%','12%','14%','8%','16%','22%','7%'][i] ?? 'auto',
                              }}>
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id} hover sx={{
                              '&:last-child td': { borderBottom: 0 },
                              transition: 'background 0.12s',
                              '&:hover': { background: `${T.brandXSoft}60` },
                            }}>
                              <TableCell sx={{ fontSize: '0.82rem', color: T.text, fontWeight: 600, borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2 }}>
                                {item.product_name || '—'}
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2 }}>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, color: T.text, fontSize: '0.82rem', letterSpacing: '-0.02em' }}>
                                  {fmt(item.rate)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.78rem', color: T.textLight, borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2 }}>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: '6px', background: T.subtleBg, border: `1px solid ${T.border}` }}>
                                  {item.account}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2 }}>
                                <Box sx={{
                                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                  px: 1, py: 0.3, borderRadius: '99px',
                                  background: item.is_active ? T.successSoft : T.subtleBg,
                                  border: `1px solid ${item.is_active ? T.successMid : T.border}`,
                                }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: item.is_active ? T.success : T.textXLight }} />
                                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: item.is_active ? T.success : T.textLight }}>
                                    {item.is_active ? 'Active' : 'Off'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: T.textLight, borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2, fontFamily: "'DM Mono', monospace" }}>
                                {item.effective_from || item.effective_to
                                  ? `${item.effective_from ? new Date(item.effective_from).toLocaleDateString() : 'Start'} – ${item.effective_to ? new Date(item.effective_to).toLocaleDateString() : 'End'}`
                                  : '—'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.78rem', color: T.textLight, borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description || '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: `1px solid ${T.border}`, py: 1, px: 1 }}>
                                <Tooltip title="Delete" placement="top" arrow>
                                  <IconButton size="small" onClick={() => handleDeletePricing(item.id ?? '')} sx={{
                                    color: T.danger, background: T.dangerSoft, borderRadius: '8px', width: 28, height: 28,
                                    border: `1.5px solid ${T.dangerMid}`,
                                    '&:hover': { background: '#FEE2E2', transform: 'scale(1.08)' },
                                    transition: 'all 0.15s',
                                  }}>
                                    <Trash2 size={13} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Metric strip */}
                    <Box sx={{
                      display: 'flex', gap: 1.5, px: 2.5, py: 1.75,
                      borderTop: `1.5px solid ${T.border}`,
                      background: 'linear-gradient(180deg, #FAFBFD, #F7F8FC)',
                    }}>
                      <StatCard label="Rate rules"    value={String(items.length)} icon={Layers}   accent={T.brand} />
                      <StatCard label="Avg rate"      value={fmt(avg)}             icon={BarChart3} accent="#7C3AED" />
                      <StatCard label="Lowest rate"   value={fmt(min)}             icon={TrendingDown} accent={T.success} />
                      <StatCard label="Highest rate"  value={fmt(max)}             icon={TrendingUp}   accent={T.warning} />
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {/* ── Form dialog ── */}
      <Dialog open={isFormOpen} onClose={handleFormClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden', border: `1.5px solid ${T.border}`, boxShadow: '0 24px 60px rgba(15,23,42,0.18)' } }}
      >
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