'use client';

import { category, products } from '@/constants/apiConstants';
import { activeTypescategories } from '@/constants/commonConstans';
import { productTypes } from '@/constants/productConstans';
import useFetch from '@/hooks/useFetch';
import {
  BBButton,
  BBDialog,
  BBDropdownBase,
  BBInputBase,
  BBLoader,
  BBTable,
} from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import { showToastMessage } from '@/utils/toastUtil';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  BarChart3,
  BoxSelect,
  ChevronDown,
  Filter,
  Layers,
  Package2,
  PencilLine,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { ICategorys } from '@/models/ICategory';
import { productService } from '@/lib/api/productService';

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

function ProductAvatar({ name }: { name: string }) {
  const style = getAvatarStyle(name || 'P');

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <Avatar
      sx={{
        width: 34,
        height: 34,
        fontSize: '0.75rem',
        fontWeight: 700,
        bgcolor: style.bg,
        color: style.color,
        fontFamily: "'DM Sans', sans-serif",
        border: '1.5px solid',
        borderColor: style.color + '33',
      }}
    >
      {initials || 'P'}
    </Avatar>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
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

function PriceCell({
  cost,
  selling,
  isResource,
  resourceCostPerUnit,
  isRaw,
  rawCostPerUnit,
}: {
  cost: number;
  selling: number;
  isResource?: boolean;
  resourceCostPerUnit?: number;
  isRaw?: boolean;
  rawCostPerUnit?: number;
}) {
  if (isRaw) {
    return (
      <Stack spacing={0.5}>
        {rawCostPerUnit ? (
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              color: '#1a1d2e',
              fontSize: '0.8125rem',
            }}
          >
            ₹{rawCostPerUnit.toFixed?.(2) ?? rawCostPerUnit}
          </Typography>
        ) : null}

        <Chip
          label="Raw"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: '#fff8eb',
            color: '#b45309',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
          }}
        />
      </Stack>
    );
  }

  if (isResource && !selling && resourceCostPerUnit) {
    return (
      <Stack spacing={0.5}>
        <Typography
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            color: '#1a1d2e',
            fontSize: '0.8125rem',
          }}
        >
          ₹{resourceCostPerUnit.toFixed?.(2) ?? resourceCostPerUnit}
        </Typography>

        <Chip
          label="Resource"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: '#f0f4ff',
            color: '#4f63d2',
            border: '1px solid #c7d2fe',
            borderRadius: '6px',
          }}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={0.4}>
      <Typography
        sx={{
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          color: '#1a1d2e',
          fontSize: '0.8125rem',
        }}
      >
        ₹{selling?.toFixed?.(2) ?? selling}
      </Typography>

      <Typography
        sx={{
          fontFamily: "'DM Mono', monospace",
          color: '#9ca3af',
          fontSize: '0.7rem',
        }}
      >
        Cost ₹{cost?.toFixed?.(2) ?? cost}
      </Typography>
    </Stack>
  );
}

function VariantBadge({ count }: { count: number }) {
  return (
    <Chip
      icon={<Layers size={12} />}
      label={count}
      size="small"
      sx={{
        height: 24,
        minWidth: 34,
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: "'DM Mono', monospace",
        bgcolor: count > 1 ? '#f0f4ff' : '#f8f9fc',
        color: count > 1 ? '#4f63d2' : '#9ca3af',
        border: count > 1 ? '1px solid #c7d2fe' : '1px solid #eeeff5',
        borderRadius: '7px',
      }}
    />
  );
}

export default function Products() {
  const [page, setPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    active: '',
    category_ids: '',
  });

  const { data: categoryData } = useFetch<{ data: ICategorys }>({
    url: `${category.getCategory}`,
  });

  const categoryOptions =
    categoryData?.data?.categories?.map((cat) => ({
      label: cat.category_name,
      value: cat.id,
    })) || [];

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search && debouncedSearch) params.append('search', debouncedSearch);
    if (filters.category_ids) params.append('category_ids', filters.category_ids);
    if (filters.type?.trim()) params.append('type', filters.type);
    if (String(filters.active).trim()) {
      params.append('is_active', String(filters.active));
    }

    params.append('page', String(page + 1));
    params.append('limit', String(rowsPerPage));

    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);

  const {
    data: results,
    refetch,
    loading,
  } = useFetch<{ products: any[]; total: number }>({
    url: `${products.postProduct}?${queryParams}`,
  });

  const productList = results?.products ?? [];
  const totalProducts = results?.total ?? 0;
  const activeProducts = productList.filter((p) => p.is_active !== false).length;
  const totalVariants = productList.reduce(
    (acc, p) => acc + (p.product_details?.variants?.length ?? 0),
    0
  );

  const activeFilterCount = [
    filters.type,
    filters.category_ids,
    filters.active,
  ].filter(Boolean).length;

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const response = await productService.deleteProduct(selectedId);

      if (response?.success) {
        showToastMessage(response.message || 'Item deleted successfully', 'success');
        refetch();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? 'Delete failed', 'error');
      }
    } catch (e: any) {
      showToastMessage(e?.message || 'Something went wrong.', 'error');
    }
  };

  const columns: ITableColumn<any>[] = [
    {
      key: 'name',
      label: 'Item',
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ProductAvatar name={row.name ?? 'Product'} />

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
              {row.name}
            </Typography>

            <Typography
              sx={{
                fontSize: '0.7rem',
                color: '#9ca3af',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.02em',
              }}
            >
              {row.product_details?.base_sku || '—'}
            </Typography>
          </Box>
        </Stack>
      ),
      cellStyle: { minWidth: 220 },
    },
    {
      key: 'unit',
      label: 'Unit',
      render: (row) => (
        <Chip
          label={
            row.is_raw
              ? row.raw_specification ?? '—'
              : row.is_resource
                ? row.resource_unit ?? '—'
                : row.product_details?.unit ?? '—'
          }
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor: '#f8f9fc',
            color: '#6b7280',
            border: '1px solid #eeeff5',
            borderRadius: '6px',
          }}
        />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <Tooltip title={row.product_details?.description ?? ''} arrow>
          <Typography
            sx={{
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: row.product_details?.description ? '#6b7280' : '#d1d5db',
              fontSize: '0.8rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {row.product_details?.description || 'No description'}
          </Typography>
        </Tooltip>
      ),
      cellStyle: { minWidth: 200, maxWidth: 260 },
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (row) => (
        <PriceCell
          cost={row.purchase_info?.cost_price ?? 0}
          selling={row.sales_info?.selling_price ?? 0}
          isResource={row.is_resource}
          resourceCostPerUnit={row.resource_cost_per_unit}
          isRaw={row.is_raw}
          rawCostPerUnit={row.raw_cost_per_unit}
        />
      ),
      cellStyle: { minWidth: 150 },
    },
    {
      key: 'variants',
      label: 'Variants',
      render: (row) => (
        <VariantBadge count={row.product_details?.variants?.length ?? 0} />
      ),
      cellStyle: { minWidth: 90, textAlign: 'center' },
    },
    {
      key: 'action',
      label: '',
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.15s ease',
            '.MuiTableRow-root:hover &': { opacity: 1 },
          }}
        >
          <Tooltip title="Edit product" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/products/product/${row.id}`)}
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
              <PencilLine size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete product" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedId(row.id);
                setOpen(true);
              }}
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
        </Box>
      ),
      cellStyle: { minWidth: 90, textAlign: 'right' },
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
              <ShoppingBag size={22} color="white" />
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
                Items
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalProducts} product{totalProducts !== 1 ? 's' : ''} in catalogue
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<SlidersHorizontal size={15} />}
              endIcon={
                activeFilterCount > 0 ? (
                  <Chip
                    label={activeFilterCount}
                    size="small"
                    sx={{
                      height: 18,
                      minWidth: 18,
                      bgcolor: '#4f63d2',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  />
                ) : (
                  <ChevronDown
                    size={14}
                    style={{
                      transform: filterOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                )
              }
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '11px',
                borderColor: filterOpen ? '#c7d2fe' : '#eeeff5',
                color: filterOpen ? '#4f63d2' : '#6b7280',
                bgcolor: filterOpen ? '#f0f4ff' : '#ffffff',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#c7d2fe',
                  bgcolor: '#f0f4ff',
                },
              }}
            >
              Filters
            </Button>

            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => router.push('/products/create')}
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
              New Product
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={<BarChart3 size={22} />}
          color="#4f63d2"
          bg="#f0f4ff"
        />

        <StatCard
          label="This Page"
          value={productList.length}
          icon={<BoxSelect size={22} />}
          color="#7c3aed"
          bg="#f3eeff"
        />

        <StatCard
          label="Variants"
          value={totalVariants}
          icon={<Layers size={22} />}
          color="#d97706"
          bg="#fffbeb"
        />

        <StatCard
          label="Active"
          value={activeProducts}
          icon={<Sparkles size={22} />}
          color="#15803d"
          bg="#f0fdf6"
        />
      </Box>

      {/* Filters */}
      <Collapse in={filterOpen} timeout={250}>
        <Box
          component={Paper}
          elevation={0}
          sx={{
            mx: 3,
            mt: 2.5,
            borderRadius: '14px',
            border: '1px solid #eeeff5',
            bgcolor: '#ffffff',
            p: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Filter size={15} color="#4f63d2" />

            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6b7280',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Filters
            </Typography>

            {activeFilterCount > 0 && (
              <Button
                size="small"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    type: '',
                    active: '',
                    category_ids: '',
                  }))
                }
                sx={{
                  ml: 'auto',
                  color: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Clear all
              </Button>
            )}
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <BBDropdownBase
                name="type"
                label="Product Type"
                value={filters.type}
                options={[{ value: '', label: 'All types' }, ...productTypes]}
                onDropdownChange={(_e, _n, val) =>
                  handleFilterChange('type', val as string)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <BBDropdownBase
                name="category_ids"
                label="Category"
                value={filters.category_ids}
                options={[{ value: '', label: 'All categories' }, ...categoryOptions]}
                onDropdownChange={(_e, _n, val) =>
                  handleFilterChange('category_ids', val as string)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <BBDropdownBase
                name="active"
                label="Status"
                value={filters.active}
                options={[{ value: '', label: 'All statuses' }, ...activeTypescategories]}
                onDropdownChange={(_e, _n, val) =>
                  handleFilterChange('active', val as string)
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>

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
              zIndex: 1,
            }}
          >
            <Search size={15} />
          </Box>

          <BBInputBase
            label=""
            name="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search products, SKUs…"
            sx={{ pl: 4.5 }}
          />
        </Box>

        {filters.search && (
          <Chip
            label={`${productList.length} result${
              productList.length !== 1 ? 's' : ''
            }`}
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
        <BBTable
          data={productList}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalProducts}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
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
          }}
        />
      </Box>

      {/* Delete Dialog */}
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Product"
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
                  The product will be permanently removed from your catalogue.
                  All associated variants and pricing data will be lost.
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
              Are you sure you want to permanently delete this product?
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete Product"
        cancelText="Keep Product"
        confirmColor="error"
      />
    </Box>
  );
}