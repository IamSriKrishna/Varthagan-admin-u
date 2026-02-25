"use client";

import { Box, Dialog, DialogActions, DialogContent, DialogProps, Divider, IconButton } from "@mui/material";
import { X } from "lucide-react";
import React from "react";
import BBButton from "../BBButton/BBButton";
import BBTitle from "../BBTitle/BBTitle";

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
      sx={{ borderRadius: "12px" }}
    >
      {title && (
        <Box sx={{ px: 3, pt: 3 }}>
          <BBTitle
            title={title}
            subtitle={subtitle}
            rightContent={
              <IconButton onClick={onClose} aria-label="close">
                <X size={20} />
              </IconButton>
            }
          />
        </Box>
      )}
      <Divider sx={{ margin: 0 }} />
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {content}
      </DialogContent>

      {!hideActions && (
        <DialogActions sx={{ pb: 2 }}>
          {actions ? (
            actions
          ) : (
            <>
              {!HideCancelButton && (
                <BBButton onClick={onClose} disabled={loading} variant="outlined">
                  {cancelText}
                </BBButton>
              )}

              {onConfirm && (
                <BBButton onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading || disabled}>
                  {loading ? "Processing..." : confirmText}
                </BBButton>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BBDialog;
