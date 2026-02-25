'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  Button,
  Typography,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SalesOrder } from '@/models/salesOrder.model';
import { customerService } from '@/lib/api/customerService';
import { appFetch } from '@/utils/fetchInterceptor';
import { config } from '@/config';
import { salespersons as salespersonsEndpoint } from '@/constants/apiConstants';
import AddIcon from '@mui/icons-material/Add';

interface SalesOrderBasicInfoProps {
  formik: FormikProps<SalesOrder>;
  isEditMode?: boolean;
  onOpenCreateSalesperson?: () => void;
  salespersonRefreshTrigger?: number;
}

interface CustomerOption {
  id: number;
  display_name: string;
  company_name: string;
  email?: string;
  phone?: string;
}

interface SalespersonOption {
  id: number;
  name: string;
  email?: string;
}

export default function SalesOrderBasicInfo({
  formik,
  isEditMode,
  onOpenCreateSalesperson,
  salespersonRefreshTrigger,
}: SalesOrderBasicInfoProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [salespersons, setSalespersons] = useState<SalespersonOption[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingSalespersons, setLoadingSalespersons] = useState(true);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getCustomers(1, 1000);
        if (response.success && response.data) {
          setCustomers(response.data as any);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch salespersons
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const apiDomain = config.apiDomain || '';
        const response = await appFetch(
          `${apiDomain}${salespersonsEndpoint.getSalespersons}`,
          { method: 'GET' }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.salespersons)) {
            setSalespersons(data.salespersons);
          } else if (Array.isArray(data)) {
            setSalespersons(data);
          }
        }
      } catch (error) {
        console.error('Error fetching salespersons:', error);
      } finally {
        setLoadingSalespersons(false);
      }
    };
    fetchSalespersons();
  }, [salespersonRefreshTrigger]);

  const handleCustomerChange = (value: any) => {
    if (value) {
      formik.setFieldValue('customer_id', value.id);
      formik.setFieldValue('customer', value);
    } else {
      formik.setFieldValue('customer_id', 0);
      formik.setFieldValue('customer', undefined);
    }
  };

  const handleSalespersonChange = (value: any) => {
    if (value) {
      formik.setFieldValue('salesperson_id', value.id);
      formik.setFieldValue('salesperson', value);
    } else {
      formik.setFieldValue('salesperson_id', undefined);
      formik.setFieldValue('salesperson', undefined);
    }
  };

  const currentCustomer = customers.find(
    (c) => c.id === formik.values.customer_id
  );
  const currentSalesperson = salespersons.find(
    (s) => s.id === formik.values.salesperson_id
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Basic Information
        </Typography>

        <Grid container spacing={2}>
          {/* Customer Selection */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.display_name || option.company_name || ''}
              value={currentCustomer || null}
              onChange={(_, value) => handleCustomerChange(value)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              loading={loadingCustomers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer *"
                  error={
                    formik.touched.customer_id &&
                    Boolean(formik.errors.customer_id)
                  }
                  helperText={
                    formik.touched.customer_id && formik.errors.customer_id
                  }
                />
              )}
              disabled={isEditMode && formik.values.id !== undefined}
            />
          </Grid>

          {/* Salesperson Selection */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  options={salespersons}
                  getOptionLabel={(option) => option.name || ''}
                  value={currentSalesperson || null}
                  onChange={(_, value) => handleSalespersonChange(value)}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  loading={loadingSalespersons}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Salesperson"
                      helperText="Optional"
                    />
                  )}
                />
              </Box>
              {onOpenCreateSalesperson && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={onOpenCreateSalesperson}
                  sx={{ mt: 1 }}
                >
                  New
                </Button>
              )}
            </Box>
          </Grid>

          {/* Reference Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Reference Number *"
              value={formik.values.reference_no}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="reference_no"
              fullWidth
              error={
                formik.touched.reference_no &&
                Boolean(formik.errors.reference_no)
              }
              helperText={
                formik.touched.reference_no && formik.errors.reference_no
              }
            />
          </Grid>

          {/* Sales Order Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Sales Order Date *"
              type="date"
              value={formik.values.sales_order_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="sales_order_date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={
                formik.touched.sales_order_date &&
                Boolean(formik.errors.sales_order_date)
              }
              helperText={
                formik.touched.sales_order_date &&
                formik.errors.sales_order_date
              }
            />
          </Grid>

          {/* Expected Shipment Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Expected Shipment Date *"
              type="date"
              value={formik.values.expected_shipment_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="expected_shipment_date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={
                formik.touched.expected_shipment_date &&
                Boolean(formik.errors.expected_shipment_date)
              }
              helperText={
                formik.touched.expected_shipment_date &&
                formik.errors.expected_shipment_date
              }
            />
          </Grid>

          {/* Payment Terms */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Payment Terms *"
              value={formik.values.payment_terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="payment_terms"
              fullWidth
              placeholder="e.g., Net 15"
              error={
                formik.touched.payment_terms &&
                Boolean(formik.errors.payment_terms)
              }
              helperText={
                formik.touched.payment_terms && formik.errors.payment_terms
              }
            />
          </Grid>

          {/* Delivery Method */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Delivery Method *"
              value={formik.values.delivery_method}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="delivery_method"
              fullWidth
              placeholder="e.g., Courier"
              error={
                formik.touched.delivery_method &&
                Boolean(formik.errors.delivery_method)
              }
              helperText={
                formik.touched.delivery_method && formik.errors.delivery_method
              }
            />
          </Grid>

          {/* Customer Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Customer Notes"
              value={formik.values.customer_notes || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="customer_notes"
              fullWidth
              multiline
              rows={3}
              placeholder="Add any special notes for the customer"
            />
          </Grid>

          {/* Terms and Conditions */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Terms and Conditions"
              value={formik.values.terms_and_conditions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="terms_and_conditions"
              fullWidth
              multiline
              rows={3}
              placeholder="Add payment and delivery terms"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
