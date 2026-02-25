'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Autocomplete,
  Button,
  Tooltip,
  CircularProgress,
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

export const BillBasicInfo: React.FC<BillBasicInfoProps> = ({ formik }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const vendorResponse = await vendorService.getVendors(1, 1000);
        if (vendorResponse.success && vendorResponse.data) {
          setVendors(vendorResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  // Fetch purchase orders when vendor changes
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (!formik.values.vendor_id) {
        setPurchaseOrders([]);
        setSelectedPO(null);
        return;
      }

      try {
        setLoadingPOs(true);
        const response = await purchaseOrderService.getPurchaseOrders(1, 100);
        if (response.success && response.data) {
          // Get the purchase_orders array from response
          const poArray = Array.isArray(response.data) ? response.data : response.data.purchase_orders || [];
          // Filter POs by selected vendor
          const filteredPOs = poArray.filter(
            (po: any) => po.vendor_id === formik.values.vendor_id
          );
          setPurchaseOrders(filteredPOs);
        }
      } catch (err) {
        console.error('Failed to fetch purchase orders:', err);
        setPurchaseOrders([]);
      } finally {
        setLoadingPOs(false);
      }
    };

    fetchPurchaseOrders();
  }, [formik.values.vendor_id]);

  // Update selectedPO when purchase_order_id changes
  useEffect(() => {
    if (formik.values.purchase_order_id) {
      const po = purchaseOrders.find((po) => po.id === formik.values.purchase_order_id);
      setSelectedPO(po || null);
    } else {
      setSelectedPO(null);
    }
  }, [formik.values.purchase_order_id, purchaseOrders]);

  const handleGenerateBillNumber = () => {
    formik.setFieldValue('bill_number', generateBillNumber());
  };

  const handlePOChange = (event: any, value: PurchaseOrder | null) => {
    setSelectedPO(value);
    formik.setFieldValue('purchase_order_id', value?.id || '');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Vendor Selection Section */}
      <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
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
              <StoreIcon />
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Vendor Information
            </Typography>
          }
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '1px solid #e0e0e0',
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Vendor Selection */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth>
                <InputLabel>Vendor Name *</InputLabel>
                <Select
                  name="vendor_id"
                  value={formik.values.vendor_id ? String(formik.values.vendor_id) : ''}
                  onChange={(e) => {
                    const vendorId = e.target.value;
                    const vendorIdNum = vendorId ? parseInt(vendorId, 10) : 0;
                    formik.setFieldValue('vendor_id', vendorIdNum);
                  }}
                  onBlur={formik.handleBlur}
                  label="Vendor Name *"
                  error={formik.touched.vendor_id && Boolean(formik.errors.vendor_id)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>-- Select a vendor --</em>
                  </MenuItem>
                  {vendors.map((vendor: any) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.display_name || vendor.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.vendor_id && formik.errors.vendor_id && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
                  {String(formik.errors.vendor_id)}
                </Typography>
              )}
            </Grid>

            {/* Bill Number */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Bill#"
                    name="bill_number"
                    value={formik.values.bill_number || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.bill_number && Boolean(formik.errors.bill_number)}
                    helperText={
                      formik.touched.bill_number &&
                      formik.errors.bill_number
                    }
                    placeholder="e.g., BILL-001"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
                <Tooltip title="Generate a unique bill number">
                  <Button
                    variant="outlined"
                    onClick={handleGenerateBillNumber}
                    sx={{
                      mt: 1,
                      minWidth: 50,
                      borderRadius: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      },
                    }}
                  >
                    <AutorenewIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </Box>
            </Grid>

            {/* Purchase Order */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Autocomplete
                options={purchaseOrders}
                getOptionLabel={(po) =>
                  `${po.purchase_order_no || 'N/A'} - ${po.reference_no || 'N/A'}`
                }
                value={selectedPO}
                onChange={handlePOChange}
                loading={loadingPOs}
                disabled={!formik.values.vendor_id || loadingPOs}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Purchase Order"
                    placeholder="Select a PO"
                    helperText={
                      !formik.values.vendor_id
                        ? 'Select a vendor first'
                        : 'Select a purchase order'
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingPOs ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Order Number */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                label="Order Number"
                name="order_number"
                value={formik.values.order_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.order_number && Boolean(formik.errors.order_number)}
                helperText={formik.touched.order_number && formik.errors.order_number}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Bill Date */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                label="Bill Date *"
                name="bill_date"
                type="date"
                value={formik.values.bill_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bill_date && Boolean(formik.errors.bill_date)}
                helperText={formik.touched.bill_date && formik.errors.bill_date}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Due Date */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                label="Due Date *"
                name="due_date"
                type="date"
                value={formik.values.due_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.due_date && Boolean(formik.errors.due_date)}
                helperText={formik.touched.due_date && formik.errors.due_date}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Payment Terms */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth>
                <InputLabel>Payment Terms *</InputLabel>
                <Select
                  name="payment_terms"
                  value={formik.values.payment_terms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Payment Terms *"
                  error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="due_on_receipt">Due on Receipt</MenuItem>
                  <MenuItem value="net_15">Net 15</MenuItem>
                  <MenuItem value="net_30">Net 30</MenuItem>
                  <MenuItem value="net_60">Net 60</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              {formik.touched.payment_terms && formik.errors.payment_terms && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
                  {String(formik.errors.payment_terms)}
                </Typography>
              )}
            </Grid>

            {/* Billing Address */}
            <Grid size={{ xs: 12 }} component="div">
              <TextField
                fullWidth
                label="Billing Address *"
                name="billing_address"
                value={formik.values.billing_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.billing_address && Boolean(formik.errors.billing_address)}
                helperText={formik.touched.billing_address && formik.errors.billing_address}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Subject */}
            <Grid size={{ xs: 12 }} component="div">
              <TextField
                fullWidth
                label="Subject *"
                name="subject"
                multiline
                rows={2}
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                placeholder="Enter subject within 250 characters"
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
    </Box>
  );
};

export default BillBasicInfo;
