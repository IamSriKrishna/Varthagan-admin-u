"use client";

import React, { useEffect, useState } from "react";
import { Box, MenuItem } from "@mui/material";
import {
  UpsertInvoiceSettingsInput,
  UpsertTaxSettingsInput,
  UpsertRegionalSettingsInput,
  companyApi,
  TaxType,
} from "@/lib/api/companyApi";
import { StyledField, StyledSelect, StyledCheckbox, SectionCard, FieldRow, LoadingPane } from "./shared";
import { dt } from "../designTokens";

const TIMEZONES = ["Asia/Kolkata","Asia/Bangkok","Asia/Singapore","Asia/Dubai","Asia/Hong_Kong","America/New_York","Europe/London","Europe/Paris","Australia/Sydney"];
const DATE_FORMATS = ["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"];
const TIME_FORMATS = [{ value: "24h", label: "24-hour (14:30)" },{ value: "12h", label: "12-hour (2:30 PM)" }];
const CURRENCIES = [{ code: "INR", symbol: "₹", name: "Indian Rupee" },{ code: "USD", symbol: "$", name: "US Dollar" },{ code: "EUR", symbol: "€", name: "Euro" },{ code: "GBP", symbol: "£", name: "British Pound" }];

interface SettingsStepProps {
  invoiceData:      UpsertInvoiceSettingsInput  | undefined;
  taxData:          UpsertTaxSettingsInput       | undefined;
  regionalData:     UpsertRegionalSettingsInput  | undefined;
  onInvoiceChange:  (d: UpsertInvoiceSettingsInput)  => void;
  onTaxChange:      (d: UpsertTaxSettingsInput)       => void;
  onRegionalChange: (d: UpsertRegionalSettingsInput)  => void;
}

export default function SettingsStep({ invoiceData, taxData, regionalData, onInvoiceChange, onTaxChange, onRegionalChange }: SettingsStepProps) {
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading]   = useState(true);

  const inv = invoiceData ?? { invoice_prefix: "INV", invoice_start_number: 1, show_logo: true, show_signature: false, round_off_total: true };
  const tax = taxData     ?? { gst_enabled: true, tax_type_id: 0 };
  const reg = regionalData ?? { timezone: "Asia/Kolkata", date_format: "DD/MM/YYYY", time_format: "24h", currency_code: "INR", currency_symbol: "₹", language_code: "en" };

  useEffect(() => {
    companyApi.getTaxTypes()
      .then(setTaxTypes)
      .finally(() => setLoading(false));
  }, []);

  const setInv = (f: string, v: any) => onInvoiceChange({ ...inv, [f]: v });
  const setTax = (f: string, v: any) => onTaxChange({ ...tax, [f]: v });
  const setReg = (f: string, v: any) => onRegionalChange({ ...reg, [f]: v });

  if (loading) return <LoadingPane />;

  /* Invoice number preview */
  const sampleInvoice = `${inv.invoice_prefix || "INV"}-${String(inv.invoice_start_number || 1).padStart(4, "0")}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Invoice Settings ── */}
      <SectionCard title="Invoice Settings" icon="🧾" subtitle="Customize how your invoices look">

        <FieldRow>
          <StyledField
            label="Invoice Prefix"
            value={inv.invoice_prefix}
            onChange={(e) => setInv("invoice_prefix", e.target.value.toUpperCase().slice(0, 10))}
            placeholder="INV"
            inputProps={{ maxLength: 10, style: { letterSpacing: "0.04em", fontFamily: "monospace", textTransform: "uppercase" } }}
            helperText={`${(inv.invoice_prefix || "").length}/10 characters`}
          />
          <StyledField
            label="Starting Invoice Number"
            type="number"
            value={inv.invoice_start_number}
            onChange={(e) => setInv("invoice_start_number", Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            helperText="Your first invoice will use this number"
          />
        </FieldRow>

        {/* Live preview */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: dt.radiusSm,
            bgcolor: dt.cream,
            border: `1px dashed ${dt.border}`,
          }}
        >
          <span style={{ fontSize: 18 }}>👁️</span>
          <Box sx={{ fontFamily: dt.font, fontSize: 13, color: dt.textSecondary }}>
            Your first invoice will be numbered:{" "}
            <Box
              component="span"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 15,
                color: dt.navy,
                bgcolor: `${dt.navy}10`,
                px: 1.5,
                py: 0.3,
                borderRadius: 4,
                ml: 0.5,
              }}
            >
              {sampleInvoice}
            </Box>
          </Box>
        </Box>

        {/* Toggles */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <StyledCheckbox checked={inv.show_logo}       onChange={(v) => setInv("show_logo", v)}       label="Show Company Logo"    description="Your logo will appear at the top of each invoice" />
          <StyledCheckbox checked={inv.show_signature}  onChange={(v) => setInv("show_signature", v)}  label="Show Signature"       description="Include an authorized signature section" />
          <StyledCheckbox checked={inv.round_off_total} onChange={(v) => setInv("round_off_total", v)} label="Round Off Totals"     description="Round invoice totals to the nearest rupee" />
        </Box>
      </SectionCard>

      {/* ── Tax Settings ── */}
      <SectionCard title="Tax Configuration" icon="📊" subtitle="GST and tax type settings">
        <StyledCheckbox
          checked={tax.gst_enabled}
          onChange={(v) => setTax("gst_enabled", v)}
          label="Enable GST"
          description="Apply Goods and Services Tax on invoices (recommended for GST-registered businesses)"
        />

        <StyledSelect
          label="Tax Type *"
          value={tax.tax_type_id}
          error={tax.tax_type_id === 0}
          onChange={(e) => setTax("tax_type_id", e.target.value)}
          helperText={tax.tax_type_id === 0 ? "Please select a tax type to proceed" : ""}
        >
          <MenuItem value={0} sx={{ fontFamily: dt.font, color: dt.textMuted }}>
            Select tax type…
          </MenuItem>
          {taxTypes.map((t) => (
            <MenuItem key={t.id} value={t.id} sx={{ fontFamily: dt.font, fontSize: 14 }}>
              <Box>
                <Box sx={{ fontWeight: 600 }}>{t.tax_name}</Box>
                <Box sx={{ fontSize: 11, color: dt.textMuted }}>Code: {t.tax_code}{t.description && ` — ${t.description}`}</Box>
              </Box>
            </MenuItem>
          ))}
        </StyledSelect>
      </SectionCard>

      {/* ── Regional Settings ── */}
      <SectionCard title="Regional Preferences" icon="🌏" subtitle="Localisation and display formats">
        <FieldRow>
          <StyledSelect
            label="Timezone"
            value={reg.timezone}
            onChange={(e) => setReg("timezone", e.target.value as string)}
          >
            {TIMEZONES.map((tz) => (
              <MenuItem key={tz} value={tz} sx={{ fontFamily: dt.font, fontSize: 14 }}>{tz}</MenuItem>
            ))}
          </StyledSelect>

          <StyledSelect
            label="Currency"
            value={reg.currency_code}
            onChange={(e) => {
              const c = CURRENCIES.find((x) => x.code === e.target.value);
              if (c) { setReg("currency_code", c.code); setReg("currency_symbol", c.symbol); }
            }}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c.code} value={c.code} sx={{ fontFamily: dt.font, fontSize: 14 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ fontWeight: 700, fontSize: 16, color: dt.gold, width: 20 }}>{c.symbol}</Box>
                  <Box>
                    <Box sx={{ fontWeight: 600 }}>{c.code}</Box>
                    <Box sx={{ fontSize: 11, color: dt.textMuted }}>{c.name}</Box>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </StyledSelect>
        </FieldRow>

        <FieldRow>
          <StyledSelect
            label="Date Format"
            value={reg.date_format}
            onChange={(e) => setReg("date_format", e.target.value as string)}
          >
            {DATE_FORMATS.map((f) => (
              <MenuItem key={f} value={f} sx={{ fontFamily: "monospace", fontSize: 14 }}>{f}</MenuItem>
            ))}
          </StyledSelect>

          <StyledSelect
            label="Time Format"
            value={reg.time_format}
            onChange={(e) => setReg("time_format", e.target.value as string)}
          >
            {TIME_FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontFamily: dt.font, fontSize: 14 }}>{f.label}</MenuItem>
            ))}
          </StyledSelect>
        </FieldRow>

        <StyledField
          label="Language Code"
          value={reg.language_code}
          onChange={(e) => setReg("language_code", e.target.value.toLowerCase().slice(0, 5))}
          placeholder="en"
          helperText="ISO 639-1 code (e.g., en, hi, ta, fr)"
          inputProps={{ maxLength: 5, style: { letterSpacing: "0.06em", fontFamily: "monospace" } }}
        />
      </SectionCard>
    </Box>
  );
}