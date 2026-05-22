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
import { ArrowLeft, Edit, Trash2, ArrowRight } from 'lucide-react';
import { conversionService } from '@/services/conversionService';
import { IConversionRule } from '@/models/conversion.model';
import { BBLoader, BBButton, BBDialog } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import ConversionRecordsList from '@/components/conversion/ConversionRecordsList';
import dayjs from 'dayjs';

export default function ViewConversionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversionRule, setConversionRule] = useState<IConversionRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    const fetchConversion = async () => {
      try {
        setLoading(true);
        const rule = await conversionService.getConversion(id);
        setConversionRule(rule);
      } catch (error) {
        console.error('Error fetching conversion:', error);
        showToastMessage('Failed to load conversion rule', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConversion();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await conversionService.deleteConversion(id);
      showToastMessage('Conversion deleted successfully', 'success');
      setTimeout(() => router.push('/conversion'), 800);
    } catch (error) {
      console.error('Error deleting conversion:', error);
      showToastMessage('Failed to delete conversion', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <BBLoader />
      </Container>
    );
  }

  if (!conversionRule) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography color="error">Conversion rule not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => router.push('/conversion')}
              sx={{ color: '#6b7280' }}
            >
              <ArrowLeft size={24} />
            </IconButton>
          </Tooltip>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
            Conversion Details
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <BBButton
            variant="outlined"
            startIcon={<Edit size={18} />}
            onClick={() => router.push(`/conversion/edit/${id}`)}
          >
            Edit
          </BBButton>
          <BBButton
            variant="contained"
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </BBButton>
        </Stack>
      </Box>

      {/* Conversion Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.4fr 1fr' }, gap: 2, mb: 3 }}>
        {/* Raw Material */}
        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', height: '100%' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Raw Material
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', mb: 1 }}>
                {conversionRule.raw_product_name}
              </Typography>
              {conversionRule.raw_product_spec && (
                <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 2 }}>
                  Spec: {conversionRule.raw_product_spec}
                </Typography>
              )}
              <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                  Product ID
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  {conversionRule.raw_product_id}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Conversion Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, mb: 1 }}>
              Conversion
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <ArrowRight size={24} style={{ color: '#8b5cf6' }} />
            </Box>
            <Chip
              label={`${conversionRule.conversion_ratio}:1`}
              sx={{
                bgcolor: '#f3e8ff',
                color: '#6d28d9',
                fontWeight: 600,
              }}
            />
            {conversionRule.loss_percentage > 0 && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${conversionRule.loss_percentage}% Loss`}
                  size="small"
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Finished Product */}
        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', height: '100%' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
                Finished Product
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', mb: 1 }}>
                {conversionRule.finished_product_name}
              </Typography>
              {conversionRule.finished_product_spec && (
                <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 2 }}>
                  Spec: {conversionRule.finished_product_spec}
                </Typography>
              )}
              <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: '6px' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  Product ID
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#065f46', fontFamily: 'monospace' }}>
                  {conversionRule.finished_product_id}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Status
              </Typography>
              <Chip
                label={conversionRule.is_active ? 'Active' : 'Inactive'}
                color={conversionRule.is_active ? 'success' : 'default'}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Created By
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {conversionRule.created_by_user_name}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Created At
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {dayjs(conversionRule.created_at).format('DD MMM YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px' }}>
            <CardContent>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 2 }}>
                Last Updated
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                {dayjs(conversionRule.updated_at).format('DD MMM YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {conversionRule.notes && (
        <Card sx={{ border: '1px solid #eeeff5', borderRadius: '8px', mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
              Notes
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
              {conversionRule.notes}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Conversion Records */}
      <ConversionRecordsList conversionId={id} />

      {/* Delete Dialog */}
      <BBDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Conversion Rule"
        content="Are you sure you want to delete this conversion rule? This action cannot be undone."
        actions={[
          <BBButton key="cancel" variant="outlined" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </BBButton>,
          <BBButton
            key="delete"
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </BBButton>,
        ]}
      />
    </Container>
  );
}
