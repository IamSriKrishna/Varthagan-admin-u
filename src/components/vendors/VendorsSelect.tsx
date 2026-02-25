"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchPublicVendors } from "@/store/vendors/vendorsSlice";
import BBAutoCompleteBase from "@/lib/BBAutoComplete/BBAutoCompleteBase";
export interface Option {
  label: string;
  value: string | number;
}

interface VendorsSelectProps {
  name?: string;
  label?: string;
  value?: string | number | null;
  disableClear?: boolean;
  blurOnSelect?: boolean;
  disable?: boolean;
  onChange: (name: string, value: string | number | null) => void;
}

const VendorsSelect: React.FC<VendorsSelectProps> = ({
  label = "",
  name = "",
  value = null,
  disableClear,
  blurOnSelect,
  disable,
  onChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vendors, loading } = useSelector((s: RootState) => s.vendors);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedVendorId, setSelectedVendorId] = useState<string | number | null>(value ?? null);

  const isAdmin = user?.user_type === "admin";

  // fetch vendor list
  useEffect(() => {
    if (!vendors || vendors.length === 0) {
      dispatch(fetchPublicVendors());
    }
  }, [vendors, dispatch]);

  useEffect(() => {
    if (isAdmin && user?.id) {
      const adminVendor = vendors.find((v) => v.user_id === user.id);
      if (adminVendor) {
        setSelectedVendorId(adminVendor.vendor_id);
        onChange(name, adminVendor.vendor_id);
      }
    } else {
      setSelectedVendorId(value ?? null);
    }
  }, [isAdmin, user, vendors, name, value, onChange]);

  const options: Option[] = vendors
    .filter((v) => v.is_active && v.name && v.vendor_id)
    .map((v) => ({
      label: String(v.name),
      value: v.vendor_id,
    }));

  const handleChange = (_name: string, newValue: string | number | null) => {
    setSelectedVendorId(newValue ?? null);
    onChange(_name, newValue ?? null);
  };

  return (
    <BBAutoCompleteBase
      label={label || ""}
      blurOnSelect={blurOnSelect}
      name={name}
      value={selectedVendorId}
      options={options}
      loading={loading}
      disableClearable={Boolean(disableClear) || isAdmin}
      disabled={disable || isAdmin}
      onChange={handleChange}
      freeSolo={false}
    />
  );
};

export default VendorsSelect;
