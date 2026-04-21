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
import { Plus as PlusIcon, X as CloseIcon, Building2 } from "lucide-react";
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
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditClick = (company: CompanyData) => {
    setSelectedCompanyId(company.company.id);
    setSelectedCompany(null);
    setIsEditing(true);
    setView("form");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {view === "list" ? (
          <Box>
            {/* Page Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mb: 5,
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
                {/* Icon Badge */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(79, 99, 210, 0.28)",
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  <Building2 size={24} color="white" />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                      lineHeight: 1.2,
                      color: "#1a1d2e",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Company Settings
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      mt: 0.5,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    Manage your company profiles, tax details, and configurations
                  </Typography>
                </Box>
              </Box>

              {/* Create Button */}
              <Button
                variant="contained"
                startIcon={<PlusIcon size={18} />}
                onClick={handleCreateClick}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 16px rgba(79, 99, 210, 0.35)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  letterSpacing: "0",
                  "&:hover": {
                    background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)",
                    boxShadow: "0 6px 22px rgba(79, 99, 210, 0.45)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                New Company
              </Button>
            </Box>

            {/* Thin accent rule below header */}
            <Box
              sx={{
                height: "1px",
                background: "linear-gradient(90deg, rgba(79,99,210,0.3) 0%, transparent 80%)",
                mb: 4,
              }}
            />

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
                borderRadius: "20px",
                backgroundImage: "none",
                backgroundColor: "#ffffff",
                boxShadow: "0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                overflow: "hidden",
              },
            }}
          >
            {/* Dialog Header with gradient strip */}
            <Box
              sx={{
                height: "4px",
                background: "linear-gradient(90deg, #4f63d2 0%, #7c3aed 100%)",
              }}
            />
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 3,
                pt: 2.5,
                pb: 1.5,
                borderBottom: "1px solid #f0f0f5",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={17} color="white" />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#1a1d2e",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {isEditing ? "Edit Company" : "Create New Company"}
                </Typography>
              </Box>

              <IconButton
                onClick={handleFormClose}
                size="small"
                sx={{
                  color: "#9ca3af",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  width: 30,
                  height: 30,
                  "&:hover": {
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <CloseIcon size={16} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
              {isEditing && loadingCompany ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 8,
                    gap: 2,
                  }}
                >
                  <CircularProgress
                    size={36}
                    sx={{
                      color: "#4f63d2",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
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
        )}
      </Container>
    </Box>
  );
}