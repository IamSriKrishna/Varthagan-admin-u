import { SxProps, Theme } from "@mui/material";

export const noPrintBox: SxProps<Theme> = {
  "@media print": {
    display: "none !important",
  },
};
export const TransactionTitle: SxProps<Theme> = {
  bgcolor: "white",
  p: 1,
  borderRadius: 1,
  border: "1px solid #e0e0e0",
  wordBreak: "break-all",
};
