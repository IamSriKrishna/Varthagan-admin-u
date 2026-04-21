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
  Divider,
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
  brand:    '#2563EB',
  brandSoft:'#EFF6FF',
  accent:   '#0EA5E9',
  success:  '#16A34A',
  warn:     '#D97706',
  error:    '#DC2626',
  neutral0: '#FFFFFF',
  neutral50:'#F8FAFC',
  neutral100:'#F1F5F9',
  neutral200:'#E2E8F0',
  neutral300:'#CBD5E1',
  neutral500:'#64748B',
  neutral700:'#334155',
  neutral900:'#0F172A',
  radius:   '14px',
  shadow:   '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06)',
  shadowMd: '0 4px 24px rgba(37,99,235,0.10)',
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Basic Info',  sublabel: 'Order details & vendor', Icon: DescriptionIcon },
  { label: 'Line Items',  sublabel: 'Products & quantities',  Icon: ShoppingCartIcon },
  { label: 'Billing',     sublabel: 'Payment & totals',       Icon: PaymentIcon },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
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
        gap: 0,
        p: '6px',
        borderRadius: '50px',
        background: tokens.neutral100,
        border: `1px solid ${tokens.neutral200}`,
        width: 'fit-content',
      }}
    >
      {STEPS.map((step, i) => {
        const done    = i < active;
        const current = i === active;
        const Icon    = step.Icon;

        return (
          <React.Fragment key={i}>
            <Tooltip title={step.sublabel} placement="bottom" arrow>
              <Box
                onClick={() => onChange(i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: current ? 2.5 : 1.5,
                  py: 1,
                  borderRadius: '40px',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  background: current
                    ? tokens.brand
                    : done
                    ? alpha(tokens.success, 0.1)
                    : 'transparent',
                  '&:hover': {
                    background: current
                      ? tokens.brand
                      : alpha(tokens.brand, 0.06),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: current
                      ? 'rgba(255,255,255,0.2)'
                      : done
                      ? alpha(tokens.success, 0.15)
                      : tokens.neutral200,
                    color: current
                      ? 'white'
                      : done
                      ? tokens.success
                      : tokens.neutral500,
                    flexShrink: 0,
                  }}
                >
                  {done ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <Icon sx={{ fontSize: 15 }} />
                  )}
                </Box>
                {current && (
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'white',
                      letterSpacing: 0.2,
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
                  width: 20,
                  height: 1,
                  background: i < active ? alpha(tokens.success, 0.4) : tokens.neutral200,
                  transition: 'background 0.4s',
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Fade in timeout={350}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StepProgressBar({ active }: { active: number }) {
  const pct = Math.round(((active + 1) / STEPS.length) * 100);
  return (
    <Box sx={{ px: 4, pb: 3, pt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: tokens.neutral500, fontFamily: "'DM Sans', sans-serif" }}>
          Step {active + 1} of {STEPS.length}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.brand, fontFamily: "'DM Sans', sans-serif" }}>
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
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface PurchaseOrderFormProps { purchaseOrderId?: string; }

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ purchaseOrderId }) => {
  const router = useRouter();
  const { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, loading, error } =
    usePurchaseOrder();
  const [tabValue, setTabValue]       = useState(0);
  const [initialValues, setInitialValues] = useState<PurchaseOrder>(initialPurchaseOrderValues);
  const [pageError, setPageError]     = useState<string | null>(null);
  const [saved, setSaved]             = useState(false);
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

  // Loading state
  if (loading && isEdit) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: tokens.neutral50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: tokens.brandSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CircularProgress size={28} sx={{ color: tokens.brand }} />
          </Box>
          <Typography
            sx={{ color: tokens.neutral700, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
          >
            Loading purchase order…
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');`}</style>

      <Box
        sx={{
          minHeight: '100vh',
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${alpha(tokens.brand, 0.06)} 0%, ${tokens.neutral50} 60%)`,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 5 }}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Fade in timeout={400}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.4,
                      borderRadius: '6px',
                      background: tokens.brandSoft,
                      border: `1px solid ${alpha(tokens.brand, 0.15)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: tokens.brand,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontFamily: "'DM Sans', sans-serif",
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
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.75rem',
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
                    fontSize: { xs: '1.5rem', sm: '1.9rem' },
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                  }}
                >
                  {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    color: tokens.neutral500,
                    fontSize: '0.875rem',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {isEdit
                    ? 'Update the details below and save your changes'
                    : 'Fill in all three sections to create your purchase order'}
                </Typography>
              </Box>

              {/* Step pill */}
              <StepIndicator active={tabValue} onChange={setTabValue} />
            </Box>
          </Fade>

          {/* ── Alerts ──────────────────────────────────────────────────────── */}
          {(pageError || error) && (
            <Fade in>
              <Alert
                severity="error"
                icon={<ErrorOutlineIcon />}
                sx={{
                  mb: 3,
                  borderRadius: tokens.radius,
                  border: `1px solid ${alpha(tokens.error, 0.3)}`,
                  background: '#FEF2F2',
                  fontFamily: "'DM Sans', sans-serif",
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.25 }}>
                  Something went wrong
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#7f1d1d' }}>
                  {pageError || error}
                </Typography>
              </Alert>
            </Fade>
          )}

          {errorCount > 0 && (
            <Fade in>
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  borderRadius: tokens.radius,
                  border: `1px solid ${alpha(tokens.warn, 0.3)}`,
                  background: '#FFFBEB',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.5 }}>
                  {errorCount} field{errorCount > 1 ? 's need' : ' needs'} attention
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {Object.entries(formik.errors)
                    .filter(([k]) => formik.touched[k as keyof typeof formik.touched])
                    .map(([k, e]) => (
                      <Typography
                        key={k}
                        component="li"
                        sx={{ fontSize: '0.8rem', color: '#92400e', mb: 0.25 }}
                      >
                        {String(e)}
                      </Typography>
                    ))}
                </Box>
              </Alert>
            </Fade>
          )}

          {/* ── Main Card ────────────────────────────────────────────────────── */}
          <Fade in timeout={500}>
            <Card
              sx={{
                borderRadius: '20px',
                border: `1px solid ${tokens.neutral200}`,
                boxShadow: tokens.shadow,
                overflow: 'hidden',
                background: tokens.neutral0,
              }}
            >
              {loading && (
                <LinearProgress
                  sx={{
                    height: 3,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.accent})`,
                    },
                    background: tokens.neutral100,
                  }}
                />
              )}

              {/* Tab strip */}
              <Box
                sx={{
                  display: 'flex',
                  borderBottom: `1px solid ${tokens.neutral200}`,
                  background: tokens.neutral50,
                  px: 2,
                  pt: 2,
                  gap: 1,
                }}
              >
                {STEPS.map((step, i) => {
                  const done    = i < tabValue;
                  const current = i === tabValue;
                  const Icon    = step.Icon;
                  return (
                    <Box
                      key={i}
                      onClick={() => setTabValue(i)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        px: 2.5,
                        py: 1.5,
                        borderRadius: '10px 10px 0 0',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.25s ease',
                        background: current ? tokens.neutral0 : 'transparent',
                        borderTop: current ? `2px solid ${tokens.brand}` : '2px solid transparent',
                        borderLeft: current ? `1px solid ${tokens.neutral200}` : '1px solid transparent',
                        borderRight: current ? `1px solid ${tokens.neutral200}` : '1px solid transparent',
                        mb: current ? '-1px' : 0,
                        '&:hover': {
                          background: current ? tokens.neutral0 : alpha(tokens.brand, 0.04),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
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
                          flexShrink: 0,
                        }}
                      >
                        {done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <Icon sx={{ fontSize: 15 }} />}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: current ? 700 : 500,
                            color: current ? tokens.neutral900 : tokens.neutral500,
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.2,
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.68rem',
                            color: tokens.neutral500,
                            fontFamily: "'DM Sans', sans-serif",
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

              {/* Progress bar */}
              <StepProgressBar active={tabValue} />

              {/* Form body */}
              <form onSubmit={formik.handleSubmit}>
                <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4 }}>
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

                {/* Footer */}
                <Box
                  sx={{
                    borderTop: `1px solid ${tokens.neutral200}`,
                    px: { xs: 2, sm: 4 },
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: tokens.neutral50,
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {/* Left: Prev / Next */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {tabValue > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '13px !important' }} />}
                        onClick={() => setTabValue(tabValue - 1)}
                        disabled={loading}
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          py: 1,
                          px: 2.5,
                          borderRadius: '10px',
                          borderColor: tokens.neutral300,
                          color: tokens.neutral700,
                          '&:hover': { borderColor: tokens.brand, color: tokens.brand, background: tokens.brandSoft },
                        }}
                      >
                        Previous
                      </Button>
                    )}
                    {tabValue < STEPS.length - 1 && (
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIosIcon sx={{ fontSize: '13px !important' }} />}
                        onClick={() => setTabValue(tabValue + 1)}
                        disabled={loading}
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          py: 1,
                          px: 2.5,
                          borderRadius: '10px',
                          borderColor: tokens.brand,
                          color: tokens.brand,
                          background: tokens.brandSoft,
                          '&:hover': { background: alpha(tokens.brand, 0.1) },
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>

                  {/* Right: Cancel + Save */}
                  <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
                    <BBButton
                      variant="outlined"
                      startIcon={<CancelIcon sx={{ fontSize: '16px !important' }} />}
                      onClick={() => router.push('/purchase-orders')}
                      disabled={loading}
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        textTransform: 'none',
                        py: 1,
                        px: 2.5,
                        borderRadius: '10px',
                        borderColor: tokens.neutral300,
                        color: tokens.neutral500,
                        '&:hover': {
                          borderColor: tokens.error,
                          color: tokens.error,
                          background: '#FEF2F2',
                        },
                      }}
                    >
                      Cancel
                    </BBButton>

                    <Tooltip
                      title={!formik.isValid ? 'Please fix all errors before saving' : ''}
                      arrow
                      placement="top"
                    >
                      <span>
                        <BBButton
                          type="submit"
                          variant="contained"
                          disabled={loading || !formik.isValid}
                          startIcon={
                            loading
                              ? undefined
                              : saved
                              ? <CheckCircleIcon sx={{ fontSize: '17px !important' }} />
                              : <SaveIcon sx={{ fontSize: '17px !important' }} />
                          }
                          sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textTransform: 'none',
                            py: 1,
                            px: 3.5,
                            borderRadius: '10px',
                            minWidth: 160,
                            boxShadow: formik.isValid ? tokens.shadowMd : 'none',
                            background: saved
                              ? tokens.success
                              : !formik.isValid
                              ? tokens.neutral300
                              : `linear-gradient(135deg, ${tokens.brand} 0%, ${tokens.accent} 100%)`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: formik.isValid ? 'translateY(-2px)' : 'none',
                              boxShadow: formik.isValid
                                ? `0 8px 28px ${alpha(tokens.brand, 0.35)}`
                                : 'none',
                            },
                            '&:active': { transform: 'translateY(0)' },
                            '&.Mui-disabled': {
                              background: tokens.neutral200,
                              color: tokens.neutral500,
                            },
                          }}
                        >
                          {loading ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
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

          {/* Bottom hint */}
          <Fade in timeout={800}>
            <Typography
              sx={{
                mt: 2.5,
                textAlign: 'center',
                fontSize: '0.75rem',
                color: tokens.neutral500,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              All fields marked with an asterisk (*) are required. Changes are not auto-saved.
            </Typography>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

export default PurchaseOrderForm;