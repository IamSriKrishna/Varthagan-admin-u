"use client";

import React from "react";
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
  const handleChange = (field: string, value: string) => {
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
      />

      <TextField
        label="Alternate Mobile Number"
        value={data.alternate_mobile}
        onChange={(e) => handleChange("alternate_mobile", e.target.value)}
        fullWidth
        placeholder="Alternate mobile number (optional)"
        type="tel"
      />

      <TextField
        label="Email Address"
        value={data.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        fullWidth
        placeholder="company@example.com"
        type="email"
      />
    </Box>
  );
}
