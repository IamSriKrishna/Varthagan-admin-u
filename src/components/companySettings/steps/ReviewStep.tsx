"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { CompleteCompanySetupInput } from "@/lib/api/companyApi";

interface ReviewStepProps {
  formData: CompleteCompanySetupInput;
}

export default function ReviewStep({ formData }: ReviewStepProps) {
  const renderSection = (title: string, items: Record<string, any>) => (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {Object.entries(items).map(([key, value]: [string, any]) => (
          <Box key={key}>
            <Typography variant="caption" color="textSecondary">
              {key.replace(/_/g, " ").toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {typeof value === "boolean" ? (
                <Chip
                  label={value ? "Yes" : "No"}
                  size="small"
                  color={value ? "success" : "default"}
                />
              ) : value ? (
                String(value)
              ) : (
                <span style={{ color: "#999" }}>Not provided</span>
              )}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Review Your Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {renderSection("Company Information", {
        company_name: formData.company.company_name,
        business_type_id: formData.company.business_type_id,
        gst_number: formData.company.gst_number,
        pan_number: formData.company.pan_number,
      })}

      {renderSection("Contact Information", {
        mobile: formData.contact.mobile,
        alternate_mobile: formData.contact.alternate_mobile,
        email: formData.contact.email,
      })}

      {renderSection("Address", {
        address_line1: formData.address.address_line1,
        address_line2: formData.address.address_line2,
        city: formData.address.city,
        state_id: formData.address.state_id,
        country_id: formData.address.country_id,
        pincode: formData.address.pincode,
      })}

      {formData.bank_details?.bank_name &&
        renderSection("Bank Details", {
          bank_name: formData.bank_details.bank_name,
          account_holder_name: formData.bank_details.account_holder_name,
          account_number: formData.bank_details.account_number,
          ifsc_code: formData.bank_details.ifsc_code,
          branch_name: formData.bank_details.branch_name,
          is_primary: formData.bank_details.is_primary,
        })}

      {formData.upi_details?.upi_id &&
        renderSection("UPI Details", {
          upi_id: formData.upi_details.upi_id,
          upi_qr_url: formData.upi_details.upi_qr_url,
        })}

      {renderSection("Invoice Settings", {
        invoice_prefix: formData.invoice_settings?.invoice_prefix,
        invoice_start_number: formData.invoice_settings?.invoice_start_number,
        show_logo: formData.invoice_settings?.show_logo,
        show_signature: formData.invoice_settings?.show_signature,
        round_off_total: formData.invoice_settings?.round_off_total,
      })}

      {renderSection("Tax Settings", {
        gst_enabled: formData.tax_settings?.gst_enabled,
        tax_type_id: formData.tax_settings?.tax_type_id,
      })}

      {renderSection("Regional Settings", {
        timezone: formData.regional_settings?.timezone,
        date_format: formData.regional_settings?.date_format,
        time_format: formData.regional_settings?.time_format,
        currency_code: formData.regional_settings?.currency_code,
        currency_symbol: formData.regional_settings?.currency_symbol,
        language_code: formData.regional_settings?.language_code,
      })}

      <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
        Please review all information carefully. Click "Complete Setup" to
        finalize your company setup.
      </Typography>
    </Box>
  );
}
