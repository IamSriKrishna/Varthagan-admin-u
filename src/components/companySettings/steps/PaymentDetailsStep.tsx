"use client";

import React, { useEffect, useState } from "react";
import { Box, MenuItem, Alert } from "@mui/material";
import { CreateBankDetailInput, UpsertUPIDetailInput, companyApi, Bank } from "@/lib/api/companyApi";
import { StyledField, StyledSelect, StyledCheckbox, SectionCard, FieldRow, LoadingPane } from "./shared";
import { dt } from "../designTokens";

interface PaymentDetailsStepProps {
  bankData: CreateBankDetailInput | undefined;
  upiData:  UpsertUPIDetailInput  | undefined;
  onBankChange: (data: CreateBankDetailInput) => void;
  onUPIChange:  (data: UpsertUPIDetailInput)  => void;
}

const EMPTY_BANK: CreateBankDetailInput = { bank_id: 0, account_holder_name: "", account_number: "", is_primary: true };
const EMPTY_UPI:  UpsertUPIDetailInput  = { upi_id: "", upi_qr_url: "" };

export default function PaymentDetailsStep({ bankData, upiData, onBankChange, onUPIChange }: PaymentDetailsStepProps) {
  const [banks, setBanks]   = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const bank = bankData ?? EMPTY_BANK;
  const upi  = upiData  ?? EMPTY_UPI;

  useEffect(() => {
    companyApi.getBanks()
      .then(setBanks)
      .catch(() => setError("Failed to load bank list"))
      .finally(() => setLoading(false));
  }, []);

  const setBank = (field: string, value: any) => onBankChange({ ...bank, [field]: value });
  const setUpi  = (field: string, value: string)  => onUPIChange ({ ...upi,  [field]: value });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: dt.radiusSm, fontFamily: dt.font }}>{error}</Alert>}

      {/* Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: dt.radiusSm,
          bgcolor: `${dt.gold}10`,
          border: `1px solid ${dt.gold}30`,
          fontFamily: dt.font,
          fontSize: 13,
          color: dt.textSecondary,
        }}
      >
        <span style={{ fontSize: 20 }}>💡</span>
        Payment details are optional and can be updated anytime from company settings.
      </Box>

      {/* ── Bank Section ── */}
      <SectionCard title="Bank Account" subtitle="Your primary business account" icon="🏦" optional>
        {loading ? (
          <LoadingPane />
        ) : (
          <>
            <StyledSelect
              label="Select Bank"
              value={bank.bank_id || 0}
              onChange={(e) => setBank("bank_id", e.target.value as number)}
            >
              <MenuItem value={0} disabled sx={{ fontFamily: dt.font, color: dt.textMuted }}>
                Choose your bank…
              </MenuItem>
              {banks.map((b) => (
                <MenuItem key={b.id} value={b.id} sx={{ fontFamily: dt.font, fontSize: 14 }}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ fontWeight: 600 }}>{b.bank_name}</Box>
                    <Box sx={{ fontSize: 11, color: dt.textMuted }}>{b.city}, {b.state}</Box>
                  </Box>
                </MenuItem>
              ))}
            </StyledSelect>

            <StyledField
              label="Account Holder Name"
              value={bank.account_holder_name}
              onChange={(e) => setBank("account_holder_name", e.target.value)}
              placeholder="Exactly as printed on passbook"
            />

            <FieldRow>
              <StyledField
                label="Account Number"
                value={bank.account_number}
                onChange={(e) => setBank("account_number", e.target.value.replace(/\D/g, ""))}
                placeholder="Numeric account number"
                inputProps={{ inputMode: "numeric", style: { letterSpacing: "0.08em", fontFamily: "monospace" } }}
              />
              <StyledField
                label="IFSC Code"
                value={(bank as any).ifsc_code ?? ""}
                onChange={(e) => setBank("ifsc_code", e.target.value.toUpperCase().slice(0, 11))}
                placeholder="e.g. SBIN0001234"
                inputProps={{ maxLength: 11, style: { letterSpacing: "0.06em", fontFamily: "monospace" } }}
                helperText="11-character code on cheque"
              />
            </FieldRow>

            <StyledField
              label="Branch Name"
              value={(bank as any).branch_name ?? ""}
              onChange={(e) => setBank("branch_name", e.target.value)}
              placeholder="e.g., Koramangala Branch (optional)"
            />

            <StyledCheckbox
              checked={bank.is_primary}
              onChange={(v) => setBank("is_primary", v)}
              label="Set as Primary Account"
              description="This account will appear first on invoices and reports"
            />
          </>
        )}
      </SectionCard>

      {/* ── UPI Section ── */}
      <SectionCard title="UPI Payment" subtitle="For digital payment collection" icon="📲" optional>
        <StyledField
          label="UPI ID"
          value={upi.upi_id}
          onChange={(e) => setUpi("upi_id", e.target.value)}
          placeholder="business@upi  /  yourname@paytm"
          helperText="Customers will use this to pay you directly"
        />
        <StyledField
          label="QR Code Image URL"
          value={upi.upi_qr_url ?? ""}
          onChange={(e) => setUpi("upi_qr_url", e.target.value)}
          placeholder="https://… (link to your UPI QR image)"
          helperText="Printed on invoices when provided"
          multiline
          rows={2}
        />

        {/* UPI preview badge */}
        {upi.upi_id && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: `${dt.success}12`,
              border: `1px solid ${dt.success}30`,
              borderRadius: 99,
              px: 2,
              py: 0.8,
              fontFamily: dt.font,
              fontSize: 13,
              fontWeight: 600,
              color: dt.success,
            }}
          >
            ✓ &nbsp;{upi.upi_id}
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}