"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { X as CloseIcon } from "lucide-react";
import { CompanyData, companyApi } from "@/lib/api/companyApi";

interface CompanyDetailsModalProps {
  open: boolean;
  companyId?: number;
  onClose: () => void;
  onEdit?: (company: CompanyData) => void;
  onDelete?: (companyId: number) => void;
  initialData?: CompanyData;
}

export default function CompanyDetailsModal({
  open,
  companyId,
  onClose,
  onEdit,
  onDelete,
  initialData,
}: CompanyDetailsModalProps) {
  const [company, setCompany] = useState<CompanyData | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && companyId && !initialData) {
      fetchCompanyDetails();
    } else if (initialData) {
      setCompany(initialData);
    }
  }, [open, companyId, initialData]);

  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.getCompanyById(companyId);
      setCompany(response.company);
    } catch (err: any) {
      const errorMessage =
        err.message ||
        err.response?.data?.error ||
        "Failed to fetch company details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!company && loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Company Details</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Company Details</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Company Info */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
              Company Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Company Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.company.company_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Business Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.company.business_type?.type_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  GST Number
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.company.gst_number || "Not provided"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  PAN Number
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.company.pan_number || "Not provided"}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Contact Info */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
              Contact Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Mobile
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.contact.mobile}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Alternate Mobile
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.contact.alternate_mobile || "Not provided"}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <Typography variant="caption" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.contact.email}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Address Info */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
              Address
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <Typography variant="caption" color="textSecondary">
                  Address Line 1
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.address.address_line1}
                </Typography>
              </Box>
              {company.address.address_line2 && (
                <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                  <Typography variant="caption" color="textSecondary">
                    Address Line 2
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.address.address_line2}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="textSecondary">
                  City
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.address.city}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  State
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.address.state?.state_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Country
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.address.country?.country_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Pincode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {company.address.pincode}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Bank Details */}
          {company.bank_details && company.bank_details.length > 0 && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                Bank Details
              </Typography>
              {company.bank_details.map((bank, idx) => (
                <Box key={idx} sx={{ mb: idx < company.bank_details!.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Bank Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bank.bank_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Account Holder
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bank.account_holder_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Account Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bank.account_number}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        IFSC Code
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bank.ifsc_code}
                      </Typography>
                    </Box>
                    {bank.is_primary && (
                      <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                        <Chip label="Primary Account" color="primary" size="small" />
                      </Box>
                    )}
                  </Box>
                  {idx < company.bank_details!.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Paper>
          )}

          {/* UPI Details */}
          {company.upi_details && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                UPI Details
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    UPI ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.upi_details.upi_id}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Tax Settings */}
          {company.tax_settings && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                Tax Settings
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    GST Enabled
                  </Typography>
                  <Chip
                    label={company.tax_settings.gst_enabled ? "Yes" : "No"}
                    color={company.tax_settings.gst_enabled ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Tax Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.tax_settings.tax_type?.tax_name}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button
            onClick={() => onEdit(company)}
            variant="contained"
            color="primary"
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={() => onDelete(company.company.id)}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
