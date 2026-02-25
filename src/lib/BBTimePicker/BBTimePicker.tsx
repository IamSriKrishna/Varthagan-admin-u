"use client";

import dayjs, { Dayjs } from "dayjs";
import { useField, useFormikContext } from "formik";
import React from "react";
import BBTimePickerBase from "./BBTimePickerBase";

interface BBTimePickerProps {
  name: string;
  label: string;
  loading?: boolean;
  onChange?: (value: Dayjs | null) => void;
  disableFuture?: boolean;
  minTime?: Dayjs | null;
  maxTime?: Dayjs | null;
  format?: string;
}

const BBTimePicker: React.FC<BBTimePickerProps> = ({
  name,
  label,
  loading = false,
  onChange,
  disableFuture,
  minTime,
  maxTime,
  format = "HH:mm",
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const isError = Boolean(meta.touched && meta.error);

  const handleTimeChange = (_name: string, value: Dayjs | null) => {
    setFieldValue(name, value ? value.toISOString() : null);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <BBTimePickerBase
      name={name}
      label={label}
      value={field.value ? dayjs(field.value) : null}
      loading={loading}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
      onTimeChange={handleTimeChange}
      disableFuture={disableFuture}
      minTime={minTime}
      maxTime={maxTime}
      format={format}
    />
  );
};

export default BBTimePicker;
