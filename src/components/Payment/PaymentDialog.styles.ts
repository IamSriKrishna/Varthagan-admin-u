import { SxProps, Theme } from "@mui/material";

export const orderDetailRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  mb: 1,
};

export const totalAmountRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const paymentMethodBox: SxProps<Theme> = {
  display: "flex",
  gap: 2,
  mb: 3,
};

export const paymentCard: SxProps<Theme> = {
  flex: 1,
  cursor: "pointer",
  border: "2px solid transparent",
  "&:hover": {
    bgcolor: "action.hover",
    borderColor: "primary.main",
  },
};

export const paymentCardContent: SxProps<Theme> = {
  textAlign: "center",
  py: 3,
};

export const completeWorkBox: SxProps<Theme> = {
  textAlign: "center",
  mb: 3,
};

export const alertRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};
