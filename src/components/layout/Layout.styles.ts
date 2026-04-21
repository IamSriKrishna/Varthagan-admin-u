import { SxProps, Theme } from "@mui/material";

export const mainLayoutBox: SxProps<Theme> = {
  flexGrow: 1,
  p: 3,
  width: "100%",
  minHeight: "calc(100vh - 64px)",
  overflow: "auto",
  backgroundColor: "#F5F5F5",
};
export const overlayTextStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
  color: "#764ba2",
  fontSize: {
    xs: "1.1rem",
    sm: "1.4rem",
    md: "1.9rem",
    lg: "2.2rem",
    xl: "2.4rem",
  },
  fontWeight: 700,
  zIndex: 0,
  textShadow: "0 2px 6px rgba(0,0,0,0.15)",
  animation: "fadeIn 0.4s ease-out",
  overflow: "hidden",
  textAlign: "center",
  px: 2,
};

export const arrowStyle = (drawerVisible: boolean) => ({
  position: "absolute",
  animation: "arrowBounce 1.4s infinite ease-in-out",
  filter: "drop-shadow(0px 0px 4px rgba(118,75,162,0.4))",
  zIndex: 1600,

  top: {
    xs: drawerVisible ? "auto" : 60,
    sm: drawerVisible ? "auto" : 80,
    md: 70,
    lg: 65,
  },

  bottom: {
    xs: drawerVisible ? 10 : "auto",
    sm: drawerVisible ? 10 : "auto",
    md: "auto",
    lg: "auto",
  },

  left: {
    xs: drawerVisible ? 220 : 35,
    sm: drawerVisible ? 220 : 60,
    md: "auto",
    lg: "auto",
  },

  right: {
    xs: "auto",
    sm: "auto",
    md: 220,
    lg: 250,
  },

  transform: {
    xs: drawerVisible ? "rotate(90deg)" : "rotate(90deg)",
    sm: drawerVisible ? "rotate(90deg)" : "rotate(90deg)",
    md: "rotate(180deg)",
    lg: "rotate(180deg)",
  },
});
