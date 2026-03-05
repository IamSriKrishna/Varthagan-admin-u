'use client';

import React, { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  Typography,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import { customerService } from '@/lib/api/customerService';
import { Package } from '@/models/package.model';
import { SalesOrder } from '@/models/salesOrder.model';
import { Customer } from '@/models/customer.model';

interface PackageBasicInfoProps {
  formik: FormikProps<Package>;
}

export default function PackageBasicInfo({
  formik,
}: PackageBasicInfoProps) {
  const { getSalesOrders } = useSalesOrder();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch sales orders and customers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingSalesOrders(true);
        const response = await getSalesOrders(1, 100);
        console.log('Sales Orders Response:', response);
        
        // Handle different response formats
        let ordersData = [];
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (Array.isArray(response.orders)) {
          ordersData = response.orders;
        } else if (Array.isArray(response)) {
          ordersData = response;
        }
        
        console.log('Processed orders:', ordersData);
        setSalesOrders(ordersData);
      } catch (error) {
        console.error('Failed to load sales orders:', error);
      } finally {
        setLoadingSalesOrders(false);
      }

      try {
        setLoadingCustomers(true);
        const customerResponse = await customerService.getCustomers(1, 1000);
        if (customerResponse.success && customerResponse.data) {
          setCustomers(customerResponse.data);
        }
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadData();
  }, [getSalesOrders]);

  // Update selected customer when customer_id changes
  useEffect(() => {
    if (formik.values.customer_id && customers.length > 0) {
      const foundCustomer = customers.find(c => c.id === formik.values.customer_id);
      setSelectedCustomer(foundCustomer || null);
    }
  }, [formik.values.customer_id, customers]);

  const handleCustomerChange = (event: any, value: Customer | null) => {
    setSelectedCustomer(value);
    if (value) {
      formik.setFieldValue('customer_id', value.id);
      formik.setFieldValue('customer', {
        id: value.id,
        display_name: value.display_name,
        email: value.email_address,
        phone: value.work_phone,
      });
    } else {
      formik.setFieldValue('customer_id', 0);
      formik.setFieldValue('customer', null);
    }
  };

  const handleSalesOrderChange = (value: SalesOrder | null) => {
    if (value) {
      setSelectedSalesOrder(value);
      formik.setFieldValue('sales_order_id', value.id || value.sales_order_no || '');
      formik.setFieldValue('customer_id', value.customer_id);
      formik.setFieldValue('customer', value.customer);

      // Auto-populate items from sales order
      if (value.line_items && value.line_items.length > 0) {
        const items = value.line_items.map((lineItem, index) => ({
          id: index,
          sales_order_item_id: lineItem.id || index,
          item_id: lineItem.item_id,
          item: lineItem.item,
          variant_sku: lineItem.variant_sku,
          variant: lineItem.variant,
          ordered_qty: lineItem.quantity,
          packed_qty: 0,
          variant_details: lineItem.variant_details,
        }));
        formik.setFieldValue('items', items);
      }

      // Find and auto-select the customer
      if (value.customer_id && customers.length > 0) {
        const foundCustomer = customers.find(c => c.id === value.customer_id);
        if (foundCustomer) {
          setSelectedCustomer(foundCustomer);
        }
      }
    } else {
      setSelectedSalesOrder(null);
      formik.setFieldValue('sales_order_id', '');
      formik.setFieldValue('customer_id', 0);
      formik.setFieldValue('items', []);
      setSelectedCustomer(null);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Customer Selection - Dropdown */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Customer Name *</InputLabel>
            <Select
              name="customer_id"
              value={formik.values.customer_id ? String(formik.values.customer_id) : ''}
              onChange={(e) => {
                const customerId = e.target.value;
                const customerIdNum = customerId ? parseInt(customerId, 10) : 0;
                formik.setFieldValue('customer_id', customerIdNum);

                if (customerIdNum) {
                  const found = customers.find(c => c.id === customerIdNum);
                  if (found) {
                    setSelectedCustomer(found);
                    formik.setFieldValue('customer', {
                      id: found.id,
                      display_name: found.display_name,
                      email: found.email_address,
                      phone: found.work_phone,
                    });
                  }
                } else {
                  setSelectedCustomer(null);
                  formik.setFieldValue('customer', null);
                }
              }}
              label="Customer Name *"
              error={
                formik.touched.customer_id &&
                Boolean(formik.errors.customer_id)
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            >
              <MenuItem value="">
                <em>-- Select a customer --</em>
              </MenuItem>
              {customers.map((customer: Customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.display_name || 'Unnamed Customer'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formik.touched.customer_id && formik.errors.customer_id && (
            <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
              {String(formik.errors.customer_id)}
            </Typography>
          )}
        </Grid>

        {/* Package Date */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Date *"
            value={formik.values.package_date}
            onChange={(e) =>
              formik.setFieldValue('package_date', e.target.value)
            }
            onBlur={() => formik.setFieldTouched('package_date', true)}
            error={
              formik.touched.package_date &&
              Boolean(formik.errors.package_date)
            }
            helperText={
              formik.touched.package_date && formik.errors.package_date
            }
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Grid>

        {/* Sales Order Selection */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={salesOrders}
            getOptionLabel={(option) =>
              `${option.sales_order_no || ''} - ${option.customer?.display_name || ''}`
            }
            value={selectedSalesOrder}
            onChange={(_, value) => handleSalesOrderChange(value)}
            loading={loadingSalesOrders}
            size="small"
            noOptionsText="No sales orders found"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sales Order*"
                placeholder="Select Sales Order"
                error={
                  formik.touched.sales_order_id &&
                  Boolean(formik.errors.sales_order_id)
                }
                helperText={
                  formik.touched.sales_order_id &&
                  formik.errors.sales_order_id
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSalesOrders ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Package Slip Number */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Package Slip*"
            value={formik.values.package_slip_no || ''}
            disabled
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Grid>

        {/* Customer Address Section */}
        {selectedCustomer && (
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                boxShadow: 0,
                border: `1px solid ${alpha('#667eea', 0.2)}`,
                borderRadius: 1,
                backgroundColor: alpha('#667eea', 0.02),
              }}
            >
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Box>
                }
                title={
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Customer Address
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1 }}>
                <Grid container spacing={1.5}>
                  {selectedCustomer.billing_address && (
                    <>
                      {selectedCustomer.billing_address.address_line1 && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>Address:</strong> {selectedCustomer.billing_address.address_line1}
                            {selectedCustomer.billing_address.address_line2 && `, ${selectedCustomer.billing_address.address_line2}`}
                          </Typography>
                        </Grid>
                      )}
                      {(selectedCustomer.billing_address.city || selectedCustomer.billing_address.state) && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>City/State:</strong>{' '}
                            {selectedCustomer.billing_address.city} {selectedCustomer.billing_address.state}
                          </Typography>
                        </Grid>
                      )}
                      {selectedCustomer.billing_address.pin_code && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>PIN:</strong> {selectedCustomer.billing_address.pin_code}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                  {selectedCustomer.email_address && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedCustomer.email_address}
                      </Typography>
                    </Grid>
                  )}
                  {selectedCustomer.work_phone && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedCustomer.work_phone}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
