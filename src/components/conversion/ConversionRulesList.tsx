'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Activity,
  CheckCircle2,
  Edit,
  Eye,
  ListFilter,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { showToastMessage } from '@/utils/toastUtil';
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import { conversionService } from '@/services/conversionService';
import { IConversionRule, IConversionTableRow } from '@/models/conversion.model';
import dayjs from 'dayjs';

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ isActive }: { isActive: boolean }) {
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
        ...(isActive
          ? {
              bgcolor: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }
          : {
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
            }),
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: isActive ? '#22c55e' : '#9ca3af',
          ...(isActive && { boxShadow: '0 0 5px #22c55e' }),
        }}
      />
      {isActive ? 'Active' : 'Inactive'}
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

/* ── Action icon button ───────────────────────────────────────── */
function ActionBtn({ title, onClick, color, children }: any) {
  return (
    <Tooltip title={title} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          width: 30,
          height: 30,
          borderRadius: '8px',
          color,
          bgcolor: color + '12',
          border: `1px solid ${color}28`,
          transition: 'all 0.15s ease',
          '&:hover': { bgcolor: color + '22', transform: 'scale(1.08)' },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

/* ── Main component ───────────────────────────────────────────── */
interface ConversionsListProps {
  onRefresh?: () => void;
}

export default function ConversionRulesList({ onRefresh }: ConversionsListProps) {
  const router = useRouter();
  const [conversions, setConversions] = useState<IConversionTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const response = await conversionService.getAllConversions({ page, limit });
      const tableData: IConversionTableRow[] = response.conversions.map((conv: IConversionRule) => ({
        id: conv.id,
        raw_product_name: conv.raw_product_name,
        raw_product_spec: conv.raw_product_spec || '-',
        finished_product_name: conv.finished_product_name,
        finished_product_spec: conv.finished_product_spec || '-',
        conversion_ratio: conv.conversion_ratio,
        loss_percentage: conv.loss_percentage,
        is_active: conv.is_active,
        created_by_user_name: conv.created_by_user_name,
        created_at: conv.created_at,
      }));
      setConversions(tableData);
      setTotal(response.total);
    } catch (error) {
      showToastMessage('Failed to fetch conversions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversions(); }, [page, limit]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      setDeleting(true);
      await conversionService.deleteConversion(selectedId);
      showToastMessage('Conversion deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedId(null);
      fetchConversions();
    } catch {
      showToastMessage('Failed to delete conversion', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Fixed: use `key` and `label` to match ITableColumn<T>
  const columns: ITableColumn<IConversionTableRow>[] = [
    {
      key: 'raw_product_name',
      label: 'Raw Material',
      render: (row) => (
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
            {row.raw_product_name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
            {row.raw_product_spec}
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
            {row.finished_product_spec}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'conversion_ratio',
      label: 'Ratio',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            bgcolor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace' }}>
            {row.conversion_ratio}:1
          </Typography>
        </Box>
      ),
    },
    {
      key: 'loss_percentage',
      label: 'Loss %',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            bgcolor: row.loss_percentage > 0 ? '#fff7ed' : '#f0fdf4',
            borderRadius: '8px',
            border: `1px solid ${row.loss_percentage > 0 ? '#fed7aa' : '#bbf7d0'}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: row.loss_percentage > 0 ? '#c2410c' : '#15803d',
              fontFamily: 'monospace',
            }}
          >
            {row.loss_percentage}%
          </Typography>
        </Box>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => <StatusBadge isActive={row.is_active} />,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ActionBtn title="View Details" onClick={() => router.push(`/conversion/${row.id}`)} color="#7c3aed">
            <Eye size={14} />
          </ActionBtn>
          <ActionBtn title="Execute" onClick={() => router.push(`/conversion/execute/${row.id}`)} color="#2563eb">
            <PlayCircle size={14} />
          </ActionBtn>
          <ActionBtn title="Edit" onClick={() => router.push(`/conversion/edit/${row.id}`)} color="#059669">
            <Edit size={14} />
          </ActionBtn>
          <ActionBtn
            title="Delete"
            onClick={() => { setSelectedId(row.id); setDeleteDialogOpen(true); }}
            color="#dc2626"
          >
            <Trash2 size={14} />
          </ActionBtn>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard label="Total Rules" value={total} icon={Activity} accent="#7c3aed" />
        <StatCard
          label="Active Rules"
          value={conversions.filter((c) => c.is_active).length}
          icon={CheckCircle2}
          accent="#059669"
        />
      </Stack>

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            Conversion Rules
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', mt: 0.25 }}>
            Define how raw materials convert to finished products
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <BBButton
            variant="outlined"
            startIcon={<ListFilter size={16} />}
            sx={{
              borderRadius: '10px',
              borderColor: '#e5e7eb',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': { borderColor: '#111827', bgcolor: 'transparent' },
            }}
          >
            Filter
          </BBButton>
          <BBButton
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => router.push('/conversion/new')}
            sx={{
              borderRadius: '10px',
              bgcolor: '#111827',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1f2937', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
            }}
          >
            New Rule
          </BBButton>
        </Stack>
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
          <BBTable columns={columns} data={conversions} pagination={false} />
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
              Showing <strong style={{ color: '#374151' }}>{conversions.length}</strong> of{' '}
              <strong style={{ color: '#374151' }}>{total}</strong> rules
            </Typography>
          </Box>
        </Box>
      )}

      {/* Delete Dialog */}
      <BBDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Conversion Rule"
        actions={[
          <BBButton key="cancel" variant="outlined" onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: '10px', borderColor: '#e5e7eb', color: '#374151' }}
          >
            Cancel
          </BBButton>,
          <BBButton
            key="delete"
            variant="contained"
            onClick={handleDelete}
            loading={deleting}
            sx={{ borderRadius: '10px', bgcolor: '#dc2626', boxShadow: 'none', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            Delete Rule
          </BBButton>,
        ]}
      />
    </Box>
  );
}