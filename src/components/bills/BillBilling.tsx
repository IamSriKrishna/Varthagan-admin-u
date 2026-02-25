'use client';

import React, { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
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

const BillBilling: React.FC<BillBillingProps> = ({ formik }) => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);

  const subTotal = calculateSubTotal(formik.values.line_items);
  const discountAmount = calculateDiscountAmount(subTotal, formik.values.discount);
  const selectedTax = taxes.find((t: Tax) => t.id === formik.values.tax_id);
  const taxRate = selectedTax?.rate || 0;
  const taxAmount = calculateTaxAmount(subTotal, formik.values.discount, taxRate);
  const total = calculateTotal(
    subTotal,
    formik.values.discount,
    taxAmount,
    formik.values.adjustment
  );

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setLoadingTaxes(true);
        const response = await taxService.getTaxes();
        if (response.success && response.data) {
          setTaxes(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch taxes:', err);
      } finally {
        setLoadingTaxes(false);
      }
    };

    fetchTaxes();
  }, []);

  return (
    <Card sx={{ boxShadow: 1, borderRadius: 2, mt: 3 }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Billing Details
          </Typography>
        }
        sx={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #e0e0e0',
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Summary */}
          <Grid size={{ xs: 12 }} component="div">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Sub Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                  ₹ {subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Discount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                  - ₹ {discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Tax ({taxRate}%)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  + ₹ {taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Adjustment
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#388e3c' }}>
                  + ₹ {formik.values.adjustment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Discount */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <TextField
              fullWidth
              label="Discount"
              name="discount"
              type="number"
              value={formik.values.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.discount && Boolean(formik.errors.discount)}
              helperText={formik.touched.discount && formik.errors.discount}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Tax Selection */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FormControl fullWidth error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}>
              <InputLabel>Tax *</InputLabel>
              <Select
                name="tax_id"
                value={formik.values.tax_id || 0}
                onChange={(e) => formik.setFieldValue('tax_id', e.target.value)}
                onBlur={formik.handleBlur}
                label="Tax *"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value={0}>
                  <em>-- Select a tax --</em>
                </MenuItem>
                {taxes.map((tax: Tax) => (
                  <MenuItem key={tax.id} value={tax.id}>
                    {tax.name} ({tax.rate}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formik.touched.tax_id && formik.errors.tax_id && (
              <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}>
                {String(formik.errors.tax_id)}
              </Typography>
            )}
          </Grid>

          {/* Adjustment */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <TextField
              fullWidth
              label="Adjustment"
              name="adjustment"
              type="number"
              value={formik.values.adjustment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adjustment && Boolean(formik.errors.adjustment)}
              helperText={formik.touched.adjustment && formik.errors.adjustment}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Total */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <Box
              sx={{
                p: 2,
                backgroundColor: '#667eea',
                borderRadius: 2,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }} component="div">
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Add any additional notes or terms..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BillBilling;
