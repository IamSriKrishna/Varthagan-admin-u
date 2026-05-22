'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BBButton, BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import { conversionService } from '@/services/conversionService';
import {
  IConversionExecutionRequest,
  IConversionExecutionResponse,
} from '@/models/conversion.model';
import dayjs from 'dayjs';

export default function ExecuteConversionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IConversionExecutionResponse | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);

  const id = params?.id as string;

  const { control, handleSubmit, watch, formState: { errors } } = useForm<IConversionExecutionRequest>({
    defaultValues: {
      conversion_id: id,
      raw_quantity_used: 0,
      conversion_date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      execute_conversion: true,
    },
  });

  const rawQuantity = watch('raw_quantity_used');

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Alert severity="info">
              Enter the quantity of raw material you want to convert. The system will automatically calculate the expected output based on the conversion ratio and loss percentage.
            </Alert>
          </Box>

          <Box>
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
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="conversion_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Conversion Date"
                  type="datetime-local"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </Box>

          <Box>
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
                  rows={3}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {rawQuantity > 0 && (
            <Box>
              <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', bgcolor: '#f0fdf4' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#047857', mb: 2 }}>
                    Expected Result
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Input
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#065f46' }}>
                        {rawQuantity.toLocaleString()} units
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Expected Output
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#065f46' }}>
                        (Will be calculated based on conversion rule)
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
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
        </Box>
      </form>
    </Container>
  );
}
