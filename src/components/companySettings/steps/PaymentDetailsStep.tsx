"use client";

import React from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import {
  CreateBankDetailInput,
  UpsertUPIDetailInput,
} from "@/lib/api/companyApi";

interface PaymentDetailsStepProps {
  bankData: CreateBankDetailInput | undefined;
  upiData: UpsertUPIDetailInput | undefined;
  onBankChange: (data: CreateBankDetailInput) => void;
  onUPIChange: (data: UpsertUPIDetailInput) => void;
}

export default function PaymentDetailsStep({
  bankData,
  upiData,
  onBankChange,
  onUPIChange,
}: PaymentDetailsStepProps) {
  const bank = bankData || {
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    is_primary: true,
  };

  const upi = upiData || {
    upi_id: "",
    upi_qr_url: "",
  };

  const handleBankChange = (field: string, value: any) => {
    onBankChange({
      ...bank,
      [field]: value,
    });
  };

  const handleUPIChange = (field: string, value: string) => {
    onUPIChange({
      ...upi,
      [field]: value,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Bank Details Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Bank Account Details (Optional)
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Bank Name"
            value={bank.bank_name}
            onChange={(e) => handleBankChange("bank_name", e.target.value)}
            fullWidth
            placeholder="e.g., State Bank of India"
          />

          <TextField
            label="Account Holder Name"
            value={bank.account_holder_name}
            onChange={(e) =>
              handleBankChange("account_holder_name", e.target.value)
            }
            fullWidth
            placeholder="Name as per bank account"
          />

          <TextField
            label="Account Number"
            value={bank.account_number}
            onChange={(e) => handleBankChange("account_number", e.target.value)}
            fullWidth
            placeholder="Bank account number"
          />

          <TextField
            label="IFSC Code"
            value={bank.ifsc_code}
            onChange={(e) => handleBankChange("ifsc_code", e.target.value)}
            fullWidth
            placeholder="11-character IFSC code"
          />

          <TextField
            label="Branch Name"
            value={bank.branch_name}
            onChange={(e) => handleBankChange("branch_name", e.target.value)}
            fullWidth
            placeholder="Bank branch name (optional)"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={bank.is_primary}
                onChange={(e) =>
                  handleBankChange("is_primary", e.target.checked)
                }
              />
            }
            label="Set as Primary Bank Account"
          />
        </Box>
      </Paper>

      {/* UPI Details Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          UPI Payment Details (Optional)
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="UPI ID"
            value={upi.upi_id}
            onChange={(e) => handleUPIChange("upi_id", e.target.value)}
            fullWidth
            placeholder="e.g., business@upi"
          />

          <TextField
            label="UPI QR Code URL"
            value={upi.upi_qr_url}
            onChange={(e) => handleUPIChange("upi_qr_url", e.target.value)}
            fullWidth
            placeholder="Link to QR code image (optional)"
            multiline
            rows={2}
          />
        </Box>
      </Paper>

      <Typography variant="caption" color="textSecondary">
        Note: Payment details can be added or modified later in settings.
      </Typography>
    </Box>
  );
}
