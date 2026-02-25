'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Card,
  CardContent,
  Typography,
  useTheme,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Plus,
  Filter,
  PencilLine,
  Trash2,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProductionOrder } from '@/hooks/useProductionOrder';
import { useDebounce } from '@/hooks/useDebounce';
import { BBButton, BBTitle, BBTable, BBLoader, BBDialog, BBInputBase } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import { showToastMessage } from '@/utils/toastUtil';

interface ProductionOrderRow {
  id: string;
  production_order_no: string;
  item_group_name: string;
  quantity_to_manufacture: number;
  quantity_manufactured: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  planned_start_date: string;
  planned_end_date: string;
  created_at: string;
}

const ProductionOrderList: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const {
    productionOrders,
    totalPOs,
    loading,
    getProductionOrders,
    searchProductionOrders,
    deleteProductionOrder,
  } = useProductionOrder();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchProductionOrders(debouncedSearch);
    } else {
      getProductionOrders(page + 1, rowsPerPage);
    }
  }, [debouncedSearch, page, rowsPerPage]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedId) return;
    try {
      const success = await deleteProductionOrder(selectedId);
      if (success) {
        showToastMessage('Production order deleted successfully', 'success');
        setDeleteConfirmOpen(false);
        setSelectedId(null);
        getProductionOrders(page + 1, rowsPerPage);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to delete production order', 'error');
    }
  }, [selectedId, deleteProductionOrder, page, rowsPerPage, getProductionOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />;
      case 'in_progress':
        return <TrendingUp size={14} />;
      case 'planned':
        return <Clock size={14} />;
      case 'cancelled':
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'planned':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTotalCount = () => {
    return productionOrders.reduce((acc, po) => acc + po.quantity_to_manufacture, 0);
  };

  const getCompletedCount = () => {
    return productionOrders.reduce((acc, po) => acc + po.quantity_manufactured, 0);
  };

  const columns: ITableColumn<ProductionOrderRow>[] = [
    {
      key: 'production_order_no' as keyof ProductionOrderRow,
      label: 'Order Number',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: '500' }}>
          {row.production_order_no}
        </Typography>
      ),
    },
    {
      key: 'item_group_name' as keyof ProductionOrderRow,
      label: 'Item Group',
      render: (row) => (
        <Typography variant="body2">{row.item_group_name}</Typography>
      ),
    },
    {
      key: 'quantity_to_manufacture' as keyof ProductionOrderRow,
      label: 'To Manufacture',
      render: (row) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">{row.quantity_to_manufacture}</Typography>
        </Box>
      ),
    },
    {
      key: 'quantity_manufactured' as keyof ProductionOrderRow,
      label: 'Manufactured',
      render: (row) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">{row.quantity_manufactured}</Typography>
        </Box>
      ),
    },
    {
      key: 'status' as keyof ProductionOrderRow,
      label: 'Status',
      render: (row) => (
        <Chip
          icon={getStatusIcon(row.status)}
          label={row.status.replace(/_/g, ' ').toUpperCase()}
          color={getStatusColor(row.status)}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      key: 'planned_start_date' as keyof ProductionOrderRow,
      label: 'Start Date',
      render: (row) => (
        <Typography variant="body2">
          {new Date(row.planned_start_date).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      key: 'planned_end_date' as keyof ProductionOrderRow,
      label: 'End Date',
      render: (row) => (
        <Typography variant="body2">
          {new Date(row.planned_end_date).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      key: 'action' as any,
      label: 'Action',
      render: (row) => (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/production-orders/production-order/${row.id}`)}
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row.id);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr' }}>
      <BBTitle
        title="Production Orders Management"
        rightContent={
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push('/production-orders/production-order/new')}
            startIcon={<Plus size={18} />}
          >
            New Production Order
          </BBButton>
        }
      />

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
          p: 2,
        }}
      >
        <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                  Total Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {totalPOs}
                </Typography>
              </Box>
              <Clock size={32} style={{ color: theme.palette.primary.main, opacity: 0.2 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                  Completed
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {productionOrders.filter((po) => po.status === 'completed').length}
                </Typography>
              </Box>
              <CheckCircle size={32} style={{ color: theme.palette.success.main, opacity: 0.2 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                  In Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  {productionOrders.filter((po) => po.status === 'in_progress').length}
                </Typography>
              </Box>
              <TrendingUp size={32} style={{ color: theme.palette.info.main, opacity: 0.2 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                  Planned
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {productionOrders.filter((po) => po.status === 'planned').length}
                </Typography>
              </Box>
              <AlertCircle size={32} style={{ color: theme.palette.warning.main, opacity: 0.2 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filter Bar */}
      <Box
        sx={{
          borderRadius: '10px 10px 0 0',
          boxShadow: 'none',
        }}
        component={Paper}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ p: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <BBInputBase
              label=""
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or item group"
            />
          </Box>
        </Stack>
      </Box>

      {/* Table */}
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <BBTable
          data={productionOrders as ProductionOrderRow[]}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalPOs}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <BBDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Production Order"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete this production order?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this production order will be permanently removed.
            </Typography>
          </Box>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
};

export default ProductionOrderList;
