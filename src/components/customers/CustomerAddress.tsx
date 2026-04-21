// src/components/customers/CustomerAddress.tsx
import {
  Grid,
  Typography,
  Divider,
  Box,
  Switch,
  Chip,
} from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import { COUNTRY_OPTIONS, PHONE_CODE_OPTIONS } from "@/constants/customer.constants";
import { Customer } from "@/models/customer.model";
import { FormikHelpers } from "formik";
import { MapPin, Package, Copy, Check } from "lucide-react";

interface CustomerAddressProps {
  values: Customer;
  setFieldValue: FormikHelpers<Customer>["setFieldValue"];
}

function SectionLabel({ icon: Icon, label, accent = "#4f63d2" }: { icon: any; label: string; accent?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "7px",
          bgcolor: accent + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color={accent} />
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

function AddressFields({ prefix }: { prefix: "billing_address" | "shipping_address" }) {
  return (
    <Grid container spacing={2} component="div">
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBInput name={`${prefix}.attention`} label="Attention" fullWidth />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBDropdown name={`${prefix}.country_region`} label="Country / Region" options={COUNTRY_OPTIONS} />
      </Grid>

      <Grid size={{ xs: 12 }} component="div">
        <BBInput name={`${prefix}.address_line1`} label="Address Line 1" fullWidth />
      </Grid>
      <Grid size={{ xs: 12 }} component="div">
        <BBInput name={`${prefix}.address_line2`} label="Address Line 2" fullWidth />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBInput name={`${prefix}.city`} label="City" fullWidth />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBInput name={`${prefix}.state`} label="State" fullWidth />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBInput name={`${prefix}.pin_code`} label="PIN Code" fullWidth />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <Grid container spacing={1} component="div">
          <Grid size={{ xs: 4 }} component="div">
            <BBDropdown name={`${prefix}.phone_code`} label="Code" options={PHONE_CODE_OPTIONS} size="small" />
          </Grid>
          <Grid size={{ xs: 8 }} component="div">
            <BBInput name={`${prefix}.phone`} label="Phone" fullWidth />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} component="div">
        <BBInput name={`${prefix}.fax_number`} label="Fax Number" fullWidth />
      </Grid>
    </Grid>
  );
}

export const CustomerAddress: React.FC<CustomerAddressProps> = ({ values, setFieldValue }) => {
  const sameAsBilling = values.shipping_address?.same_as_billing ?? false;

  const handleSameToggle = (checked: boolean) => {
    setFieldValue("shipping_address.same_as_billing", checked);
    if (checked) {
      setFieldValue("shipping_address", {
        ...values.billing_address,
        same_as_billing: true,
      });
    }
  };

  return (
    <Box>
      {/* ── Billing address ─────────────────────────────────────────── */}
      <Box
        sx={{
          border: "1px solid #eeeff5",
          borderRadius: "12px",
          overflow: "hidden",
          mb: 2.5,
        }}
      >
        {/* Section header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            bgcolor: "#fafbff",
            borderBottom: "1px solid #f0f0f5",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={14} color="#0369a1" />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#1a1d2e",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.1px",
            }}
          >
            Billing Address
          </Typography>
          <Chip
            label="Primary"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: "#dbeafe",
              color: "#1e40af",
              border: "1px solid #bfdbfe",
              borderRadius: "5px",
              ml: 0.5,
            }}
          />
        </Box>

        <Box sx={{ p: 2.5 }}>
          <AddressFields prefix="billing_address" />
        </Box>
      </Box>

      {/* ── Shipping address ─────────────────────────────────────────── */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: sameAsBilling ? "#c7d2fe" : "#eeeff5",
          borderRadius: "12px",
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Section header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            bgcolor: sameAsBilling ? "#f0f4ff" : "#fafbff",
            borderBottom: "1px solid",
            borderColor: sameAsBilling ? "#e0e7ff" : "#f0f0f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: sameAsBilling ? "#e0e7ff" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "bgcolor 0.2s",
              }}
            >
              <Package size={14} color={sameAsBilling ? "#4f63d2" : "#9ca3af"} />
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: sameAsBilling ? "#3d52c7" : "#1a1d2e",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.1px",
                transition: "color 0.2s",
              }}
            >
              Shipping Address
            </Typography>
          </Box>

          {/* Same as billing toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => handleSameToggle(!sameAsBilling)}
          >
            {sameAsBilling ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Check size={13} color="#4f63d2" />
                <Typography
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    color: "#4f63d2",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Same as billing
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Copy size={13} color="#9ca3af" />
                <Typography
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 500,
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Copy billing
                </Typography>
              </Box>
            )}
            <Switch
              checked={sameAsBilling}
              onChange={(e) => {
                e.stopPropagation();
                handleSameToggle(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f63d2" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#4f63d2" },
              }}
            />
          </Box>
        </Box>

        {/* Shipping fields — only shown when NOT same as billing */}
        {!sameAsBilling && (
          <Box sx={{ p: 2.5 }}>
            <AddressFields prefix="shipping_address" />
          </Box>
        )}

        {/* Placeholder when same as billing */}
        {sameAsBilling && (
          <Box
            sx={{
              px: 2.5,
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              bgcolor: "#f8f9ff",
            }}
          >
            <Check size={16} color="#4f63d2" />
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: "#4f63d2",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              Shipping address is the same as the billing address
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};