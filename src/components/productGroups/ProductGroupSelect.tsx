"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
  FormHelperText,
  Box,
  Chip,
} from "@mui/material";
import useFetch from "@/hooks/useFetch";
import { ProductGroupListResponse, ProductGroupListOutput } from "@/models/product-group.model";

interface ProductGroupSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  onProductGroupSelect?: (productGroup: ProductGroupListOutput) => void;
}

export default function ProductGroupSelect({
  value,
  onChange,
  label = "Product Group",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  size = "small",
  fullWidth = true,
  onProductGroupSelect,
}: ProductGroupSelectProps) {
  const [selectedGroup, setSelectedGroup] = useState<ProductGroupListOutput | null>(null);

  // Fetch product groups
  const { data: response, loading } = useFetch<ProductGroupListResponse>({
    url: "/product-groups?limit=100&offset=0",
  });

  const productGroups: ProductGroupListOutput[] = response?.data || [];

  // Update selected group when value changes
  useEffect(() => {
    if (value && productGroups.length > 0) {
      const group = productGroups.find((pg) => pg.id === value);
      if (group) {
        setSelectedGroup(group);
      }
    }
  }, [value, productGroups]);

  const handleChange = (event: any) => {
    const selectedId = event.target.value;
    onChange(selectedId);

    // Find and call callback with full product group data
    if (selectedId && onProductGroupSelect) {
      const group = productGroups.find((pg) => pg.id === selectedId);
      if (group) {
        onProductGroupSelect(group);
      }
    }
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      size={size}
      disabled={disabled || loading}
    >
      <Select
        value={value || ""}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ opacity: 0.6 }}>Select a product group...</span>;
          }

          const selectedGroup = productGroups.find((pg) => pg.id === selected);
          if (selectedGroup) {
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                }}
              >
                <span>{selectedGroup.name}</span>
                {selectedGroup.components && (
                  <Chip
                    label={`${selectedGroup.components.length} components`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            );
          }
          return selected;
        }}
      >
        <MenuItem value="" disabled>
          {loading ? "Loading product groups..." : "Select a product group..."}
        </MenuItem>

        {loading && (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading...
          </MenuItem>
        )}

        {!loading && productGroups.length === 0 && (
          <MenuItem disabled>No product groups available</MenuItem>
        )}

        {!loading &&
          productGroups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{group.name}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    {group.components?.length || 0} components • ₹
                    {group.selling_price || 0}
                  </div>
                </div>
              </Box>
            </MenuItem>
          ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
