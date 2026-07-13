"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Building2, Plus, X } from "lucide-react";
import CompaniesTable from "./CompaniesTable";
import CompanySetupWizard from "./CompanySetupWizard";
import { CompanyData, companyApi } from "@/lib/api/companyApi";

export default function CompanySettingsContainer() {
  const [view, setView] = useState<"list" | "form">("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyData | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const shouldFetchCompanyDetails = (company: CompanyData | null) => {
    return (
      !company ||
      !company.invoice_settings ||
      !company.tax_settings ||
      !company.regional_settings
    );
  };

  useEffect(() => {
    if (
      isEditing &&
      selectedCompanyId &&
      shouldFetchCompanyDetails(selectedCompany)
    ) {
      fetchCompanyData();
    }
  }, [isEditing, selectedCompanyId, selectedCompany]);

  const fetchCompanyData = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoadingCompany(true);
      const response = await companyApi.getCompanyById(selectedCompanyId);
      setSelectedCompany(response.company);
    } catch (error) {
      console.error("Failed to fetch company details:", error);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedCompany(null);
    setSelectedCompanyId(null);
    setIsEditing(false);
    setView("form");
  };

  const handleFormClose = () => {
    setView("list");
    setSelectedCompany(null);
    setSelectedCompanyId(null);
    setIsEditing(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditClick = (company: CompanyData) => {
    setSelectedCompanyId(company.company.id);
    setSelectedCompany(company);
    setIsEditing(true);
    setView("form");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f0f0f5",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(14,165,233,0.3)",
                flexShrink: 0,
              }}
            >
              <Building2 size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.15,
                }}
              >
                Company Settings
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Manage company profiles, tax details, and configurations
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleCreateClick}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                boxShadow: "0 6px 20px rgba(14,165,233,0.45)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Add Company
          </Button>
        </Stack>
      </Box>

      {/* Company table */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          mb: 3,
          borderRadius: "14px",
          border: "1px solid #eeeff5",
          bgcolor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          "& .MuiTableHead-root .MuiTableCell-root": {
            bgcolor: "#f8fbff",
            color: "#6b7280",
            fontWeight: 600,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontFamily: "'DM Sans', sans-serif",
            borderBottom: "1px solid #eeeff5",
            py: 1.5,
          },
          "& .MuiTableBody-root .MuiTableRow-root": {
            transition: "background 0.12s ease",
            "&:hover": {
              bgcolor: "#f8fbff",
            },
          },
          "& .MuiTableBody-root .MuiTableCell-root": {
            borderBottom: "1px solid #f5f5fa",
            py: 1.5,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            color: "#374151",
          },
          "& .MuiTablePagination-root": {
            fontFamily: "'DM Sans', sans-serif",
            color: "#6b7280",
          },
        }}
      >
        <CompaniesTable
          onEdit={handleEditClick}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          refreshTrigger={refreshTrigger}
        />
      </Box>

      {/* Create/Edit dialog */}
      <Dialog
        open={view === "form"}
        onClose={loadingCompany ? undefined : handleFormClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            bgcolor: "#ffffff",
            backgroundImage: "none",
            boxShadow: "0 24px 80px rgba(0,0,0,0.14)",
            border: "1px solid #eeeff5",
            overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background:
              "linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)",
          }}
        />

        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2.25,
            borderBottom: "1px solid #f0f0f5",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(14,165,233,0.25)",
              }}
            >
              <Building2 size={17} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isEditing ? "Edit Company" : "Add Company"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isEditing
                  ? "Update company profile and configuration details"
                  : "Create a new company profile and configuration"}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleFormClose}
            disabled={loadingCompany}
            size="small"
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              color: "#9ca3af",
              bgcolor: "#f3f4f6",
              "&:hover": {
                bgcolor: "#fee2e2",
                color: "#ef4444",
              },
              transition: "all 0.15s ease",
            }}
          >
            <X size={15} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            py: 3,
            bgcolor: "#ffffff",
            "& .MuiTypography-root": {
              fontFamily: "'DM Sans', sans-serif",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
            "& .MuiButton-root": {
              borderRadius: "10px",
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            },
          }}
        >
          {isEditing && loadingCompany ? (
            <Box
              sx={{
                minHeight: 340,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress size={34} sx={{ color: "#0ea5e9" }} />

              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loading company details…
              </Typography>
            </Box>
          ) : (
            <CompanySetupWizard
              company={selectedCompany}
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}