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
  borderRadius: "9px",
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

export const inputSx: SxProps<Theme> = {
  borderRadius: "9px",
  "& input": {
    paddingTop: "8.5px",
    paddingBottom: "8.5px",
    fontSize: "16px",
    textTransform: "capitalize",
    "&::placeholder": {
      color: "#000000",
      opacity: 1,
    },
  },
};

export const paperSx: SxProps<Theme> = {
  textTransform: "capitalize",
  borderRadius: "9px",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  color: "#0C1421",
  // minWidth: "fit-content",
  // maxWidth: "500px",
};
