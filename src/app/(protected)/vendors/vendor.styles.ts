import { SxProps, Theme } from "@mui/material";

export const getOwnerBadge = (): SxProps<Theme> => ({
  width: "91px",
  height: "24px",
  minWidth: "24px",
  backgroundColor: "#FFB40029",
  borderRadius: "999px",
  px: 1.5,
  py: "2px",
  gap: "4px",
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  textTransform: "capitalize",
  color: "#000",
});
