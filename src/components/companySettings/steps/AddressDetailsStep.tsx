"use client";

import React, { useState, useEffect } from "react";
import { Box, MenuItem, Alert } from "@mui/material";
import { UpsertCompanyAddressInput, companyApi, Country, State } from "@/lib/api/companyApi";
import { StyledField, StyledSelect, FieldRow, LoadingPane } from "./shared";
import { dt } from "../designTokens";

interface AddressDetailsStepProps {
  data: UpsertCompanyAddressInput;
  onChange: (data: UpsertCompanyAddressInput) => void;
}

export default function AddressDetailsStep({ data, onChange }: AddressDetailsStepProps) {
  const [countries, setCountries]       = useState<Country[]>([]);
  const [states, setStates]             = useState<State[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => { fetchCountries(); }, []);
  useEffect(() => { if (data.country_id) fetchStates(data.country_id); }, [data.country_id]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const list = await companyApi.getCountries();
      setCountries(list);
      const india = list.find((c) => c.country_code === "IN");
      if (india && !data.country_id) onChange({ ...data, country_id: india.id });
    } catch {
      setError("Failed to load countries. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      setStatesLoading(true);
      setStates(await companyApi.getStatesByCountry(countryId));
    } catch {
      setError("Failed to load states.");
    } finally {
      setStatesLoading(false);
    }
  };

  const set = (field: string, value: any) => onChange({ ...data, [field]: value });

  const selectedCountry = countries.find((c) => c.id === data.country_id);
  const selectedState   = states.find((s) => s.id === data.state_id);

  if (loading) return <LoadingPane />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {error && (
        <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: dt.radiusSm, fontFamily: dt.font }}>
          {error}
        </Alert>
      )}

      {/* Map visual hint */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: dt.radiusSm,
          background: `linear-gradient(135deg, ${dt.navy}06 0%, ${dt.gold}08 100%)`,
          border: `1px solid ${dt.border}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ fontSize: 36, lineHeight: 1 }}>📍</Box>
        <Box>
          <Box sx={{ fontFamily: dt.font, fontWeight: 600, fontSize: 13.5, color: dt.navy }}>
            Registered Business Address
          </Box>
          <Box sx={{ fontFamily: dt.font, fontSize: 12, color: dt.textMuted, mt: 0.3 }}>
            This will appear on all your invoices and official documents.
          </Box>
        </Box>
      </Box>

      {/* Street */}
      <StyledField
        label="Address Line 1 *"
        value={data.address_line1}
        onChange={(e) => set("address_line1", e.target.value)}
        placeholder="Building/House No., Street Name"
        helperText="Your primary street address"
      />

      <StyledField
        label="Address Line 2"
        value={data.address_line2 ?? ""}
        onChange={(e) => set("address_line2", e.target.value)}
        placeholder="Floor, Landmark, Area (optional)"
      />

      {/* City + Pincode */}
      <FieldRow>
        <StyledField
          label="City *"
          value={data.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="e.g., Mumbai"
        />
        <StyledField
          label="Pincode *"
          value={data.pincode}
          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="e.g., 400001"
          inputProps={{ inputMode: "numeric", maxLength: 10 }}
          helperText="6-digit postal code"
        />
      </FieldRow>

      {/* Country + State */}
      <FieldRow>
        <StyledSelect
          label="Country *"
          value={data.country_id || 0}
          error={data.country_id === 0}
          onChange={(e) => {
            set("country_id", e.target.value as number);
            set("state_id", 0);
            setStates([]);
          }}
        >
          <MenuItem value={0} disabled sx={{ fontFamily: dt.font, color: dt.textMuted }}>
            Select country…
          </MenuItem>
          {countries.map((c) => (
            <MenuItem key={c.id} value={c.id} sx={{ fontFamily: dt.font, fontSize: 14 }}>
              {c.country_name} {c.country_code && <span style={{ color: dt.textMuted, fontSize: 12 }}>({c.country_code})</span>}
            </MenuItem>
          ))}
        </StyledSelect>

        <StyledSelect
          label="State / Province *"
          value={data.state_id || 0}
          error={data.state_id === 0 && data.country_id !== 0}
          onChange={(e) => set("state_id", e.target.value as number)}
          disabled={statesLoading || !data.country_id}
          helperText={statesLoading ? "Loading states…" : ""}
        >
          <MenuItem value={0} disabled sx={{ fontFamily: dt.font, color: dt.textMuted }}>
            {statesLoading ? "Loading…" : "Select state…"}
          </MenuItem>
          {states.map((s) => (
            <MenuItem key={s.id} value={s.id} sx={{ fontFamily: dt.font, fontSize: 14 }}>
              {s.state_name} {s.state_code && <span style={{ color: dt.textMuted, fontSize: 12 }}>({s.state_code})</span>}
            </MenuItem>
          ))}
        </StyledSelect>
      </FieldRow>

      {/* Address preview */}
      {(data.address_line1 || selectedCity(data)) && (
        <Box
          sx={{
            p: 2,
            borderRadius: dt.radiusSm,
            bgcolor: dt.cream,
            border: `1px dashed ${dt.border}`,
            fontFamily: dt.font,
            fontSize: 13,
            color: dt.textSecondary,
            lineHeight: 1.8,
          }}
        >
          <Box sx={{ fontWeight: 700, fontSize: 11, color: dt.textMuted, letterSpacing: "0.06em", mb: 0.5 }}>
            ADDRESS PREVIEW
          </Box>
          {[
            data.address_line1,
            data.address_line2,
            [data.city, selectedState?.state_name].filter(Boolean).join(", "),
            [selectedCountry?.country_name, data.pincode].filter(Boolean).join(" – "),
          ]
            .filter(Boolean)
            .map((line, i) => (
              <Box key={i}>{line}</Box>
            ))}
        </Box>
      )}
    </Box>
  );
}

function selectedCity(data: UpsertCompanyAddressInput) {
  return data.city || data.pincode;
}