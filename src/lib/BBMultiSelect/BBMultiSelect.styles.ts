import { SxProps, Theme } from "@mui/material";

export const tagChip: SxProps<Theme> = {
  textTransform: "capitalize",
  borderRadius: "8px",
};

export const inputSx: SxProps<Theme> = {
  borderRadius: "8px",
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
  borderRadius: "8px",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  color: "#0C1421",
};
