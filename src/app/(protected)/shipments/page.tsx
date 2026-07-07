'use client';

import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import BBTable, { ITableColumn } from '@/lib/BBTable/BBTable';
import { BBButton, BBDialog, BBLoader } from '@/lib';
import HighlightedCell from '@/lib/BBTable/HighlightedCell';
import { Shipment, ShipmentStatus } from '@/models/shipment.model';
import { shipmentService } from '@/services/shipmentService';
import { showToastMessage } from '@/utils/toastUtil';
import dayjs from 'dayjs';

type FilterTab = 'all' | ShipmentStatus;

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { bg: string; color: string; border: string; dot: string; label: string }
> = {
  created: {
    bg: '#f8f9fc',
    color: '#6b7280',
    border: '#eeeff5',
    dot: '#9ca3af',
    label: 'Created',
  },
  shipped: {
    bg: '#e0f2fe',
    color: '#0369a1',
    border: '#bae6fd',
    dot: '#0ea5e9',
    label: 'Shipped',
  },
  in_transit: {
    bg: '#fff8eb',
    color: '#b45309',
    border: '#fcd34d',
    dot: '#f59e0b',
    label: 'In Transit',
  },
  delivered: {
    bg: '#f0fdf6',
    color: '#15803d',
    border: '#6ddc98',
    dot: '#16a34a',
    label: 'Delivered',
  },
  cancelled: {
    bg: '#fff5f5',
    color: '#ef4444',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'Cancelled',
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.created;

  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

function StatCard({
  status,
  count,
}: {
  status: ShipmentStatus;
  count: number;
}) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #eeeff5',
        borderRadius: '14px',
        p: 2.5,
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: cfg.color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${cfg.color}22`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 0.75,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {cfg.label}
          </Typography>

          <Typography
            sx={{
              fontSize: '1.55rem',
              fontWeight: 800,
              color: '#1a1d2e',
              lineHeight: 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {count}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '13px',
            bgcolor: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Truck size={22} />
        </Box>
      </Stack>
    </Box>
  );
}

export default function ShipmentsPage() {
  const router = useRouter();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('created');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, [page, rowsPerPage, search, activeFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shipmentService.getShipments(
        page + 1,
        rowsPerPage,
        search
      );

      let filteredData = response.data || [];

      if (activeFilter !== 'all') {
        filteredData = filteredData.filter(
          (shipment) => shipment.status === activeFilter
        );
      }

      setShipments(filteredData);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      await shipmentService.deleteShipment(deletingId);
      showToastMessage('Shipment deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchShipments();
    } catch {
      showToastMessage('Failed to delete shipment', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenUpdateStatusDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setUpdateStatusDialogOpen(true);
  };

  const handleUpdateShipmentStatus = async () => {
    if (!selectedShipment) return;

    try {
      setIsUpdatingStatus(true);

      await shipmentService.updateShipmentStatus(selectedShipment.id, {
        status: newStatus,
      });

      setShipments((prev) =>
        prev.map((s) =>
          s.id === selectedShipment.id ? { ...s, status: newStatus } : s
        )
      );

      showToastMessage('Shipment status updated successfully', 'success');
      setUpdateStatusDialogOpen(false);
      setSelectedShipment(null);
    } catch {
      showToastMessage('Failed to update shipment status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statuses: ShipmentStatus[] = [
    'created',
    'shipped',
    'in_transit',
    'delivered',
    'cancelled',
  ];

  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = shipments.filter((shipment) => shipment.status === status).length;
    return acc;
  }, {} as Record<ShipmentStatus, number>);

  const columns: ITableColumn<Shipment>[] = [
    {
      key: 'shipment_no',
      label: 'Shipment',
      render: (row: Shipment) => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          onClick={() => router.push(`/shipments/${row.id}`)}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              bgcolor: '#f0f4ff',
              border: '1px solid #c7d2fe',
              color: '#4f63d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Truck size={14} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#4f63d2',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.3,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <HighlightedCell value={row.shipment_no} search={search} />
            </Typography>

            {row.tracking_no && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '0.02em',
                  mt: 0.25,
                }}
              >
                {row.tracking_no}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: 'carrier',
      label: 'Carrier',
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            color: row.carrier ? '#6b7280' : '#d1d5db',
          }}
        >
          <HighlightedCell value={row.carrier || '—'} search={search} />
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Shipment) => <StatusBadge status={row.status} />,
    },
    {
      key: 'ship_date',
      label: 'Ship date',
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontFamily: "'DM Mono', monospace",
            color: '#6b7280',
          }}
        >
          {dayjs(row.ship_date).format('DD MMM YYYY')}
        </Typography>
      ),
    },
    {
      key: 'shipping_charges',
      label: 'Charges',
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontFamily: "'DM Mono', monospace",
            color: '#1a1d2e',
            fontWeight: 700,
          }}
        >
          ₹{row.shipping_charges?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      key: 'action' as any,
      label: '',
      render: (row: Shipment) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.15s ease',
            justifyContent: 'flex-end',
            '.MuiTableRow-root:hover &': { opacity: 1 },
          }}
        >
          <Tooltip title="Update status" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenUpdateStatusDialog(row)}
              sx={actionButtonSx('#7c3aed', '#f3eeff', '#ddd6fe')}
            >
              <CheckCircle size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View shipment" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/shipments/${row.id}`)}
              sx={actionButtonSx('#4f63d2', '#f0f4ff', '#c7d2fe')}
            >
              <Eye size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit shipment" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/shipments/${row.id}/edit`)}
              sx={actionButtonSx('#059669', '#ecfdf5', '#a7f3d0')}
            >
              <Edit size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete shipment" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row.id)}
              sx={actionButtonSx('#ef4444', '#fef2f2', '#fecaca')}
            >
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <BBLoader enabled={loading} />

      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f0f0f5',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <Truck size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#1a1d2e',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.4px',
                  lineHeight: 1.15,
                }}
              >
                Shipments
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {total} shipment{total !== 1 ? 's' : ''} in system
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            onClick={() => router.push('/shipments/create')}
            startIcon={<Plus size={16} />}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Create Shipment
          </BBButton>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: 2,
        }}
      >
        {statuses.map((s) => (
          <StatCard key={s} status={s} count={statusCounts[s] || 0} />
        ))}
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mx: 3,
            mt: 2.5,
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: '14px 14px 0 0',
          border: '1px solid #eeeff5',
          borderBottom: 'none',
          bgcolor: '#ffffff',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 380 }}>
          <Box
            sx={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search size={15} />
          </Box>

          <InputBase
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by shipment number or tracking…"
            sx={{
              width: '100%',
              pl: 4.5,
              pr: 1.5,
              py: 1,
              fontSize: '0.8125rem',
              fontFamily: "'DM Sans', sans-serif",
              color: '#1a1d2e',
              bgcolor: '#f8f9fc',
              border: '1px solid #e8eaf0',
              borderRadius: '10px',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#c7d2fe' },
              '&.Mui-focused': {
                bgcolor: '#ffffff',
                borderColor: '#6366f1',
                boxShadow: '0 0 0 3px rgba(99,102,241,0.08)',
              },
              '& ::placeholder': { color: '#9ca3af' },
            }}
          />
        </Box>

        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.key}
              size="small"
              onClick={() => {
                setActiveFilter(tab.key);
                setPage(0);
              }}
              sx={{
                borderRadius: '9px',
                px: 1.75,
                py: 0.65,
                fontSize: '0.8rem',
                fontWeight: activeFilter === tab.key ? 700 : 600,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'none',
                color: activeFilter === tab.key ? '#4f63d2' : '#9ca3af',
                bgcolor: activeFilter === tab.key ? '#f0f4ff' : 'transparent',
                border:
                  activeFilter === tab.key
                    ? '1px solid #c7d2fe'
                    : '1px solid transparent',
                '&:hover': {
                  bgcolor: activeFilter === tab.key ? '#e0e7ff' : '#f8fbff',
                },
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {search && (
          <Chip
            label={`${shipments.length} result${shipments.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
            }}
          />
        )}
      </Box>

      {/* Table */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: '0 0 14px 14px',
          border: '1px solid #eeeff5',
          borderTop: 'none',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        {shipments.length === 0 && !loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                bgcolor: '#f0f4ff',
                border: '1px solid #c7d2fe',
                color: '#4f63d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={24} />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#1a1d2e',
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 0.5,
                }}
              >
                {search ? 'No shipments found' : 'No shipments yet'}
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {search
                  ? `No results for "${search}"`
                  : 'Create your first shipment to get started'}
              </Typography>
            </Box>

            {!search && (
              <BBButton
                variant="contained"
                onClick={() => router.push('/shipments/create')}
                startIcon={<Plus size={16} />}
                sx={{
                  mt: 0.5,
                  borderRadius: '11px',
                  textTransform: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  background:
                    'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                }}
              >
                Create Shipment
              </BBButton>
            )}
          </Box>
        ) : (
          <BBTable
            columns={columns}
            data={shipments}
            pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(0);
            }}
            sx={{
              '& .MuiTableHead-root .MuiTableCell-root': {
                bgcolor: '#f8fbff',
                color: '#6b7280',
                fontWeight: 600,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: '1px solid #eeeff5',
                py: 1.5,
              },
              '& .MuiTableBody-root .MuiTableRow-root': {
                cursor: 'pointer',
                transition: 'background 0.12s ease',
                '&:hover': { bgcolor: '#f8fbff' },
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                borderBottom: '1px solid #f5f5fa',
                py: 1.5,
                fontFamily: "'DM Sans', sans-serif",
              },
              '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
                borderBottom: 'none',
              },
            }}
          />
        )}
      </Box>

      {/* Delete dialog */}
      <BBDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        title="Delete Shipment"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                bgcolor: '#fff5f5',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Trash2 size={16} color="#ef4444" />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#991b1b',
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.5,
                  }}
                >
                  This action cannot be undone
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: '#b91c1c',
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  This shipment and all associated tracking information will be
                  permanently removed from the system.
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Are you sure you want to permanently delete this shipment?
            </Typography>
          </Box>
        }
        onConfirm={handleConfirmDelete}
        confirmText={deleting ? 'Deleting…' : 'Delete Shipment'}
        cancelText="Keep Shipment"
        confirmColor="error"
      />

      {/* Status Update dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={() => setUpdateStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e8eaf0',
            boxShadow: '0 20px 60px rgba(79,99,210,0.15)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
            borderRadius: '16px 16px 0 0',
          }}
        />

        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Update Shipment Status
          {selectedShipment && (
            <Typography
              component="div"
              sx={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: 500,
                mt: 0.5,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {selectedShipment.shipment_no}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            {selectedShipment && (
              <Box>
                <Typography sx={dialogLabelSx}>Current Status</Typography>
                <StatusBadge status={selectedShipment.status as ShipmentStatus} />
              </Box>
            )}

            <Box>
              <Typography sx={dialogLabelSx}>New Status</Typography>
              <Select
                fullWidth
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                size="small"
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8125rem',
                  borderRadius: '10px',
                  bgcolor: '#f8f9fc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#eeeff5',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c7d2fe',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                  },
                }}
              >
                {(
                  Object.entries(STATUS_CONFIG) as [
                    ShipmentStatus,
                    (typeof STATUS_CONFIG)[ShipmentStatus]
                  ][]
                ).map(([value, cfg]) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: cfg.dot,
                        }}
                      />
                      {cfg.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setUpdateStatusDialogOpen(false)}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: '#6b7280',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpdateShipmentStatus}
            disabled={
              isUpdatingStatus ||
              !newStatus ||
              newStatus === selectedShipment?.status
            }
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              px: 2.5,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
              },
            }}
          >
            {isUpdatingStatus ? 'Updating…' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const actionButtonSx = (color: string, bg: string, border: string) => ({
  width: 30,
  height: 30,
  borderRadius: '8px',
  color,
  bgcolor: bg,
  border: `1px solid ${border}`,
  '&:hover': {
    bgcolor: bg,
    borderColor: border,
    color,
    transform: 'scale(1.05)',
  },
  transition: 'all 0.15s ease',
});

const dialogLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 800,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontFamily: "'DM Sans', sans-serif",
  mb: 0.875,
};
