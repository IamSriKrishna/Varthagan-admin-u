"use client";

import React from "react";
import { useField, useFormikContext } from "formik";
import BBSwitchBase from "./BBSwitchBase";

interface BBSwitchProps {
  name: string;
  label: string;
  loading?: boolean;
}

const BBSwitch: React.FC<BBSwitchProps> = ({ name, label, loading = false }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const isError = Boolean(meta.touched && meta.error);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, value: boolean) => {
    setFieldValue(fieldName, value);
  };

  return (
    <BBSwitchBase
      name={name}
      label={label}
      value={field.value}
      loading={loading}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
      onToggleChange={handleToggleChange}
    />
  );
};

export default BBSwitch;
