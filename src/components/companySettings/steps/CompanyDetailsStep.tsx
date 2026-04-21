"use client";

import React, { useState, useEffect } from "react";
import { Box, MenuItem } from "@mui/material";
import { CreateCompanyInput, companyApi, BusinessType } from "@/lib/api/companyApi";
import { StyledField, StyledSelect, FieldRow, LoadingPane } from "./shared";
import { dt } from "../designTokens";

interface CompanyDetailsStepProps {
  data: CreateCompanyInput;
  onChange: (data: CreateCompanyInput) => void;
}

export default function CompanyDetailsStep({ data, onChange }: CompanyDetailsStepProps) {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchBusinessTypes(); }, []);

  const fetchBusinessTypes = async () => {
    try {
      setLoading(true);
      setBusinessTypes(await companyApi.getBusinessTypes());
    } catch {
      setError("Failed to load business types");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: any) => onChange({ ...data, [field]: value });

  if (loading) return <LoadingPane />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Intro note */}
      <Box
        sx={{
          p: 2,
          borderRadius: dt.radiusSm,
          background: `linear-gradient(90deg, ${dt.navy}08 0%, transparent 100%)`,
          border: `1px solid ${dt.navy}15`,
          fontFamily: dt.font,
          fontSize: 13,
          color: dt.textSecondary,
          lineHeight: 1.6,
        }}
      >
        ℹ️ &nbsp;Enter your registered business information. GST and PAN are optional but recommended for tax compliance.
      </Box>

      {/* Company Name */}
      <StyledField
        label="Company Name"
        value={data.company_name}
        onChange={(e) => set("company_name", e.target.value)}
        required
        placeholder="e.g., Acme Enterprises Pvt. Ltd."
        helperText="As registered with your government authority"
      />

      {/* Business Type */}
      <StyledSelect
        label="Business Type *"
        value={data.business_type_id || 0}
        error={data.business_type_id === 0}
        onChange={(e) => set("business_type_id", e.target.value as number)}
        helperText={data.business_type_id === 0 ? "Please select your business structure" : ""}
      >
        <MenuItem value={0} disabled sx={{ fontFamily: dt.font, color: dt.textMuted }}>
          Select a business type…
        </MenuItem>
        {businessTypes.map((t) => (
          <MenuItem key={t.id} value={t.id} sx={{ fontFamily: dt.font, fontSize: 14 }}>
            <Box>
              <Box sx={{ fontWeight: 600 }}>{t.type_name}</Box>
              {t.description && <Box sx={{ fontSize: 12, color: dt.textMuted }}>{t.description}</Box>}
            </Box>
          </MenuItem>
        ))}
      </StyledSelect>

      {/* GST + PAN side-by-side */}
      <FieldRow>
        <StyledField
          label="GST Number"
          value={data.gst_number}
          onChange={(e) => set("gst_number", e.target.value.toUpperCase().slice(0, 15))}
          placeholder="29AABCT1332L1Z5"
          helperText={`${(data.gst_number || "").length}/15 characters`}
          error={(data.gst_number?.length ?? 0) > 15}
          inputProps={{ maxLength: 15, style: { letterSpacing: "0.06em", fontFamily: "monospace" } }}
        />
        <StyledField
          label="PAN Number"
          value={data.pan_number}
          onChange={(e) => set("pan_number", e.target.value.toUpperCase().slice(0, 10))}
          placeholder="AABCT1332L"
          helperText={`${(data.pan_number || "").length}/10 characters`}
          error={(data.pan_number?.length ?? 0) > 10}
          inputProps={{ maxLength: 10, style: { letterSpacing: "0.06em", fontFamily: "monospace" } }}
        />
      </FieldRow>

      {/* Character badges */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          { label: "GST Format", example: "29AABCT1332L1Z5", chars: 15 },
          { label: "PAN Format", example: "AABCT1332L", chars: 10 },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: 11.5,
              color: dt.textMuted,
              fontFamily: dt.font,
              bgcolor: dt.cream,
              px: 2,
              py: 0.8,
              borderRadius: 99,
              border: `1px solid ${dt.border}`,
            }}
          >
            <span style={{ color: dt.gold, fontWeight: 700 }}>●</span>
            {item.label}: <code style={{ fontSize: 11 }}>{item.example}</code> ({item.chars} chars)
          </Box>
        ))}
      </Box>
    </Box>
  );
}