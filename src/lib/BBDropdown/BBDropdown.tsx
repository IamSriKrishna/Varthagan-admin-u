"use client";

import React from "react";
import { useField, useFormikContext } from "formik";
import { SelectProps, SelectChangeEvent } from "@mui/material";
import BBDropdownBase from "./BBDropdownBase";

interface Option {
  label: string;
  value: string | number;
}

interface BBDropdownProps extends Omit<SelectProps, "variant" | "name"> {
  name: string;
  label: string;
  options: Option[];
  loading?: boolean;
  onValueChange?: (value: string | number) => void;
}

const BBDropdown: React.FC<BBDropdownProps> = ({ name, label, options, loading = false, onValueChange, ...props }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const isError = Boolean(meta.touched && meta.error);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string | number;

    setFieldValue(name, value);
    onValueChange?.(value);
  };

  return (
    <BBDropdownBase
      name={name}
      label={label}
      value={field.value}
      options={options}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
      onDropdownChange={handleChange}
      loading={loading}
      {...props}
    />
  );
};

export default BBDropdown;
