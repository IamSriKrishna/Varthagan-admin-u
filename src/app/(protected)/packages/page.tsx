'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from 'next/navigation';
import { usePackage } from '@/hooks/usePackage';
import { apiService } from '@/lib/api/api.service';

interface PackageRow {
  id: string;
  package_slip_no?: string;
  sales_order_id?: string;
  sales_order_no?: string;
  customer?: { display_name: string };
  package_date?: string;
  sales_order_date?: string;
  status?: string;
  total_items?: number;
}

interface PackageColumn {
  status: string;
  title: string;
  accent: string;
  bg: string;
  dot: string;
  border: string;
  packages: PackageRow[];
}

const STATUS_CONFIG: Record<
  string,
  { title: string; accent: string; bg: string; dot: string; border: string }
> = {
  draft: {
    title: 'Draft',
    accent: '#6b7280',
    bg: '#f8f9fc',
    dot: '#9ca3af',
    border: '#eeeff5',
  },
  created: {
    title: 'Created',
    accent: '#4f63d2',
    bg: '#f0f4ff',
    dot: '#4f63d2',
    border: '#c7d2fe',
  },
  packed: {
    title: 'Packed',
    accent: '#7c3aed',
    bg: '#f3eeff',
    dot: '#7c3aed',
    border: '#ddd6fe',
  },
  confirmed: {
    title: 'Confirmed',
    accent: '#d97706',
    bg: '#fff8eb',
    dot: '#f59e0b',
    border: '#fcd34d',
  },
  processing: {
    title: 'Processing',
    accent: '#4f63d2',
    bg: '#f0f4ff',
    dot: '#6366f1',
    border: '#c7d2fe',
  },
  shipped: {
    title: 'Shipped',
    accent: '#0369a1',
    bg: '#e0f2fe',
    dot: '#0ea5e9',
    border: '#bae6fd',
  },
  delivered: {
    title: 'Delivered',
    accent: '#15803d',
    bg: '#f0fdf6',
    dot: '#16a34a',
    border: '#6ddc98',
  },
  cancelled: {
    title: 'Cancelled',
    accent: '#ef4444',
    bg: '#fff5f5',
    dot: '#ef4444',
    border: '#fecaca',
  },
};

const STATUS_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): [string, string] {
  const palettes: [string, string][] = [
    ['#e8edff', '#3d52c7'],
    ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'],
    ['#fff3cd', '#92400e'],
    ['#ede9fe', '#6d28d9'],
    ['#fee2e2', '#991b1b'],
    ['#e0f2fe', '#0369a1'],
  ];

  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % palettes.length;
  }
  return palettes[Math.abs(h)];
}

export default function PackagesPage() {
  const router = useRouter();
  const { getPackages, deletePackage, loading, error } = usePackage();

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    id?: string;
    currentStatus?: string;
  }>({ open: false });
  const [newStatus, setNewStatus] = useState('');
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<{
    el: HTMLElement | null;
    status: string;
  }>({ el: null, status: '' });
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const loadPackages = async () => {
    try {
      const response = await getPackages(1, 100, searchQuery);
      let packagesData: PackageRow[] = [];

      if (Array.isArray(response)) {
        packagesData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray((response as any).data)) packagesData = (response as any).data;
        else if (Array.isArray((response as any).packages)) {
          packagesData = (response as any).packages;
        }
      }

      setPackages(packagesData);
    } catch (err) {
      console.error('Failed to load packages:', err);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await deletePackage(deleteDialog.id);
      setDeleteDialog({ open: false });
      await loadPackages();
    } catch (err) {
      console.error('Failed to delete package:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateStatusDialog.id || !newStatus) return;

    try {
      await apiService.patch(`/packages/${updateStatusDialog.id}/status`, {
        status: newStatus,
      });
      setUpdateStatusDialog({ open: false });
      setNewStatus('');
      await loadPackages();
    } catch (err) {
      console.error('Failed to update package status:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to update status'}`);
    }
  };

  const handleCheckboxChange = (id: string) => {
    const next = new Set(selectedPackages);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedPackages(next);
  };

  const kanbanColumns = useMemo<PackageColumn[]>(() => {
    const statuses = [...new Set(packages.map((p) => p.status || 'draft'))];

    return statuses.map((status) => ({
      status,
      ...(STATUS_CONFIG[status] ?? {
        title: status.charAt(0).toUpperCase() + status.slice(1),
        accent: '#6b7280',
        bg: '#f8f9fc',
        dot: '#9ca3af',
        border: '#eeeff5',
      }),
      packages: packages.filter((p) => (p.status || 'draft') === status),
    }));
  }, [packages]);

  const totalSelected = selectedPackages.size;
  const totalPackages = packages.length;

  const summaryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    packages.forEach((pkg) => {
      const status = pkg.status || 'draft';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [packages]);

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <InventoryIcon sx={{ color: '#ffffff', fontSize: 23 }} />
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
                Packages
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalPackages} total · Track outgoing shipments
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '17px !important' }} />}
            onClick={() => router.push('/packages/package/new')}
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
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            New Package
          </Button>
        </Stack>
      </Box>

      {/* Summary */}
      {!loading && packages.length > 0 && (
        <Box
          sx={{
            mx: 3,
            mt: 2.5,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = summaryStats[key] || 0;

            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.85,
                  borderRadius: '10px',
                  bgcolor: count > 0 ? cfg.bg : '#ffffff',
                  border: `1px solid ${count > 0 ? cfg.border : '#eeeff5'}`,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: cfg.dot,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {cfg.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: count > 0 ? cfg.accent : '#d1d5db',
                    fontWeight: 800,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: packages.length > 0 ? '14px 14px 0 0' : '14px',
          border: '1px solid #eeeff5',
          borderBottom: packages.length > 0 ? 'none' : '1px solid #eeeff5',
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
          <TextField
            size="small"
            placeholder="Search packages…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadPackages()}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', fontSize: 17 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: '10px',
                bgcolor: '#f8f9fc',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8125rem',
                '& fieldset': { borderColor: '#e8eaf0' },
                '&:hover fieldset': { borderColor: '#c7d2fe' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Filter" arrow>
            <IconButton
              sx={{
                width: 38,
                height: 38,
                borderRadius: '9px',
                color: '#6b7280',
                border: '1px solid #eeeff5',
                '&:hover': { bgcolor: '#f8fbff', borderColor: '#c7d2fe' },
              }}
            >
              <FilterListIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: 'flex',
              border: '1px solid #eeeff5',
              borderRadius: '9px',
              overflow: 'hidden',
              bgcolor: '#f8f9fc',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                borderRadius: 0,
                px: 1.1,
                py: 0.7,
                bgcolor: viewMode === 'list' ? '#f0f4ff' : 'transparent',
                color: viewMode === 'list' ? '#4f63d2' : '#9ca3af',
              }}
            >
              <ViewListIcon sx={{ fontSize: 17 }} />
            </IconButton>

            <Box sx={{ width: 1, bgcolor: '#eeeff5' }} />

            <IconButton
              size="small"
              onClick={() => setViewMode('kanban')}
              sx={{
                borderRadius: 0,
                px: 1.1,
                py: 0.7,
                bgcolor: viewMode === 'kanban' ? '#f0f4ff' : 'transparent',
                color: viewMode === 'kanban' ? '#4f63d2' : '#9ca3af',
              }}
            >
              <ViewModuleIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {/* Selected bar */}
      {totalSelected > 0 && (
        <Box
          sx={{
            mx: 3,
            mt: 2,
            px: 2,
            py: 1.25,
            bgcolor: '#f0f4ff',
            border: '1px solid #c7d2fe',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#4f63d2',
            }}
          >
            {totalSelected} package{totalSelected > 1 ? 's' : ''} selected
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialog({ open: true, id: [...selectedPackages][0] })}
            sx={{
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '8px',
            }}
          >
            Delete selected
          </Button>

          <Button
            size="small"
            onClick={() => setSelectedPackages(new Set())}
            sx={{
              textTransform: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#4f63d2',
            }}
          >
            Clear
          </Button>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            mx: 3,
            mt: 2,
            p: 2,
            bgcolor: '#fff5f5',
            border: '1px solid #fee2e2',
            borderRadius: '12px',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {error}
          </Typography>
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: '0 0 14px 14px',
          border: packages.length > 0 ? '1px solid #eeeff5' : 'none',
          borderTop: packages.length > 0 ? 'none' : 'none',
          bgcolor: packages.length > 0 ? '#ffffff' : 'transparent',
          overflow: 'hidden',
          boxShadow: packages.length > 0 ? '0 4px 24px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress size={32} thickness={3} sx={{ color: '#6366f1' }} />
            <Typography
              sx={{
                mt: 2,
                fontFamily: "'DM Sans', sans-serif",
                color: '#9ca3af',
                fontSize: '0.875rem',
              }}
            >
              Loading packages…
            </Typography>
          </Box>
        ) : packages.length === 0 ? (
          <Box
            sx={{
              p: { xs: 6, md: 10 },
              textAlign: 'center',
              bgcolor: '#ffffff',
              borderRadius: '14px',
              border: '1px dashed #c7d2fe',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            }}
          >
            <InventoryIcon sx={{ color: '#d1d5db', fontSize: 46 }} />
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                color: '#1a1d2e',
                mt: 2,
              }}
            >
              No packages yet
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#9ca3af',
                fontSize: '0.875rem',
                mt: 0.75,
                mb: 3,
              }}
            >
              Create your first package to start tracking outgoing shipments.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/packages/package/new')}
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Create Package
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: 2,
              p: 2,
              alignItems: 'start',
            }}
          >
            {kanbanColumns.map((col) => (
              <Box
                key={col.status}
                sx={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: `1px solid ${col.border}`,
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: col.bg,
                    borderBottom: `1px solid ${col.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: col.dot,
                      }}
                    />

                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 800,
                        color: '#1a1d2e',
                        fontSize: '0.875rem',
                      }}
                    >
                      {col.title}
                    </Typography>

                    <Chip
                      label={col.packages.length}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 24,
                        bgcolor: '#ffffff',
                        color: col.accent,
                        border: `1px solid ${col.border}`,
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  <IconButton
                    size="small"
                    sx={{
                      color: '#9ca3af',
                      p: 0.5,
                      borderRadius: '7px',
                      '&:hover': { bgcolor: `${col.dot}14`, color: col.accent },
                    }}
                    onClick={(e) => setColumnMenuAnchor({ el: e.currentTarget, status: col.status })}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <Box sx={{ bgcolor: '#ffffff' }}>
                  {col.packages.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 180,
                        gap: 1.25,
                        py: 4,
                      }}
                    >
                      <LocalShippingOutlinedIcon sx={{ fontSize: 28, color: '#d1d5db' }} />
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#9ca3af',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        No packages here
                      </Typography>
                    </Box>
                  ) : (
                    col.packages.map((pkg, idx) => {
                      const name = pkg.customer?.display_name || 'Unknown';
                      const [avatarBg, avatarFg] = getAvatarColor(name);
                      const isLast = idx === col.packages.length - 1;

                      return (
                        <Box
                          key={pkg.id}
                          onClick={() => router.push(`/packages/package/${pkg.id}`)}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            px: 2,
                            py: 1.75,
                            borderBottom: !isLast ? '1px solid #f5f5fa' : 'none',
                            cursor: 'pointer',
                            gap: 1.5,
                            transition: 'background 0.15s ease',
                            '&:hover': {
                              bgcolor: '#f8fbff',
                              '& .row-actions': { opacity: 1 },
                            },
                          }}
                        >
                          <Checkbox
                            checked={selectedPackages.has(pkg.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(pkg.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            sx={{
                              p: 0,
                              mt: 0.5,
                              color: '#d1d5db',
                              flexShrink: 0,
                              '&.Mui-checked': { color: col.accent },
                            }}
                          />

                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '10px',
                              flexShrink: 0,
                              mt: 0.1,
                              bgcolor: avatarBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1.5px solid ${avatarFg}33`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                color: avatarFg,
                              }}
                            >
                              {getInitials(name)}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 700,
                                color: '#1a1d2e',
                                fontSize: '0.8125rem',
                                mb: 0.25,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {name}
                            </Typography>

                            <Stack direction="row" alignItems="center" gap={0.6} mb={0.3} flexWrap="wrap">
                              <Chip
                                label={pkg.package_slip_no || pkg.sales_order_no || '—'}
                                size="small"
                                sx={{
                                  height: 22,
                                  bgcolor: col.bg,
                                  color: col.accent,
                                  border: `1px solid ${col.border}`,
                                  borderRadius: '6px',
                                  fontFamily: "'DM Mono', monospace",
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                }}
                              />

                              {(pkg.sales_order_no || pkg.sales_order_id) && (
                                <Typography
                                  sx={{
                                    fontFamily: "'DM Mono', monospace",
                                    color: '#9ca3af',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  · {pkg.sales_order_no || pkg.sales_order_id}
                                </Typography>
                              )}
                            </Stack>

                            <Typography
                              sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: '#9ca3af',
                                fontSize: '0.7rem',
                              }}
                            >
                              {pkg.package_date
                                ? new Date(pkg.package_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : pkg.sales_order_date
                                  ? new Date(pkg.sales_order_date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'}
                            </Typography>
                          </Box>

                          {pkg.total_items !== undefined && (
                            <Box sx={{ flexShrink: 0, textAlign: 'right', mt: 0.15 }}>
                              <Typography
                                sx={{
                                  fontFamily: "'DM Mono', monospace",
                                  fontWeight: 800,
                                  color: '#1a1d2e',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.2,
                                }}
                              >
                                {pkg.total_items}
                              </Typography>

                              <Typography
                                sx={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  color: '#9ca3af',
                                  fontSize: '0.67rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                items
                              </Typography>
                            </Box>
                          )}

                          <Tooltip title="Update status" arrow>
                            <IconButton
                              size="small"
                              className="row-actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdateStatusDialog({
                                  open: true,
                                  id: pkg.id,
                                  currentStatus: pkg.status,
                                });
                                setNewStatus(pkg.status || 'created');
                              }}
                              sx={{
                                opacity: 0,
                                flexShrink: 0,
                                color: col.accent,
                                p: 0.5,
                                borderRadius: '7px',
                                '&:hover': { bgcolor: `${col.dot}14` },
                              }}
                            >
                              <Typography sx={{ fontSize: '0.9rem' }}>✎</Typography>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      );
                    })
                  )}
                </Box>

                <Box
                  onClick={() => router.push('/packages/package/new')}
                  sx={{
                    px: 2,
                    py: 1.1,
                    bgcolor: col.bg,
                    borderTop: `1px solid ${col.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fbff' },
                  }}
                >
                  <AddIcon sx={{ fontSize: 14, color: col.accent }} />
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.78rem',
                      color: col.accent,
                      fontWeight: 700,
                    }}
                  >
                    Add package
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={columnMenuAnchor.el}
        open={Boolean(columnMenuAnchor.el)}
        onClose={() => setColumnMenuAnchor({ el: null, status: '' })}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(15,23,42,0.1)',
            border: '1px solid #eeeff5',
            minWidth: 158,
            fontFamily: "'DM Sans', sans-serif",
            py: 0.5,
          },
        }}
      >
        {['Sort by date', 'Sort by customer', 'Filter this column'].map((label) => (
          <MenuItem
            key={label}
            onClick={() => setColumnMenuAnchor({ el: null, status: '' })}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.845rem',
              color: '#374151',
              borderRadius: '8px',
              mx: 0.5,
              my: 0.2,
              px: 1.5,
              py: 0.9,
              '&:hover': { bgcolor: '#f0f4ff', color: '#4f63d2' },
            }}
          >
            {label}
          </MenuItem>
        ))}

        <Box sx={{ my: 0.5, mx: 1.5, height: 1, bgcolor: '#f0f0f5' }} />

        <MenuItem
          onClick={() => setColumnMenuAnchor({ el: null, status: '' })}
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.845rem',
            color: '#ef4444',
            borderRadius: '8px',
            mx: 0.5,
            my: 0.2,
            px: 1.5,
            py: 0.9,
            '&:hover': { bgcolor: '#fef2f2' },
          }}
        >
          Collapse column
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Delete Package
        </DialogTitle>

        <DialogContent>
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
              <Typography sx={{ fontSize: '1rem' }}>🗑</Typography>
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
                The package will be permanently deleted.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false })}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            }}
          >
            Delete Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialog.open}
        onClose={() => setUpdateStatusDialog({ open: false })}
        maxWidth="xs"
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
          Update Package Status
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: 1.65,
              mb: 2.5,
            }}
          >
            Select a new status for this package.
          </Typography>

          <TextField
            select
            fullWidth
            label="Package Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#eeeff5' },
                '&:hover fieldset': { borderColor: '#c7d2fe' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
              },
              '& .MuiInputLabel-root': {
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setUpdateStatusDialog({ open: false });
              setNewStatus('');
            }}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={!newStatus}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
              },
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
