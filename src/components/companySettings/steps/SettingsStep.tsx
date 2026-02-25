"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  UpsertInvoiceSettingsInput,
  UpsertTaxSettingsInput,
  UpsertRegionalSettingsInput,
  companyApi,
  TaxType,
} from "@/lib/api/companyApi";

interface SettingsStepProps {
  invoiceData: UpsertInvoiceSettingsInput | undefined;
  taxData: UpsertTaxSettingsInput | undefined;
  regionalData: UpsertRegionalSettingsInput | undefined;
  onInvoiceChange: (data: UpsertInvoiceSettingsInput) => void;
  onTaxChange: (data: UpsertTaxSettingsInput) => void;
  onRegionalChange: (data: UpsertRegionalSettingsInput) => void;
}

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["24h", "12h"];
const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

export default function SettingsStep({
  invoiceData,
  taxData,
  regionalData,
  onInvoiceChange,
  onTaxChange,
  onRegionalChange,
}: SettingsStepProps) {
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invoice = invoiceData || {
    invoice_prefix: "INV",
    invoice_start_number: 1,
    show_logo: true,
    show_signature: false,
    round_off_total: true,
  };

  const tax = taxData || {
    gst_enabled: true,
    tax_type_id: 0,
  };

  const regional = regionalData || {
    timezone: "Asia/Kolkata",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    currency_code: "INR",
    currency_symbol: "₹",
    language_code: "en",
  };

  useEffect(() => {
    fetchTaxTypes();
  }, []);

  const fetchTaxTypes = async () => {
    try {
      setLoading(true);
      const types = await companyApi.getTaxTypes();
      setTaxTypes(types);
    } catch (err) {
      setError("Failed to load tax types");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = (field: string, value: any) => {
    onInvoiceChange({
      ...invoice,
      [field]: value,
    });
  };

  const handleTaxChange = (field: string, value: any) => {
    onTaxChange({
      ...tax,
      [field]: value,
    });
  };

  const handleRegionalChange = (field: string, value: any) => {
    onRegionalChange({
      ...regional,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Invoice Settings */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Invoice Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Invoice Prefix"
            value={invoice.invoice_prefix}
            onChange={(e) => handleInvoiceChange("invoice_prefix", e.target.value)}
            fullWidth
            placeholder="e.g., INV"
            helperText="Prefix for invoice numbers (max 10 characters)"
          />

          <TextField
            label="Invoice Start Number"
            type="number"
            value={invoice.invoice_start_number}
            onChange={(e) =>
              handleInvoiceChange("invoice_start_number", parseInt(e.target.value))
            }
            fullWidth
            inputProps={{ min: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={invoice.show_logo}
                onChange={(e) => handleInvoiceChange("show_logo", e.target.checked)}
              />
            }
            label="Show Company Logo on Invoice"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={invoice.show_signature}
                onChange={(e) =>
                  handleInvoiceChange("show_signature", e.target.checked)
                }
              />
            }
            label="Show Signature on Invoice"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={invoice.round_off_total}
                onChange={(e) =>
                  handleInvoiceChange("round_off_total", e.target.checked)
                }
              />
            }
            label="Round Off Invoice Total"
          />
        </Box>
      </Paper>

      {/* Tax Settings */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tax Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={tax.gst_enabled}
                onChange={(e) => handleTaxChange("gst_enabled", e.target.checked)}
              />
            }
            label="Enable GST"
          />

          <FormControl fullWidth required error={tax.tax_type_id === 0}>
            <InputLabel>Tax Type *</InputLabel>
            <Select
              value={tax.tax_type_id}
              label="Tax Type *"
              onChange={(e) => handleTaxChange("tax_type_id", e.target.value)}
            >
              <MenuItem value={0}>Select Tax Type</MenuItem>
              {taxTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.tax_name} ({type.tax_code})
                </MenuItem>
              ))}
            </Select>
            {tax.tax_type_id === 0 && (
              <Typography variant="caption" sx={{ color: "error.main", mt: 1 }}>
                Please select a tax type to proceed
              </Typography>
            )}
          </FormControl>
        </Box>
      </Paper>

      {/* Regional Settings */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Regional Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={regional.timezone}
              label="Timezone"
              onChange={(e) => handleRegionalChange("timezone", e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              value={regional.date_format}
              label="Date Format"
              onChange={(e) => handleRegionalChange("date_format", e.target.value)}
            >
              {DATE_FORMATS.map((format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Time Format</InputLabel>
            <Select
              value={regional.time_format}
              label="Time Format"
              onChange={(e) => handleRegionalChange("time_format", e.target.value)}
            >
              {TIME_FORMATS.map((format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={regional.currency_code}
              label="Currency"
              onChange={(e) => {
                const selected = CURRENCIES.find((c) => c.code === e.target.value);
                if (selected) {
                  handleRegionalChange("currency_code", selected.code);
                  handleRegionalChange("currency_symbol", selected.symbol);
                }
              }}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Language Code"
            value={regional.language_code}
            onChange={(e) => handleRegionalChange("language_code", e.target.value)}
            fullWidth
            placeholder="en, hi, fr, etc."
            helperText="ISO 639-1 language code"
          />
        </Box>
      </Paper>
    </Box>
  );
}
