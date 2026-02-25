import BBButton from "@/lib/BBButton/BBButton"; // adjust path if needed
import { Box, Popover, Stack, Typography } from "@mui/material";
import React from "react";

interface ConfirmPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const BBPopover: React.FC<ConfirmPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onConfirm,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disablePortal
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      PaperProps={{
        sx: {
          mt: -1,
          boxShadow: 3,
          borderRadius: 2,
        },
      }}
    >
      <Box p={2}>
        <Typography variant="body2" mb={1}>
          {message}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <BBButton size="small" onClick={onClose}>
            {cancelText}
          </BBButton>
          <BBButton size="small" variant="contained" onClick={onConfirm}>
            {confirmText}
          </BBButton>
        </Stack>
      </Box>
    </Popover>
  );
};

export default BBPopover;
