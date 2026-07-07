// ViewConversionPage_REBUILT_UI.tsx
// Generated from uploaded source.

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
  Avatar,
  Divider,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ArrowRight,
  Package,
  Factory,
  CalendarDays,
  User,
  FileText,
  Activity,
  Percent,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { conversionService } from '@/services/conversionService';
import { IConversionRule } from '@/models/conversion.model';
import { BBLoader, BBButton, BBDialog } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import ConversionRecordsList from '@/components/conversion/ConversionRecordsList';
import dayjs from 'dayjs';

const cardSx = {
  borderRadius: '12px',
  border: '1px solid #eeeff5',
  background: '#ffffff',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
};

function InfoTile({
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
      <CardContent sx={{ p: 1.8 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: `${color}12`,
              color,
              borderRadius: '10px',
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 17, color: '#1a1d2e', fontWeight: 800 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ProductCard({
  title,
  name,
  spec,
  productId,
  type,
}: {
  title: string;
  name: string;
  spec?: string;
  productId: string | number;
  type: 'raw' | 'finished';
}) {
  const isRaw = type === 'raw';

  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Avatar
            sx={{
              width: 46,
              height: 46,
              borderRadius: '12px',
              bgcolor: isRaw ? '#fff7ed' : '#ecfdf5',
              color: isRaw ? '#ea580c' : '#059669',
            }}
          >
            {isRaw ? <Package size={23} /> : <Factory size={23} />}
          </Avatar>

          <Box>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 19, color: '#1a1d2e', fontWeight: 800 }}>
              {name}
            </Typography>
          </Box>
        </Stack>

        {spec && (
          <Box
            sx={{
              mb: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: '10px',
              bgcolor: '#f9fafb',
              border: '1px solid #eeeff5',
            }}
          >
            <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
              Specification
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#1a1d2e', fontWeight: 600 }}>
              {spec}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            bgcolor: '#f9fafb',
            border: '1px solid #eeeff5',
          }}
        >
          <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
            Product ID
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: '#1a1d2e',
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              wordBreak: 'break-word',
            }}
          >
            {productId}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

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

    if (id) fetchConversion();
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', justifyContent: 'center', pt: 5 }}>
        <BBLoader />
      </Box>
    );
  }

  if (!conversionRule) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: 2 }}>
        <Typography color="error">Conversion rule not found</Typography>
      </Box>
    );
  }

  const loss = Number(conversionRule.loss_percentage || 0);
  const efficiency = Math.max(0, 100 - loss);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#ffffff',
        py: 2,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          width: '100%',
          px: { xs: 1.5, sm: 2, md: 2.5 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          mb={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Go Back">
              <IconButton
                onClick={() => router.push('/conversion')}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#f9fafb',
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
                Conversion Rule
              </Typography>
              <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#1a1d2e' }}>
                Conversion Details
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <BBButton
              variant="outlined"
              startIcon={<Edit size={17} />}
              onClick={() => router.push(`/conversion/edit/${id}`)}
            >
              Edit
            </BBButton>

            <BBButton
              variant="contained"
              color="error"
              startIcon={<Trash2 size={17} />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </BBButton>
          </Stack>
        </Stack>

        <Card
          sx={{
            ...cardSx,
            mb: 2,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Chip
                    size="small"
                    icon={<CheckCircle2 size={14} />}
                    label={conversionRule.is_active ? 'Active' : 'Inactive'}
                    sx={{
                      bgcolor: conversionRule.is_active ? '#ecfdf5' : '#f3f4f6',
                      color: conversionRule.is_active ? '#047857' : '#9ca3af',
                      fontWeight: 700,
                    }}
                  />

                  {loss > 0 && (
                    <Chip
                      size="small"
                      label={`${loss}% Loss`}
                      sx={{
                        bgcolor: '#fffbeb',
                        color: '#92400e',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1.5}
                >
                  <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 850, color: '#1a1d2e' }}>
                    {conversionRule.raw_product_name}
                  </Typography>

                  <ArrowRight size={26} color="#2563eb" />

                  <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 850, color: '#1a1d2e' }}>
                    {conversionRule.finished_product_name}
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  minWidth: { xs: '100%', md: 190 },
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#f9fafb',
                  border: '1px solid #eeeff5',
                }}
              >
                <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                  Conversion Ratio
                </Typography>
                <Typography sx={{ fontSize: 30, color: '#1a1d2e', fontWeight: 850 }}>
                  {conversionRule.conversion_ratio}:1
                </Typography>

                <Divider sx={{ my: 1.3 }} />

                <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>
                  Efficiency
                </Typography>
                <Typography sx={{ fontSize: 21, color: '#047857', fontWeight: 850 }}>
                  {efficiency}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: 'repeat(4, 1fr)',
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          <InfoTile icon={<Scale size={20} />} label="Ratio" value={`${conversionRule.conversion_ratio}:1`} />
          <InfoTile icon={<Percent size={20} />} label="Loss" value={`${loss}%`} color="#f59e0b" />
          <InfoTile icon={<Activity size={20} />} label="Efficiency" value={`${efficiency}%`} color="#059669" />
          <InfoTile
            icon={<CheckCircle2 size={20} />}
            label="Status"
            value={conversionRule.is_active ? 'Active' : 'Inactive'}
            color={conversionRule.is_active ? '#16a34a' : '#9ca3af'}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 58px 1fr' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <ProductCard
            title="Raw Material"
            name={conversionRule.raw_product_name}
            spec={conversionRule.raw_product_spec}
            productId={conversionRule.raw_product_id}
            type="raw"
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              <ArrowRight size={24} />
            </Avatar>
          </Box>

          <ProductCard
            title="Finished Product"
            name={conversionRule.finished_product_name}
            spec={conversionRule.finished_product_spec}
            productId={conversionRule.finished_product_id}
            type="finished"
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: conversionRule.notes ? '1fr 1fr' : '1fr' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#1a1d2e', mb: 1.5 }}>
                Timeline
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 36, height: 36 }}>
                    <User size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
                      Created By
                    </Typography>
                    <Typography sx={{ color: '#1a1d2e', fontWeight: 700, fontSize: 14 }}>
                      {conversionRule.created_by_user_name}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                    <CalendarDays size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
                      Created At
                    </Typography>
                    <Typography sx={{ color: '#1a1d2e', fontWeight: 700, fontSize: 14 }}>
                      {dayjs(conversionRule.created_at).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 36, height: 36 }}>
                    <Activity size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
                      Last Updated
                    </Typography>
                    <Typography sx={{ color: '#1a1d2e', fontWeight: 700, fontSize: 14 }}>
                      {dayjs(conversionRule.updated_at).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {conversionRule.notes && (
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                  <Avatar sx={{ bgcolor: '#f9fafb', color: '#374151', borderRadius: '10px', width: 38, height: 38 }}>
                    <FileText size={19} />
                  </Avatar>

                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#1a1d2e' }}>
                    Notes
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>
                  {conversionRule.notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Card sx={{ ...cardSx, mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <ConversionRecordsList conversionId={id} />
          </CardContent>
        </Card>

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
    </Box>
  );
}