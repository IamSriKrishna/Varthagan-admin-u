import { SxProps, Theme } from "@mui/material";

export const loginContainer: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  width: "100%",
  height: "90vh",
  mx: "auto",
};
export const loginFormContainerBox: SxProps<Theme> = {
  flex: 1,
  px: { xs: 3, md: 6 },
  py: { xs: 4, md: 0 },
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: { xs: "auto", md: "90vh" },
};

export const loginFormBox: SxProps<Theme> = {
  width: "100%",
  maxWidth: 460,
};

export const loginImageBox: SxProps<Theme> = {
  flex: 1,
  display: { xs: "none", md: "flex" },
  justifyContent: "center",
  alignItems: "center",
  minHeight: "90vh",
};
export const textTypography: SxProps<Theme> = {
  color: "text.primary",
  fontWeight: 600,
  fontSize: 36,
  fontFamily: `"SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
};
export const textParagraph: SxProps<Theme> = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: "19px",
  lineHeight: "160%",
  letterSpacing: "0.01em",
  color: "#313957",
  verticalAlign: "middle",
  mb: 3,
};
export const textForgotPassword: SxProps<Theme> = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "160%",
  letterSpacing: "0.01em",
  verticalAlign: "middle",
};
