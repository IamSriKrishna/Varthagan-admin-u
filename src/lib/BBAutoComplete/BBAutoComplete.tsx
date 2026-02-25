import React from "react";
import { useField, useFormikContext, FormikValues } from "formik";
import BBAutoCompleteBase, { Option } from "./BBAutoCompleteBase";
import { Box } from "@mui/material";

interface BBAutoCompleteProps {
  name: string;
  label?: string;
  options: Option[];
  loading?: boolean;
  placeholder?: string;
  disableClearable?: boolean;
  onSearch?: (value: string) => void;
  freeSolo?: boolean;
}

const BBAutoComplete: React.FC<BBAutoCompleteProps> = ({
  name,
  label,
  options,
  loading,
  placeholder,
  disableClearable,
  onSearch,
  freeSolo,
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext<FormikValues>();

  return (
    <Box sx={{ minWidth: 300, mr: 2 }}>
      <BBAutoCompleteBase
        name={name}
        label={label}
        options={options}
        value={field.value ?? null}
        loading={loading}
        placeholder={placeholder}
        disableClearable={disableClearable}
        isError={Boolean(meta.touched && meta.error)}
        errorMessage={meta.touched ? meta.error : ""}
        onChange={(fieldName, value) => {
          setFieldValue(fieldName, value);
        }}
        onSearch={onSearch}
        freeSolo={freeSolo}
      />
    </Box>
  );
};

export default BBAutoComplete;
