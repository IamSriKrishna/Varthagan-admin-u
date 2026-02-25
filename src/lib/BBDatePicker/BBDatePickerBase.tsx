"use client";
import { FormControl, FormLabel, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";

interface BBDatePickerBaseProps {
  name: string;
  label: string;
  value?: Dayjs | null;
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onDateChange?: (name: string, value: Dayjs | null) => void;
  disableFuture?: boolean;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  format?: string;
}

const BBDatePickerBase: React.FC<BBDatePickerBaseProps> = ({
  label,
  name,
  value,
  loading = false,
  isError,
  errorMessage,
  onDateChange,
  disableFuture,
  minDate,
  maxDate,
  format,
}) => {
  if (!name) {
    throw new Error("BBDatePicker: `name` prop is required.");
  }

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
        }}
      >
        {label}
      </FormLabel>
      <DatePicker
        value={value}
        format={format}
        onChange={(newValue) => onDateChange?.(name, newValue)}
        slotProps={{
          textField: {
            size: "small",
            error: isError,
            helperText: isError ? errorMessage : undefined,
            InputProps: {
              sx: { borderRadius: "8px", backgroundColor: "white" },
            },
          } as Partial<React.ComponentProps<typeof TextField>>,
        }}
        disableFuture={disableFuture}
        minDate={minDate || undefined}
        maxDate={maxDate || undefined}
      />
    </FormControl>
  );
};

export default BBDatePickerBase;
