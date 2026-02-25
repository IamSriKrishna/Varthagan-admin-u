"use client";

import { Dayjs } from "dayjs";
import { useField, useFormikContext } from "formik";
import React from "react";
import BBDatePickerBase from "./BBDatePickerBase";

interface BBDatePickerProps {
  name: string;
  label: string;
  loading?: boolean;
  onChange?: (value: Dayjs | null) => void;
  disableFuture?: boolean;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  format?: string;
}

const BBDatePicker: React.FC<BBDatePickerProps> = ({
  name,
  label,
  loading = false,
  onChange,
  disableFuture,
  minDate,
  maxDate,
  format = "DD-MM-YYYY",
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const isError = Boolean(meta.touched && meta.error);

  const handleDateChange = (_name: string, value: Dayjs | null) => {
    setFieldValue(name, value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <BBDatePickerBase
      name={name}
      label={label}
      value={field.value || null}
      loading={loading}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
      onDateChange={handleDateChange}
      disableFuture={disableFuture}
      minDate={minDate}
      maxDate={maxDate}
      format={format}
    />
  );
};

export default BBDatePicker;
