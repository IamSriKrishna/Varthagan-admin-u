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
import { useState } from "react";
import { capService } from "@/lib/api/productService";

interface CapFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const validationSchema = Yup.object({
  neck_size_mm: Yup.number()
    .required("Neck size is required")
    .min(18, "Minimum neck size is 18mm")
    .max(100, "Maximum neck size is 100mm"),
  thread_type: Yup.string()
    .required("Thread type is required")
    .oneOf(["400", "410", "415", "425", "450"]),
  cap_type: Yup.string()
    .required("Cap type is required")
    .min(1, "Type is too short")
    .max(50, "Type is too long"),
  color: Yup.string().max(30, "Color is too long"),
  material: Yup.string()
    .required("Material is required")
    .oneOf(["plastic", "metal", "silicone"]),
  stock: Yup.number()
    .required("Stock is required")
    .min(0, "Stock cannot be negative"),
});

const threadTypes = ["400", "410", "415", "425", "450"];
const materials = ["plastic", "metal", "silicone"];

export default function CapForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: CapFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      if (initialData?.id) {
        await capService.updateCap(initialData.id, {
          neck_size_mm: Number(values.neck_size_mm),
          thread_type: values.thread_type,
          cap_type: values.cap_type,
          color: values.color || undefined,
          material: values.material,
          stock: Number(values.stock),
        });
      } else {
        await capService.createCap({
          neck_size_mm: Number(values.neck_size_mm),
          thread_type: values.thread_type,
          cap_type: values.cap_type,
          color: values.color || undefined,
          material: values.material,
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
        {initialData ? "Edit Cap" : "Create New Cap"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Formik
            initialValues={{
              neck_size_mm: initialData?.neck_size_mm || "",
              thread_type: initialData?.thread_type || "",
              cap_type: initialData?.cap_type || "",
              color: initialData?.color || "",
              material: initialData?.material || "",
              stock: initialData?.stock || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
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
                  label="Cap Type"
                  name="cap_type"
                  value={values.cap_type}
                  onChange={(e) => setFieldValue('cap_type', e.target.value)}
                  onBlur={(e) => setFieldValue('cap_type', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.cap_type && !!errors.cap_type}
                  helperText={touched.cap_type && typeof errors.cap_type === 'string' ? errors.cap_type : ''}
                />
                <TextField
                  fullWidth
                  label="Color (Optional)"
                  name="color"
                  value={values.color}
                  onChange={(e) => setFieldValue('color', e.target.value)}
                  onBlur={(e) => setFieldValue('color', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.color && !!errors.color}
                  helperText={touched.color && typeof errors.color === 'string' ? errors.color : ''}
                />
                <TextField
                  fullWidth
                  select
                  label="Material"
                  name="material"
                  value={values.material || ''}
                  onChange={(e) => setFieldValue('material', e.target.value)}
                  onBlur={(e) => setFieldValue('material', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.material && !!errors.material}
                  helperText={touched.material && typeof errors.material === 'string' ? errors.material : ''}
                >
                  {materials.map((mat) => (
                    <MenuItem key={mat} value={mat}>
                      {mat.charAt(0).toUpperCase() + mat.slice(1)}
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
