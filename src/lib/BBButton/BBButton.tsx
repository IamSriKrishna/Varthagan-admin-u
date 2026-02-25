"use client";

import { Button, CircularProgress, ButtonProps, Box } from "@mui/material";
import React from "react";
import { gradients } from "@/styles/gradients";

interface BBButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
}

const BBButton: React.FC<BBButtonProps> = ({
  loading = false,
  children,
  disabled,
  startIcon,
  variant = "contained",
  sx = {},
  ...props
}) => {
  const isDisabled = loading || disabled;

  const getButtonStyles = () => {
    if (variant == "contained") {
      return {
        background: isDisabled ? "#bdbdbd" : gradients.primary,
        color: "#fff",
        "&:hover": {
          background: isDisabled ? "#bdbdbd" : gradients.primary,
          opacity: 0.9,
        },
      };
    }

    if (variant == "outlined") {
      return {
        border: `1px solid ${isDisabled ? "#bdbdbd" : "#764ba2"}`,
        color: isDisabled ? "#9e9e9e" : "#764ba2",
        background: "#fff",
        "&:hover": {
          background: "#f9f9f9",
        },
      };
    }

    return {
      color: isDisabled ? "#9e9e9e" : "#764ba2",
      "&:hover": {
        background: "rgba(118, 75, 162, 0.04)",
      },
    };
  };

  return (
    <Button
      disabled={isDisabled}
      variant={variant}
      startIcon={!loading && startIcon}
      sx={{
        borderRadius: "8px",
        textTransform: "none",
        ...getButtonStyles(),
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} color="inherit" />
          {children}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

export default BBButton;
