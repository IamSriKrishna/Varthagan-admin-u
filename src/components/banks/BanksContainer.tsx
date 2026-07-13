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
  TextField,
  Typography,
} from "@mui/material";
import { Landmark, Plus, X } from "lucide-react";
import BanksTable from "./BanksTable";
import { Bank } from "@/models/bank.model";
import { bankService } from "@/lib/api/bankService";
import { showToastMessage } from "@/utils/toastUtil";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 42,
    borderRadius: "10px",
    bgcolor: "#ffffff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    transition: "all 0.15s ease",
    "& fieldset": {
      borderColor: "#e5e7eb",
    },
    "&:hover fieldset": {
      borderColor: "#c7d2fe",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(14,165,233,0.10)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0ea5e9",
      borderWidth: "1px",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.84rem",
    color: "#6b7280",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#0ea5e9",
  },
  "& .MuiFormHelperText-root": {
    fontFamily: "'DM Sans', sans-serif",
  },
};

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

  const resetForm = () => {
    setFormData({
      bank_name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_active: true,
    });
  };

  const handleCreateClick = () => {
    setSelectedBank(null);
    setSelectedBankId(null);
    setIsEditing(false);
    resetForm();
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
      showToastMessage(error?.message || "Failed to save bank", "error");
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
              <Landmark size={22} color="white" />
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
                Bank Management
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Manage bank accounts and banking details
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
            Add Bank
          </Button>
        </Stack>
      </Box>

      {/* Bank table */}
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
        <BanksTable
          onEdit={handleEditClick}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          refreshTrigger={refreshTrigger}
        />
      </Box>

      {/* Create/Edit dialog */}
      <Dialog
        open={view === "form"}
        onClose={formLoading ? undefined : handleFormClose}
        maxWidth="sm"
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
              <Landmark size={17} color="white" />
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
                {isEditing ? "Edit Bank" : "Add Bank"}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.15,
                }}
              >
                {isEditing
                  ? "Update the selected bank information"
                  : "Enter the new bank information"}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleFormClose}
            disabled={formLoading}
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

        <DialogContent sx={{ px: 3, py: 3 }}>
          {loadingBank ? (
            <Box
              sx={{
                minHeight: 280,
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
                Loading bank details…
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.25}>
              <TextField
                fullWidth
                required
                label="Bank Name"
                value={formData.bank_name}
                onChange={(e) =>
                  handleInputChange("bank_name", e.target.value)
                }
                placeholder="Enter bank name"
                size="small"
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter address"
                size="small"
                multiline
                minRows={2}
                sx={fieldSx}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  size="small"
                  sx={fieldSx}
                />

                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  size="small"
                  sx={fieldSx}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    handleInputChange("postal_code", e.target.value)
                  }
                  placeholder="Enter postal code"
                  size="small"
                  sx={fieldSx}
                />

                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) =>
                    handleInputChange("country", e.target.value)
                  }
                  placeholder="Enter country"
                  size="small"
                  sx={fieldSx}
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #f0f0f5",
            bgcolor: "#fcfcfe",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.25,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleFormClose}
            disabled={formLoading}
            sx={{
              px: 2.25,
              borderRadius: "10px",
              borderColor: "#e2e8f0",
              color: "#475569",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.82rem",
              textTransform: "none",
              "&:hover": {
                borderColor: "#cbd5e1",
                bgcolor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading || loadingBank}
            sx={{
              minWidth: 128,
              px: 2.25,
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.28)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.82rem",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                boxShadow: "0 6px 18px rgba(14,165,233,0.36)",
              },
            }}
          >
            {formLoading ? (
              <CircularProgress size={19} sx={{ color: "#ffffff" }} />
            ) : isEditing ? (
              "Update Bank"
            ) : (
              "Add Bank"
            )}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}