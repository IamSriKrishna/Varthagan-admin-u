'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  Button,
  Tooltip,
  CircularProgress,
  InputLabel,
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Bill } from '@/models/bill.model';
import { vendorService } from '@/lib/api/vendorService';
import { purchaseOrderService } from '@/lib/api/purchaseOrderService';
import { Vendor } from '@/models/vendor.model';
import { PurchaseOrder } from '@/models/purchaseOrder.model';

interface BillBasicInfoProps {
  formik: FormikProps<Bill>;
}

const generateBillNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BILL-${timestamp}-${random}`;
};

// Shared field style
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

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <Box sx={{
    bgcolor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e8eaf0',
    boxShadow: '0 2px 12px rgba(79,99,210,0.05)',
    overflow: 'hidden',
    mb: 3,
  }}>
    {/* Section Header */}
    <Box sx={{
      px: 3, py: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderBottom: '1px solid #ecedf5',
      background: 'linear-gradient(135deg, #fafbff 0%, #f3f4fc 100%)',
    }}>
      <Box sx={{
        width: 38, height: 38,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(79,99,210,0.25)',
        flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: '#1a1d2e', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9196b0', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  </Box>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#6b70a3', mb: 0.75, letterSpacing: '0.3px' }}>
    {children}{required && <Box component="span" sx={{ color: '#ef4444', ml: 0.25 }}>*</Box>}
  </Typography>
);

export const BillBasicInfo: React.FC<BillBasicInfoProps> = ({ formik }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await vendorService.getVendors(1, 1000);
        if (res.success && res.data) setVendors(res.data);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchPOs = async () => {
      if (!formik.values.vendor_id) { setPurchaseOrders([]); setSelectedPO(null); return; }
      try {
        setLoadingPOs(true);
        const res = await purchaseOrderService.getPurchaseOrders(1, 100);
        if (res) {
          const arr = Array.isArray(res.purchase_orders) ? res.purchase_orders : [];
          setPurchaseOrders(arr.filter((po: any) => po.vendor_id === formik.values.vendor_id));
        }
      } catch (err) {
        console.error('Failed to fetch POs:', err);
        setPurchaseOrders([]);
      } finally {
        setLoadingPOs(false);
      }
    };
    fetchPOs();
  }, [formik.values.vendor_id]);

  useEffect(() => {
    if (formik.values.purchase_order_id) {
      setSelectedPO(purchaseOrders.find((po) => po.id === formik.values.purchase_order_id) || null);
    } else {
      setSelectedPO(null);
    }
  }, [formik.values.purchase_order_id, purchaseOrders]);

  return (
    <>
      <SectionCard
        icon={<StoreIcon sx={{ fontSize: 18, color: '#fff' }} />}
        title="Vendor Information"
        subtitle="Select a vendor and link a purchase order"
      >
        <Grid container spacing={2.5}>
          {/* Vendor Select */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel required>Vendor Name</FieldLabel>
            <FormControl fullWidth error={formik.touched.vendor_id && Boolean(formik.errors.vendor_id)}>
              <Select
                name="vendor_id"
                value={formik.values.vendor_id ? String(formik.values.vendor_id) : ''}
                onChange={(e) => formik.setFieldValue('vendor_id', e.target.value ? parseInt(e.target.value, 10) : 0)}
                onBlur={formik.handleBlur}
                displayEmpty
                size="small"
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13.5,
                  borderRadius: '9px',
                  '& fieldset': { borderColor: '#e0e2ee' },
                  '&:hover fieldset': { borderColor: '#9196b0' },
                  '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
                }}
              >
                <MenuItem value="" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9196b0' }}>
                  <em>Select a vendor…</em>
                </MenuItem>
                {vendors.map((v: any) => (
                  <MenuItem key={v.id} value={String(v.id)} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                    {v.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formik.touched.vendor_id && formik.errors.vendor_id && (
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: '#ef4444', mt: 0.5 }}>
                {String(formik.errors.vendor_id)}
              </Typography>
            )}
          </Grid>

          {/* Bill Number */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel required>Bill #</FieldLabel>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                name="bill_number"
                value={formik.values.bill_number || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bill_number && Boolean(formik.errors.bill_number)}
                helperText={formik.touched.bill_number && formik.errors.bill_number}
                placeholder="e.g. BILL-001"
                sx={fieldSx}
                InputProps={{
                  sx: { fontFamily: "'DM Mono', monospace", fontSize: 13 }
                }}
              />
              <Tooltip title="Auto-generate bill number">
                <Button
                  variant="outlined"
                  onClick={() => formik.setFieldValue('bill_number', generateBillNumber())}
                  sx={{
                    minWidth: 40, px: 1.25, flexShrink: 0,
                    borderRadius: '9px',
                    borderColor: '#d4d9f7',
                    color: '#4f63d2',
                    '&:hover': { borderColor: '#4f63d2', bgcolor: '#eef0fb' },
                  }}
                >
                  <AutorenewIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          </Grid>

          {/* Purchase Order */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel>Purchase Order</FieldLabel>
            <Autocomplete
              size="small"
              options={purchaseOrders}
              getOptionLabel={(po) => `${po.purchase_order_no || 'N/A'} · ${po.reference_no || 'N/A'}`}
              value={selectedPO}
              onChange={(_, value) => {
                setSelectedPO(value);
                formik.setFieldValue('purchase_order_id', value?.id || '');
                
                // Auto-populate order number from PO
                if (value?.purchase_order_no) {
                  formik.setFieldValue('order_number', value.purchase_order_no);
                }
                
                // Auto-populate line items from PO
                if (value?.line_items && Array.isArray(value.line_items)) {
                  const lineItems = value.line_items.map((item: any) => ({
                    item_id: item.product_id || '',
                    product_id: item.product_id || '',
                    product_name: item.product_name || '',
                    sku: item.sku || '',
                    variant_sku: item.sku || '',
                    quantity: item.quantity || 0,
                    rate: item.rate || 0,
                    amount: item.amount || 0,
                    account: item.account || 'Cost of Goods Sold',
                    description: item.product_name || '',
                    variant_details: {},
                  }));
                  formik.setFieldValue('line_items', lineItems);
                }
              }}
              loading={loadingPOs}
              disabled={!formik.values.vendor_id || loadingPOs}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={!formik.values.vendor_id ? 'Select a vendor first' : 'Search purchase orders…'}
                  sx={fieldSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingPOs && <CircularProgress size={14} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Order Number */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel>Order Number</FieldLabel>
            <TextField
              fullWidth size="small"
              name="order_number"
              value={formik.values.order_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.order_number && Boolean(formik.errors.order_number)}
              helperText={formik.touched.order_number && formik.errors.order_number}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        icon={
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        }
        title="Bill Details"
        subtitle="Dates, terms, and billing address"
      >
        <Grid container spacing={2.5}>
          {/* Bill Date */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel required>Bill Date</FieldLabel>
            <TextField
              fullWidth size="small" type="date"
              name="bill_date"
              value={formik.values.bill_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bill_date && Boolean(formik.errors.bill_date)}
              helperText={formik.touched.bill_date && formik.errors.bill_date}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel required>Due Date</FieldLabel>
            <TextField
              fullWidth size="small" type="date"
              name="due_date"
              value={formik.values.due_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.due_date && Boolean(formik.errors.due_date)}
              helperText={formik.touched.due_date && formik.errors.due_date}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Grid>

          {/* Payment Terms */}
          <Grid size={{ xs: 12, sm: 6 }} component="div">
            <FieldLabel required>Payment Terms</FieldLabel>
            <Select
              fullWidth size="small"
              name="payment_terms"
              value={formik.values.payment_terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
              sx={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
                borderRadius: '9px',
                '& fieldset': { borderColor: '#e0e2ee' },
                '&:hover fieldset': { borderColor: '#9196b0' },
                '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
              }}
            >
              <MenuItem value="due_on_receipt" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Due on Receipt</MenuItem>
              <MenuItem value="net_15" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Net 15</MenuItem>
              <MenuItem value="net_30" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Net 30</MenuItem>
              <MenuItem value="net_60" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Net 60</MenuItem>
              <MenuItem value="custom" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Custom</MenuItem>
            </Select>
          </Grid>

          {/* Billing Address */}
          <Grid size={{ xs: 12 }} component="div">
            <FieldLabel required>Billing Address</FieldLabel>
            <TextField
              fullWidth size="small"
              name="billing_address"
              value={formik.values.billing_address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billing_address && Boolean(formik.errors.billing_address)}
              helperText={formik.touched.billing_address && formik.errors.billing_address}
              sx={fieldSx}
            />
          </Grid>

          {/* Subject */}
          <Grid size={{ xs: 12 }} component="div">
            <FieldLabel required>Subject</FieldLabel>
            <TextField
              fullWidth size="small" multiline rows={2}
              name="subject"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.subject && Boolean(formik.errors.subject)}
              helperText={formik.touched.subject && formik.errors.subject}
              placeholder="Enter subject within 250 characters"
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </SectionCard>
    </>
  );
};

export default BillBasicInfo;