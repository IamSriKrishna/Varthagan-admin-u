// profileStyles.ts
import { SxProps, Theme } from "@mui/material";

export const containerBox: SxProps<Theme> = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  p: { xs: 2, sm: 3, md: 4 },
  borderRadius: 2,
};

export const profileCard: SxProps<Theme> = {
  borderRadius: 4,
  mb: 4,
  overflow: "hidden",
  boxShadow: "0 20px 48px rgba(0,0,0,0.12)",
  border: "1px solid rgba(255,255,255,0.7)",
};

export const avatarStyle: SxProps<Theme> = {
  width: { xs: 110, md: 130 },
  height: { xs: 110, md: 130 },
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  fontSize: "3rem",
  fontWeight: 800,
  border: "6px solid white",
  boxShadow: "0 16px 40px rgba(102, 126, 234, 0.5)",
};
export const statusDotActive: SxProps<Theme> = {
  position: "absolute",
  bottom: 6,
  right: 6,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "5px solid white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  backgroundColor: "#10b981",
};

export const statusDotInactive: SxProps<Theme> = {
  position: "absolute",
  bottom: 6,
  right: 6,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "5px solid white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  backgroundColor: "#ef4444",
};

export const statusDot = (color: string): SxProps<Theme> => ({
  position: "absolute",
  bottom: 6,
  right: 6,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "5px solid white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  backgroundColor: color,
});

export const headerText: SxProps<Theme> = {
  fontWeight: 800,
  color: "#0f172a",
  fontSize: { xs: "1.6rem", md: "2.1rem" },
};
export const partnerChip: SxProps<Theme> = {
  bgcolor: "#fef3c7",
  color: "#b45309",
  border: "1px solid #fde68a",
  fontWeight: 700,
  height: 26,
};
export const emailText: SxProps<Theme> = {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const notificationMainBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: { xs: 1.5, sm: 2 },
};
