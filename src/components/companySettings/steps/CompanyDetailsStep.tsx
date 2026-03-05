"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CreateCompanyInput, companyApi, BusinessType } from "@/lib/api/companyApi";

interface CompanyDetailsStepProps {
  data: CreateCompanyInput;
  onChange: (data: CreateCompanyInput) => void;
}

export default function CompanyDetailsStep({
  data,
  onChange,
}: CompanyDetailsStepProps) {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const fetchBusinessTypes = async () => {
    try {
      setLoading(true);
      const types = await companyApi.getBusinessTypes();
      setBusinessTypes(types);
    } catch (err) {
      setError("Failed to load business types");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Company Name"
        value={data.company_name}
        onChange={(e) => handleChange("company_name", e.target.value)}
        required
        fullWidth
        placeholder="Enter your company name"
      />

      <FormControl fullWidth required error={data.business_type_id === 0}>
        <InputLabel id="business-type-label">Business Type *</InputLabel>
        <Select
          labelId="business-type-label"
          id="business-type-select"
          value={data.business_type_id || 0}
          label="Business Type *"
          onChange={(e) => handleChange("business_type_id", e.target.value as number)}
        >
          <MenuItem value={0} disabled>
            Select a business type
          </MenuItem>
          {businessTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.type_name}
              {type.description && ` - ${type.description}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="GST Number"
        value={data.gst_number}
        onChange={(e) => handleChange("gst_number", e.target.value.slice(0, 15))}
        placeholder="15-digit GST number (optional)"
        fullWidth
        helperText={
          data.gst_number && data.gst_number.length > 15
            ? "GST Number cannot exceed 15 characters"
            : "GST Number format: 15 characters (e.g., 29AABCT1332L1Z5)"
        }
        error={data.gst_number ? data.gst_number.length > 15 : false}
      />

      <TextField
        label="PAN Number"
        value={data.pan_number}
        onChange={(e) => handleChange("pan_number", e.target.value.slice(0, 10))}
        placeholder="10-digit PAN number (optional)"
        fullWidth
        helperText={
          data.pan_number && data.pan_number.length > 10
            ? "PAN Number cannot exceed 10 characters"
            : "PAN Number format: 10 characters (e.g., AABCT1332L)"
        }
        error={data.pan_number ? data.pan_number.length > 10 : false}
      />
    </Box>
  );
}
