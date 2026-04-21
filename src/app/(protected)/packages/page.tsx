'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  InputAdornment,
  Checkbox,
  alpha,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Badge,
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

const STATUS_CONFIG: Record<string, { title: string; accent: string; bg: string; dot: string; border: string }> = {
  draft:      { title: 'Draft',      accent: '#64748b', bg: '#f8fafc', dot: '#94a3b8', border: '#e2e8f0' },
  confirmed:  { title: 'Confirmed',  accent: '#d97706', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
  processing: { title: 'Processing', accent: '#4f46e5', bg: '#eef2ff', dot: '#6366f1', border: '#c7d2fe' },
  shipped:    { title: 'Shipped',    accent: '#0284c7', bg: '#f0f9ff', dot: '#0ea5e9', border: '#bae6fd' },
  delivered:  { title: 'Delivered',  accent: '#059669', bg: '#ecfdf5', dot: '#10b981', border: '#a7f3d0' },
  cancelled:  { title: 'Cancelled',  accent: '#dc2626', bg: '#fef2f2', dot: '#ef4444', border: '#fecaca' },
};

const STATUS_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getAvatarColor(name: string): [string, string] {
  const palettes: [string, string][] = [
    ['#e0e7ff', '#4f46e5'], ['#fce7f3', '#be185d'], ['#d1fae5', '#065f46'],
    ['#fef3c7', '#92400e'], ['#ede9fe', '#6d28d9'], ['#ffedd5', '#c2410c'],
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palettes.length;
  return palettes[Math.abs(h)];
}

export default function PackagesPage() {
  const router = useRouter();
  const { getPackages, deletePackage, loading, error } = usePackage();

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false });
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{ open: boolean; id?: string; currentStatus?: string }>({ open: false });
  const [newStatus, setNewStatus] = useState('');
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<{ el: HTMLElement | null; status: string }>({ el: null, status: '' });
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    try {
      const response = await getPackages(1, 100, searchQuery);
      let packagesData: PackageRow[] = [];
      if (Array.isArray(response)) packagesData = response;
      else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) packagesData = response.data;
        else if (Array.isArray(response.packages)) packagesData = response.packages;
      }
      setPackages(packagesData);
    } catch (err) { console.error('Failed to load packages:', err); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deletePackage(deleteDialog.id);
      setDeleteDialog({ open: false });
      loadPackages();
    } catch (err) { console.error('Failed to delete package:', err); }
  };

  const handleUpdateStatus = async () => {
    if (!updateStatusDialog.id || !newStatus) return;
    try {
      await apiService.patch(`/packages/${updateStatusDialog.id}/status`, { status: newStatus });
      setUpdateStatusDialog({ open: false });
      setNewStatus('');
      loadPackages();
    } catch (err) {
      console.error('Failed to update package status:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to update status'}`);
    }
  };

  const handleCheckboxChange = (id: string) => {
    const s = new Set(selectedPackages);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedPackages(s);
  };

  const kanbanColumns = useMemo<PackageColumn[]>(() => {
    const statuses = [...new Set(packages.map(p => p.status || 'draft'))];
    return statuses.map(status => ({
      status,
      ...(STATUS_CONFIG[status] ?? { title: status.charAt(0).toUpperCase() + status.slice(1), accent: '#6b7280', bg: '#f9fafb', dot: '#9ca3af', border: '#e5e7eb' }),
      packages: packages.filter(p => (p.status || 'draft') === status),
    }));
  }, [packages]);

  const totalSelected = selectedPackages.size;
  const totalPackages = packages.length;

  const summaryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    packages.forEach(p => {
      const s = p.status || 'draft';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [packages]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f2f8', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .pkg-card {
          animation: fadeSlideUp 0.3s ease both;
        }
        .pkg-card:nth-child(1) { animation-delay: 0.05s; }
        .pkg-card:nth-child(2) { animation-delay: 0.1s; }
        .pkg-card:nth-child(3) { animation-delay: 0.15s; }
        .pkg-card:nth-child(4) { animation-delay: 0.2s; }
        .pkg-card:nth-child(5) { animation-delay: 0.25s; }
        .pkg-card:nth-child(6) { animation-delay: 0.3s; }

        .package-row {
          position: relative;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .package-row:hover {
          transform: translateX(2px);
        }
        .package-row .row-actions {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .package-row:hover .row-actions {
          opacity: 1;
        }
      `}</style>

      {/* ═══ Sticky Page Header ═══ */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #7c3aed 100%)',
        boxShadow: '0 4px 24px rgba(79,70,229,0.25)',
      }}>
        {/* Subtle noise overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }} />

        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.25, position: 'relative', zIndex: 1 }}>

            {/* Left: Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                <InventoryIcon sx={{ color: 'white', fontSize: 21 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '1.15rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Packages
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.76rem', color: 'rgba(255,255,255,0.68)', fontWeight: 400 }}>
                  {totalPackages} total · Track outgoing shipments
                </Typography>
              </Box>
            </Box>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {/* Search */}
              <TextField
                size="small"
                placeholder="Search packages…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadPackages()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 17 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: '"DM Sans"',
                    fontSize: '0.845rem',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.22)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.65)', borderWidth: '1.5px' },
                    '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                    '& input': { color: 'white' },
                  },
                }}
              />

              {/* Filter */}
              <Tooltip title="Filter">
                <IconButton sx={{
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  width: 36, height: 36,
                  color: 'rgba(255,255,255,0.75)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' },
                }}>
                  <FilterListIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              {/* View toggle */}
              <Box sx={{
                display: 'flex',
                border: '1.5px solid rgba(255,255,255,0.22)',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }}>
                <IconButton size="small" onClick={() => setViewMode('list')} sx={{
                  borderRadius: 0, px: 1.1, py: 0.65,
                  backgroundColor: viewMode === 'list' ? 'rgba(255,255,255,0.22)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}>
                  <ViewListIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <Box sx={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.18)' }} />
                <IconButton size="small" onClick={() => setViewMode('kanban')} sx={{
                  borderRadius: 0, px: 1.1, py: 0.65,
                  backgroundColor: viewMode === 'kanban' ? 'rgba(255,255,255,0.22)' : 'transparent',
                  color: viewMode === 'kanban' ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}>
                  <ViewModuleIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Box>

              {/* New button */}
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '17px !important' }} />}
                onClick={() => router.push('/packages/package/new')}
                sx={{
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  textTransform: 'none',
                  fontFamily: '"DM Sans"',
                  fontWeight: 700,
                  fontSize: '0.845rem',
                  borderRadius: '10px',
                  px: 2.25,
                  py: 0.85,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  letterSpacing: '-0.01em',
                  '&:hover': {
                    backgroundColor: '#eef2ff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                New Package
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══ Summary Stats Strip ═══ */}
      {!loading && packages.length > 0 && (
        <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e8eaf0' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', gap: 0, overflowX: 'auto', py: 0 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = summaryStats[key] || 0;
                return (
                  <Box key={key} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.5,
                    borderRight: '1px solid #f0f0f5',
                    minWidth: 'fit-content',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    '&:hover': { backgroundColor: '#fafbff' },
                    '&:last-child': { borderRight: 'none' },
                  }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {cfg.title}
                    </Typography>
                    <Typography sx={{ fontFamily: '"DM Mono"', fontSize: '0.8rem', color: count > 0 ? cfg.accent : '#cbd5e1', fontWeight: 600 }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}

      {/* ═══ Main Content ═══ */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 3 }}>

        {/* Selection bar */}
        {totalSelected > 0 && (
          <Box sx={{
            mb: 2.5, px: 2.25, py: 1.25,
            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
            border: '1.5px solid #c7d2fe',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: 2,
            boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6366f1' }} />
            <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.845rem', color: '#4338ca' }}>
              {totalSelected} package{totalSelected > 1 ? 's' : ''} selected
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button size="small" color="error" variant="outlined" sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontSize: '0.8rem', fontWeight: 600,
              borderRadius: '8px', py: 0.4, borderColor: '#fca5a5', color: '#dc2626',
              '&:hover': { backgroundColor: '#fef2f2', borderColor: '#f87171' },
            }} onClick={() => setDeleteDialog({ open: true, id: [...selectedPackages][0] })}>
              Delete selected
            </Button>
            <Button size="small" sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontSize: '0.8rem', fontWeight: 500,
              color: '#6366f1', borderRadius: '8px', py: 0.4,
            }} onClick={() => setSelectedPackages(new Set())}>
              Clear selection
            </Button>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '1rem' }}>⚠️</Typography>
            <Typography sx={{ fontFamily: '"DM Sans"', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>{error}</Typography>
          </Box>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress size={32} thickness={3} sx={{ color: '#6366f1' }} />
            <Typography sx={{ mt: 2, fontFamily: '"DM Sans"', color: '#94a3b8', fontSize: '0.875rem' }}>Loading packages…</Typography>
          </Box>
        ) : packages.length === 0 ? (

          /* ─── Empty state ─── */
          <Box sx={{
            p: { xs: 6, md: 10 }, textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1.5px dashed #c7d2fe',
            boxShadow: '0 4px 24px rgba(99,102,241,0.06)',
          }}>
            <Box sx={{
              width: 68, height: 68, borderRadius: '20px',
              background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
              border: '1.5px solid #c7d2fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2.5,
              boxShadow: '0 4px 16px rgba(99,102,241,0.12)',
            }}>
              <InventoryIcon sx={{ color: '#6366f1', fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', mb: 0.75, letterSpacing: '-0.02em' }}>
              No packages yet
            </Typography>
            <Typography sx={{ fontFamily: '"DM Sans"', color: '#94a3b8', fontSize: '0.875rem', mb: 3.5, maxWidth: 320, mx: 'auto', lineHeight: 1.6 }}>
              Create your first package to start tracking outgoing shipments
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/packages/package/new')}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 700,
                borderRadius: '10px', px: 3.5, py: 1,
                boxShadow: '0 4px 16px rgba(99,102,241,0.32)',
                fontSize: '0.875rem', letterSpacing: '-0.01em',
                '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.42)', transform: 'translateY(-1px)' },
                transition: 'all 0.2s ease',
              }}>
              Create Package
            </Button>
          </Box>
        ) : (

          /* ─── Kanban ─── */
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
            {kanbanColumns.map((col, colIdx) => (
              <Box key={col.status} className="pkg-card" sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                border: `1px solid ${col.border}`,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: `0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.07)` },
              }}>
                {/* Column header */}
                <Box sx={{
                  px: 2.25, py: 1.5,
                  backgroundColor: col.bg,
                  borderBottom: `1.5px solid ${col.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Decorative gradient blob */}
                  <Box sx={{
                    position: 'absolute', right: -20, top: -20,
                    width: 60, height: 60, borderRadius: '50%',
                    backgroundColor: col.dot, opacity: 0.07,
                    filter: 'blur(12px)',
                    pointerEvents: 'none',
                  }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '8px',
                      backgroundColor: `${col.dot}18`,
                      border: `1px solid ${col.dot}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.dot }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', letterSpacing: '-0.01em' }}>
                      {col.title}
                    </Typography>
                    <Box sx={{
                      px: 1, py: 0.2, borderRadius: '6px',
                      backgroundColor: `${col.dot}15`,
                      border: `1px solid ${col.dot}25`,
                    }}>
                      <Typography sx={{ fontFamily: '"DM Mono"', fontSize: '0.72rem', fontWeight: 600, color: col.accent, lineHeight: 1.5 }}>
                        {col.packages.length}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small" sx={{ color: '#94a3b8', p: 0.5, borderRadius: '7px', '&:hover': { backgroundColor: `${col.dot}14`, color: col.accent } }}
                    onClick={(e) => setColumnMenuAnchor({ el: e.currentTarget, status: col.status })}>
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Column body */}
                <Box sx={{ backgroundColor: 'white' }}>
                  {col.packages.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 1.25, py: 4 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '12px',
                        backgroundColor: `${col.dot}10`,
                        border: `1.5px dashed ${col.dot}35`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: col.dot, opacity: 0.6 }} />
                      </Box>
                      <Typography sx={{ fontFamily: '"DM Sans"', color: '#c8d1e0', fontSize: '0.79rem', fontWeight: 500 }}>No packages here</Typography>
                    </Box>
                  ) : (
                    col.packages.map((pkg, idx) => {
                      const name = pkg.customer?.display_name || 'Unknown';
                      const [avatarBg, avatarFg] = getAvatarColor(name);
                      const isLast = idx === col.packages.length - 1;
                      return (
                        <Box
                          key={pkg.id}
                          className="package-row"
                          onClick={() => router.push(`/packages/package/${pkg.id}`)}
                          sx={{
                            display: 'flex', alignItems: 'flex-start',
                            px: 2, py: 1.75,
                            borderBottom: !isLast ? '1px solid #f4f6fb' : 'none',
                            cursor: 'pointer', gap: 1.5,
                            '&:hover': { backgroundColor: `${col.dot}05` },
                          }}
                        >
                          {/* Checkbox */}
                          <Checkbox
                            checked={selectedPackages.has(pkg.id)}
                            onChange={(e) => { e.stopPropagation(); handleCheckboxChange(pkg.id); }}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            sx={{ p: 0, mt: 0.5, color: '#e2e8f0', flexShrink: 0, '&.Mui-checked': { color: col.accent } }}
                          />

                          {/* Avatar */}
                          <Box sx={{
                            width: 34, height: 34, borderRadius: '10px', flexShrink: 0, mt: 0.1,
                            backgroundColor: avatarBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${avatarFg}20`,
                          }}>
                            <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.7rem', color: avatarFg, letterSpacing: '0.02em' }}>
                              {getInitials(name)}
                            </Typography>
                          </Box>

                          {/* Details */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 600, color: '#0f172a', fontSize: '0.845rem', mb: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                              {name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3, flexWrap: 'wrap' }}>
                              <Box sx={{ px: 0.75, py: 0.1, borderRadius: '5px', backgroundColor: `${col.dot}12` }}>
                                <Typography sx={{ fontFamily: '"DM Mono"', color: col.accent, fontWeight: 500, fontSize: '0.72rem' }}>
                                  {pkg.package_slip_no || pkg.sales_order_no || '—'}
                                </Typography>
                              </Box>
                              {(pkg.sales_order_no || pkg.sales_order_id) && (
                                <Typography sx={{ fontFamily: '"DM Mono"', color: '#b0bcd0', fontSize: '0.7rem' }}>
                                  · {pkg.sales_order_no || pkg.sales_order_id}
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ fontFamily: '"DM Sans"', color: '#b0bcd0', fontSize: '0.7rem', fontWeight: 400 }}>
                              {pkg.package_date
                                ? new Date(pkg.package_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : pkg.sales_order_date
                                ? new Date(pkg.sales_order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </Typography>
                          </Box>

                          {/* Items count */}
                          {pkg.total_items !== undefined && (
                            <Box sx={{ flexShrink: 0, textAlign: 'right', mt: 0.15 }}>
                              <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 600, color: '#1e293b', fontSize: '0.925rem', lineHeight: 1.2 }}>
                                {pkg.total_items}
                              </Typography>
                              <Typography sx={{ fontFamily: '"DM Sans"', color: '#c8d1e0', fontSize: '0.67rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                items
                              </Typography>
                            </Box>
                          )}

                          {/* Update status button */}
                          <Tooltip title="Update status">
                            <IconButton
                              size="small"
                              className="row-actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdateStatusDialog({ open: true, id: pkg.id, currentStatus: pkg.status });
                                setNewStatus(pkg.status || 'created');
                              }}
                              sx={{
                                flexShrink: 0,
                                color: col.accent,
                                p: 0.5,
                                borderRadius: '7px',
                                '&:hover': { backgroundColor: `${col.dot}14` },
                              }}>
                              <Typography sx={{ fontSize: '0.9rem' }}>✎</Typography>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* Column footer: "Add package" shortcut */}
                <Box sx={{
                  px: 2.25, py: 1.1,
                  backgroundColor: col.bg,
                  borderTop: `1px solid ${col.border}`,
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  cursor: 'pointer',
                  '&:hover .add-label': { color: col.accent },
                  '&:hover': { backgroundColor: `${col.dot}06` },
                  transition: 'background 0.15s',
                }} onClick={() => router.push('/packages/package/new')}>
                  <AddIcon sx={{ fontSize: 14, color: '#c8d1e0' }} />
                  <Typography className="add-label" sx={{ fontFamily: '"DM Sans"', fontSize: '0.78rem', color: '#c8d1e0', fontWeight: 500, transition: 'color 0.15s' }}>
                    Add package
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Column context menu */}
      <Menu
        anchorEl={columnMenuAnchor.el}
        open={Boolean(columnMenuAnchor.el)}
        onClose={() => setColumnMenuAnchor({ el: null, status: '' })}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #eef0f6',
            minWidth: 158,
            fontFamily: '"DM Sans"',
            py: 0.5,
          },
        }}>
        {['Sort by date', 'Sort by customer', 'Filter this column'].map(label => (
          <MenuItem key={label} onClick={() => setColumnMenuAnchor({ el: null, status: '' })}
            sx={{ fontFamily: '"DM Sans"', fontSize: '0.845rem', color: '#374151', borderRadius: '8px', mx: 0.5, my: 0.2, px: 1.5, py: 0.9, '&:hover': { backgroundColor: '#eef2ff', color: '#4f46e5' } }}>
            {label}
          </MenuItem>
        ))}
        <Box sx={{ my: 0.5, mx: 1.5, height: '1px', backgroundColor: '#f0f2f8' }} />
        <MenuItem onClick={() => setColumnMenuAnchor({ el: null, status: '' })}
          sx={{ fontFamily: '"DM Sans"', fontSize: '0.845rem', color: '#ef4444', borderRadius: '8px', mx: 0.5, my: 0.2, px: 1.5, py: 0.9, '&:hover': { backgroundColor: '#fef2f2' } }}>
          Collapse column
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        PaperProps={{
          sx: {
            borderRadius: '18px', width: '100%', maxWidth: 400,
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            border: '1px solid #f0f2f8',
          },
        }}>
        <DialogTitle sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '1rem', color: '#0f172a', pt: 3, pb: 1, letterSpacing: '-0.02em' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>🗑</Typography>
            </Box>
            Delete Package
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 1.5 }}>
          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65 }}>
            Are you sure you want to delete this package? This action is <strong style={{ color: '#dc2626', fontWeight: 600 }}>permanent</strong> and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setDeleteDialog({ open: false })}
            sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600, borderRadius: '9px',
              borderColor: '#e2e8f0', color: '#374151', fontSize: '0.845rem',
              '&:hover': { borderColor: '#c7d2fe', backgroundColor: '#f8faff', color: '#4f46e5' },
            }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleDelete}
            sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 700, borderRadius: '9px',
              fontSize: '0.845rem', backgroundColor: '#ef4444',
              boxShadow: '0 4px 12px rgba(239,68,68,0.28)',
              '&:hover': { backgroundColor: '#dc2626', boxShadow: '0 6px 16px rgba(239,68,68,0.36)' },
            }}>
            Delete Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialog.open}
        onClose={() => setUpdateStatusDialog({ open: false })}
        PaperProps={{
          sx: {
            borderRadius: '18px', width: '100%', maxWidth: 450,
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            border: '1px solid #f0f2f8',
          },
        }}>
        <DialogTitle sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '1rem', color: '#0f172a', pt: 3, pb: 1, letterSpacing: '-0.02em' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#eef2ff', border: '1.5px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>📦</Typography>
            </Box>
            Update Package Status
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, mb: 2.5 }}>
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
                fontFamily: '"DM Sans"',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#c7d2fe' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
              },
              '& .MuiOutlinedInput-input': {
                fontFamily: '"DM Sans"',
                fontSize: '0.875rem',
              },
            }}>
            {STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value} sx={{ fontFamily: '"DM Sans"', fontSize: '0.875rem' }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => { setUpdateStatusDialog({ open: false }); setNewStatus(''); }}
            sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600, borderRadius: '9px',
              borderColor: '#e2e8f0', color: '#374151', fontSize: '0.845rem',
              '&:hover': { borderColor: '#c7d2fe', backgroundColor: '#f8faff', color: '#4f46e5' },
            }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleUpdateStatus} disabled={!newStatus}
            sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 700, borderRadius: '9px',
              fontSize: '0.845rem', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.28)',
              '&:hover': { boxShadow: '0 6px 16px rgba(99,102,241,0.36)' },
              '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
            }}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}