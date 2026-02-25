'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { appFetch } from '@/utils/fetchInterceptor';
import { config } from '@/config';
import { salespersons } from '@/constants/apiConstants';
import { showToastMessage } from '@/utils/toastUtil';

interface CreateSalespersonDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (salesperson: any) => void;
}

const createSalespersonSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const CreateSalespersonDialog: React.FC<CreateSalespersonDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setLoading(true);
      setError(null);
      const apiDomain = config.apiDomain || '';

      const response = await appFetch(
        `${apiDomain}${salespersons.postSalesperson}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result) {
        showToastMessage('Salesperson created successfully', 'success');
        // If result has 'data' property, use it; otherwise use the entire result
        const salespersonData = result.data || result;
        onSuccess(salespersonData);
        onClose();
      } else {
        setError(result.message || result.error || 'Failed to create salesperson');
        showToastMessage(
          result.message || result.error || 'Failed to create salesperson',
          'error'
        );
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create salesperson';
      setError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Create New Salesperson
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Formik
          initialValues={{
            name: '',
            email: '',
          }}
          validationSchema={createSalespersonSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  fullWidth
                  label="Name *"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Email *"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={loading}
                />
              </Stack>
            </Form>
          )}
        </Formik>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ position: 'relative' }}
        >
          {loading && (
            <CircularProgress size={24} sx={{ position: 'absolute' }} />
          )}
          <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
            Create
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
