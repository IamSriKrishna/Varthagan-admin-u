"use client";

import { FormControl, FormHelperText, OutlinedInput } from "@mui/material";
import { useField, useFormikContext } from "formik";
import React from "react";

interface BBFileInputProps {
  name: string;
}

const BBFileInput: React.FC<BBFileInputProps> = ({ name }) => {
  const [, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const isError = Boolean(meta.touched && meta.error);

  return (
    <FormControl fullWidth error={isError} variant="outlined" size="small">
      <OutlinedInput
        notched
        type="file"
        inputProps={{ accept: "*" }}
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          setFieldValue(name, file || null);
        }}
      />

      {isError && <FormHelperText>{meta.error as string}</FormHelperText>}
    </FormControl>
  );
};

export default BBFileInput;
