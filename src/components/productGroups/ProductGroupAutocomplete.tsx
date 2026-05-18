"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Chip,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import { Package2 } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { ProductGroupListResponse, ProductGroupListOutput } from "@/models/product-group.model";

interface ProductGroupAutocompleteProps {
  value: ProductGroupListOutput | null;
  onChange: (value: ProductGroupListOutput | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  filterActive?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export default function ProductGroupAutocomplete({
  value,
  onChange,
  label = "Product Group",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  size = "small",
  fullWidth = true,
  filterActive = false,
  onSearch,
}: ProductGroupAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch product groups with search support
  const { data: response, loading } = useFetch<ProductGroupListResponse>({
    url: `/product-groups?limit=100&offset=0${searchTerm ? `&search=${searchTerm}` : ""}`,
  });

  const productGroups: ProductGroupListOutput[] = response?.data || [];

  // Filter based on active status if needed
  const filteredGroups = filterActive
    ? productGroups.filter((pg) => pg.is_active)
    : productGroups;

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    onSearch?.(newSearchTerm);
  }, [onSearch]);

  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      inputValue={searchTerm}
      onInputChange={(_event, newValue) => handleSearchChange(newValue)}
      options={filteredGroups}
      getOptionLabel={(option) => option.name}
      loading={loading}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      size={size}
      noOptionsText="No product groups found"
      loadingText="Loading product groups..."
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "0.9rem",
              }}
            >
              <Package2 size={16} />
            </Avatar>

            <Stack spacing={0.25} flex={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {option.components?.length || 0} components • ₹
                {option.selling_price || 0}
              </Typography>
            </Stack>

            {option.is_active && (
              <Chip label="Active" size="small" color="success" variant="outlined" />
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          placeholder="Search product groups..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
