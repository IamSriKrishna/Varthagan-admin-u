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
  Select,
  MenuItem,
  Card,
  CardContent,
  InputLabel,
  Chip,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import { customerService } from '@/lib/api/customerService';
import { Package } from '@/models/package.model';
import { SalesOrder } from '@/models/salesOrder.model';
import { Customer } from '@/models/customer.model';

interface PackageBasicInfoProps {
  formik: FormikProps<Package>;
}

// ── Shared field styles ──────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: '"DM Sans"',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.15s',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#c7d2fe' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' },
    '&.Mui-disabled': { backgroundColor: '#f8fafc' },
  },
  '& .MuiInputLabel-root': { fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#64748b' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  '& .MuiFormHelperText-root': { fontFamily: '"DM Sans"', fontSize: '0.75rem', ml: 0 },
};

const selectSx = {
  borderRadius: '10px',
  fontFamily: '"DM Sans"',
  fontSize: '0.875rem',
  backgroundColor: '#fff',
  transition: 'box-shadow 0.15s',
  '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
  '&:hover fieldset': { borderColor: '#c7d2fe' },
  '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
  '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' },
};

export default function PackageBasicInfo({ formik }: PackageBasicInfoProps) {
  const { getSalesOrders } = useSalesOrder();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingSalesOrders(true);
        const response = await getSalesOrders(1, 100);
        let ordersData: SalesOrder[] = [];
        if (Array.isArray(response.data)) ordersData = response.data;
        else if (Array.isArray(response.orders)) ordersData = response.orders;
        else if (Array.isArray(response)) ordersData = response;
        setSalesOrders(ordersData);
      } catch { console.error('Failed to load sales orders'); }
      finally { setLoadingSalesOrders(false); }

      try {
        setLoadingCustomers(true);
        const res = await customerService.getCustomers(1, 1000);
        if (res.success && res.data) setCustomers(res.data);
      } catch { console.error('Failed to load customers'); }
      finally { setLoadingCustomers(false); }
    };
    loadData();
  }, [getSalesOrders]);

  useEffect(() => {
    if (formik.values.customer_id && customers.length > 0) {
      setSelectedCustomer(customers.find(c => c.id === formik.values.customer_id) || null);
    }
  }, [formik.values.customer_id, customers]);

  const handleSalesOrderChange = (value: SalesOrder | null) => {
    if (value) {
      setSelectedSalesOrder(value);
      formik.setFieldValue('sales_order_id', value.id || value.sales_order_no || '');
      formik.setFieldValue('customer_id', value.customer_id);
      formik.setFieldValue('customer', value.customer);
      if (value.line_items?.length) {
        formik.setFieldValue('items', value.line_items.map((li, i) => ({
          id: i,
          sales_order_item_id: li.id || i,
          item_id: li.item_id,
          item: li.item,
          variant_sku: li.variant_sku,
          variant: li.variant,
          ordered_qty: li.quantity,
          packed_qty: 0,
          variant_details: li.variant_details,
        })));
      }
      if (value.customer_id && customers.length > 0) {
        setSelectedCustomer(customers.find(c => c.id === value.customer_id) || null);
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <Grid container spacing={2.5}>
        {/* Customer */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#64748b', '&.Mui-focused': { color: '#6366f1' } }}>
              Customer Name *
            </InputLabel>
            <Select
              name="customer_id"
              value={formik.values.customer_id ? String(formik.values.customer_id) : ''}
              onChange={(e) => {
                const id = e.target.value ? parseInt(e.target.value, 10) : 0;
                formik.setFieldValue('customer_id', id);
                if (id) {
                  const found = customers.find(c => c.id === id);
                  if (found) {
                    setSelectedCustomer(found);
                    formik.setFieldValue('customer', { id: found.id, display_name: found.display_name, email: found.email_address, phone: found.work_phone });
                  }
                } else {
                  setSelectedCustomer(null);
                  formik.setFieldValue('customer', null);
                }
              }}
              label="Customer Name *"
              error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
              sx={selectSx}
              MenuProps={{ PaperProps: { sx: { borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', fontFamily: '"DM Sans"' } } }}
            >
              <MenuItem value="" sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#94a3b8' }}>
                — Select a customer —
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id} sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', borderRadius: '8px', mx: 0.5, my: 0.125, '&:hover': { backgroundColor: '#eef2ff', color: '#6366f1' }, '&.Mui-selected': { backgroundColor: '#e0e7ff', color: '#4f46e5' } }}>
                  {c.display_name || 'Unnamed Customer'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formik.touched.customer_id && formik.errors.customer_id && (
            <Typography sx={{ fontFamily: '"DM Sans"', color: '#dc2626', fontSize: '0.75rem', mt: 0.5 }}>
              {String(formik.errors.customer_id)}
            </Typography>
          )}
        </Grid>

        {/* Package Date */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Package Date *"
            value={formik.values.package_date}
            onChange={(e) => formik.setFieldValue('package_date', e.target.value)}
            onBlur={() => formik.setFieldTouched('package_date', true)}
            error={formik.touched.package_date && Boolean(formik.errors.package_date)}
            helperText={formik.touched.package_date && formik.errors.package_date}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={fieldSx}
          />
        </Grid>

        {/* Sales Order */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={salesOrders}
            getOptionLabel={(o) => `${o.sales_order_no || ''} — ${o.customer?.display_name || ''}`}
            value={selectedSalesOrder}
            onChange={(_, v) => handleSalesOrderChange(v)}
            loading={loadingSalesOrders}
            size="small"
            noOptionsText={
              <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#94a3b8' }}>No sales orders found</Typography>
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', borderRadius: '8px', mx: 0.5, my: 0.125, '&:hover': { backgroundColor: '#eef2ff !important' }, gap: 1 }}>
                <Typography component="span" sx={{ fontFamily: '"DM Mono"', fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>
                  {option.sales_order_no}
                </Typography>
                <Typography component="span" sx={{ color: '#64748b', mx: 0.5 }}>—</Typography>
                <Typography component="span" sx={{ color: '#374151' }}>{option.customer?.display_name}</Typography>
              </Box>
            )}
            PaperComponent={({ children, ...props }) => (
              <Box {...props} sx={{ borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', mt: 0.5 }}>
                {children}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sales Order *"
                placeholder="Search or select…"
                error={formik.touched.sales_order_id && Boolean(formik.errors.sales_order_id)}
                helperText={formik.touched.sales_order_id && String(formik.errors.sales_order_id || '')}
                sx={fieldSx}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSalesOrders ? <CircularProgress size={16} sx={{ color: '#6366f1' }} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Package Slip */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Package Slip No."
            value={formik.values.package_slip_no || ''}
            disabled
            size="small"
            placeholder="Auto-generated"
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-root.Mui-disabled': {
                backgroundColor: '#f8fafc',
                '& fieldset': { borderColor: '#e2e8f0', borderStyle: 'dashed' },
              },
              '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#94a3b8', fontFamily: '"DM Mono"', fontSize: '0.875rem' },
            }}
          />
        </Grid>

        {/* ── Customer Address Card ── */}
        {selectedCustomer && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1.5px solid #e0e7ff',
                backgroundColor: '#fafbff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PersonOutlineIcon sx={{ color: 'white', fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                    {selectedCustomer.display_name}
                  </Typography>
                  <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#94a3b8' }}>Customer details</Typography>
                </Box>
              </Box>

              <Grid container spacing={1.5}>
                {selectedCustomer.billing_address?.address_line1 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 15, color: '#6366f1', mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Address</Typography>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>
                          {selectedCustomer.billing_address.address_line1}
                          {selectedCustomer.billing_address.address_line2 && `, ${selectedCustomer.billing_address.address_line2}`}
                          {(selectedCustomer.billing_address.city || selectedCustomer.billing_address.state) &&
                            `, ${[selectedCustomer.billing_address.city, selectedCustomer.billing_address.state].filter(Boolean).join(', ')}`}
                          {selectedCustomer.billing_address.pin_code && ` — ${selectedCustomer.billing_address.pin_code}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {selectedCustomer.email_address && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <EmailOutlinedIcon sx={{ fontSize: 15, color: '#6366f1', mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Email</Typography>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#374151' }}>{selectedCustomer.email_address}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {selectedCustomer.work_phone && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <PhoneOutlinedIcon sx={{ fontSize: 15, color: '#6366f1', mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Phone</Typography>
                        <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#374151' }}>{selectedCustomer.work_phone}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}