'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Bill } from '@/models/bill.model';
import { itemService } from '@/lib/api/itemService';

interface BillLineItemsProps {
  formik: FormikProps<Bill>;
}

const ACCOUNTS = ['Cost of Goods Sold', 'Purchases', 'Inventory', 'Materials', 'Services', 'Other'];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    borderRadius: '8px',
    '& fieldset': { borderColor: '#e0e2ee' },
    '&:hover fieldset': { borderColor: '#9196b0' },
    '&.Mui-focused fieldset': { borderColor: '#4f63d2', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontFamily: "'DM Sans', sans-serif", fontSize: 13, '&.Mui-focused': { color: '#4f63d2' } },
};

export const BillLineItems: React.FC<BillLineItemsProps> = ({ formik }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    item_id: '', variant_sku: '', account: 'Cost of Goods Sold',
    quantity: 1, rate: 0, description: '', variant_details: {} as Record<string, any>,
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const res = await itemService.getItems(1, 1000);
        if (res?.items) setItems(res.items);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleAddItem = () => {
    if (!newItem.item_id || newItem.quantity <= 0 || newItem.rate < 0) {
      alert('Please fill in all required fields correctly');
      return;
    }
    if (selectedItemDetails?.item_details?.structure === 'variants' && !newItem.variant_sku) {
      alert('Please select a variant for this item');
      return;
    }
    const selectedItem = items.find((i: any) => i.id === newItem.item_id);
    formik.setFieldValue('line_items', [
      ...formik.values.line_items,
      {
        item_id: newItem.item_id,
        product_id: selectedItem?.product_id || newItem.item_id,
        product_name: selectedItem?.name || newItem.description,
        sku: newItem.variant_sku,
        variant_sku: newItem.variant_sku || undefined,
        item: selectedItem,
        quantity: newItem.quantity,
        rate: newItem.rate,
        amount: newItem.quantity * newItem.rate,
        account: newItem.account,
        description: newItem.description,
        variant_details: newItem.variant_details,
      },
    ]);
    setNewItem({ item_id: '', variant_sku: '', account: 'Cost of Goods Sold', quantity: 1, rate: 0, description: '', variant_details: {} });
    setSelectedItemDetails(null);
    setSelectedVariant(null);
    setOpenDialog(false);
  };

  const handleRemoveItem = (index: number) => {
    formik.setFieldValue('line_items', formik.values.line_items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...formik.values.line_items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    formik.setFieldValue('line_items', updated);
  };

  const subTotal = formik.values.line_items.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <>
      <Box sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8eaf0',
        boxShadow: '0 2px 12px rgba(79,99,210,0.05)',
        overflow: 'hidden',
        mb: 3,
      }}>
        {/* Header */}
        <Box sx={{
          px: 3, py: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ecedf5',
          background: 'linear-gradient(135deg, #fafbff 0%, #f3f4fc 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(79,99,210,0.25)',
            }}>
              <InventoryIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: '#1a1d2e' }}>
                Line Items
              </Typography>
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9196b0' }}>
                {formik.values.line_items.length} item{formik.values.line_items.length !== 1 ? 's' : ''} added
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 12.5,
              textTransform: 'none',
              borderRadius: '9px',
              px: 2,
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              boxShadow: '0 4px 10px rgba(79,99,210,0.25)',
              '&:hover': { boxShadow: '0 6px 16px rgba(79,99,210,0.35)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s',
            }}
          >
            Add Item
          </Button>
        </Box>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafbff' }}>
              {['Item', 'Account', 'Qty', 'Rate', 'Amount', 'Description', ''].map((h, i) => (
                <TableCell key={i} sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: 11,
                  color: '#9196b0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                  py: '11px',
                  borderColor: '#ecedf5',
                  ...(h === 'Qty' || h === 'Rate' || h === 'Amount' ? { textAlign: 'right' } : {}),
                  ...(h === '' ? { width: 56 } : {}),
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {formik.values.line_items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, borderBottom: 'none' }}>
                  <InventoryIcon sx={{ fontSize: 36, color: '#dde0ee', mb: 1.5, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: '#9196b0', fontSize: 13.5 }}>
                    No items added yet
                  </Typography>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: '#bbbdc9', fontSize: 12, mt: 0.5 }}>
                    Click "Add Item" to get started
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              formik.values.line_items.map((item, index) => (
                <TableRow
                  key={index}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{
                    '&:last-child td': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#fafbff' },
                    transition: 'background 0.12s',
                  }}
                >
                  <TableCell sx={{ borderColor: '#ecedf5', py: '10px', minWidth: 140 }}>
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1d2e' }}>
                      {item.item?.name || item.item_id}
                    </Typography>
                    {item.variant_sku && (
                      <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#9196b0', mt: 0.25 }}>
                        SKU: {item.variant_sku}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ borderColor: '#ecedf5' }}>
                    <Select
                      value={item.account}
                      onChange={(e) => handleUpdateItem(index, 'account', e.target.value)}
                      size="small"
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12.5,
                        minWidth: 150,
                        borderRadius: '7px',
                        '& fieldset': { borderColor: '#e0e2ee' },
                      }}
                    >
                      {ACCOUNTS.map((acc) => (
                        <MenuItem key={acc} value={acc} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5 }}>
                          {acc}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: '#ecedf5' }}>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                      size="small"
                      inputProps={{ min: 1, step: 1, style: { textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 13 } }}
                      sx={{ width: 72, '& fieldset': { borderColor: '#e0e2ee' }, '& .MuiOutlinedInput-root': { borderRadius: '7px' } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: '#ecedf5' }}>
                    <TextField
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(index, 'rate', parseFloat(e.target.value))}
                      size="small"
                      inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 13 } }}
                      sx={{ width: 96, '& fieldset': { borderColor: '#e0e2ee' }, '& .MuiOutlinedInput-root': { borderRadius: '7px' } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: '#ecedf5' }}>
                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13.5, color: '#1a1d2e' }}>
                      ₹{(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#ecedf5', maxWidth: 160 }}>
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9196b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#ecedf5' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                      sx={{
                        opacity: hoveredRow === index ? 1 : 0,
                        transition: 'opacity 0.15s',
                        color: '#e53e3e',
                        bgcolor: '#fff5f5',
                        borderRadius: '7px',
                        '&:hover': { bgcolor: '#fed7d7' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Sub Total */}
        {formik.values.line_items.length > 0 && (
          <Box sx={{
            display: 'flex', justifyContent: 'flex-end',
            px: 3, py: 2,
            borderTop: '1px solid #ecedf5',
            bgcolor: '#fafbff',
          }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 3,
              bgcolor: '#f0f1f9', borderRadius: '10px', px: 2.5, py: 1.25,
              border: '1px solid #e0e2ee',
            }}>
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12.5, color: '#6b70a3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sub Total
              </Typography>
              <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 16, color: '#1a1d2e' }}>
                ₹{subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        )}

        {formik.touched.line_items && formik.errors.line_items && typeof formik.errors.line_items === 'string' && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#ef4444' }}>
              {formik.errors.line_items}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Add Item Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #e8eaf0', boxShadow: '0 20px 60px rgba(79,99,210,0.15)' } }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #4f63d2, #7c3aed)', borderRadius: '16px 16px 0 0' }} />
        <DialogTitle sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>
          Add Line Item
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              size="small"
              options={items}
              getOptionLabel={(o) => o?.name || ''}
              value={items.find((i) => i.id === newItem.item_id) || null}
              onChange={async (_, value) => {
                if (value) {
                  try {
                    const res = await itemService.getItem(value.id);
                    setSelectedItemDetails(res.data || res);
                    setNewItem({ ...newItem, item_id: value.id, variant_sku: '', variant_details: {} });
                    setSelectedVariant(null);
                  } catch (e) { console.error(e); }
                } else {
                  setSelectedItemDetails(null);
                  setNewItem({ ...newItem, item_id: '', variant_sku: '', variant_details: {} });
                  setSelectedVariant(null);
                }
              }}
              renderInput={(params) => <TextField {...params} label="Item *" placeholder="Search items…" sx={fieldSx} />}
            />

            {selectedItemDetails?.item_details?.structure === 'variants' && selectedItemDetails.item_details?.variants?.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Variant *</InputLabel>
                <Select
                  value={newItem.variant_sku}
                  onChange={(e) => {
                    const variant = selectedItemDetails.item_details.variants.find((v: any) => v.sku === e.target.value);
                    if (variant) {
                      setSelectedVariant(variant);
                      setNewItem({ ...newItem, variant_sku: e.target.value, variant_details: { sku: variant.sku, ...variant.attribute_map } });
                    }
                  }}
                  label="Variant *"
                  sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, borderRadius: '8px' }}
                >
                  <MenuItem value="" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}><em>Select variant</em></MenuItem>
                  {selectedItemDetails.item_details.variants.map((v: any) => (
                    <MenuItem key={v.sku} value={v.sku} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                      {v.sku} · {Object.entries(v.attribute_map || {}).map(([k, val]) => `${k}: ${val}`).join(', ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Account</InputLabel>
              <Select
                value={newItem.account}
                onChange={(e) => setNewItem({ ...newItem, account: e.target.value })}
                label="Account"
                sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, borderRadius: '8px' }}
              >
                {ACCOUNTS.map((acc) => <MenuItem key={acc} value={acc} sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{acc}</MenuItem>)}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                size="small" label="Quantity" type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                inputProps={{ min: 1, step: 1 }}
                sx={fieldSx}
              />
              <TextField
                size="small" label="Rate (₹)" type="number"
                value={newItem.rate}
                onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
                sx={fieldSx}
              />
            </Box>

            {newItem.quantity > 0 && newItem.rate > 0 && (
              <Box sx={{ bgcolor: '#f0f1f9', borderRadius: '9px', px: 2, py: 1.25, border: '1px solid #d4d9f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#6b70a3', fontWeight: 600 }}>Amount</Typography>
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15, color: '#4f63d2' }}>
                  ₹{(newItem.quantity * newItem.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}

            <TextField
              size="small" label="Description" multiline rows={2}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              sx={fieldSx}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: "'DM Sans', sans-serif", textTransform: 'none', color: '#6b70a3', borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, textTransform: 'none',
              borderRadius: '8px', px: 2.5,
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              boxShadow: '0 4px 12px rgba(79,99,210,0.3)',
            }}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BillLineItems;