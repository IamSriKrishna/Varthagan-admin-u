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
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BBButton, BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import { rawMaterialService } from '@/lib/api/rawMaterialService';
import {
  IConversionExecutionRequest,
  IConversionExecutionResponse,
  IConversionRule,
} from '@/models/conversion.model';
import { RawMaterialBag } from '@/models/rawMaterial.model';
import dayjs from 'dayjs';

export default function ExecuteConversionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IConversionExecutionResponse | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [conversionRule, setConversionRule] = useState<IConversionRule | null>(null);
  const [bags, setBags] = useState<RawMaterialBag[]>([]);
  const [selectedBags, setSelectedBags] = useState<RawMaterialBag[]>([]);
  const [bagsLoading, setBagsLoading] = useState(false);
  const [finishedQuantities, setFinishedQuantities] = useState<Record<string, number>>({});

  const id = params?.id as string;

  const { control, handleSubmit, watch, formState: { errors } } = useForm<IConversionExecutionRequest>({
    defaultValues: {
      conversion_id: id,
      conversion_date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      execute_conversion: true,
    },
  });

  // Fetch conversion rule and bags on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rule = await conversionService.getConversion(id);
        setConversionRule(rule);
        
        // Fetch bags for this product
        if (rule.raw_product_id) {
          await fetchBags(rule.raw_product_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToastMessage('Failed to load conversion details', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchBags = async (productId: string) => {
    try {
      setBagsLoading(true);
      const response = await rawMaterialService.getBagsByProduct(productId);
      if (response.success && response.data) {
        const availableBags = response.data.filter((bag) => bag.remaining_kg > 0);
        setBags(availableBags);
      }
    } catch (error) {
      console.error('Error fetching bags:', error);
      showToastMessage('Failed to load raw material bags', 'error');
    } finally {
      setBagsLoading(false);
    }
  };

  const onSubmit = async (data: IConversionExecutionRequest) => {
    try {
      if (selectedBags.length === 0) {
        showToastMessage('Please select at least one raw material bag', 'error');
        return;
      }

      // Validate that all bags have finished quantities
      for (const bag of selectedBags) {
        if ((finishedQuantities[bag.id] || 0) <= 0) {
          showToastMessage(`Please enter finished quantity for Bag ${bag.bag_number}`, 'error');
          return;
        }
      }

      setExecuteLoading(true);
      // Ensure all required fields have correct types
      const submitData: any = {
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
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <BBButton
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push('/conversion')}
          >
            Back
          </BBButton>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
            Conversion Executed
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          {result.message}
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                  Record ID
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', fontFamily: 'monospace' }}>
                  {result.record_id}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                    Raw Material
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', mb: 1 }}>
                    {result.raw_product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
                    {result.raw_quantity_used.toLocaleString()} units used
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                    Finished Product
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', mb: 1 }}>
                    {result.finished_product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46' }}>
                    {result.finished_quantity_produced.toLocaleString()} units produced
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {result.loss_quantity > 0 && (
            <Box>
              <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', bgcolor: '#fef3c7' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', mb: 1 }}>
                    Loss/Waste During Conversion
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e' }}>
                    {result.loss_quantity.toLocaleString()} units
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          <Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <BBButton
                variant="outlined"
                onClick={() => router.push('/conversion')}
              >
                Back to Conversions
              </BBButton>
              <BBButton
                variant="contained"
                onClick={() => router.push(`/conversion/${id}`)}
              >
                View Details
              </BBButton>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BBButton
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.push('/conversion')}
        >
          Back
        </BBButton>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
          Execute Conversion
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <BBLoader />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Alert severity="info">
                Select raw material bags and enter the quantity to convert. The system will automatically calculate the expected output.
              </Alert>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', mb: 1 }}>
              Select Raw Material Bags
            </Typography>
            <Autocomplete
              multiple
              options={bags}
              getOptionLabel={(option) => `Bag ${option.bag_number} - ${option.remaining_kg.toFixed(2)} KG remaining`}
              value={selectedBags}
              onChange={(_, newValue) => {
                setSelectedBags(newValue);
                // Initialize finished quantities for new bags
                const newQuantities = { ...finishedQuantities };
                newValue.forEach((bag) => {
                  if (!(bag.id in newQuantities)) {
                    newQuantities[bag.id] = 0;
                  }
                });
                // Remove quantities for deselected bags
                Object.keys(newQuantities).forEach((bagId) => {
                  if (!newValue.find((bag) => bag.id === bagId)) {
                    delete newQuantities[bagId];
                  }
                });
                setFinishedQuantities(newQuantities);
              }}
              loading={bagsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select bags to use for conversion"
                  placeholder="Choose one or more bags"
                  variant="outlined"
                  helperText={`${selectedBags.length} bag(s) selected`}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {bagsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`Bag ${option.bag_number} (${option.remaining_kg.toFixed(2)} KG)`}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{ bgcolor: '#EEF2FF', color: '#4F46E5' }}
                  />
                ))
              }
              noOptionsText="No available bags for this product"
            />
          </Box>

          {selectedBags.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', mb: 2 }}>
                Finished Quantity per Bag
              </Typography>
              <Stack spacing={2}>
                {selectedBags.map((bag) => (
                  <Box key={bag.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', bgcolor: '#f9fafb', p: 2, borderRadius: '6px' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 1 }}>
                        Bag {bag.bag_number} (Available: {bag.remaining_kg.toFixed(2)} KG)
                      </Typography>
                    </Box>
                    <TextField
                      type="number"
                      label="Finished Quantity"
                      value={finishedQuantities[bag.id] || 0}
                      onChange={(e) => {
                        setFinishedQuantities({
                          ...finishedQuantities,
                          [bag.id]: Number(e.target.value),
                        });
                      }}
                      inputProps={{ step: '1', min: '0' }}
                      variant="outlined"
                      size="small"
                      sx={{ width: '150px' }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <BBButton
                variant="outlined"
                onClick={() => router.push('/conversion')}
              >
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
            </Box>
          </Box>
        </form>
      )}
    </Container>
  );
}
