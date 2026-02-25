"use client";

import { FormControl, FormHelperText, FormLabel, Stack, Switch, SwitchProps } from "@mui/material";
import React from "react";

interface BBSwitchBaseProps extends Omit<SwitchProps, "onChange"> {
  name: string;
  label: string;
  value?: boolean;
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onToggleChange?: (e: React.ChangeEvent<HTMLInputElement>, name: string, value: boolean) => void;
}

const BBSwitchBase: React.FC<BBSwitchBaseProps> = ({
  name,
  label,
  value = false,
  loading = false,
  isError,
  errorMessage,
  onToggleChange,
  disabled,
  ...props
}) => {
  if (!name) throw new Error("BBSwitchBase: `name` prop is required.");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    onToggleChange?.(e, name, newValue);
  };

  return (
    <FormControl fullWidth size="small" error={isError} disabled={loading || disabled}>
      <FormLabel
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "160%",
          color: "#0C1421",
          mb: 1,
        }}
      >
        {label}
      </FormLabel>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Switch checked={value} onChange={handleChange} {...props} />
      </Stack>
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default BBSwitchBase;
