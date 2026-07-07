// app/components/vendor/VendorForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import { useSelector } from "react-redux";
import { ArrowLeft, Store, AlertCircle, Sparkles } from "lucide-react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";

import { VendorBasicInfo } from "./VendorBasicInfo";
import { VendorOtherDetails } from "./VendorOtherDetails";
import { VendorAddress } from "./VendorAddress";
import { VendorContactPersons } from "./VendorContactPersons";
import { VendorBankDetails } from "./VendorBankDetails";

import { BBButton, BBLoader } from "@/lib";
import { Vendor } from "@/models/vendor.model";
import { initialVendorValues, transformVendorToPayload } from "./vendorForm.utils";
import { vendorValidationSchema } from "./vendorForm.validation";
import { useVendor } from "@/hooks/useVendor";
import { showToastMessage } from "@/utils/toastUtil";
import { RootState } from "@/store";

const TABS = [
  { label: "Other Details", index: 0 },
  { label: "Address", index: 1 },
  { label: "Contact Persons", index: 2 },
  { label: "Bank Details", index: 3 },
];

export const VendorForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  const { loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { createVendor, updateVendor, getVendor, loading: vendorLoading } = useVendor();

  const vendorIdRaw = params?.vendorId;
  const vendorId = Array.isArray(vendorIdRaw) ? vendorIdRaw[0] : vendorIdRaw;
  const isEdit = !!vendorId && vendorId !== "new";

  const [initialData, setInitialData] = useState<Vendor>(initialVendorValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && vendorId) loadVendorData();
  }, [vendorId, isEdit]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVendor(vendorId!);
      setInitialData(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load vendor";
      setError(msg);
      showToastMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGSTPrefill = async (gstin: string | undefined, setFieldValue: any) => {
    if (!gstin || gstin.length !== 15) {
      showToastMessage("Please enter a valid 15-digit GSTIN", "error");
      return;
    }

    try {
      setFieldValue("company_name", "Demo Company Pvt Ltd");
      setFieldValue("billing_address.city", "Chennai");
      setFieldValue("billing_address.state", "Tamil Nadu");
      setFieldValue("other_details.pan", "AAAAA1234A");
      showToastMessage("Vendor details prefilled from GST portal", "success");
    } catch {
      showToastMessage("Failed to prefill from GST portal. Please enter details manually.", "error");
    }
  };

  const handleSubmit = async (values: Vendor, helpers: FormikHelpers<Vendor>) => {
    try {
      setSubmitError(null);
      setValidationErrors([]);

      const payload = transformVendorToPayload(values);

      if (isEdit && vendorId) {
        await updateVendor(vendorId, payload);
        showToastMessage("Vendor updated successfully", "success");
      } else {
        await createVendor(payload);
        showToastMessage("Vendor created successfully", "success");
      }

      setTimeout(() => router.push("/vendors"), 100);
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";
      let fieldErrors: string[] = [];

      if (error?.response?.data) {
        const d = error.response.data;

        if (d.errors && Array.isArray(d.errors)) {
          fieldErrors = d.errors.map((e: any) =>
            typeof e === "string" ? e : e.message || "Validation error"
          );
          errorMessage = "Please fix the validation errors below";
        } else if (d.message) {
          errorMessage = d.message;
        } else if (d.field_errors) {
          Object.keys(d.field_errors).forEach((f) =>
            helpers.setFieldError(f, d.field_errors[f])
          );
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
      <BBLoader enabled={authLoading || vendorLoading} />

      <Formik
        initialValues={initialData}
        validationSchema={vendorValidationSchema(isEdit)}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({ handleSubmit, dirty, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
            {/* Sticky page header */}
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
                  <Store size={20} color="white" />
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
                    {isEdit ? "Edit Vendor" : "New Vendor"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#9ca3af",
                      fontFamily: "'DM Sans', sans-serif",
                      mt: 0.2,
                    }}
                  >
                    {isEdit ? "Update vendor information" : "Add a new vendor to your system"}
                  </Typography>
                </Box>
              </Box>

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
                  disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                  loading={vendorLoading || isSubmitting}
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
                  {isEdit ? "Update Vendor" : "Create Vendor"}
                </BBButton>
              </Box>
            </Box>

            {/* Error banners */}
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
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    Error
                  </AlertTitle>
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
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    Submission Failed
                  </AlertTitle>

                  {submitError}

                  {validationErrors.length > 0 && (
                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                      {validationErrors.map((e, i) => (
                        <li key={i} style={{ fontSize: "0.8125rem" }}>
                          {e}
                        </li>
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
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    Validation Errors
                  </AlertTitle>
                  Please check and fix the errors in the form before submitting.
                </Alert>
              </Collapse>
            </Box>

            {/* Form body */}
            <Box sx={{ px: 3, pb: 4 }}>
              {/* GST banner */}
              <Box
                sx={{
                  mb: 2.5,
                  p: 2.25,
                  borderRadius: "16px",
                  border: "1px solid #dbeafe",
                  bgcolor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={16} color="white" />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#1e3a8a",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Auto-fill from GST Portal
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Enter GSTIN below to prefill vendor details automatically
                    </Typography>
                  </Box>
                </Box>

                <BBButton
                  type="button"
                  variant="contained"
                  onClick={() => handleGSTPrefill(values.gstin, setFieldValue)}
                  disabled={!values.gstin || values.gstin.length !== 15}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    px: 2,
                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                    boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                    "&:disabled": { opacity: 0.55 },
                  }}
                >
                  Prefill Details
                </BBButton>
              </Box>

              <VendorBasicInfo />

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
                    overflowX: "auto",
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
                  {activeTab === 0 && <VendorOtherDetails />}

                  {activeTab === 1 && (
                    <VendorAddress values={values} setFieldValue={setFieldValue} />
                  )}

                  {activeTab === 2 && (
                    <FieldArray name="contact_persons">
                      {({ push, remove }) => (
                        <VendorContactPersons values={values} push={push} remove={remove} />
                      )}
                    </FieldArray>
                  )}

                  {activeTab === 3 && (
                    <FieldArray name="bank_details">
                      {({ push, remove }) => (
                        <VendorBankDetails values={values} push={push} remove={remove} />
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
                  disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                  loading={vendorLoading || isSubmitting}
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
                  {isEdit ? "Update Vendor" : "Create Vendor"}
                </BBButton>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default VendorForm;