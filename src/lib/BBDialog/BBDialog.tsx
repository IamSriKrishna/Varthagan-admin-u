"use client";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import React from "react";
import BBButton from "../BBButton/BBButton";

interface BBDialogProps {
  open: boolean;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  content?: string | React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  HideCancelButton?: boolean;
  hideActions?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  disabled?: boolean;
  actions?: string | React.ReactNode;
  confirmColor?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
}

const BBDialog: React.FC<BBDialogProps> = ({
  open,
  title,
  subtitle,
  content,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  hideActions = false,
  maxWidth = "xs",
  confirmColor = "primary",
  disabled,
  actions,
  HideCancelButton,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="bb-dialog-title"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 20px 60px rgba(15,23,42,0.10), 0 4px 16px rgba(15,23,42,0.06)",
          overflow: "hidden",
          backdropFilter: "blur(2px)",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(15,23,42,0.30)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      {/* Header */}
      {title && (
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 4,
                minHeight: subtitle ? 44 : 28,
                borderRadius: "4px",
                background: "linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)",
                flexShrink: 0,
                mt: 0.2,
              }}
            />
            <Box>
              <Typography
                id="bb-dialog-title"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mt: 0.4,
                    fontSize: "0.8rem",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="close"
            size="small"
            sx={{
              color: "#94a3b8",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              width: 32,
              height: 32,
              flexShrink: 0,
              transition: "all 0.15s ease",
              "&:hover": {
                color: "#0f172a",
                borderColor: "#cbd5e1",
                backgroundColor: "#f1f5f9",
                transform: "scale(1.05)",
              },
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ borderColor: "#e2e8f0" }} />

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3, md: 4 },
          py: { xs: 2, sm: 2.5, md: 3 },
          background: "#ffffff",
        }}
      >
        {content}
      </DialogContent>

      {!hideActions && (
        <>
          <Divider sx={{ borderColor: "#f1f5f9" }} />
          <DialogActions
            sx={{
              px: 3,
              py: 2,
              gap: 1,
              background: "#f8fafc",
              justifyContent: "flex-end",
            }}
          >
            {actions ? (
              actions
            ) : (
              <>
                {!HideCancelButton && (
                  <BBButton
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      borderColor: "#e2e8f0",
                      color: "#475569",
                      fontWeight: 500,
                      borderRadius: "8px",
                      textTransform: "none",
                      px: 2.5,
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    {cancelText}
                  </BBButton>
                )}

                {onConfirm && (
                  <BBButton
                    onClick={onConfirm}
                    color={confirmColor}
                    variant="contained"
                    disabled={loading || disabled}
                    sx={{
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      px: 2.5,
                      boxShadow: "none",
                      "&:hover": { boxShadow: "0 4px 12px rgba(59,130,246,0.3)" },
                    }}
                  >
                    {loading ? "Processing…" : confirmText}
                  </BBButton>
                )}
              </>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default BBDialog;