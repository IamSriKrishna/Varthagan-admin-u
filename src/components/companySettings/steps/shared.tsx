/**
 * Shared styled primitives used across all wizard steps.
 * Import from here to keep all step UIs visually consistent.
 */
import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextFieldProps,
  SelectProps,
} from "@mui/material";
import { dt } from "../designTokens";

/* ─────────────────────────────────────────────────────────────
   Shared sx overrides
───────────────────────────────────────────────────────────── */
export const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: dt.radiusSm,
    fontFamily: dt.font,
    fontSize: 14,
    bgcolor: dt.white,
    "& fieldset": { borderColor: dt.border, transition: "border-color 0.2s" },
    "&:hover fieldset": { borderColor: `${dt.navy}60` },
    "&.Mui-focused fieldset": { borderColor: dt.navy, borderWidth: 2 },
  },
  "& .MuiInputLabel-root": {
    fontFamily: dt.font,
    fontSize: 14,
    color: dt.textSecondary,
    "&.Mui-focused": { color: dt.navy },
  },
  "& .MuiFormHelperText-root": {
    fontFamily: dt.font,
    fontSize: 11.5,
    mt: 0.6,
    ml: 0,
  },
};

export const selectSx = {
  ...inputSx,
  "& .MuiSelect-select": { fontFamily: dt.font, fontSize: 14 },
};

/* ─────────────────────────────────────────────────────────────
   StyledField — labeled text input
───────────────────────────────────────────────────────────── */
export function StyledField(props: TextFieldProps) {
  return <TextField fullWidth {...props} sx={{ ...inputSx, ...props.sx }} />;
}

/* ─────────────────────────────────────────────────────────────
   StyledSelect — labeled dropdown
───────────────────────────────────────────────────────────── */
interface StyledSelectProps extends Omit<SelectProps, "label"> {
  label: string;
  helperText?: string;
  error?: boolean;
  children: React.ReactNode;
}

export function StyledSelect({ label, helperText, error, children, ...rest }: StyledSelectProps) {
  return (
    <FormControl fullWidth error={error} sx={selectSx}>
      <InputLabel sx={{ fontFamily: dt.font, fontSize: 14, "&.Mui-focused": { color: dt.navy } }}>
        {label}
      </InputLabel>
      <Select label={label} {...rest}>
        {children}
      </Select>
      {helperText && (
        <Box
          component="span"
          sx={{
            fontFamily: dt.font,
            fontSize: 11.5,
            mt: 0.6,
            ml: 0,
            color: error ? "error.main" : dt.textMuted,
          }}
        >
          {helperText}
        </Box>
      )}
    </FormControl>
  );
}

/* ─────────────────────────────────────────────────────────────
   SectionCard — grouped section with title
───────────────────────────────────────────────────────────── */
interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, icon, optional, children }: SectionCardProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${dt.border}`,
        borderRadius: dt.radius,
        overflow: "hidden",
        bgcolor: dt.white,
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${dt.borderLight}`,
          background: `linear-gradient(90deg, ${dt.navy}06 0%, transparent 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <Box>
            <Box sx={{ fontFamily: dt.font, fontWeight: 700, fontSize: 14, color: dt.navy }}>
              {title}
            </Box>
            {subtitle && (
              <Box sx={{ fontFamily: dt.font, fontSize: 12, color: dt.textMuted, mt: 0.3 }}>
                {subtitle}
              </Box>
            )}
          </Box>
        </Box>
        {optional && (
          <Box
            sx={{
              fontSize: 11,
              fontFamily: dt.font,
              fontWeight: 600,
              color: dt.gold,
              bgcolor: `${dt.gold}18`,
              px: 1.5,
              py: 0.4,
              borderRadius: 99,
              letterSpacing: "0.04em",
            }}
          >
            OPTIONAL
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {children}
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   StyledCheckbox — checkbox with refined style
───────────────────────────────────────────────────────────── */
interface StyledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function StyledCheckbox({ checked, onChange, label, description }: StyledCheckboxProps) {
  return (
    <Box
      onClick={() => onChange(!checked)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        p: 1.5,
        borderRadius: dt.radiusSm,
        border: `1.5px solid ${checked ? dt.navy + "40" : dt.border}`,
        bgcolor: checked ? `${dt.navy}05` : "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { bgcolor: `${dt.navy}05`, borderColor: `${dt.navy}30` },
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? dt.navy : dt.border}`,
          bgcolor: checked ? dt.navy : dt.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mt: 0.1,
          transition: "all 0.2s ease",
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </Box>
      <Box>
        <Box sx={{ fontFamily: dt.font, fontSize: 13.5, fontWeight: 600, color: dt.textPrimary }}>
          {label}
        </Box>
        {description && (
          <Box sx={{ fontFamily: dt.font, fontSize: 12, color: dt.textMuted, mt: 0.3 }}>
            {description}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   FieldRow — two fields side by side on larger screens
───────────────────────────────────────────────────────────── */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
      {children}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   LoadingPane
───────────────────────────────────────────────────────────── */
export function LoadingPane() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `3px solid ${dt.border}`,
          borderTopColor: dt.navy,
          animation: "spin 0.8s linear infinite",
          "@keyframes spin": { to: { transform: "rotate(360deg)" } },
        }}
      />
      <Box sx={{ fontFamily: dt.font, fontSize: 13, color: dt.textMuted }}>Loading…</Box>
    </Box>
  );
}