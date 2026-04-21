'use client';

import React, { useMemo } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  Fade,
  Typography,
  Divider,
} from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { PurchaseOrder, Tax } from '@/models/purchaseOrder.model';
import { DISCOUNT_TYPES, TAX_TYPES } from '@/constants/purchaseOrder.constants';
import {
  calculateSubTotal,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateTotal,
} from './purchaseOrderForm.utils';
import { useTax } from '@/hooks/useTax';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand: '#2563EB', brandLight: '#EFF6FF', brandBorder: '#BFDBFE',
  bg: '#FFFFFF', bgMuted: '#F8FAFC', bgHover: '#F1F5F9',
  border: '#E2E8F0', borderMd: '#CBD5E1',
  text: '#0F172A', textMd: '#1E293B', textSub: '#475569', textMuted: '#64748B', textHint: '#94A3B8',
  success: '#15803D', successBg: '#F0FDF4', successBdr: '#86EFAC',
  error: '#DC2626', errorBg: '#FEF2F2',
  amber: '#D97706', amberBg: '#FFFBEB', amberBdr: '#FDE68A',
  violet: '#7C3AED', violetBg: '#F5F3FF', violetBdr: '#DDD6FE',
  teal: '#0D9488', tealBg: '#F0FDFA', tealBdr: '#99F6E4',
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
  icon, iconBg, iconColor, label, children,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; children: React.ReactNode;
}) {
  return (
    <Box sx={{ background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadow, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.75, background: T.bgMuted, borderBottom: `0.5px solid ${T.border}` }}>
        <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text, letterSpacing: '-0.1px' }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: T.textSub, letterSpacing: '0.2px' }}>
        {label}{required && <Box component="span" sx={{ color: T.error, ml: '2px' }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

function SummaryRow({
  label, value, color, prefix = '+', variant = 'normal',
}: {
  label: string; value: string; color?: string; prefix?: string; variant?: 'normal' | 'total';
}) {
  if (variant === 'total') {
    return (
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 2,
          background: `linear-gradient(135deg, ${T.brand} 0%, #0EA5E9 100%)`,
          borderRadius: T.radiusSm, mt: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          Grand total
        </Typography>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
          ₹ {value}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: color || T.textMd, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface PurchaseOrderBillingProps { formik: FormikProps<PurchaseOrder>; }

export const PurchaseOrderBilling: React.FC<PurchaseOrderBillingProps> = ({ formik }) => {
  const { taxes } = useTax();

  const calc = useMemo(() => {
    const sub = calculateSubTotal(formik.values.line_items);
    const disc = calculateDiscountAmount(sub, formik.values.discount, formik.values.discount_type);
    const selectedTax = taxes.find((t: Tax) => t.id === formik.values.tax_id);
    const taxRate = selectedTax?.rate || 0;
    const tax = calculateTaxAmount(sub, formik.values.discount, formik.values.discount_type, taxRate);
    const total = calculateTotal(sub, formik.values.discount, formik.values.discount_type, tax, formik.values.adjustment);
    return {
      sub:  Number(sub)  || 0,
      disc: Number(disc) || 0,
      tax:  Number(tax)  || 0,
      total: Number(total) || 0,
    };
  }, [formik.values.line_items, formik.values.discount, formik.values.discount_type, formik.values.tax_id, formik.values.adjustment, taxes]);

  const selectedTax: Tax | undefined = taxes.find((t: Tax) => t.id === formik.values.tax_id);
  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* Two-column layout on md+ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 2.5, alignItems: 'start' }}>

        {/* ── Left: input sections ───────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Discount */}
          <Section label="Discount" icon={<PercentIcon sx={{ fontSize: 14 }} />} iconBg={T.amberBg} iconColor={T.amber}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <Field label="Discount type">
                  <FormControl fullWidth size="small">
                    <Select
                      name="discount_type" value={formik.values.discount_type}
                      onChange={formik.handleChange} sx={selectSx}
                    >
                      {DISCOUNT_TYPES.map((d) => (
                        <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.875rem' }}>{d.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <Field label={`Discount ${formik.values.discount_type === 'percentage' ? '(%)' : '(₹)'}`}>
                  <TextField
                    fullWidth size="small" name="discount" type="number"
                    inputProps={{ step: '0.01' }}
                    value={formik.values.discount}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.discount && Boolean(formik.errors.discount)}
                    helperText={formik.touched.discount && formik.errors.discount ? String(formik.errors.discount) : undefined}
                    sx={inputSx}
                  />
                </Field>
              </Grid>
            </Grid>
          </Section>

          {/* Tax */}
          <Section label="Tax" icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 14 }} />} iconBg={T.violetBg} iconColor={T.violet}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <Field label="Tax type">
                  <FormControl fullWidth size="small">
                    <Select
                      name="tax_type" value={formik.values.tax_type}
                      onChange={formik.handleChange} sx={selectSx}
                    >
                      {TAX_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.875rem' }}>{t.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <Field label="Tax rate" required>
                  <Autocomplete
                    size="small"
                    options={taxes}
                    getOptionLabel={(o) => `${o.name} (${o.rate}%)`}
                    value={selectedTax || null}
                    onChange={(_, val) => formik.setFieldValue('tax_id', val?.id || 0)}
                    renderInput={(params) => (
                      <TextField
                        {...params} placeholder="Select tax…"
                        error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                        helperText={formik.touched.tax_id && formik.errors.tax_id ? String(formik.errors.tax_id) : undefined}
                        sx={inputSx}
                      />
                    )}
                  />
                </Field>
              </Grid>
            </Grid>
          </Section>

          {/* Adjustment */}
          <Section label="Adjustment" icon={<TuneOutlinedIcon sx={{ fontSize: 14 }} />} iconBg={T.tealBg} iconColor={T.teal}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <Field label="Adjustment amount (₹)">
                  <TextField
                    fullWidth size="small" name="adjustment" type="number"
                    inputProps={{ step: '0.01' }}
                    value={formik.values.adjustment}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="0.00"
                    sx={inputSx}
                  />
                </Field>
              </Grid>
            </Grid>
          </Section>

          {/* Notes */}
          <Section label="Notes & terms" icon={<NoteOutlinedIcon sx={{ fontSize: 14 }} />} iconBg={T.bgHover} iconColor={T.textMuted}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field label="Notes">
                <TextField
                  fullWidth size="small" name="notes" multiline rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Add any additional notes…" sx={inputSx}
                />
              </Field>
              <Field label="Terms & conditions">
                <TextField
                  fullWidth size="small" name="terms_and_conditions" multiline rows={3}
                  value={formik.values.terms_and_conditions}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Enter terms and conditions…" sx={inputSx}
                />
              </Field>
            </Box>
          </Section>
        </Box>

        {/* ── Right: order summary ──────────────────────────────────────── */}
        <Fade in timeout={300}>
          <Box
            sx={{
              background: T.bg, border: `0.5px solid ${T.border}`,
              borderRadius: T.radius, overflow: 'hidden', boxShadow: T.shadow,
              position: { md: 'sticky' }, top: { md: 24 },
            }}
          >
            {/* Summary header */}
            <Box sx={{ px: 2.5, py: 1.75, background: T.bgMuted, borderBottom: `0.5px solid ${T.border}` }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text }}>
                Order summary
              </Typography>
            </Box>

            <Box sx={{ px: 2.5, py: 2 }}>
              {/* Line count */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 1.25, mb: 2,
                  background: T.bgMuted, borderRadius: T.radiusSm,
                  border: `0.5px solid ${T.border}`,
                }}
              >
                <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>
                  Line items
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.textMd }}>
                  {formik.values.line_items.length}
                </Typography>
              </Box>

              <SummaryRow label="Subtotal" value={`₹ ${fmt(calc.sub)}`} />

              {calc.disc > 0 && (
                <SummaryRow
                  label={`Discount (${formik.values.discount_type === 'percentage' ? `${formik.values.discount}%` : `₹${formik.values.discount}`})`}
                  value={`− ₹ ${fmt(calc.disc)}`}
                  color={T.amber}
                />
              )}

              {calc.tax > 0 && (
                <SummaryRow
                  label={`${selectedTax?.name || 'Tax'} (${selectedTax?.rate ?? 0}%)`}
                  value={`+ ₹ ${fmt(calc.tax)}`}
                  color={T.violet}
                />
              )}

              {Number(formik.values.adjustment) !== 0 && (
                <SummaryRow
                  label="Adjustment"
                  value={`${Number(formik.values.adjustment) > 0 ? '+ ' : '− '}₹ ${fmt(Math.abs(Number(formik.values.adjustment)))}`}
                  color={T.teal}
                />
              )}

              <Divider sx={{ my: 1.5, borderColor: T.border, borderWidth: '0.5px' }} />

              <SummaryRow label="Grand total" value={fmt(calc.total)} variant="total" />

              {/* Breakdown mini-grid */}
              {(calc.disc > 0 || calc.tax > 0) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2 }}>
                  {calc.disc > 0 && (
                    <Box sx={{ p: 1.25, borderRadius: T.radiusSm, background: T.amberBg, border: `0.5px solid ${T.amberBdr}` }}>
                      <Typography sx={{ fontSize: '0.65rem', color: T.amber, fontWeight: 600, mb: '2px' }}>Discount</Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.amber, fontVariantNumeric: 'tabular-nums' }}>
                        − ₹ {fmt(calc.disc)}
                      </Typography>
                    </Box>
                  )}
                  {calc.tax > 0 && (
                    <Box sx={{ p: 1.25, borderRadius: T.radiusSm, background: T.violetBg, border: `0.5px solid ${T.violetBdr}` }}>
                      <Typography sx={{ fontSize: '0.65rem', color: T.violet, fontWeight: 600, mb: '2px' }}>
                        {selectedTax?.name || 'Tax'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.violet, fontVariantNumeric: 'tabular-nums' }}>
                        + ₹ {fmt(calc.tax)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default PurchaseOrderBilling;