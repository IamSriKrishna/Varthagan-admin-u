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
  Divider,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { PurchaseOrder } from '@/models/purchaseOrder.model';
import { vendorService } from '@/lib/api/vendorService';
import { customerService } from '@/lib/api/customerService';
import { Vendor } from '@/models/vendor.model';
import { Customer } from '@/models/customer.model';
import { PAYMENT_TERMS, SHIPMENT_PREFERENCES } from '@/constants/purchaseOrder.constants';
import { companyApi } from '@/lib/api/companyApi';

interface PurchaseOrderBasicInfoProps {
  formik: FormikProps<PurchaseOrder>;
}

const generateReferenceNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PO-${timestamp}-${random}`;
};

export const PurchaseOrderBasicInfo: React.FC<PurchaseOrderBasicInfoProps> = ({
  formik,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [companyName, setCompanyName] = useState<string>('');

  // Fetch authenticated user's company name from API
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await companyApi.getCompaniesList(1, 100);
        if (response.data && response.data.length > 0) {
          // Get the first company (user's company)
          const userCompany = response.data[0];
          setCompanyName(userCompany.company?.company_name || 'Your Company');
        } else {
          setCompanyName('Your Company');
        }
      } catch (err) {
        console.error('Failed to fetch company name:', err);
        setCompanyName('Your Company');
      }
    };

    fetchCompanyName();
  }, []);

  // Fetch vendors and customers on component mount
  useEffect(() => {
    const fetchData = async () => {
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

      try {
        setLoadingCustomers(true);
        const customerResponse = await customerService.getCustomers(1, 1000);
        if (customerResponse.success && customerResponse.data) {
          setCustomers(customerResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchData();
  }, []);

  // Clear customer fields and auto-populate org name when switching to organization address type
  useEffect(() => {
    if (formik.values.delivery_address_type === 'organization' && companyName) {
      formik.setFieldValue('customer_id', undefined);
      formik.setFieldValue('organization_name', companyName);
      setSelectedCustomer(null);
    }
  }, [formik.values.delivery_address_type, companyName]);

  const handleAddressTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'organization' | 'customer';
    formik.setFieldValue('delivery_address_type', value);
  };

  const handleGenerateReference = () => {
    formik.setFieldValue('reference_no', generateReferenceNumber());
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
              Vendor Selection
            </Typography>
          }
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '1px solid #e0e0e0',
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }} component="div">
              <FormControl fullWidth>
                <InputLabel>Select Vendor *</InputLabel>
                <Select
                  name="vendor_id"
                  value={formik.values.vendor_id ? String(formik.values.vendor_id) : ''}
                  onChange={(e) => {
                    const vendorId = e.target.value;
                    const vendorIdNum = vendorId ? parseInt(vendorId, 10) : 0;
                    formik.setFieldValue('vendor_id', vendorIdNum);
                  }}
                  onBlur={formik.handleBlur}
                  label="Select Vendor *"
                  error={
                    formik.touched.vendor_id && Boolean(formik.errors.vendor_id)
                  }
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
                      {vendor.display_name}
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
          </Grid>
        </CardContent>
      </Card>

      {/* Delivery Address Section */}
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
              <PersonIcon />
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Delivery Address
            </Typography>
          }
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '1px solid #e0e0e0',
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Address Type Selection */}
            <Grid size={{ xs: 12 }} component="div">
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Delivery Address Type *
                </Typography>
                <RadioGroup
                  row
                  name="delivery_address_type"
                  value={formik.values.delivery_address_type}
                  onChange={handleAddressTypeChange}
                >
                  <FormControlLabel
                    value="organization"
                    control={<Radio />}
                    label="Organization"
                  />
                  <FormControlLabel
                    value="customer"
                    control={<Radio />}
                    label="Customer"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Organization Fields */}
            {formik.values.delivery_address_type === 'organization' && (
              <>
                <Grid size={{ xs: 12 }} component="div">
                  <TextField
                    fullWidth
                    label="Organization Name *"
                    name="organization_name"
                    value={formik.values.organization_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.organization_name &&
                      Boolean(formik.errors.organization_name)
                    }
                    helperText={
                      formik.touched.organization_name &&
                      formik.errors.organization_name
                    }
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
                    label="Organization Address *"
                    name="organization_address"
                    multiline
                    rows={3}
                    value={formik.values.organization_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.organization_address &&
                      Boolean(formik.errors.organization_address)
                    }
                    helperText={
                      formik.touched.organization_address &&
                      formik.errors.organization_address
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Customer Selection */}
            {formik.values.delivery_address_type === 'customer' && (
              <>
                <Grid size={{ xs: 12 }} component="div">
                  <FormControl fullWidth>
                    <InputLabel>Select Customer *</InputLabel>
                    <Select
                      name="customer_id"
                      value={formik.values.customer_id ? String(formik.values.customer_id) : ''}
                      onChange={async (e) => {
                        const customerId = e.target.value;
                        const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
                        formik.setFieldValue('customer_id', customerIdNum);
                        
                        if (customerIdNum) {
                          try {
                            // Fetch full customer details
                            const response = await customerService.getCustomer(customerIdNum);
                            if (response.success && response.data) {
                              const customer = response.data;
                              setSelectedCustomer(customer);
                              // Set customer name
                              formik.setFieldValue('organization_name', customer.display_name || customer.first_name || '');
                              
                              // Populate address line 1 and line 2 from billing address or shipping address
                              const addressToUse = customer.billing_address || customer.shipping_address;
                              const addressLines = [];
                              
                              if (addressToUse) {
                                if (addressToUse.address_line1) addressLines.push(addressToUse.address_line1);
                                if (addressToUse.address_line2) addressLines.push(addressToUse.address_line2);
                              }
                              
                              const fullAddress = addressLines.length > 0 ? addressLines.join('\n') : 'No address available';
                              console.log('Selected customer:', customer);
                              console.log('Formatted address:', fullAddress);
                              formik.setFieldValue('organization_address', fullAddress);
                            }
                          } catch (err) {
                            console.error('Failed to fetch customer details:', err);
                            setSelectedCustomer(null);
                            formik.setFieldValue('organization_name', '');
                            formik.setFieldValue('organization_address', '');
                          }
                        } else {
                          setSelectedCustomer(null);
                          formik.setFieldValue('organization_name', '');
                          formik.setFieldValue('organization_address', '');
                        }
                      }}
                      onBlur={formik.handleBlur}
                      label="Select Customer *"
                      error={
                        formik.touched.customer_id && Boolean(formik.errors.customer_id)
                      }
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Select a customer --</em>
                      </MenuItem>
                      {customers.map((customer: any) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.display_name || customer.first_name}
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
                <Grid size={{ xs: 12 }} component="div">
                  <TextField
                    fullWidth
                    label="Address *"
                    name="organization_address"
                    multiline
                    rows={4}
                    value={formik.values.organization_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.organization_address &&
                      Boolean(formik.errors.organization_address)
                    }
                    helperText={
                      formik.touched.organization_address &&
                      formik.errors.organization_address
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#333',
                        fontSize: '14px',
                      },
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Order Details Section */}
      <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Order Details
            </Typography>
          }
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '1px solid #e0e0e0',
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Reference Number */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Reference Number *"
                    name="reference_no"
                    value={formik.values.reference_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.reference_no &&
                      Boolean(formik.errors.reference_no)
                    }
                    helperText={
                      formik.touched.reference_no &&
                      formik.errors.reference_no
                    }
                    placeholder="e.g., PO-001"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
                <Tooltip title="Generate a unique reference number">
                  <Button
                    variant="outlined"
                    onClick={handleGenerateReference}
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

            {/* Order Date */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                label="Order Date *"
                name="date"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Delivery Date */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                label="Delivery Date *"
                name="delivery_date"
                type="date"
                value={formik.values.delivery_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.delivery_date && Boolean(formik.errors.delivery_date)}
                helperText={formik.touched.delivery_date && formik.errors.delivery_date}
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
                  {PAYMENT_TERMS.map((term) => (
                    <MenuItem key={term.value} value={term.value}>
                      {term.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.payment_terms && formik.errors.payment_terms && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
                  {String(formik.errors.payment_terms)}
                </Typography>
              )}
            </Grid>

            {/* Shipment Preference */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth>
                <InputLabel>Shipment Preference *</InputLabel>
                <Select
                  name="shipment_preference"
                  value={formik.values.shipment_preference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Shipment Preference *"
                  error={formik.touched.shipment_preference && Boolean(formik.errors.shipment_preference)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {SHIPMENT_PREFERENCES.map((pref) => (
                    <MenuItem key={pref.value} value={pref.value}>
                      {pref.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.touched.shipment_preference && formik.errors.shipment_preference && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
                  {String(formik.errors.shipment_preference)}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PurchaseOrderBasicInfo;
