"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  UpsertCompanyAddressInput,
  companyApi,
  Country,
  State,
} from "@/lib/api/companyApi";

interface AddressDetailsStepProps {
  data: UpsertCompanyAddressInput;
  onChange: (data: UpsertCompanyAddressInput) => void;
}

export default function AddressDetailsStep({
  data,
  onChange,
}: AddressDetailsStepProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (data.country_id) {
      fetchStates(data.country_id);
    }
  }, [data.country_id]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const countries = await companyApi.getCountries();
      setCountries(countries);
      
      // Set India as default if available
      const india = countries.find(c => c.country_code === 'IN');
      if (india && !data.country_id) {
        onChange({ ...data, country_id: india.id });
      }
    } catch (err) {
      setError("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      setStatesLoading(true);
      const states = await companyApi.getStatesByCountry(countryId);
      setStates(states);
    } catch (err) {
      setError("Failed to load states");
    } finally {
      setStatesLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Address Line 1"
        value={data.address_line1}
        onChange={(e) => handleChange("address_line1", e.target.value)}
        required
        fullWidth
        placeholder="Street address"
      />

      <TextField
        label="Address Line 2"
        value={data.address_line2}
        onChange={(e) => handleChange("address_line2", e.target.value)}
        fullWidth
        placeholder="Apartment, suite, etc. (optional)"
      />

      <TextField
        label="City"
        value={data.city}
        onChange={(e) => handleChange("city", e.target.value)}
        required
        fullWidth
        placeholder="City name"
      />

      <FormControl fullWidth required error={data.country_id === 0}>
        <InputLabel id="country-label">Country *</InputLabel>
        <Select
          labelId="country-label"
          id="country-select"
          value={data.country_id || 0}
          label="Country *"
          onChange={(e) => handleChange("country_id", e.target.value as number)}
        >
          <MenuItem value={0} disabled>
            Select a country
          </MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.id} value={country.id}>
              {country.country_name} {country.country_code && `(${country.country_code})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={statesLoading || !data.country_id} error={data.state_id === 0 && data.country_id !== 0}>
        <InputLabel id="state-label">State/Province *</InputLabel>
        <Select
          labelId="state-label"
          id="state-select"
          value={data.state_id || 0}
          label="State/Province *"
          onChange={(e) => handleChange("state_id", e.target.value as number)}
        >
          <MenuItem value={0} disabled>
            {statesLoading ? "Loading states..." : "Select a state"}
          </MenuItem>
          {states.map((state) => (
            <MenuItem key={state.id} value={state.id}>
              {state.state_name} {state.state_code && `(${state.state_code})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Pincode"
        value={data.pincode}
        onChange={(e) => handleChange("pincode", e.target.value)}
        required
        fullWidth
        placeholder="Postal code"
      />
    </Box>
  );
}
