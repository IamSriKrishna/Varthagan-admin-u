"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { UpsertCompanyContactInput } from "@/lib/api/companyApi";
import { StyledField, FieldRow } from "./shared";
import { dt } from "../designTokens";

interface ContactDetailsStepProps {
  data: UpsertCompanyContactInput;
  onChange: (data: UpsertCompanyContactInput) => void;
}

function validateMobile(value: string) {
  if (!value) return "";
  if (!/^\d+$/.test(value)) return "Only digits allowed";
  if (value.length < 10 || value.length > 15) return "Must be 10–15 digits";
  return "";
}

function validateEmail(value: string) {
  if (!value) return "";
  if (value.length > 255) return "Max 255 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
  return "";
}

export default function ContactDetailsStep({ data, onChange }: ContactDetailsStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const set = (field: string, value: string) => onChange({ ...data, [field]: value });

  const mobileErr  = validateMobile(data.mobile);
  const altErr     = validateMobile(data.alternate_mobile ?? "");
  const emailErr   = validateEmail(data.email);

  /* Inline avatar-style field prefix */
  const prefix = (emoji: string) => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: dt.radiusSm,
        bgcolor: `${dt.navy}10`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {emoji}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Tip banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: dt.radiusSm,
          bgcolor: `${dt.gold}12`,
          border: `1px solid ${dt.gold}40`,
        }}
      >
        <span style={{ fontSize: 20 }}>📲</span>
        <Box sx={{ fontFamily: dt.font, fontSize: 13, color: dt.textSecondary, lineHeight: 1.5 }}>
          Your mobile number will be used for OTP verification and critical business alerts.
        </Box>
      </Box>

      {/* Mobile numbers in a row */}
      <FieldRow>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {prefix("📱")}
          <Box sx={{ flex: 1 }}>
            <StyledField
              label="Mobile Number *"
              value={data.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              onBlur={() => touch("mobile")}
              type="tel"
              placeholder="9876543210"
              error={!!mobileErr && touched.mobile}
              helperText={(touched.mobile && mobileErr) || "10–15 digits, no spaces or dashes"}
              inputProps={{ maxLength: 15, inputMode: "numeric" }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {prefix("☎️")}
          <Box sx={{ flex: 1 }}>
            <StyledField
              label="Alternate Mobile"
              value={data.alternate_mobile ?? ""}
              onChange={(e) => set("alternate_mobile", e.target.value)}
              onBlur={() => touch("alternate_mobile")}
              type="tel"
              placeholder="Optional"
              error={!!altErr && touched.alternate_mobile}
              helperText={(touched.alternate_mobile && altErr) || "Backup contact number"}
              inputProps={{ maxLength: 15, inputMode: "numeric" }}
            />
          </Box>
        </Box>
      </FieldRow>

      {/* Email */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {prefix("✉️")}
        <Box sx={{ flex: 1 }}>
          <StyledField
            label="Email Address *"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            type="email"
            placeholder="company@example.com"
            error={!!emailErr && touched.email}
            helperText={(touched.email && emailErr) || "Used for invoices, reports, and account notifications"}
          />
        </Box>
      </Box>

      {/* Validation summary */}
      {(data.mobile || data.email) && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mt: 0.5,
          }}
        >
          {[
            { label: "Mobile", ok: !mobileErr && !!data.mobile },
            { label: "Email", ok: !emailErr && !!data.email },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                fontSize: 12,
                fontFamily: dt.font,
                color: item.ok ? dt.success : dt.textMuted,
                bgcolor: item.ok ? `${dt.success}10` : dt.cream,
                px: 2,
                py: 0.6,
                borderRadius: 99,
                border: `1px solid ${item.ok ? dt.success + "30" : dt.border}`,
                fontWeight: 600,
                transition: "all 0.3s ease",
              }}
            >
              {item.ok ? "✓" : "○"} {item.label} {item.ok ? "valid" : "required"}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}