"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import { useSelector } from "react-redux";

// Local Components
import { VendorBasicInfo } from "./VendorBasicInfo";
import { VendorOtherDetails } from "./VendorOtherDetails";
import { VendorAddress } from "./VendorAddress";
import { VendorContactPersons } from "./VendorContactPersons";
import { VendorBankDetails } from "./VendorBankDetails";

// Custom Components
import { BBButton, BBTitle, BBLoader } from "@/lib";

// Models & Constants
import { Vendor } from "@/models/vendor.model";
import { initialVendorValues, transformVendorToPayload } from "./vendorForm.utils";
import { vendorValidationSchema } from "./vendorForm.validation";

// Services & Hooks
import { useVendor } from "@/hooks/useVendor";

// Utils
import { showToastMessage } from "@/utils/toastUtil";
import { RootState } from "@/store";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  // Layout
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f8f6f2 0%, #f0ede8 50%, #ebe7e1 100%)",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    paddingBottom: "60px",
  } as React.CSSProperties,

  container: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "0 24px",
  } as React.CSSProperties,

  // Header
  header: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0,0,0,0.07)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    padding: "0",
  },

  headerInner: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "68px",
  } as React.CSSProperties,

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  } as React.CSSProperties,

  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "white",
    cursor: "pointer",
    transition: "all 0.18s ease",
    color: "#4a4a4a",
    flexShrink: 0,
  } as React.CSSProperties,

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },

  newBadge: {
    background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    color: "#2e7d32",
    border: "1px solid rgba(46,125,50,0.2)",
  },

  editBadge: {
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    color: "#1565c0",
    border: "1px solid rgba(21,101,192,0.2)",
  },

  titleGroup: {} as React.CSSProperties,

  pageTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "-0.3px",
  } as React.CSSProperties,

  pageSubtitle: {
    fontSize: "12.5px",
    color: "#888",
    margin: 0,
    marginTop: "1px",
  } as React.CSSProperties,

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,

  // Buttons
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 18px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    cursor: "pointer",
    fontSize: "13.5px",
    fontWeight: 500,
    color: "#4a4a4a",
    transition: "all 0.18s ease",
    fontFamily: "inherit",
  } as React.CSSProperties,

  submitBtn: (loading: boolean, disabled: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 22px",
    borderRadius: "10px",
    border: "none",
    background: disabled
      ? "#e0e0e0"
      : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13.5px",
    fontWeight: 600,
    color: disabled ? "#aaa" : "white",
    transition: "all 0.18s ease",
    fontFamily: "inherit",
    boxShadow: disabled ? "none" : "0 4px 14px rgba(26,26,46,0.3)",
    letterSpacing: "0.01em",
  }),

  // Alert
  alert: (type: "error" | "warning"): React.CSSProperties => ({
    display: "flex",
    gap: "12px",
    padding: "14px 18px",
    borderRadius: "12px",
    marginBottom: "16px",
    background: type === "error" ? "#fff5f5" : "#fffbf0",
    border: `1px solid ${type === "error" ? "#ffcdd2" : "#ffe082"}`,
  }),

  alertIcon: (type: "error" | "warning"): React.CSSProperties => ({
    flexShrink: 0,
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    background: type === "error" ? "#ef5350" : "#ffa726",
    color: "white",
  }),

  alertTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
    marginBottom: "2px",
  } as React.CSSProperties,

  alertBody: {
    fontSize: "13px",
    color: "#555",
    margin: 0,
  } as React.CSSProperties,

  // GST Card
  gstCard: {
    background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
    border: "1px solid rgba(66,133,244,0.18)",
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,

  gstLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  } as React.CSSProperties,

  gstIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #4285f4, #1a73e8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(66,133,244,0.3)",
  } as React.CSSProperties,

  gstText: {
    fontSize: "13px",
    color: "#3c4a6b",
    margin: 0,
    fontWeight: 500,
    lineHeight: 1.5,
  } as React.CSSProperties,

  gstBtn: (disabled: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "9px",
    border: "none",
    background: disabled
      ? "rgba(0,0,0,0.06)"
      : "linear-gradient(135deg, #4285f4, #1a73e8)",
    color: disabled ? "#aaa" : "white",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.18s ease",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    boxShadow: disabled ? "none" : "0 3px 10px rgba(66,133,244,0.3)",
  }),

  // Sections
  section: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.07)",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  } as React.CSSProperties,

  sectionHeader: {
    padding: "18px 24px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  } as React.CSSProperties,

  sectionDot: (color: string): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),

  sectionLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1a1a1a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,

  sectionLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(to right, rgba(0,0,0,0.07), transparent)",
  } as React.CSSProperties,

  sectionBody: {
    padding: "0 24px 24px",
  } as React.CSSProperties,

  // Tabs
  tabsWrap: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.07)",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  } as React.CSSProperties,

  tabBar: {
    display: "flex",
    borderBottom: "1px solid rgba(0,0,0,0.07)",
    overflowX: "auto" as const,
    padding: "0 8px",
    gap: "2px",
    background: "#fafafa",
  } as React.CSSProperties,

  tab: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "14px 18px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    color: active ? "#1a1a2e" : "#8a8a8a",
    borderBottom: active ? "2px solid #1a1a2e" : "2px solid transparent",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap" as const,
    fontFamily: "inherit",
    position: "relative" as const,
    flexShrink: 0,
  }),

  tabDot: (active: boolean, color: string): React.CSSProperties => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: active ? color : "#ccc",
    transition: "background 0.18s ease",
  }),

  tabContent: {
    padding: "28px 24px",
  } as React.CSSProperties,

  // Footer
  footer: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(0,0,0,0.07)",
    position: "sticky" as const,
    bottom: 0,
    zIndex: 100,
    padding: "14px 24px",
  },

  footerInner: {
    maxWidth: "980px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,

  footerHint: {
    fontSize: "12px",
    color: "#bbb",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties,

  footerActions: {
    display: "flex",
    gap: "10px",
  } as React.CSSProperties,

  // Content spacing
  content: {
    padding: "28px 24px 80px",
  } as React.CSSProperties,
};

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TAB_CONFIGS = [
  { label: "Other Details",    index: 0, color: "#f59e0b", icon: "◆" },
  { label: "Address",          index: 1, color: "#10b981", icon: "◉" },
  { label: "Contact Persons",  index: 2, color: "#3b82f6", icon: "◎" },
  { label: "Bank Details",     index: 3, color: "#8b5cf6", icon: "◈" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
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
  const [btnHover, setBtnHover] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && vendorId) loadVendorData();
  }, [vendorId, isEdit]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorData = await getVendor(vendorId);
      setInitialData(vendorData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load vendor details";
      setError(msg);
      showToastMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Vendor, formikHelpers: FormikHelpers<Vendor>) => {
    try {
      setSubmitError(null);
      setValidationErrors([]);
      const payload = transformVendorToPayload(values);
      if (isEdit && vendorId) {
        await updateVendor(vendorId, payload);
        showToastMessage("Vendor updated successfully!", "success");
      } else {
        await createVendor(payload);
        showToastMessage("Vendor created successfully!", "success");
      }
      setTimeout(() => router.push("/vendors"), 100);
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";
      let fieldErrors: string[] = [];
      if (error?.response?.data) {
        const d = error.response.data;
        if (d.errors && Array.isArray(d.errors)) {
          fieldErrors = d.errors.map((e: any) => typeof e === "string" ? e : e.message || "Validation error");
          errorMessage = "Please fix the validation errors below";
        } else if (d.message) {
          errorMessage = d.message;
        } else if (d.field_errors) {
          Object.keys(d.field_errors).forEach(f => formikHelpers.setFieldError(f, d.field_errors[f]));
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

  const handleBack = () => router.back();

  const handleGSTPrefill = async (gstin: string, setFieldValue: any) => {
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

  if (loading) return <BBLoader enabled={true} />;

  return (
    <div style={styles.page}>
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

            {/* ── Sticky Header ── */}
            <header style={styles.header}>
              <div style={styles.headerInner}>
                <div style={styles.headerLeft}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      ...styles.backBtn,
                      ...(btnHover === "back" ? { background: "#f5f5f5", borderColor: "rgba(0,0,0,0.18)" } : {}),
                    }}
                    onMouseEnter={() => setBtnHover("back")}
                    onMouseLeave={() => setBtnHover(null)}
                    disabled={isSubmitting}
                  >
                    <BackIcon />
                  </button>
                  <div style={styles.titleGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h1 style={styles.pageTitle}>{isEdit ? "Edit Vendor" : "New Vendor"}</h1>
                      <span style={{ ...styles.badge, ...(isEdit ? styles.editBadge : styles.newBadge) }}>
                        {isEdit ? "Editing" : "New"}
                      </span>
                    </div>
                    <p style={styles.pageSubtitle}>
                      {isEdit ? "Update vendor information and settings" : "Add a new vendor to your system"}
                    </p>
                  </div>
                </div>
                <div style={styles.headerActions}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      ...styles.cancelBtn,
                      ...(btnHover === "cancel" ? { background: "#f9f9f9", borderColor: "rgba(0,0,0,0.18)" } : {}),
                    }}
                    onMouseEnter={() => setBtnHover("cancel")}
                    onMouseLeave={() => setBtnHover(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitBtn(vendorLoading || isSubmitting, vendorLoading || isSubmitting || (isEdit && !dirty)),
                      ...(btnHover === "submit" && !(vendorLoading || isSubmitting || (isEdit && !dirty))
                        ? { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(26,26,46,0.38)" }
                        : {}),
                    }}
                    onMouseEnter={() => setBtnHover("submit")}
                    onMouseLeave={() => setBtnHover(null)}
                    disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                  >
                    {(vendorLoading || isSubmitting) ? (
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    ) : (
                      <CheckIcon />
                    )}
                    {isEdit ? "Update Vendor" : "Create Vendor"}
                  </button>
                </div>
              </div>
            </header>

            {/* ── Main Content ── */}
            <div style={styles.content}>

              {/* Alerts */}
              {error && (
                <div style={styles.alert("error")}>
                  <div style={styles.alertIcon("error")}>!</div>
                  <div>
                    <p style={styles.alertTitle}>Failed to load vendor</p>
                    <p style={styles.alertBody}>{error}</p>
                  </div>
                </div>
              )}
              {submitError && (
                <div style={styles.alert("error")}>
                  <div style={styles.alertIcon("error")}>!</div>
                  <div>
                    <p style={styles.alertTitle}>Submission Failed</p>
                    <p style={styles.alertBody}>{submitError}</p>
                    {validationErrors.length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12.5px", color: "#d32f2f" }}>
                        {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                <div style={styles.alert("warning")}>
                  <div style={styles.alertIcon("warning")}>!</div>
                  <div>
                    <p style={styles.alertTitle}>Validation Errors</p>
                    <p style={styles.alertBody}>Please check and fix the errors in the form before submitting.</p>
                  </div>
                </div>
              )}

              {/* GST Prefill Banner */}
              <div style={styles.gstCard}>
                <div style={styles.gstLeft}>
                  <div style={styles.gstIconWrap}>
                    <SparkleIcon />
                  </div>
                  <div>
                    <p style={{ ...styles.gstText, fontWeight: 600, color: "#1a2a5e", marginBottom: "2px" }}>
                      Auto-fill from GST Portal
                    </p>
                    <p style={{ ...styles.gstText, fontSize: "12px", fontWeight: 400, color: "#607080" }}>
                      Enter GSTIN below to prefill vendor details automatically
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleGSTPrefill(values.gstin!, setFieldValue)}
                  style={styles.gstBtn(!values.gstin || values.gstin.length !== 15)}
                  disabled={!values.gstin || values.gstin.length !== 15}
                >
                  Prefill Details →
                </button>
              </div>

              {/* Basic Info Section */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionDot("#f59e0b")} />
                  <span style={styles.sectionLabel}>Basic Information</span>
                  <div style={styles.sectionLine} />
                </div>
                <div style={styles.sectionBody}>
                  <VendorBasicInfo />
                </div>
              </div>

              {/* Tabbed Section */}
              <div style={styles.tabsWrap}>
                {/* Tab Bar */}
                <div style={styles.tabBar}>
                  {TAB_CONFIGS.map((tab) => (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveTab(tab.index)}
                      style={styles.tab(activeTab === tab.index)}
                    >
                      <span style={styles.tabDot(activeTab === tab.index, tab.color)} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={styles.tabContent}>
                  {activeTab === 0 && <VendorOtherDetails />}
                  {activeTab === 1 && <VendorAddress values={values} setFieldValue={setFieldValue} />}
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
                </div>
              </div>
            </div>

            {/* ── Sticky Footer ── */}
            <footer style={styles.footer}>
              <div style={styles.footerInner}>
                <div style={styles.footerHint}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: dirty ? "#10b981" : "#ddd", display: "inline-block" }} />
                  {dirty ? "Unsaved changes" : "No changes made"}
                </div>
                <div style={styles.footerActions}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      ...styles.cancelBtn,
                      ...(btnHover === "cancel2" ? { background: "#f9f9f9" } : {}),
                    }}
                    onMouseEnter={() => setBtnHover("cancel2")}
                    onMouseLeave={() => setBtnHover(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitBtn(vendorLoading || isSubmitting, vendorLoading || isSubmitting || (isEdit && !dirty)),
                      ...(btnHover === "submit2" && !(vendorLoading || isSubmitting || (isEdit && !dirty))
                        ? { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(26,26,46,0.38)" }
                        : {}),
                    }}
                    onMouseEnter={() => setBtnHover("submit2")}
                    onMouseLeave={() => setBtnHover(null)}
                    disabled={vendorLoading || isSubmitting || (isEdit && !dirty)}
                  >
                    {(vendorLoading || isSubmitting) ? (
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    ) : (
                      <CheckIcon />
                    )}
                    {isEdit ? "Update Vendor" : "Create Vendor"}
                  </button>
                </div>
              </div>
            </footer>

          </Form>
        )}
      </Formik>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default VendorForm;