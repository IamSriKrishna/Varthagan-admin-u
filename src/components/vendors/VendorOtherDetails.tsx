
import { useState, ChangeEvent } from "react";
import {
  Grid,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
} from "@mui/material";
import { Upload } from "lucide-react";
import { BBDropdown, BBInput } from "@/lib";
import {
  CURRENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  TDS_OPTIONS,
} from "@/constants/vendor.constants";

export const VendorOtherDetails: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Check file count limit
      if (uploadedFiles.length + newFiles.length > 10) {
        alert("Maximum 10 files allowed");
        return;
      }
      
      // Check file size limit (10MB each)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        alert("Files must be less than 10MB each");
        return;
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
          <FormControlLabel
            control={
              <Checkbox name="other_details.is_msme_registered" />
            }
            label="This vendor is MSME registered"
          />
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
          <BBDropdown 
            name="other_details.tds" 
            label="TDS" 
            options={TDS_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <FormControlLabel
            control={
              <Checkbox name="other_details.enable_portal" />
            }
            label="Allow portal access for this vendor"
          />
        </Grid>
        
        <Grid size={{ xs: 12 }} component="div">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Documents
          </Typography>
          
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            startIcon={<Upload size={16} />}
            onClick={() => document.getElementById('file-upload')?.click()}
            sx={{ mt: 1 }}
          >
            Upload File
          </Button>
          
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Uploaded Files:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Typography variant="body2">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            You can upload a maximum of 10 files, 10MB each
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput 
            name="other_details.website_url" 
            label="Website URL" 
            placeholder="ex: www.zylker.com"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.department" label="Department" fullWidth />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput name="other_details.designation" label="Designation" fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput 
            name="other_details.twitter" 
            label="Twitter" 
            placeholder="https://x.com/"
            fullWidth
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput 
            name="other_details.skype_name" 
            label="Skype Name/Number" 
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <BBInput 
            name="other_details.facebook" 
            label="Facebook" 
            placeholder="http://www.facebook.com/"
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
};