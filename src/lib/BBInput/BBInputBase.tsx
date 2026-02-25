"use client";

import { FormControl, FormHelperText, FormLabel, OutlinedInput, OutlinedInputProps } from "@mui/material";
import React from "react";

interface BBInputProps extends Omit<OutlinedInputProps, "variant"> {
  name: string;
  value?: string | number;
  label: string;
  rows?: number;
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>, name: string, value: unknown) => void;
}

const BBInputBase: React.FC<BBInputProps> = ({
  label,
  loading = false,
  type,
  onInputChange,
  isError,
  errorMessage,
  rows,
  ...props
}) => {
  if (!props.name) {
    throw new Error("BBInput: `name` prop is required.");
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (type === "number") {
      value = value.replace(/[^\d.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
    }

    onInputChange?.(e, props.name, value);
  };

  return (
    <FormControl fullWidth size="small" error={isError} disabled={loading}>
      <FormLabel
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "160%",
          letterSpacing: "0.01em",
          color: "#0C1421",
          verticalAlign: "middle",
        }}
      >
        {label}
      </FormLabel>
      <OutlinedInput
        error={isError}
        value={props.value ?? ""}
        type={type}
        onChange={handleChange}
        startAdornment={props.startAdornment}
        multiline={!!rows}
        rows={rows}
        sx={{
          borderRadius: "8px",
          "& input::placeholder": {
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "160%",
            letterSpacing: "0.01em",
            verticalAlign: "middle",
            color: "#8897AD",
            opacity: 1,
          },
        }}
        {...props}
      />
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default BBInputBase;
