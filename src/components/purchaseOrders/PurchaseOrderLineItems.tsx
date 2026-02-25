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
  Card,
  CardContent,
  Divider,
  Chip,
  Tooltip,
  Alert,
  alpha,
  Fade,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import InventoryIcon from '@mui/icons-material/Inventory';
import { PurchaseOrder, LineItem } from '@/models/purchaseOrder.model';
import { calculateLineItemAmount } from './purchaseOrderForm.utils';
import { itemService } from '@/lib/api/itemService';

interface PurchaseOrderLineItemsProps {
  formik: FormikProps<PurchaseOrder>;
}

interface LineItemFormData extends LineItem {
  variant_details?: Record<string, any>;
}

interface ItemOption {
  id: string;
  name: string;
}

export const PurchaseOrderLineItems: React.FC<PurchaseOrderLineItemsProps> = ({
  formik,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LineItemFormData>({
    item_id: '',
    account: 'Cost of Goods Sold',
    quantity: 1,
    rate: 0,
    variant_details: {},
  });
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const response = await itemService.getItems(1, 100);
        if (response.items) {
          setItems(response.items);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
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
      setEditingIndex(index);
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
      setFormData({
        item_id: '',
        account: 'Cost of Goods Sold',
        quantity: 1,
        rate: 0,
        variant_details: {},
      });
      setEditingIndex(null);
      setSelectedItemDetails(null);
      setSelectedVariant(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setSelectedItemDetails(null);
    setSelectedVariant(null);
  };

  const handleSaveLineItem = () => {
    if (!formData.item_id || formData.quantity <= 0 || formData.rate < 0) {
      alert('Please fill all required fields');
      return;
    }

    const lineItems = [...formik.values.line_items];
    const amount = calculateLineItemAmount(formData.quantity, formData.rate);

    if (editingIndex !== null) {
      lineItems[editingIndex] = {
        ...formData,
        amount,
      };
    } else {
      lineItems.push({
        ...formData,
        amount,
      });
    }

    formik.setFieldValue('line_items', lineItems);
    handleCloseDialog();
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = formik.values.line_items.filter((_, i) => i !== index);
    formik.setFieldValue('line_items', lineItems);
  };

  const selectedItem = items.find((i) => i.id === formData.item_id);
  const totalLineItemsAmount = formik.values.line_items.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

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
            Add products to your purchase order
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
                    <TableRow
                      sx={{
                        background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
                        borderBottom: `2px solid ${alpha('#667eea', 0.2)}`,
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#333', py: 2 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Account</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        Quantity
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>
                        Rate
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>
                        Amount
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.line_items.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#667eea', 0.04),
                          },
                          transition: 'background-color 0.2s ease',
                          borderBottom: `1px solid ${alpha('#e0e0e0', 0.5)}`,
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  backgroundColor: alpha('#667eea', 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#667eea',
                                }}
                              >
                                <InventoryIcon fontSize="small" />
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.item_id}
                                </Typography>
                                {item.variant_details && Object.keys(item.variant_details).length > 0 && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                    {item.variant_details.sku && (
                                      <>
                                        SKU: {item.variant_details.sku}
                                        {Object.entries(item.variant_details)
                                          .filter(([key]) => key !== 'sku')
                                          .length > 0 && ', '}
                                      </>
                                    )}
                                    {Object.entries(item.variant_details)
                                      .filter(([key]) => key !== 'sku')
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.account}
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: alpha('#667eea', 0.1),
                              color: '#667eea',
                              borderRadius: 1.5,
                            }}
                          />
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
                            ₹ {(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha('#f8f9fa', 1)} 0%, ${alpha('#e9ecef', 1)} 100%)`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Subtotal:
                  </Typography>
                  <Chip
                    label={`₹ ${totalLineItemsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      height: 36,
                      px: 2,
                      backgroundColor: alpha('#22c55e', 0.1),
                      color: '#22c55e',
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Fade in timeout={300}>
          <Card
            sx={{
              boxShadow: 1,
              borderRadius: 3,
              border: `2px dashed ${alpha('#667eea', 0.3)}`,
              backgroundColor: alpha('#f8f9fa', 0.5),
            }}
          >
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: alpha('#667eea', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
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
                Add line items to your purchase order to get started
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

      {/* Enhanced Line Item Dialog */}
      <Dialog
        open={openDialog}
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
              {editingIndex !== null ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
            </Box>
            {editingIndex !== null ? 'Edit Line Item' : 'Add New Line Item'}
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
                value={selectedItem || null}
                onChange={async (_, value) => {
                  setFormData({ ...formData, item_id: value?.id || '' });
                  if (value?.id) {
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
                        const attrStr = Object.entries(variant.attribute_map || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ');
                        setFormData(prev => ({
                          ...prev,
                          rate: variant.cost_price || 0,
                          variant_details: {
                            sku: variant.sku,
                            ...variant.attribute_map,
                          },
                        }));
                      } else if (itemDetails.purchase_info?.cost_price) {
                        setFormData(prev => ({
                          ...prev,
                          rate: itemDetails.purchase_info?.cost_price || 0,
                        }));
                      }
                    } catch (error) {
                      console.error('Error fetching item details:', error);
                    }
                  } else {
                    setSelectedItemDetails(null);
                    setSelectedVariant(null);
                  }
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
                      const attrStr = Object.entries(variant.attribute_map || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                      setFormData(prev => ({
                        ...prev,
                        rate: variant.cost_price || 0,
                        variant_details: {
                          sku: variant.sku,
                          ...variant.attribute_map,
                        },
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
                        {variant.sku} - {attrStr} (₹{variant.cost_price})
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
              <TextField
                label="Account *"
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }} component="div">
                  <TextField
                    fullWidth
                    label="Quantity *"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <TextField
                    fullWidth
                    label="Rate *"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Amount (Auto-calculated)"
                fullWidth
                disabled
                value={`₹ ${calculateLineItemAmount(formData.quantity, formData.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: 2,
            }}
          >
            {editingIndex !== null ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderLineItems;