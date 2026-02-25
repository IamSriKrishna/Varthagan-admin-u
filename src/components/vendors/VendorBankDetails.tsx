import { Box, Grid, Typography, Divider, Button, IconButton } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { BBInput, BBDropdown } from "@/lib";
import { Vendor } from "@/models/vendor.model";
import { ArrayHelpers } from "formik";
import { useState, useEffect } from "react";
import { bankService } from "@/lib/api/bankService";
import { Bank } from "@/models/bank.model";
import { showToastMessage } from "@/utils/toastUtil";

interface VendorBankDetailsProps {
  values: Vendor;
  push: ArrayHelpers["push"];
  remove: ArrayHelpers["remove"];
}

export const VendorBankDetails: React.FC<VendorBankDetailsProps> = ({ values, push, remove }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankOptions, setBankOptions] = useState<{ value: string | number; label: string }[]>([]);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const response = await bankService.getBanks(1, 100);
      if (response.success && response.data) {
        // Handle both array and potential data wrapper formats
        const banksArray = Array.isArray(response.data) ? response.data : (response.data as any)?.banks || [];
        setBanks(Array.isArray(banksArray) ? banksArray : []);
        const options = (Array.isArray(banksArray) ? banksArray : []).map((bank: Bank) => ({
          value: bank.id,
          label: `${bank.bank_name}${bank.city ? ` - ${bank.city}` : ''}${bank.state ? `, ${bank.state}` : ''}`,
        }));
        setBankOptions(options);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load banks";
      showToastMessage(errorMessage, "error");
    } finally {
      setLoadingBanks(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Bank Details
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus size={16} />}
          onClick={() =>
            push({
              bank_id: "",
              account_holder_name: "",
              account_number: "",
              ifsc_code: "",
              branch_name: "",
              is_primary: false,
              is_active: true,
            })
          }
        >
          Add Bank Account
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {values.bank_details.map((bank, index) => (
        <Box key={index} sx={{ mb: 4, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Bank Account {index + 1}
            </Typography>
            {values.bank_details.length > 1 && (
              <IconButton size="small" onClick={() => remove(index)} color="error">
                <Trash2 size={16} />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={3} component="div">
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdown
                name={`bank_details[${index}].bank_id`}
                label="Bank Name*"
                options={bankOptions}
                disabled={loadingBanks}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput 
                name={`bank_details[${index}].account_holder_name`} 
                label="Account Holder Name*" 
                fullWidth 
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput 
                name={`bank_details[${index}].account_number`} 
                label="Account Number*" 
                fullWidth 
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput 
                name={`bank_details[${index}].ifsc_code`} 
                label="IFSC Code" 
                fullWidth 
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBInput 
                name={`bank_details[${index}].branch_name`} 
                label="Branch Name" 
                fullWidth 
              />
            </Grid>          </Grid>
        </Box>
      ))}
    </Box>
  );
};