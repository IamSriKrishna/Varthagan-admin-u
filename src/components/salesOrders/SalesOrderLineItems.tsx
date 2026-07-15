'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { FormikProps } from 'formik';

import { SalesOrder, SalesOrderLineItemInput } from '@/models/salesOrder.model';
import { customerPricingService } from '@/lib/api/customerPricing.service';
import { productGroupService } from '@/services/productGroupService';
import type { Manufacturer as ManufacturerModel } from '@/models/manufacturer.model';
import type { CustomerPricing } from '@/models/customerPricing.model';
import type { ProductGroupDetailsOutput } from '@/models/product-group.model';
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

const API_BASE_URL = process.env.NEXT_PUBLIC_LOGIN_DOMAIN;

const getToken = (): string => {
  if (typeof window === 'undefined') return '';

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';

    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';

    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch {
    return '';
  }
};

interface SalesOrderLineItemsProps {
  formik: FormikProps<SalesOrder>;
  customerId?: number | string;
  isViewMode?: boolean;
}

type UIManufacturer = ManufacturerModel & {
  selling_price?: number;
  cost?: number;
  profit?: number;
};

const EMPTY_ITEM: SalesOrderLineItemInput = {
  manufacturer_id: '',
  manufacturer_name: '',
  quantity: 1,
  rate: 0,
  account: 'SALES',
};

export default function SalesOrderLineItems({
  formik,
  customerId,
  isViewMode,
}: SalesOrderLineItemsProps) {
  const [manufacturers, setManufacturers] = useState<UIManufacturer[]>([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<SalesOrderLineItemInput>(EMPTY_ITEM);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<UIManufacturer | null>(null);

  const [customerPricing, setCustomerPricing] = useState<CustomerPricing | null>(
    null
  );
  const [loadingCustomerPricing, setLoadingCustomerPricing] = useState(false);

  const [pricingSource, setPricingSource] = useState<
    'product' | 'manufacturer' | 'default' | null
  >(null);

  const [productGroupDetails, setProductGroupDetails] =
    useState<ProductGroupDetailsOutput | null>(null);
  const [loadingProductGroup, setLoadingProductGroup] = useState(false);

  const [manufacturerDetails, setManufacturerDetails] = useState<any>(null);
  const [loadingManufacturerDetails, setLoadingManufacturerDetails] =
    useState(false);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoadingManufacturers(true);

        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/manufacturers`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.data?.manufacturers) {
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

      try {
        setLoadingCustomerPricing(true);

        const numericCustomerId = Number(customerId);
        if (Number.isNaN(numericCustomerId)) {
          setCustomerPricing(null);
          return;
        }

        const response = await customerPricingService.getByCustomerId(
          numericCustomerId,
          100,
          0
        );

        const pricingRecords = response.data?.pricings || [];

        setCustomerPricing({
          customer_id: numericCustomerId,
          customer_name: pricingRecords[0]?.customer_name,
          line_items: pricingRecords.map((pricing: any) => ({
            id: pricing.id,
            product_id: pricing.product_id,
            product_name: pricing.product_name,
            manufacturer_id: pricing.manufacturer_id,
            manufacturer_name: pricing.manufacturer_name,
            rate: Number(pricing.rate || 0),
            account: pricing.account,
            description: pricing.description,
            effective_from: pricing.effective_from,
            effective_to: pricing.effective_to,
            is_active: pricing.is_active,
            created_at: pricing.created_at,
            updated_at: pricing.updated_at,
          })),
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

  const fetchManufacturerDetails = async (manufacturerId: string) => {
    try {
      setLoadingManufacturerDetails(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/manufacturers/${manufacturerId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.data) {
        setManufacturerDetails(result.data);

        if (result.data.product_group) {
          setProductGroupDetails(result.data.product_group);
        }
      }
    } catch (error) {
      console.error('Failed to fetch manufacturer details:', error);
      setManufacturerDetails(null);
    } finally {
      setLoadingManufacturerDetails(false);
    }
  };

  const fetchProductGroupDetails = async (productGroupId: string) => {
    if (!productGroupId) return null;

    try {
      setLoadingProductGroup(true);

      const response = await productGroupService.getProductGroup(productGroupId);
      setProductGroupDetails(response.data);

      return response.data;
    } catch (error) {
      console.error('Failed to fetch product group:', error);
      setProductGroupDetails(null);
      return null;
    } finally {
      setLoadingProductGroup(false);
    }
  };

  const getProductSellingPrice = (product: any) => {
    return Number(product?.selling_price || product?.sales_info?.selling_price || 0);
  };

  const isDisplayableProduct = (product: any) => {
    const isResource = product?.is_resource === true || product?.is_resource === 1;
    const isRaw = product?.is_raw === true || product?.is_raw === 1;
    return !isResource && !isRaw;
  };

  const findCustomerProductRate = (productId: string) => {
    return customerPricing?.line_items.find(
      (item) =>
        String(item.product_id) === String(productId) &&
        item.is_active !== false
    )?.rate;
  };

  const calculateProductGroupRate = async (
    manufacturer: UIManufacturer
  ): Promise<number | null> => {
    if (!manufacturer.product_group_id) return null;

    let group =
      productGroupDetails?.id === manufacturer.product_group_id
        ? productGroupDetails
        : null;

    if (!group) {
      group = await fetchProductGroupDetails(manufacturer.product_group_id);
    }

    if (!group?.components?.length) return null;

    const visibleComponents = group.components.filter((component) =>
      isDisplayableProduct(component.product)
    );

    if (!visibleComponents.length) return null;

    let totalRate = 0;

    for (const component of visibleComponents) {
      const customerRate = findCustomerProductRate(component.product_id);
      const componentQty = Number(component.quantity || 1);

      if (customerRate !== undefined && customerRate !== null) {
        totalRate += Number(customerRate) * componentQty;
      } else {
        totalRate += getProductSellingPrice(component.product) * componentQty;
      }
    }

    return totalRate;
  };

  const getBestCustomerRate = async (
    manufacturer: UIManufacturer
  ): Promise<{
    rate: number;
    source: 'product' | 'manufacturer' | 'default';
  }> => {
    const productGroupRate = await calculateProductGroupRate(manufacturer);

    if (productGroupRate !== null) {
      return {
        rate: productGroupRate,
        source: 'product',
      };
    }

    const manufacturerPricing = customerPricing?.line_items.find(
      (item) =>
        String(item.manufacturer_id) === String(manufacturer.id) &&
        item.is_active !== false
    );

    if (manufacturerPricing?.rate !== undefined && manufacturerPricing?.rate !== null) {
      return {
        rate: Number(manufacturerPricing.rate),
        source: 'manufacturer',
      };
    }

    return {
      rate: Number(manufacturer.selling_price || 0),
      source: 'default',
    };
  };

  useEffect(() => {
    if (!selectedManufacturer) return;

    const applyCustomerPrice = async () => {
      try {
        setLoadingCustomerPricing(true);

        const { rate, source } = await getBestCustomerRate(selectedManufacturer);

        setFormData((prev) => ({
          ...prev,
          rate,
        }));

        setPricingSource(source);
      } catch (error) {
        console.error('Failed to apply pricing:', error);
      } finally {
        setLoadingCustomerPricing(false);
      }
    };

    applyCustomerPrice();
  }, [selectedManufacturer, customerPricing, productGroupDetails]);

  const handleManufacturerChange = async (value: UIManufacturer | null) => {
    if (!value?.id) {
      setSelectedManufacturer(null);
      setFormData(EMPTY_ITEM);
      setManufacturerDetails(null);
      setProductGroupDetails(null);
      setPricingSource(null);
      return;
    }

    setSelectedManufacturer(value);

    setFormData((prev) => ({
      ...prev,
      manufacturer_id: value.id,
      manufacturer_name: value.name,
      quantity: Number(value.quantity || 1),
      rate: Number(value.selling_price || 0),
    }));

    setPricingSource(null);
    setManufacturerDetails(null);
    setProductGroupDetails(null);

    await fetchManufacturerDetails(value.id);

    if (value.product_group_id) {
      await fetchProductGroupDetails(value.product_group_id);
    }
  };

  const openDialog = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index];

      setFormData(item as SalesOrderLineItemInput);
      setEditIndex(index);

      const manufacturer = manufacturers.find(
        (m) => String(m.id) === String(item.manufacturer_id)
      );

      if (manufacturer) {
        setSelectedManufacturer(manufacturer);
        fetchManufacturerDetails(manufacturer.id);

        if (manufacturer.product_group_id) {
          fetchProductGroupDetails(manufacturer.product_group_id);
        }
      }
    } else {
      setEditIndex(null);
      setFormData(EMPTY_ITEM);
      setSelectedManufacturer(null);
      setManufacturerDetails(null);
      setProductGroupDetails(null);
      setPricingSource(null);
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditIndex(null);
    setSelectedManufacturer(null);
    setManufacturerDetails(null);
    setProductGroupDetails(null);
    setPricingSource(null);
  };

  const handleSave = () => {
    if (
      !formData.manufacturer_id ||
      !formData.manufacturer_name ||
      !formData.quantity ||
      !formData.rate ||
      !formData.account
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = Number(formData.quantity) * Number(formData.rate);

    const lineItem = {
      ...formData,
      amount,
    } as any;

    const lineItems = [...formik.values.line_items];

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

  const subtotal = formik.values.line_items.reduce(
    (sum, item) => sum + Number((item as any).amount || 0),
    0
  );

  const selectedManufacturerOption =
    manufacturers.find((m) => String(m.id) === String(formData.manufacturer_id)) ||
    null;

  const visibleProductGroupComponents =
    productGroupDetails?.components?.filter((component) =>
      isDisplayableProduct(component.product)
    ) ?? [];

  const bundleRate =
    visibleProductGroupComponents.reduce((sum, component) => {
      const customerRate = findCustomerProductRate(component.product_id);
      const unitRate = customerRate ?? getProductSellingPrice(component.product);
      return sum + Number(unitRate || 0) * Number(component.quantity || 1);
    }, 0) || 0;

  return (
    <Stack spacing={3} sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Card elevation={0} sx={{ border: '1px solid #eeeff5', borderRadius: '16px' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ShoppingCartOutlinedIcon sx={{ color: '#6b7280' }} />

              <Box>
                <Typography sx={{ fontWeight: 700 }}>Line Items</Typography>
                <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                  Customer pricing will auto-fill from selected manufacturer product group
                </Typography>
              </Box>
            </Stack>

            {!isViewMode && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => openDialog()}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#4f63d2',
                  color: '#fff',
                  borderRadius: '10px',
                  '&:hover': { bgcolor: '#3d52c7' },
                }}
              >
                Add Item
              </Button>
            )}
          </Stack>

          {formik.values.line_items.length === 0 ? (
            <Box
              sx={{
                border: '2px dashed #eeeff5',
                borderRadius: '16px',
                py: 7,
                textAlign: 'center',
                bgcolor: '#fafbff',
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 38, color: '#9ca3af', mb: 1 }} />

              <Typography sx={{ fontWeight: 700, color: '#374151' }}>
                No items added yet
              </Typography>

              <Typography sx={{ fontSize: 13, color: '#9ca3af', mb: 3 }}>
                Add manufacturer item to sales order
              </Typography>

              {!isViewMode && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => openDialog()}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#4f63d2',
                    color: '#fff',
                    borderRadius: '10px',
                    '&:hover': { bgcolor: '#3d52c7' },
                  }}
                >
                  Add First Item
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer sx={{ border: '1px solid #eeeff5', borderRadius: '10px' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fc' }}>
                      <TableCell>Manufacturer</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {formik.values.line_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.manufacturer_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ₹{Number(item.rate).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹{Number((item as any).amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {!isViewMode && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton onClick={() => openDialog(index)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton onClick={() => handleDelete(index)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={2}
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: '#f8f9fc',
                  borderRadius: '10px',
                  border: '1px solid #eeeff5',
                }}
              >
                <Typography color="#6b7280">Subtotal</Typography>
                <Typography fontWeight={900}>₹{subtotal.toFixed(2)}</Typography>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #f0f0f5',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography fontWeight={800}>
              {editIndex !== null ? 'Edit Line Item' : 'Add Line Item'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
              Select manufacturer and rate will apply automatically
            </Typography>
          </Box>

          <IconButton onClick={closeDialog}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {loadingManufacturers ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <Box>
                <Typography fontWeight={700} mb={1}>
                  Manufacturer <span style={{ color: '#dc2626' }}>*</span>
                </Typography>

                <Autocomplete
                  size="small"
                  options={manufacturers}
                  value={selectedManufacturerOption}
                  getOptionLabel={(option) => option.name || ''}
                  onChange={(_, value) => handleManufacturerChange(value)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Search manufacturer..." />
                  )}
                />
              </Box>

              {selectedManufacturer && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#ecfdf5',
                    border: '1px solid #6ee7b7',
                    borderRadius: '10px',
                  }}
                >
                  <Typography sx={{ color: '#047857', fontWeight: 700 }}>
                    Applied Rate: ₹{Number(formData.rate || 0).toFixed(2)}
                  </Typography>

                  <Typography sx={{ color: '#047857', fontSize: 13 }}>
                    {loadingCustomerPricing || loadingProductGroup
                      ? 'Checking customer pricing...'
                      : pricingSource === 'product'
                      ? 'Product-level customer pricing applied'
                      : pricingSource === 'manufacturer'
                      ? 'Manufacturer-level customer pricing applied'
                      : 'Default manufacturer selling price'}
                  </Typography>
                </Box>
              )}

              {visibleProductGroupComponents.length ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fc',
                    border: '1px solid #eeeff5',
                    borderRadius: '10px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#9ca3af',
                      mb: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    Product Group Pricing Breakdown
                  </Typography>

                  <Stack spacing={1}>
                    {visibleProductGroupComponents.map((component) => {
                      const customerRate = findCustomerProductRate(component.product_id);
                      const unitRate =
                        customerRate ?? getProductSellingPrice(component.product);
                      const total =
                        Number(unitRate || 0) * Number(component.quantity || 1);

                      return (
                        <Box
                          key={component.id}
                          sx={{
                            p: 1.5,
                            bgcolor: '#ffffff',
                            border: '1px solid #eeeff5',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography fontWeight={800}>
                              {component.product?.name || component.product_id}
                            </Typography>

                            <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                              Qty: {component.quantity} × ₹{Number(unitRate).toFixed(2)}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: customerRate != null ? '#047857' : '#6b7280',
                              }}
                            >
                              {customerRate != null ? 'Customer Price' : 'Default Price'}
                            </Typography>
                          </Box>

                          <Typography fontWeight={900}>₹{total.toFixed(2)}</Typography>
                        </Box>
                      );
                    })}

                    <Box
                      sx={{
                        pt: 1.5,
                        borderTop: '1px solid #eeeff5',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography fontWeight={900}>Bundle Rate</Typography>
                      <Typography fontWeight={900}>₹{bundleRate.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ) : null}

              {selectedManufacturer && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fc',
                    border: '1px solid #eeeff5',
                    borderRadius: '10px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#9ca3af',
                      mb: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Manufacturing Details
                  </Typography>

                  {loadingManufacturerDetails ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="#6b7280">Quantity Available</Typography>
                        <Typography fontWeight={800}>
                          {manufacturerDetails?.quantity ?? '-'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="#6b7280">Status</Typography>
                        <Typography fontWeight={800}>
                          {manufacturerDetails?.status ?? '-'}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Box>
              )}

              <Box>
                <Typography fontWeight={700} mb={1}>
                  Account <span style={{ color: '#dc2626' }}>*</span>
                </Typography>

                <Select
                  size="small"
                  fullWidth
                  value={formData.account}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      account: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="SALES">Sales</MenuItem>
                  <MenuItem value="SALES_REVENUE">Sales Revenue</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="inventory">Inventory</MenuItem>
                </Select>
              </Box>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  fullWidth
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                />

                <TextField
                  label="Rate ₹"
                  type="number"
                  size="small"
                  fullWidth
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rate: Number(e.target.value),
                    }))
                  }
                />
              </Stack>

              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f8f9fc',
                  border: '1px solid #eeeff5',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography color="#6b7280">Line Total</Typography>
                <Typography fontWeight={900}>
                  ₹{(Number(formData.quantity || 0) * Number(formData.rate || 0)).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Box
          sx={{
            p: 3,
            borderTop: '1px solid #f0f0f5',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <Button onClick={closeDialog}>Cancel</Button>

          <Button
            onClick={handleSave}
            disabled={
              !formData.manufacturer_id ||
              !formData.quantity ||
              !formData.rate ||
              !formData.account
            }
            sx={{
              bgcolor: '#4f63d2',
              color: '#fff',
              textTransform: 'none',
              '&:hover': { bgcolor: '#3d52c7' },
              '&:disabled': { bgcolor: '#d1d5db', color: '#fff' },
            }}
          >
            {editIndex !== null ? 'Update Item' : 'Add Item'}
          </Button>
        </Box>
      </Dialog>
    </Stack>
  );
}