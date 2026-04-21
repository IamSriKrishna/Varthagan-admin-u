'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIos';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import { showToastMessage } from '@/utils/toastUtil';
import { Package } from '@/models/package.model';
import { packageValidationSchema } from './packageForm.validation';
import { initialPackageValues, transformPackageToPayload } from './packageForm.utils';
import { usePackage } from '@/hooks/usePackage';
import PackageBasicInfo from './PackageBasicInfo';
import PackageLineItems from './PackageLineItems';
import BBButton from '@/lib/BBButton/BBButton';

interface PackageFormProps {
  packageId?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({ packageId }) => {
  const router = useRouter();
  const { getPackage, createPackage, updatePackage, loading, error } = usePackage();
  const [initialValues, setInitialValues] = useState<Package>(initialPackageValues);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      if (packageId && packageId !== 'new') {
        try {
          const pkg = await getPackage(packageId);
          setInitialValues(pkg);
        } catch { setPageError('Failed to load package'); }
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
          await createPackage(payload);
          showToastMessage('Package created successfully', 'success');
          router.push('/packages');
          return;
        }
        router.push('/packages');
      } catch (err: any) {
        const msg = err.message || 'Failed to save package';
        setPageError(msg);
        showToastMessage(msg, 'error');
      }
    },
  });

  const isEditMode = Boolean(packageId && packageId !== 'new');
  const progress = formik.values.items.length > 0
    ? Math.round((formik.values.items.filter((i: any) => i.packed_qty > 0).length / formik.values.items.length) * 100)
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, '& .MuiLinearProgress-bar': { backgroundColor: '#6366f1' }, backgroundColor: '#c7d2fe' }} />}

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => router.push('/packages')}
              sx={{ textTransform: 'none', fontFamily: '"DM Sans"', color: '#64748b', fontSize: '0.82rem', fontWeight: 500, px: 1.5, borderRadius: '8px', '&:hover': { backgroundColor: '#f1f5f9', color: '#0f172a' } }}
            >
              Packages
            </Button>
            <Box sx={{ width: 1, height: 16, backgroundColor: '#e2e8f0' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(99,102,241,0.3)' }}>
                <InventoryIcon sx={{ color: 'white', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  {isEditMode ? 'Edit Package' : 'New Package'}
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {isEditMode ? `Editing package #${packageId}` : 'Fill in the details below'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            startIcon={<CalculateOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.82rem',
              color: '#6366f1', border: '1.5px solid #c7d2fe', borderRadius: '10px', px: 2, py: 0.75,
              backgroundColor: '#eef2ff',
              '&:hover': { backgroundColor: '#e0e7ff', borderColor: '#818cf8' },
            }}
          >
            Evaluate packing geometry
          </Button>
        </Box>

        {/* ── Progress ── */}
        {formik.values.items.length > 0 && (
          <Box sx={{ mb: 3, p: 2.5, backgroundColor: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>Packing progress</Typography>
                <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 600, fontSize: '0.82rem', color: '#6366f1' }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e7ff', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: progress === 100 ? '#10b981' : '#6366f1' } }} />
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                {formik.values.items.filter((i: any) => i.packed_qty > 0).length}/{formik.values.items.length}
              </Typography>
              <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#94a3b8' }}>items packed</Typography>
            </Box>
          </Box>
        )}

        {/* ── Error ── */}
        {pageError && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', display: 'flex', gap: 1.5 }}>
            <Typography sx={{ fontSize: '1rem' }}>⚠️</Typography>
            <Typography sx={{ fontFamily: '"DM Sans"', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>{pageError}</Typography>
          </Box>
        )}

        {/* ── Form Sections ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Basic Info Card */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1.5px solid #f1f5f9', overflow: 'visible' }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#6366f1' }} />
              <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                Basic Information
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <PackageBasicInfo formik={formik} />
            </CardContent>
          </Card>

          {/* Line Items Card */}
          <Card sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1.5px solid #f1f5f9', overflow: 'visible' }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#8b5cf6' }} />
              <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                Line Items
              </Typography>
              {formik.values.items.length > 0 && (
                <Box sx={{ ml: 'auto', px: 1.5, py: 0.25, backgroundColor: '#eef2ff', borderRadius: '6px' }}>
                  <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 600, fontSize: '0.78rem', color: '#6366f1' }}>
                    {formik.values.items.length} items
                  </Typography>
                </Box>
              )}
            </Box>
            <CardContent sx={{ p: 3 }}>
              <PackageLineItems formik={formik} />
            </CardContent>
          </Card>
        </Box>

        {/* ── Footer Actions ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, p: 2.5, backgroundColor: '#fff', borderRadius: '14px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#94a3b8' }}>
            {formik.values.items.length} item{formik.values.items.length !== 1 ? 's' : ''} in this package
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/packages')}
              sx={{ textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600, borderRadius: '10px', px: 3, borderColor: '#e2e8f0', color: '#374151', '&:hover': { borderColor: '#c7d2fe', backgroundColor: '#f8faff' } }}
            >
              Cancel
            </Button>
            <BBButton
              variant="contained"
              onClick={() => formik.handleSubmit()}
              loading={loading}
              startIcon={<SaveIcon />}
              sx={{
                textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600,
                borderRadius: '10px', px: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
              }}
            >
              {isEditMode ? 'Save Changes' : 'Create Package'}
            </BBButton>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default PackageForm;