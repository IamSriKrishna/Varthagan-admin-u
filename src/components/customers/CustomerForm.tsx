// src/components/customers/CustomerForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import { useSelector } from "react-redux";
import { ArrowLeft, UserRound, AlertCircle, ChevronRight } from "lucide-react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";

import { CustomerBasicInfo } from "./CustomerBasicInfo";
import { CustomerOtherDetails } from "./CustomerOtherDetails";
import { CustomerAddress } from "./CustomerAddress";
import { CustomerContactPersons } from "./CustomerContactPersons";

import { BBButton, BBLoader } from "@/lib";
import { Customer } from "@/models/customer.model";
import { initialCustomerValues, transformCustomerToPayload } from "./customerForm.utils";
import { customerValidationSchema } from "./customerForm.validation";
import { useCustomer } from "@/hooks/useCustomer";
import { showToastMessage } from "@/utils/toastUtil";
import { RootState } from "@/store";

const TABS = [
  { label: "Other Details", index: 0 },
  { label: "Address", index: 1 },
  { label: "Contact Persons", index: 2 },
];

const CustomerForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { createCustomer, updateCustomer, getCustomer, loading: customerLoading } = useCustomer();

  const customerIdRaw = params?.customerId;
  const customerId = Array.isArray(customerIdRaw) ? customerIdRaw[0] : customerIdRaw;
  const isEdit = !!customerId && customerId !== "new";

  const [initialData, setInitialData] = useState<Customer>(initialCustomerValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && customerId) loadCustomerData();
  }, [customerId, isEdit]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomer(customerId);
      setInitialData(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load customer";
      setError(msg);
      showToastMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Customer, helpers: FormikHelpers<Customer>) => {
    try {
      setSubmitError("");
      setValidationErrors([]);
      const payload = transformCustomerToPayload(values);
      if (isEdit) {
        await updateCustomer(customerId, payload);
        showToastMessage("Customer updated successfully", "success");
      } else {
        await createCustomer(payload);
        showToastMessage("Customer created successfully", "success");
      }
      setTimeout(() => router.push("/customers"), 100);
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";
      let fieldErrors: string[] = [];
      if (error?.response?.data) {
        const d = error.response.data;
        if (d.errors && Array.isArray(d.errors)) {
          fieldErrors = d.errors.map((e: any) => (typeof e === "string" ? e : e.message || "Validation error"));
          errorMessage = "Please fix the validation errors below";
        } else if (d.message) {
          errorMessage = d.message;
        } else if (d.field_errors) {
          Object.keys(d.field_errors).forEach((f) => helpers.setFieldError(f, d.field_errors[f]));
          errorMessage = "Please check the highlighted fields";
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setSubmitError(errorMessage);
      setValidationErrors(fieldErrors);
      showToastMessage(errorMessage, "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) return <BBLoader enabled />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
      <BBLoader enabled={authLoading || customerLoading} />

      <Formik
        initialValues={initialData}
        validationSchema={customerValidationSchema(isEdit)}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({ handleSubmit, dirty, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>

            {/* ── Sticky page header ─────────────────────────────────────── */}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  <UserRound size={20} color="white" />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#1a1d2e",
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: "-0.3px",
                      lineHeight: 1.2,
                    }}
                  >
                    {isEdit ? "Edit Customer" : "New Customer"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#9ca3af",
                      fontFamily: "'DM Sans', sans-serif",
                      mt: 0.2,
                    }}
                  >
                    {isEdit ? "Update customer information" : "Add a new customer to your system"}
                  </Typography>
                </Box>
              </Box>

              {/* Header actions */}
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <BBButton
                  variant="outlined"
                  onClick={() => router.back()}
                  startIcon={<ArrowLeft size={16} />}
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    borderColor: "#e5e7eb",
                    "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                  }}
                >
                  Cancel
                </BBButton>
                <BBButton
                  type="submit"
                  variant="contained"
                  disabled={customerLoading || isSubmitting || (isEdit && !dirty)}
                  loading={customerLoading || isSubmitting}
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
                    "&:disabled": { opacity: 0.65 },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isEdit ? "Update Customer" : "Create Customer"}
                </BBButton>
              </Box>
            </Box>

            {/* ── Error banners ──────────────────────────────────────────── */}
            <Box sx={{ px: 3, pt: 2.5 }}>
              <Collapse in={!!error}>
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  icon={<AlertCircle size={18} />}
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                    border: "1px solid #fee2e2",
                    bgcolor: "#fff5f5",
                    fontFamily: "'DM Sans', sans-serif",
                    "& .MuiAlert-message": { fontFamily: "'DM Sans', sans-serif" },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Error</AlertTitle>
                  {error}
                </Alert>
              </Collapse>

              <Collapse in={!!submitError}>
                <Alert
                  severity="error"
                  onClose={() => setSubmitError(null)}
                  icon={<AlertCircle size={18} />}
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                    border: "1px solid #fee2e2",
                    bgcolor: "#fff5f5",
                    fontFamily: "'DM Sans', sans-serif",
                    "& .MuiAlert-message": { fontFamily: "'DM Sans', sans-serif" },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Submission Failed</AlertTitle>
                  {submitError}
                  {validationErrors.length > 0 && (
                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                      {validationErrors.map((e, i) => (
                        <li key={i} style={{ fontSize: "0.8125rem" }}>{e}</li>
                      ))}
                    </Box>
                  )}
                </Alert>
              </Collapse>

              <Collapse in={Object.keys(errors).length > 0 && Object.keys(touched).length > 0}>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                    border: "1px solid #fef3c7",
                    bgcolor: "#fffbeb",
                    fontFamily: "'DM Sans', sans-serif",
                    "& .MuiAlert-message": { fontFamily: "'DM Sans', sans-serif" },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Validation Errors</AlertTitle>
                  Please check and fix the errors in the form before submitting.
                </Alert>
              </Collapse>
            </Box>

            {/* ── Form body ─────────────────────────────────────────────── */}
            <Box sx={{ px: 3, pb: 4 }}>
              {/* Basic Info card */}
              <CustomerBasicInfo />

              {/* Tabbed sections card */}
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #eeeff5",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  mb: 3,
                }}
              >
                {/* Tab bar */}
                <Box
                  sx={{
                    display: "flex",
                    borderBottom: "1px solid #f0f0f5",
                    bgcolor: "#fafbff",
                    px: 1,
                    pt: 1,
                    gap: 0.5,
                  }}
                >
                  {TABS.map((tab) => {
                    const active = activeTab === tab.index;
                    return (
                      <Box
                        key={tab.label}
                        onClick={() => setActiveTab(tab.index)}
                        sx={{
                          px: 2.5,
                          py: 1.25,
                          cursor: "pointer",
                          borderRadius: "10px 10px 0 0",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: active ? 700 : 500,
                          color: active ? "#4f63d2" : "#9ca3af",
                          bgcolor: active ? "#ffffff" : "transparent",
                          borderBottom: active ? "2px solid #4f63d2" : "2px solid transparent",
                          boxShadow: active ? "0 -2px 8px rgba(79,99,210,0.08)" : "none",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            color: active ? "#4f63d2" : "#6b7280",
                            bgcolor: active ? "#ffffff" : "#f0f4ff",
                          },
                          userSelect: "none",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        {tab.label}
                        {active && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "#4f63d2",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Tab content */}
                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && <CustomerOtherDetails />}
                  {activeTab === 1 && (
                    <CustomerAddress values={values} setFieldValue={setFieldValue} />
                  )}
                  {activeTab === 2 && (
                    <FieldArray name="contact_persons">
                      {({ push, remove }) => (
                        <CustomerContactPersons values={values} push={push} remove={remove} />
                      )}
                    </FieldArray>
                  )}
                </Box>
              </Box>

              {/* Bottom action bar */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1.5,
                  pt: 1,
                }}
              >
                <BBButton
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: "#6b7280",
                    borderColor: "#e5e7eb",
                    "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                  }}
                >
                  Cancel
                </BBButton>
                <BBButton
                  type="submit"
                  variant="contained"
                  disabled={customerLoading || isSubmitting || (isEdit && !dirty)}
                  loading={customerLoading || isSubmitting}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    px: 3,
                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                    boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": { opacity: 0.65 },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isEdit ? "Update Customer" : "Create Customer"}
                </BBButton>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CustomerForm;