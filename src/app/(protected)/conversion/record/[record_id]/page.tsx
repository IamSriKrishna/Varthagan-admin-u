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
  ArrowRight,
  Package,
  Factory,
  CalendarDays,
  User,
  Hash,
  Activity,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { conversionService } from '@/services/conversionService';
import { IConversionRecord } from '@/models/conversion.model';
import { BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: 'Completed',
    bg: '#ecfdf5',
    color: '#047857',
    icon: <CheckCircle2 size={14} />,
  },
  PENDING: {
    label: 'Pending',
    bg: '#fffbeb',
    color: '#92400e',
    icon: <Clock size={14} />,
  },
  FAILED: {
    label: 'Failed',
    bg: '#fef2f2',
    color: '#b91c1c',
    icon: <XCircle size={14} />,
  },
};

const cardSx = {
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
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
            <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 17, color: '#111827', fontWeight: 800 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ProductRecordCard({
  title,
  name,
  productId,
  quantityLabel,
  quantity,
  type,
}: {
  title: string;
  name: string;
  productId: string | number;
  quantityLabel: string;
  quantity: string;
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
            <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 19, color: '#111827', fontWeight: 800 }}>
              {name}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mb: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            bgcolor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
            Product ID
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: '#111827',
              fontFamily: 'monospace',
              fontWeight: 700,
              wordBreak: 'break-word',
            }}
          >
            {productId}
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            bgcolor: isRaw ? '#fff7ed' : '#ecfdf5',
            border: `1px solid ${isRaw ? '#fed7aa' : '#bbf7d0'}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: isRaw ? '#9a3412' : '#047857',
              fontWeight: 700,
            }}
          >
            {quantityLabel}
          </Typography>

          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 850,
              color: isRaw ? '#dc2626' : '#059669',
            }}
          >
            {quantity}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

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

    if (recordId) fetchRecord();
  }, [recordId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          pt: 5,
        }}
      >
        <BBLoader />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', p: 2 }}>
        <Typography color="error">Conversion record not found</Typography>
      </Box>
    );
  }

  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.PENDING;

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
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => router.push('/conversion')}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#f9fafb',
                color: '#374151',
                border: '1px solid #e5e7eb',
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <ArrowLeft size={20} />
            </IconButton>
          </Tooltip>

          <Box>
            <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
              Conversion
            </Typography>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#111827' }}>
              Conversion Record
            </Typography>
          </Box>
        </Stack>

        <Card sx={{ ...cardSx, mb: 2 }}>
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
                    label={statusConfig.label}
                    sx={{
                      bgcolor: statusConfig.bg,
                      color: statusConfig.color,
                      fontWeight: 700,
                    }}
                  />

                  {record.loss_quantity > 0 && (
                    <Chip
                      size="small"
                      icon={<AlertTriangle size={14} />}
                      label={`${record.loss_quantity.toLocaleString()} Loss`}
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
                  <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 850, color: '#111827' }}>
                    {record.raw_product_name}
                  </Typography>

                  <ArrowRight size={26} color="#2563eb" />

                  <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 850, color: '#111827' }}>
                    {record.finished_product_name}
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  minWidth: { xs: '100%', md: 210 },
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                  Record ID
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: '#111827',
                    fontFamily: 'monospace',
                    fontWeight: 750,
                    wordBreak: 'break-word',
                  }}
                >
                  {record.id}
                </Typography>

                <Divider sx={{ my: 1.3 }} />

                <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                  Conversion Date
                </Typography>
                <Typography sx={{ fontSize: 15, color: '#111827', fontWeight: 750 }}>
                  {dayjs(record.conversion_date).format('DD MMM YYYY, hh:mm A')}
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
              md: record.loss_quantity > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          <InfoTile
            icon={<Scale size={20} />}
            label="Raw Used"
            value={`${record.raw_quantity_used.toLocaleString()} units`}
            color="#dc2626"
          />

          <InfoTile
            icon={<Activity size={20} />}
            label="Produced"
            value={`${record.finished_quantity_produced.toLocaleString()} units`}
            color="#059669"
          />

          {record.loss_quantity > 0 && (
            <InfoTile
              icon={<AlertTriangle size={20} />}
              label="Loss / Waste"
              value={`${record.loss_quantity.toLocaleString()} units`}
              color="#f59e0b"
            />
          )}

          <InfoTile
            icon={<CheckCircle2 size={20} />}
            label="Status"
            value={statusConfig.label}
            color={statusConfig.color}
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
          <ProductRecordCard
            title="Raw Material"
            name={record.raw_product_name}
            productId={record.raw_product_id}
            quantityLabel="Quantity Used"
            quantity={`-${record.raw_quantity_used.toLocaleString()} units`}
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

          <ProductRecordCard
            title="Finished Product"
            name={record.finished_product_name}
            productId={record.finished_product_id}
            quantityLabel="Quantity Produced"
            quantity={`+${record.finished_quantity_produced.toLocaleString()} units`}
            type="finished"
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#111827', mb: 1.5 }}>
                Timeline
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 36, height: 36 }}>
                    <CalendarDays size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                      Conversion Date
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>
                      {dayjs(record.conversion_date).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                    <User size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                      Created By
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>
                      {record.created_by_user_name}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 36, height: 36 }}>
                    <Clock size={18} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                      Created At
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>
                      {dayjs(record.created_at).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={cardSx}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#111827', mb: 1.5 }}>
                Record Summary
              </Typography>

              <Stack spacing={1.2}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: '10px',
                    bgcolor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                    Record ID
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: '#111827',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      wordBreak: 'break-word',
                    }}
                  >
                    {record.id}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: '10px',
                    bgcolor: statusConfig.bg,
                    border: `1px solid ${statusConfig.color}22`,
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: statusConfig.color, fontWeight: 700 }}>
                    Status
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: statusConfig.color, fontWeight: 800 }}>
                    {statusConfig.label}
                  </Typography>
                </Box>

                {record.loss_quantity > 0 && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: '#fffbeb',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: '#92400e', fontWeight: 700 }}>
                      Loss / Waste
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: '#92400e', fontWeight: 800 }}>
                      {record.loss_quantity.toLocaleString()} units
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}