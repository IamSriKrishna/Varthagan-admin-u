'use client';

import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Bill } from '@/models/bill.model';
import { itemService } from '@/lib/api/itemService';

interface BillLineItemsProps {
  formik: FormikProps<Bill>;
}

export const BillLineItems: React.FC<BillLineItemsProps> = ({ formik }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    item_id: '',
    variant_sku: '',
    account: 'Cost of Goods Sold',
    quantity: 1,
    rate: 0,
    description: '',
    variant_details: {},
  });
  const [accounts] = useState([
    'Cost of Goods Sold',
    'Purchases',
    'Inventory',
    'Materials',
    'Services',
    'Other',
  ]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const response = await itemService.getItems(1, 1000);
        if (response && response.items) {
          setItems(response.items);
        }
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

    // If item has variants, variant_sku must be selected
    if (
      selectedItemDetails?.item_details?.structure === 'variants' &&
      !newItem.variant_sku
    ) {
      alert('Please select a variant for this item');
      return;
    }

    const selectedItem = items.find((i: any) => i.id === newItem.item_id);
    const amount = newItem.quantity * newItem.rate;

    const lineItem = {
      item_id: newItem.item_id,
      variant_sku: newItem.variant_sku || undefined,
      item: selectedItem,
      quantity: newItem.quantity,
      rate: newItem.rate,
      amount,
      account: newItem.account,
      description: newItem.description,
      variant_details: newItem.variant_details,
    };

    formik.setFieldValue('line_items', [...formik.values.line_items, lineItem]);
    setNewItem({
      item_id: '',
      variant_sku: '',
      account: 'Cost of Goods Sold',
      quantity: 1,
      rate: 0,
      description: '',
      variant_details: {},
    });
    setSelectedItemDetails(null);
    setSelectedVariant(null);
    setOpenDialog(false);
  };

  const handleRemoveItem = (index: number) => {
    formik.setFieldValue(
      'line_items',
      formik.values.line_items.filter((_, i) => i !== index)
    );
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formik.values.line_items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].rate;
    }

    formik.setFieldValue('line_items', updatedItems);
  };

  const subTotal =
    formik.values.line_items.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  return (
    <Card sx={{ boxShadow: 1, borderRadius: 2, mt: 3 }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Item Table
          </Typography>
        }
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add New Row
          </Button>
        }
        sx={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #e0e0e0',
        }}
      />
      <CardContent sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formik.values.line_items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">No items added</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                formik.values.line_items.map((item, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {item.item?.name || item.item_id}
                        </Typography>
                        {item.variant_sku && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            SKU: {item.variant_sku}
                            {item.variant_details &&
                              Object.entries(item.variant_details)
                                .filter(([k]) => k !== 'sku')
                                .length > 0 && (
                                <>
                                  {', '}
                                  {Object.entries(item.variant_details)
                                    .filter(([k]) => k !== 'sku')
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(', ')}
                                </>
                              )}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.account}
                        onChange={(e) =>
                          handleUpdateItem(index, 'account', e.target.value)
                        }
                        size="small"
                        sx={{ minWidth: 150 }}
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc} value={acc}>
                            {acc}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(index, 'quantity', parseFloat(e.target.value))
                        }
                        size="small"
                        sx={{ width: 80 }}
                        inputProps={{ min: 1, step: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <TextField
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleUpdateItem(index, 'rate', parseFloat(e.target.value))
                        }
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹ {(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {item.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Sub Total */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pr: 2 }}>
          <Box sx={{ width: 300 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 1,
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Sub Total</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                ₹ {subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={items}
              getOptionLabel={(option) => option?.name || ''}
              value={items.find((i) => i.id === newItem.item_id) || null}
              onChange={async (_, value) => {
                if (value) {
                  try {
                    const response = await itemService.getItem(value.id);
                    const fullItemDetails = response.data || response;
                    setSelectedItemDetails(fullItemDetails);
                    setNewItem({ ...newItem, item_id: value.id, variant_sku: '', variant_details: {} });
                    setSelectedVariant(null);
                  } catch (error) {
                    console.error('Error fetching item details:', error);
                  }
                } else {
                  setSelectedItemDetails(null);
                  setNewItem({ ...newItem, item_id: '', variant_sku: '', variant_details: {} });
                  setSelectedVariant(null);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Item *" placeholder="Search items" />
              )}
              fullWidth
            />

            {/* Variant Selector */}
            {selectedItemDetails &&
              selectedItemDetails.item_details?.structure === 'variants' &&
              selectedItemDetails.item_details?.variants &&
              selectedItemDetails.item_details.variants.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel>Select Variant *</InputLabel>
                  <Select
                    value={newItem.variant_sku}
                    onChange={(e) => {
                      const variant = selectedItemDetails.item_details.variants.find(
                        (v: any) => v.sku === e.target.value
                      );
                      if (variant) {
                        setSelectedVariant(variant);
                        setNewItem({
                          ...newItem,
                          variant_sku: e.target.value,
                          variant_details: {
                            sku: variant.sku,
                            ...variant.attribute_map,
                          },
                        });
                      }
                    }}
                    label="Select Variant *"
                  >
                    <MenuItem value="">
                      <em>Select variant</em>
                    </MenuItem>
                    {selectedItemDetails.item_details.variants.map((variant: any) => {
                      const attrStr = Object.entries(variant.attribute_map || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                      return (
                        <MenuItem key={variant.sku} value={variant.sku}>
                          {variant.sku} - {attrStr}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={newItem.account}
                onChange={(e) => setNewItem({ ...newItem, account: e.target.value })}
                label="Account"
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc} value={acc}>
                    {acc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })
              }
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />

            <TextField
              label="Rate"
              type="number"
              value={newItem.rate}
              onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) })}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />

            <TextField
              label="Description"
              multiline
              rows={2}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {formik.touched.line_items && formik.errors.line_items && (
        <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', p: 2 }}>
          {String(formik.errors.line_items)}
        </Typography>
      )}
    </Card>
  );
};

export default BillLineItems;
