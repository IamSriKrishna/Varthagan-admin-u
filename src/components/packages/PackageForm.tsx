'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  CardContent,
  Chip,
  Collapse,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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

const PackageForm: React.FC<PackageFormProps> = ({ packageId }) => {
  const router = useRouter();
  const { getPackage, createPackage, updatePackage, loading } = usePackage();

  const [initialValues, setInitialValues] =
    useState<Package>(initialPackageValues);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      if (packageId && packageId !== 'new') {
        try {
          const pkg = await getPackage(packageId);
          setInitialValues(pkg);
        } catch {
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
  const packedItems = formik.values.items.filter(
    (item: any) => item.packed_qty > 0
  ).length;
  const totalItems = formik.values.items.length;

  const progress =
    totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fc',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Loading bar */}
      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            bgcolor: '#dbeafe',
            '& .MuiLinearProgress-bar': {
              background:
                'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            },
          }}
        />
      )}

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        {/* ── Sticky page header ── */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            px: { xs: 2, md: 3 },
            pt: 2.5,
            pb: 2,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #f0f0f5',
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
                flexShrink: 0,
              }}
            >
              <InventoryIcon sx={{ fontSize: 20, color: '#ffffff' }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#1a1d2e',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
                  }}
                >
                  {isEditMode ? 'Edit Package' : 'New Package'}
                </Typography>

                {isEditMode && packageId && (
                  <Chip
                    label={`#${packageId}`}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: '#f0f4ff',
                      color: '#4f63d2',
                      border: '1px solid #dbe4ff',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                )}
              </Box>

              <Typography
                noWrap
                sx={{
                  fontSize: '0.78rem',
                  color: '#9ca3af',
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.2,
                }}
              >
                {isEditMode
                  ? 'Update package information and packed quantities'
                  : 'Create a new package for your sales order'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              justifyContent: { xs: 'flex-end', sm: 'initial' },
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => router.push('/packages')}
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              disabled={loading || formik.isSubmitting}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#6b7280',
                borderColor: '#e5e7eb',
                px: 2,
                '&:hover': {
                  borderColor: '#d1d5db',
                  bgcolor: '#f9fafb',
                },
              }}
            >
              Cancel
            </Button>

            <BBButton
              type="submit"
              variant="contained"
              loading={loading || formik.isSubmitting}
              disabled={loading || formik.isSubmitting}
              startIcon={<SaveIcon sx={{ fontSize: '17px !important' }} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                px: 2.5,
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                  boxShadow: '0 6px 20px rgba(14,165,233,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': { opacity: 0.65 },
                transition: 'all 0.2s ease',
              }}
            >
              {isEditMode ? 'Update Package' : 'Create Package'}
            </BBButton>
          </Box>
        </Box>

        {/* ── Error banner ── */}
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5 }}>
          <Collapse in={Boolean(pageError)}>
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                bgcolor: '#fff5f5',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 16, color: '#dc2626' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#991b1b',
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.2,
                  }}
                >
                  Unable to save package
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: '#dc2626',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {pageError}
                </Typography>
              </Box>

              <Button
                onClick={() => setPageError(null)}
                sx={{
                  minWidth: 'auto',
                  p: 0.5,
                  color: '#dc2626',
                  fontSize: '0.75rem',
                }}
              >
                Close
              </Button>
            </Box>
          </Collapse>
        </Box>

        {/* ── Form body ── */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
          {/* Progress card */}
          {totalItems > 0 && (
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #eeeff5',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid #f0f0f5',
                  bgcolor: '#fafbff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '9px',
                      bgcolor: progress === 100 ? '#dcfce7' : '#f0f4ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: progress === 100 ? '#16a34a' : '#4f63d2',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: '#1a1d2e',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Packing Progress
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        fontFamily: "'DM Sans', sans-serif",
                        mt: 0.1,
                      }}
                    >
                      {packedItems} of {totalItems} items packed
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={`${progress}%`}
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: progress === 100 ? '#dcfce7' : '#f0f4ff',
                    color: progress === 100 ? '#15803d' : '#4f63d2',
                    border: '1px solid',
                    borderColor: progress === 100 ? '#bbf7d0' : '#dbe4ff',
                    borderRadius: '7px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </Box>

              <Box sx={{ p: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 7,
                    borderRadius: 999,
                    bgcolor: '#eef2ff',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      background:
                        progress === 100
                          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                          : 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Basic information card */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eeeff5',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid #f0f0f5',
                bgcolor: '#fafbff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '9px',
                    background:
                      'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#1a1d2e',
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '-0.2px',
                    }}
                  >
                    Basic Information
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      fontFamily: "'DM Sans', sans-serif",
                      mt: 0.1,
                    }}
                  >
                    Select the sales order and enter package details
                  </Typography>
                </Box>
              </Box>

              <Button
                startIcon={
                  <CalculateOutlinedIcon sx={{ fontSize: '16px !important' }} />
                }
                sx={{
                  textTransform: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#4f63d2',
                  border: '1px solid #c7d2fe',
                  borderRadius: '9px',
                  px: 1.75,
                  py: 0.65,
                  bgcolor: '#f0f4ff',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#e0e7ff',
                    borderColor: '#a5b4fc',
                  },
                }}
              >
                Evaluate Packing Geometry
              </Button>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <PackageBasicInfo formik={formik} />
            </CardContent>
          </Box>

          {/* Line items card */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eeeff5',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              mb: 3,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid #f0f0f5',
                bgcolor: '#fafbff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '9px',
                    bgcolor: '#f0f4ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ListAltOutlinedIcon
                    sx={{ fontSize: 16, color: '#4f63d2' }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#1a1d2e',
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '-0.2px',
                    }}
                  >
                    Line Items
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      fontFamily: "'DM Sans', sans-serif",
                      mt: 0.1,
                    }}
                  >
                    Configure the quantity packed for each order item
                  </Typography>
                </Box>
              </Box>

              {totalItems > 0 && (
                <Chip
                  label={`${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    height: 23,
                    bgcolor: '#f0f4ff',
                    color: '#4f63d2',
                    border: '1px solid #dbe4ff',
                    borderRadius: '7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              )}
            </Box>

            <CardContent sx={{ p: 3 }}>
              <PackageLineItems formik={formik} />
            </CardContent>
          </Box>

          {/* Bottom actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              pt: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem',
                color: '#9ca3af',
              }}
            >
              {totalItems} item{totalItems !== 1 ? 's' : ''} in this package
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => router.push('/packages')}
                disabled={loading || formik.isSubmitting}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: '#6b7280',
                  borderColor: '#e5e7eb',
                  px: 2.5,
                  '&:hover': {
                    borderColor: '#d1d5db',
                    bgcolor: '#f9fafb',
                  },
                }}
              >
                Cancel
              </Button>

              <BBButton
                type="submit"
                variant="contained"
                loading={loading || formik.isSubmitting}
                disabled={loading || formik.isSubmitting}
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  px: 3,
                  background:
                    'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { opacity: 0.65 },
                  transition: 'all 0.2s ease',
                }}
              >
                {isEditMode ? 'Update Package' : 'Create Package'}
              </BBButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PackageForm;