'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Select,
  MenuItem,
  Alert,
  Divider,
  Tooltip,
  Stack,
  Avatar,
  InputAdornment,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import { FormikProps } from 'formik';
import { SalesOrder, SalesOrderLineItemInput } from '@/models/salesOrder.model';
import { apiService } from '@/lib/api/api.service';
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';
import { customerPricingService } from '@/lib/api/customerPricing.service';
import { productGroupService } from '@/services/productGroupService';
import type { Manufacturer as ManufacturerModel } from '@/models/manufacturer.model';
import type { CustomerPricing } from '@/models/customerPricing.model';
import type { ProductGroupDetailsOutput } from '@/models/product-group.model';

// ────────────────────────────────────────────────────────────────────────
// Helper to get auth token from localStorage
const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token:', e);
    return '';
  }
};

interface SalesOrderLineItemsProps {
  formik: FormikProps<SalesOrder>;
  customerId?: number | string;
}

type UIManufacturer = ManufacturerModel & {
  selling_price?: number;
  cost?: number;
  profit?: number;
  components?: Array<{
    product_id: string;
    quantity: number;
    product?: {
      selling_price?: number;
    };
  }>;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand: '#2563EB', brandLight: '#EFF6FF', brandBorder: '#BFDBFE',
  bg: '#FFFFFF', bgMuted: '#F8FAFC', bgHover: '#F1F5F9',
  border: '#E2E8F0', borderMd: '#CBD5E1',
  text: '#0F172A', textSub: '#475569', textMuted: '#64748B', textHint: '#94A3B8', textMd: '#1F2937',
  success: '#15803D', successBg: '#F0FDF4', successBdr: '#86EFAC',
  error: '#DC2626', errorBg: '#FEF2F2', errorBdr: '#FCA5A5',
  radius: '10px', radiusSm: '7px',
  shadow: '0 1px 2px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.04)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: T.radiusSm, fontSize: '0.875rem', background: T.bg,
    '& fieldset': { borderColor: T.border, borderWidth: '0.5px' },
    '&:hover fieldset': { borderColor: T.borderMd },
    '&.Mui-focused fieldset': { borderColor: '#93C5FD', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem', color: T.textMuted },
  '& .MuiInputLabel-root.Mui-focused': { color: T.brand },
};

const selectSx = {
  borderRadius: T.radiusSm, fontSize: '0.875rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border, borderWidth: '0.5px', borderRadius: T.radiusSm },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.borderMd },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD', borderWidth: '1.5px' },
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: T.textSub, letterSpacing: '0.2px' }}>
        {label}{required && <Box component="span" sx={{ color: T.error, ml: '2px' }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

const EMPTY_ITEM: SalesOrderLineItemInput = {
  manufacturer_id: '',
  manufacturer_name: '',
  quantity: 1,
  rate: 0,
  account: 'SALES',
};

export default function SalesOrderLineItems({ formik, customerId }: SalesOrderLineItemsProps) {
  const [manufacturers, setManufacturers] = useState<UIManufacturer[]>([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<SalesOrderLineItemInput>(EMPTY_ITEM);
  const [selectedManufacturer, setSelectedManufacturer] = useState<UIManufacturer | null>(null);
  const [loadingCustomerPricing, setLoadingCustomerPricing] = useState(false);
  const [customerPricing, setCustomerPricing] = useState<CustomerPricing | null>(null);
  const [pricingSource, setPricingSource] = useState<'product' | 'manufacturer' | 'default' | null>(null);
  const [productGroupDetails, setProductGroupDetails] = useState<ProductGroupDetailsOutput | null>(null);
  const [manufacturerDetails, setManufacturerDetails] = useState<any>(null);
  const [loadingManufacturerDetails, setLoadingManufacturerDetails] = useState(false);
  const [loadingProductGroup, setLoadingProductGroup] = useState(false);

  // Fetch manufacturers
  useEffect(() => {
    setLoadingManufacturers(true);
    const fetchManufacturers = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://127.0.0.1:8088/manufacturers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const result = await response.json();
        if (result.data && Array.isArray(result.data.manufacturers)) {
          setManufacturers(result.data.manufacturers);
        }
      } catch (error) {
        console.error('Failed to fetch manufacturers:', error);
      } finally {
        setLoadingManufacturers(false);
      }
    };
    fetchManufacturers();
  }, []);

  useEffect(() => {
    const loadCustomerPricing = async () => {
      if (!customerId) {
        setCustomerPricing(null);
        return;
      }

      setLoadingCustomerPricing(true);
      try {
        const numericCustomerId = Number(customerId);
        if (Number.isNaN(numericCustomerId)) {
          console.warn('Invalid customerId for pricing lookup:', customerId);
          setCustomerPricing(null);
          return;
        }

        const pricingResponse = await customerPricingService.getByCustomerId(numericCustomerId, 100, 0);
        const pricingRecords = pricingResponse.data?.pricings || [];
        const mergedLineItems = pricingRecords.flatMap((pricing) => pricing.line_items || []);

        setCustomerPricing({
          customer_id: numericCustomerId,
          customer_name: pricingRecords[0]?.customer_name,
          line_items: mergedLineItems,
        });
      } catch (error) {
        console.error('Failed to load customer pricing:', error);
        setCustomerPricing(null);
      } finally {
        setLoadingCustomerPricing(false);
      }
    };

    loadCustomerPricing();
  }, [customerId]);

  const fetchProductGroupDetails = async (productGroupId: string) => {
    if (!productGroupId) return;
    setLoadingProductGroup(true);
    try {
      const response = await productGroupService.getProductGroup(productGroupId);
      setProductGroupDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch product group details:', error);
      setProductGroupDetails(null);
    } finally {
      setLoadingProductGroup(false);
    }
  };

  const calculateProductGroupRate = async (manufacturer: UIManufacturer): Promise<number | null> => {
    if (!customerPricing || !manufacturer.product_group_id) return null;

    let group = productGroupDetails?.id === manufacturer.product_group_id ? productGroupDetails : null;

    if (!group) {
      try {
        setLoadingProductGroup(true);
        const response = await productGroupService.getProductGroup(manufacturer.product_group_id);
        group = response.data;
        setProductGroupDetails(group);
      } catch (error) {
        console.error('Failed to fetch product group details:', error);
        return null;
      } finally {
        setLoadingProductGroup(false);
      }
    }

    if (!group?.components?.length) return null;

    let total = 0;
    let hasPricing = false;

    for (const component of group.components) {
      const productPricing = customerPricing.line_items.find(
        (item) => String(item.product_id) === String(component.product_id)
      );

      if (productPricing?.rate != null) {
        total += productPricing.rate * component.quantity;
        hasPricing = true;
        continue;
      }

      if (component.product?.selling_price != null) {
        total += component.product.selling_price * component.quantity;
        continue;
      }

      return null;
    }

    return hasPricing ? total : null;
  };

  const getBestCustomerRate = async (manufacturer: UIManufacturer): Promise<{ rate: number; source: 'product' | 'manufacturer' | 'default' }> => {
    const productRate = await calculateProductGroupRate(manufacturer);
    if (productRate !== null) {
      return { rate: productRate, source: 'product' };
    }

    const manufacturerPricing = customerPricing?.line_items.find(
      (item) => String(item.manufacturer_id) === String(manufacturer.id)
    );

    if (manufacturerPricing?.rate != null) {
      return { rate: manufacturerPricing.rate, source: 'manufacturer' };
    }

    return { rate: manufacturer.selling_price ?? 0, source: 'default' };
  };

  useEffect(() => {
    if (!selectedManufacturer) return;

    const applyBestRate = async () => {
      setLoadingCustomerPricing(true);
      try {
        const { rate, source } = await getBestCustomerRate(selectedManufacturer);
        setFormData((prev) => ({
          ...prev,
          rate,
        }));
        setPricingSource(source);
      } finally {
        setLoadingCustomerPricing(false);
      }
    };

    applyBestRate();
  }, [selectedManufacturer, customerPricing]);

  // Fetch detailed manufacturer information
  const fetchManufacturerDetails = async (manufacturerId: string) => {
    try {
      setLoadingManufacturerDetails(true);
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8088/manufacturers/${manufacturerId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch manufacturer details');
        setManufacturerDetails(null);
        return;
      }

      const result = await response.json();
      if (result.data) {
        setManufacturerDetails(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch manufacturer details:', error);
      setManufacturerDetails(null);
    } finally {
      setLoadingManufacturerDetails(false);
    }
  };

  const openDialog = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index];
      setFormData(item as SalesOrderLineItemInput);
      setEditIndex(index);
      if (item.manufacturer_id) {
        const manufacturer = manufacturers.find(m => m.id === item.manufacturer_id);
        if (manufacturer) {
          setSelectedManufacturer(manufacturer);
          fetchManufacturerDetails(item.manufacturer_id);
        }
      }
    } else {
      setEditIndex(null);
      setFormData(EMPTY_ITEM);
      setSelectedManufacturer(null);
      setManufacturerDetails(null);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditIndex(null);
    setSelectedManufacturer(null);
    setManufacturerDetails(null);
  };

  const handleSave = () => {
    if (!formData.manufacturer_id || !formData.manufacturer_name || !formData.quantity || !formData.rate || !formData.account) {
      alert('Please fill in all required fields');
      return;
    }
    const lineItems = [...formik.values.line_items];
    const amount = formData.quantity * formData.rate;
    const lineItem = { ...formData, amount } as any;
    if (editIndex !== null) {
      lineItems[editIndex] = lineItem;
    } else {
      lineItems.push(lineItem);
    }
    formik.setFieldValue('line_items', lineItems);
    closeDialog();
  };

  const handleDelete = (index: number) => {
    formik.setFieldValue(
      'line_items',
      formik.values.line_items.filter((_, i) => i !== index)
    );
  };

  const handleManufacturerChange = (value: UIManufacturer | null) => {
    if (!value?.id) {
      setSelectedManufacturer(null);
      setFormData(EMPTY_ITEM);
      setManufacturerDetails(null);
      setPricingSource(null);
      return;
    }

    setSelectedManufacturer(value);
    setFormData((prev) => ({
      ...prev,
      manufacturer_id: value.id,
      manufacturer_name: value.name,
      rate: value.selling_price || 0,
    }));
    setPricingSource(null);
    setManufacturerDetails(null);

    fetchManufacturerDetails(value.id);
    if (value.product_group_id) {
      fetchProductGroupDetails(value.product_group_id);
    }
  };

  const subtotal = formik.values.line_items.reduce((s, i) => s + ((i as any).amount || 0), 0);
  const lineCount = formik.values.line_items.length;
  const selectedManufacturerOption = manufacturers.find((m) => m.id === formData.manufacturer_id);

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    Line Items
                  </Typography>
                  {lineCount > 0 && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#0f172a',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                      }}
                    >
                      {lineCount}
                    </Box>
                  )}
                </Stack>
                <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                  Products and quantities in this order
                </Typography>
              </Box>
            </Stack>

            <Button
              startIcon={<AddIcon />}
              onClick={() => openDialog()}
              sx={{
                borderRadius: 2,
                px: 2.25,
                py: 0.875,
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                color: '#fff',
                bgcolor: '#0f172a',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
              }}
            >
              Add Item
            </Button>
          </Stack>

          {formik.touched.line_items && typeof formik.errors.line_items === 'string' && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formik.errors.line_items}
            </Alert>
          )}

          {lineCount === 0 ? (
            /* Empty state */
            <Box
              sx={{
                border: '2px dashed #e2e8f0',
                borderRadius: 2.5,
                py: 7,
                textAlign: 'center',
                bgcolor: '#fafbfc',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  color: '#94a3b8',
                }}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                No items added yet
              </Typography>
              <Typography sx={{ fontSize: '0.825rem', color: '#94a3b8', mb: 3 }}>
                Add products to your sales order to get started
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => openDialog()}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.875,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#fff',
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Add First Item
              </Button>
            </Box>
          ) : (
            /* Table */
            <>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Product Group', 'Qty', 'Rate', 'Amount', ''].map((h, i) => (
                        <TableCell
                          key={i}
                          align={['Qty', 'Rate', 'Amount'].includes(h) ? 'right' : i === 4 ? 'center' : 'left'}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            py: 1.5,
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.line_items.map((item: SalesOrderLineItemInput, idx: number) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:last-child td': { border: 0 },
                          '& td': { borderBottom: '1px solid #f8fafc', py: 1.75 },
                          '&:hover': { bgcolor: '#fafbfe' },
                          '&:hover .line-actions': { opacity: 1 },
                          transition: 'background 0.1s',
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                bgcolor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                flexShrink: 0,
                              }}
                            >
                              <InventoryOutlinedIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                                {item.manufacturer_name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {item.account}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 32,
                              height: 28,
                              px: 1,
                              borderRadius: 1.5,
                              bgcolor: '#f1f5f9',
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              color: '#475569',
                            }}
                          >
                            {item.quantity}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: '0.875rem', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}
                          >
                            ₹{((item as any).amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            className="line-actions"
                            direction="row"
                            spacing={0.25}
                            justifyContent="center"
                            sx={{ opacity: 0.35, transition: 'opacity 0.15s' }}
                          >
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() => openDialog(idx)}
                                sx={{ borderRadius: 1.5, color: '#475569', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(idx)}
                                sx={{ borderRadius: 1.5, color: '#475569', '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' } }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Subtotal bar */}
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={3}
                sx={{
                  mt: 2,
                  px: 2.5,
                  py: 1.75,
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #f1f5f9',
                }}
              >
                <Typography sx={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>
                  Subtotal ({lineCount} item{lineCount !== 1 ? 's' : ''})
                </Typography>
                <Typography
                  sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                >
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #f1f5f9',
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(15,23,42,0.14)',
          },
        }}
      >
        {/* Dialog Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              {editIndex !== null ? <EditIcon sx={{ fontSize: 17 }} /> : <AddIcon sx={{ fontSize: 17 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {editIndex !== null ? 'Edit Line Item' : 'Add Line Item'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {editIndex !== null ? 'Update product details' : 'Select a product and set quantity'}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={closeDialog}
            sx={{ borderRadius: 1.5, color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9', color: '#475569' } }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {loadingManufacturers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#0f172a' }} />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {/* Manufacturer select */}
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Manufacturer <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <Autocomplete
                  size="small"
                  options={manufacturers}
                  getOptionLabel={(o) => `${o.name || ''}`}
                  value={selectedManufacturerOption || null}
                  onChange={(_, val) => handleManufacturerChange(val)}
                  renderOption={(props, option) => {
                    const componentCount = option.components?.length ?? 0;
                    return (
                      <Box component="li" {...props} sx={{ py: '10px !important', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1.5,
                            bgcolor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            flexShrink: 0,
                          }}
                        >
                          <InventoryOutlinedIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{option.name}</Typography>
                          {componentCount > 0 && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {componentCount} component{componentCount > 1 ? 's' : ''}
                            </Typography>
                          )}
                          {option.selling_price != null && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Selling: ₹{option.selling_price.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Search and select a manufacturer…" sx={{ mb: 0 }} />
                  )}
                  noOptionsText="No manufacturers found"
                />
              </Box>

              {/* Customer Pricing Info */}
              {customerId && selectedManufacturer && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    bgcolor: '#f0fdf4',
                    borderRadius: 2,
                    border: '1px solid #86EFAC',
                  }}
                >
                  <Stack direction="column" spacing={0.5}>
                    <Typography sx={{ fontSize: '0.825rem', color: '#15803D', fontWeight: 500 }}>
                      {loadingCustomerPricing ? 'Fetching customer pricing...' : `Customer rate: ₹${formData.rate.toFixed(2)}`}
                    </Typography>
                    {!loadingCustomerPricing && pricingSource && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#0f5132' }}>
                        {pricingSource === 'product'
                          ? 'Applied from product-level customer pricing for manufacturing components'
                          : pricingSource === 'manufacturer'
                          ? 'Applied from customer pricing for this manufacturer'
                          : 'Using default manufacturer selling price'}
                      </Typography>
                    )}
                  </Stack>
                  {(loadingCustomerPricing || loadingProductGroup) && (
                    <CircularProgress size={16} sx={{ color: '#15803D' }} />
                  )}
                </Box>
              )}

              {selectedManufacturer && productGroupDetails?.components?.length ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Product Components & Customer Pricing
                  </Typography>
                  <Stack spacing={1.25}>
                    {productGroupDetails.components.map((component, idx) => {
                      const productPrice = customerPricing?.line_items.find(
                        (item) => String(item.product_id) === String(component.product_id)
                      )?.rate;
                      const unitPrice = productPrice ?? component.product?.selling_price ?? 0;
                      return (
                        <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                              {component.product?.name || component.product_id}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Qty per unit: {component.quantity}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Price source: {productPrice != null ? 'Customer pricing' : component.product?.selling_price != null ? 'Product selling price' : 'None'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                              ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Total: ₹{(unitPrice * component.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.825rem', color: '#0f172a', fontWeight: 700 }}>Component bundle rate</Typography>
                      <Typography sx={{ fontSize: '0.825rem', color: '#0f172a', fontWeight: 700 }}>
                        ₹{productGroupDetails.components.reduce((sum, component) => {
                          const productPrice = customerPricing?.line_items.find(
                            (item) => String(item.product_id) === String(component.product_id)
                          )?.rate;
                          const unitPrice = productPrice ?? component.product?.selling_price ?? 0;
                          return sum + unitPrice * component.quantity;
                        }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ) : null}

              {/* Manufacturer Details */}
              {selectedManufacturer && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Manufacturing Details
                  </Typography>
                  
                  {loadingManufacturerDetails ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#0f172a' }} />
                    </Box>
                  ) : manufacturerDetails ? (
                    <Stack spacing={1.25}>
                      {/* Quantity */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Quantity Available</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                          {manufacturerDetails.quantity || '—'}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Status</Typography>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 0.4,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor:
                              manufacturerDetails.status === 'completed'
                                ? '#f0fdf4'
                                : manufacturerDetails.status === 'in_progress'
                                ? '#fffbeb'
                                : '#f1f5f9',
                            color:
                              manufacturerDetails.status === 'completed'
                                ? '#15803d'
                                : manufacturerDetails.status === 'in_progress'
                                ? '#b45309'
                                : '#64748b',
                          }}
                        >
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              bgcolor: 'currentColor',
                            }}
                          />
                          {manufacturerDetails.status || '—'}
                        </Box>
                      </Box>

                      {/* Description */}
                      {manufacturerDetails.description && (
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>Description</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                            {manufacturerDetails.description}
                          </Typography>
                        </Box>
                      )}

                      {/* Employees / Service Costs */}
                      {manufacturerDetails.employees && manufacturerDetails.employees.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 0.75 }}>Service Costs</Typography>
                          <Stack spacing={0.5}>
                            {manufacturerDetails.employees.map((emp: any, idx: number) => (
                              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <Typography sx={{ color: '#475569' }}>
                                  Employee {emp.employee_id} ({emp.cost_type})
                                </Typography>
                                <Typography sx={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                  ₹{emp.service_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      No details available
                    </Typography>
                  )}
                </Box>
              )}

              {/* Account Selection */}
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Account <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={formData.account || 'SALES'}
                  onChange={(e) => setFormData((p) => ({ ...p, account: e.target.value }))}
                >
                  <MenuItem value="SALES">Sales</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="cost_of_goods_sold">Cost of Goods Sold</MenuItem>
                  <MenuItem value="inventory">Inventory</MenuItem>
                </Select>
              </Box>

              {/* Qty + Rate */}
              <Stack direction="row" spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    Quantity <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                    fullWidth
                    inputProps={{ min: 1, step: 1 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    Rate (₹) <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData((p) => ({ ...p, rate: Number(e.target.value) }))}
                    fullWidth
                    inputProps={{ step: '0.01', min: 0 }}
                  />
                </Box>
              </Stack>

              {/* Auto-calculated amount */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #f1f5f9',
                }}
              >
                <Typography sx={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>
                  Line Total
                </Typography>
                <Typography
                  sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                >
                  ₹{(formData.quantity * formData.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.25,
          }}
        >
          <Button
            onClick={closeDialog}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.875,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.manufacturer_id || !formData.quantity || !formData.rate || !formData.account}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 0.875,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#fff',
              bgcolor: '#0f172a',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#cbd5e1', color: '#fff' },
            }}
          >
            {editIndex !== null ? 'Update Item' : 'Add Item'}
          </Button>
        </Box>
      </Dialog>
    </Stack>
  );
}
