"use client";

import React from "react";
import { Box } from "@mui/material";
import { CompleteCompanySetupInput } from "@/lib/api/companyApi";
import { dt } from "../designTokens";

interface ReviewStepProps {
  formData: CompleteCompanySetupInput;
}

/* ── Pill badge ── */
function BoolBadge({ value }: { value: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        fontSize: 11.5,
        fontWeight: 700,
        px: 1.5,
        py: 0.3,
        borderRadius: 99,
        fontFamily: dt.font,
        bgcolor: value ? `${dt.success}15` : `${dt.textMuted}15`,
        color: value ? dt.success : dt.textMuted,
        border: `1px solid ${value ? dt.success + "30" : dt.border}`,
      }}
    >
      {value ? "✓ Yes" : "✗ No"}
    </Box>
  );
}

/* ── Single field row ── */
function ReviewField({ label, value }: { label: string; value?: any }) {
  const empty = value === undefined || value === null || value === "" || value === 0;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
      <Box sx={{ fontFamily: dt.font, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", color: dt.textMuted, textTransform: "uppercase" }}>
        {label.replace(/_/g, " ")}
      </Box>
      <Box sx={{ fontFamily: dt.font, fontSize: 13.5, color: empty ? dt.textMuted : dt.textPrimary, fontStyle: empty ? "italic" : "normal" }}>
        {typeof value === "boolean" ? (
          <BoolBadge value={value} />
        ) : empty ? (
          "—"
        ) : (
          String(value)
        )}
      </Box>
    </Box>
  );
}

/* ── Section block ── */
function ReviewSection({ title, icon, fields }: { title: string; icon: string; fields: [string, any][] }) {
  const hasContent = fields.some(([, v]) => v !== undefined && v !== null && v !== "" && v !== 0);
  if (!hasContent) return null;

  return (
    <Box
      sx={{
        border: `1px solid ${dt.border}`,
        borderRadius: dt.radius,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: dt.shadow },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
          borderBottom: `1px solid ${dt.borderLight}`,
          background: `linear-gradient(90deg, ${dt.navy}06 0%, transparent 100%)`,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: dt.radiusSm,
            bgcolor: `${dt.navy}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ fontFamily: dt.font, fontWeight: 700, fontSize: 14, color: dt.navy }}>
          {title}
        </Box>
      </Box>
      <Box
        sx={{
          p: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 2.5,
        }}
      >
        {fields.map(([label, value]) => (
          <ReviewField key={label} label={label} value={value} />
        ))}
      </Box>
    </Box>
  );
}

export default function ReviewStep({ formData }: ReviewStepProps) {
  const { company, contact, address, bank_details, upi_details, invoice_settings, tax_settings, regional_settings } = formData;

  /* Completeness score */
  const checks = [
    !!company.company_name,
    company.business_type_id > 0,
    !!contact.mobile,
    !!contact.email,
    address.country_id > 0,
    address.state_id > 0,
    !!address.city,
    !!(bank_details?.account_number),
    !!(upi_details?.upi_id),
    !!(invoice_settings?.invoice_prefix),
    !!(tax_settings?.tax_type_id),
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Completeness bar */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: dt.radiusSm,
          bgcolor: score >= 80 ? `${dt.success}10` : `${dt.gold}10`,
          border: `1px solid ${score >= 80 ? dt.success + "30" : dt.gold + "40"}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ fontFamily: dt.font, fontWeight: 700, fontSize: 13, color: score >= 80 ? dt.success : dt.gold }}>
            {score >= 80 ? "🎉 Profile looks great!" : "📝 Almost there—optional fields can be added later"}
          </Box>
          <Box sx={{ fontFamily: dt.font, fontWeight: 800, fontSize: 16, color: score >= 80 ? dt.success : dt.gold }}>
            {score}%
          </Box>
        </Box>
        <Box sx={{ height: 6, bgcolor: dt.border, borderRadius: 99, overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${score}%`,
              background: score >= 80
                ? `linear-gradient(90deg, ${dt.success}, #56D49B)`
                : `linear-gradient(90deg, ${dt.gold}, ${dt.goldLight})`,
              borderRadius: 99,
              transition: "width 0.6s ease",
            }}
          />
        </Box>
      </Box>

      {/* Sections */}
      <ReviewSection title="Company Information" icon="🏢" fields={[
        ["Company Name",   company.company_name],
        ["Business Type",  company.business_type_id],
        ["GST Number",     company.gst_number],
        ["PAN Number",     company.pan_number],
      ]} />

      <ReviewSection title="Contact Information" icon="📞" fields={[
        ["Mobile",           contact.mobile],
        ["Alternate Mobile", contact.alternate_mobile],
        ["Email",            contact.email],
      ]} />

      <ReviewSection title="Address" icon="📍" fields={[
        ["Line 1",    address.address_line1],
        ["Line 2",    address.address_line2],
        ["City",      address.city],
        ["Pincode",   address.pincode],
        ["State ID",  address.state_id],
        ["Country ID",address.country_id],
      ]} />

      {bank_details?.account_number && (
        <ReviewSection title="Bank Account" icon="🏦" fields={[
          ["Bank",                bank_details.bank_id],
          ["Account Holder",      bank_details.account_holder_name],
          ["Account Number",      bank_details.account_number],
          ["Primary Account",     bank_details.is_primary],
        ]} />
      )}

      {upi_details?.upi_id && (
        <ReviewSection title="UPI Details" icon="📲" fields={[
          ["UPI ID",      upi_details.upi_id],
          ["QR Code URL", upi_details.upi_qr_url],
        ]} />
      )}

      <ReviewSection title="Invoice Settings" icon="🧾" fields={[
        ["Prefix",         invoice_settings?.invoice_prefix],
        ["Start Number",   invoice_settings?.invoice_start_number],
        ["Show Logo",      invoice_settings?.show_logo],
        ["Show Signature", invoice_settings?.show_signature],
        ["Round Off Total",invoice_settings?.round_off_total],
      ]} />

      <ReviewSection title="Tax Settings" icon="📊" fields={[
        ["GST Enabled", tax_settings?.gst_enabled],
        ["Tax Type ID", tax_settings?.tax_type_id],
      ]} />

      <ReviewSection title="Regional Settings" icon="🌏" fields={[
        ["Timezone",        regional_settings?.timezone],
        ["Date Format",     regional_settings?.date_format],
        ["Time Format",     regional_settings?.time_format],
        ["Currency",        regional_settings ? `${regional_settings.currency_code} (${regional_settings.currency_symbol})` : ""],
        ["Language",        regional_settings?.language_code],
      ]} />

      {/* Final CTA note */}
      <Box
        sx={{
          textAlign: "center",
          fontFamily: dt.font,
          fontSize: 12.5,
          color: dt.textMuted,
          p: 2,
          borderRadius: dt.radiusSm,
          bgcolor: dt.cream,
          border: `1px solid ${dt.border}`,
        }}
      >
        🔒 &nbsp;Please review all information before submitting. You can go back and edit any section using the <strong>Back</strong> button.
      </Box>
    </Box>
  );
}