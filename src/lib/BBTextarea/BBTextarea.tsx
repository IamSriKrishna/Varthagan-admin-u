"use client";

import { OutlinedInputProps } from "@mui/material";
import { useField, useFormikContext } from "formik";
import React from "react";
import BBInputBase from "../BBInput/BBInputBase";

interface BBTextareaProps extends Omit<OutlinedInputProps, "variant"> {
  name: string;
  label: string;
  loading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  rows?: number;
}

const BBTextarea: React.FC<BBTextareaProps> = ({
  label,
  loading = false,
  isError,
  errorMessage,
  rows = 4,
  ...props
}) => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(props.name, e.target.value);
  };

  return (
    <BBInputBase
      value={field.value}
      label={label}
      disabled={loading}
      error={isError}
      errorMessage={isError ? (errorMessage ?? meta.error) : ""}
      multiline
      rows={rows}
      onChange={handleChange}
      {...props}
    />
  );
};

export default BBTextarea;
