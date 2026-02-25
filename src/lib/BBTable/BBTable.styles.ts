import { SxProps, Theme } from "@mui/material";

export const mainBox: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 2,
};
export const BBButtonColumn: SxProps<Theme> = {
  borderColor: "#ccc",
  color: "grey.700",
  fontSize: "0.875rem",
  paddingX: 1.5,
  paddingY: 0.75,
  minWidth: 100,
  height: "39px",
  "&:hover": {
    borderColor: "#000",
  },
};
export const BBFotterBox: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  px: 2,
  py: 1,
};
