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
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { bottleSizeService } from "@/lib/api/productService";

interface BottleSizeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const validationSchema = Yup.object({
  size_ml: Yup.number()
    .required("Size in ML is required")
    .min(100, "Minimum size is 100 ML")
    .max(20000, "Maximum size is 20000 ML"),
  size_label: Yup.string()
    .required("Size label is required")
    .min(1, "Label is too short")
    .max(50, "Label is too long"),
});

export default function BottleSizeForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: BottleSizeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      if (initialData?.id) {
        await bottleSizeService.updateBottleSize(initialData.id, {
          size_ml: Number(values.size_ml),
          size_label: values.size_label,
        });
      } else {
        await bottleSizeService.createBottleSize({
          size_ml: Number(values.size_ml),
          size_label: values.size_label,
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
        {initialData ? "Edit Bottle Size" : "Create New Bottle Size"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%',
                  wordBreak: 'break-word',
                }
              }}
            >
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{
              size_ml: initialData?.size_ml || "",
              size_label: initialData?.size_label || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <TextField
                  fullWidth
                  label="Size (ML)"
                  name="size_ml"
                  type="number"
                  value={values.size_ml}
                  onChange={(e) => setFieldValue('size_ml', e.target.value)}
                  onBlur={(e) => setFieldValue('size_ml', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.size_ml && !!errors.size_ml}
                  helperText={touched.size_ml && typeof errors.size_ml === 'string' ? errors.size_ml : ''}
                />
                <TextField
                  fullWidth
                  label="Size Label"
                  name="size_label"
                  value={values.size_label}
                  onChange={(e) => setFieldValue('size_label', e.target.value)}
                  onBlur={(e) => setFieldValue('size_label', e.target.value)}
                  sx={{ mb: 2 }}
                  error={touched.size_label && !!errors.size_label}
                  helperText={touched.size_label && typeof errors.size_label === 'string' ? errors.size_label : ''}
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
