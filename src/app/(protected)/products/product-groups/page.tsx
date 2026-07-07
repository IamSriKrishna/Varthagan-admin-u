'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Chip,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Eye,
  Package2,
  Layers,
  CalendarDays,
  Activity,
  ChevronRight,
  Sparkles,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import useApi from '@/hooks/useApi';
import useFetch from '@/hooks/useFetch';
import { showToastMessage } from '@/utils/toastUtil';
import {
  ProductGroupListOutput,
  ProductGroupListResponse,
} from '@/models/product-group.model';

function getAvatarStyle(name: string) {
  const palette = [
    { bg: '#e8edff', color: '#3d52c7' },
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#d1fae5', color: '#065f46' },
    { bg: '#fff3cd', color: '#92400e' },
    { bg: '#ede9fe', color: '#6d28d9' },
    { bg: '#fee2e2', color: '#991b1b' },
    { bg: '#e0f2fe', color: '#0369a1' },
  ];

  const idx =
    name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    palette.length;

  return palette[idx];
}

function GroupAvatar({ name }: { name: string }) {
  const style = getAvatarStyle(name || 'G');

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '13px',
        bgcolor: style.bg,
        color: style.color,
        border: `1.5px solid ${style.color}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.8rem',
        fontWeight: 800,
      }}
    >
      {initials || 'G'}
    </Box>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        bgcolor: active ? '#f0fdf6' : '#f8f9fc',
        color: active ? '#15803d' : '#6b7280',
        border: active ? '1px solid #6ddc98' : '1px solid #eeeff5',
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    />
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
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
          borderColor: color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}22`,
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
            {label}
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
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: '#9ca3af',
              fontSize: '0.75rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {sub}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '13px',
            bgcolor: bg,
            color,
            border: `1px solid ${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

function GroupCard({
  group,
  onView,
  onDelete,
}: {
  group: ProductGroupListOutput;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #eeeff5',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#f8fbff',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.07)',
          '& .group-actions': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} flex={1} minWidth={0}>
            <GroupAvatar name={group.name} />

            <Box flex={1} minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 800,
                    color: '#1a1d2e',
                    fontSize: '0.95rem',
                    lineHeight: 1.25,
                  }}
                >
                  {group.name}
                </Typography>

                <StatusPill active={group.is_active} />
              </Stack>

              <Typography
                sx={{
                  color: group.description ? '#6b7280' : '#d1d5db',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {group.description || 'No description provided'}
              </Typography>
            </Box>
          </Stack>

          <Stack
            className="group-actions"
            direction="row"
            spacing={0.5}
            sx={{
              opacity: 0,
              transition: 'opacity 0.15s ease',
              flexShrink: 0,
            }}
          >
            <Tooltip title="View group" arrow>
              <IconButton
                size="small"
                onClick={onView}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  color: '#4f63d2',
                  bgcolor: '#f0f4ff',
                  '&:hover': {
                    bgcolor: '#e0e7ff',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Eye size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete group" arrow>
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  color: '#ef4444',
                  bgcolor: '#fef2f2',
                  '&:hover': {
                    bgcolor: '#fee2e2',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          borderTop: '1px solid #f5f5fa',
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          icon={<Layers size={12} />}
          label={`${group.components?.length ?? 0} Components`}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: '#f0f4ff',
            color: '#4f63d2',
            border: '1px solid #c7d2fe',
            borderRadius: '7px',
          }}
        />

        <Chip
          icon={<Activity size={12} />}
          label={group.is_active ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: group.is_active ? '#f0fdf6' : '#f8f9fc',
            color: group.is_active ? '#15803d' : '#6b7280',
            border: group.is_active ? '1px solid #6ddc98' : '1px solid #eeeff5',
            borderRadius: '7px',
          }}
        />

        <Chip
          icon={<CalendarDays size={12} />}
          label={new Date(group.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: '#fff8eb',
            color: '#b45309',
            border: '1px solid #fcd34d',
            borderRadius: '7px',
          }}
        />

        <Box flex={1} />

        <Box
          onClick={onView}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            px: 1.5,
            py: 0.7,
            borderRadius: '8px',
            bgcolor: '#f8f9fc',
            color: '#6b7280',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.78rem',
            fontWeight: 700,
            '&:hover': {
              bgcolor: '#f0f4ff',
              color: '#4f63d2',
            },
          }}
        >
          View details
          <ChevronRight size={13} />
        </Box>
      </Box>
    </Box>
  );
}

export default function ProductGroupsPage() {
  const router = useRouter();
  const { mutateApi: deleteProductGroup } = useApi<any>('', 'DELETE');

  const [productGroups, setProductGroups] = useState<ProductGroupListOutput[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: fetchedData, loading: isLoading } =
    useFetch<ProductGroupListResponse>({
      url: '/product-groups',
    });

  useEffect(() => {
    if (fetchedData?.data) setProductGroups(fetchedData.data);
  }, [fetchedData]);

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);

      const response = await deleteProductGroup(
        undefined,
        `/product-groups/${selectedId}`
      );

      if (response?.success || response?.message) {
        setProductGroups((prev) => prev.filter((pg) => pg.id !== selectedId));
        showToastMessage('Item Group deleted successfully', 'success');
        setOpenDeleteDialog(false);
        setSelectedId(null);
      }
    } catch (error: any) {
      showToastMessage(error?.message || 'Failed to delete Item Group', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalGroups = productGroups.length;
  const activeGroups = productGroups.filter((g) => g.is_active).length;
  const totalComponents = productGroups.reduce(
    (acc, g) => acc + (g.components?.length ?? 0),
    0
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
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
              <Package2 size={22} color="white" />
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
                Item Groups
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalGroups} group{totalGroups !== 1 ? 's' : ''} registered
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => router.push('/products/product-groups/create')}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '11px',
              background:
                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
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
            }}
          >
            Create Group
          </Button>
        </Stack>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={34} sx={{ color: '#6366f1' }} />

          <Typography
            sx={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Loading Item Groups…
          </Typography>
        </Box>
      ) : (
        <>
          {/* Stats */}
          {productGroups.length > 0 && (
            <Box
              sx={{
                mx: 3,
                mt: 2.5,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              <SummaryCard
                label="Total Groups"
                value={totalGroups}
                sub="in catalogue"
                icon={<BarChart3 size={22} />}
                color="#4f63d2"
                bg="#f0f4ff"
              />

              <SummaryCard
                label="Active"
                value={activeGroups}
                sub="running now"
                icon={<Sparkles size={22} />}
                color="#15803d"
                bg="#f0fdf6"
              />

              <SummaryCard
                label="Components"
                value={totalComponents}
                sub="across groups"
                icon={<Layers size={22} />}
                color="#0ea5e9"
                bg="#e0f2fe"
              />
            </Box>
          )}

          {/* Empty */}
          {productGroups.length === 0 && (
            <Box
              sx={{
                mx: 3,
                mt: 2.5,
                bgcolor: '#ffffff',
                border: '1px solid #eeeff5',
                borderRadius: '14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                py: 12,
                textAlign: 'center',
              }}
            >
              <Package2 size={46} color="#d1d5db" />

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 800,
                  color: '#1a1d2e',
                  fontSize: '1rem',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No Item Groups yet
              </Typography>

              <Typography
                sx={{
                  mt: 0.75,
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Create your first Item Group to organise your catalogue.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => router.push('/products/product-groups/create')}
                sx={{
                  mt: 3,
                  px: 2.5,
                  py: 1.1,
                  borderRadius: '11px',
                  background:
                    'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Create First Group
              </Button>
            </Box>
          )}

          {/* Cards */}
          {productGroups.length > 0 && (
            <Stack spacing={2} sx={{ mx: 3, mt: 2.5, mb: 3 }}>
              {productGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onView={() =>
                    group.id
                      ? router.push(`/products/product-groups/${group.id}`)
                      : showToastMessage('Invalid Item Group ID', 'error')
                  }
                  onDelete={() => {
                    setSelectedId(group.id);
                    setOpenDeleteDialog(true);
                  }}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#1a1d2e',
          }}
        >
          Delete Item Group
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
                The Item Group and all associated component links will be permanently
                removed. Products themselves will not be affected.
              </Typography>
            </Box>
          </Box>

          <AlertTriangle size={15} color="#ef4444" />

          <Typography
            sx={{
              mt: 1,
              fontSize: '0.875rem',
              color: '#6b7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Are you sure you want to permanently delete this Item Group?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleteLoading}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              borderRadius: '8px',
              color: '#6b7280',
            }}
          >
            Keep Group
          </Button>

          <Button
            onClick={handleDelete}
            disabled={deleteLoading}
            variant="contained"
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
            {deleteLoading ? 'Deleting…' : 'Delete Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}