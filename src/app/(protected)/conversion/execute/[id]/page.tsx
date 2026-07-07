

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Box,
  Alert,
  Divider,
  Autocomplete,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PlayCircle,
  Package,
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Scale,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { BBButton, BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import { rawMaterialService } from '@/lib/api/rawMaterialService';
import { productService, Product } from '@/lib/api/productService';
import {
  IConversionExecutionRequest,
  IConversionExecutionResponse,
  IConversionRule,
} from '@/models/conversion.model';
import { RawMaterialBag } from '@/models/rawMaterial.model';
import dayjs from 'dayjs';

const pageSx = {
  minHeight: '100vh',
  width: '100%',
  bgcolor: '#f8f9fc',
  py: 2,
};

const containerSx = {
  width: '100%',
  px: { xs: 2, sm: 2.5, md: 3 },
};

const cardSx = {
  borderRadius: '16px',
  border: '1px solid #eeeff5',
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#ffffff',
  },
};

const formatGram = (grams: number) => {
  if (!grams || grams <= 0) return '0 g';
  if (grams >= 1000) return `${(grams / 1000).toFixed(3)} kg`;
  return `${grams.toFixed(2)} g`;
};

function SummaryCard({
  icon,
  label,
  value,
  color = '#2563eb',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: `${color}12`,
              color,
              borderRadius: '12px',
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 20, color: '#1a1d2e', fontWeight: 850 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ExecuteConversionPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IConversionExecutionResponse | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [conversionRule, setConversionRule] = useState<IConversionRule | null>(null);
  const [rawProduct, setRawProduct] = useState<Product | null>(null);
  const [bags, setBags] = useState<RawMaterialBag[]>([]);
  const [selectedBags, setSelectedBags] = useState<RawMaterialBag[]>([]);
  const [bagsLoading, setBagsLoading] = useState(false);
  const [finishedQuantities, setFinishedQuantities] = useState<Record<string, number>>({});

  const id = params?.id as string;

  const { handleSubmit } = useForm<IConversionExecutionRequest>({
    defaultValues: {
      conversion_id: id,
      conversion_date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      execute_conversion: true,
    },
  });

  const gramsPerFinishedProduct =
    Number(rawProduct?.required_gram_per_unit || 0) ||
    Number(conversionRule?.conversion_ratio || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const rule = await conversionService.getConversion(id);
        setConversionRule(rule);

        if (rule.raw_product_id) {
          const [product] = await Promise.all([
            productService.getProduct(rule.raw_product_id),
            fetchBags(rule.raw_product_id),
          ]);

          setRawProduct(product);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToastMessage('Failed to load conversion details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const fetchBags = async (productId: string) => {
    try {
      setBagsLoading(true);
      const response = await rawMaterialService.getBagsByProduct(productId);

      if (response.success && response.data) {
        setBags(response.data.filter((bag) => Number(bag.remaining_kg) > 0));
      }
    } catch (error) {
      console.error('Error fetching bags:', error);
      showToastMessage('Failed to load raw material bags', 'error');
    } finally {
      setBagsLoading(false);
    }
  };

  const getRequiredGrams = (finishedQty: number) => {
    return Number(finishedQty || 0) * gramsPerFinishedProduct;
  };

  const getPossibleFinishedQty = (remainingKg: number) => {
    if (!gramsPerFinishedProduct) return 0;
    return Math.floor((Number(remainingKg || 0) * 1000) / gramsPerFinishedProduct);
  };

  const totalFinishedQty = selectedBags.reduce(
    (sum, bag) => sum + Number(finishedQuantities[bag.id] || 0),
    0
  );

  const totalRawGrams = getRequiredGrams(totalFinishedQty);

  const totalAvailableGrams = selectedBags.reduce(
    (sum, bag) => sum + Number(bag.remaining_kg || 0) * 1000,
    0
  );

  const onSubmit = async (data: IConversionExecutionRequest) => {
    try {
      if (selectedBags.length === 0) {
        showToastMessage('Please select at least one raw material bag', 'error');
        return;
      }

      if (!gramsPerFinishedProduct) {
        showToastMessage('Required gram per finished product is missing', 'error');
        return;
      }

      for (const bag of selectedBags) {
        const qty = finishedQuantities[bag.id] || 0;
        const gramsNeeded = getRequiredGrams(qty);
        const availableGrams = Number(bag.remaining_kg || 0) * 1000;

        if (qty <= 0) {
          showToastMessage(`Please enter finished quantity for Bag ${bag.bag_number}`, 'error');
          return;
        }

        if (gramsNeeded > availableGrams) {
          showToastMessage(
            `Bag ${bag.bag_number} has only ${formatGram(availableGrams)} available`,
            'error'
          );
          return;
        }
      }

      setExecuteLoading(true);

      const submitData = {
        conversion_id: data.conversion_id,
        execute_conversion: true,
        finished_variant_sku: conversionRule?.finished_variant_sku,
        raw_material_bags: selectedBags.map((bag) => ({
          bag_id: bag.id,
          finished_quantity: finishedQuantities[bag.id] || 0,
        })),
      };

      const response = await conversionService.executeConversion(submitData);
      setResult(response);
      showToastMessage('Conversion executed successfully', 'success');
    } catch (error) {
      console.error('Error executing conversion:', error);
      showToastMessage('Failed to execute conversion', 'error');
    } finally {
      setExecuteLoading(false);
    }
  };

  if (result) {
    return (
      <Box sx={pageSx}>
        <Container maxWidth={false} disableGutters sx={containerSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => router.push('/conversion')}
                sx={{ bgcolor: '#fff', border: '1px solid #eeeff5' }}
              >
                <ArrowLeft size={20} />
              </IconButton>

              <Box>
                <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                  Conversion
                </Typography>
                <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 850 }}>
                  Conversion Executed
                </Typography>
              </Box>
            </Stack>

            <BBButton variant="contained" onClick={() => router.push(`/conversion/${id}`)}>
              View Details
            </BBButton>
          </Stack>

          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
            {result.message}
          </Alert>

          <Card sx={cardSx}>
            <CardContent>
              <Chip
                icon={<CheckCircle2 size={14} />}
                label="Completed"
                size="small"
                sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, mb: 2 }}
              />

              <Typography sx={{ fontSize: 14, color: '#9ca3af', fontFamily: "'DM Mono', monospace", mb: 2 }}>
                Record ID: {result.record_id}
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1, p: 2, borderRadius: '14px', bgcolor: '#fff7ed' }}>
                  <Typography sx={{ fontWeight: 800 }}>{result.raw_product_name}</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 850, color: '#dc2626' }}>
                    {result.raw_quantity_used.toLocaleString()} used
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, p: 2, borderRadius: '14px', bgcolor: '#ecfdf5' }}>
                  <Typography sx={{ fontWeight: 800 }}>{result.finished_product_name}</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 850, color: '#059669' }}>
                    {result.finished_quantity_produced.toLocaleString()} produced
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={pageSx}>
      <Container maxWidth={false} disableGutters sx={containerSx}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Tooltip title="Back">
            <IconButton
              onClick={() => router.push('/conversion')}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#ffffff',
                color: '#374151',
                border: '1px solid #eeeff5',
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <ArrowLeft size={20} />
            </IconButton>
          </Tooltip>

          <Box>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
              Conversion
            </Typography>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 850, color: '#1a1d2e' }}>
              Execute Conversion
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <BBLoader />
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {conversionRule && (
              <Card sx={{ ...cardSx, mb: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={2}
                  >
                    <Box>
                      <Chip
                        size="small"
                        icon={<PlayCircle size={14} />}
                        label="Ready to Execute"
                        sx={{
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 700,
                          mb: 1.5,
                        }}
                      />

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 850 }}>
                          {conversionRule.raw_product_name}
                        </Typography>

                        <ArrowRight size={25} color="#2563eb" />

                        <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 850 }}>
                          {conversionRule.finished_product_name}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        minWidth: { xs: '100%', md: 280 },
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#f8f9fc',
                        border: '1px solid #eeeff5',
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                        Exact Usage Formula
                      </Typography>

                      <Typography sx={{ fontSize: 24, color: '#1a1d2e', fontWeight: 850 }}>
                        1 Qty = {gramsPerFinishedProduct || 0} g
                      </Typography>

                      <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>
                        From product required_gram_per_unit
                      </Typography>

                      <Divider sx={{ my: 1.4 }} />

                      <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                        Finished SKU
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 14,
                          color: '#1a1d2e',
                          fontWeight: 700,
                          fontFamily: "'DM Mono', monospace",
                          wordBreak: 'break-word',
                        }}
                      >
                        {conversionRule.finished_variant_sku || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
              Enter finished quantity. Example: if 1 bottle needs {gramsPerFinishedProduct || 0} g,
              then 100 bottles will use {formatGram(100 * gramsPerFinishedProduct)}.
            </Alert>

            <Card sx={{ ...cardSx, mb: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography sx={{ fontSize: 18, fontWeight: 850, color: '#1a1d2e', mb: 1.5 }}>
                  Select Raw Material Bags
                </Typography>

                <Autocomplete
                  multiple
                  options={bags}
                  value={selectedBags}
                  loading={bagsLoading}
                  getOptionLabel={(option) =>
                    `Bag ${option.bag_number} - ${option.remaining_kg.toFixed(3)} KG remaining`
                  }
                  onChange={(_, newValue) => {
                    setSelectedBags(newValue);

                    const newQuantities = { ...finishedQuantities };

                    newValue.forEach((bag) => {
                      if (!(bag.id in newQuantities)) {
                        newQuantities[bag.id] = 0;
                      }
                    });

                    Object.keys(newQuantities).forEach((bagId) => {
                      if (!newValue.find((bag) => bag.id === bagId)) {
                        delete newQuantities[bagId];
                      }
                    });

                    setFinishedQuantities(newQuantities);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select bags"
                      placeholder="Choose bags"
                      helperText={`${selectedBags.length} bag(s) selected`}
                      sx={inputSx}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {bagsLoading && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`Bag ${option.bag_number} (${option.remaining_kg.toFixed(3)} KG)`}
                        {...getTagProps({ index })}
                        size="small"
                        sx={{
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 700,
                          borderRadius: '8px',
                        }}
                      />
                    ))
                  }
                  noOptionsText="No available bags for this product"
                />
              </CardContent>
            </Card>

            {selectedBags.length > 0 && (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <SummaryCard
                    icon={<Factory size={20} />}
                    label="Total Finished Qty"
                    value={totalFinishedQty.toLocaleString()}
                    color="#2563eb"
                  />

                  <SummaryCard
                    icon={<Scale size={20} />}
                    label="Raw Needed"
                    value={formatGram(totalRawGrams)}
                    color="#dc2626"
                  />

                  <SummaryCard
                    icon={<Package size={20} />}
                    label="Available Selected"
                    value={formatGram(totalAvailableGrams)}
                    color="#059669"
                  />

                  <SummaryCard
                    icon={<Calculator size={20} />}
                    label="Per Finished Qty"
                    value={`${gramsPerFinishedProduct || 0} g`}
                    color="#7c3aed"
                  />
                </Box>

                <Card sx={{ ...cardSx, mb: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 850, color: '#1a1d2e', mb: 2 }}>
                      Finished Quantity per Bag
                    </Typography>

                    <Stack spacing={1.5}>
                      {selectedBags.map((bag) => {
                        const qty = finishedQuantities[bag.id] || 0;
                        const gramsNeeded = getRequiredGrams(qty);
                        const availableGrams = Number(bag.remaining_kg || 0) * 1000;
                        const exceedsAvailable = gramsNeeded > availableGrams;
                        const possibleQty = getPossibleFinishedQty(bag.remaining_kg);

                        return (
                          <Box
                            key={bag.id}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '1.2fr 260px 240px' },
                              gap: 2,
                              alignItems: 'center',
                              bgcolor: '#ffffff',
                              border: `1px solid ${exceedsAvailable ? '#fecaca' : '#eeeff5'}`,
                              p: 2,
                              borderRadius: '14px',
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 42,
                                  height: 42,
                                  bgcolor: '#fff7ed',
                                  color: '#ea580c',
                                  borderRadius: '12px',
                                }}
                              >
                                <Package size={20} />
                              </Avatar>

                              <Box>
                                <Typography sx={{ fontSize: 15, color: '#1a1d2e', fontWeight: 850 }}>
                                  Bag {bag.bag_number}
                                </Typography>

                                <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                                  Available: {bag.remaining_kg.toFixed(3)} kg
                                </Typography>

                                <Typography sx={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
                                  Can make approx {possibleQty.toLocaleString()} qty
                                </Typography>
                              </Box>
                            </Stack>

                            <TextField
                              type="number"
                              label="Finished Quantity"
                              value={qty}
                              onChange={(e) => {
                                setFinishedQuantities({
                                  ...finishedQuantities,
                                  [bag.id]: Number(e.target.value),
                                });
                              }}
                              inputProps={{ step: '1', min: '0' }}
                              size="small"
                              fullWidth
                              error={exceedsAvailable}
                              helperText={
                                exceedsAvailable
                                  ? `Only ${formatGram(availableGrams)} available`
                                  : `${qty || 0} qty × ${gramsPerFinishedProduct || 0} g = ${formatGram(
                                      gramsNeeded
                                    )}`
                              }
                              sx={inputSx}
                            />

                            <Box
                              sx={{
                                px: 1.5,
                                py: 1.2,
                                borderRadius: '12px',
                                bgcolor: exceedsAvailable ? '#fef2f2' : '#f8f9fc',
                                border: `1px solid ${exceedsAvailable ? '#fecaca' : '#eeeff5'}`,
                              }}
                            >
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                {exceedsAvailable ? (
                                  <AlertTriangle size={19} color="#dc2626" />
                                ) : (
                                  <Calculator size={19} color="#2563eb" />
                                )}

                                <Box>
                                  <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
                                    Raw Usage
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 16,
                                      color: exceedsAvailable ? '#dc2626' : '#1a1d2e',
                                      fontWeight: 850,
                                    }}
                                  >
                                    {formatGram(gramsNeeded)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}

            <Card sx={cardSx}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
                  <BBButton variant="outlined" onClick={() => router.push('/conversion')}>
                    Cancel
                  </BBButton>

                  <BBButton
                    variant="contained"
                    type="submit"
                    loading={executeLoading}
                    startIcon={<PlayCircle size={18} />}
                  >
                    Execute Conversion
                  </BBButton>
                </Stack>
              </CardContent>
            </Card>
          </form>
        )}
      </Container>
    </Box>
  );
}