"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
  Typography,
  LinearProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionIcon from "@mui/icons-material/Description";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowLeftIcon from "@mui/icons-material/ArrowBack";
import { PurchaseOrder } from "@/models/purchaseOrder.model";
import { purchaseOrderValidationSchema } from "./purchaseOrderForm.validation";
import { showToastMessage } from "@/utils/toastUtil";
import {
  initialPurchaseOrderValues,
  transformPOToPayload,
} from "./purchaseOrderForm.utils";
import { usePurchaseOrder } from "@/hooks/usePurchaseOrder";
import PurchaseOrderBasicInfo from "./PurchaseOrderBasicInfo";
import PurchaseOrderLineItems from "./PurchaseOrderLineItems";
import PurchaseOrderBilling from "./PurchaseOrderBilling";
import BBButton from "@/lib/BBButton/BBButton";

const tokens = {
  brand: "#0ea5e9",
  brandDark: "#6366f1",
  brandSoft: "#f0f4ff",
  brandBorder: "#c7d2fe",
  success: "#16a34a",
  warn: "#d97706",
  error: "#dc2626",
  neutral0: "#ffffff",
  neutral50: "#f8f9fc",
  neutral100: "#fafbff",
  neutral200: "#eeeff5",
  neutral300: "#e5e7eb",
  neutral500: "#9ca3af",
  neutral700: "#6b7280",
  neutral900: "#1a1d2e",
  shadow: "0 4px 24px rgba(0,0,0,0.04)",
};

const STEPS = [
  { label: "Basic Info", sublabel: "Order details & vendor", Icon: DescriptionIcon },
  { label: "Line Items", sublabel: "Products & quantities", Icon: ShoppingCartIcon },
  { label: "Billing", sublabel: "Payment & totals", Icon: PaymentIcon },
];

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
    <Box sx={{ px: 3, pb: 2, pt: 1.5, borderBottom: `1px solid ${tokens.neutral200}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: tokens.neutral500, fontFamily: "'DM Sans', sans-serif" }}>
          Step {active + 1} of {STEPS.length}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#4f63d2", fontFamily: "'DM Sans', sans-serif" }}>
          {pct}% complete
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 99, background: tokens.neutral200, overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandDark})`,
            borderRadius: 99,
            transition: "width 0.35s ease",
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
  const { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, loading, error } = usePurchaseOrder();

  const [tabValue, setTabValue] = useState(0);
  const [initialValues, setInitialValues] = useState<PurchaseOrder>(initialPurchaseOrderValues as any);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const searchParams = useSearchParams();
  const mode = searchParams ? searchParams.get("mode") : null;
  const isViewMode = mode === "view";

  const isEdit = purchaseOrderId && purchaseOrderId !== "new";
  const isEditable = isEdit && !isViewMode;

  useEffect(() => {
    if (!isEdit) return;

    const loadPurchaseOrder = async () => {
      try {
        const po = await getPurchaseOrder(purchaseOrderId!);
        setInitialValues(po);
      } catch {
        setPageError("Failed to load purchase order");
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
        // Helpful debug log to inspect the exact payload sent
        console.log('Submitting Purchase Order payload:', JSON.stringify(payload, null, 2));

        if (isEdit) await updatePurchaseOrder(purchaseOrderId!, payload);
        else await createPurchaseOrder(payload);

        setSaved(true);
        setTimeout(() => router.push("/purchase-orders"), 800);
      } catch (err: any) {
        setPageError(err?.response?.data?.message || err?.message || "Failed to save purchase order");
      }
    },
  });

  const errorCount = Object.keys(formik.errors).filter(
    (k) => formik.touched[k as keyof typeof formik.touched]
  ).length;

  const handleSubmitAttempt = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      showToastMessage("Please check and fix the errors in the form before submitting.", "error");
      formik.setTouched(
        Object.keys(errors).reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {} as Record<string, boolean>)
      );
      return;
    }

    await formik.submitForm();
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.neutral50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={28} sx={{ color: tokens.brand }} />
      </Box>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <Box sx={{ minHeight: "100vh", bgcolor: tokens.neutral50, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Sticky page header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            px: 3,
            pt: 2.5,
            pb: 2,
            bgcolor: tokens.neutral0,
            borderBottom: `1px solid ${tokens.neutral200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${tokens.brand} 0%, ${tokens.brandDark} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                flexShrink: 0,
              }}
            >
              <ReceiptLongIcon sx={{ fontSize: 21, color: "white" }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: tokens.neutral900, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                {isViewMode ? "View Purchase Order" : isEdit ? "Edit Purchase Order" : "New Purchase Order"}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: tokens.neutral500, mt: 0.2 }}>
                {isViewMode ? "View purchase order details" : isEdit ? "Update purchase order information" : "Create a new purchase order in three simple sections"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <BBButton
              variant="outlined"
              onClick={() => router.push("/purchase-orders")}
              startIcon={<ArrowLeftIcon sx={{ fontSize: 16 }} />}
              disabled={loading}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: tokens.neutral700,
                borderColor: tokens.neutral300,
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Cancel
            </BBButton>

            {!isViewMode && (
              <Tooltip title={!formik.isValid ? "Please fix all errors before saving" : ""} arrow>
                <span>
                  <BBButton
                    type="button"
                    variant="contained"
                    disabled={loading || !formik.isValid}
                    loading={loading}
                    startIcon={!loading && (saved ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <SaveIcon sx={{ fontSize: 16 }} />)}
                    onClick={() => handleSubmitAttempt()}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      px: 2.5,
                      background: saved
                        ? tokens.success
                      : `linear-gradient(135deg, ${tokens.brand} 0%, ${tokens.brandDark} 100%)`,
                    boxShadow: formik.isValid ? "0 4px 14px rgba(14,165,233,0.35)" : "none",
                    "&:hover": {
                      background: saved ? tokens.success : "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": { opacity: 0.65 },
                    transition: "all 0.2s ease",
                  }}
                >
                  {saved ? "Saved!" : isEdit ? "Update Purchase Order" : "Create Purchase Order"}
                </BBButton>
                </span>
              </Tooltip>
            )}
            </Box>
        </Box>

        {/* Error banners */}
        <Box sx={{ px: 3, pt: 2.5 }}>
          <Collapse in={!!(pageError || error)}>
            <Alert
              severity="error"
              onClose={() => setPageError(null)}
              icon={<ErrorOutlineIcon sx={{ fontSize: 18 }} />}
              sx={{
                mb: 2,
                borderRadius: "12px",
                border: "1px solid #fee2e2",
                bgcolor: "#fff5f5",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Error</AlertTitle>
              {pageError || error}
            </Alert>
          </Collapse>

          <Collapse in={errorCount > 0}>
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                borderRadius: "12px",
                border: "1px solid #fef3c7",
                bgcolor: "#fffbeb",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Validation Errors</AlertTitle>
              {errorCount} field{errorCount > 1 ? "s need" : " needs"} attention.
            </Alert>
          </Collapse>
        </Box>

        <Box sx={{ px: 3, pb: 4 }}>
          <Box
            sx={{
              bgcolor: tokens.neutral0,
              borderRadius: "16px",
              border: `1px solid ${tokens.neutral200}`,
              overflow: "hidden",
              boxShadow: tokens.shadow,
              mb: 3,
            }}
          >
            {loading && (
              <LinearProgress
                sx={{
                  height: 3,
                  background: tokens.neutral100,
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandDark})`,
                  },
                }}
              />
            )}

            {/* Tab bar */}
            <Box sx={{ display: "flex", borderBottom: `1px solid ${tokens.neutral200}`, bgcolor: tokens.neutral100, px: 1, pt: 1, gap: 0.5, overflowX: "auto" }}>
              {STEPS.map((step, i) => {
                const active = tabValue === i;
                const done = i < tabValue;
                const Icon = step.Icon;

                return (
                  <Box
                    key={step.label}
                    onClick={() => setTabValue(i)}
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      cursor: "pointer",
                      borderRadius: "10px 10px 0 0",
                      fontSize: "0.875rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#4f63d2" : tokens.neutral500,
                      bgcolor: active ? tokens.neutral0 : "transparent",
                      borderBottom: active ? "2px solid #4f63d2" : "2px solid transparent",
                      boxShadow: active ? "0 -2px 8px rgba(79,99,210,0.08)" : "none",
                      transition: "all 0.15s ease",
                      "&:hover": { color: active ? "#4f63d2" : tokens.neutral700, bgcolor: active ? tokens.neutral0 : tokens.brandSoft },
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "7px",
                        bgcolor: active || done ? "#f0f4ff" : "#f3f4f6",
                        color: active ? "#4f63d2" : done ? tokens.success : tokens.neutral500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {done ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : <Icon sx={{ fontSize: 14 }} />}
                    </Box>
                    {step.label}
                    {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4f63d2", flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Box>

            <StepProgressBar active={tabValue} />

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ p: 3 }}>
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
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: tokens.neutral100,
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  {tabValue > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "12px !important" }} />}
                      onClick={() => setTabValue(tabValue - 1)}
                      disabled={loading}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        color: tokens.neutral700,
                        borderColor: tokens.neutral300,
                        "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                      }}
                    >
                      Previous
                    </Button>
                  )}

                  {tabValue < STEPS.length - 1 && (
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: "12px !important" }} />}
                      onClick={() => setTabValue(tabValue + 1)}
                      disabled={loading}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#4f63d2",
                        borderColor: tokens.brandBorder,
                        bgcolor: tokens.brandSoft,
                        "&:hover": { bgcolor: "#e0e7ff", borderColor: "#a5b4fc" },
                      }}
                    >
                      Continue
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, ml: "auto" }}>
                  <BBButton
                    variant="outlined"
                    startIcon={<CancelIcon sx={{ fontSize: "15px !important" }} />}
                    onClick={() => router.push("/purchase-orders")}
                    disabled={loading}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: tokens.neutral700,
                      borderColor: tokens.neutral300,
                      "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                    }}
                  >
                    Cancel
                  </BBButton>

                  {!isViewMode && (
                    <Tooltip title={!formik.isValid ? "Please fix all errors before saving" : ""} arrow>
                      <span>
                        <BBButton
                          type="submit"
                          variant="contained"
                          disabled={loading || !formik.isValid}
                          startIcon={loading ? undefined : saved ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            minWidth: 160,
                            background: saved
                              ? tokens.success
                              : `linear-gradient(135deg, ${tokens.brand} 0%, ${tokens.brandDark} 100%)`,
                            boxShadow: formik.isValid ? "0 4px 14px rgba(14,165,233,0.3)" : "none",
                            "&:hover": {
                              background: saved ? tokens.success : "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                              transform: "translateY(-1px)",
                            },
                            "&:disabled": { opacity: 0.65 },
                            transition: "all 0.2s ease",
                          }}
                        >
                          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : saved ? "Saved!" : "Save Purchase Order"}
                        </BBButton>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </form>
          </Box>

          <Typography sx={{ mt: 1.25, textAlign: "center", fontSize: "0.72rem", color: tokens.neutral500 }}>
            All fields marked with an asterisk (*) are required. Changes are not auto-saved.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default PurchaseOrderForm;
