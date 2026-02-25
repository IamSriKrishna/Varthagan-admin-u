import { SxProps, Theme } from "@mui/material";

export const bbDropdownLabelSx: SxProps<Theme> = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "160%",
  letterSpacing: "0.01em",
  color: "#0C1421",
  verticalAlign: "middle",
};

export const bbDropdownSelectSx: SxProps<Theme> = {
  borderRadius: "8px",
  "& .MuiSelect-select": {
    paddingTop: "7px",
    paddingBottom: "7px",
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "160%",
    letterSpacing: "0.01em",
    verticalAlign: "middle",
    color: "#0C1421",
  },
};
