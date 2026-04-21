'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  Button,
  Tooltip,
  alpha,
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { PurchaseOrder } from '@/models/purchaseOrder.model';
import { vendorService } from '@/lib/api/vendorService';
import { customerService } from '@/lib/api/customerService';
import { Vendor } from '@/models/vendor.model';
import { Customer } from '@/models/customer.model';
import { PAYMENT_TERMS, SHIPMENT_PREFERENCES } from '@/constants/purchaseOrder.constants';
import { companyApi } from '@/lib/api/companyApi';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand: '#2563EB', brandLight: '#EFF6FF', brandBorder: '#BFDBFE',
  bg: '#FFFFFF', bgMuted: '#F8FAFC', bgHover: '#F1F5F9',
  border: '#E2E8F0', borderMd: '#CBD5E1',
  text: '#0F172A', textSub: '#475569', textMuted: '#64748B', textHint: '#94A3B8',
  error: '#DC2626', errorBg: '#FEF2F2',
  radius: '10px', radiusSm: '7px',
  shadow: '0 1px 2px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.04)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: T.radiusSm, fontSize: '0.875rem', background: T.bg,
    '& fieldset': { borderColor: T.border, borderWidth: '0.5px' },
    '&:hover fieldset': { borderColor: T.borderMd },
    '&.Mui-focused fieldset': { borderColor: '#93C5FD', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem', color: T.textMuted },
  '& .MuiInputLabel-root.Mui-focused': { color: T.brand },
};

const selectSx = {
  borderRadius: T.radiusSm, fontSize: '0.875rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border, borderWidth: '0.5px', borderRadius: T.radiusSm },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.borderMd },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD', borderWidth: '1.5px' },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon, iconBg, iconColor, label, children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        background: T.bg,
        border: `0.5px solid ${T.border}`,
        borderRadius: T.radius,
        boxShadow: T.shadow,
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: 2.5, py: 1.75,
          background: T.bgMuted,
          borderBottom: `0.5px solid ${T.border}`,
        }}
      >
        <Box
          sx={{
            width: 30, height: 30, borderRadius: '8px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor, flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text, letterSpacing: '-0.1px' }}
        >
          {label}
        </Typography>
      </Box>
      {/* Section body */}
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Typography component="label" sx={{ fontSize: '0.72rem', fontWeight: 600, color: T.textSub, letterSpacing: '0.2px' }}>
        {label}{required && <Box component="span" sx={{ color: T.error, ml: '2px' }}>*</Box>}
      </Typography>
      {children}
      {error && (
        <Typography sx={{ fontSize: '0.7rem', color: T.error, mt: '1px' }}>{error}</Typography>
      )}
    </Box>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateReferenceNumber = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PO-${ts}-${rnd}`;
};

// ─── Component ────────────────────────────────────────────────────────────────
interface PurchaseOrderBasicInfoProps { formik: FormikProps<PurchaseOrder>; }

export const PurchaseOrderBasicInfo: React.FC<PurchaseOrderBasicInfoProps> = ({ formik }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    companyApi.getCompaniesList(1, 100).then((r) => {
      setCompanyName(r.data?.[0]?.company?.company_name || 'Your Company');
    }).catch(() => setCompanyName('Your Company'));
  }, []);

  useEffect(() => {
    setLoadingVendors(true);
    vendorService.getVendors(1, 1000)
      .then((r) => { if (r.success && r.data) setVendors(r.data); })
      .catch(console.error)
      .finally(() => setLoadingVendors(false));

    setLoadingCustomers(true);
    customerService.getCustomers(1, 1000)
      .then((r) => { if (r.success && r.data) setCustomers(r.data); })
      .catch(console.error)
      .finally(() => setLoadingCustomers(false));
  }, []);

  useEffect(() => {
    if (formik.values.delivery_address_type === 'organization' && companyName) {
      formik.setFieldValue('customer_id', undefined);
      formik.setFieldValue('organization_name', companyName);
    }
  }, [formik.values.delivery_address_type, companyName]);

  const isOrg = formik.values.delivery_address_type === 'organization';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Vendor ──────────────────────────────────────────────────────── */}
      <Section
        label="Vendor"
        icon={<StoreIcon sx={{ fontSize: 15 }} />}
        iconBg={T.brandLight}
        iconColor={T.brand}
      >
        <Field
          label="Select vendor"
          required
          error={formik.touched.vendor_id && formik.errors.vendor_id ? String(formik.errors.vendor_id) : undefined}
        >
          <FormControl fullWidth size="small">
            <Select
              name="vendor_id"
              value={formik.values.vendor_id ? String(formik.values.vendor_id) : ''}
              onChange={(e) => formik.setFieldValue('vendor_id', e.target.value ? parseInt(e.target.value, 10) : 0)}
              onBlur={formik.handleBlur}
              displayEmpty
              error={formik.touched.vendor_id && Boolean(formik.errors.vendor_id)}
              sx={selectSx}
            >
              <MenuItem value=""><em style={{ color: T.textHint, fontStyle: 'normal' }}>Choose a vendor…</em></MenuItem>
              {vendors.map((v: any) => (
                <MenuItem key={v.id} value={v.id} sx={{ fontSize: '0.875rem' }}>{v.display_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Field>
      </Section>

      {/* ── Delivery address ────────────────────────────────────────────── */}
      <Section
        label="Delivery address"
        icon={<PersonIcon sx={{ fontSize: 15 }} />}
        iconBg="#F0FDF4"
        iconColor="#16A34A"
      >
        {/* Address type toggle */}
        <Box
          sx={{
            display: 'flex',
            p: '3px',
            borderRadius: '8px',
            background: T.bgHover,
            border: `0.5px solid ${T.border}`,
            width: 'fit-content',
            mb: 2.5,
            gap: '3px',
          }}
        >
          {(['organization', 'customer'] as const).map((type) => (
            <Box
              key={type}
              onClick={() => formik.setFieldValue('delivery_address_type', type)}
              sx={{
                px: 2, py: 0.75, borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                background: formik.values.delivery_address_type === type ? T.bg : 'transparent',
                color: formik.values.delivery_address_type === type ? T.text : T.textMuted,
                border: formik.values.delivery_address_type === type ? `0.5px solid ${T.border}` : '0.5px solid transparent',
                boxShadow: formik.values.delivery_address_type === type ? T.shadow : 'none',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isOrg ? (
            <>
              <Field label="Organization name" required
                error={formik.touched.organization_name && formik.errors.organization_name ? String(formik.errors.organization_name) : undefined}>
                <TextField
                  fullWidth size="small" name="organization_name"
                  value={formik.values.organization_name}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.organization_name && Boolean(formik.errors.organization_name)}
                  placeholder="e.g. Acme Corp" sx={inputSx}
                />
              </Field>
              <Field label="Delivery address" required
                error={formik.touched.organization_address && formik.errors.organization_address ? String(formik.errors.organization_address) : undefined}>
                <TextField
                  fullWidth size="small" name="organization_address" multiline rows={3}
                  value={formik.values.organization_address}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.organization_address && Boolean(formik.errors.organization_address)}
                  placeholder="Street, City, State, ZIP" sx={inputSx}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Select customer" required
                error={formik.touched.customer_id && formik.errors.customer_id ? String(formik.errors.customer_id) : undefined}>
                <FormControl fullWidth size="small">
                  <Select
                    name="customer_id"
                    value={formik.values.customer_id ? String(formik.values.customer_id) : ''}
                    onChange={async (e) => {
                      const id = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      formik.setFieldValue('customer_id', id);
                      if (id) {
                        try {
                          const r = await customerService.getCustomer(id);
                          if (r.success && r.data) {
                            const c = r.data;
                            formik.setFieldValue('organization_name', c.display_name || c.first_name || '');
                            const addr = c.billing_address || c.shipping_address;
                            const lines = [addr?.address_line1, addr?.address_line2].filter(Boolean).join('\n');
                            formik.setFieldValue('organization_address', lines || 'No address available');
                          }
                        } catch { formik.setFieldValue('organization_name', ''); formik.setFieldValue('organization_address', ''); }
                      } else {
                        formik.setFieldValue('organization_name', '');
                        formik.setFieldValue('organization_address', '');
                      }
                    }}
                    onBlur={formik.handleBlur}
                    displayEmpty
                    error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                    sx={selectSx}
                  >
                    <MenuItem value=""><em style={{ color: T.textHint, fontStyle: 'normal' }}>Choose a customer…</em></MenuItem>
                    {customers.map((c: any) => (
                      <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.875rem' }}>{c.display_name || c.first_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Field>
              <Field label="Delivery address" required
                error={formik.touched.organization_address && formik.errors.organization_address ? String(formik.errors.organization_address) : undefined}>
                <TextField
                  fullWidth size="small" name="organization_address" multiline rows={3}
                  value={formik.values.organization_address}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.organization_address && Boolean(formik.errors.organization_address)}
                  placeholder="Auto-populated from customer" sx={inputSx}
                />
              </Field>
            </>
          )}
        </Box>
      </Section>

      {/* ── Order details ────────────────────────────────────────────────── */}
      <Section
        label="Order details"
        icon={<ReceiptLongIcon sx={{ fontSize: 15 }} />}
        iconBg="#FFF7ED"
        iconColor="#D97706"
      >
        <Grid container spacing={2}>
          {/* Reference Number */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Field label="Reference number" required
              error={formik.touched.reference_no && formik.errors.reference_no ? String(formik.errors.reference_no) : undefined}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth size="small" name="reference_no"
                  value={formik.values.reference_no}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.reference_no && Boolean(formik.errors.reference_no)}
                  placeholder="e.g. PO-001" sx={{ ...inputSx, flex: 1 }}
                />
                <Tooltip title="Auto-generate" arrow placement="top">
                  <Box
                    onClick={() => formik.setFieldValue('reference_no', generateReferenceNumber())}
                    sx={{
                      width: 36, height: 36, borderRadius: T.radiusSm, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: T.bgMuted, border: `0.5px solid ${T.border}`,
                      color: T.textMuted, cursor: 'pointer', transition: 'all 0.15s',
                      '&:hover': { background: T.brandLight, borderColor: T.brandBorder, color: T.brand },
                    }}
                  >
                    <AutorenewIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Tooltip>
              </Box>
            </Field>
          </Grid>

          {/* Order Date */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Field label="Order date" required
              error={formik.touched.date && formik.errors.date ? String(formik.errors.date) : undefined}>
              <TextField
                fullWidth size="small" name="date" type="date"
                value={formik.values.date}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.date && Boolean(formik.errors.date)}
                InputLabelProps={{ shrink: true }} sx={inputSx}
              />
            </Field>
          </Grid>

          {/* Delivery Date */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Field label="Delivery date" required
              error={formik.touched.delivery_date && formik.errors.delivery_date ? String(formik.errors.delivery_date) : undefined}>
              <TextField
                fullWidth size="small" name="delivery_date" type="date"
                value={formik.values.delivery_date}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.delivery_date && Boolean(formik.errors.delivery_date)}
                InputLabelProps={{ shrink: true }} sx={inputSx}
              />
            </Field>
          </Grid>

          {/* Payment Terms */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Field label="Payment terms" required
              error={formik.touched.payment_terms && formik.errors.payment_terms ? String(formik.errors.payment_terms) : undefined}>
              <FormControl fullWidth size="small">
                <Select
                  name="payment_terms" value={formik.values.payment_terms}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  displayEmpty
                  error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
                  sx={selectSx}
                >
                  <MenuItem value=""><em style={{ color: T.textHint, fontStyle: 'normal' }}>Select terms…</em></MenuItem>
                  {PAYMENT_TERMS.map((t) => (
                    <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.875rem' }}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Field>
          </Grid>

          {/* Shipment Preference */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Field label="Shipment preference" required
              error={formik.touched.shipment_preference && formik.errors.shipment_preference ? String(formik.errors.shipment_preference) : undefined}>
              <FormControl fullWidth size="small">
                <Select
                  name="shipment_preference" value={formik.values.shipment_preference}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  displayEmpty
                  error={formik.touched.shipment_preference && Boolean(formik.errors.shipment_preference)}
                  sx={selectSx}
                >
                  <MenuItem value=""><em style={{ color: T.textHint, fontStyle: 'normal' }}>Select preference…</em></MenuItem>
                  {SHIPMENT_PREFERENCES.map((p) => (
                    <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.875rem' }}>{p.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Field>
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default PurchaseOrderBasicInfo;