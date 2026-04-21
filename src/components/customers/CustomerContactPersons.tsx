// src/components/customers/CustomerContactPersons.tsx
import { Box, Grid, Typography, IconButton, Tooltip, Avatar } from "@mui/material";
import { Plus, Trash2, UserPlus, Users } from "lucide-react";
import { BBDropdown, BBInput, BBButton } from "@/lib";
import { SALUTATION_OPTIONS, PHONE_CODE_OPTIONS } from "@/constants/customer.constants";
import { Customer } from "@/models/customer.model";
import { ArrayHelpers } from "formik";

interface CustomerContactPersonsProps {
  values: Customer;
  push: ArrayHelpers["push"];
  remove: ArrayHelpers["remove"];
}

const AVATAR_PALETTE = [
  { bg: "#e8edff", color: "#3d52c7" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fff3cd", color: "#92400e" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

const defaultContact = {
  salutation: "Mr.",
  first_name: "",
  last_name: "",
  email_address: "",
  work_phone: "",
  work_phone_code: "+91",
  mobile: "",
  mobile_code: "+91",
};

export const CustomerContactPersons: React.FC<CustomerContactPersonsProps> = ({
  values,
  push,
  remove,
}) => {
  const contacts = values.contact_persons || [];

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              bgcolor: "#f0f4ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={16} color="#4f63d2" />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "#1a1d2e",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.2,
              }}
            >
              Contact Persons
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                fontFamily: "'DM Sans', sans-serif",
                mt: 0.1,
              }}
            >
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""} added
            </Typography>
          </Box>
        </Box>

        <BBButton
          variant="outlined"
          startIcon={<UserPlus size={15} />}
          onClick={() => push(defaultContact)}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.8125rem",
            color: "#4f63d2",
            borderColor: "#c7d2fe",
            bgcolor: "#f0f4ff",
            "&:hover": {
              bgcolor: "#e0e7ff",
              borderColor: "#a5b4fc",
            },
          }}
        >
          Add Contact
        </BBButton>
      </Box>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {contacts.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            gap: 2,
            border: "1.5px dashed #e0e7ff",
            borderRadius: "12px",
            bgcolor: "#fafbff",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": { bgcolor: "#f0f4ff", borderColor: "#a5b4fc" },
          }}
          onClick={() => push(defaultContact)}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={22} color="#4f63d2" />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#4f63d2",
                fontFamily: "'DM Sans', sans-serif",
                mb: 0.25,
              }}
            >
              Add a contact person
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Click to add the first contact for this customer
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Contact cards ────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {contacts.map((contact, index) => {
          const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
          const initials = [contact.first_name?.[0], contact.last_name?.[0]]
            .filter(Boolean)
            .join("")
            .toUpperCase() || String(index + 1);

          return (
            <Box
              key={index}
              sx={{
                border: "1px solid #eeeff5",
                borderRadius: "14px",
                overflow: "hidden",
                transition: "box-shadow 0.15s ease",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
              }}
            >
              {/* Contact card header */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  bgcolor: "#fafbff",
                  borderBottom: "1px solid #f0f0f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      bgcolor: palette.bg,
                      color: palette.color,
                      fontFamily: "'DM Sans', sans-serif",
                      border: "1.5px solid",
                      borderColor: palette.color + "33",
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: "#1a1d2e",
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || `Contact ${index + 1}`}
                    </Typography>
                    {contact.email_address && (
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#9ca3af",
                          fontFamily: "'DM Sans', sans-serif",
                          mt: 0.1,
                        }}
                      >
                        {contact.email_address}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {contacts.length > 1 && (
                  <Tooltip title="Remove contact" arrow>
                    <IconButton
                      size="small"
                      onClick={() => remove(index)}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "8px",
                        color: "#ef4444",
                        bgcolor: "#fef2f2",
                        "&:hover": { bgcolor: "#fee2e2", transform: "scale(1.05)" },
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Contact form fields */}
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2} component="div">
                  {/* Name row */}
                  <Grid size={{ xs: 12, sm: 2 }} component="div">
                    <BBDropdown
                      name={`contact_persons[${index}].salutation`}
                      label="Salutation"
                      options={SALUTATION_OPTIONS}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }} component="div">
                    <BBInput name={`contact_persons[${index}].first_name`} label="First Name" fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }} component="div">
                    <BBInput name={`contact_persons[${index}].last_name`} label="Last Name" fullWidth />
                  </Grid>

                  {/* Email */}
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput
                      name={`contact_persons[${index}].email_address`}
                      label="Email Address"
                      type="email"
                      fullWidth
                    />
                  </Grid>

                  {/* Work phone */}
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <Grid container spacing={1} component="div">
                      <Grid size={{ xs: 4 }} component="div">
                        <BBDropdown
                          name={`contact_persons[${index}].work_phone_code`}
                          label="Code"
                          options={PHONE_CODE_OPTIONS}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 8 }} component="div">
                        <BBInput name={`contact_persons[${index}].work_phone`} label="Work Phone" fullWidth />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Mobile */}
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <Grid container spacing={1} component="div">
                      <Grid size={{ xs: 4 }} component="div">
                        <BBDropdown
                          name={`contact_persons[${index}].mobile_code`}
                          label="Code"
                          options={PHONE_CODE_OPTIONS}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 8 }} component="div">
                        <BBInput name={`contact_persons[${index}].mobile`} label="Mobile" fullWidth />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Add another CTA (shown after at least one contact) ──────── */}
      {contacts.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            width: "fit-content",
          }}
          onClick={() => push(defaultContact)}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              bgcolor: "#f0f4ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "bgcolor 0.15s",
              "&:hover": { bgcolor: "#e0e7ff" },
            }}
          >
            <Plus size={13} color="#4f63d2" />
          </Box>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#4f63d2",
              fontFamily: "'DM Sans', sans-serif",
              "&:hover": { color: "#3d52c7" },
            }}
          >
            Add another contact person
          </Typography>
        </Box>
      )}
    </Box>
  );
};