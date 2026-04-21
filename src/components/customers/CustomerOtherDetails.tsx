// src/components/customers/CustomerOtherDetails.tsx
import { Grid, Typography, Divider, Box, Switch, FormControlLabel } from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import { CURRENCY_OPTIONS, PAYMENT_TERMS_OPTIONS } from "@/constants/customer.constants";
import { CreditCard, DollarSign, Clock, Globe, Shield } from "lucide-react";
import { useFormikContext } from "formik";
import { Customer } from "@/models/customer.model";

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "7px",
          bgcolor: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color="#4f63d2" />
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

export const CustomerOtherDetails: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Customer>();
  const portalEnabled = values?.other_details?.enable_portal ?? false;

  return (
    <Box>
      {/* ── Tax & Identity ──────────────────────────────────────────── */}
      <SectionLabel icon={CreditCard} label="Tax & Identity" />
      <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.pan" label="PAN Number" fullWidth />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

      {/* ── Financial ───────────────────────────────────────────────── */}
      <SectionLabel icon={DollarSign} label="Financial Settings" />
      <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown name="other_details.currency" label="Currency" options={CURRENCY_OPTIONS} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown name="other_details.payment_terms" label="Payment Terms" options={PAYMENT_TERMS_OPTIONS} />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

      {/* ── Portal access ────────────────────────────────────────────── */}
      <SectionLabel icon={Shield} label="Portal Access" />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          border: "1px solid",
          borderColor: portalEnabled ? "#c7d2fe" : "#f0f0f5",
          borderRadius: "12px",
          bgcolor: portalEnabled ? "#f0f4ff" : "#fafbff",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onClick={() => setFieldValue("other_details.enable_portal", !portalEnabled)}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: portalEnabled ? "#3d52c7" : "#374151",
              fontFamily: "'DM Sans', sans-serif",
              mb: 0.25,
            }}
          >
            Enable Portal Access
          </Typography>
          <Typography
            sx={{
              fontSize: "0.775rem",
              color: portalEnabled ? "#6b7280" : "#9ca3af",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Allow this customer to log in to the customer portal
          </Typography>
        </Box>
        <Switch
          checked={portalEnabled}
          onChange={(e) => setFieldValue("other_details.enable_portal", e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f63d2" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#4f63d2" },
          }}
        />
      </Box>
    </Box>
  );
};