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
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { bottleService, bottleSizeService } from "@/lib/api/productService";

interface BottleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const validationSchema = Yup.object({
  size_id: Yup.number().required("Size is required"),
  bottle_type: Yup.string()
    .required("Bottle type is required")
    .min(1, "Type is too short")
    .max(50, "Type is too long"),
  neck_size_mm: Yup.number()
    .required("Neck size is required")
    .min(18, "Minimum neck size is 18mm")
    .max(100, "Maximum neck size is 100mm"),
  thread_type: Yup.string()
    .required("Thread type is required")
    .oneOf(["400", "410", "415", "425", "450"]),
  stock: Yup.number()
    .required("Stock is required")
    .min(0, "Stock cannot be negative"),
});

const threadTypes = ["400", "410", "415", "425", "450"];

export default function BottleForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: BottleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadSizes();
    }
  }, [open]);

  const loadSizes = async () => {
    try {
      const response = await bottleSizeService.getBottleSizes(1, 100);
      setSizes(response.data || []);
    } catch (err) {
      setError("Failed to load bottle sizes");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      if (initialData?.id) {
        await bottleService.updateBottle(initialData.id, {
          size_id: Number(values.size_id),
          bottle_type: values.bottle_type,
          neck_size_mm: Number(values.neck_size_mm),
          thread_type: values.thread_type,
          stock: Number(values.stock),
        });
      } else {
        await bottleService.createBottle({
          size_id: Number(values.size_id),
          bottle_type: values.bottle_type,
          neck_size_mm: Number(values.neck_size_mm),
          thread_type: values.thread_type,
          stock: Number(values.stock),
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
        {initialData ? "Edit Bottle" : "Create New Bottle"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Formik
            initialValues={{
              size_id: initialData?.size_id || "",
              bottle_type: initialData?.bottle_type || "",
              neck_size_mm: initialData?.neck_size_mm || "",
              thread_type: initialData?.thread_type || "",
              stock: initialData?.stock || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <TextField
                  fullWidth
                  select
                  label="Bottle Size"
                  name="size_id"
                  value={values.size_id || ''}
                  onChange={(e) => setFieldValue('size_id', e.target.value)}
                  onBlur={(e) => setFieldValue('size_id', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.size_id && !!errors.size_id}
                  helperText={touched.size_id && typeof errors.size_id === 'string' ? errors.size_id : ''}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size.id} value={size.id}>
                      {size.size_label} ({size.size_ml}ml)
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Bottle Type"
                  name="bottle_type"
                  value={values.bottle_type}
                  onChange={(e) => setFieldValue('bottle_type', e.target.value)}
                  onBlur={(e) => setFieldValue('bottle_type', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.bottle_type && !!errors.bottle_type}
                  helperText={touched.bottle_type && typeof errors.bottle_type === 'string' ? errors.bottle_type : ''}
                />
                <TextField
                  fullWidth
                  label="Neck Size (MM)"
                  name="neck_size_mm"
                  type="number"
                  value={values.neck_size_mm}
                  onChange={(e) => setFieldValue('neck_size_mm', e.target.value)}
                  onBlur={(e) => setFieldValue('neck_size_mm', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.neck_size_mm && !!errors.neck_size_mm}
                  helperText={touched.neck_size_mm && typeof errors.neck_size_mm === 'string' ? errors.neck_size_mm : ''}
                />
                <TextField
                  fullWidth
                  select
                  label="Thread Type"
                  name="thread_type"
                  value={values.thread_type || ''}
                  onChange={(e) => setFieldValue('thread_type', e.target.value)}
                  onBlur={(e) => setFieldValue('thread_type', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.thread_type && !!errors.thread_type}
                  helperText={touched.thread_type && typeof errors.thread_type === 'string' ? errors.thread_type : ''}
                >
                  {threadTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={values.stock}
                  onChange={(e) => setFieldValue('stock', e.target.value)}
                  onBlur={(e) => setFieldValue('stock', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.stock && !!errors.stock}
                  helperText={touched.stock && typeof errors.stock === 'string' ? errors.stock : ''}
                />
                <DialogActions sx={{ mt: 3 }}>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || loading}
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
