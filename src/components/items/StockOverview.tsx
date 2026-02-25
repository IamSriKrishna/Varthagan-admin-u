"use client";

import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit } from "lucide-react";
import { useState } from "react";
import { itemService } from "@/services/itemService";

interface StockOverviewProps {
  itemId: string;
  item: any;
  onUpdate?: () => void;
}

export default function StockOverview({ itemId, item, onUpdate }: StockOverviewProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    opening_stock: item?.opening_stock || 0,
    opening_stock_rate_per_unit: item?.opening_stock_rate_per_unit || 0,
  });

  const handleOpenEdit = () => {
    setFormData({
      opening_stock: item?.opening_stock || 0,
      opening_stock_rate_per_unit: item?.opening_stock_rate_per_unit || 0,
    });
    setError(null);
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (formData.opening_stock < 0) {
        setError("Opening stock cannot be negative");
        setLoading(false);
        return;
      }

      if (formData.opening_stock_rate_per_unit < 0) {
        setError("Opening stock rate cannot be negative");
        setLoading(false);
        return;
      }

      await itemService.setOpeningStock(itemId, {
        opening_stock: formData.opening_stock,
        opening_stock_rate_per_unit: formData.opening_stock_rate_per_unit,
      });

      setOpenEditDialog(false);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update opening stock");
    } finally {
      setLoading(false);
    }
  };

  const openingStockValue = (formData.opening_stock || 0) * (formData.opening_stock_rate_per_unit || 0);

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" sx={{ color: "white" }}>
                📦
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Stock Overview
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Opening Stock: {item?.opening_stock || 0}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit size={18} />}
            onClick={handleOpenEdit}
          >
            Edit
          </Button>
        </Box>

        {/* Accounting Stock */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#e8f5e9",
            border: "1px solid #81c784",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ color: "#2e7d32", fontSize: "20px" }}>✓</Typography>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#2e7d32" }}>
              Accounting Stock
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Stock on Hand
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {item?.opening_stock || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Committed Stock
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: "#d32f2f" }}>
                0.00
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Available for Sale
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: "#2e7d32" }}>
                {item?.opening_stock || 0}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Physical Stock */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#e3f2fd",
            border: "1px solid #64b5f6",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ color: "#1565c0", fontSize: "20px" }}>📦</Typography>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1565c0" }}>
              Physical Stock
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Stock on Hand
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {item?.opening_stock || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Committed Stock
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: "#d32f2f" }}>
                0.00
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Opening Stock</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Opening Stock Quantity"
              type="number"
              fullWidth
              inputProps={{ step: "1", min: "0" }}
              value={formData.opening_stock}
              onChange={(e) => setFormData({ ...formData, opening_stock: parseInt(e.target.value) || 0 })}
              disabled={loading}
            />
            <TextField
              label="Opening Stock Rate (per unit)"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
              value={formData.opening_stock_rate_per_unit}
              onChange={(e) => setFormData({ ...formData, opening_stock_rate_per_unit: parseFloat(e.target.value) || 0 })}
              disabled={loading}
              helperText={`Total Value: ${openingStockValue.toFixed(2)}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
