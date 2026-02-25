"use client";

import {
  Autocomplete,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  createFilterOptions,
} from "@mui/material";
import React, { useState } from "react";
import { bbDropdownLabelSx, bbDropdownSelectSx } from "../BBDropdown/BBDropdown.styles";
import * as classes from "./BBMultiSelect.styles";

export interface Option {
  label: string;
  value: string | number;
}

interface BBMultiSelectBaseProps {
  name: string;
  label: string;
  value: (string | number)[];
  options: Option[];
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onChange: (name: string, value: (string | number)[]) => void;
  onCreate?: (label: string) => Promise<Option>;
}
type CreatableOption = Option | { inputValue: string; label: string };

const filter = createFilterOptions<CreatableOption>();

const BBMultiSelectBase: React.FC<BBMultiSelectBaseProps> = ({
  name,
  label,
  value = [],
  options,
  loading = false,
  isError = false,
  errorMessage,
  onChange,
  onCreate,
}) => {
  const [open, setOpen] = useState(false);

  const selectedValues: Option[] = value.map(
    (val) => options.find((opt) => opt.value === val) || { label: String(val), value: val },
  );
  type CreatableAutocompleteOption = Option | { inputValue: string } | string;

  const handleChange = async (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: (Option | string | { inputValue: string })[],
  ) => {
    const finalOptions: Option[] = [];

    for (const val of newValue) {
      if (typeof val === "string") {
        finalOptions.push({ label: val, value: val });
      } else if ("inputValue" in val && onCreate) {
        try {
          const created = await onCreate(val.inputValue);
          if (created && created.value !== undefined && created.value !== null) {
            finalOptions.push(created);
          } else {
            console.warn("Tag creation returned null or invalid:", val.inputValue);
          }
        } catch (err) {
          console.error("Error while creating tag:", err);
        }
      } else if (val && "value" in val && val.value !== undefined && val.value !== null) {
        finalOptions.push(val as Option);
      }
    }
    const finalValues = finalOptions
      .filter((item): item is Option => !!item && item.value !== undefined && item.value !== null)
      .map((item) => item.value);
    onChange(name, finalValues);
    if (finalOptions.length === options.length) setOpen(false);
  };

  return (
    <FormControl fullWidth size="small" error={isError}>
      <FormLabel sx={bbDropdownLabelSx}>{label}</FormLabel>
      <Autocomplete
        multiple
        // freeSolo
        disableCloseOnSelect
        options={options}
        value={selectedValues}
        loading={loading}
        filterOptions={(opts, params) => {
          const filtered = filter(opts as CreatableOption[], params);

          const isExisting = opts.some(
            (opt) =>
              typeof opt !== "string" && "label" in opt && opt.label.toLowerCase() === params.inputValue.toLowerCase(),
          );

          if (params.inputValue !== "" && !isExisting && onCreate) {
            filtered.push({
              inputValue: params.inputValue,
              label: `+ Add "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        getOptionLabel={(option: CreatableAutocompleteOption) => {
          if (typeof option === "string") return option;
          if ("label" in option) return option.label;
          if ("inputValue" in option) return option.inputValue;
          return "";
        }}
        isOptionEqualToValue={(option, selected) => {
          if (typeof option === "string" || typeof selected === "string") {
            return option === selected;
          }
          if ("value" in option && "value" in selected) {
            return option.value === selected.value;
          }
          return false;
        }}
        onChange={handleChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={bbDropdownSelectSx}
        renderTags={(selected: (string | Option | { inputValue: string })[], getTagProps) =>
          selected.map((option, index) => {
            const { key, ...rest } = getTagProps({ index });
            const selectedlabel =
              typeof option === "string" ? option : "inputValue" in option ? option.inputValue : option.label;
            return <Chip key={key} label={selectedlabel} {...rest} size="small" sx={classes.tagChip} />;
          })
        }
        renderInput={(params) => (
          <OutlinedInput
            {...params.InputProps}
            inputProps={{
              ...params.inputProps,
            }}
            placeholder={`Select ${label}`}
            fullWidth
            sx={classes.inputSx}
          />
        )}
        componentsProps={{
          paper: {
            sx: classes.paperSx,
          },
        }}
      />
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default BBMultiSelectBase;
