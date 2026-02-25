// app/components/vendor/VendorBasicInfo.tsx
import { Grid, Typography, Divider, Card } from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import {
  SALUTATION_OPTIONS,
  LANGUAGE_OPTIONS,
  PHONE_CODE_OPTIONS,
} from "@/constants/vendor.constants";

export const VendorBasicInfo: React.FC = () => {
  return (
    <Card elevation={1} sx={{ borderRadius: "12px", p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Primary Contact
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} component="div">
        <Grid size={{ xs: 2 }} component="div">
          <BBDropdown 
            name="salutation" 
            label="Salutation" 
            options={SALUTATION_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 5 }} component="div">
          <BBInput name="first_name" label="First Name" fullWidth />
        </Grid>
        <Grid size={{ xs: 5 }} component="div">
          <BBInput name="last_name" label="Last Name" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12 }} component="div">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Company Name
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="company_name" label="Company Name*" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="display_name" label="Display Name*" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12 }} component="div">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Contact Information
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="email_address" label="Email Address" type="email" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="gstin" label="GSTIN" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 4 }} component="div">
              <BBDropdown 
                name="work_phone_code" 
                label="Code" 
                options={PHONE_CODE_OPTIONS}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 8 }} component="div">
              <BBInput name="work_phone" label="Work Phone" fullWidth />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 4 }} component="div">
              <BBDropdown 
                name="mobile_code" 
                label="Code" 
                options={PHONE_CODE_OPTIONS}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 8 }} component="div">
              <BBInput name="mobile" label="Mobile" fullWidth />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown 
            name="vendor_language" 
            label="Vendor Language" 
            options={LANGUAGE_OPTIONS}
          />
        </Grid>
      </Grid>
    </Card>
  );
};