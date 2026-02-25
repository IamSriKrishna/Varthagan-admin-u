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
  CircularProgress,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SalesOrder } from '@/models/salesOrder.model';
import { useTax } from '@/hooks/useTax';
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from './salesOrderForm.utils';

interface SalesOrderBillingProps {
  formik: FormikProps<SalesOrder>;
}

interface TaxOption {
  id: number;
  name: string;
  rate: number;
  tax_type: string;
}

export default function SalesOrderBilling({
  formik,
}: SalesOrderBillingProps) {
  const { taxes, loading: loadingTaxes } = useTax();
  const [taxOptions, setTaxOptions] = useState<TaxOption[]>([]);

  useEffect(() => {
    if (taxes && Array.isArray(taxes)) {
      setTaxOptions(taxes);
      // If tax_id is set but tax object is not, find and set the tax object
      if (formik.values.tax_id && !formik.values.tax) {
        const selectedTax = taxes.find(t => t.id === formik.values.tax_id);
        if (selectedTax) {
          formik.setFieldValue('tax', selectedTax);
        }
      }
    }
  }, [taxes, formik]);

  const handleTaxChange = (value: any) => {
    if (value) {
      formik.setFieldValue('tax_id', value.id);
      formik.setFieldValue('tax', value);
      formik.setFieldTouched('tax_id', true);
    } else {
      formik.setFieldValue('tax_id', 0);
      formik.setFieldValue('tax', undefined);
      formik.setFieldTouched('tax_id', true);
    }
  };

  const currentTax = taxOptions.find((t) => t.id === formik.values.tax_id);

  const subtotal = calculateSubtotal(formik.values);
  const taxAmount = calculateTax(formik.values);
  const total = calculateTotal(formik.values);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Billing & Summary
        </Typography>

        <Grid container spacing={2}>
          {/* Tax Selection */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={taxOptions}
              getOptionLabel={(option) => option.name || ''}
              value={currentTax || null}
              onChange={(_, value) => handleTaxChange(value)}
              onBlur={() => formik.setFieldTouched('tax_id', true)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tax *"
                  error={
                    formik.touched.tax_id && Boolean(formik.errors.tax_id)
                  }
                  helperText={formik.touched.tax_id && formik.errors.tax_id}
                />
              )}
            />
          </Grid>

          {/* Shipping Charges */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Shipping Charges"
              type="number"
              value={formik.values.shipping_charges}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="shipping_charges"
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={
                formik.touched.shipping_charges &&
                Boolean(formik.errors.shipping_charges)
              }
              helperText={
                formik.touched.shipping_charges &&
                formik.errors.shipping_charges
              }
            />
          </Grid>

          {/* Adjustment */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Adjustment"
              type="number"
              value={formik.values.adjustment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="adjustment"
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={
                formik.touched.adjustment && Boolean(formik.errors.adjustment)
              }
              helperText={
                formik.touched.adjustment && formik.errors.adjustment
              }
            />
          </Grid>

          {/* Summary Section */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography color="textSecondary" variant="body2">
                    Subtotal:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{subtotal.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography color="textSecondary" variant="body2">
                    Tax ({formik.values.tax?.rate || 0}%):
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{taxAmount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography color="textSecondary" variant="body2">
                    Shipping:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{(formik.values.shipping_charges || 0).toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography color="textSecondary" variant="body2">
                    Adjustment:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{(formik.values.adjustment || 0).toFixed(2)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Amount:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#1976d2' }}
                  >
                    ₹{total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
