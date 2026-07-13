"use client";

import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SelectProps,
} from "@mui/material";
import React, { ReactNode } from "react";
import { bbDropdownLabelSx, bbDropdownSelectSx } from "./BBDropdown.styles";

interface Option {
  // label: string;
  label: ReactNode | string;
  value: string | number;
}

interface BBDropdownBaseProps extends Omit<SelectProps, "variant" | "name"> {
  name: string;
  label: string;
  value?: string | number;
  options: Option[];
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  required?: boolean;
  onDropdownChange?: (event: SelectChangeEvent<unknown>, name: string, value: unknown) => void;
}

const BBDropdownBase: React.FC<BBDropdownBaseProps> = ({
  name,
  label,
  options,
  loading = false,
  isError,
  errorMessage,
  value,
  onDropdownChange,
  sx,
  required,
  onBlur,
  ...props
}) => {
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onDropdownChange?.(event, name, event.target.value);
  };

  return (
    <FormControl fullWidth size="small" error={isError} disabled={loading} sx={sx}>
      <FormLabel required={required} sx={bbDropdownLabelSx}>{label}</FormLabel>
      <Select
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={onBlur}
        displayEmpty
        sx={bbDropdownSelectSx}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "8px",
            },
          },
        }}
        {...props}
      >
        <MenuItem value="" disabled>
          Select {label}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default BBDropdownBase;
