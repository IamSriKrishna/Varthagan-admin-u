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
  Typography,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { SalesOrder } from '@/models/salesOrder.model';
import { salesOrderValidationSchema } from './salesOrderForm.validation';
import { initialSalesOrderValues, transformSOToPayload } from './salesOrderForm.utils';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import SalesOrderBasicInfo from './SalesOrderBasicInfo';
import SalesOrderLineItems from './SalesOrderLineItems';
import SalesOrderBilling from './SalesOrderBilling';
import { CreateSalespersonDialog } from './CreateSalespersonDialog';
import { showToastMessage } from '@/utils/toastUtil';

interface SalesOrderFormProps {
  salesOrderId?: string;
}

const STEPS = [
  { label: 'Basic Info', icon: DescriptionOutlinedIcon, description: 'Customer & order details' },
  { label: 'Line Items', icon: ShoppingCartOutlinedIcon, description: 'Products & quantities' },
  { label: 'Billing', icon: PaymentOutlinedIcon, description: 'Tax, shipping & totals' },
];

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ salesOrderId }) => {
  const router = useRouter();
  const { getSalesOrder, createSalesOrder, updateSalesOrder, loading } = useSalesOrder();
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues, setInitialValues] = useState<SalesOrder>(initialSalesOrderValues);
  const [pageError, setPageError] = useState<string | null>(null);
  const [openCreateSalesperson, setOpenCreateSalesperson] = useState(false);
  const [salespersonRefreshTrigger, setSalespersonRefreshTrigger] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isEditMode = !!(salesOrderId && salesOrderId !== 'new');

  useEffect(() => {
    if (isEditMode) {
      getSalesOrder(salesOrderId)
        .then(setInitialValues)
        .catch(() => setPageError('Failed to load sales order'));
    }
  }, [salesOrderId]);

  const formik = useFormik<SalesOrder>({
    enableReinitialize: true,
    initialValues,
    validationSchema: salesOrderValidationSchema,
    onSubmit: async (values) => {
      const submitWithRetry = async (attemptsLeft = 3) => {
        try {
          setPageError(null);
          setIsSubmitting(true);

          // Generate a new reference number if there's a collision
          if (retryCount > 0 && !isEditMode) {
            const updatedValues = { ...values };
            // Force regenerate the reference number on retry
            updatedValues.reference_no = '';
            values = updatedValues;
          }

          const payload = transformSOToPayload(values);
          if (isEditMode) {
            await updateSalesOrder(salesOrderId!, payload);
            showToastMessage('Sales order updated successfully', 'success');
          } else {
            await createSalesOrder(payload);
            showToastMessage('Sales order created successfully', 'success');
          }
          router.push('/sales-orders');
        } catch (err: any) {
          const msg = err.message || 'Failed to save sales order';
          
          // Check if it's a duplicate entry error
          const isDuplicateError =
            msg.includes('Duplicate entry') ||
            msg.includes('1062') ||
            msg.includes('idx_sales_orders');

          if (isDuplicateError && attemptsLeft > 1 && !isEditMode) {
            // Retry for duplicate entries with exponential backoff
            setRetryCount((prev) => prev + 1);
            const backoffMs = Math.min(1000 * Math.pow(2, 3 - attemptsLeft), 5000);
            showToastMessage(
              `Duplicate entry detected. Retrying in ${backoffMs}ms... (${4 - attemptsLeft}/3)`,
              'info'
            );
            
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            
            return submitWithRetry(attemptsLeft - 1);
          }

          setPageError(msg);
          showToastMessage(msg, 'error');
        } finally {
          setIsSubmitting(false);
        }
      };

      await submitWithRetry();
    },
  });

  const handleSalespersonCreated = (sp: any) => {
    formik.setFieldValue('salesperson_id', sp.id);
    formik.setFieldValue('salesperson', sp);
    setOpenCreateSalesperson(false);
    setSalespersonRefreshTrigger((p) => p + 1);
  };

  const handleStepClick = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, activeStep]));
    setActiveStep(step);
  };

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, activeStep]));
    setActiveStep((p) => Math.min(p + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((p) => Math.max(p - 1, 0));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': { bgcolor: '#0f172a' },
          }}
        />
      )}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Header ── */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.75,
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              Back
            </Button>
            <Box sx={{ width: 1, height: 24, bgcolor: '#e2e8f0' }} />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography
                  sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
                >
                  {isEditMode ? 'Edit Sales Order' : 'New Sales Order'}
                </Typography>
                {isEditMode && formik.values.sales_order_no && (
                  <Chip
                    label={formik.values.sales_order_no}
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #e2e8f0',
                      height: 24,
                    }}
                  />
                )}
              </Stack>
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.25 }}>
                {isEditMode ? 'Update order details below' : 'Fill in the details to create a new order'}
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={loading || isSubmitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            onClick={() => formik.handleSubmit()}
            disabled={loading || isSubmitting}
            sx={{
              bgcolor: '#0f172a',
              borderRadius: 2.5,
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
              '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(15,23,42,0.35)' },
              '&:disabled': { bgcolor: '#cbd5e1', boxShadow: 'none' },
              transition: 'all 0.2s ease',
            }}
          >
            {isEditMode ? 'Update Order' : 'Create Order'}
          </Button>
        </Stack>

        {/* ── Error ── */}
        {pageError && (
          <Alert
            severity="error"
            onClose={() => setPageError(null)}
            sx={{ mb: 3, borderRadius: 2, border: '1px solid #fecaca' }}
          >
            {pageError}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
          {/* ── Step Sidebar ── */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #f1f5f9',
              borderRadius: 3,
              width: { xs: '100%', lg: 240 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 24 },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography
                sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2, px: 0.5 }}
              >
                Form Steps
              </Typography>
              <Stack spacing={0.5}>
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === idx;
                  const isDone = completedSteps.has(idx) && !isActive;
                  return (
                    <Box
                      key={idx}
                      onClick={() => handleStepClick(idx)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: isActive ? '#0f172a' : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: isActive ? '#0f172a' : '#f8fafc' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isActive ? 'rgba(255,255,255,0.15)' : isDone ? '#f0fdf4' : '#f1f5f9',
                          color: isActive ? '#fff' : isDone ? '#16a34a' : '#94a3b8',
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? <CheckCircleOutlineIcon sx={{ fontSize: 17 }} /> : <Icon sx={{ fontSize: 17 }} />}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: isActive ? '#fff' : '#334155',
                            lineHeight: 1.2,
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          sx={{ fontSize: '0.72rem', color: isActive ? 'rgba(255,255,255,0.6)' : '#94a3b8', mt: 0.15 }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              {/* Progress */}
              <Box sx={{ mt: 3, px: 0.5 }}>
                <Stack direction="row" justifyContent="space-between" mb={0.75}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Progress</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    {Math.round(((completedSteps.size) / STEPS.length) * 100)}%
                  </Typography>
                </Stack>
                <Box sx={{ height: 4, bgcolor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(completedSteps.size / STEPS.length) * 100}%`,
                      bgcolor: '#0f172a',
                      borderRadius: 2,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── Step Content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {activeStep === 0 && (
              <SalesOrderBasicInfo
                formik={formik}
                isEditMode={isEditMode}
                onOpenCreateSalesperson={() => setOpenCreateSalesperson(true)}
                salespersonRefreshTrigger={salespersonRefreshTrigger}
              />
            )}
            {activeStep === 1 && <SalesOrderLineItems formik={formik} />}
            {activeStep === 2 && <SalesOrderBilling formik={formik} />}

            {/* ── Step Navigation ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
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
                  '&:disabled': { opacity: 0.4 },
                }}
              >
                ← Previous
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 0.875,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#fff',
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={() => formik.handleSubmit()}
                  disabled={loading}
                  startIcon={<SaveIcon sx={{ fontSize: '17px !important' }} />}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 0.875,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#fff',
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#1e293b' },
                    '&:disabled': { bgcolor: '#cbd5e1' },
                  }}
                >
                  {isEditMode ? 'Update Order' : 'Create Order'}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>

      <CreateSalespersonDialog
        open={openCreateSalesperson}
        onClose={() => setOpenCreateSalesperson(false)}
        onSuccess={handleSalespersonCreated}
      />
    </Box>
  );
};

export default SalesOrderForm;