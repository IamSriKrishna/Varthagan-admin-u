"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { companyApi, CompleteCompanySetupInput, CompanyData } from "@/lib/api/companyApi";
import { formatErrorMessage } from "@/utils/companyErrorHandler";
import CompanyDetailsStep from "./steps/CompanyDetailsStep";
import ContactDetailsStep from "./steps/ContactDetailsStep";
import AddressDetailsStep from "./steps/AddressDetailsStep";
import PaymentDetailsStep from "./steps/PaymentDetailsStep";
import SettingsStep from "./steps/SettingsStep";
import ReviewStep from "./steps/ReviewStep";

const steps = [
  "Company Details",
  "Contact Information",
  "Address",
  "Payment Methods",
  "Settings",
  "Review",
];

interface CompanySetupWizardProps {
  company?: CompanyData | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CompanySetupWizard({
  company,
  onClose,
  onSuccess,
}: CompanySetupWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CompleteCompanySetupInput>({
    company: {
      company_name: "",
      business_type_id: 0,
      gst_number: "",
      pan_number: "",
    },
    contact: {
      mobile: "",
      alternate_mobile: "",
      email: "",
    },
    address: {
      address_line1: "",
      address_line2: "",
      city: "",
      state_id: 0,
      country_id: 0,
      pincode: "",
    },
    bank_details: {
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      ifsc_code: "",
      branch_name: "",
      is_primary: true,
    },
    upi_details: {
      upi_id: "",
      upi_qr_url: "",
    },
    invoice_settings: {
      invoice_prefix: "INV",
      invoice_start_number: 1,
      show_logo: true,
      show_signature: false,
      round_off_total: true,
    },
    tax_settings: {
      gst_enabled: true,
      tax_type_id: 0,
    },
    regional_settings: {
      timezone: "Asia/Kolkata",
      date_format: "DD/MM/YYYY",
      time_format: "24h",
      currency_code: "INR",
      currency_symbol: "₹",
      language_code: "en",
    },
  });

  // Initialize form data when company is provided (edit mode)
  useEffect(() => {
    if (company && Object.keys(company).length > 0) {
      setFormData({
        company: {
          company_name: company.company.company_name || "",
          business_type_id: company.company.business_type_id || 0,
          gst_number: company.company.gst_number || "",
          pan_number: company.company.pan_number || "",
        },
        contact: {
          mobile: company.contact.mobile || "",
          alternate_mobile: company.contact.alternate_mobile || "",
          email: company.contact.email || "",
        },
        address: {
          address_line1: company.address.address_line1 || "",
          address_line2: company.address.address_line2 || "",
          city: company.address.city || "",
          state_id: company.address.state_id || 0,
          country_id: company.address.country_id || 0,
          pincode: company.address.pincode || "",
        },
        bank_details: company.bank_details?.[0]
          ? {
              bank_name: company.bank_details[0].bank_name || "",
              account_holder_name: company.bank_details[0].account_holder_name || "",
              account_number: company.bank_details[0].account_number || "",
              ifsc_code: company.bank_details[0].ifsc_code || "",
              branch_name: company.bank_details[0].branch_name || "",
              is_primary: company.bank_details[0].is_primary ?? true,
            }
          : {
              bank_name: "",
              account_holder_name: "",
              account_number: "",
              ifsc_code: "",
              branch_name: "",
              is_primary: true,
            },
        upi_details: company.upi_details
          ? {
              upi_id: company.upi_details.upi_id || "",
              upi_qr_url: company.upi_details.upi_qr_url || "",
            }
          : {
              upi_id: "",
              upi_qr_url: "",
            },
        invoice_settings: company.invoice_settings
          ? {
              invoice_prefix: company.invoice_settings.invoice_prefix || "INV",
              invoice_start_number:
                company.invoice_settings.invoice_start_number || 1,
              show_logo: company.invoice_settings.show_logo ?? true,
              show_signature:
                company.invoice_settings.show_signature ?? false,
              round_off_total:
                company.invoice_settings.round_off_total ?? true,
            }
          : {
              invoice_prefix: "INV",
              invoice_start_number: 1,
              show_logo: true,
              show_signature: false,
              round_off_total: true,
            },
        tax_settings: company.tax_settings
          ? {
              gst_enabled: company.tax_settings.gst_enabled ?? true,
              tax_type_id: company.tax_settings.tax_type_id || 0,
            }
          : {
              gst_enabled: true,
              tax_type_id: 0,
            },
        regional_settings: company.regional_settings
          ? {
              timezone: company.regional_settings.timezone || "Asia/Kolkata",
              date_format:
                company.regional_settings.date_format || "DD/MM/YYYY",
              time_format: company.regional_settings.time_format || "24h",
              currency_code: company.regional_settings.currency_code || "INR",
              currency_symbol:
                company.regional_settings.currency_symbol || "₹",
              language_code: company.regional_settings.language_code || "en",
            }
          : {
              timezone: "Asia/Kolkata",
              date_format: "DD/MM/YYYY",
              time_format: "24h",
              currency_code: "INR",
              currency_symbol: "₹",
              language_code: "en",
            },
      });
    }
  }, [company]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormDataChange = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.company.company_name.trim()) {
        throw new Error("Company name is required");
      }

      if (formData.company.business_type_id === 0) {
        throw new Error("Please select a valid business type");
      }

      if (!formData.contact.mobile.trim()) {
        throw new Error("Mobile number is required");
      }

      if (!formData.contact.email.trim()) {
        throw new Error("Email is required");
      }

      if (formData.address.country_id === 0) {
        throw new Error("Please select a country");
      }

      if (formData.address.state_id === 0) {
        throw new Error("Please select a state");
      }

      // Prepare submission data - exclude invalid optional fields
      const submitData: CompleteCompanySetupInput = {
        ...formData,
        tax_settings:
          formData.tax_settings && formData.tax_settings.tax_type_id > 0
            ? formData.tax_settings
            : undefined,
        bank_details:
          formData.bank_details && formData.bank_details.bank_name?.trim()
            ? formData.bank_details
            : undefined,
        upi_details:
          formData.upi_details && formData.upi_details.upi_id?.trim()
            ? formData.upi_details
            : undefined,
      };

      let response;
      if (company) {
        // Edit mode - update existing company
        const companyId = company.company.id;
        response = await companyApi.updateCompany(companyId, submitData);
      } else {
        // Create mode - new company
        response = await companyApi.completeCompanySetup(submitData);
      }

      setSuccess(true);
      setError(null);

      // Redirect or call callback after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else if (!company) {
          // Only redirect on create, not on edit
          window.location.href = `/company-profile/${response.company.id}`;
        }
      }, 2000);
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Alert severity="success">
            Company setup completed successfully! Redirecting...
          </Alert>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ minHeight: 400, mb: 4 }}>
              {activeStep === 0 && (
                <CompanyDetailsStep
                  data={formData.company}
                  onChange={(data) => handleFormDataChange("company", data)}
                />
              )}
              {activeStep === 1 && (
                <ContactDetailsStep
                  data={formData.contact}
                  onChange={(data) => handleFormDataChange("contact", data)}
                />
              )}
              {activeStep === 2 && (
                <AddressDetailsStep
                  data={formData.address}
                  onChange={(data) => handleFormDataChange("address", data)}
                />
              )}
              {activeStep === 3 && (
                <PaymentDetailsStep
                  bankData={formData.bank_details}
                  upiData={formData.upi_details}
                  onBankChange={(data) => handleFormDataChange("bank_details", data)}
                  onUPIChange={(data) => handleFormDataChange("upi_details", data)}
                />
              )}
              {activeStep === 4 && (
                <SettingsStep
                  invoiceData={formData.invoice_settings}
                  taxData={formData.tax_settings}
                  regionalData={formData.regional_settings}
                  onInvoiceChange={(data) => handleFormDataChange("invoice_settings", data)}
                  onTaxChange={(data) => handleFormDataChange("tax_settings", data)}
                  onRegionalChange={(data) => handleFormDataChange("regional_settings", data)}
                />
              )}
              {activeStep === 5 && (
                <ReviewStep
                  formData={formData}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  company ? "Update Company" : "Complete Setup"
                ) : (
                  "Next"
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
