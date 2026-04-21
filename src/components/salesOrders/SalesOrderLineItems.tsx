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
import { SalesOrder, LineItem } from '@/models/salesOrder.model';
import { Product } from '@/models/product';
import { productService } from '@/lib/api/productService';
import { stockService } from '@/lib/api/stockService';

interface SalesOrderLineItemsProps {
  formik: FormikProps<SalesOrder>;
}

interface LineItemFormData extends LineItem {
  variant_details?: Record<string, any>;
}

interface ProductStockInfo {
  product_id: string;
  availability_percentage: number;
  current_stock: number;
  available_stock: number;
  reorder_level: number;
}

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

const EMPTY_ITEM: LineItemFormData = {
  product_id: '',
  product_name: '',
  sku: '',
  account: 'revenue',
  quantity: 1,
  rate: 0,
  variant_sku: '',
  variant_details: {},
  delivered_quantity: 0,
};

export default function SalesOrderLineItems({ formik }: SalesOrderLineItemsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LineItemFormData>(EMPTY_ITEM);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [stockData, setStockData] = useState<Map<string, ProductStockInfo>>(new Map());

  // Fetch products and stock data
  useEffect(() => {
    setLoadingProducts(true);
    productService.getProducts(1, 100)
      .then((r) => { 
        if (r.products) {
          setProducts(r.products as any);
          // Fetch stock data for all products
          fetchStockDataForProducts(r.products as any);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch stock data for products
  const fetchStockDataForProducts = async (productsList: Product[]) => {
    try {
      const stockMap = new Map<string, ProductStockInfo>();
      for (const product of productsList) {
        try {
          const stock = await stockService.getStockByProductId(product.id);
          if (stock) {
            // Calculate availability percentage based on current_stock
            // If available_stock is less than 3% of current_stock, flag as low availability
            const currentStock = stock.current_stock || 1;
            const availabilityPercentage = (stock.available_stock / currentStock) * 100;
            const reorderLevel = currentStock; // Use current_stock as baseline for reference
            
            stockMap.set(product.id, {
              product_id: product.id,
              availability_percentage: availabilityPercentage,
              current_stock: stock.current_stock,
              available_stock: stock.available_stock,
              reorder_level: reorderLevel,
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch stock for product ${product.id}:`, err);
        }
      }
      setStockData(stockMap);
    } catch (err) {
      console.error('Error fetching stock data:', err);
    }
  };

  const openDialog = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index];
      setFormData(item);
      setEditIndex(index);
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          setSelectedProduct(product);
          if (item.sku) {
            setSelectedVariant(product.product_details?.variants?.find((v: any) => v.sku === item.sku) || null);
          }
        }
      }
    } else {
      setEditIndex(null);
      setFormData(EMPTY_ITEM);
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditIndex(null);
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  const handleSave = () => {
    if (!formData.product_id || !formData.quantity || !formData.rate) return;
    const lineItems = [...formik.values.line_items];
    const amount = formData.quantity * formData.rate; 
    const safeFormData = {
      ...formData,
      product_name: formData.product_name || '',
      sku: formData.sku || '',
    };
    if (editIndex !== null) lineItems[editIndex] = { ...safeFormData, amount };
    else lineItems.push({ ...safeFormData, amount });
    formik.setFieldValue('line_items', lineItems);
    closeDialog();
  };

  const handleDelete = (index: number) => {
    formik.setFieldValue(
      'line_items',
      formik.values.line_items.filter((_, i) => i !== index)
    );
  };

  const handleProductChange = async (value: any) => {
    if (!value?.id) {
      setSelectedProduct(null);
      setSelectedVariant(null);
      setFormData(EMPTY_ITEM);
      return;
    }
    setFormData((p) => ({ 
      ...p, 
      product_id: value.id, 
      product_name: value.name,
    }));
    setSelectedProduct(value);
    setSelectedVariant(null);
    
    // Auto-select selling_price from sales_info
    if (value.product_details?.variants?.length === 1) {
      const v = value.product_details.variants[0];
      setSelectedVariant(v);
      setFormData(prev => ({ 
        ...prev, 
        rate: v.selling_price || 0, 
        sku: v.sku,
        variant_sku: v.sku,
        variant_details: v.attribute_map || {} 
      }));
    } else if (value.sales_info?.selling_price) {
      setFormData(prev => ({ ...prev, rate: value.sales_info.selling_price || 0 }));
    }
  };

  const subtotal = formik.values.line_items.reduce((s, i) => s + (i.amount || 0), 0);
  const lineCount = formik.values.line_items.length;
  const selectedProductOption = products.find((p) => p.id === formData.product_id);
  
  // Find line items with low availability (< 3%) - updates whenever stockData changes
  const lowAvailabilityItems = React.useMemo(() => {
    return formik.values.line_items.filter(item => {
      const stock = stockData.get(item.product_id as string);
      return stock && stock.availability_percentage < 3;
    });
  }, [formik.values.line_items, stockData]);

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Low Availability Alert */}
          {lowAvailabilityItems.length > 0 && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.75 }}>
                  ⚠️ Low Stock Availability
                </Typography>
                <Box sx={{ fontSize: '0.85rem', color: 'inherit' }}>
                  {lowAvailabilityItems.map((item) => {
                    const stock = stockData.get(item.product_id as string);
                    return (
                      <Box key={item.product_id} sx={{ mt: 0.5 }}>
                        <strong>{item.product_name}</strong> has only{' '}
                        <strong>{stock?.availability_percentage.toFixed(1)}%</strong> availability
                        ({stock?.available_stock} of {stock?.reorder_level} units)
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Alert>
          )}

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
                      {['Product', 'Qty', 'Rate', 'Amount', ''].map((h, i) => (
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
                    {formik.values.line_items.map((item, idx) => (
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
                              <Stack direction="row" alignItems="center" spacing={0.75} mb={0.25}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                                  {item.product_name || item.product_id}
                                </Typography>
                                {stockData.get(item.product_id as string)?.availability_percentage !== undefined && 
                                  stockData.get(item.product_id as string)!.availability_percentage < 3 && (
                                  <Tooltip 
                                    title={`Availability: ${stockData.get(item.product_id as string)?.availability_percentage.toFixed(1)}%`}
                                    arrow
                                  >
                                    <Box 
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        bgcolor: '#fee2e2',
                                        color: '#dc2626',
                                      }}
                                    >
                                      <WarningIcon sx={{ fontSize: 12 }} />
                                    </Box>
                                  </Tooltip>
                                )}
                              </Stack>
                              {item.sku && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  SKU: {item.sku}
                                  {item.variant_details &&
                                    Object.entries(item.variant_details)
                                      .filter(([k]) => k !== 'sku')
                                      .map(([k, v]) => ` · ${k}: ${v}`)
                                      .join('')}
                                </Typography>
                              )}
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
                            ₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
          {loadingProducts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#0f172a' }} />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {/* Product select */}
              <Box>
                <Field label="Product" required>
                  <Autocomplete
                    size="small"
                    options={products}
                    getOptionLabel={(o) => `${o.name || ''}`}
                    value={selectedProductOption || null}
                    onChange={(_, val) => handleProductChange(val)}
                    renderOption={(props, option) => (
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
                          {option.product_details?.base_sku && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>SKU: {option.product_details.base_sku}</Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Search and select a product…" sx={inputSx} />
                    )}
                    noOptionsText="No products found"
                  />
                </Field>
              </Box>

              {/* Variant select */}
              {selectedProduct?.product_details?.variants && selectedProduct.product_details.variants.length > 0 && (
                <Box>
                  <Field label={selectedProduct.product_details.variants.length > 1 ? "Variant" : "Product Variant"} required={selectedProduct.product_details.variants.length > 1}>
                    <Select
                      size="small"
                      fullWidth
                      value={formData.sku || ''}
                      onChange={(e) => {
                        const v = selectedProduct.product_details?.variants?.find((v: any) => v.sku === e.target.value);
                        if (v) {
                          setSelectedVariant(v);
                          setFormData((p) => ({ ...p, rate: v.selling_price || 0, sku: v.sku, variant_sku: v.sku, variant_details: v.attribute_map || {} }));
                        }
                      }}
                      displayEmpty
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        Select a variant…
                      </MenuItem>
                      {selectedProduct.product_details.variants.map((v: any, i: number) => {
                        const attrs = Object.entries(v.attribute_map || {}).map(([k, val]) => `${k}: ${val}`).join(', ');
                        return (
                          <MenuItem key={i} value={v.sku} sx={{ fontSize: '0.875rem' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography component="span" sx={{ fontWeight: 600 }}>{v.sku}</Typography>
                                {attrs && <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b' }}>— {attrs}</Typography>}
                              </Box>
                              <Typography component="span" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                ₹{v.selling_price?.toFixed(2) || '0.00'} (selling)
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Field>
                </Box>
              )}

              {/* SKU Display Field */}
              {formData.sku && (
                <Box>
                  <Field label="SKU">
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        background: '#f8fafc',
                        borderRadius: '7px',
                        border: '0.5px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                        {formData.sku}
                      </Typography>
                      {selectedVariant?.attribute_map && Object.keys(selectedVariant.attribute_map).length > 0 && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {Object.entries(selectedVariant.attribute_map).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </Typography>
                      )}
                    </Box>
                  </Field>
                </Box>
              )}

              {/* Account Selection */}
              <Box>
                <Field label="Account">
                  <Select
                    size="small"
                    fullWidth
                    value={formData.account || 'revenue'}
                    onChange={(e) => setFormData((p) => ({ ...p, account: e.target.value }))}
                    sx={selectSx}
                  >
                    <MenuItem value="revenue">Revenue</MenuItem>
                    <MenuItem value="cost_of_goods_sold">Cost of Goods Sold</MenuItem>
                    <MenuItem value="inventory">Inventory</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                  </Select>
                </Field>
              </Box>

              {/* Qty + Rate */}
              <Stack direction="row" spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Field label="Quantity" required>
                    <TextField
                      size="small"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                      fullWidth
                      inputProps={{ min: 1, step: 1 }}
                      sx={inputSx}
                    />
                  </Field>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Field label="Rate (₹)" required>
                    <TextField
                      size="small"
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData((p) => ({ ...p, rate: Number(e.target.value) }))}
                      fullWidth
                      inputProps={{ step: '0.01', min: 0 }}
                      sx={inputSx}
                    />
                  </Field>
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
            disabled={!formData.product_id || !formData.quantity || !formData.rate}
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
