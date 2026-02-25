// src/components/customers/CustomerAddress.tsx
import { Grid, Typography, Divider, FormControlLabel, Checkbox, Box } from "@mui/material";
import { BBDropdown, BBInput } from "@/lib";
import { COUNTRY_OPTIONS, PHONE_CODE_OPTIONS } from "@/constants/customer.constants";
import { Customer } from "@/models/customer.model";
import { FormikHelpers } from "formik";

interface CustomerAddressProps {
  values: Customer;
  setFieldValue: FormikHelpers<Customer>['setFieldValue'];
}

export const CustomerAddress: React.FC<CustomerAddressProps> = ({ values, setFieldValue }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Billing Address
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} component="div">
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="billing_address.attention" label="Attention" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBDropdown 
            name="billing_address.country_region" 
            label="Country/Region" 
            options={COUNTRY_OPTIONS}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }} component="div">
          <BBInput name="billing_address.address_line1" label="Address Line 1" fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }} component="div">
          <BBInput name="billing_address.address_line2" label="Address Line 2" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="billing_address.city" label="City" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="billing_address.state" label="State" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="billing_address.pin_code" label="PIN Code" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 4 }} component="div">
              <BBDropdown 
                name="billing_address.phone_code" 
                label="Code" 
                options={PHONE_CODE_OPTIONS}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 8 }} component="div">
              <BBInput name="billing_address.phone" label="Phone" fullWidth />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="billing_address.fax_number" label="Fax Number" fullWidth />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Shipping Address
      </Typography>
      
      <FormControlLabel
        control={
          <Checkbox 
            checked={values.shipping_address.same_as_billing}
            onChange={(e) => {
              setFieldValue('shipping_address.same_as_billing', e.target.checked);
              if (e.target.checked) {
                setFieldValue('shipping_address', {
                  ...values.billing_address,
                  same_as_billing: true,
                });
              }
            }}
          />
        }
        label="Same as billing address"
        sx={{ mb: 2 }}
      />
      
      {!values.shipping_address.same_as_billing && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3} component="div">
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput name="shipping_address.attention" label="Attention" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdown 
                name="shipping_address.country_region" 
                label="Country/Region" 
                options={COUNTRY_OPTIONS}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }} component="div">
              <BBInput name="shipping_address.address_line1" label="Address Line 1" fullWidth />
            </Grid>
            <Grid size={{ xs: 12 }} component="div">
              <BBInput name="shipping_address.address_line2" label="Address Line 2" fullWidth />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput name="shipping_address.city" label="City" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput name="shipping_address.state" label="State" fullWidth />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput name="shipping_address.pin_code" label="PIN Code" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <Grid container spacing={1} component="div">
                <Grid size={{ xs: 4 }} component="div">
                  <BBDropdown 
                    name="shipping_address.phone_code" 
                    label="Code" 
                    options={PHONE_CODE_OPTIONS}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 8 }} component="div">
                  <BBInput name="shipping_address.phone" label="Phone" fullWidth />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput name="shipping_address.fax_number" label="Fax Number" fullWidth />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
