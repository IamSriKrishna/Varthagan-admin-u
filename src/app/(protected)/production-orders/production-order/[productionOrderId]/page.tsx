'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Chip,
  Paper,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { ArrowLeft, Save, Plus, Check } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useProductionOrder } from '@/hooks/useProductionOrder';
import { useItemGroups } from '@/hooks/useItemGroups';
import { BBButton, BBTitle, BBTable, BBLoader } from '@/lib';
import { ITableColumn } from '@/lib/BBTable/BBTable';
import { PRODUCTION_ORDER_STATUS } from '@/constants/productionOrder.constants';

const ProductionOrderDetail: React.FC = () => {
  const router = useRouter();
  const { productionOrderId } = useParams();
  const theme = useTheme();
  
  const {
    productionOrder,
    loading,
    createProductionOrder,
    updateProductionOrder,
    getProductionOrder,
    consumeProductionItem,
  } = useProductionOrder();

  const { data: itemGroups } = useItemGroups();

  const isNew = productionOrderId === 'new';
  const [formData, setFormData] = useState({
    item_group_id: '',
    quantity_to_manufacture: 0,
    planned_start_date: '',
    planned_end_date: '',
    notes: '',
    status: 'planned',
    quantity_manufactured: 0,
    actual_start_date: '',
    actual_end_date: '',
    manufactured_date: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [selectedItemToConsume, setSelectedItemToConsume] = useState<any>(null);
  const [consumeQuantity, setConsumeQuantity] = useState(0);
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consuming, setConsuming] = useState(false);

  useEffect(() => {
    if (!isNew && productionOrderId) {
      getProductionOrder(productionOrderId as string);
    }
  }, [productionOrderId, isNew, getProductionOrder]);

  useEffect(() => {
    if (productionOrder && !isNew) {
      setFormData({
        item_group_id: productionOrder.item_group_id,
        quantity_to_manufacture: productionOrder.quantity_to_manufacture,
        planned_start_date: productionOrder.planned_start_date.split('T')[0],
        planned_end_date: productionOrder.planned_end_date.split('T')[0],
        notes: productionOrder.notes || '',
        status: productionOrder.status,
        quantity_manufactured: productionOrder.quantity_manufactured,
        actual_start_date: productionOrder.actual_start_date
          ? productionOrder.actual_start_date.split('T')[0]
          : '',
        actual_end_date: productionOrder.actual_end_date
          ? productionOrder.actual_end_date.split('T')[0]
          : '',
        manufactured_date: productionOrder.manufactured_date
          ? productionOrder.manufactured_date.split('T')[0]
          : '',
      });
    }
  }, [productionOrder, isNew]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('quantity') ? parseInt(value) || 0 : value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      setSaving(true);

      if (!formData.item_group_id) {
        setError('Please select an item group');
        setSaving(false);
        return;
      }

      if (!formData.quantity_to_manufacture || formData.quantity_to_manufacture <= 0) {
        setError('Quantity must be greater than 0');
        setSaving(false);
        return;
      }

      if (!formData.planned_start_date || !formData.planned_end_date) {
        setError('Please select start and end dates');
        setSaving(false);
        return;
      }

      if (isNew) {
        await createProductionOrder({
          item_group_id: formData.item_group_id,
          quantity_to_manufacture: formData.quantity_to_manufacture,
          planned_start_date: formData.planned_start_date,
          planned_end_date: formData.planned_end_date,
          notes: formData.notes,
        });
        setSuccess(true);
      } else {
        await updateProductionOrder(productionOrderId as string, {
          status: formData.status as 'planned' | 'in_progress' | 'completed' | 'cancelled',
          quantity_manufactured: formData.quantity_manufactured,
          actual_start_date: formData.actual_start_date || undefined,
          actual_end_date: formData.actual_end_date || undefined,
          manufactured_date: formData.manufactured_date || undefined,
          notes: formData.notes,
        });
        setSuccess(true);
      }

      setTimeout(() => {
        router.push('/production-orders');
      }, 1500);
    } catch (error: any) {
      setError(error?.message || 'Failed to save production order');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const handleStartProduction = async () => {
    try {
      setError(null);
      setSaving(true);
      await updateProductionOrder(productionOrderId as string, {
        status: 'in_progress',
        actual_start_date: new Date().toISOString().split('T')[0],
        notes: formData.notes,
      });
      setFormData(prev => ({ ...prev, status: 'in_progress', actual_start_date: new Date().toISOString().split('T')[0] }));
      await getProductionOrder(productionOrderId as string);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to start production');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenConsumeDialog = (item: any) => {
    setSelectedItemToConsume(item);
    setConsumeQuantity(item.quantity_required - item.quantity_consumed);
    setConsumeNotes('');
    setConsumeDialogOpen(true);
  };

  const handleConsumeItem = async () => {
    if (!selectedItemToConsume || consumeQuantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      setError(null);
      setConsuming(true);
      
      // Calculate the total consumed (existing + new)
      const totalConsumedAmount = selectedItemToConsume.quantity_consumed + consumeQuantity;
      
      console.log('Consuming item with data:', {
        production_order_item_id: selectedItemToConsume.id,
        quantity_consumed: totalConsumedAmount,
        notes: consumeNotes,
      });
      
      const response = await consumeProductionItem(productionOrderId as string, {
        production_order_item_id: selectedItemToConsume.id,
        quantity_consumed: totalConsumedAmount, // Send total consumed, not increment
        notes: consumeNotes,
      });
      
      console.log('Consume response:', response);
      
      // Force refresh the production order to get latest data
      await new Promise(resolve => setTimeout(resolve, 500));
      await getProductionOrder(productionOrderId as string);
      
      setSuccess(true);
      setConsumeDialogOpen(false);
      setSelectedItemToConsume(null);
      setConsumeQuantity(0);
      setConsumeNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Consume item error:', err);
      setError(err?.message || 'Failed to consume item');
    } finally {
      setConsuming(false);
    }
  };

  const handleCompleteProduction = async () => {
    try {
      setError(null);
      setSaving(true);
      await updateProductionOrder(productionOrderId as string, {
        status: 'completed',
        actual_end_date: new Date().toISOString().split('T')[0],
        quantity_manufactured: formData.quantity_to_manufacture,
        notes: formData.notes,
      });
      setFormData(prev => ({ ...prev, status: 'completed', actual_end_date: new Date().toISOString().split('T')[0], quantity_manufactured: formData.quantity_to_manufacture }));
      await getProductionOrder(productionOrderId as string);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete production');
    } finally {
      setSaving(false);
    }
  };

  const getProgressPercentage = () => {
    if (!productionOrder?.production_order_items?.length) return 0;
    const consumedCount = productionOrder.production_order_items.filter(
      (item: any) => item.quantity_consumed >= item.quantity_required
    ).length;
    return Math.round((consumedCount / productionOrder.production_order_items.length) * 100);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr' }}>
      <BBTitle
        title={isNew ? 'Create Production Order' : `Production Order ${productionOrder?.production_order_no}`}
        rightContent={
          <BBButton
            variant="outlined"
            size="small"
            onClick={() => router.back()}
            startIcon={<ArrowLeft size={18} />}
          >
            Back
          </BBButton>
        }
      />

      {/* Messages */}
      <Box sx={{ px: 2, pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {isNew ? 'Production order created successfully' : 'Production order updated successfully'}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, p: 2 }}>
        {/* Main Form */}
        <Box>
          <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                {isNew ? 'Order Details' : 'Production Information'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {isNew ? (
                  <FormControl fullWidth>
                    <InputLabel>Item Group</InputLabel>
                    <Select
                      name="item_group_id"
                      value={formData.item_group_id}
                      onChange={handleSelectChange}
                      label="Item Group"
                    >
                      {itemGroups?.map((ig: any) => (
                        <MenuItem key={ig.id} value={ig.id}>
                          {ig.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    disabled
                    label="Item Group"
                    value={productionOrder?.item_group_name || ''}
                    fullWidth
                  />
                )}

                <TextField
                  label="Quantity to Manufacture"
                  type="number"
                  name="quantity_to_manufacture"
                  value={formData.quantity_to_manufacture}
                  onChange={handleInputChange}
                  disabled={!isNew}
                  fullWidth
                />

                {isNew && (
                  <>
                    <TextField
                      label="Planned Start Date"
                      type="date"
                      name="planned_start_date"
                      value={formData.planned_start_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Planned End Date"
                      type="date"
                      name="planned_end_date"
                      value={formData.planned_end_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </>
                )}

                {!isNew && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                        label="Status"
                      >
                        {PRODUCTION_ORDER_STATUS.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Quantity Manufactured"
                      type="number"
                      name="quantity_manufactured"
                      value={formData.quantity_manufactured}
                      onChange={handleInputChange}
                      fullWidth
                    />

                    <TextField
                      label="Actual Start Date"
                      type="date"
                      name="actual_start_date"
                      value={formData.actual_start_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Actual End Date"
                      type="date"
                      name="actual_end_date"
                      value={formData.actual_end_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Manufactured Date"
                      type="date"
                      name="manufactured_date"
                      value={formData.manufactured_date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </>
                )}

                <TextField
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Production Items */}
          {!isNew && productionOrder?.production_order_items && productionOrder.production_order_items.length > 0 && (
            <Card sx={{ mt: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Production Components
                </Typography>

                <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Item Name</strong></TableCell>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell align="center"><strong>Required</strong></TableCell>
                        <TableCell align="center"><strong>Consumed</strong></TableCell>
                        <TableCell><strong>Progress</strong></TableCell>
                        {formData.status === 'in_progress' && <TableCell align="center"><strong>Action</strong></TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productionOrder.production_order_items.map((item: any) => {
                        const progress = Math.round((item.quantity_consumed / item.quantity_required) * 100);
                        const isCompleted = item.quantity_consumed >= item.quantity_required;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.variant_sku || '-'}</TableCell>
                            <TableCell align="center">{item.quantity_required}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.quantity_consumed}
                                color={isCompleted ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" sx={{ minWidth: 30 }}>
                                  {progress}%
                                </Typography>
                              </Box>
                            </TableCell>
                            {formData.status === 'in_progress' && (
                              <TableCell align="center">
                                {!isCompleted && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenConsumeDialog(item)}
                                  >
                                    Consume
                                  </Button>
                                )}
                                {isCompleted && (
                                  <Chip
                                    icon={<Check size={16} />}
                                    label="Completed"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Summary Sidebar */}
        <Box>
          <Card sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Summary
              </Typography>

              {!isNew && productionOrder && (
                <>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Order Number
                    </Typography>
                    <Typography sx={{ fontWeight: '500' }}>
                      {productionOrder.production_order_no}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={productionOrder.status.replace(/_/g, ' ').toUpperCase()}
                      color={getStatusColor(productionOrder.status) as any}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getProgressPercentage()}
                        sx={{ flex: 1, height: 8, borderRadius: 2 }}
                      />
                      <Typography sx={{ fontWeight: '500', minWidth: 35 }}>
                        {getProgressPercentage()}%
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {productionOrder.quantity_manufactured} / {productionOrder.quantity_to_manufacture} units
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Planned Timeline
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {new Date(productionOrder.planned_start_date).toLocaleDateString()} -{' '}
                      {new Date(productionOrder.planned_end_date).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {productionOrder.actual_start_date && (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Actual Timeline
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {new Date(productionOrder.actual_start_date).toLocaleDateString()} -{' '}
                        {productionOrder.actual_end_date
                          ? new Date(productionOrder.actual_end_date).toLocaleDateString()
                          : 'In Progress'}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2.5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Created
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {new Date(productionOrder.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              )}

              {isNew && (
                <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                  Fill in the details above to create a new production order.
                </Typography>
              )}
            </CardContent>
          </Card>

              {/* Action Buttons */}
              <Stack sx={{ mt: 2, gap: 1 }}>
                {isNew ? (
                  <>
                    <BBButton
                      fullWidth
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={<Save size={18} />}
                    >
                      {saving ? 'Creating...' : 'Create Order'}
                    </BBButton>
                    <BBButton
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/production-orders')}
                    >
                      Cancel
                    </BBButton>
                  </>
                ) : (
                  <>
                    {formData.status === 'planned' && (
                      <BBButton
                        fullWidth
                        variant="contained"
                        onClick={handleStartProduction}
                        disabled={saving}
                      >
                        {saving ? 'Starting...' : 'Start Production'}
                      </BBButton>
                    )}

                    {formData.status === 'in_progress' && (
                      <BBButton
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={handleCompleteProduction}
                        disabled={saving || getProgressPercentage() < 100}
                      >
                        {saving ? 'Completing...' : 'Mark as Complete'}
                      </BBButton>
                    )}

                    {formData.status !== 'completed' && formData.status !== 'cancelled' && (
                      <BBButton
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        Save Changes
                      </BBButton>
                    )}

                    <BBButton
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/production-orders')}
                    >
                      Back to List
                    </BBButton>
                  </>
                )}
              </Stack>
        </Box>
      </Box>

      {/* Consume Item Dialog */}
      <Dialog
        open={consumeDialogOpen}
        onClose={() => setConsumeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Consume Production Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItemToConsume && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Item
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedItemToConsume.item_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Required Quantity
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedItemToConsume.quantity_required}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Already Consumed
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedItemToConsume.quantity_consumed}
                </Typography>
              </Box>
              <TextField
                label="Quantity to Consume"
                type="number"
                value={consumeQuantity}
                onChange={(e: any) =>
                  setConsumeQuantity(Math.min(parseInt(e.target.value) || 0, selectedItemToConsume.quantity_required - selectedItemToConsume.quantity_consumed))
                }
                fullWidth
                inputProps={{
                  step: 1,
                  min: 0,
                  max: selectedItemToConsume.quantity_required - selectedItemToConsume.quantity_consumed,
                }}
              />
              <TextField
                label="Notes (Optional)"
                value={consumeNotes}
                onChange={(e: any) => setConsumeNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConsumeDialogOpen(false)}
            disabled={consuming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConsumeItem}
            variant="contained"
            disabled={consuming || consumeQuantity <= 0}
          >
            {consuming ? 'Consuming...' : 'Consume'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionOrderDetail;
