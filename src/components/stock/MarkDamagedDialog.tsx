'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { AlertCircle, X as CloseIcon } from 'lucide-react';
import { stockService } from '@/lib/api/stockService';

interface MarkDamagedDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productId: string;
  productName: string;
  variantSku?: string;
  variantName?: string;
  availableStock: number;
}

const DAMAGE_REASONS = [
  { value: 'defective_batch', label: 'Defective Batch' },
  { value: 'broken', label: 'Broken' },
  { value: 'expired', label: 'Expired' },
  { value: 'contaminated', label: 'Contaminated' },
  { value: 'lost', label: 'Lost' },
  { value: 'theft', label: 'Theft' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'other', label: 'Other' },
];

export default function MarkDamagedDialog({
  open,
  onClose,
  onSuccess,
  productId,
  productName,
  variantSku,
  variantName,
  availableStock,
}: MarkDamagedDialogProps) {
  const [quantity, setQuantity] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    setQuantity('');
    setReason('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    if (Number(quantity) > availableStock) {
      setError(`Quantity cannot exceed available stock (${availableStock})`);
      return;
    }

    if (!reason) {
      setError('Please select a damage reason');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await stockService.markDamaged({
        product_id: productId,
        variant_sku: variantSku,
        quantity: Number(quantity),
        reason: reason,
      });

      if (response.success) {
        setSuccessMessage(
          `${quantity} units marked as damaged successfully for ${variantName || productName}`
        );
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError(response.error || 'Failed to mark items as damaged');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#0f172a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        Mark as Damaged
        <Button
          onClick={handleClose}
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: '#94a3b8',
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
        >
          <CloseIcon size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {/* Product Info */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              backgroundColor: '#f0f9ff',
              border: '1px solid #e0f2fe',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, mb: 0.5 }}>
              Product Information
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
              {productName}
            </Typography>
            {variantName && (
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                Variant: {variantName}
              </Typography>
            )}
            {variantSku && (
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                SKU: {variantSku}
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, mt: 1 }}>
              Available: {availableStock.toLocaleString('en-IN')} units
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1.5,
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                '& .MuiAlert-icon': { color: '#dc2626' },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.875rem' }}>{error}</Typography>
              </Stack>
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 1.5,
                border: '1px solid #86efac',
                backgroundColor: '#f0fdf4',
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>{successMessage}</Typography>
            </Alert>
          )}

          {/* Quantity Input */}
          <TextField
            label="Quantity to Mark as Damaged"
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (error) setError(null);
            }}
            fullWidth
            inputProps={{
              min: 1,
              max: availableStock,
              step: 1,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
            disabled={loading || !!successMessage}
          />

          {/* Reason Select */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: '0.875rem' }}>Damage Reason</InputLabel>
            <Select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              label="Damage Reason"
              sx={{
                borderRadius: 1.5,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0',
                },
              }}
              disabled={loading || !!successMessage}
            >
              {DAMAGE_REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid #f1f5f9',
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#64748b',
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#dc2626',
            '&:hover': { backgroundColor: '#b91c1c' },
            '&:disabled': { backgroundColor: '#fecaca', color: '#991b1b' },
          }}
          disabled={loading || !!successMessage}
        >
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
              <span>Marking...</span>
            </Stack>
          ) : (
            'Mark as Damaged'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
