'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Alert,
  Pagination,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  X as CloseIcon,
} from 'lucide-react';
import { stockService, StockItem, ProductStockItem, VariantStockItem, StockMovement } from '@/lib/api/stockService';

// ============================================================================
// Helper Functions & Type Guards
// ============================================================================

function isVariantStock(stock: any): stock is VariantStockItem {
  return 'variant_sku' in stock && stock.variant_sku !== undefined;
}

function isProductWithVariants(stock: any): stock is ProductStockItem {
  return stock.variants !== undefined && stock.variants.length > 0;
}

function hasVariants(stock: any): boolean {
  return stock.variants !== undefined && Array.isArray(stock.variants) && stock.variants.length > 0;
}

// ============================================================================
// Main Component
// ============================================================================

export default function StockManagement() {
  const [stocks, setStocks] = useState<(StockItem | ProductStockItem | VariantStockItem)[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<(StockItem | ProductStockItem | VariantStockItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [expandedVariantRows, setExpandedVariantRows] = useState<Set<string>>(new Set());
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementsTotal, setMovementsTotal] = useState(0);
  const [movementsLimit] = useState(5);
  const [movementsDialogOpen, setMovementsDialogOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  // Fetch stock summary on component mount
  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await stockService.getStockSummary();
        setStocks(response.stocks);
        setFilteredStocks(response.stocks);
        setTotalStockValue(response.total_stock_value);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock summary';
        setError(errorMessage);
        console.error('Error fetching stock summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockSummary();
  }, []);

  // Handle search
  useEffect(() => {
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = stocks.filter((item) => {
      const productMatch =
        item.product_name.toLowerCase().includes(lowercaseSearch) ||
        item.product_id.toLowerCase().includes(lowercaseSearch);

      // For products, also search by main SKU
      if (!isVariantStock(item)) {
        if ('sku' in item && item.sku.toLowerCase().includes(lowercaseSearch)) {
          return true;
        }
      }

      // For variants, search by variant_sku and variant_name
      if (isVariantStock(item) && item.variant_sku.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }

      if (isVariantStock(item) && item.variant_name.toLowerCase().includes(lowercaseSearch)) {
        return true;
      }

      // For products with variants, also search variant details
      if (isProductWithVariants(item) && item.variants) {
        const hasMatchingVariant = item.variants.some(
          (v) =>
            v.variant_sku.toLowerCase().includes(lowercaseSearch) ||
            v.variant_name.toLowerCase().includes(lowercaseSearch)
        );
        if (hasMatchingVariant) return true;
      }

      return productMatch;
    });

    setFilteredStocks(filtered);
  }, [searchTerm, stocks]);

  // Toggle variant row expansion
  const toggleVariantRow = (variantId: string) => {
    const newExpanded = new Set(expandedVariantRows);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariantRows(newExpanded);
  };

  // Fetch movements for a product
  const handleViewMovements = async (productId: string, productName: string) => {
    try {
      setMovementsLoading(true);
      setMovementsError(null);
      setMovementsPage(1);
      setSelectedProductName(productName);
      setMovementsDialogOpen(true);
      setExpandedProductId(productId);

      const offset = 0;
      const response = await stockService.getProductMovements(productId, offset, movementsLimit);
      setMovements(response.movements);
      setMovementsTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movements';
      setMovementsError(errorMessage);
      console.error('Error fetching movements:', err);
    } finally {
      setMovementsLoading(false);
    }
  };

  // Handle movements pagination
  const handleMovementPageChange = async (_event: any, newPage: number) => {
    if (expandedProductId) {
      try {
        setMovementsLoading(true);
        setMovementsError(null);
        const offset = (newPage - 1) * movementsLimit;
        const response = await stockService.getProductMovements(
          expandedProductId,
          offset,
          movementsLimit
        );
        setMovements(response.movements);
        setMovementsPage(newPage);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movements';
        setMovementsError(errorMessage);
      } finally {
        setMovementsLoading(false);
      }
    }
  };

  const handleCloseMovementsDialog = () => {
    setMovementsDialogOpen(false);
    setExpandedProductId(null);
    setMovements([]);
    setMovementsPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStockStatus = (stock: StockItem) => {
    const stockPercentage = (stock.available_stock / stock.purchased_total) * 100;

    if (stockPercentage === 0) {
      return { label: 'Out of Stock', color: '#dc2626', bgColor: '#fee2e2' };
    } else if (stockPercentage < 20) {
      return { label: 'Low Stock', color: '#ea580c', bgColor: '#fff7ed' };
    } else if (stockPercentage < 50) {
      return { label: 'Medium Stock', color: '#f59e0b', bgColor: '#fffbeb' };
    } else {
      return { label: 'Good Stock', color: '#059669', bgColor: '#f0fdf4' };
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading stock summary...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header */}
      <Stack>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0f172a',
            mb: 0.5,
          }}
        >
          Stock Management
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
          Monitor inventory levels and product movements across all warehouses
        </Typography>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.875rem' }}>{error}</Typography>
          </Stack>
        </Alert>
      )}

      {/* Stock Value Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Card
          elevation={0}
          sx={{
            flex: 1,
            border: '1px solid #f1f5f9',
            borderRadius: 2,
            backgroundColor: '#f8fafc',
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Total Stock Value
                </Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>
                  {formatCurrency(totalStockValue)}
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0369a1',
                }}
              >
                <DollarSign size={22} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            flex: 1,
            border: '1px solid #f1f5f9',
            borderRadius: 2,
            backgroundColor: '#f8fafc',
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Total Products
                </Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>
                  {filteredStocks.length}
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0369a1',
                }}
              >
                <Package size={22} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Search Bar */}
      <TextField
        placeholder="Search by product name, SKU, or product ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
            '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5 },
          },
        }}
      />

      {/* Stock Table */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Product Details
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Current Stock
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Available
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Avg Cost
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Stock Value
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStocks.map((stock) => {
                const status = getStockStatus(stock);
                const hasVars = hasVariants(stock);
                const isExpanded = expandedVariantRows.has(stock.product_id);

                return (
                  <Box key={stock.product_id}>
                    {/* Main Product/Stock Row */}
                    <TableRow
                      sx={{
                        '&:hover': { backgroundColor: '#fafbfe' },
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: hasVars ? '#f8fafc' : 'inherit',
                      }}
                    >
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {/* Expand/Collapse Button for Variants */}
                            {hasVars && (
                              <IconButton
                                size="small"
                                onClick={() => toggleVariantRow(stock.product_id)}
                                sx={{
                                  borderRadius: 1,
                                  color: '#0f172a',
                                  '&:hover': { backgroundColor: '#f1f5f9' },
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </IconButton>
                            )}
                            {!hasVars && <Box sx={{ width: 32 }} />}

                            {/* Product Name */}
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                                {stock.product_name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                SKU: {isVariantStock(stock) ? stock.variant_sku : stock.sku}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                                ID: {stock.product_id}
                              </Typography>
                              {/* Show variant info if this is a variant */}
                              {isVariantStock(stock) && (
                                <Box sx={{ mt: 0.5, p: 1, backgroundColor: '#f1f5f9', borderRadius: 1 }}>
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#0369a1' }}>
                                    {stock.variant_name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
                                    {Object.entries(stock.variant_attributes).map(([key, value]) => (
                                      <Box
                                        key={key}
                                        sx={{
                                          px: 1,
                                          py: 0.25,
                                          backgroundColor: '#dbeafe',
                                          borderRadius: 0.75,
                                          fontSize: '0.65rem',
                                          color: '#0369a1',
                                          fontWeight: 500,
                                        }}
                                      >
                                        {key}: {value}
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                              {/* Show variant count badge if product has variants */}
                              {hasVars && (
                                <Box sx={{ mt: 0.5 }}>
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      backgroundColor: '#f3e8ff',
                                      fontSize: '0.65rem',
                                      color: '#7c3aed',
                                      fontWeight: 600,
                                    }}
                                  >
                                    📦 {(stock as ProductStockItem).variants?.length || 0} variants
                                  </Box>
                                </Box>
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                          {stock.current_stock.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                          {stock.available_stock.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatCurrency(stock.average_cost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(stock.stock_value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            backgroundColor: status.bgColor,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: status.color,
                          }}
                        >
                          <TrendingUp size={14} />
                          {status.label}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Movements">
                          <IconButton
                            size="small"
                            onClick={() => handleViewMovements(stock.product_id, stock.product_name)}
                            sx={{
                              borderRadius: 1.5,
                              color: '#0f172a',
                              '&:hover': { backgroundColor: '#f1f5f9' },
                            }}
                          >
                            <Clock size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Variant Rows */}
                    {hasVars && isExpanded && (stock as ProductStockItem).variants?.map((variant) => {
                      const variantStatus = getStockStatus(variant);
                      return (
                        <TableRow
                          key={variant.id}
                          sx={{
                            backgroundColor: '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                            '&:hover': { backgroundColor: '#f0f9ff' },
                          }}
                        >
                          <TableCell sx={{ pl: 6 }}>
                            <Stack spacing={0.25}>
                              <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                                <Box
                                  sx={{
                                    mt: 0.25,
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: '#0369a1',
                                    flexShrink: 0,
                                  }}
                                />
                                <Stack spacing={0.25}>
                                  <Typography sx={{ fontSize: '0.813rem', fontWeight: 600, color: '#0369a1' }}>
                                    {variant.variant_name}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    SKU: {variant.variant_sku}
                                  </Typography>
                                </Stack>
                              </Stack>
                              {/* Variant Attributes */}
                              {Object.keys(variant.variant_attributes).length > 0 && (
                                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, ml: 2 }}>
                                  {Object.entries(variant.variant_attributes).map(([key, value]) => (
                                    <Box
                                      key={key}
                                      sx={{
                                        px: 1,
                                        py: 0.25,
                                        backgroundColor: '#dbeafe',
                                        borderRadius: 0.75,
                                        fontSize: '0.65rem',
                                        color: '#0369a1',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {key}: {value}
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                              {variant.current_stock.toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                              {variant.available_stock.toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {formatCurrency(variant.average_cost)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                              {formatCurrency(variant.stock_value)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                backgroundColor: variantStatus.bgColor,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: variantStatus.color,
                              }}
                            >
                              <TrendingUp size={14} />
                              {variantStatus.label}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Movements">
                              <IconButton
                                size="small"
                                onClick={() => handleViewMovements(variant.product_id, variant.variant_name)}
                                sx={{
                                  borderRadius: 1.5,
                                  color: '#0f172a',
                                  '&:hover': { backgroundColor: '#f1f5f9' },
                                }}
                              >
                                <Clock size={16} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Box>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredStocks.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Package size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.9rem', color: '#64748b', mb: 1 }}>
              No products found
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Card>

      {/* Movements Dialog */}
      <Dialog
        open={movementsDialogOpen}
        onClose={handleCloseMovementsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 24px 64px rgba(15,23,42,0.14)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Stack>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Stock Movements
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
              {selectedProductName}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={handleCloseMovementsDialog}>
            <CloseIcon size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {movementsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {movementsError}
            </Alert>
          )}

          {movementsLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : movements.length > 0 ? (
            <Stack spacing={2}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Type
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Quantity
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Rate
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Reference
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor:
                                movement.movement_type === 'PURCHASE_ORDER'
                                  ? '#dbeafe'
                                  : '#fecdd3',
                              color:
                                movement.movement_type === 'PURCHASE_ORDER'
                                  ? '#0369a1'
                                  : '#991b1b',
                              fontWeight: 600,
                            }}
                          >
                            {movement.movement_type === 'PURCHASE_ORDER' ? 'IN' : 'OUT'}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>
                          {formatCurrency(movement.rate)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {formatCurrency(movement.amount)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          <Stack spacing={0.25}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {movement.reference_number}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                              {movement.reference_type}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          {formatDate(movement.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {movementsTotal > movementsLimit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(movementsTotal / movementsLimit)}
                    page={movementsPage}
                    onChange={handleMovementPageChange}
                    size="small"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                No movements found for this product
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
