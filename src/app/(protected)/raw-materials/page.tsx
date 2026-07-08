'use client';

import {
  BBButton,
  BBDialog,
  BBInputBase,
  BBLoader,
  BBTable,
} from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import HighlightedCell from '@/lib/BBTable/HighlightedCell';
import {
  RawMaterialBag,
  RawMaterialListResponse,
} from '@/models/rawMaterial.model';
import { showToastMessage } from '@/utils/toastUtil';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  ChevronDown,
  PackageOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { rawMaterialService } from '@/lib/api/rawMaterialService';
import { RAW_MATERIAL_STATUS_COLORS } from '@/constants/rawMaterial.constants';
import RawMaterialDialog from '@/components/rawMaterial/RawMaterialDialog';

const MATERIAL_STATUS_CONFIG = {
  available: {
    label: 'Available',
    bg: '#f0fdf6',
    color: '#15803d',
    dot: '#16a34a',
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
  partial: {
    label: 'Partial',
    bg: '#fff8eb',
    color: '#b45309',
    dot: '#f59e0b',
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
  consumed: {
    label: 'Consumed',
    bg: '#fff5f5',
    color: '#ef4444',
    dot: '#ef4444',
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
};

export default function RawMaterialsPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bags, setBags] = useState<RawMaterialBag[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchBags = useCallback(async () => {
    try {
      setLoading(true);
      let allBags: RawMaterialBag[] = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const response: RawMaterialListResponse = await rawMaterialService.getBags(
          limit,
          offset
        );

        if (!response.success) {
          showToastMessage('Failed to fetch raw materials', 'error');
          return;
        }

        const fetchedBags = response.data?.bags || [];
        allBags = [...allBags, ...fetchedBags];
        const total = response.data?.total || 0;

        if (allBags.length >= total || fetchedBags.length < limit) {
          break;
        }

        offset += limit;
      }

      setBags(allBags);
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch raw materials', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBags();
  }, [fetchBags]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const groupedBags: { [key: string]: RawMaterialBag[] } = {};
  bags.forEach((bag) => {
    const poId = bag.purchase_order_id;
    if (!groupedBags[poId]) groupedBags[poId] = [];
    groupedBags[poId].push(bag);
  });

  const getLatestCreatedTime = (bags: RawMaterialBag[]) =>
    bags.reduce((max, bag) => {
      const bagTime = bag.created_at ? new Date(bag.created_at).getTime() : 0;
      return Math.max(max, bagTime);
    }, 0);

  const groupedKeys = Object.keys(groupedBags).sort((a, b) => {
    const aTime = getLatestCreatedTime(groupedBags[a]);
    const bTime = getLatestCreatedTime(groupedBags[b]);
    return bTime - aTime;
  });

  const displayBags = groupedKeys
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((poId) => {
      const poBags = groupedBags[poId].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

      return {
        ...poBags[0],
        _groupSize: poBags.length,
        _allBags: poBags,
      };
    });

  const totalGroupCount = groupedKeys.length;

  const columns: ITableColumn<any>[] = [
    {
      key: 'product_name' as keyof RawMaterialBag,
      label: 'Product Name',
      render: (row) => (
        <Box>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#1a1d2e',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.3,
            }}
          >
            <HighlightedCell value={row.product_name} search={filters.search} />
          </Typography>

          <Typography
            sx={{
              fontSize: '0.7rem',
              color: '#9ca3af',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.02em',
            }}
          >
            {row.product_id}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'vendor_name' as keyof RawMaterialBag,
      label: 'Vendor',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.8rem',
            color: '#4f63d2',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          <HighlightedCell value={row.vendor_name} search={filters.search} />
        </Typography>
      ),
    },
    {
      key: 'purchase_order_no' as keyof RawMaterialBag,
      label: 'PO No',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontFamily: "'DM Mono', monospace",
            color: '#6b7280',
            letterSpacing: '0.02em',
          }}
        >
          {row.purchase_order_no}
        </Typography>
      ),
    },
    {
      key: 'bag_number' as keyof RawMaterialBag,
      label: 'Bag #',
      render: (row) => (
        <Chip
          label={`Bag ${row.bag_number}`}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            bgcolor: '#f0f4ff',
            color: '#4f63d2',
            border: '1px solid #c7d2fe',
            borderRadius: '7px',
          }}
        />
      ),
    },
    {
      key: 'expected_kg' as keyof RawMaterialBag,
      label: 'Expected KG',
      render: (row) => (
        <Typography sx={monoTextSx}>{row.expected_kg.toFixed(2)}</Typography>
      ),
    },
    {
      key: 'actual_kg' as keyof RawMaterialBag,
      label: 'Actual KG',
      render: (row) => (
        <Typography sx={{ ...monoTextSx, fontWeight: 700 }}>
          {row.actual_kg.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: 'remaining_kg' as keyof RawMaterialBag,
      label: 'Remaining KG',
      render: (row) => {
        const remaining = row.expected_kg - row.actual_kg;

        return (
          <Typography
            sx={{
              ...monoTextSx,
              fontWeight: 800,
              color: remaining > 0 ? '#ef4444' : '#15803d',
            }}
          >
            {remaining.toFixed(2)}
          </Typography>
        );
      },
    },
    {
      key: 'status' as keyof RawMaterialBag,
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor:
              RAW_MATERIAL_STATUS_COLORS[
                row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS
              ] + '20',
            color:
              RAW_MATERIAL_STATUS_COLORS[
                row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS
              ],
            border: `1px solid ${
              RAW_MATERIAL_STATUS_COLORS[
                row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS
              ]
            }`,
            borderRadius: '6px',
          }}
        />
      ),
    },
    {
      key: 'created_at' as keyof RawMaterialBag,
      label: 'Created',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontFamily: "'DM Mono', monospace",
            color: '#6b7280',
            letterSpacing: '0.01em',
          }}
        >
          {dayjs(row.created_at).format('DD MMM YYYY')}
        </Typography>
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
              <PackageOpen size={22} color="white" />
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
                Raw Materials
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Manage raw material bags received from purchase orders
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            onClick={() => setDialogOpen(true)}
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
            }}
          >
            Receive Materials
          </BBButton>
        </Stack>
      </Box>

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
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 420 }}>
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
              zIndex: 1,
            }}
          >
            <Search size={15} />
          </Box>

          <BBInputBase
            name="search"
            label=""
            placeholder="Search by product, vendor, or PO..."
            value={filters.search}
            onChange={(e) => handleTypeChange('search', e.target.value)}
            sx={{ pl: 4.5 }}
          />
        </Box>

        {filters.search && (
          <Chip
            label="Filtered"
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <BBLoader />
          </Box>
        ) : (
          <>
            <BBTable
              data={displayBags}
              columns={columns}
              pagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalGroupCount}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              renderAccordionContent={(row: any) => (
                <Box sx={{ p: 2, bgcolor: '#f8fbff' }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#1a1d2e',
                      mb: 2,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Material Timeline for {row.purchase_order_no || 'PO'}
                  </Typography>

                  <Stack spacing={2}>
                    {row._allBags.map((bag: RawMaterialBag, idx: number) => {
                      const cfg =
                        MATERIAL_STATUS_CONFIG[
                          bag.status as keyof typeof MATERIAL_STATUS_CONFIG
                        ] || MATERIAL_STATUS_CONFIG.available;
                      const isLast = idx === row._allBags.length - 1;

                      return (
                        <Stack key={bag.id} direction="row" spacing={2}>
                          <Stack sx={{ alignItems: 'center', mt: 0.5 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: cfg.bg,
                                border: `2px solid ${cfg.dot}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: cfg.dot,
                                }}
                              />
                            </Box>

                            {!isLast && (
                              <Box
                                sx={{
                                  width: 2,
                                  height: 60,
                                  bgcolor: '#d1d5db',
                                  mt: -1,
                                }}
                              />
                            )}
                          </Stack>

                          <Stack sx={{ flex: 1, pb: 2 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 800,
                                    color: '#1a1d2e',
                                    fontFamily: "'DM Sans', sans-serif",
                                  }}
                                >
                                  Bag {bag.bag_number}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    mt: 0.25,
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {dayjs(bag.created_at).format('DD MMM YYYY, hh:mm A')}
                                </Typography>
                              </Box>

                              <Chip
                                label={cfg.label}
                                size="small"
                                sx={{
                                  height: 22,
                                  bgcolor: cfg.bg,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.dot}33`,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  fontFamily: "'DM Sans', sans-serif",
                                  borderRadius: '6px',
                                }}
                              />
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={3}
                              sx={{
                                mt: 1.5,
                                p: 1.5,
                                bgcolor: '#ffffff',
                                borderRadius: '10px',
                                border: '1px solid #eeeff5',
                              }}
                            >
                              {[
                                ['Expected KG', bag.expected_kg.toFixed(2), '#1a1d2e'],
                                ['Actual KG', bag.actual_kg.toFixed(2), '#1a1d2e'],
                                [
                                  'Remaining KG',
                                  (bag.expected_kg - bag.actual_kg).toFixed(2),
                                  bag.expected_kg - bag.actual_kg > 0
                                    ? '#ef4444'
                                    : '#15803d',
                                ],
                              ].map(([label, value, color]) => (
                                <Box key={label}>
                                  <Typography
                                    sx={{
                                      fontSize: '0.68rem',
                                      color: '#9ca3af',
                                      fontWeight: 700,
                                      fontFamily: "'DM Sans', sans-serif",
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                    }}
                                  >
                                    {label}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize: '0.875rem',
                                      fontWeight: 800,
                                      color,
                                      fontFamily: "'DM Mono', monospace",
                                    }}
                                  >
                                    {value}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Stack>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              )}
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
              }}
            />
          </>
        )}
      </Box>

      <RawMaterialDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          fetchBags();
        }}
      />

      <BBDialog
        title="Delete Raw Material"
        subtitle="Are you sure you want to delete this raw material bag? This action cannot be undone."
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          setDeleteDialogOpen(false);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
}

const monoTextSx = {
  fontSize: '0.8rem',
  fontFamily: "'DM Mono', monospace",
  color: '#374151',
};