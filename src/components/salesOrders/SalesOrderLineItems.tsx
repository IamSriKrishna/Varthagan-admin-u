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
  Fade,
  Divider,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import InventoryIcon from '@mui/icons-material/Inventory';
import { FormikProps } from 'formik';
import { SalesOrder, LineItem } from '@/models/salesOrder.model';
import { itemService } from '@/lib/api/itemService';

interface SalesOrderLineItemsProps {
  formik: FormikProps<SalesOrder>;
}

interface ItemOption {
  id: string;
  name: string;
  sku?: string;
}

interface LineItemFormData extends LineItem {
  variant_details?: Record<string, any>;
}

export default function SalesOrderLineItems({
  formik,
}: SalesOrderLineItemsProps) {
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LineItemFormData>({
    item_id: '',
    description: '',
    quantity: 1,
    rate: 0,
    variant_sku: '',
    variant_details: {},
  });
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemService.getItems(1, 100);
        if (response.items) {
          setItems(response.items);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index];
      setFormData(item);
      setEditIndex(index);
      // Fetch item details if item_id exists
      if (item.item_id) {
        const itemData = items.find((i) => i.id === item.item_id);
        if (itemData) {
          itemService.getItem(item.item_id).then((details) => {
            setSelectedItemDetails(details);
            // If variant details exist, try to find the variant
            if (item.variant_details && Object.keys(item.variant_details).length > 0) {
              const variant = details.item_details?.variants?.find(
                (v: any) => v.sku === item.variant_details?.sku
              );
              setSelectedVariant(variant || null);
            }
          });
        }
      }
    } else {
      setEditIndex(null);
      setFormData({
        item_id: '',
        description: '',
        quantity: 1,
        rate: 0,
        variant_sku: '',
        variant_details: {},
      });
      setSelectedItemDetails(null);
      setSelectedVariant(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditIndex(null);
    setSelectedItemDetails(null);
    setSelectedVariant(null);
  };

  const handleSaveLineItem = () => {
    if (!formData.item_id || !formData.quantity || !formData.rate) {
      alert('Please fill all required fields');
      return;
    }

    const lineItems = [...formik.values.line_items];
    if (editIndex !== null) {
      lineItems[editIndex] = formData;
    } else {
      lineItems.push(formData);
    }

    formik.setFieldValue('line_items', lineItems);
    handleCloseDialog();
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = formik.values.line_items.filter((_, i) => i !== index);
    formik.setFieldValue('line_items', lineItems);
  };

  const handleItemChange = async (value: any) => {
    if (value?.id) {
      setFormData({
        ...formData,
        item_id: value.id,
        description: formData.description || value.name,
      });
      try {
        const itemDetails = await itemService.getItem(value.id);
        setSelectedItemDetails(itemDetails);
        setSelectedVariant(null);
        // If item has single variant, auto-select it
        if (
          itemDetails.item_details?.structure === 'variants' &&
          itemDetails.item_details?.variants?.length === 1
        ) {
          const variant = itemDetails.item_details.variants[0];
          setSelectedVariant(variant);
          setFormData(prev => ({
            ...prev,
            rate: variant.selling_price || 0,
            variant_sku: variant.sku,
            variant_details: variant.attribute_map || {},
          }));
        } else if (itemDetails.sales_info?.selling_price) {
          setFormData(prev => ({
            ...prev,
            rate: itemDetails.sales_info?.selling_price || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    } else {
      setSelectedItemDetails(null);
      setSelectedVariant(null);
    }
  };

  const currentItem = items.find((i) => i.id === formData.item_id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <ShoppingBasketIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Line Items
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, ml: 5 }}>
            Add products to your sales order
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          Add Item
        </Button>
      </Box>

      {/* Error Message */}
      {formik.touched.line_items && formik.errors.line_items && (
        <Fade in>
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              borderLeft: '4px solid #d32f2f',
            }}
          >
            {typeof formik.errors.line_items === 'string' &&
              formik.errors.line_items}
          </Alert>
        </Fade>
      )}

      {/* Table Card */}
      {formik.values.line_items.length > 0 ? (
        <Fade in timeout={300}>
          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 3,
              border: `1px solid ${alpha('#667eea', 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha('#f8f9fa', 1) }}>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Item</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>Amount</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.line_items.map((item, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: alpha('#667eea', 0.04) } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '4px',
                                background: alpha('#667eea', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <InventoryIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.description || item.item_id}
                              </Typography>
                              {item.variant_sku && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                  SKU: {item.variant_sku}
                                  {item.variant_details && Object.keys(item.variant_details).length > 1 && ', '}
                                  {item.variant_details && 
                                    Object.entries(item.variant_details)
                                      .filter(([key]) => key !== 'sku')
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.quantity}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              minWidth: 48,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹ {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                            ₹ {(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(index)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: alpha('#667eea', 0.1),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteLineItem(index)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: alpha('#d32f2f', 0.1),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              <Box sx={{ p: 2.5, backgroundColor: alpha('#f8f9fa', 1), textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal:{' '}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  ₹ {formik.values.line_items
                    .reduce((sum, item) => sum + item.quantity * item.rate, 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Fade in timeout={300}>
          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 3,
              border: `1px solid ${alpha('#667eea', 0.1)}`,
            }}
          >
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <ShoppingBasketIcon
                  sx={{
                    fontSize: 40,
                    color: '#667eea',
                    opacity: 0.6,
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                No items added yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
                Add line items to your sales order to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Add/Edit Line Item Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
            borderBottom: `2px solid ${alpha('#667eea', 0.2)}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {editIndex !== null ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
            </Box>
            {editIndex !== null ? 'Edit Line Item' : 'Add New Line Item'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>
          {loadingItems ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={items}
                getOptionLabel={(option) => `${option.name || ''} (${option.id})`}
                value={items.find(i => i.id === formData.item_id) || null}
                onChange={async (_, value) => {
                  await handleItemChange(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Item *"
                    placeholder="Select an item"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
              {selectedItemDetails?.item_details?.structure === 'variants' && (
                <Select
                  fullWidth
                  value={selectedVariant?.sku || ''}
                  onChange={(e) => {
                    const variant = selectedItemDetails.item_details.variants.find(
                      (v: any) => v.sku === e.target.value
                    );
                    if (variant) {
                      setSelectedVariant(variant);
                      setFormData(prev => ({
                        ...prev,
                        rate: variant.selling_price || 0,
                        variant_sku: variant.sku,
                        variant_details: variant.attribute_map || {},
                      }));
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">Select Variant *</MenuItem>
                  {selectedItemDetails.item_details.variants.map((variant: any, idx: number) => {
                    const attrStr = Object.entries(variant.attribute_map || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ');
                    return (
                      <MenuItem key={idx} value={variant.sku}>
                        {variant.sku} - {attrStr} (₹{variant.selling_price})
                      </MenuItem>
                    );
                  })}
                </Select>
              )}

              <TextField
                label="Description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                fullWidth
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Quantity *"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  label="Rate *"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate: Number(e.target.value),
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <TextField
                label="Amount (Auto-calculated)"
                fullWidth
                disabled
                value={`₹ ${(formData.quantity * formData.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha('#22c55e', 0.05),
                    fontWeight: 700,
                    color: '#22c55e',
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
            borderTop: `1px solid ${alpha('#e0e0e0', 1)}`,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLineItem}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            {editIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
