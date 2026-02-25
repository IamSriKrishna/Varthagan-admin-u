// src/components/customers/CustomerOtherDetails.tsx
import {
  Grid,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import {
  CURRENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
} from "@/constants/customer.constants";

export const CustomerOtherDetails: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Other Details
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} component="div">
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.pan" label="PAN" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown 
            name="other_details.currency" 
            label="Currency" 
            options={CURRENCY_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown 
            name="other_details.payment_terms" 
            label="Payment Terms" 
            options={PAYMENT_TERMS_OPTIONS}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <FormControlLabel
            control={
              <Checkbox name="other_details.enable_portal" />
            }
            label="Enable Portal Access for Customer"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
