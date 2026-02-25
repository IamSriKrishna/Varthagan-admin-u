"use client";
import { FormControl, FormLabel, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";

interface BBTimePickerBaseProps {
  name: string;
  label: string;
  value?: Dayjs | null;
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onTimeChange?: (name: string, value: Dayjs | null) => void;
  disableFuture?: boolean;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  format?: string;
}

const BBTimePickerBase: React.FC<BBTimePickerBaseProps> = ({
  label,
  name,
  value,
  loading = false,
  isError,
  errorMessage,
  onTimeChange,
  disableFuture,
  minTime,
  maxTime,
  format = "HH:mm",
}) => {
  if (!name) {
    throw new Error("BBTimePicker: `name` prop is required.");
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
      <TimePicker
        value={value}
        onChange={(newValue) => onTimeChange?.(name, newValue)}
        format={format}
        slotProps={{
          textField: {
            size: "small",
            error: isError,
            helperText: isError ? errorMessage : undefined,
            InputProps: {
              sx: { borderRadius: "12px", backgroundColor: "white" },
            },
          } as Partial<React.ComponentProps<typeof TextField>>,
        }}
        minTime={minTime || undefined}
        maxTime={maxTime || undefined}
        disableFuture={disableFuture}
      />
    </FormControl>
  );
};

export default BBTimePickerBase;
