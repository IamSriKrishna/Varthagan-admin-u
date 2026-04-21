'use client';

import React, { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { Bill, Tax } from '@/models/bill.model';
import { taxService } from '@/lib/api/taxService';
import {
  calculateSubTotal,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateTotal,
} from './billForm.utils';

interface BillBillingProps {
  formik: FormikProps<Bill>;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5,
    borderRadius: '9px',
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#e0e2ee' },
    '&:hover fieldset': { borderColor: '#9196b0' },
    '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5,
    color: '#9196b0',
    '&.Mui-focused': { color: '#4f63d2' },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11.5,
  },
};

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#6b70a3', mb: 0.75, letterSpacing: '0.3px' }}>
    {children}{required && <Box component="span" sx={{ color: '#ef4444', ml: 0.25 }}>*</Box>}
  </Typography>
);

const SummaryRow: React.FC<{ label: string; value: string; color?: string; prefix?: string }> = ({ label, value, color = '#4b5180', prefix = '' }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '6px' }}>
    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6b70a3' }}>{label}</Typography>
    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13.5, fontWeight: 600, color }}>
      {prefix}₹{value}
    </Typography>
  </Box>
);

const BillBilling: React.FC<BillBillingProps> = ({ formik }) => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);

  const subTotal = calculateSubTotal(formik.values.line_items);
  const discountAmount = calculateDiscountAmount(subTotal, formik.values.discount);
  const selectedTax = taxes.find((t) => t.id === formik.values.tax_id);
  const taxRate = selectedTax?.rate || 0;
  const taxAmount = calculateTaxAmount(subTotal, formik.values.discount, taxRate);
  const total = calculateTotal(subTotal, formik.values.discount, taxAmount, formik.values.adjustment);

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setLoadingTaxes(true);
        const res = await taxService.getTaxes();
        if (res.success && res.data) setTaxes(res.data);
      } catch (err) {
        console.error('Failed to fetch taxes:', err);
      } finally {
        setLoadingTaxes(false);
      }
    };
    fetchTaxes();
  }, []);

  return (
    <Box sx={{
      bgcolor: '#fff',
      borderRadius: '16px',
      border: '1px solid #e8eaf0',
      boxShadow: '0 2px 12px rgba(79,99,210,0.05)',
      overflow: 'hidden',
      mb: 3,
    }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid #ecedf5',
        background: 'linear-gradient(135deg, #fafbff 0%, #f3f4fc 100%)',
      }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(79,99,210,0.25)',
        }}>
          <CalculateIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: '#1a1d2e' }}>
            Billing Summary
          </Typography>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9196b0' }}>
            Discounts, taxes, and totals
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left — inputs */}
          <Grid size={{ xs: 12, md: 6 }} component="div">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Discount */}
              <Box>
                <FieldLabel>Discount (₹)</FieldLabel>
                <TextField
                  fullWidth size="small"
                  name="discount" type="number"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.discount && Boolean(formik.errors.discount)}
                  helperText={formik.touched.discount && formik.errors.discount}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={fieldSx}
                />
              </Box>

              {/* Tax */}
              <Box>
                <FieldLabel required>Tax</FieldLabel>
                <FormControl fullWidth error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}>
                  <Select
                    size="small"
                    name="tax_id"
                    value={formik.values.tax_id || 0}
                    onChange={(e) => formik.setFieldValue('tax_id', e.target.value)}
                    onBlur={formik.handleBlur}
                    displayEmpty
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13.5,
                      borderRadius: '9px',
                      '& fieldset': { borderColor: formik.touched.tax_id && formik.errors.tax_id ? '#ef4444' : '#e0e2ee' },
                      '&:hover fieldset': { borderColor: '#9196b0' },
                      '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
                    }}
                  >
                    <MenuItem value={0} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9196b0' }}>
                      <em>Select a tax…</em>
                    </MenuItem>
                    {taxes.map((tax) => (
                      <MenuItem key={tax.id} value={tax.id} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                        {tax.name} — {tax.rate}%
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.tax_id && formik.errors.tax_id && (
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: '#ef4444', mt: 0.5 }}>
                      {String(formik.errors.tax_id)}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Adjustment */}
              <Box>
                <FieldLabel>Adjustment (₹)</FieldLabel>
                <TextField
                  fullWidth size="small"
                  name="adjustment" type="number"
                  value={formik.values.adjustment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adjustment && Boolean(formik.errors.adjustment)}
                  helperText={formik.touched.adjustment && formik.errors.adjustment}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={fieldSx}
                />
              </Box>

              {/* Notes */}
              <Box>
                <FieldLabel>Notes</FieldLabel>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Add any additional notes or terms…"
                  sx={fieldSx}
                />
              </Box>
            </Box>
          </Grid>

          {/* Right — summary */}
          <Grid size={{ xs: 12, md: 6 }} component="div">
            <Box sx={{
              bgcolor: '#f8f9fc',
              border: '1px solid #e8eaf0',
              borderRadius: '14px',
              p: '20px 22px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: '#9196b0', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 2 }}>
                  Summary
                </Typography>

                <SummaryRow
                  label="Sub Total"
                  value={subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                />

                {discountAmount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    color="#dc2626"
                    prefix="− "
                  />
                )}

                {taxRate > 0 && (
                  <SummaryRow
                    label={`Tax (${taxRate}%)`}
                    value={taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    color="#4f63d2"
                    prefix="+ "
                  />
                )}

                {formik.values.adjustment > 0 && (
                  <SummaryRow
                    label="Adjustment"
                    value={formik.values.adjustment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    color="#15803d"
                    prefix="+ "
                  />
                )}

                <Box sx={{ height: '1px', bgcolor: '#e0e2ee', my: 2 }} />
              </Box>

              {/* Grand Total */}
              <Box sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)',
                p: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 6px 20px rgba(79,99,210,0.25)',
              }}>
                <Box>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Amount
                  </Typography>
                  <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, mt: 0.25 }}>
                    ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CalculateIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.9)' }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BillBilling;