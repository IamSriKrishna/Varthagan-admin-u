"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { productService, bottleService, capService } from "@/lib/api/productService";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const validationSchema = Yup.object({
  product_name: Yup.string()
    .required("Product name is required")
    .min(1, "Name is too short")
    .max(255, "Name is too long"),
  bottle_id: Yup.number().required("Bottle is required"),
  cap_id: Yup.number().required("Cap is required"),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  mrp: Yup.number()
    .required("MRP is required")
    .min(0, "MRP cannot be negative"),
});

export default function ProductForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bottles, setBottles] = useState<any[]>([]);
  const [caps, setCaps] = useState<any[]>([]);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [checkingCompatibility, setCheckingCompatibility] = useState(false);

  useEffect(() => {
    if (open) {
      loadBottlesAndCaps();
    }
  }, [open]);

  const loadBottlesAndCaps = async () => {
    try {
      const [bottlesRes, capsRes] = await Promise.all([
        bottleService.getBottles(1, 100),
        capService.getCaps(1, 100),
      ]);
      setBottles(bottlesRes.data || []);
      setCaps(capsRes.data || []);
    } catch (err) {
      setError("Failed to load bottles and caps");
    }
  };

  const checkCompatibility = async (bottleId: number, capId: number) => {
    if (!bottleId || !capId) return;
    setCheckingCompatibility(true);
    try {
      const result = await productService.checkCompatibility(bottleId, capId);
      setCompatibility(result);
    } catch (err: any) {
      setCompatibility(null);
    } finally {
      setCheckingCompatibility(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      if (initialData?.id) {
        await productService.updateProduct(initialData.id, {
          product_name: values.product_name,
          bottle_id: Number(values.bottle_id),
          cap_id: Number(values.cap_id),
          quantity: Number(values.quantity),
          mrp: Number(values.mrp),
        });
      } else {
        await productService.createProduct({
          product_name: values.product_name,
          bottle_id: Number(values.bottle_id),
          cap_id: Number(values.cap_id),
          quantity: Number(values.quantity),
          mrp: Number(values.mrp),
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Edit Product" : "Create New Product"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {compatibility && (
            <Alert
              severity={compatibility.is_compatible ? "success" : "warning"}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                {compatibility.message}
              </Typography>
            </Alert>
          )}
          <Formik
            initialValues={{
              product_name: initialData?.product_name || "",
              bottle_id: initialData?.bottle_id || "",
              cap_id: initialData?.cap_id || "",
              quantity: initialData?.quantity || 1,
              mrp: initialData?.mrp || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="product_name"
                  value={values.product_name}
                  onChange={(e) => setFieldValue('product_name', e.target.value)}
                  onBlur={(e) => setFieldValue('product_name', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.product_name && !!errors.product_name}
                  helperText={touched.product_name && typeof errors.product_name === 'string' ? errors.product_name : ''}
                />
                <TextField
                  fullWidth
                  select
                  label="Bottle"
                  name="bottle_id"
                  value={values.bottle_id || ''}
                  sx={{ mb: 2 }}
                  error={touched.bottle_id && !!errors.bottle_id}
                  helperText={touched.bottle_id && typeof errors.bottle_id === 'string' ? errors.bottle_id : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue('bottle_id', value);
                    if (values.cap_id) {
                      checkCompatibility(Number(value), values.cap_id);
                    }
                  }}
                  onBlur={() => setFieldValue('bottle_id', values.bottle_id)}
                >
                  {bottles.map((bottle) => (
                    <MenuItem key={bottle.id} value={bottle.id}>
                      {bottle.bottle_type} - Size: {bottle.size?.size_label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Cap"
                  name="cap_id"
                  value={values.cap_id || ''}
                  sx={{ mb: 2 }}
                  error={touched.cap_id && !!errors.cap_id}
                  helperText={touched.cap_id && typeof errors.cap_id === 'string' ? errors.cap_id : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue('cap_id', value);
                    if (values.bottle_id) {
                      checkCompatibility(values.bottle_id, Number(value));
                    }
                  }}
                  onBlur={() => setFieldValue('cap_id', values.cap_id)}
                >
                  {caps.map((cap) => (
                    <MenuItem key={cap.id} value={cap.id}>
                      {cap.cap_type} - {cap.material}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={values.quantity}
                  onChange={(e) => setFieldValue('quantity', e.target.value)}
                  onBlur={(e) => setFieldValue('quantity', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.quantity && !!errors.quantity}
                  helperText={touched.quantity && typeof errors.quantity === 'string' ? errors.quantity : ''}
                />
                <TextField
                  fullWidth
                  label="MRP"
                  name="mrp"
                  type="number"
                  value={values.mrp}
                  onChange={(e) => setFieldValue('mrp', e.target.value)}
                  onBlur={(e) => setFieldValue('mrp', e.target.value)}
                  inputProps={{ step: "0.01" }}
                  sx={{ mb: 2 }}
                  error={touched.mrp && !!errors.mrp}
                  helperText={touched.mrp && typeof errors.mrp === 'string' ? errors.mrp : ''}
                />
                <DialogActions sx={{ mt: 3 }}>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      isSubmitting || loading || (!initialData && !compatibility?.is_compatible)
                    }
                  >
                    {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                    {initialData ? "Update" : "Create"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
