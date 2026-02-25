"use client";

import React from "react";
import { useField, useFormikContext } from "formik";
import BBMultiSelectBase, { Option } from "./BBMultiSelectBase";

interface BBMultiSelectProps {
  name: string;
  label: string;
  options: Option[];
  loading?: boolean;
  onCreate?: (label: string) => Promise<Option>;
}

const BBMultiSelect: React.FC<BBMultiSelectProps> = ({ name, label, options, loading = false, onCreate }) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const isError = Boolean(meta.touched && meta.error);

  const handleChange = (fieldName: string, value: (string | number)[]) => {
    setFieldValue(fieldName, value);
    setTimeout(() => setFieldTouched(fieldName, true), 0);
  };

  return (
    <BBMultiSelectBase
      name={name}
      label={label}
      value={field.value || []}
      options={options}
      loading={loading}
      isError={isError}
      errorMessage={meta.error as string}
      onChange={handleChange}
      onCreate={onCreate}
    />
  );
};

export default BBMultiSelect;
