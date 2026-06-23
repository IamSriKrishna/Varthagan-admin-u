'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  Autocomplete,
  Chip,
  alpha,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowRight,
  Save,
  X,
  FlaskConical,
  Package,
  SlidersHorizontal,
  FileText,
  Calculator,
  Zap,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { BBButton } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import { productService, Variant } from '@/lib/api/productService';
import { rawMaterialService } from '@/lib/api/rawMaterialService';
import { IConversionRule, IConversionRuleForm, IRawMaterialBagInput } from '@/models/conversion.model';
import { RawMaterialBag } from '@/models/rawMaterial.model';

const T = {
  primary: '#2563eb',
  primarySoft: '#eff6ff',
  success: '#16a34a',
  successSoft: '#f0fdf4',
  warning: '#d97706',
  warningSoft: '#fffbeb',
  purple: '#7c3aed',
  bg: '#f8fafc',
  surface: '#ffffff',
  mutedSurface: '#f9fafb',
  border: '#e5e7eb',
  borderDark: '#cbd5e1',
  text: '#111827',
  sub: '#6b7280',
  faint: '#9ca3af',
};

const cardSx = {
  border: `1px solid ${T.border}`,
  borderRadius: '16px',
  background: T.surface,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
  overflow: 'hidden',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    background: '#ffffff',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderDark },
    '&.Mui-focused fieldset': {
      borderColor: T.primary,
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.74rem',
  },
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
  bg?: string;
}

function SectionHeader({
  icon,
  title,
  subtitle,
  color = T.primary,
  bg = T.primarySoft,
}: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          bgcolor: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: T.text,
            lineHeight: 1.2,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: T.sub,
              mt: 0.2,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ProductPlaceholder({
  color,
  bg,
  label,
}: {
  color: string;
  bg: string;
  label: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: bg,
        border: `1px dashed ${alpha(color, 0.35)}`,
        borderRadius: '12px',
        px: 1.75,
        py: 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: `0 0 0 4px ${alpha(color, 0.12)}`,
        }}
      />

      <Box>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.72rem',
            color: T.sub,
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Select product to view details
        </Typography>
      </Box>
    </Box>
  );
}

interface ConversionFormProps {
  initialData?: IConversionRule;
  isEdit?: boolean;
}

interface Product {
  id: string;
  name: string;
  is_raw?: boolean;
  is_resource?: boolean;
  product_details?: { variants?: Variant[] };
}

export default function ConversionForm({
  initialData,
  isEdit = false,
}: ConversionFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [bagsLoading, setBagsLoading] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<Product[]>([]);
  const [finishedProductVariants, setFinishedProductVariants] = useState<Variant[]>([]);
  const [availableBags, setAvailableBags] = useState<RawMaterialBag[]>([]);
  const [selectedBags, setSelectedBags] = useState<IRawMaterialBagInput[]>([]);
  const [bagDialogOpen, setBagDialogOpen] = useState(false);
  const [selectedBagForAdd, setSelectedBagForAdd] = useState<RawMaterialBag | null>(null);
  const [finishedQuantityForBag, setFinishedQuantityForBag] = useState<number>(1);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IConversionRuleForm>({
    defaultValues: initialData
      ? {
          raw_product_id: initialData.raw_product_id,
          finished_product_id: initialData.finished_product_id,
          finished_variant_sku: initialData.finished_variant_sku,
          conversion_ratio: initialData.conversion_ratio,
          loss_percentage: initialData.loss_percentage,
          is_active: initialData.is_active,
          notes: initialData.notes,
        }
      : {
          conversion_ratio: 1,
          loss_percentage: 0,
          is_active: true,
        },
  });

  const conversionRatio = watch('conversion_ratio') || 1;
  const lossPercentage = watch('loss_percentage') || 0;
  const finishedProductId = watch('finished_product_id');

  useEffect(() => {
    (async () => {
      try {
        setProductsLoading(true);
        const response = await productService.getProducts(1, 1000);
        const products: Product[] = response.products || [];

        setRawMaterials(products.filter((p) => p.is_raw === true));
        setFinishedProducts(products.filter((p) => p.is_raw === false));
      } catch {
        showToastMessage('Failed to load products', 'error');
      } finally {
        setProductsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!finishedProductId) {
      setFinishedProductVariants([]);
      return;
    }

    const product = finishedProducts.find((p) => p.id === finishedProductId);
    setFinishedProductVariants(product?.product_details?.variants ?? []);
  }, [finishedProductId, finishedProducts]);

  // Load bags when raw product is selected
  useEffect(() => {
    const rawProductId = watch('raw_product_id');
    
    if (!rawProductId) {
      setAvailableBags([]);
      setSelectedBags([]);
      return;
    }

    (async () => {
      try {
        setBagsLoading(true);
        const response = await rawMaterialService.getBagsByProduct(rawProductId);
        setAvailableBags(response.data || []);
      } catch (error) {
        console.error('Failed to load bags:', error);
        showToastMessage('Failed to load bags for selected raw material', 'error');
        setAvailableBags([]);
      } finally {
        setBagsLoading(false);
      }
    })();
  }, [watch('raw_product_id')]);

  const onSubmit = async (data: IConversionRuleForm) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        conversion_ratio: Number(data.conversion_ratio),
        loss_percentage: Number(data.loss_percentage),
      };

      if (isEdit && initialData) {
        await conversionService.updateConversion(initialData.id, submitData);
        showToastMessage('Conversion updated successfully', 'success');
      } else {
        await conversionService.createConversion(submitData);
        showToastMessage('Conversion created successfully', 'success');
      }

      setTimeout(() => router.push('/conversion'), 700);
    } catch {
      showToastMessage('Failed to save conversion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBag = () => {
    if (!selectedBagForAdd) {
      showToastMessage('Please select a bag', 'error');
      return;
    }

    if (finishedQuantityForBag <= 0) {
      showToastMessage('Finished quantity must be greater than 0', 'error');
      return;
    }

    // Check if bag is already added
    if (selectedBags.some((b) => b.bag_id === selectedBagForAdd.id)) {
      showToastMessage('Bag already added', 'error');
      return;
    }

    setSelectedBags([
      ...selectedBags,
      {
        bag_id: selectedBagForAdd.id,
        finished_quantity: finishedQuantityForBag,
      },
    ]);

    setBagDialogOpen(false);
    setSelectedBagForAdd(null);
    setFinishedQuantityForBag(1);
  };

  const handleRemoveBag = (bagId: string) => {
    setSelectedBags(selectedBags.filter((b) => b.bag_id !== bagId));
  };

  const finishedUnits = Math.round(
    (1000 / Number(conversionRatio || 1)) * (1 - Number(lossPercentage || 0) / 100)
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: T.bg,
        p: { xs: 2, md: 3 },
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: T.sub,
              fontWeight: 700,
              mb: 0.45,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Conversion Rules / {isEdit ? 'Edit Rule' : 'New Rule'}
          </Typography>

          <Typography
            sx={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: T.text,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isEdit ? 'Edit Conversion Rule' : 'New Conversion Rule'}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.88rem',
              color: T.sub,
              mt: 0.45,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isEdit
              ? 'Update conversion settings and production parameters.'
              : 'Create a clean raw material to finished goods rule.'}
          </Typography>
        </Box>

        <BBButton
          variant="outlined"
          startIcon={<X size={15} />}
          onClick={() => router.push('/conversion')}
          sx={{
            borderRadius: '10px',
            borderColor: T.border,
            color: T.sub,
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            px: 2,
            '&:hover': {
              borderColor: T.borderDark,
              bgcolor: '#ffffff',
              color: T.text,
            },
          }}
        >
          Discard
        </BBButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 44px 1fr' },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                <SectionHeader
                  icon={<FlaskConical size={17} />}
                  title="Raw Material"
                  subtitle="Input product for production"
                  color={T.warning}
                  bg={T.warningSoft}
                />

                <Controller
                  name="raw_product_id"
                  control={control}
                  rules={{ required: 'Raw product is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      options={rawMaterials}
                      getOptionLabel={(option) => option.name}
                      value={rawMaterials.find((p) => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      loading={productsLoading}
                      disabled={productsLoading}
                      fullWidth
                      size="small"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      sx={{ mb: 1.5 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Raw Material"
                          placeholder="Search raw material"
                          error={!!errors.raw_product_id}
                          helperText={errors.raw_product_id?.message}
                          sx={inputSx}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {productsLoading && (
                                  <CircularProgress size={16} sx={{ color: T.warning }} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />

                <ProductPlaceholder
                  color={T.warning}
                  bg={T.warningSoft}
                  label="Raw Material Details"
                />
              </CardContent>
            </Card>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 0.25, md: 0 },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  bgcolor: T.primary,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: { xs: 'rotate(90deg)', md: 'none' },
                  boxShadow: '0 8px 18px rgba(37,99,235,0.22)',
                }}
              >
                <ArrowRight size={18} />
              </Box>
            </Box>

            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                <SectionHeader
                  icon={<Package size={17} />}
                  title="Finished Product"
                  subtitle="Output product from production"
                  color={T.success}
                  bg={T.successSoft}
                />

                <Controller
                  name="finished_product_id"
                  control={control}
                  rules={{ required: 'Finished product is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      options={finishedProducts}
                      getOptionLabel={(option) => option.name}
                      value={finishedProducts.find((p) => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      loading={productsLoading}
                      disabled={productsLoading}
                      fullWidth
                      size="small"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      sx={{ mb: finishedProductVariants.length > 0 ? 1.5 : 0 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Finished Product"
                          placeholder="Search finished product"
                          error={!!errors.finished_product_id}
                          helperText={errors.finished_product_id?.message}
                          sx={inputSx}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {productsLoading && (
                                  <CircularProgress size={16} sx={{ color: T.success }} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />

                {finishedProductVariants.length > 0 ? (
                  <Controller
                    name="finished_variant_sku"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={finishedProductVariants}
                        getOptionLabel={(option) => `${option.variant_name} (${option.sku})`}
                        value={finishedProductVariants.find((v) => v.sku === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.sku || '')}
                        fullWidth
                        size="small"
                        isOptionEqualToValue={(option, value) => option.sku === value.sku}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Variant Optional"
                            placeholder="Select variant"
                            sx={inputSx}
                          />
                        )}
                      />
                    )}
                  />
                ) : (
                  <Box sx={{ mt: 1.5 }}>
                    <ProductPlaceholder
                      color={T.success}
                      bg={T.successSoft}
                      label="Finished Product Details"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Bag Selection Card */}
          {watch('raw_product_id') && availableBags.length > 0 && (
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <SectionHeader
                    icon={<Package size={17} />}
                    title="Raw Material Bags"
                    subtitle="Select bags to use in production"
                  />
                  <BBButton
                    variant="contained"
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={() => setBagDialogOpen(true)}
                    sx={{
                      bgcolor: T.primary,
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      px: 1.75,
                    }}
                  >
                    Add Bag
                  </BBButton>
                </Box>

                {selectedBags.length === 0 ? (
                  <Box
                    sx={{
                      bgcolor: alpha(T.primary, 0.05),
                      border: `1px dashed ${T.primary}`,
                      borderRadius: '12px',
                      px: 2,
                      py: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', color: T.sub, fontWeight: 500 }}>
                      No bags selected yet. Click "Add Bag" to select raw material bags for this conversion.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 500 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(T.primary, 0.08) }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: T.text }}>
                            Bag Number
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: T.text }}>
                            Bag ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: T.text }}>
                            Finished Quantity
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: T.text }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedBags.map((bag) => {
                          const bagDetail = availableBags.find((b) => b.id === bag.bag_id);
                          return (
                            <TableRow key={bag.bag_id} sx={{ '&:hover': { bgcolor: alpha(T.primary, 0.03) } }}>
                              <TableCell sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>
                                {bagDetail?.bag_number || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: T.sub }}>
                                {bag.bag_id.substring(0, 20)}...
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 500 }}>
                                {bag.finished_quantity}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveBag(bag.bag_id)}
                                  sx={{
                                    color: '#dc2626',
                                    '&:hover': { bgcolor: alpha('#dc2626', 0.1) },
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Add Bag Dialog */}
          <Dialog open={bagDialogOpen} onClose={() => setBagDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: T.text }}>
              Select Raw Material Bag
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  options={availableBags.filter((b) => !selectedBags.some((sb) => sb.bag_id === b.id))}
                  getOptionLabel={(option) => `Bag #${option.bag_number} (${option.id.substring(0, 15)}...)`}
                  value={selectedBagForAdd}
                  onChange={(_, newValue) => setSelectedBagForAdd(newValue)}
                  loading={bagsLoading}
                  fullWidth
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Bag"
                      placeholder="Search bags..."
                      sx={inputSx}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {bagsLoading && <CircularProgress size={16} sx={{ color: T.primary }} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                <TextField
                  label="Finished Quantity"
                  placeholder="e.g. 1"
                  type="number"
                  value={finishedQuantityForBag}
                  onChange={(e) => setFinishedQuantityForBag(Number(e.target.value))}
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                  sx={inputSx}
                />

                {selectedBagForAdd && (
                  <Box sx={{ bgcolor: T.primarySoft, borderRadius: '8px', p: 1.5, border: `1px solid ${T.primary}` }}>
                    <Typography sx={{ fontSize: '0.75rem', color: T.sub, fontWeight: 600, mb: 0.5 }}>
                      Selected Bag Details
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>
                      Bag Number: {selectedBagForAdd.bag_number}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: T.sub }}>
                      Available Quantity: {selectedBagForAdd.remaining_kg ?? 'N/A'} kg
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <BBButton
                variant="outlined"
                onClick={() => setBagDialogOpen(false)}
                sx={{
                  borderColor: T.border,
                  color: T.sub,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                Cancel
              </BBButton>
              <BBButton
                variant="contained"
                onClick={handleAddBag}
                sx={{
                  bgcolor: T.primary,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                Add Bag
              </BBButton>
            </DialogActions>
          </Dialog>

          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
              <SectionHeader
                icon={<SlidersHorizontal size={17} />}
                title="Conversion Parameters"
                subtitle="Define ratio and material loss"
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Controller
                  name="conversion_ratio"
                  control={control}
                  rules={{
                    required: 'Conversion ratio is required',
                    min: { value: 0.1, message: 'Must be at least 0.1' },
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(Number(e.target.value))}
                      fullWidth
                      label="Conversion Ratio"
                      placeholder="e.g. 1"
                      type="number"
                      inputProps={{ step: '0.1', min: '0.1' }}
                      error={!!errors.conversion_ratio}
                      helperText={
                        errors.conversion_ratio?.message ||
                        'Raw units required for 1 finished unit'
                      }
                      size="small"
                      sx={inputSx}
                    />
                  )}
                />

                <Controller
                  name="loss_percentage"
                  control={control}
                  rules={{
                    required: 'Loss percentage is required',
                    min: { value: 0, message: 'Cannot be negative' },
                    max: { value: 100, message: 'Cannot exceed 100%' },
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value ?? ''}
                      onChange={(e) => onChange(Number(e.target.value))}
                      fullWidth
                      label="Loss Percentage"
                      placeholder="e.g. 5"
                      type="number"
                      inputProps={{ step: '0.1', min: '0', max: '100' }}
                      error={!!errors.loss_percentage}
                      helperText={
                        errors.loss_percentage?.message || 'Waste during conversion'
                      }
                      size="small"
                      sx={inputSx}
                    />
                  )}
                />
              </Box>

              <Box
                sx={{
                  bgcolor: T.primarySoft,
                  border: `1px solid ${alpha(T.primary, 0.16)}`,
                  borderRadius: '14px',
                  p: 1.75,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'auto 1fr auto 1fr auto',
                  },
                  gap: 1.25,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '9px',
                      bgcolor: T.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calculator size={14} />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: T.text,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Example
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    px: 2,
                    py: 1.1,
                    border: `1px solid ${alpha(T.warning, 0.22)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: T.warning,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    1,000
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: T.sub, fontWeight: 600 }}>
                    raw units in
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.65,
                    borderRadius: '999px',
                    bgcolor: '#ffffff',
                    color: T.primary,
                    border: `1px solid ${alpha(T.primary, 0.16)}`,
                  }}
                >
                  <Zap size={12} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    ÷{conversionRatio} · -{lossPercentage}%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    px: 2,
                    py: 1.1,
                    border: `1px solid ${alpha(T.success, 0.22)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: T.success,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {finishedUnits.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: T.sub, fontWeight: 600 }}>
                    finished units out
                  </Typography>
                </Box>

                <Chip
                  label={`${(100 - Number(lossPercentage || 0)).toFixed(1)}% efficiency`}
                  size="small"
                  sx={{
                    bgcolor:
                      lossPercentage <= 5
                        ? T.successSoft
                        : lossPercentage <= 15
                          ? '#fef3c7'
                          : '#fee2e2',
                    color:
                      lossPercentage <= 5
                        ? T.success
                        : lossPercentage <= 15
                          ? T.warning
                          : '#dc2626',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    borderRadius: '8px',
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
              <SectionHeader
                icon={<FileText size={17} />}
                title="Additional Information"
                subtitle="Notes and rule status"
                color={T.purple}
                bg="#f5f3ff"
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 220px' },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      placeholder="Add notes or special production instructions"
                      multiline
                      rows={3}
                      size="small"
                      sx={inputSx}
                    />
                  )}
                />

                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        border: `1px solid ${
                          field.value ? alpha(T.success, 0.3) : T.border
                        }`,
                        borderRadius: '14px',
                        px: 1.5,
                        py: 1.25,
                        bgcolor: field.value ? T.successSoft : T.mutedSurface,
                      }}
                    >
                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: T.success,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: T.success,
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: field.value ? T.success : T.sub,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {field.value ? 'Active' : 'Inactive'}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                color: T.sub,
                                fontWeight: 500,
                              }}
                            >
                              {field.value ? 'Enabled for use' : 'Disabled rule'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Box
            sx={{
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: '16px',
              p: 1.75,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.25,
              flexWrap: 'wrap',
              boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.8rem',
                color: T.sub,
                fontWeight: 600,
                mr: 'auto',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isEdit
                ? 'Changes will be saved immediately.'
                : 'This rule will be available for production orders.'}
            </Typography>

            <BBButton
              variant="outlined"
              onClick={() => router.push('/conversion')}
              sx={{
                borderColor: T.border,
                color: T.sub,
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 2.25,
                '&:hover': {
                  borderColor: T.borderDark,
                  bgcolor: '#ffffff',
                },
              }}
            >
              Cancel
            </BBButton>

            <BBButton
              variant="contained"
              type="submit"
              loading={loading}
              startIcon={<Save size={15} />}
              sx={{
                bgcolor: T.primary,
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 2.5,
                boxShadow: '0 8px 18px rgba(37,99,235,0.22)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 10px 22px rgba(37,99,235,0.28)',
                },
              }}
            >
              {isEdit ? 'Update Rule' : 'Create Rule'}
            </BBButton>
          </Box>
        </Box>
      </form>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </Box>
  );
}