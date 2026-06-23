'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  alpha,
  Fade,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { PurchaseOrder } from '@/models/purchaseOrder.model';
import { purchaseOrderValidationSchema } from './purchaseOrderForm.validation';
import {
  initialPurchaseOrderValues,
  transformPOToPayload,
} from './purchaseOrderForm.utils';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import PurchaseOrderBasicInfo from './PurchaseOrderBasicInfo';
import PurchaseOrderLineItems from './PurchaseOrderLineItems';
import PurchaseOrderBilling from './PurchaseOrderBilling';
import BBButton from '@/lib/BBButton/BBButton';

const tokens = {
  brand: '#4f22f2',
  brandSoft: '#eef2ff',
  accent: '#0ea5e9',
  success: '#16a34a',
  warn: '#d97706',
  error: '#dc2626',
  neutral0: '#ffffff',
  neutral50: '#f8fafc',
  neutral100: '#f1f5f9',
  neutral200: '#e2e8f0',
  neutral300: '#cbd5e1',
  neutral500: '#64748b',
  neutral700: '#334155',
  neutral900: '#0f172a',
  radius: '14px',
  shadow: '0 4px 14px rgba(15,23,42,0.04)',
  shadowMd: '0 8px 18px rgba(79,34,242,0.25)',
};

const STEPS = [
  { label: 'Basic Info', sublabel: 'Order details & vendor', Icon: DescriptionIcon },
  { label: 'Line Items', sublabel: 'Products & quantities', Icon: ShoppingCartIcon },
  { label: 'Billing', sublabel: 'Payment & totals', Icon: PaymentIcon },
];

interface StepIndicatorProps {
  active: number;
  onChange: (i: number) => void;
}

function StepIndicator({ active, onChange }: StepIndicatorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: '5px',
        borderRadius: '999px',
        background: tokens.neutral100,
        border: `1px solid ${tokens.neutral200}`,
        width: 'fit-content',
      }}
    >
      {STEPS.map((step, i) => {
        const done = i < active;
        const current = i === active;
        const Icon = step.Icon;

        return (
          <React.Fragment key={i}>
            <Tooltip title={step.sublabel} placement="bottom" arrow>
              <Box
                onClick={() => onChange(i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: current ? 2 : 1.25,
                  py: 0.85,
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: '0.25s ease',
                  background: current
                    ? tokens.brand
                    : done
                      ? alpha(tokens.success, 0.1)
                      : 'transparent',
                  '&:hover': {
                    background: current ? tokens.brand : alpha(tokens.brand, 0.06),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: current
                      ? 'rgba(255,255,255,0.2)'
                      : done
                        ? alpha(tokens.success, 0.15)
                        : tokens.neutral200,
                    color: current ? '#fff' : done ? tokens.success : tokens.neutral500,
                  }}
                >
                  {done ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : <Icon sx={{ fontSize: 14 }} />}
                </Box>

                {current && (
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {step.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>

            {i < STEPS.length - 1 && (
              <Box
                sx={{
                  width: 16,
                  height: 1,
                  background: i < active ? alpha(tokens.success, 0.4) : tokens.neutral200,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Fade in timeout={250}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

function StepProgressBar({ active }: { active: number }) {
  const pct = Math.round(((active + 1) / STEPS.length) * 100);

  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 1.5, pt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.65 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.neutral500 }}>
          Step {active + 1} of {STEPS.length}
        </Typography>

        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: tokens.brand }}>
          {pct}% complete
        </Typography>
      </Box>

      <Box
        sx={{
          height: 5,
          borderRadius: 99,
          background: tokens.neutral200,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.accent})`,
            borderRadius: 99,
            transition: 'width 0.35s ease',
          }}
        />
      </Box>
    </Box>
  );
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: string;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ purchaseOrderId }) => {
  const router = useRouter();

  const { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, loading, error } =
    usePurchaseOrder();

  const [tabValue, setTabValue] = useState(0);
  const [initialValues, setInitialValues] = useState<PurchaseOrder>(
    initialPurchaseOrderValues as any
  );
  const [pageError, setPageError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isEdit = purchaseOrderId && purchaseOrderId !== 'new';

  useEffect(() => {
    if (!isEdit) return;

    const loadPurchaseOrder = async () => {
      try {
        const po = await getPurchaseOrder(purchaseOrderId!);
        setInitialValues(po);
      } catch {
        setPageError('Failed to load purchase order');
      }
    };

    loadPurchaseOrder();
  }, [purchaseOrderId, getPurchaseOrder, isEdit]);

  const formik = useFormik<PurchaseOrder>({
    enableReinitialize: true,
    initialValues,
    validationSchema: purchaseOrderValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        const payload = transformPOToPayload(values);

        if (isEdit) {
          await updatePurchaseOrder(purchaseOrderId!, payload);
        } else {
          await createPurchaseOrder(payload);
        }

        setSaved(true);
        setTimeout(() => router.push('/purchase-orders'), 800);
      } catch (err: any) {
        setPageError(
          err?.response?.data?.message || err?.message || 'Failed to save purchase order'
        );
      }
    },
  });

  const errorCount = Object.keys(formik.errors).filter(
    (k) => formik.touched[k as keyof typeof formik.touched]
  ).length;

  if (loading && isEdit) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          bgcolor: tokens.neutral50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={28} sx={{ color: tokens.brand }} />
      </Box>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
      `}</style>

      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          bgcolor: tokens.neutral50,
          fontFamily: "'DM Sans', sans-serif",
          p: 0,
          m: 0,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 'none',
            px: { xs: 1.25, md: 1.5 },
            py: { xs: 1.25, md: 1.5 },
          }}
        >
          <Fade in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 1.5,
                flexWrap: 'wrap',
                gap: 1.25,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      px: 1.4,
                      py: 0.35,
                      borderRadius: '7px',
                      background: tokens.brandSoft,
                      border: `1px solid ${alpha(tokens.brand, 0.16)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: tokens.brand,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {isEdit ? 'Editing' : 'New'}
                    </Typography>
                  </Box>

                  {isEdit && initialValues.purchase_order_no && (
                    <Chip
                      label={`# ${initialValues.purchase_order_no}`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        background: tokens.neutral100,
                        border: `1px solid ${tokens.neutral200}`,
                        color: tokens.neutral700,
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 800,
                    color: tokens.neutral900,
                    fontSize: { xs: '1.45rem', sm: '1.8rem' },
                    lineHeight: 1.15,
                    letterSpacing: -0.8,
                  }}
                >
                  {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    color: tokens.neutral500,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  {isEdit
                    ? 'Update the details below and save your changes'
                    : 'Fill in all three sections to create your purchase order'}
                </Typography>
              </Box>

              <StepIndicator active={tabValue} onChange={setTabValue} />
            </Box>
          </Fade>

          {(pageError || error) && (
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{
                mb: 1.25,
                borderRadius: tokens.radius,
                border: `1px solid ${alpha(tokens.error, 0.3)}`,
                background: '#fef2f2',
              }}
            >
              {pageError || error}
            </Alert>
          )}

          {errorCount > 0 && (
            <Alert
              severity="warning"
              sx={{
                mb: 1.25,
                borderRadius: tokens.radius,
                border: `1px solid ${alpha(tokens.warn, 0.3)}`,
                background: '#fffbeb',
              }}
            >
              {errorCount} field{errorCount > 1 ? 's need' : ' needs'} attention
            </Alert>
          )}

          <Fade in timeout={350}>
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${tokens.neutral200}`,
                boxShadow: tokens.shadow,
                overflow: 'hidden',
                background: tokens.neutral0,
                width: '100%',
              }}
            >
              {loading && (
                <LinearProgress
                  sx={{
                    height: 3,
                    background: tokens.neutral100,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.accent})`,
                    },
                  }}
                />
              )}

              <Box
                sx={{
                  display: 'flex',
                  borderBottom: `1px solid ${tokens.neutral200}`,
                  background: tokens.neutral50,
                  px: 1.25,
                  pt: 1.25,
                  gap: 0.75,
                }}
              >
                {STEPS.map((step, i) => {
                  const done = i < tabValue;
                  const current = i === tabValue;
                  const Icon = step.Icon;

                  return (
                    <Box
                      key={i}
                      onClick={() => setTabValue(i)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.75,
                        py: 1.1,
                        borderRadius: '10px 10px 0 0',
                        cursor: 'pointer',
                        background: current ? tokens.neutral0 : 'transparent',
                        borderTop: current
                          ? `2px solid ${tokens.brand}`
                          : '2px solid transparent',
                        borderLeft: current
                          ? `1px solid ${tokens.neutral200}`
                          : '1px solid transparent',
                        borderRight: current
                          ? `1px solid ${tokens.neutral200}`
                          : '1px solid transparent',
                        mb: current ? '-1px' : 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: current
                            ? alpha(tokens.brand, 0.1)
                            : done
                              ? alpha(tokens.success, 0.1)
                              : tokens.neutral200,
                          color: current
                            ? tokens.brand
                            : done
                              ? tokens.success
                              : tokens.neutral500,
                        }}
                      >
                        {done ? (
                          <CheckCircleIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <Icon sx={{ fontSize: 14 }} />
                        )}
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: '0.78rem',
                            fontWeight: current ? 800 : 600,
                            color: current ? tokens.neutral900 : tokens.neutral500,
                          }}
                        >
                          {step.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: '0.66rem',
                            color: tokens.neutral500,
                            display: { xs: 'none', sm: 'block' },
                          }}
                        >
                          {step.sublabel}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <StepProgressBar active={tabValue} />

              <form onSubmit={formik.handleSubmit}>
                <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 2 }}>
                  <TabPanel value={tabValue} index={0}>
                    <PurchaseOrderBasicInfo formik={formik} />
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <PurchaseOrderLineItems formik={formik} />
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <PurchaseOrderBilling formik={formik} />
                  </TabPanel>
                </Box>

                <Box
                  sx={{
                    borderTop: `1px solid ${tokens.neutral200}`,
                    px: { xs: 1.5, md: 2 },
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: tokens.neutral50,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {tabValue > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '12px !important' }} />}
                        onClick={() => setTabValue(tabValue - 1)}
                        disabled={loading}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          height: 36,
                          px: 2,
                          borderRadius: '10px',
                          borderColor: tokens.neutral300,
                          color: tokens.neutral700,
                        }}
                      >
                        Previous
                      </Button>
                    )}

                    {tabValue < STEPS.length - 1 && (
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
                        onClick={() => setTabValue(tabValue + 1)}
                        disabled={loading}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          height: 36,
                          px: 2,
                          borderRadius: '10px',
                          borderColor: tokens.brand,
                          color: tokens.brand,
                          background: tokens.brandSoft,
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    <BBButton
                      variant="outlined"
                      startIcon={<CancelIcon sx={{ fontSize: '15px !important' }} />}
                      onClick={() => router.push('/purchase-orders')}
                      disabled={loading}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        height: 36,
                        px: 2,
                        borderRadius: '10px',
                        borderColor: tokens.neutral300,
                        color: tokens.neutral500,
                      }}
                    >
                      Cancel
                    </BBButton>

                    <Tooltip
                      title={!formik.isValid ? 'Please fix all errors before saving' : ''}
                      arrow
                    >
                      <span>
                        <BBButton
                          type="submit"
                          variant="contained"
                          disabled={loading || !formik.isValid}
                          startIcon={
                            loading ? undefined : saved ? (
                              <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                            ) : (
                              <SaveIcon sx={{ fontSize: '16px !important' }} />
                            )
                          }
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            height: 36,
                            px: 2.5,
                            borderRadius: '10px',
                            minWidth: 140,
                            boxShadow: formik.isValid ? tokens.shadowMd : 'none',
                            background: saved
                              ? tokens.success
                              : !formik.isValid
                                ? tokens.neutral300
                                : `linear-gradient(135deg, ${tokens.brand}, ${tokens.accent})`,
                          }}
                        >
                          {loading ? (
                            <CircularProgress size={18} sx={{ color: '#fff' }} />
                          ) : saved ? (
                            'Saved!'
                          ) : (
                            'Save Purchase Order'
                          )}
                        </BBButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </form>
            </Card>
          </Fade>

          <Typography
            sx={{
              mt: 1.25,
              textAlign: 'center',
              fontSize: '0.72rem',
              color: tokens.neutral500,
            }}
          >
            All fields marked with an asterisk (*) are required. Changes are not auto-saved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default PurchaseOrderForm;