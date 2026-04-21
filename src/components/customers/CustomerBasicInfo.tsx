// src/components/customers/CustomerBasicInfo.tsx
import { Grid, Typography, Box, Divider } from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import {
  SALUTATION_OPTIONS,
  LANGUAGE_OPTIONS,
  PHONE_CODE_OPTIONS,
} from "@/constants/customer.constants";
import { User, Phone, Mail, Globe } from "lucide-react";

// ── Section label helper ───────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, label, color = "#0ea5e9" }: { icon: any; label: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "7px",
          bgcolor: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color={color} />
      </Box>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9ca3af",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export const CustomerBasicInfo: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #eeeff5",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        mb: 2.5,
      }}
    >
      {/* Card header strip */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #f0f0f5",
          bgcolor: "#fafbff",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "9px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={15} color="white" />
        </Box>
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "#1a1d2e",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          Primary Contact
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* ── Name section ───────────────────────────────────────────── */}
        <SectionLabel icon={User} label="Name & Type" />
        <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 3, md: 2 }} component="div">
            <BBDropdown
              name="customer_type"
              label="Type"
              options={[
                { label: "Business", value: "Business" },
                { label: "Individual", value: "Individual" },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3, md: 2 }} component="div">
            <BBDropdown name="salutation" label="Salutation" options={SALUTATION_OPTIONS} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
            <BBInput name="first_name" label="First Name" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div">
            <BBInput name="last_name" label="Last Name" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} component="div">
            <BBInput name="display_name" label="Display Name *" fullWidth />
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

        {/* ── Contact section ─────────────────────────────────────────── */}
        <SectionLabel icon={Phone} label="Contact Information" />
        <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }} component="div">
            <BBInput name="email_address" label="Email Address" type="email" fullWidth />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} component="div">
            <Grid container spacing={1} component="div">
              <Grid size={{ xs: 4 }} component="div">
                <BBDropdown name="work_phone_code" label="Code" options={PHONE_CODE_OPTIONS} size="small" />
              </Grid>
              <Grid size={{ xs: 8 }} component="div">
                <BBInput name="work_phone" label="Work Phone" fullWidth />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} component="div">
            <Grid container spacing={1} component="div">
              <Grid size={{ xs: 4 }} component="div">
                <BBDropdown name="mobile_code" label="Code" options={PHONE_CODE_OPTIONS} size="small" />
              </Grid>
              <Grid size={{ xs: 8 }} component="div">
                <BBInput name="mobile" label="Mobile" fullWidth />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} component="div">
            <BBDropdown name="customer_language" label="Customer Language" options={LANGUAGE_OPTIONS} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};