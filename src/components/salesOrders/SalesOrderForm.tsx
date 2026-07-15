'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
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
import { initialSalesOrderValues, transformSOToPayload, transformAPIResponseToFormValues } from './salesOrderForm.utils';
import { useSalesOrder } from '@/hooks/useSalesOrder';
import SalesOrderBasicInfo from './SalesOrderBasicInfo';
import SalesOrderLineItems from './SalesOrderLineItems';
import SalesOrderBilling from './SalesOrderBilling';
import { CreateSalespersonDialog } from './CreateSalespersonDialog';
import { showToastMessage } from '@/utils/toastUtil';

interface SalesOrderFormProps {
  salesOrderId?: string;
  mode?: 'view' | 'edit';
}

const STEPS = [
  { label: 'Basic Info', icon: DescriptionOutlinedIcon, description: 'Customer & order details' },
  { label: 'Line Items', icon: ShoppingCartOutlinedIcon, description: 'Products & quantities' },
  { label: 'Billing', icon: PaymentOutlinedIcon, description: 'Tax, shipping & totals' },
];

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ salesOrderId, mode = 'edit' }) => {
  // Debug logs to verify props and mode during navigation
  // eslint-disable-next-line no-console
  console.log('SalesOrderForm props:', { salesOrderId, mode });
  const router = useRouter();
  const { getSalesOrder, createSalesOrder, updateSalesOrder, loading } = useSalesOrder();
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues, setInitialValues] = useState<SalesOrder>(initialSalesOrderValues as any);
  const [pageError, setPageError] = useState<string | null>(null);
  const [openCreateSalesperson, setOpenCreateSalesperson] = useState(false);
  const [salespersonRefreshTrigger, setSalespersonRefreshTrigger] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isEditMode = !!(salesOrderId && salesOrderId !== 'new');
  const isViewMode = mode === 'view' && isEditMode;

  useEffect(() => {
    if (isEditMode && salesOrderId) {
      getSalesOrder(salesOrderId)
        .then((data) => {
          console.log('Loaded sales order:', data);
          const transformedData = transformAPIResponseToFormValues(data);
          console.log('Transformed data:', transformedData);
          setInitialValues(transformedData);
        })
        .catch((error) => {
          console.error('Failed to load sales order:', error);
          setPageError('Failed to load sales order');
        });
    }
  }, [salesOrderId, getSalesOrder]);

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

  // Ensure Formik gets the latest initialValues (explicit set for reliability)
  useEffect(() => {
    if (!initialValues) return;
    try {
      // eslint-disable-next-line no-console
      console.log('Applying initialValues to Formik:', initialValues);
      formik.setValues(initialValues as any);
      if ((initialValues as any).customer) formik.setFieldValue('customer', (initialValues as any).customer);
      if ((initialValues as any).salesperson) formik.setFieldValue('salesperson', (initialValues as any).salesperson);
      if ((initialValues as any).line_items) formik.setFieldValue('line_items', (initialValues as any).line_items);
    } catch (e) {
      // ignore
    }
  }, [initialValues]);

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fc', fontFamily: "'DM Sans', sans-serif" }}>
      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            bgcolor: '#eeeff5',
            '& .MuiLinearProgress-bar': { bgcolor: '#4f63d2' },
          }}
        />
      )}

      <Box sx={{ width: '100%' }}>
        {/* ── Sticky page header ── */}
<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    px: 3,
    pt: 2.5,
    pb: 2,
    bgcolor: "#ffffff",
    borderBottom: "1px solid #f0f0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
  }}
>
  {/* Left side */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      minWidth: 0,
    }}
  >
    {/* Icon badge */}
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
        flexShrink: 0,
      }}
    >
      <ShoppingCartOutlinedIcon sx={{ fontSize: 20, color: "#ffffff" }} />
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography
          noWrap
          sx={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#1a1d2e",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}
        >
          {isViewMode
            ? "View Sales Order"
            : isEditMode
              ? "Edit Sales Order"
              : "New Sales Order"}
        </Typography>

        {isEditMode && formik.values.sales_order_no && (
          <Chip
            label={formik.values.sales_order_no}
            size="small"
            sx={{
              height: 22,
              bgcolor: "#f0f4ff",
              color: "#4f63d2",
              border: "1px solid #dbe4ff",
              borderRadius: "6px",
              fontSize: "0.68rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              flexShrink: 0,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        )}
      </Box>

      <Typography
        noWrap
        sx={{
          fontSize: "0.78rem",
          color: "#9ca3af",
          fontFamily: "'DM Sans', sans-serif",
          mt: 0.2,
        }}
      >
        {isViewMode
          ? "Review sales order information"
          : isEditMode
            ? "Update sales order information"
            : "Add a new sales order to your system"}
      </Typography>
    </Box>
  </Box>

  {/* Header actions */}
  <Box
    sx={{
      display: "flex",
      gap: 1.5,
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    <Button
      variant="outlined"
      onClick={() => router.back()}
      startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
      disabled={loading || isSubmitting}
      sx={{
        borderRadius: "10px",
        textTransform: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: "0.875rem",
        color: "#6b7280",
        borderColor: "#e5e7eb",
        px: 2,
        "&:hover": {
          borderColor: "#d1d5db",
          bgcolor: "#f9fafb",
        },
      }}
    >
      Cancel
    </Button>

    {!isViewMode && (
      <Button
        variant="contained"
        startIcon={
          loading || isSubmitting ? (
            <CircularProgress size={16} sx={{ color: "#ffffff" }} />
          ) : (
            <SaveIcon sx={{ fontSize: "17px !important" }} />
          )
        }
        onClick={() => formik.handleSubmit()}
        disabled={loading || isSubmitting}
        sx={{
          borderRadius: "10px",
          textTransform: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: "0.875rem",
          px: 2.5,
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
          boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
            boxShadow: "0 6px 20px rgba(14,165,233,0.45)",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            color: "#ffffff",
            opacity: 0.65,
            background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
          },
          transition: "all 0.2s ease",
        }}
      >
        {isEditMode ? "Update Order" : "Create Order"}
      </Button>
    )}
  </Box>
</Box>

        {/* ── Error ── */}
        {pageError && (
          <Alert
            severity="error"
            onClose={() => setPageError(null)}
            sx={{ mb: 3, borderRadius: '10px', border: '1px solid #fecaca' }}
          >
            {pageError}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start" sx={{ px: 3, pb: 4 }}>
          {/* ── Step Sidebar ── */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #eeeff5',
              borderRadius: '16px',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              width: { xs: '100%', lg: 240 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 96 },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography
                sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2, px: 0.5 }}
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
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isActive ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': { background: isActive ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : '#f0f4ff' },
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
                          bgcolor: isActive ? 'rgba(255,255,255,0.15)' : isDone ? '#f0fdf4' : '#f0f0f5',
                          color: isActive ? '#fff' : isDone ? '#16a34a' : '#9ca3af',
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
                            color: isActive ? '#fff' : '#1a1d2e',
                            lineHeight: 1.2,
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          sx={{ fontSize: '0.72rem', color: isActive ? 'rgba(255,255,255,0.6)' : '#9ca3af', mt: 0.15 }}
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
                  <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>Progress</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 700 }}>
                    {Math.round(((completedSteps.size) / STEPS.length) * 100)}%
                  </Typography>
                </Stack>
                <Box sx={{ height: 4, bgcolor: '#f0f0f5', borderRadius: '10px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(completedSteps.size / STEPS.length) * 100}%`,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                      borderRadius: '10px',
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
                isViewMode={isViewMode}
                onOpenCreateSalesperson={() => setOpenCreateSalesperson(true)}
                salespersonRefreshTrigger={salespersonRefreshTrigger}
              />
            )}
            {activeStep === 1 && <SalesOrderLineItems formik={formik} isViewMode={isViewMode} customerId={formik.values.customer_id} />}
            {activeStep === 2 && <SalesOrderBilling formik={formik} isViewMode={isViewMode} />}

            {/* ── Step Navigation ── */}
            {!isViewMode && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.875,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#6b7280',
                    bgcolor: '#f0f0f5',
                    '&:hover': { bgcolor: '#eeeff5' },
                    '&:disabled': { opacity: 0.4 },
                  }}
                >
                  ← Previous
                </Button>

                {activeStep < STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    sx={{
                      borderRadius: '10px',
                      px: 2.5,
                      py: 0.875,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#fff',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)' },
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
                      borderRadius: '10px',
                      px: 2.5,
                      py: 0.875,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#fff',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)' },
                      '&:disabled': { bgcolor: '#d1d5db' },
                    }}
                  >
                    {isEditMode ? 'Update Order' : 'Create Order'}
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <CreateSalespersonDialog
        open={openCreateSalesperson}
        onClose={() => setOpenCreateSalesperson(false)}
        onSuccess={handleSalespersonCreated}
      />
    </Box>
  );
};

export default SalesOrderForm;