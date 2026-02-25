import { SxProps, Theme } from "@mui/material";

export const brandLogoContainer: SxProps<Theme> = (theme) => ({
  width: 44,
  height: 44,
  borderRadius: 2,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "3px solid",
  borderColor: theme.palette.primary.main,
  transition: "opacity 0.3s ease",
});

export const brandLogoText: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "18px",
  whiteSpace: "nowrap",
};

export const toggleIconButton: SxProps<Theme> = {
  position: "absolute",
  left: 0,
  top: "10%",
  transform: "translateY(-50%) translateX(5px)",
  opacity: 0,
  transition: "opacity 0.3s ease, transform 0.3s ease",
  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
};
