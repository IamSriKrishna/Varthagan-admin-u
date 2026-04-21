'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Stack,
  InputAdornment,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SalesOrder } from '@/models/salesOrder.model';
import { useTax } from '@/hooks/useTax';
import { calculateSubtotal, calculateTax, calculateTotal } from './salesOrderForm.utils';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface SalesOrderBillingProps {
  formik: FormikProps<SalesOrder>;
}

interface TaxOption {
  id: number;
  name: string;
  rate: number;
  tax_type: string;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.9rem',
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f172a' },
};

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} mb={0.75}>
      <Typography sx={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      {optional && (
        <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>(optional)</Typography>
      )}
    </Stack>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  large,
  positive,
}: {
  label: string;
  value: string;
  muted?: boolean;
  large?: boolean;
  positive?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        sx={{
          fontSize: large ? '0.9rem' : '0.85rem',
          fontWeight: large ? 700 : 500,
          color: muted ? '#94a3b8' : large ? '#0f172a' : '#475569',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: large ? '1.1rem' : '0.875rem',
          fontWeight: large ? 800 : 600,
          color: positive ? '#16a34a' : large ? '#0f172a' : '#1e293b',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: large ? '-0.02em' : 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function SalesOrderBilling({ formik }: SalesOrderBillingProps) {
  const { taxes, loading: loadingTaxes } = useTax();
  const [taxOptions, setTaxOptions] = useState<TaxOption[]>([]);

  useEffect(() => {
    if (taxes && Array.isArray(taxes)) {
      setTaxOptions(taxes);
      if (formik.values.tax_id && !formik.values.tax) {
        const found = taxes.find((t) => t.id === formik.values.tax_id);
        if (found) formik.setFieldValue('tax', found);
      }
    }
  }, [taxes]);

  const handleTaxChange = (value: any) => {
    formik.setFieldValue('tax_id', value?.id ?? 0);
    formik.setFieldValue('tax', value ?? undefined);
    formik.setFieldTouched('tax_id', true);
  };

  const currentTax = taxOptions.find((t) => t.id === formik.values.tax_id) || null;

  const subtotal = calculateSubtotal(formik.values);
  const taxAmount = calculateTax(formik.values);
  const shipping = formik.values.shipping_charges || 0;
  const adjustment = formik.values.adjustment || 0;
  const total = calculateTotal(formik.values);
  const lineCount = formik.values.line_items?.length || 0;

  return (
    <Stack spacing={3}>
      {/* ── Charges Card ── */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <PaymentOutlinedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Billing & Charges
              </Typography>
              <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                Tax rate, shipping, and adjustments
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            {/* Tax */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Tax *" />
              <Autocomplete
                options={taxOptions}
                getOptionLabel={(o) => `${o.name} (${o.rate}%)`}
                value={currentTax}
                onChange={(_, v) => handleTaxChange(v)}
                onBlur={() => formik.setFieldTouched('tax_id', true)}
                isOptionEqualToValue={(o, v) => o.id === v?.id}
                loading={loadingTaxes}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ py: '10px !important', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1.5,
                        bgcolor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16a34a',
                        flexShrink: 0,
                      }}
                    >
                      <PercentOutlinedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{option.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {option.rate}% · {option.tax_type}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select tax rate…"
                    error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                    helperText={formik.touched.tax_id && formik.errors.tax_id}
                    sx={fieldSx}
                  />
                )}
              />
            </Grid>

            {/* Shipping */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Shipping Charges" optional />
              <TextField
                name="shipping_charges"
                type="number"
                value={formik.values.shipping_charges}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>₹</Typography>
                    </InputAdornment>
                  ),
                }}
                error={formik.touched.shipping_charges && Boolean(formik.errors.shipping_charges)}
                helperText={formik.touched.shipping_charges && formik.errors.shipping_charges}
                sx={fieldSx}
              />
            </Grid>

            {/* Adjustment */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Adjustment" optional />
              <TextField
                name="adjustment"
                type="number"
                value={formik.values.adjustment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>₹</Typography>
                    </InputAdornment>
                  ),
                }}
                error={formik.touched.adjustment && Boolean(formik.errors.adjustment)}
                helperText={formik.touched.adjustment && formik.errors.adjustment}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Order Summary Card ── */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Order Summary
              </Typography>
              <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                {lineCount} line item{lineCount !== 1 ? 's' : ''} · all amounts in INR
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            <SummaryRow
              label="Subtotal"
              value={`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            />
            <SummaryRow
              label={`Tax (${formik.values.tax?.rate || 0}%)`}
              value={`₹${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              muted={taxAmount === 0}
            />
            <SummaryRow
              label="Shipping"
              value={`₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              muted={shipping === 0}
            />
            {adjustment > 0 && (
              <SummaryRow
                label="Adjustment"
                value={`₹${adjustment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              />
            )}

            <Divider sx={{ borderColor: '#f1f5f9', my: 0.5 }} />

            {/* Total highlight */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 2,
                bgcolor: '#0f172a',
                borderRadius: 2.5,
              }}
            >
              <Stack>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>
                  Total Amount
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  Including all taxes & charges
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}