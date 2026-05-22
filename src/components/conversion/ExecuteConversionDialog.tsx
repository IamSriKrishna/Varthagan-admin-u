'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Divider,
  Alert,
  Autocomplete,
} from '@mui/material';
import { AlertCircle, ArrowRight, Check, PlayCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BBButton, BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import { Variant } from '@/lib/api/productService';
import {
  IConversionRule,
  IConversionExecutionRequest,
  IConversionExecutionResponse,
} from '@/models/conversion.model';
import dayjs from 'dayjs';

interface ExecuteConversionDialogProps {
  open: boolean;
  onClose: () => void;
  conversionId: string;
  onSuccess?: () => void;
}

export default function ExecuteConversionDialog({
  open,
  onClose,
  conversionId,
  onSuccess,
}: ExecuteConversionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [conversionRule, setConversionRule] = useState<IConversionRule | null>(null);
  const [result, setResult] = useState<IConversionExecutionResponse | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [finishedProductVariants, setFinishedProductVariants] = useState<Variant[]>([]);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<IConversionExecutionRequest>({
    defaultValues: {
      conversion_id: conversionId,
      raw_quantity_used: 0,
      conversion_date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      execute_conversion: true,
    },
  });

  const rawQuantity = watch('raw_quantity_used');

  useEffect(() => {
    if (open && conversionId) {
      fetchConversionRule();
    }
  }, [open, conversionId]);

  const fetchConversionRule = async () => {
    try {
      setFetching(true);
      const rule = await conversionService.getConversion(conversionId);
      setConversionRule(rule);
    } catch (error) {
      console.error('Error fetching conversion rule:', error);
      showToastMessage('Failed to load conversion rule', 'error');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: IConversionExecutionRequest) => {
    try {
      setExecuteLoading(true);
      // Ensure all required fields have correct types
      const submitData = {
        ...data,
        raw_quantity_used: Number(data.raw_quantity_used),
        conversion_date: data.conversion_date ? `${data.conversion_date}Z` : undefined,
      };
      const response = await conversionService.executeConversion(submitData);
      setResult(response);
      showToastMessage('Conversion executed successfully', 'success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error executing conversion:', error);
      showToastMessage('Failed to execute conversion', 'error');
    } finally {
      setExecuteLoading(false);
    }
  };

  if (fetching) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <BBLoader />
        </DialogContent>
      </Dialog>
    );
  }

  if (result) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Conversion Completed
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {result.message}
            </Alert>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Check size={20} style={{ color: '#10b981' }} />
                <Typography sx={{ fontSize: '0.875rem' }}>
                  Record ID: <strong>{result.record_id}</strong>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                  Raw Material
                </Typography>
                <Box sx={{ bgcolor: '#f3f4f6', p: 1.5, borderRadius: '6px' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    {result.raw_product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>
                    {result.raw_quantity_used} units used
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <ArrowRight size={24} style={{ color: '#8b5cf6' }} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                  Finished Product
                </Typography>
                <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: '6px' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#065f46' }}>
                    {result.finished_product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#065f46' }}>
                    {result.finished_quantity_produced} units produced
                  </Typography>
                </Box>
              </Box>

              {result.loss_quantity > 0 && (
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                    Loss/Waste
                  </Typography>
                  <Box sx={{ bgcolor: '#fef3c7', p: 1.5, borderRadius: '6px' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#92400e' }}>
                      {result.loss_quantity} units lost during conversion
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
              <BBButton fullWidth variant="contained" onClick={() => onClose()}>
                Close
              </BBButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
        Execute Conversion
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ py: 2 }}>
            {conversionRule && (
              <>
                {/* Conversion Info */}
                <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', mb: 2 }}>
                  <CardContent>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                      Raw Material
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', mb: 2 }}>
                      {conversionRule.raw_product_name}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>Conversion</Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>
                          {conversionRule.conversion_ratio}:1
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                      Finished Product
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                      {conversionRule.finished_product_name}
                    </Typography>

                    {conversionRule.loss_percentage > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>
                          Loss: {conversionRule.loss_percentage}% during conversion
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Quantity Input */}
                <Controller
                  name="raw_quantity_used"
                  control={control}
                  rules={{
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' },
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(Number(e.target.value))}
                      fullWidth
                      label="Raw Material Quantity"
                      placeholder="Enter quantity to convert"
                      type="number"
                      inputProps={{ step: '1', min: '1' }}
                      error={!!errors.raw_quantity_used}
                      helperText={errors.raw_quantity_used?.message}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                {/* Calculation Result */}
                {rawQuantity > 0 && (
                  <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', p: 2, borderRadius: '6px', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                      Expected Result:
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#065f46' }}>
                        Input: {rawQuantity} × {conversionRule.raw_product_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#065f46' }}>
                        Output: {Math.round((rawQuantity / conversionRule.conversion_ratio) * (1 - conversionRule.loss_percentage / 100))} × {conversionRule.finished_product_name}
                      </Typography>
                      {conversionRule.loss_percentage > 0 && (
                        <Typography sx={{ fontSize: '0.875rem', color: '#92400e' }}>
                          Loss: {Math.round((rawQuantity / conversionRule.conversion_ratio) * (conversionRule.loss_percentage / 100))} units
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Conversion Date */}
                <Controller
                  name="conversion_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Conversion Date & Time"
                      type="datetime-local"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                      inputProps={{ step: '1' }}
                    />
                  )}
                />

                {/* Variant Selector - Show if conversion rule has variants available */}
                {finishedProductVariants.length > 0 && (
                  <Controller
                    name="finished_variant_sku"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={finishedProductVariants}
                        getOptionLabel={(option) => `${option.variant_name} (SKU: ${option.sku})`}
                        value={finishedProductVariants.find((v) => v.sku === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.sku || '')}
                        fullWidth
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Finished Product Variant (Optional)"
                            placeholder="Select variant to add stock to"
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.sku === value.sku}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                )}

                {/* Notes */}
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      placeholder="Add notes about this conversion..."
                      multiline
                      rows={2}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
                  <BBButton variant="outlined" onClick={onClose}>
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
              </>
            )}
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
