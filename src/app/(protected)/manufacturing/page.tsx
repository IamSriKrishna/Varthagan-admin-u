'use client';

import {
  Box, Button, Chip, Collapse, Grid, IconButton, Stack,
  Typography, Avatar, Tooltip, Paper,
} from '@mui/material';
import {
  Plus, RefreshCw, Search, SlidersHorizontal, ChevronDown,
  ChevronLeft, ChevronRight, Factory, X, Filter,
  PencilLine, Trash2, Clock, Activity, CheckCircle2,
  Package2, Layers, BarChart3, Zap, Sparkles, BoxSelect,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ManufacturerForm from '@/components/manufacturing/ManufacturerForm';
import { manufacturerService } from '@/lib/api/manufacturerService';
import { Manufacturer, CreateManufacturerRequest } from '@/models/manufacturer.model';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  pageBg: '#F7F8FC',
  cardBg: '#FFFFFF',
  subtleBg: '#F4F5F9',
  glassOverlay: 'rgba(255,255,255,0.88)',

  brand: '#4F46E5',
  brandMid: '#818CF8',
  brandSoft: '#EEF2FF',
  brandXSoft: '#F5F3FF',
  brandDark: '#3730A3',
  brandGlow: 'rgba(79,70,229,0.18)',

  accent: '#F59E0B',
  accentSoft: '#FFFBEB',

  success: '#059669',
  successSoft: '#ECFDF5',
  successMid: '#6EE7B7',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerMid: '#FECACA',
  warning: '#D97706',
  warningSoft: '#FFFBEB',

  text: '#0F172A',
  textMid: '#334155',
  textLight: '#64748B',
  textXLight: '#CBD5E1',

  border: '#E8EBF2',
  borderMid: '#D1D5DB',

  shadow: '0 1px 3px rgba(15,23,42,0.06)',
  shadowSm: '0 2px 8px rgba(15,23,42,0.07)',
  shadowMd: '0 4px 16px rgba(15,23,42,0.10)',
  shadowBrand: '0 4px 18px rgba(79,70,229,0.30)',
  shadowBrandHover: '0 8px 28px rgba(79,70,229,0.40)',
};

const STATUS_OPTS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function colorFromString(str: string) {
  const palette = [
    { bg: '#EEF2FF', fg: '#4F46E5', border: '#C7D2FE' },
    { bg: '#F0FDF4', fg: '#059669', border: '#A7F3D0' },
    { bg: '#FFF7ED', fg: '#D97706', border: '#FDE68A' },
    { bg: '#FDF2F8', fg: '#BE185D', border: '#FBCFE8' },
    { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#F5F3FF', fg: '#7C3AED', border: '#DDD6FE' },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MfrAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const { bg, fg, border } = colorFromString(name);
  return (
    <Avatar
      sx={{
        width: 40, height: 40, borderRadius: '12px',
        background: bg, color: fg,
        fontSize: '0.75rem', fontWeight: 800,
        fontFamily: "'DM Mono', monospace",
        border: `1.5px solid ${border}`,
        boxShadow: `0 2px 8px ${fg}18`,
        flexShrink: 0,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.08) rotate(-2deg)' },
      }}
    >
      {initials}
    </Avatar>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; border: string; color: string; Icon: any }> = {
    pending:     { label: 'Pending',     bg: '#FFFBEB', border: '#FDE68A', color: '#B45309', Icon: Clock },
    in_progress: { label: 'In Progress', bg: T.brandSoft, border: T.brandMid, color: T.brand, Icon: Activity },
    completed:   { label: 'Completed',   bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', Icon: CheckCircle2 },
  };
  const s = map[status] ?? map['pending'];
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1.25, py: 0.4, borderRadius: '99px',
      background: s.bg, border: `1.5px solid ${s.border}`,
    }}>
      <s.Icon size={10} color={s.color} strokeWidth={2.5} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: s.color }}>{s.label}</Typography>
    </Box>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: number | string; sub?: string; icon?: any; accent?: string;
}) {
  const a = accent ?? T.brand;
  return (
    <Box sx={{
      flex: 1, minWidth: 140, px: 2.5, py: 2.25,
      background: T.cardBg, border: `1.5px solid ${T.border}`,
      borderRadius: '16px', boxShadow: T.shadowSm,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: T.shadowMd },
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, right: 0,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${a}18 0%, transparent 70%)`,
        transform: 'translate(20px, -20px)',
      },
    }}>
      {Icon && (
        <Box sx={{ display: 'inline-flex', p: 0.75, borderRadius: '8px', background: `${a}15`, mb: 1 }}>
          <Icon size={14} color={a} strokeWidth={2.5} />
        </Box>
      )}
      <Typography sx={{ color: T.textLight, fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1.45rem', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ color: T.textLight, fontSize: '0.68rem', mt: 0.4 }}>{sub}</Typography>}
    </Box>
  );
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Stack direction="row" spacing={0.5}
      sx={{ opacity: 0, transition: 'opacity 0.15s', '.MuiTableRow-root:hover &': { opacity: 1 } }}
    >
      <Tooltip title="Edit" placement="top" arrow>
        <IconButton size="small" onClick={onEdit} sx={{
          color: T.brand, background: T.brandSoft,
          borderRadius: '9px', width: 32, height: 32,
          border: `1.5px solid ${T.brandMid}`,
          '&:hover': { background: '#E0E7FF', transform: 'scale(1.08)', boxShadow: T.shadowBrand },
          transition: 'all 0.15s',
        }}>
          <PencilLine size={14} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" placement="top" arrow>
        <IconButton size="small" onClick={onDelete} sx={{
          color: T.danger, background: T.dangerSoft,
          borderRadius: '9px', width: 32, height: 32,
          border: `1.5px solid ${T.dangerMid}`,
          '&:hover': { background: '#FEE2E2', transform: 'scale(1.08)', boxShadow: `0 4px 12px ${T.danger}30` },
          transition: 'all 0.15s',
        }}>
          <Trash2 size={14} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ManufacturingPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchManufacturers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await manufacturerService.getManufacturers(page, itemsPerPage);
      if (response.success && response.data.manufacturers) {
        let data: Manufacturer[] = response.data.manufacturers;
        if (statusFilter !== 'all') data = data.filter((m) => m.status === statusFilter);
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          data = data.filter(
            (m) => m.name.toLowerCase().includes(q) || m.product_group_id.toLowerCase().includes(q)
          );
        }
        setManufacturers(data);
        setTotalCount(response.data.total_count ?? 0);
        setCurrentPage(page);
      } else {
        setError('Failed to fetch manufacturers');
        setManufacturers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => { fetchManufacturers(1); }, [fetchManufacturers]);

  const handleEdit = (m: Manufacturer) => { setSelectedManufacturer(m); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); setSelectedManufacturer(undefined); };

  const handleFormSubmit = async (data: CreateManufacturerRequest | Manufacturer) => {
    try {
      setLoading(true); setError('');
      if (selectedManufacturer) {
        await manufacturerService.updateManufacturer(selectedManufacturer.id, data);
      } else {
        await manufacturerService.createManufacturer(data as CreateManufacturerRequest);
      }
      handleFormClose();
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true); setError('');
      await manufacturerService.deleteManufacturer(id);
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setLoading(true); setError('');
      await manufacturerService.updateManufacturer(id, { status: status as any });
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  const activeCount  = manufacturers.filter((m) => m.status === 'in_progress').length;
  const pendingCount = manufacturers.filter((m) => m.status === 'pending').length;
  const doneCount    = manufacturers.filter((m) => m.status === 'completed').length;
  const totalPages   = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const hasFilters   = searchTerm !== '' || statusFilter !== 'all';

  return (
    <Box sx={{
      minHeight: '100vh', backgroundColor: T.pageBg, pb: 8,
      fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
      backgroundImage: `radial-gradient(${T.border} 1.2px, transparent 1.2px)`,
      backgroundSize: '28px 28px',
    }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        background: T.glassOverlay, backdropFilter: 'blur(20px)',
        borderBottom: `1.5px solid ${T.border}`,
        px: { xs: 2, md: 4 }, py: 2,
        position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 1px 0 #E8EBF2, 0 4px 20px rgba(15,23,42,0.05)',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '13px',
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.shadowBrand,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'rotate(-5deg) scale(1.05)', boxShadow: T.shadowBrandHover },
            }}>
              <Factory size={19} color="#fff" />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  Manufacturing
                </Typography>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 0.9, py: 0.25, borderRadius: '6px',
                  background: T.brandXSoft, border: `1px solid ${T.brandMid}`,
                }}>
                  <Zap size={9} color={T.brand} />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                    {totalCount}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: T.textLight, fontSize: '0.7rem', mt: 0.15 }}>
                Production batches & assignments
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<SlidersHorizontal size={14} />}
              endIcon={
                hasFilters
                  ? <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`, color: '#fff', fontSize: '0.62rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {[searchTerm, statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length}
                    </Box>
                  : <ChevronDown size={13} style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
              }
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{
                borderColor: filterOpen ? T.brand : T.border,
                color: filterOpen ? T.brand : T.textMid,
                background: filterOpen ? T.brandSoft : T.cardBg,
                borderRadius: '11px', textTransform: 'none',
                fontWeight: 700, fontSize: '0.82rem', height: 38, px: 2,
                borderWidth: '1.5px',
                '&:hover': { borderColor: T.brand, background: T.brandSoft, color: T.brand },
                transition: 'all 0.18s',
              }}
            >
              Filters
            </Button>

            <Button
              variant="contained"
              startIcon={<Plus size={15} strokeWidth={2.5} />}
              onClick={() => { setSelectedManufacturer(undefined); setFormOpen(true); }}
              sx={{
                background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
                borderRadius: '11px', textTransform: 'none',
                fontWeight: 800, fontSize: '0.85rem', height: 38, px: 2.5,
                boxShadow: T.shadowBrand, border: 'none',
                '&:hover': { background: `linear-gradient(135deg, #6366F1, ${T.brand})`, boxShadow: T.shadowBrandHover, transform: 'translateY(-1.5px)' },
                transition: 'all 0.18s',
              }}
            >
              New Manufacturer
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3.5 }}>

        {/* ── Error banner ──────────────────────────────────────────────────── */}
        {error && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 1.5, px: 2.5, py: 1.75, mb: 2.5,
            borderRadius: '12px', background: T.dangerSoft,
            border: `1.5px solid ${T.dangerMid}`,
          }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ p: 0.6, borderRadius: '7px', background: `${T.danger}15` }}>
                <X size={13} color={T.danger} />
              </Box>
              <Typography sx={{ color: T.danger, fontSize: '0.85rem', fontWeight: 600 }}>{error}</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setError('')} sx={{ color: T.danger, '&:hover': { background: T.dangerMid + '60' }, borderRadius: '6px' }}>
              <X size={14} />
            </IconButton>
          </Box>
        )}

        {/* ── Stat cards ────────────────────────────────────────────────────── */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap
          sx={{
            '& > *': { animation: 'fadeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both' },
            '& > *:nth-of-type(1)': { animationDelay: '0ms' },
            '& > *:nth-of-type(2)': { animationDelay: '60ms' },
            '& > *:nth-of-type(3)': { animationDelay: '120ms' },
            '& > *:nth-of-type(4)': { animationDelay: '180ms' },
            '@keyframes fadeSlideUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
          }}
        >
          <StatCard label="Total"     value={totalCount}   sub="manufacturers"  icon={BarChart3}  accent={T.brand} />
          <StatCard label="Active"    value={activeCount}  sub="in progress"    icon={Activity}   accent="#7C3AED" />
          <StatCard label="Pending"   value={pendingCount} sub="awaiting start" icon={Clock}      accent={T.warning} />
          <StatCard label="Completed" value={doneCount}    sub="finished"       icon={Sparkles}   accent={T.success} />
        </Stack>

        {/* ── Main card ─────────────────────────────────────────────────────── */}
        <Box sx={{
          background: T.cardBg, borderRadius: '20px',
          border: `1.5px solid ${T.border}`, boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
          overflow: 'hidden',
          animation: 'fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        }}>

          {/* ── Filter panel ────────────────────────────────────────────────── */}
          <Collapse in={filterOpen} timeout={300}>
            <Box sx={{
              px: 3, pt: 3, pb: 2.5,
              background: 'linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%)',
              borderBottom: `1.5px solid ${T.border}`,
            }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2.25}>
                <Box sx={{ p: 0.6, borderRadius: '7px', background: T.brandSoft, border: `1px solid ${T.brandMid}` }}>
                  <Filter size={12} color={T.brand} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: T.textMid, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Filters
                </Typography>
                {hasFilters && (
                  <Button size="small"
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    sx={{ ml: 'auto', textTransform: 'none', color: T.danger, fontWeight: 700, fontSize: '0.72rem', p: 0, minWidth: 0, '&:hover': { background: 'transparent', textDecoration: 'underline' } }}
                  >
                    Clear all
                  </Button>
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textLight, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Search
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                      <Search size={14} color={T.textLight} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                      <Box
                        component="input"
                        value={searchTerm}
                        onChange={(e: any) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by name or product group ID…"
                        sx={{
                          width: '100%', pl: '38px', pr: searchTerm ? '36px' : '12px',
                          py: '10px', borderRadius: '12px',
                          border: `1.5px solid ${T.border}`, background: T.subtleBg,
                          fontSize: '0.85rem', color: T.text, outline: 'none',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'border-color 0.18s, box-shadow 0.18s',
                          '&:focus': { borderColor: T.brandMid, boxShadow: `0 0 0 3px ${T.brandGlow}`, background: T.cardBg },
                          '&::placeholder': { color: T.textXLight },
                          boxSizing: 'border-box',
                        }}
                      />
                      {searchTerm && (
                        <IconButton size="small" onClick={() => setSearchTerm('')}
                          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: T.textLight, p: 0.25, borderRadius: '6px', '&:hover': { background: T.subtleBg } }}>
                          <X size={12} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textLight, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="select"
                      value={statusFilter}
                      onChange={(e: any) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      sx={{
                        width: '100%', pl: '12px', pr: '36px', py: '10px',
                        borderRadius: '12px', border: `1.5px solid ${T.border}`,
                        background: T.subtleBg, fontSize: '0.85rem', color: T.text,
                        outline: 'none', appearance: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'border-color 0.18s, box-shadow 0.18s',
                        '&:focus': { borderColor: T.brandMid, boxShadow: `0 0 0 3px ${T.brandGlow}`, background: T.cardBg },
                        cursor: 'pointer', boxSizing: 'border-box',
                      }}
                    >
                      {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Box>
                    <ChevronDown size={14} color={T.textLight} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* ── Search bar (always-visible) + count ─────────────────────────── */}
          <Box sx={{
            px: 3, py: 2, borderBottom: `1.5px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2, flexWrap: 'wrap', background: T.cardBg,
          }}>
            <Box sx={{ position: 'relative', flex: '0 0 320px' }}>
              <Search size={14} color={T.textLight} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
              <Box
                component="input"
                value={searchTerm}
                onChange={(e: any) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search manufacturers, group IDs…"
                sx={{
                  width: '100%', pl: '38px', pr: searchTerm ? '36px' : '12px',
                  py: '9px', borderRadius: '12px',
                  border: `1.5px solid ${T.border}`, background: T.subtleBg,
                  fontSize: '0.82rem', color: T.text, outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                  '&:focus': { borderColor: T.brandMid, boxShadow: `0 0 0 3px ${T.brandGlow}`, background: T.cardBg },
                  '&::placeholder': { color: T.textXLight },
                  boxSizing: 'border-box',
                }}
              />
              {searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: T.textLight, p: 0.25, borderRadius: '6px' }}>
                  <X size={12} />
                </IconButton>
              )}
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Refresh */}
              <Tooltip title="Refresh" arrow>
                <IconButton
                  onClick={() => fetchManufacturers(currentPage)}
                  disabled={loading}
                  size="small"
                  sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    border: `1.5px solid ${T.border}`, background: T.subtleBg,
                    color: T.textLight, transition: 'all 0.15s',
                    '&:hover': { background: T.cardBg, color: T.brand, borderColor: T.brandMid },
                  }}
                >
                  <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
                    className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>

              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.5, borderRadius: '9px',
                background: totalCount > 0 ? T.brandXSoft : T.subtleBg,
                border: `1.5px solid ${totalCount > 0 ? T.brandMid : T.border}`,
              }}>
                <Typography sx={{ color: T.textLight, fontSize: '0.72rem', fontWeight: 500 }}>
                  <Box component="span" sx={{ fontWeight: 900, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                    {totalCount}
                  </Box>
                  {' '}found
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* ── Table ─────────────────────────────────────────────────────────── */}
          <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Table header */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr',
              px: 3, py: 1.5,
              background: 'linear-gradient(180deg, #F8F9FF, #F4F5F9)',
              borderBottom: `2px solid ${T.border}`,
            }}>
              {['Manufacturer', 'Product Group', 'Status', 'Employees', ''].map((h) => (
                <Typography key={h} sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Loading */}
            {loading && (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <RefreshCw size={20} color={T.brandMid} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <Typography sx={{ color: T.textLight, fontSize: '0.85rem' }}>Loading manufacturers…</Typography>
              </Box>
            )}

            {/* Empty state */}
            {!loading && manufacturers.length === 0 && (
              <Box sx={{ py: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', width: 88, height: 88, mb: 3, mx: 'auto' }}>
                  <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px dashed ${T.brandMid}`, animation: 'spin 12s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
                  <Box sx={{ position: 'absolute', inset: 12, borderRadius: '50%', border: `1.5px solid ${T.brandSoft}`, animation: 'spin 8s linear infinite reverse' }} />
                  <Box sx={{ position: 'absolute', inset: 22, borderRadius: '50%', background: T.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Factory size={24} color={T.brand} />
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 900, color: T.text, mb: 0.75, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>
                  No manufacturers yet
                </Typography>
                <Typography sx={{ color: T.textLight, mb: 3.5, fontSize: '0.85rem', maxWidth: 280, mx: 'auto', lineHeight: 1.6 }}>
                  {hasFilters ? 'Try adjusting your search or filters' : 'Create your first manufacturer to get started'}
                </Typography>
                {!hasFilters && (
                  <Button
                    variant="contained"
                    startIcon={<Plus size={15} strokeWidth={2.5} />}
                    onClick={() => { setSelectedManufacturer(undefined); setFormOpen(true); }}
                    sx={{
                      background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                      borderRadius: '12px', textTransform: 'none', fontWeight: 800,
                      fontSize: '0.85rem', height: 42, px: 3, boxShadow: T.shadowBrand,
                      '&:hover': { boxShadow: T.shadowBrandHover, transform: 'translateY(-2px)' },
                      transition: 'all 0.18s',
                    }}
                  >
                    Create Manufacturer
                  </Button>
                )}
              </Box>
            )}

            {/* Rows */}
            {!loading && manufacturers.map((m, i) => (
              <Box
                key={m.id}
                sx={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr',
                  px: 3, py: 2, alignItems: 'center',
                  borderBottom: i < manufacturers.length - 1 ? `1px solid ${T.border}` : 'none',
                  transition: 'background 0.12s',
                  '&:hover': { background: `linear-gradient(90deg, ${T.brandXSoft}80, ${T.subtleBg}50)` },
                  '&:hover .row-actions': { opacity: 1 },
                }}
              >
                {/* Name + ID */}
                <Stack direction="row" alignItems="center" spacing={1.75}>
                  <MfrAvatar name={m.name ?? 'M'} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', lineHeight: 1.3, mb: 0.3 }}>
                      {m.name}
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.15, borderRadius: '5px', background: T.subtleBg, border: `1px solid ${T.border}` }}>
                      <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: T.textLight, fontWeight: 600 }}>
                        {m.id}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* Product group */}
                <Box>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.4, borderRadius: '8px', background: T.subtleBg, border: `1.5px solid ${T.border}` }}>
                    <Package2 size={12} color={T.brand} />
                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: T.textMid, fontSize: '0.72rem' }}>
                      {m.product_group_id}
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Box><StatusBadge status={m.status} /></Box>

                {/* Status quick-change */}
                <Box sx={{ position: 'relative', maxWidth: 140 }}>
                  <Box
                    component="select"
                    value={m.status}
                    onChange={(e: any) => handleUpdateStatus(m.id, e.target.value)}
                    sx={{
                      width: '100%', pl: '10px', pr: '28px', py: '6px',
                      borderRadius: '9px', border: `1.5px solid ${T.border}`,
                      background: T.subtleBg, fontSize: '0.75rem', color: T.textMid,
                      outline: 'none', appearance: 'none', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      '&:focus': { borderColor: T.brandMid, boxShadow: `0 0 0 3px ${T.brandGlow}` },
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Box>
                  <ChevronDown size={12} color={T.textLight} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </Box>

                {/* Actions */}
                <Box className="row-actions" sx={{ opacity: 0, transition: 'opacity 0.15s' }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit" placement="top" arrow>
                      <IconButton size="small" onClick={() => handleEdit(m)} sx={{
                        color: T.brand, background: T.brandSoft, borderRadius: '9px', width: 32, height: 32,
                        border: `1.5px solid ${T.brandMid}`,
                        '&:hover': { background: '#E0E7FF', transform: 'scale(1.08)', boxShadow: T.shadowBrand },
                        transition: 'all 0.15s',
                      }}>
                        <PencilLine size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" placement="top" arrow>
                      <IconButton size="small" onClick={() => handleDelete(m.id)} sx={{
                        color: T.danger, background: T.dangerSoft, borderRadius: '9px', width: 32, height: 32,
                        border: `1.5px solid ${T.dangerMid}`,
                        '&:hover': { background: '#FEE2E2', transform: 'scale(1.08)', boxShadow: `0 4px 12px ${T.danger}30` },
                        transition: 'all 0.15s',
                      }}>
                        <Trash2 size={14} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── Pagination footer ─────────────────────────────────────────────── */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 3, py: 1.75, borderTop: `1.5px solid ${T.border}`,
            background: 'linear-gradient(180deg, #FAFBFD, #F7F8FC)',
          }}>
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: T.textLight }}>
              {totalCount} manufacturer{totalCount !== 1 ? 's' : ''} · page {currentPage} of {totalPages}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => fetchManufacturers(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                sx={{ width: 32, height: 32, borderRadius: '8px', color: T.textLight, '&:hover': { background: T.subtleBg, color: T.brand }, '&:disabled': { opacity: 0.35 }, transition: 'all 0.12s' }}
              >
                <ChevronLeft size={15} />
              </IconButton>
              <Box sx={{ minWidth: 52, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: T.textMid, fontWeight: 700 }}>
                  {currentPage} / {totalPages}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => fetchManufacturers(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                sx={{ width: 32, height: 32, borderRadius: '8px', color: T.textLight, '&:hover': { background: T.subtleBg, color: T.brand }, '&:disabled': { opacity: 0.35 }, transition: 'all 0.12s' }}
              >
                <ChevronRight size={15} />
              </IconButton>
            </Stack>
          </Box>

        </Box>
      </Box>

      <ManufacturerForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedManufacturer}
        isLoading={loading}
        error={error}
      />
    </Box>
  );
}