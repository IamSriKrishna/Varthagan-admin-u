'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { conversionService } from '@/services/conversionService';
import { IConversionRecord } from '@/models/conversion.model';
import { BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  COMPLETED: {
    label: 'Completed',
    bg: '#f0fdf4',
    color: '#065f46',
  },
  PENDING: {
    label: 'Pending',
    bg: '#fef3c7',
    color: '#92400e',
  },
  FAILED: {
    label: 'Failed',
    bg: '#fee2e2',
    color: '#991b1b',
  },
};

export default function ViewConversionRecordPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<IConversionRecord | null>(null);

  const recordId = params?.record_id as string;

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await conversionService.getConversionRecord(recordId);
        setRecord(data);
      } catch (error) {
        console.error('Error fetching record:', error);
        showToastMessage('Failed to load conversion record', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <BBLoader />
      </Container>
    );
  }

  if (!record) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography color="error">Conversion record not found</Typography>
      </Container>
    );
  }

  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.PENDING;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => router.push('/conversion')}
            sx={{ color: '#6b7280' }}
          >
            <ArrowLeft size={24} />
          </IconButton>
        </Tooltip>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
          Conversion Record
        </Typography>
      </Box>

      {/* Record ID and Status */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Record ID
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontFamily: 'monospace' }}>
                {record.id}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Status
              </Typography>
              <Chip
                label={statusConfig.label}
                sx={{
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Conversion Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Raw Material
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', mb: 1 }}>
                {record.raw_product_name}
              </Typography>
              <Box sx={{ bgcolor: '#f3f4f6', p: 1.5, borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                  Product ID
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  {record.raw_product_id}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, p: 1.5, border: '2px solid #fee2e2', borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                  Quantity Used
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }}>
                  -{record.raw_quantity_used.toLocaleString()} units
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Finished Product
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', mb: 1 }}>
                {record.finished_product_name}
              </Typography>
              <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  Product ID
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#065f46', fontFamily: 'monospace' }}>
                  {record.finished_product_id}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, p: 1.5, border: '2px solid #bbf7d0', borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  Quantity Produced
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  +{record.finished_quantity_produced.toLocaleString()} units
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Loss and Timestamps */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {record.loss_quantity > 0 && (
          <Box>
            <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', bgcolor: '#fef3c7' }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', mb: 1 }}>
                  Loss/Waste
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e' }}>
                  {record.loss_quantity.toLocaleString()} units
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Conversion Date
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {dayjs(record.conversion_date).format('DD MMM YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Created By
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {record.created_by_user_name}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Created At
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {dayjs(record.created_at).format('DD MMM YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
