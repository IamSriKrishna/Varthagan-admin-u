import { SxProps, Theme } from "@mui/material";

// Root Paper with hover & radial background
export const statCardRoot = (color: string, bgGradient: string): SxProps<Theme> => ({
  background: bgGradient,
  borderRadius: 3,
  p: 3,
  height: "100%",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid rgba(255,255,255,0.9)",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: `0 24px 48px -12px ${color}40`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
    borderRadius: "50%",
  },
});

// Icon container (top left)
export const statCardIconBox = (color: string): SxProps<Theme> => ({
  width: 56,
  height: 56,
  borderRadius: 3,
  bgcolor: `${color}20`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 8px 24px ${color}30`,
});

// Label (uppercase text above value)
export const statCardLabel: SxProps<Theme> = {
  color: "#64748b",
  mb: 0.5,
  fontWeight: 700,
  textTransform: "uppercase",
  fontSize: "0.75rem",
  letterSpacing: "1px",
};

// Value (big number)
export const statCardValue = (color: string): SxProps<Theme> => ({
  fontWeight: 800,
  color,
  fontSize: "2rem",
  lineHeight: 1.2,
});

// Trend Chip (top right)
export const statCardTrend: SxProps<Theme> = {
  bgcolor: "#10b98125",
  color: "#10b981",
  fontWeight: 700,
  fontSize: "0.7rem",
  height: 26,
  borderRadius: 1.5,
  border: "1px solid #10b98140",
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  px: 1,
};
