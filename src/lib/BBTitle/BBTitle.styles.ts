import { SxProps, Theme } from "@mui/material";

export const titleTextSx: SxProps<Theme> = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: { xs: "20px", sm: "22px", md: "24px" },
  lineHeight: { xs: "30px", sm: "34px", md: "38px" },
  color: "#2E263DE5",
  verticalAlign: "middle",
};

export const subtitleTextSx: SxProps<Theme> = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: { xs: "13px", sm: "14px", md: "15px" },
  lineHeight: { xs: "18px", sm: "20px", md: "22px" },
  letterSpacing: "0px",
  color: "#2E263DB2",
  verticalAlign: "middle",
};
