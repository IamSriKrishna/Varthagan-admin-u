import { SxProps, Theme } from "@mui/material";

export const sectionCardRoot: SxProps<Theme> = {
  borderRadius: 3,
  height: "100%",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.05)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    transform: "translateY(-4px)",
  },
};

export const sectionCardHeader = (gradient: string): SxProps<Theme> => ({
  background: gradient,
  p: 3,
  display: "flex",
  alignItems: "center",
  gap: 2,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "rgba(255,255,255,0.3)",
  },
});

export const sectionCardIconBox: SxProps<Theme> = {
  width: 48,
  height: 48,
  borderRadius: 2.5,
  bgcolor: "rgba(255,255,255,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
};

export const sectionCardTitle: SxProps<Theme> = {
  fontWeight: 700,
  color: "white",
  letterSpacing: "-0.5px",
  fontSize: "1.1rem",
};

export const sectionCardContent: SxProps<Theme> = {
  p: 2,
};
