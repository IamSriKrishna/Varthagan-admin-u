"use client";

import { Autocomplete, FormControl, FormHelperText, FormLabel, OutlinedInput } from "@mui/material";
import type { AutocompleteProps } from "@mui/material";
import React from "react";
import { bbDropdownLabelSx, bbDropdownSelectSx, inputSx, paperSx } from "./BBAutoComplete.styles";

export interface Option {
  label: string;
  value: string | number;
}

interface BBAutoCompleteProps {
  name: string;
  label?: string;
  value?: string | number | null;
  options: Option[];
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  disableClearable?: boolean;
  freeSolo?: boolean;
  onChange: (name: string, value: string | number | null) => void;
  onSearch?: (value: string) => void;
}

type ExtraAutocompleteProps = Omit<
  AutocompleteProps<string | Option, false, boolean, boolean>,
  "onChange" | "value" | "options" | "disableClearable"
>;

const BBAutoCompleteBase: React.FC<BBAutoCompleteProps & Partial<ExtraAutocompleteProps>> = ({
  name,
  label,
  value = null,
  options,
  loading = false,
  isError = false,
  errorMessage,
  placeholder = "",
  disableClearable = false,
  freeSolo,
  onChange,
  onSearch,
  ...restProps
}) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const selected: Option | null = value === null ? null : (options.find((o) => o.value === value) ?? null);

  const handleChange = (_: React.SyntheticEvent, newValue: Option | string | null) => {
    if (newValue === null) {
      onChange(name, null);
      return;
    }

    if (typeof newValue === "string") {
      onChange(name, newValue);
    } else {
      onChange(name, newValue.value);
    }
  };

  return (
    <FormControl fullWidth size="small" error={isError}>
      {label && <FormLabel sx={bbDropdownLabelSx}>{label}</FormLabel>}
      <Autocomplete
        freeSolo={freeSolo}
        options={options}
        value={selected}
        loading={loading}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        isOptionEqualToValue={(option, val) => {
          if (!val) return false;
          const optionValue = typeof option === "string" ? option : option.value;
          const valValue = typeof val === "string" ? val : val.value;
          return optionValue === valValue;
        }}
        disableClearable={disableClearable}
        onChange={handleChange}
        onInputChange={(_, inputValue, reason) => {
          if (reason === "input") {
            onSearch?.(inputValue);
          }
        }}
        openOnFocus
        renderInput={(params) => (
          <OutlinedInput
            {...params.InputProps}
            inputProps={{
              ...params.inputProps,
              readOnly: isMobile,
            }}
            placeholder={placeholder}
            fullWidth
            sx={inputSx}
          />
        )}
        sx={{
          ...bbDropdownSelectSx,
          ...(restProps.disabled && {
            opacity: 0.6,
            cursor: "not-allowed",
            pointerEvents: "none",
            "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" },
            "& input": { cursor: "not-allowed" },
          }),
        }}
        slotProps={{
          paper: {
            sx: {
              ...paperSx,
              "& .MuiAutocomplete-listbox": { maxHeight: "300px" },
              "& .MuiAutocomplete-option": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: "max-content",
                padding: "8px 16px",
              },
            },
          },
        }}
        {...restProps}
      />
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default BBAutoCompleteBase;
