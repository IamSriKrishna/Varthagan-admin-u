'use client';

import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { appFetch } from '@/utils/fetchInterceptor';
import { config } from '@/config';
import { showToastMessage } from '@/utils/toastUtil';
import CloseIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';

interface CreateManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (manufacturer: any) => void;
}

const schema = Yup.object({
  name: Yup.string().required('Manufacturer name is required').min(2, 'Min 2 characters'),
});

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.9rem',
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f172a' },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem' },
};

function FieldLabel({ label }: { label: string }) {
  return (
    <Typography
      sx={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75 }}
    >
      {label}
    </Typography>
  );
}

export const CreateManufacturerDialog: React.FC<CreateManufacturerDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setServerError(null);
      const apiDomain = config.apiDomain || '';
      const res = await appFetch(`${apiDomain}/manufacturers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
        }),
      });
      const result = await res.json();
      if (res.ok && result) {
        showToastMessage('Manufacturer created successfully', 'success');
        onSuccess(result.data || result);
        onClose();
      } else {
        setServerError(result.message || result.error || 'Failed to create manufacturer');
      }
    } catch (err: any) {
      setServerError(err?.message || 'Failed to create manufacturer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          border: '1px solid #f1f5f9',
          borderRadius: 3,
          boxShadow: '0 24px 64px rgba(15,23,42,0.14)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <BuildIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Add Manufacturer
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Create a new manufacturer record
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ borderRadius: 1.5, color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9', color: '#475569' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Formik
        initialValues={{ name: '' }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, isSubmitting }) => (
          <Form>
            <Box sx={{ px: 3, py: 3 }}>
              <Stack spacing={2.5}>
                {serverError && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {serverError}
                  </Alert>
                )}

                <Box>
                  <FieldLabel label="Manufacturer Name *" />
                  <TextField
                    fullWidth
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="e.g. Advanced Manufacturing Co"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={isSubmitting}
                    sx={fieldSx}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.25,
              }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.875,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#64748b',
                  bgcolor: '#f1f5f9',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.875,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#fff',
                  bgcolor: '#0f172a',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
                  '&:disabled': { bgcolor: '#cbd5e1', color: '#fff' },
                  minWidth: 100,
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                ) : (
                  'Create'
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
