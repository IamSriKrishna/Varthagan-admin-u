"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Plus as PlusIcon, X as CloseIcon } from "lucide-react";
import CompaniesTable from "./CompaniesTable";
import CompanySetupWizard from "./CompanySetupWizard";
import { CompanyData, companyApi } from "@/lib/api/companyApi";

export default function CompanySettingsContainer() {
  const [view, setView] = useState<"list" | "form">("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Fetch fresh company data when in edit mode
  useEffect(() => {
    if (isEditing && selectedCompanyId && !selectedCompany) {
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
    // Trigger refresh of the table
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditClick = (company: CompanyData) => {
    setSelectedCompanyId(company.company.id);
    setSelectedCompany(null); // Will be fetched via API
    setIsEditing(true);
    setView("form");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {view === "list" ? (
        <Box>
          {/* Header with Title and Create Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Company Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage and organize all your company information and settings
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlusIcon size={20} />}
              onClick={handleCreateClick}
              sx={{
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Create Company
            </Button>
          </Box>

          {/* Companies Table */}
          <CompaniesTable
            onEdit={handleEditClick}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
            refreshTrigger={refreshTrigger}
          />
        </Box>
      ) : (
        <Dialog
          open={view === "form"}
          onClose={handleFormClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              backgroundImage: "none",
            },
          }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              {isEditing ? "Edit Company" : "Create New Company"}
            </Typography>
            <IconButton
              onClick={handleFormClose}
              sx={{ color: "text.secondary" }}
              size="small"
            >
              <CloseIcon size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {isEditing && loadingCompany ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
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
      )}
    </Container>
  );
}
