"use client";

import React from "react";
import { OutlinedInputProps } from "@mui/material";
import { useField, useFormikContext } from "formik";
import BBInputBase from "./BBInputBase";

interface BBInputProps extends Omit<OutlinedInputProps, "variant"> {
  name: string;
  label: string;
  loading?: boolean;
  rows?: number;
  isError?: boolean;
  errorMessage?: string;
  required?: boolean;
}

const BBInput: React.FC<BBInputProps> = ({ label, loading = false, type, rows, ...props }) => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext();
  const isError = Boolean(meta.touched && meta.error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string, value: unknown) => {
    setFieldValue(name, value);
  };

  return (
    <BBInputBase
      {...field}
      value={field.value}
      label={label}
      disabled={loading}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
      type={type}
      multiline={Boolean(rows)}
      rows={rows}
      onInputChange={handleChange}
      required={props.required}
      {...props}
    />
  );
};

export default BBInput;
