"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Container, Alert, CircularProgress } from "@mui/material";
import { companyApi, CompleteCompanySetupInput, CompanyData } from "@/lib/api/companyApi";
import { formatErrorMessage } from "@/utils/companyErrorHandler";
import { dt } from "./designTokens";
import CompanyDetailsStep from "./steps/CompanyDetailsStep";
import ContactDetailsStep from "./steps/ContactDetailsStep";
import AddressDetailsStep from "./steps/AddressDetailsStep";
import PaymentDetailsStep from "./steps/PaymentDetailsStep";
import SettingsStep from "./steps/SettingsStep";
import ReviewStep from "./steps/ReviewStep";

/* ─────────────────────────────────────────────────────────────
   Step definitions
───────────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Company", sublabel: "Business details", icon: "🏢" },
  { label: "Contact", sublabel: "Phone & email",    icon: "📞" },
  { label: "Address", sublabel: "Location",          icon: "📍" },
  { label: "Payment", sublabel: "Banking & UPI",    icon: "💳" },
  { label: "Settings", sublabel: "Preferences",     icon: "⚙️" },
  { label: "Review",  sublabel: "Confirm & submit", icon: "✅" },
];

/* ─────────────────────────────────────────────────────────────
   Custom Step Indicator
───────────────────────────────────────────────────────────── */
function StepIndicator({ active, step }: { active: number; step: number }) {
  const isDone = step < active;
  const isCurrent = step === active;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        position: "relative",
        "&:not(:last-child)::after": {
          content: '""',
          position: "absolute",
          top: 22,
          left: "calc(50% + 26px)",
          right: "calc(-50% + 26px)",
          height: 2,
          bgcolor: isDone ? dt.gold : dt.border,
          transition: "background-color 0.4s ease",
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isDone ? 18 : 20,
          zIndex: 1,
          transition: "all 0.3s ease",
          border: `2px solid ${isCurrent ? dt.navy : isDone ? dt.gold : dt.border}`,
          bgcolor: isDone ? dt.gold : isCurrent ? dt.navy : dt.white,
          boxShadow: isCurrent ? `0 0 0 4px rgba(28,53,87,0.12)` : "none",
          cursor: "default",
        }}
      >
        {isDone ? (
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>✓</span>
        ) : (
          <span style={{ filter: isCurrent ? "none" : "grayscale(0.6) opacity(0.6)" }}>
            {STEPS[step].icon}
          </span>
        )}
      </Box>
      <Box sx={{ mt: 1, textAlign: "center" }}>
        <Box
          sx={{
            fontFamily: dt.font,
            fontSize: 12,
            fontWeight: isCurrent ? 700 : 500,
            color: isCurrent ? dt.navy : isDone ? dt.gold : dt.textMuted,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          {STEPS[step].label}
        </Box>
        <Box
          sx={{
            fontFamily: dt.font,
            fontSize: 10,
            color: dt.textMuted,
            display: { xs: "none", md: "block" },
            mt: 0.3,
          }}
        >
          {STEPS[step].sublabel}
        </Box>
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   Initial form state
───────────────────────────────────────────────────────────── */
const INITIAL_FORM: CompleteCompanySetupInput = {
  company: { company_name: "", business_type_id: 0, gst_number: "", pan_number: "" },
  contact: { mobile: "", alternate_mobile: "", email: "" },
  address: { address_line1: "", address_line2: "", city: "", state_id: 0, country_id: 0, pincode: "" },
  bank_details: { bank_id: 0, account_holder_name: "", account_number: "", is_primary: true },
  upi_details: { upi_id: "", upi_qr_url: "" },
  invoice_settings: { invoice_prefix: "INV", invoice_start_number: 1, show_logo: true, show_signature: false, round_off_total: true },
  tax_settings: { gst_enabled: true, tax_type_id: 0 },
  regional_settings: { timezone: "Asia/Kolkata", date_format: "DD/MM/YYYY", time_format: "24h", currency_code: "INR", currency_symbol: "₹", language_code: "en" },
};

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
interface CompanySetupWizardProps {
  company?: CompanyData | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CompanySetupWizard({ company, onClose, onSuccess }: CompanySetupWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CompleteCompanySetupInput>(INITIAL_FORM);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");

  useEffect(() => {
    if (company && Object.keys(company).length > 0 && company.company && company.contact && company.address) {
      setFormData({
        company: {
          company_name: company.company?.company_name || "",
          business_type_id: company.company?.business_type_id || 0,
          gst_number: company.company?.gst_number || "",
          pan_number: company.company?.pan_number || "",
        },
        contact: {
          mobile: company.contact?.mobile || "",
          alternate_mobile: company.contact?.alternate_mobile || "",
          email: company.contact?.email || "",
        },
        address: {
          address_line1: company.address?.address_line1 || "",
          address_line2: company.address?.address_line2 || "",
          city: company.address?.city || "",
          state_id: company.address?.state_id || 0,
          country_id: company.address?.country_id || 0,
          pincode: company.address?.pincode || "",
        },
        bank_details: company.bank_details?.[0]
          ? { bank_id: company.bank_details[0].bank_id || 0, account_holder_name: company.bank_details[0].account_holder_name || "", account_number: company.bank_details[0].account_number || "", is_primary: company.bank_details[0].is_primary ?? true }
          : { bank_id: 0, account_holder_name: "", account_number: "", is_primary: true },
        upi_details: company.upi_details ? { upi_id: company.upi_details.upi_id || "", upi_qr_url: company.upi_details.upi_qr_url || "" } : { upi_id: "", upi_qr_url: "" },
        invoice_settings: company.invoice_settings ? { invoice_prefix: company.invoice_settings.invoice_prefix || "INV", invoice_start_number: company.invoice_settings.invoice_start_number || 1, show_logo: company.invoice_settings.show_logo ?? true, show_signature: company.invoice_settings.show_signature ?? false, round_off_total: company.invoice_settings.round_off_total ?? true } : { invoice_prefix: "INV", invoice_start_number: 1, show_logo: true, show_signature: false, round_off_total: true },
        tax_settings: company.tax_settings ? { gst_enabled: company.tax_settings.gst_enabled ?? true, tax_type_id: company.tax_settings.tax_type_id || 0 } : { gst_enabled: true, tax_type_id: 0 },
        regional_settings: company.regional_settings ? { timezone: company.regional_settings.timezone || "Asia/Kolkata", date_format: company.regional_settings.date_format || "DD/MM/YYYY", time_format: company.regional_settings.time_format || "24h", currency_code: company.regional_settings.currency_code || "INR", currency_symbol: company.regional_settings.currency_symbol || "₹", language_code: company.regional_settings.language_code || "en" } : { timezone: "Asia/Kolkata", date_format: "DD/MM/YYYY", time_format: "24h", currency_code: "INR", currency_symbol: "₹", language_code: "en" },
      });
    }
  }, [company]);

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      handleSubmit();
    } else {
      setAnimDir("forward");
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setAnimDir("back");
    setActiveStep((s) => s - 1);
  };

  const handleFormDataChange = (section: string, data: any) => {
    setFormData((prev) => ({ ...prev, [section]: data }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.company.company_name.trim()) throw new Error("Company name is required");
      if (formData.company.business_type_id === 0) throw new Error("Please select a valid business type");
      if (!formData.contact.mobile.trim()) throw new Error("Mobile number is required");
      if (!formData.contact.email.trim()) throw new Error("Email is required");
      if (formData.address.country_id === 0) throw new Error("Please select a country");
      if (formData.address.state_id === 0) throw new Error("Please select a state");

      const submitData: CompleteCompanySetupInput = {
        ...formData,
        tax_settings: formData.tax_settings?.tax_type_id ?? 0 > 0 ? formData.tax_settings : undefined,
        bank_details: formData.bank_details?.bank_id ?? 0 > 0 ? formData.bank_details : undefined,
        upi_details: formData.upi_details?.upi_id?.trim() ? formData.upi_details : undefined,
      };

      let response;
      if (company) {
        response = await companyApi.updateCompany(company.company.id, submitData);
      } else {
        response = await companyApi.completeCompanySetup(submitData);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (!company) window.location.href = `/company-profile/${response.company.id}`;
      }, 2500);
    } catch (err: any) {
      setError(formatErrorMessage(err));
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${dt.cream} 0%, #F5F0E8 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: dt.font,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            animation: "fadeScaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
            "@keyframes fadeScaleIn": { from: { opacity: 0, transform: "scale(0.85)" }, to: { opacity: 1, transform: "scale(1)" } },
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${dt.gold} 0%, ${dt.goldLight} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              mx: "auto",
              mb: 3,
              boxShadow: `0 16px 40px rgba(201,148,58,0.35)`,
            }}
          >
            ✓
          </Box>
          <Box sx={{ fontFamily: dt.fontDisplay, fontSize: 32, fontWeight: 700, color: dt.navy, mb: 1 }}>
            {company ? "Company Updated!" : "Setup Complete!"}
          </Box>
          <Box sx={{ color: dt.textSecondary, fontSize: 16 }}>
            Redirecting you to your company profile…
          </Box>
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={20} sx={{ color: dt.gold }} />
          </Box>
        </Box>
      </Box>
    );
  }

  const stepProps = { key: activeStep };

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');`}</style>

      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${dt.cream} 0%, #F5EFE2 60%, #EEE8DA 100%)`,
          fontFamily: dt.font,
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="md">

          {/* ── Header ── */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: dt.navy,
                color: "#fff",
                px: 3,
                py: 1,
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                mb: 2.5,
                fontFamily: dt.font,
              }}
            >
              <span>🏢</span>
              {company ? "EDIT COMPANY PROFILE" : "COMPANY ONBOARDING"}
            </Box>
            <Box
              sx={{
                fontFamily: dt.fontDisplay,
                fontSize: { xs: 28, md: 38 },
                fontWeight: 700,
                color: dt.navy,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {company?.company?.company_name ? `Update ${company.company.company_name}` : "Set Up Your Business"}
            </Box>
            <Box sx={{ color: dt.textSecondary, mt: 1.5, fontSize: 15, fontFamily: dt.font }}>
              Complete {STEPS.length} quick steps to get started
            </Box>
          </Box>

          {/* ── Stepper ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 4,
              px: { xs: 0, md: 2 },
              overflow: "hidden",
            }}
          >
            {STEPS.map((_, i) => (
              <StepIndicator key={i} active={activeStep} step={i} />
            ))}
          </Box>

          {/* ── Progress bar ── */}
          <Box
            sx={{
              height: 3,
              bgcolor: dt.border,
              borderRadius: 99,
              mb: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${((activeStep) / (STEPS.length - 1)) * 100}%`,
                background: `linear-gradient(90deg, ${dt.navy}, ${dt.gold})`,
                borderRadius: 99,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </Box>

          {/* ── Step card ── */}
          <Box
            sx={{
              bgcolor: dt.white,
              borderRadius: dt.radius,
              boxShadow: dt.shadowMd,
              border: `1px solid ${dt.borderLight}`,
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <Box
              sx={{
                px: { xs: 3, md: 5 },
                pt: { xs: 3, md: 4 },
                pb: 2.5,
                borderBottom: `1px solid ${dt.borderLight}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: dt.radiusSm,
                  background: `linear-gradient(135deg, ${dt.navy}18, ${dt.navy}08)`,
                  border: `1px solid ${dt.navy}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {STEPS[activeStep].icon}
              </Box>
              <Box>
                <Box sx={{ fontFamily: dt.fontDisplay, fontSize: 20, fontWeight: 700, color: dt.navy, lineHeight: 1 }}>
                  {STEPS[activeStep].label}
                </Box>
                <Box sx={{ color: dt.textSecondary, fontSize: 13, mt: 0.5, fontFamily: dt.font }}>
                  Step {activeStep + 1} of {STEPS.length} — {STEPS[activeStep].sublabel}
                </Box>
              </Box>
            </Box>

            {/* Error */}
            {error && (
              <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{
                    borderRadius: dt.radiusSm,
                    fontFamily: dt.font,
                    fontSize: 14,
                    "& .MuiAlert-icon": { alignItems: "center" },
                  }}
                >
                  {error}
                </Alert>
              </Box>
            )}

            {/* Step content */}
            <Box
              sx={{
                px: { xs: 3, md: 5 },
                py: { xs: 3, md: 4 },
                minHeight: 380,
                animation: "slideIn 0.28s ease forwards",
                "@keyframes slideIn": {
                  from: { opacity: 0, transform: `translateX(${animDir === "forward" ? "24px" : "-24px"})` },
                  to: { opacity: 1, transform: "translateX(0)" },
                },
              }}
            >
              {activeStep === 0 && <CompanyDetailsStep {...stepProps} data={formData.company} onChange={(d) => handleFormDataChange("company", d)} />}
              {activeStep === 1 && <ContactDetailsStep {...stepProps} data={formData.contact} onChange={(d) => handleFormDataChange("contact", d)} />}
              {activeStep === 2 && <AddressDetailsStep {...stepProps} data={formData.address} onChange={(d) => handleFormDataChange("address", d)} />}
              {activeStep === 3 && <PaymentDetailsStep {...stepProps} bankData={formData.bank_details} upiData={formData.upi_details} onBankChange={(d) => handleFormDataChange("bank_details", d)} onUPIChange={(d) => handleFormDataChange("upi_details", d)} />}
              {activeStep === 4 && <SettingsStep {...stepProps} invoiceData={formData.invoice_settings} taxData={formData.tax_settings} regionalData={formData.regional_settings} onInvoiceChange={(d) => handleFormDataChange("invoice_settings", d)} onTaxChange={(d) => handleFormDataChange("tax_settings", d)} onRegionalChange={(d) => handleFormDataChange("regional_settings", d)} />}
              {activeStep === 5 && <ReviewStep {...stepProps} formData={formData} />}
            </Box>

            {/* Footer nav */}
            <Box
              sx={{
                px: { xs: 3, md: 5 },
                py: 3,
                borderTop: `1px solid ${dt.borderLight}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#FAFAF7",
              }}
            >
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                sx={{
                  fontFamily: dt.font,
                  fontWeight: 600,
                  color: dt.textSecondary,
                  textTransform: "none",
                  fontSize: 14,
                  px: 3,
                  py: 1.2,
                  borderRadius: dt.radiusSm,
                  border: `1.5px solid ${dt.border}`,
                  bgcolor: dt.white,
                  "&:hover": { bgcolor: dt.cream, borderColor: dt.navy + "40" },
                  "&:disabled": { opacity: 0.35 },
                  transition: "all 0.2s ease",
                }}
              >
                ← Back
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Dot indicators */}
                {STEPS.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: i === activeStep ? 20 : 6,
                      height: 6,
                      borderRadius: 99,
                      bgcolor: i === activeStep ? dt.navy : i < activeStep ? dt.gold : dt.border,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{
                  fontFamily: dt.font,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 14,
                  px: 4,
                  py: 1.2,
                  borderRadius: dt.radiusSm,
                  background: loading ? undefined : `linear-gradient(135deg, ${dt.navy} 0%, ${dt.navyLight} 100%)`,
                  boxShadow: `0 4px 16px ${dt.navy}30`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${dt.navyLight} 0%, #3A5F8A 100%)`,
                    boxShadow: `0 6px 20px ${dt.navy}40`,
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                  transition: "all 0.2s ease",
                  minWidth: 140,
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : activeStep === STEPS.length - 1 ? (
                  company ? "Update Company ✓" : "Complete Setup ✓"
                ) : (
                  "Continue →"
                )}
              </Button>
            </Box>
          </Box>

          {/* Footer note */}
          <Box sx={{ textAlign: "center", mt: 3, color: dt.textMuted, fontSize: 12, fontFamily: dt.font }}>
            🔒 Your data is encrypted and secure. You can edit these details anytime.
          </Box>
        </Container>
      </Box>
    </>
  );
}