'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Autocomplete,
  CircularProgress,
  Tooltip,
  Fade,
  Typography,
  Select,
  MenuItem,
  Alert,
  alpha,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { PurchaseOrder, PurchaseOrderLineItemInput } from '@/models/purchaseOrder.model';
import { Product } from '@/models/product';
import { calculateLineItemAmount } from './purchaseOrderForm.utils';
import { productService } from '@/lib/api/productService';

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

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItemFormData extends PurchaseOrderLineItemInput { }
interface ProductOption { id: string; name: string; }
interface PurchaseOrderLineItemsProps { formik: FormikProps<PurchaseOrder>; }

// ─── Component ────────────────────────────────────────────────────────────────
export const PurchaseOrderLineItems: React.FC<PurchaseOrderLineItemsProps> = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LineItemFormData>({
    product_id: '',
    product_name: '',
    sku: '',
    variant_sku: '',
    variant_name: '',
    account: 'Cost of Goods Sold',
    quantity: 1,
    rate: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    setLoadingProducts(true);
    productService.getProducts(1, 100)
      .then((r) => { if (r.products) setProducts(r.products); })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleOpen = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index] as any;
      setFormData(item);
      setEditingIndex(index);
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          setSelectedProduct(product);
          if (item.variant_sku || item.sku) {
            setSelectedVariant(product.product_details?.variants?.find((v: any) => v.sku === (item.variant_sku || item.sku)) || null);
          }
        }
      }
    } else {
      setFormData({
        product_id: '',
        product_name: '',
        sku: '',
        variant_sku: '',
        variant_name: '',
        account: 'Cost of Goods Sold',
        quantity: 1,
        rate: 0,
      });
      setEditingIndex(null);
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  const handleSave = () => {
    if (!formData.product_id || formData.quantity <= 0 || formData.rate < 0) {
      alert('Please fill all required fields correctly');
      return;
    }
    if (!formData.account) {
      alert('Please select an account');
      return;
    }
    const items_ = [...formik.values.line_items];
    const amount = calculateLineItemAmount(formData.quantity, formData.rate);
    
    const lineItem: any = {
      ...formData,
      amount,
    };

    if (editingIndex !== null) {
      items_[editingIndex] = lineItem;
    } else {
      items_.push(lineItem);
    }
    formik.setFieldValue('line_items', items_);
    handleClose();
  };

  const handleDelete = (index: number) => {
    formik.setFieldValue('line_items', formik.values.line_items.filter((_, i) => i !== index));
  };

  const selectedProductOption = products.find((p) => p.id === formData.product_id);
  const total = formik.values.line_items.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: T.text }}>
            Line items
            {formik.values.line_items.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1, px: 1, py: '1px', borderRadius: '99px',
                  background: T.brandLight, color: T.brand,
                  fontSize: '0.72rem', fontWeight: 700, border: `0.5px solid ${T.brandBorder}`,
                }}
              >
                {formik.values.line_items.length}
              </Box>
            )}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: '2px' }}>
            Add products or services to this order
          </Typography>
        </Box>
        <Box
          onClick={() => handleOpen()}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            px: 2, py: 0.875, borderRadius: T.radiusSm, cursor: 'pointer',
            background: T.brand, color: '#FFF',
            fontSize: '0.8rem', fontWeight: 600,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            transition: 'all 0.15s',
            '&:hover': { background: '#1D4ED8', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
            '&:active': { transform: 'none' },
          }}
        >
          <AddIcon sx={{ fontSize: 15 }} />
          Line Items
        </Box>
      </Box>

      {/* Error */}
      {formik.touched.line_items && typeof formik.errors.line_items === 'string' && (
        <Alert severity="error" sx={{ borderRadius: T.radiusSm, border: `0.5px solid ${T.errorBdr}`, background: T.errorBg, '& .MuiAlert-icon': { color: T.error } }}>
          <Typography sx={{ fontSize: '0.8rem' }}>{formik.errors.line_items}</Typography>
        </Alert>
      )}

      {/* Table */}
      {formik.values.line_items.length > 0 ? (
        <Fade in timeout={250}>
          <Box
            sx={{
              background: T.bg, border: `0.5px solid ${T.border}`,
              borderRadius: T.radius, overflow: 'hidden',
              boxShadow: T.shadow,
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: T.bgMuted }}>
                    {['Item', 'Account', 'Qty', 'Rate (₹)', 'Amount (₹)', ''].map((h) => (
                      <TableCell
                        key={h}
                        align={['Qty', 'Rate (₹)', 'Amount (₹)'].includes(h) ? 'right' : h === '' ? 'center' : 'left'}
                        sx={{
                          fontSize: '0.67rem', fontWeight: 700, color: T.textMuted,
                          textTransform: 'uppercase', letterSpacing: '0.6px',
                          py: 1.25, borderBottom: `0.5px solid ${T.border}`,
                          whiteSpace: 'nowrap',
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
                        '&:hover': { background: T.bgMuted },
                        transition: 'background 0.15s',
                        borderBottom: idx < formik.values.line_items.length - 1 ? `0.5px solid ${T.border}` : 'none',
                      }}
                    >
                      {/* Item */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                              background: T.brandLight, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: T.brand,
                            }}
                          >
                            <InventoryIcon sx={{ fontSize: 13 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: T.text }}>
                              {(item as any).product_name || (item as any).product_id || '—'}
                            </Typography>
                            {/* Show variant name if available */}
                            {(item as any).variant_name && (
                              <Typography sx={{ fontSize: '0.68rem', color: T.brand, mt: '1px', fontWeight: 500 }}>
                                {(item as any).variant_name}
                              </Typography>
                            )}
                            {/* Show variant SKU if available, otherwise show SKU */}
                            {(item as any).variant_sku && (
                              <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, mt: '1px' }}>
                                SKU: {(item as any).variant_sku}
                              </Typography>
                            )}
                            {!(item as any).variant_sku && (item as any).sku && (
                              <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, mt: '1px' }}>
                                SKU: {(item as any).sku}
                              </Typography>
                            )}
                            {/* Show attributes if available */}
                            {(item as any).variant_details && Object.keys((item as any).variant_details).length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, mt: '4px' }}>
                                {Object.entries((item as any).variant_details).map(([k, v]) => (
                                  <Box
                                    key={k}
                                    sx={{
                                      px: 0.75, py: '2px',
                                      background: T.brandLight, color: T.brand,
                                      borderRadius: '3px', fontSize: '0.6rem', fontWeight: 500,
                                    }}
                                  >
                                    {k}: {v}
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Account */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex', px: 1.25, py: '3px',
                            borderRadius: '99px', background: '#F5F3FF',
                            border: '0.5px solid #DDD6FE', color: '#7C3AED',
                            fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
                          }}
                        >
                          {item.account}
                        </Box>
                      </TableCell>

                      {/* Qty */}
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'inline-flex', px: 1.25, py: '2px',
                            borderRadius: '99px', background: T.bgMuted,
                            border: `0.5px solid ${T.border}`, color: T.textMd,
                            fontSize: '0.78rem', fontWeight: 700, minWidth: 36, justifyContent: 'center',
                          }}
                        >
                          {item.quantity}
                        </Box>
                      </TableCell>

                      {/* Rate */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: T.textMd, fontVariantNumeric: 'tabular-nums' }}>
                          {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Amount */}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>
                          {(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small" onClick={() => handleOpen(idx)}
                              sx={{
                                width: 28, height: 28, borderRadius: '6px',
                                color: T.textMuted,
                                '&:hover': { background: T.brandLight, color: T.brand },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove" arrow>
                            <IconButton
                              size="small" onClick={() => handleDelete(idx)}
                              sx={{
                                width: 28, height: 28, borderRadius: '6px',
                                color: T.textMuted,
                                '&:hover': { background: T.errorBg, color: T.error },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Subtotal footer */}
            <Box
              sx={{
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.5,
                background: T.bgMuted, borderTop: `0.5px solid ${T.border}`,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500 }}>Subtotal</Typography>
              <Typography
                sx={{
                  fontSize: '0.95rem', fontWeight: 700, color: T.text,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={250}>
          <Box
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', py: 6,
              background: T.bg, border: `1px dashed ${T.borderMd}`,
              borderRadius: T.radius, textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 52, height: 52, borderRadius: '14px',
                background: T.bgMuted, display: 'flex',
                alignItems: 'center', justifyContent: 'center', mb: 1.5,
                border: `0.5px solid ${T.border}`,
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 22, color: T.textHint }} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textMd, mb: '4px' }}>
              No items yet
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, mb: 2 }}>
              Add products or services to get started
            </Typography>
            <Box
              onClick={() => handleOpen()}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 0.875, borderRadius: T.radiusSm, cursor: 'pointer',
                background: T.brandLight, color: T.brand,
                border: `0.5px solid ${T.brandBorder}`,
                fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s',
                '&:hover': { background: '#DBEAFE' },
              }}
            >
              <AddIcon sx={{ fontSize: 14 }} />
              Add first item
            </Box>
          </Box>
        </Fade>
      )}

      {/* ── Dialog ────────────────────────────────────────────────────────── */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            boxShadow: '0 8px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)',
            border: `0.5px solid ${T.border}`,
          },
        }}
      >
        {/* Dialog header */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 2,
            background: T.bgMuted, borderBottom: `0.5px solid ${T.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 30, height: 30, borderRadius: '8px',
                background: T.brandLight, color: T.brand,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {editingIndex !== null ? <EditOutlinedIcon sx={{ fontSize: 15 }} /> : <AddIcon sx={{ fontSize: 15 }} />}
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text }}>
              {editingIndex !== null ? 'Edit line item' : 'Add line item'}
            </Typography>
          </Box>
          <IconButton
            size="small" onClick={handleClose}
            sx={{ color: T.textMuted, '&:hover': { background: T.bgHover } }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Dialog body */}
        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loadingProducts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} sx={{ color: T.brand }} />
            </Box>
          ) : (
            <>
              <Field label="Product" required>
                <Autocomplete
                  size="small"
                  options={products}
                  getOptionLabel={(o) => `${o.name || ''}`}
                  value={selectedProductOption || null}
                  onChange={async (_, val) => {
                    setFormData({ ...formData, product_id: val?.id || '', product_name: val?.name || '' });
                    if (val) {
                      setSelectedProduct(val);
                      setSelectedVariant(null);
                      // Auto-select cost_price from purchase_info if available
                      if (val.product_details?.variants?.length === 1) {
                        const v = val.product_details.variants[0];
                        setSelectedVariant(v);
                        setFormData(prev => ({
                          ...prev,
                          rate: v.cost_price || 0,
                          sku: v.sku,
                          variant_sku: v.sku,
                          variant_name: `${val.name} - ${Object.values(v.attribute_map || {}).join(' - ')}`,
                          variant_details: v.attribute_map || {},
                        }));
                      } else if (val.purchase_info?.cost_price) {
                        setFormData(prev => ({ ...prev, rate: val.purchase_info.cost_price }));
                      }
                    } else {
                      setSelectedProduct(null);
                      setSelectedVariant(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search products…"
                      sx={inputSx}
                    />
                  )}
                  noOptionsText="No products found"
                />
              </Field>

              {selectedProduct?.product_details?.variants && selectedProduct.product_details.variants.length > 0 && (
                <Field label={selectedProduct.product_details.variants.length > 1 ? "Variant" : "Product Variant"} required={selectedProduct.product_details.variants.length > 1}>
                  <Select
                    size="small" fullWidth
                    value={(formData as any).variant_sku || (formData as any).sku || ''}
                    displayEmpty
                    onChange={(e) => {
                      const v = selectedProduct.product_details?.variants?.find((x: any) => x.sku === e.target.value);
                      if (v) {
                        setSelectedVariant(v);
                        const attrs = v.attribute_map || {};
                        const variantName = `${selectedProduct.name} - ${Object.values(attrs).join(' - ')}`;
                        setFormData(prev => ({
                          ...prev,
                          rate: v.cost_price || 0,
                          sku: v.sku,
                          variant_sku: v.sku,
                          variant_name: variantName,
                          variant_details: attrs,
                        }));
                      }
                    }}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled><em style={{ color: T.textHint, fontStyle: 'normal' }}>Select variant…</em></MenuItem>
                    {selectedProduct.product_details?.variants?.map((v: any, i: number) => {
                      const attrs = Object.entries(v.attribute_map || {}).map(([k, val]) => `${k}: ${val}`).join(', ');
                      return (
                        <MenuItem key={i} value={v.sku} sx={{ fontSize: '0.875rem' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography component="span" sx={{ fontWeight: 600 }}>{v.sku}</Typography>
                              {attrs && <Typography component="span" sx={{ fontSize: '0.8rem', color: T.textMuted }}>— {attrs}</Typography>}
                            </Box>
                            <Typography component="span" sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                              ₹{v.cost_price?.toFixed(2) || '0.00'} (cost)
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Field>
              )}

              {(formData as any).variant_sku && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Variant Name */}
                  {(formData as any).variant_name && (
                    <Field label="Variant name">
                      <Box
                        sx={{
                          px: 2, py: 1.25,
                          background: T.bgMuted, borderRadius: T.radiusSm,
                          border: `0.5px solid ${T.border}`,
                          display: 'flex', flexDirection: 'column', gap: 0.75,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.text }}>
                          {(formData as any).variant_name}
                        </Typography>
                        {selectedVariant?.attribute_map && Object.keys(selectedVariant.attribute_map).length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                            {Object.entries(selectedVariant.attribute_map).map(([k, v]) => (
                              <Box
                                key={k}
                                sx={{
                                  px: 1, py: 0.25,
                                  background: T.brandLight, color: T.brand,
                                  borderRadius: T.radiusSm, fontSize: '0.7rem', fontWeight: 600,
                                }}
                              >
                                {k}: {v}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Field>
                  )}

                  {/* SKU Display */}
                  <Field label="SKU">
                    <Box
                      sx={{
                        px: 2, py: 1.25,
                        background: T.bgMuted, borderRadius: T.radiusSm,
                        border: `0.5px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>
                        {(formData as any).variant_sku}
                      </Typography>
                    </Box>
                  </Field>
                </Box>
              )}

              <Field label="Account" required>
                <TextField
                  fullWidth size="small" value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  sx={inputSx}
                  placeholder="e.g., Cost of Goods Sold"
                />
              </Field>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }} component="div">
                  <Field label="Quantity" required>
                    <TextField
                      fullWidth size="small" type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      sx={inputSx}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Field>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Field label="Rate (₹)" required>
                    <TextField
                      fullWidth size="small" type="number"
                      inputProps={{ step: '0.01', min: '0' }}
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                      sx={inputSx}
                    />
                  </Field>
                </Grid>
              </Grid>

              {/* Auto calculated amount */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1.25,
                  background: T.successBg, borderRadius: T.radiusSm,
                  border: `0.5px solid ${T.successBdr}`,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: T.success }}>
                  Calculated amount
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>
                  ₹ {calculateLineItemAmount(formData.quantity, formData.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        {/* Dialog footer */}
        <Box
          sx={{
            display: 'flex', justifyContent: 'flex-end', gap: 1,
            px: 2.5, py: 1.75,
            background: T.bgMuted, borderTop: `0.5px solid ${T.border}`,
          }}
        >
          <Box
            onClick={handleClose}
            sx={{
              px: 2.25, py: 0.875, borderRadius: T.radiusSm, cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, color: T.textMuted,
              border: `0.5px solid ${T.border}`, background: T.bg,
              transition: 'all 0.15s',
              '&:hover': { background: T.bgHover, borderColor: T.borderMd },
            }}
          >
            Cancel
          </Box>
          <Box
            onClick={handleSave}
            sx={{
              px: 2.5, py: 0.875, borderRadius: T.radiusSm, cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, color: '#FFF',
              background: T.brand,
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              transition: 'all 0.15s',
              '&:hover': { background: '#1D4ED8', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
              '&:active': { transform: 'none' },
            }}
          >
            {editingIndex !== null ? 'Update item' : 'Add item'}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderLineItems;