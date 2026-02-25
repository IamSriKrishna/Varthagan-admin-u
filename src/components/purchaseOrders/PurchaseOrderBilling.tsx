'use client';

import React, { useMemo } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Divider,
  alpha,
  Fade,
  Typography,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotesIcon from '@mui/icons-material/Notes';
import DiscountIcon from '@mui/icons-material/Discount';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { PurchaseOrder, Tax } from '@/models/purchaseOrder.model';
import {
  DISCOUNT_TYPES,
  TAX_TYPES,
} from '@/constants/purchaseOrder.constants';
import {
  calculateSubTotal,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateTotal,
} from './purchaseOrderForm.utils';
import { useTax } from '@/hooks/useTax';

interface PurchaseOrderBillingProps {
  formik: FormikProps<PurchaseOrder>;
}

export const PurchaseOrderBilling: React.FC<PurchaseOrderBillingProps> = ({
  formik,
}) => {
  const { taxes } = useTax();

  const calculations = useMemo(() => {
    const subTotal = calculateSubTotal(formik.values.line_items);
    const discountAmount = calculateDiscountAmount(
      subTotal,
      formik.values.discount,
      formik.values.discount_type
    );
    const selectedTax = taxes.find((t: Tax) => t.id === formik.values.tax_id);
    const taxRate = selectedTax?.rate || 0;
    const taxAmount = calculateTaxAmount(
      subTotal,
      formik.values.discount,
      formik.values.discount_type,
      taxRate
    );
    const total = calculateTotal(
      subTotal,
      formik.values.discount,
      formik.values.discount_type,
      taxAmount,
      formik.values.adjustment
    );

    return {
      subTotal: Number(subTotal) || 0,
      discountAmount: Number(discountAmount) || 0,
      taxAmount: Number(taxAmount) || 0,
      total: Number(total) || 0,
    };
  }, [
    formik.values.line_items,
    formik.values.discount,
    formik.values.discount_type,
    formik.values.tax_id,
    formik.values.adjustment,
    taxes,
  ]);

  const selectedTax: Tax | undefined = taxes.find((t: Tax) => t.id === formik.values.tax_id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Discount and Tax Section */}
      <Fade in timeout={300}>
        <Card
          sx={{
            boxShadow: 2,
            borderRadius: 3,
            border: `1px solid ${alpha('#667eea', 0.1)}`,
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <ReceiptIcon />
              </Box>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Billing Details
              </Typography>
            }
            sx={{
              background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
              borderBottom: `2px solid ${alpha('#667eea', 0.1)}`,
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Discount Section */}
              <Grid size={{ xs: 12 }} component="div">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: alpha('#f57c00', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f57c00',
                    }}
                  >
                    <DiscountIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Discount
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} component="div">
                    <FormControl fullWidth>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        name="discount_type"
                        value={formik.values.discount_type}
                        onChange={formik.handleChange}
                        label="Discount Type"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 2,
                          },
                        }}
                      >
                        {DISCOUNT_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} component="div">
                    <TextField
                      fullWidth
                      label={`Discount (${formik.values.discount_type === 'percentage' ? '%' : '₹'})`}
                      name="discount"
                      type="number"
                      inputProps={{ step: '0.01' }}
                      value={formik.values.discount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.discount &&
                        Boolean(formik.errors.discount)
                      }
                      helperText={
                        formik.touched.discount &&
                        formik.errors.discount
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }} component="div">
                <Divider />
              </Grid>

              {/* Tax Section */}
              <Grid size={{ xs: 12 }} component="div">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: alpha('#7b1fa2', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7b1fa2',
                    }}
                  >
                    <AccountBalanceIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Tax
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} component="div">
                    <FormControl fullWidth>
                      <InputLabel>Tax Type</InputLabel>
                      <Select
                        name="tax_type"
                        value={formik.values.tax_type}
                        onChange={formik.handleChange}
                        label="Tax Type"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 2,
                          },
                        }}
                      >
                        {TAX_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} component="div">
                    <Autocomplete
                      options={taxes}
                      getOptionLabel={(option) =>
                        `${option.name} (${option.rate}%)`
                      }
                      value={selectedTax || null}
                      onChange={(_, value) => {
                        formik.setFieldValue('tax_id', value?.id || 0);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tax *"
                          error={
                            formik.touched.tax_id &&
                            Boolean(formik.errors.tax_id)
                          }
                          helperText={
                            formik.touched.tax_id &&
                            formik.errors.tax_id
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }} component="div">
                <Divider />
              </Grid>

              {/* Adjustment */}
              <Grid size={{ xs: 12, sm: 6 }} component="div">
                <TextField
                  fullWidth
                  label="Adjustment (₹)"
                  name="adjustment"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formik.values.adjustment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.adjustment &&
                    Boolean(formik.errors.adjustment)
                  }
                  helperText={
                    formik.touched.adjustment &&
                    formik.errors.adjustment
                  }
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
      </Fade>

      {/* Enhanced Calculations Summary */}
      <Fade in timeout={400}>
        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha('#f5f7fa', 1)} 0%, ${alpha('#c3cfe2', 1)} 100%)`,
            border: `2px solid ${alpha('#667eea', 0.2)}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
              Order Summary
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              {/* Sub Total */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha('#e0e0e0', 1)}`,
                  boxShadow: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Sub Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                  ₹ {calculations.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              {/* Discount */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha('#ffe0b2', 1)}`,
                  boxShadow: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Discount ({formik.values.discount_type === 'percentage' ? '%' : '₹'})
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f57c00' }}>
                  - ₹ {calculations.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              {/* Tax */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha('#e1bee7', 1)}`,
                  boxShadow: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  {selectedTax?.name} ({selectedTax?.rate}%)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                  + ₹ {calculations.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              {/* Adjustment */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha('#c8e6c9', 1)}`,
                  boxShadow: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                  Adjustment
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                  + ₹ {(Number(formik.values.adjustment) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>

            {/* Grand Total */}
            <Box
              sx={{
                mt: 3,
                p: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                color: 'white',
                textAlign: 'right',
                boxShadow: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
                Grand Total
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900 }}>
                ₹ {calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Notes and Terms Section */}
      <Fade in timeout={500}>
        <Card
          sx={{
            boxShadow: 2,
            borderRadius: 3,
            border: `1px solid ${alpha('#667eea', 0.1)}`,
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <NotesIcon />
              </Box>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Additional Information
              </Typography>
            }
            sx={{
              background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
              borderBottom: `2px solid ${alpha('#667eea', 0.1)}`,
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }} component="div">
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  placeholder="Add any additional notes..."
                  multiline
                  rows={4}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }} component="div">
                <TextField
                  fullWidth
                  label="Terms & Conditions"
                  name="terms_and_conditions"
                  placeholder="Enter terms and conditions..."
                  multiline
                  rows={4}
                  value={formik.values.terms_and_conditions}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
      </Fade>
    </Box>
  );
};

export default PurchaseOrderBilling;