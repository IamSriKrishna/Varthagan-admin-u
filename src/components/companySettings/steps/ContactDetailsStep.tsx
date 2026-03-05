"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
} from "@mui/material";
import { UpsertCompanyContactInput } from "@/lib/api/companyApi";

interface ContactDetailsStepProps {
  data: UpsertCompanyContactInput;
  onChange: (data: UpsertCompanyContactInput) => void;
}

export default function ContactDetailsStep({
  data,
  onChange,
}: ContactDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    // Validate mobile
    if (field === "mobile") {
      if (value && !/^\d+$/.test(value)) {
        newErrors.mobile = "Mobile number can only contain digits";
      } else if (value && (value.length < 10 || value.length > 15)) {
        newErrors.mobile = "Mobile number should be 10-15 digits";
      } else {
        delete newErrors.mobile;
      }
    }

    // Validate alternate mobile
    if (field === "alternate_mobile") {
      if (value && !/^\d+$/.test(value)) {
        newErrors.alternate_mobile = "Mobile number can only contain digits";
      } else if (value && (value.length < 10 || value.length > 15)) {
        newErrors.alternate_mobile = "Mobile number should be 10-15 digits";
      } else {
        delete newErrors.alternate_mobile;
      }
    }

    // Validate email
    if (field === "email") {
      if (value && value.length > 255) {
        newErrors.email = "Email is too long (max 255 characters)";
      } else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Please enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    setErrors(newErrors);
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        label="Mobile Number"
        value={data.mobile}
        onChange={(e) => handleChange("mobile", e.target.value)}
        required
        fullWidth
        placeholder="10-15 digit mobile number"
        type="tel"
        error={!!errors.mobile}
        helperText={errors.mobile || "10-15 digit mobile number"}
      />

      <TextField
        label="Alternate Mobile Number"
        value={data.alternate_mobile}
        onChange={(e) => handleChange("alternate_mobile", e.target.value)}
        fullWidth
        placeholder="Alternate mobile number (optional)"
        type="tel"
        error={!!errors.alternate_mobile}
        helperText={errors.alternate_mobile || "Optional - 10-15 digit mobile number"}
      />

      <TextField
        label="Email Address"
        value={data.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        fullWidth
        placeholder="company@example.com"
        type="email"
        error={!!errors.email}
        helperText={errors.email || "Valid email address (max 255 characters)"}
      />
    </Box>
  );
}
