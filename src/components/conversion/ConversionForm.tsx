'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  Autocomplete,
  Chip,
  alpha,
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
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { BBButton } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import { productService, Variant } from '@/lib/api/productService';
import { IConversionRule, IConversionRuleForm } from '@/models/conversion.model';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  primary: '#4f63d2',
  primaryLight: '#eef0fb',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  accentLight: '#ecfeff',
  success: '#10b981',
  successLight: '#d1fae5',
  bg: '#f8f9fc',
  surface: '#ffffff',
  border: '#e8eaf2',
  borderHover: '#c7cbe8',
  text: '#1a1d2e',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  rawColor: '#f59e0b',
  rawLight: '#fffbeb',
  finishedColor: '#10b981',
  finishedLight: '#d1fae5',
} as const;

const sectionCard = {
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  background: T.surface,
  boxShadow: '0 1px 3px rgba(79,99,210,0.06), 0 4px 16px rgba(79,99,210,0.04)',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(79,99,210,0.1), 0 8px 24px rgba(79,99,210,0.06)',
    borderColor: T.borderHover,
  },
} as const;

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    background: '#fafbff',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.primary },
    '&.Mui-focused fieldset': {
      borderColor: T.primary,
      borderWidth: '1.5px',
      boxShadow: `0 0 0 3px ${alpha(T.primary, 0.08)}`,
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    '&.Mui-focused': { color: T.primary },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.75rem',
  },
} as const;

/* ─── Section header helper ──────────────────────────────────────────────── */
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  accentBg?: string;
}

function SectionHeader({ icon, title, subtitle, accentColor = T.primary, accentBg = T.primaryLight }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${accentBg}, ${alpha(accentColor, 0.15)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: T.text,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: T.textMuted,
              fontFamily: "'DM Sans', sans-serif",
              mt: 0.25,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── Empty state placeholder ────────────────────────────────────────────── */
function ProductPlaceholder({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${bg}, ${alpha(color, 0.06)})`,
        border: `1.5px dashed ${alpha(color, 0.3)}`,
        borderRadius: '10px',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
          boxShadow: `0 0 6px ${alpha(color, 0.4)}`,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.5, transform: 'scale(0.85)' },
          },
        }}
      />
      <Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color, fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
          Select a product above to see details
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
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

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ConversionForm({ initialData, isEdit = false }: ConversionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<Product[]>([]);
  const [finishedProductVariants, setFinishedProductVariants] = useState<Variant[]>([]);

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
      : { conversion_ratio: 1.0, loss_percentage: 0, is_active: true },
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
    if (finishedProductId) {
      const product = finishedProducts.find((p) => p.id === finishedProductId);
      setFinishedProductVariants(product?.product_details?.variants ?? []);
    } else {
      setFinishedProductVariants([]);
    }
  }, [finishedProductId, finishedProducts]);

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
      setTimeout(() => router.push('/conversion'), 800);
    } catch {
      showToastMessage('Failed to save conversion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const finishedUnits = Math.round((1000 / conversionRatio) * (1 - lossPercentage / 100));

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: T.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Typography
              onClick={() => router.push('/conversion')}
              sx={{
                fontSize: '0.8125rem',
                color: T.textMuted,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                '&:hover': { color: T.primary },
                transition: 'color 0.15s',
              }}
            >
              Conversion Rules
            </Typography>
            <ChevronRight size={13} color={T.textMuted} />
            <Typography sx={{ fontSize: '0.8125rem', color: T.primary, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              {isEdit ? 'Edit Rule' : 'New Rule'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(T.primary, 0.3)}`,
              }}
            >
              <FlaskConical size={20} color="#fff" />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {isEdit ? 'Edit Conversion Rule' : 'New Conversion Rule'}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: T.textSecondary, fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                {isEdit ? 'Update production parameters and ratios' : 'Define how raw materials convert to finished goods'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <BBButton
          variant="outlined"
          startIcon={<X size={16} />}
          onClick={() => router.push('/conversion')}
          sx={{
            borderColor: T.border,
            color: T.textSecondary,
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            px: 2.5,
            '&:hover': { borderColor: T.borderHover, background: T.bg, color: T.text },
          }}
        >
          Discard
        </BBButton>
      </Box>

      {/* ── Form body ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* ── Products row ───────────────────────────────────────────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' }, gap: 2, alignItems: 'stretch' }}>

            {/* Raw Material card */}
            <Card sx={{ ...sectionCard, borderTop: `3px solid ${T.rawColor}` }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <SectionHeader
                  icon={<FlaskConical size={17} />}
                  title="Raw Material"
                  subtitle="Input product for production"
                  accentColor={T.rawColor}
                  accentBg={T.rawLight}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Raw Material"
                          placeholder="Search products…"
                          error={!!errors.raw_product_id}
                          helperText={errors.raw_product_id?.message}
                          sx={inputSx}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {productsLoading ? <CircularProgress size={16} sx={{ color: T.rawColor }} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <ProductPlaceholder color={T.rawColor} bg={T.rawLight} label="Raw Material Details" />
              </CardContent>
            </Card>

            {/* Arrow connector */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 0, md: 0.5 },
                py: { xs: 0.5, md: 0 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(T.primary, 0.35)}`,
                  flexShrink: 0,
                  transform: { xs: 'rotate(90deg)', md: 'none' },
                }}
              >
                <ArrowRight size={18} color="#fff" />
              </Box>
            </Box>

            {/* Finished Product card */}
            <Card sx={{ ...sectionCard, borderTop: `3px solid ${T.finishedColor}` }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <SectionHeader
                  icon={<Package size={17} />}
                  title="Finished Product"
                  subtitle="Output product from production"
                  accentColor={T.finishedColor}
                  accentBg={T.finishedLight}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Finished Product"
                          placeholder="Search products…"
                          error={!!errors.finished_product_id}
                          helperText={errors.finished_product_id?.message}
                          sx={inputSx}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {productsLoading ? <CircularProgress size={16} sx={{ color: T.finishedColor }} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      sx={{ mb: finishedProductVariants.length > 0 ? 2 : 0 }}
                    />
                  )}
                />

                {finishedProductVariants.length > 0 && (
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Variant (Optional)"
                            placeholder="Select variant…"
                            sx={inputSx}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.sku === value.sku}
                        sx={{ mb: 2 }}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif" }}>
                            <Box>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                                {option.variant_name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>
                                SKU: {option.sku}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    )}
                  />
                )}

                {finishedProductVariants.length === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <ProductPlaceholder color={T.finishedColor} bg={T.finishedLight} label="Finished Product Details" />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* ── Conversion Parameters ───────────────────────────────────── */}
          <Card sx={{ ...sectionCard, borderTop: `3px solid ${T.primary}` }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <SectionHeader
                icon={<SlidersHorizontal size={17} />}
                title="Conversion Parameters"
                subtitle="Define ratio and waste for this production rule"
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
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
                      placeholder="e.g., 1.0"
                      type="number"
                      inputProps={{ step: '0.1', min: '0.1' }}
                      error={!!errors.conversion_ratio}
                      helperText={errors.conversion_ratio?.message || 'Raw units needed to produce 1 finished unit'}
                      variant="outlined"
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
                      value={value || ''}
                      onChange={(e) => onChange(Number(e.target.value))}
                      fullWidth
                      label="Loss Percentage"
                      placeholder="e.g., 5"
                      type="number"
                      inputProps={{ step: '0.1', min: '0', max: '100' }}
                      error={!!errors.loss_percentage}
                      helperText={errors.loss_percentage?.message || 'Material waste during conversion'}
                      variant="outlined"
                      size="small"
                      sx={inputSx}
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ fontSize: '0.875rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                            %
                          </Typography>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* Live calculation card */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${T.primaryLight}, ${alpha(T.secondary, 0.06)})`,
                  border: `1.5px solid ${alpha(T.primary, 0.2)}`,
                  borderRadius: '12px',
                  p: 2.5,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr auto 1fr auto' },
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calculator size={14} color="#fff" />
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
                    Example
                  </Typography>
                </Box>

                {/* Step 1 */}
                <Box
                  sx={{
                    background: T.surface,
                    borderRadius: '10px',
                    px: 2,
                    py: 1.25,
                    textAlign: 'center',
                    border: `1px solid ${alpha(T.rawColor, 0.25)}`,
                  }}
                >
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: T.rawColor, fontFamily: "'DM Mono', monospace" }}>
                    1,000
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                    raw units in
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      background: alpha(T.primary, 0.1),
                    }}
                  >
                    <Zap size={11} color={T.primary} />
                    <Typography sx={{ fontSize: '0.6875rem', color: T.primary, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                      ÷{conversionRatio} · -{lossPercentage}% loss
                    </Typography>
                  </Box>
                </Box>

                {/* Result */}
                <Box
                  sx={{
                    background: T.surface,
                    borderRadius: '10px',
                    px: 2,
                    py: 1.25,
                    textAlign: 'center',
                    border: `1px solid ${alpha(T.finishedColor, 0.25)}`,
                  }}
                >
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: T.finishedColor, fontFamily: "'DM Mono', monospace" }}>
                    {finishedUnits.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                    finished units out
                  </Typography>
                </Box>

                {/* Efficiency chip */}
                <Chip
                  label={`${(100 - lossPercentage).toFixed(1)}% efficiency`}
                  size="small"
                  sx={{
                    background: lossPercentage <= 5 ? T.successLight : lossPercentage <= 15 ? '#fef3c7' : '#fee2e2',
                    color: lossPercentage <= 5 ? T.success : lossPercentage <= 15 ? '#d97706' : '#dc2626',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    height: 26,
                    '& .MuiChip-label': { px: 1.25 },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* ── Additional Information ──────────────────────────────────── */}
          <Card sx={{ ...sectionCard }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <SectionHeader
                icon={<FileText size={17} />}
                title="Additional Information"
                subtitle="Notes and activation status"
                accentColor={T.accent}
                accentBg={T.accentLight}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2.5, alignItems: 'start' }}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      placeholder="Add notes about this conversion rule, special instructions, or quality parameters…"
                      multiline
                      rows={3}
                      variant="outlined"
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
                        border: `1px solid ${field.value ? alpha(T.success, 0.3) : T.border}`,
                        borderRadius: '12px',
                        px: 2,
                        py: 1.5,
                        background: field.value ? alpha(T.success, 0.04) : T.bg,
                        transition: 'all 0.2s ease',
                        minWidth: 200,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: T.success },
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
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: field.value ? T.success : T.textSecondary,
                                fontFamily: "'DM Sans', sans-serif",
                                transition: 'color 0.2s',
                              }}
                            >
                              {field.value ? 'Active' : 'Inactive'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                              {field.value ? 'Rule is enabled for use' : 'Rule is disabled'}
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

          {/* ── Action bar ─────────────────────────────────────────────── */}
          <Box
            sx={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: '14px',
              p: 2.5,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.5,
              boxShadow: '0 1px 3px rgba(79,99,210,0.06)',
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', color: T.textMuted, fontFamily: "'DM Sans', sans-serif", mr: 'auto' }}>
              {isEdit ? 'Changes will be saved immediately' : 'This rule will be available for production orders'}
            </Typography>

            <BBButton
              variant="outlined"
              onClick={() => router.push('/conversion')}
              sx={{
                borderColor: T.border,
                color: T.textSecondary,
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 2.5,
                '&:hover': { borderColor: T.borderHover, background: T.bg },
              }}
            >
              Cancel
            </BBButton>

            <BBButton
              variant="contained"
              type="submit"
              loading={loading}
              startIcon={<Save size={16} />}
              sx={{
                background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 3,
                boxShadow: `0 4px 12px ${alpha(T.primary, 0.35)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, #3d50c0, #6d28d9)`,
                  boxShadow: `0 6px 16px ${alpha(T.primary, 0.45)}`,
                },
                '&:disabled': { background: '#e5e7eb', color: '#9ca3af', boxShadow: 'none' },
              }}
            >
              {isEdit ? 'Update Rule' : 'Create Rule'}
            </BBButton>
          </Box>

        </Box>
      </form>
    </Box>
  );
}