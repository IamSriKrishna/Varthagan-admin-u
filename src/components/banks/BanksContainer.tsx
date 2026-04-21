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
  TextField,
  Stack,
} from "@mui/material";
import { Plus as PlusIcon, X as CloseIcon, Landmark } from "lucide-react";
import BanksTable from "./BanksTable";
import { Bank, BankResponse } from "@/models/bank.model";
import { bankService } from "@/lib/api/bankService";
import { showToastMessage } from "@/utils/toastUtil";

export default function BanksContainer() {
  const [view, setView] = useState<"list" | "form">("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_active: true,
  });

  useEffect(() => {
    if (isEditing && selectedBankId && !selectedBank) {
      fetchBankData();
    }
  }, [isEditing, selectedBankId, selectedBank]);

  const fetchBankData = async () => {
    if (!selectedBankId) return;
    try {
      setLoadingBank(true);
      const response = await bankService.getBank(selectedBankId);
      setSelectedBank(response.data);
      // Populate form with bank data
      setFormData({
        bank_name: response.data.bank_name,
        address: response.data.address || "",
        city: response.data.city || "",
        state: response.data.state || "",
        postal_code: response.data.postal_code || "",
        country: response.data.country || "",
        is_active: response.data.is_active ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch bank details:", error);
      showToastMessage("Failed to fetch bank details", "error");
    } finally {
      setLoadingBank(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedBank(null);
    setSelectedBankId(null);
    setIsEditing(false);
    setFormData({
      bank_name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_active: true,
    });
    setView("form");
  };

  const handleFormClose = () => {
    setView("list");
    setSelectedBank(null);
    setSelectedBankId(null);
    setIsEditing(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditClick = (bank: Bank) => {
    setSelectedBankId(bank.id);
    setSelectedBank(null);
    setIsEditing(true);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!formData.bank_name.trim()) {
      showToastMessage("Bank name is required", "error");
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing && selectedBankId) {
        await bankService.updateBank(selectedBankId, formData);
        showToastMessage("Bank updated successfully", "success");
      } else {
        await bankService.createBank(formData);
        showToastMessage("Bank created successfully", "success");
      }
      handleFormClose();
    } catch (error: any) {
      console.error("Error saving bank:", error);
      showToastMessage(
        error?.message || "Failed to save bank",
        "error"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                  <Landmark size={24} color="white" />
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
                    Bank Management
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
                    Manage your bank accounts and banking details
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
                New Bank
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

            <BanksTable
              onEdit={handleEditClick}
              onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
              refreshTrigger={refreshTrigger}
            />
          </Box>
        ) : (
          <Dialog
            open={view === "form"}
            onClose={handleFormClose}
            maxWidth="sm"
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
                  <Landmark size={17} color="white" />
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
                  {isEditing ? "Edit Bank" : "Create New Bank"}
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
              {loadingBank ? (
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
                    Loading bank details…
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3} sx={{ pt: 2 }}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    required
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange("bank_name", e.target.value)}
                    placeholder="Enter bank name"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter address"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    placeholder="Enter postal code"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Enter country"
                    size="small"
                  />
                </Stack>
              )}
            </DialogContent>

            {/* Dialog Actions */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid #f0f0f5",
                display: "flex",
                gap: 1.5,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleFormClose}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={formLoading}
                sx={{
                  background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)",
                  },
                }}
              >
                {formLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : isEditing ? (
                  "Update Bank"
                ) : (
                  "Create Bank"
                )}
              </Button>
            </Box>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}
