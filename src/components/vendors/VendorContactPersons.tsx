// app/components/vendor/VendorContactPersons.tsx
import { Box, Grid, Typography, Divider, Button, IconButton } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { BBDropdown, BBInput } from "@/lib";
import { SALUTATION_OPTIONS, PHONE_CODE_OPTIONS } from "@/constants/vendor.constants";
import { Vendor } from "@/models/vendor.model";
import { ArrayHelpers } from "formik";

interface VendorContactPersonsProps {
  values: Vendor;
  push: ArrayHelpers['push'];
  remove: ArrayHelpers['remove'];
}

export const VendorContactPersons: React.FC<VendorContactPersonsProps> = ({ 
  values, 
  push, 
  remove 
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Contact Persons
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus size={16} />}
          onClick={() => push({
            salutation: "Mr",
            first_name: "",
            last_name: "",
            email_address: "",
            work_phone: "",
            work_phone_code: "+91",
            mobile: "",
            mobile_code: "+91",
          })}
        >
          Add Contact Person
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {values.contact_persons.map((contact, index) => (
        <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Contact Person {index + 1}
            </Typography>
            {values.contact_persons.length > 1 && (
              <IconButton
                size="small"
                onClick={() => remove(index)}
                color="error"
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </Box>
          
          <Grid container spacing={3} component="div">
            <Grid size={{ xs: 2 }} component="div">
              <BBDropdown 
                name={`contact_persons[${index}].salutation`}
                label="Salutation"
                options={SALUTATION_OPTIONS}
              />
            </Grid>
            <Grid size={{ xs: 5 }} component="div">
              <BBInput 
                name={`contact_persons[${index}].first_name`}
                label="First Name"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 5 }} component="div">
              <BBInput 
                name={`contact_persons[${index}].last_name`}
                label="Last Name"
                fullWidth
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput 
                name={`contact_persons[${index}].email_address`}
                label="Email Address"
                type="email"
                fullWidth
              />
            </Grid>
            
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
                  <BBInput 
                    name={`contact_persons[${index}].work_phone`}
                    label="Work Phone"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
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
                  <BBInput 
                    name={`contact_persons[${index}].mobile`}
                    label="Mobile"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
};