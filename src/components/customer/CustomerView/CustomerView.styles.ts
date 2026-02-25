import { SxProps, Theme } from "@mui/material";

export const wrapper: SxProps<Theme> = {
  bgcolor: "#f5f7fa",
  minHeight: "100vh",
};

export const headerBanner: SxProps<Theme> = {
  position: "relative",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: 2,
  mb: { xs: 2, sm: 3 },
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
    pointerEvents: "none",
  },
};

export const headerContainer: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: { xs: 2, sm: 2.5 },
  p: { xs: 2, sm: 2.5, md: 3 },
  zIndex: 1,
};

export const avatarWrapper: SxProps<Theme> = {
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: -4,
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "50%",
    zIndex: -1,
  },
};

export const avatar: SxProps<Theme> = {
  width: { xs: 56, sm: 64 },
  height: { xs: 56, sm: 64 },
  bgcolor: "rgba(255, 255, 255, 0.9)",
  color: "#667eea",
  fontSize: { xs: "1.5rem", sm: "1.75rem" },
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

export const infoSection: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

export const nameText: SxProps<Theme> = {
  fontSize: { xs: "1.25rem", sm: "1.5rem" },
  fontWeight: 600,
  color: "white",
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
};

export const statusBadge: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  px: 1.5,
  py: 0.5,
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "white",
  width: "fit-content",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

export const statusDot = (type: string): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: type === "active" ? "#4ade80" : "#fbbf24",
  boxShadow: type === "active" ? "0 0 8px rgba(74, 222, 128, 0.6)" : "0 0 8px rgba(251, 191, 36, 0.6)",
});
export const card: SxProps<Theme> = {
  borderRadius: { xs: 2, sm: 3 },
  height: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  },
};

export const cardContent: SxProps<Theme> = {
  p: { xs: 2, sm: 2.5, md: 3 },
};

export const sectionHeading: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
  mb: { xs: 2, sm: 2.5, md: 3 },
  fontWeight: 700,
};

export const notificationBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  p: { xs: 1.5, sm: 2 },
  bgcolor: "#f5f5f5",
  borderRadius: 2,
  transition: "background-color 0.2s",
  "&:hover": {
    bgcolor: "#eeeeee",
  },
};

export const notificationText: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1.5, sm: 2 },
  fontWeight: 500,
  fontSize: { xs: "0.875rem", sm: "1rem" },
};
