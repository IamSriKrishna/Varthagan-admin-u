'use client';

import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { CheckCircle2, Clock, Eye, Search, TrendingUp, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BBInputBase, BBLoader, BBTable } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import { conversionService } from '@/services/conversionService';
import { IConversionRecord, IConversionRecordTableRow } from '@/models/conversion.model';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs from 'dayjs';

/* ── Status badge ─────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string; Icon: any }> = {
  COMPLETED: { label: 'Completed', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', Icon: CheckCircle2 },
  PENDING:   { label: 'Pending',   bg: '#fef9c3', color: '#a16207', border: '#fde047', Icon: Clock },
  FAILED:    { label: 'Failed',    bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  const { Icon } = cfg;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.4,
        borderRadius: '100px',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Icon size={10} />
      {cfg.label}
    </Box>
  );
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: any;
  accent: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: '#ffffff',
        border: '1px solid #e7e5df',
        borderRadius: '16px',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: accent + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accent,
        }}
      >
        <Icon size={22} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', lineHeight: 1.1, fontFamily: "'Syne', sans-serif" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Loss indicator ───────────────────────────────────────────── */
function LossCell({ quantity }: { quantity: number }) {
  const hasLoss = quantity > 0;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: '8px',
        bgcolor: hasLoss ? '#fff7ed' : '#f0fdf4',
        border: `1px solid ${hasLoss ? '#fed7aa' : '#bbf7d0'}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: hasLoss ? '#c2410c' : '#15803d',
          fontFamily: 'monospace',
        }}
      >
        {hasLoss ? `${quantity.toLocaleString()} units` : '—'}
      </Typography>
    </Box>
  );
}

/* ── Main component ───────────────────────────────────────────── */
interface ConversionRecordsListProps {
  conversionId?: string;
}

export default function ConversionRecordsList({ conversionId }: ConversionRecordsListProps) {
  const router = useRouter();
  const [records, setRecords] = useState<IConversionRecordTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = conversionId
        ? await conversionService.getConversionRecordsByRule(conversionId, { page, limit })
        : await conversionService.getConversionRecords({ page, limit });

      const tableData: IConversionRecordTableRow[] = response.records.map((record: IConversionRecord) => ({
        id: record.id,
        raw_product_name: record.raw_product_name,
        raw_quantity_used: record.raw_quantity_used,
        finished_product_name: record.finished_product_name,
        finished_quantity_produced: record.finished_quantity_produced,
        loss_quantity: record.loss_quantity,
        conversion_date: record.conversion_date,
        status: record.status,
        created_by_user_name: record.created_by_user_name,
        created_at: record.created_at,
      }));

      setRecords(tableData);
      setTotal(response.total);
    } catch {
      showToastMessage('Failed to fetch conversion records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [page, limit, conversionId]);

  // ✅ Fixed: `key` and `label` instead of `field` and `header`
  const columns: ITableColumn<IConversionRecordTableRow>[] = [
    {
      key: 'raw_product_name',
      label: 'Raw Material',
      render: (row) => (
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
            {row.raw_product_name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
            {row.raw_quantity_used.toLocaleString()} units used
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'finished_product_name',
      label: 'Finished Product',
      render: (row) => (
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
            {row.finished_product_name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
            {row.finished_quantity_produced.toLocaleString()} units produced
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'loss_quantity',
      label: 'Loss / Waste',
      render: (row) => <LossCell quantity={row.loss_quantity} />,
    },
    {
      key: 'conversion_date',
      label: 'Conversion Date',
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
            {dayjs(row.conversion_date).format('DD MMM YYYY')}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>
            {dayjs(row.conversion_date).format('HH:mm')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>
          {dayjs(row.created_at).format('DD MMM YYYY')}
        </Typography>
      ),
    },
    {
      key: 'action',
      label: 'Actions',
      render: (row) => (
        <Box
          onClick={() => router.push(`/conversion/record/${row.id}`)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.6,
            borderRadius: '8px',
            cursor: 'pointer',
            bgcolor: '#f5f3ff',
            border: '1px solid #ede9fe',
            color: '#7c3aed',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.14s ease',
            '&:hover': { bgcolor: '#ede9fe', transform: 'scale(1.04)' },
          }}
        >
          <Eye size={13} />
          View
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard label="Total Records" value={total} icon={TrendingUp} accent="#2563eb" />
        <StatCard
          label="Completed"
          value={records.filter((r) => r.status === 'COMPLETED').length}
          icon={CheckCircle2}
          accent="#059669"
        />
      </Stack>

      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}
        >
          {conversionId ? 'Conversion Records' : 'All Conversion Records'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', mt: 0.25 }}>
          Full audit trail of every production conversion executed
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <BBInputBase
          name="search"
          label=""
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startAdornment={<Search size={16} color="#9ca3af" />}
        />
      </Box>

      {/* Table */}
      {loading ? (
        <BBLoader />
      ) : (
        <Box
          sx={{
            border: '1px solid #e7e5df',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#fafaf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid #f0ede6',
              py: 1.75,
            },
            '& .MuiTableBody-root .MuiTableRow-root': {
              transition: 'background-color 0.12s ease',
              '&:hover': { bgcolor: '#fafaf8' },
            },
            '& .MuiTableBody-root .MuiTableCell-root': {
              borderBottom: '1px solid #f5f4f0',
              py: 1.5,
            },
          }}
        >
          <BBTable columns={columns} data={records} pagination={false} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2.5,
              py: 1.5,
              bgcolor: '#fafaf8',
              borderTop: '1px solid #f0ede6',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 500 }}>
              Showing <strong style={{ color: '#374151' }}>{records.length}</strong> of{' '}
              <strong style={{ color: '#374151' }}>{total}</strong> records
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}