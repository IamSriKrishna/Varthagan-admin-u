// app/components/vendor/VendorOtherDetails.tsx
import { useState, ChangeEvent } from "react";
import { Grid, Typography, Divider, Box, Switch, Chip, IconButton } from "@mui/material";
import { Upload, Trash2, CreditCard, DollarSign, Shield, FileText, Globe } from "lucide-react";
import { useFormikContext } from "formik";
import { BBDropdown, BBInput, BBButton } from "@/lib";
import {
  CURRENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  TDS_OPTIONS,
} from "@/constants/vendor.constants";
import { Vendor } from "@/models/vendor.model";

function SectionLabel({ icon: Icon, label, color = "#4f63d2" }: any) {
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

export const VendorOtherDetails: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Vendor>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const portalEnabled = values?.other_details?.enable_portal ?? false;
  const msmeEnabled = values?.other_details?.is_msme_registered ?? false;

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    if (uploadedFiles.length + newFiles.length > 10) {
      alert("Maximum 10 files allowed");
      return;
    }

    const oversizedFiles = newFiles.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Files must be less than 10MB each");
      return;
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <Box>
      <SectionLabel icon={CreditCard} label="Tax & Identity" />

      <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.pan" label="PAN" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Box
            onClick={() =>
              setFieldValue("other_details.is_msme_registered", !msmeEnabled)
            }
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: msmeEnabled ? "#c7d2fe" : "#f0f0f5",
              borderRadius: "12px",
              bgcolor: msmeEnabled ? "#f0f4ff" : "#fafbff",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
              MSME Registered
            </Typography>

            <Switch
              checked={msmeEnabled}
              onChange={(e) =>
                setFieldValue("other_details.is_msme_registered", e.target.checked)
              }
              onClick={(e) => e.stopPropagation()}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f63d2" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: "#4f63d2",
                },
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

      <SectionLabel icon={DollarSign} label="Financial Settings" />

      <Grid container spacing={2} component="div" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown name="other_details.currency" label="Currency" options={CURRENCY_OPTIONS} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown name="other_details.payment_terms" label="Payment Terms" options={PAYMENT_TERMS_OPTIONS} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown name="other_details.tds" label="TDS" options={TDS_OPTIONS} />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

      <SectionLabel icon={Shield} label="Portal Access" />

      <Box
        onClick={() => setFieldValue("other_details.enable_portal", !portalEnabled)}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: portalEnabled ? "#c7d2fe" : "#f0f0f5",
          borderRadius: "12px",
          bgcolor: portalEnabled ? "#f0f4ff" : "#fafbff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: portalEnabled ? "#3d52c7" : "#374151" }}>
            Enable Portal Access
          </Typography>
          <Typography sx={{ fontSize: "0.775rem", color: "#9ca3af" }}>
            Allow this vendor to log in to the vendor portal
          </Typography>
        </Box>

        <Switch
          checked={portalEnabled}
          onChange={(e) => setFieldValue("other_details.enable_portal", e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f63d2" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              bgcolor: "#4f63d2",
            },
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#f0f0f8", mb: 3 }} />

      <SectionLabel icon={FileText} label="Documents" />

      <Box
        sx={{
          border: "1.5px dashed #e0e7ff",
          borderRadius: "12px",
          bgcolor: "#fafbff",
          p: 3,
          mb: 3,
        }}
      >
        <input
          type="file"
          id="vendor-file-upload"
          multiple
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <BBButton
          variant="outlined"
          startIcon={<Upload size={16} />}
          onClick={() => document.getElementById("vendor-file-upload")?.click()}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            color: "#4f63d2",
            borderColor: "#c7d2fe",
            bgcolor: "#f0f4ff",
            fontWeight: 600,
          }}
        >
          Upload File
        </BBButton>

        {uploadedFiles.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            {uploadedFiles.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                onDelete={() =>
                  setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                }
                deleteIcon={<Trash2 size={14} />}
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #eeeff5",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            ))}
          </Box>
        )}

        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 1.5 }}>
          You can upload a maximum of 10 files, 10MB each
        </Typography>
      </Box>

      <SectionLabel icon={Globe} label="Additional Information" />

      <Grid container spacing={2} component="div">
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.website_url" label="Website URL" placeholder="ex: www.zylker.com" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.department" label="Department" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.designation" label="Designation" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.twitter" label="Twitter" placeholder="https://x.com/" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.skype_name" label="Skype Name / Number" fullWidth />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.facebook" label="Facebook" placeholder="http://www.facebook.com/" fullWidth />
        </Grid>
      </Grid>
    </Box>
  );
};