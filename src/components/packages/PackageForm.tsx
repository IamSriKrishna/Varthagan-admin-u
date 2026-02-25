'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  alpha,
  Fade,
  Typography,
  LinearProgress,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { showToastMessage } from '@/utils/toastUtil';
import { Package } from '@/models/package.model';
import { packageValidationSchema } from './packageForm.validation';
import {
  initialPackageValues,
  transformPackageToPayload,
} from './packageForm.utils';
import { usePackage } from '@/hooks/usePackage';
import PackageBasicInfo from './PackageBasicInfo';
import PackageLineItems from './PackageLineItems';
import BBButton from '@/lib/BBButton/BBButton';

interface PackageFormProps {
  packageId?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({
  packageId,
}) => {
  const router = useRouter();
  const { getPackage, createPackage, updatePackage, loading, error } =
    usePackage();
  const [initialValues, setInitialValues] = useState<Package>(
    initialPackageValues
  );
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      if (packageId && packageId !== 'new') {
        try {
          const pkg = await getPackage(packageId);
          setInitialValues(pkg);
        } catch (err) {
          setPageError('Failed to load package');
        }
      }
    };
    loadPackage();
  }, [packageId, getPackage]);

  const formik = useFormik<Package>({
    enableReinitialize: true,
    initialValues,
    validationSchema: packageValidationSchema,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        const payload = transformPackageToPayload(values);

        if (packageId && packageId !== 'new') {
          await updatePackage(packageId, payload);
          showToastMessage('Package updated successfully', 'success');
        } else {
          const newPkg = await createPackage(payload);
          showToastMessage('Package created successfully', 'success');
          router.push('/packages');
          return;
        }

        router.push('/packages');
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save package';
        setPageError(errorMessage);
        showToastMessage(errorMessage, 'error');
        console.error('Form submission error:', err);
      }
    },
  });

  const isEditMode = packageId && packageId !== 'new' ? true : false;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header with Title and Action Link */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isEditMode ? 'Edit Package' : 'New Package'}
        </Typography>
        <Typography
          component="a"
          href="#"
          sx={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          📐 Evaluate packing geometry
        </Typography>
      </Box>

      {/* Error Alert */}
      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {/* Loading State */}
      {loading && <LinearProgress />}

      {/* Form Card */}
      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          {/* Basic Info Section */}
          <Box sx={{ mb: 3 }}>
            <PackageBasicInfo formik={formik} />
          </Box>

          {/* Line Items Section */}
          <Box sx={{ mb: 3 }}>
            <PackageLineItems formik={formik} />
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Total Items: {formik.values.items.length}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/packages')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <BBButton
            variant="contained"
            onClick={() => formik.handleSubmit()}
            loading={loading}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, px: 3 }}
          >
            Save
          </BBButton>
        </Box>
      </Box>
    </Container>
  );
};

export default PackageForm;
