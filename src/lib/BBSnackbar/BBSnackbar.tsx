"use client";

import React from "react";
import { Snackbar, Alert, AlertColor, SnackbarOrigin } from "@mui/material";

export interface BBSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  variant?: AlertColor; // "success" | "error" | "info" | "warning"
  autoHideDuration?: number;
  anchorOrigin?: SnackbarOrigin;
}

const BBSnackbar: React.FC<BBSnackbarProps> = ({
  open,
  message,
  onClose,
  variant = "info",
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "top", horizontal: "right" },
}) => {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose} anchorOrigin={anchorOrigin}>
      <Alert onClose={onClose} severity={variant} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default BBSnackbar;
