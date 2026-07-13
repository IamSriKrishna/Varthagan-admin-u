import { SxProps, Theme } from "@mui/material";

export const SIDEBAR_GRADIENT =
  "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)";

const selectedShadow =
  "0 10px 26px rgba(139, 92, 246, 0.22), 0 4px 12px rgba(34, 211, 238, 0.14)";

export const mainListItemButton: SxProps<Theme> = {
  minHeight: 46,
  height: 46,
  mx: 1.25,
  mb: 0.7,
  px: 1.5,
  py: 1,
  borderRadius: "14px",
  color: "#64748B",

  transition:
    "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",

  "& .MuiListItemIcon-root": {
    minWidth: 40,
    color: "#7C8798",
    transition: "color 0.2s ease",
  },

  "& .MuiListItemText-primary": {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13.5px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },

  "&:hover": {
    background:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.09) 0%, rgba(34, 211, 238, 0.09) 100%)",
    color: "#4C1D95",
    transform: "translateX(2px)",

    "& .MuiListItemIcon-root": {
      color: "#8B5CF6",
    },
  },

  "&.Mui-selected": {
    background: `${SIDEBAR_GRADIENT} !important`,
    color: "#FFFFFF",
    boxShadow: selectedShadow,

    "& .MuiListItemIcon-root": {
      color: "#FFFFFF",
    },

    "& .MuiListItemText-primary": {
      fontWeight: 700,
    },

    "&:hover": {
      background: `${SIDEBAR_GRADIENT} !important`,
      color: "#FFFFFF",
      transform: "translateX(2px)",
      boxShadow:
        "0 14px 32px rgba(139, 92, 246, 0.28), 0 5px 14px rgba(34, 211, 238, 0.18)",
    },
  },
};

export const listItemButton = (
  isSelected: boolean,
): SxProps<Theme> => ({
  minHeight: 42,
  mx: 1.25,
  mb: 0.5,
  px: 1.5,
  borderRadius: "12px",

  background: isSelected
    ? SIDEBAR_GRADIENT
    : "transparent",

  color: isSelected ? "#FFFFFF" : "#64748B",

  transition:
    "all 0.2s ease",

  "& .MuiListItemIcon-root": {
    color: isSelected ? "#FFFFFF" : "#7C8798",
  },

  "&:hover": {
    background: isSelected
      ? SIDEBAR_GRADIENT
      : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.08))",
  },
});

export const listItemText = (
  isSelected: boolean,
): SxProps<Theme> => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: isSelected ? 700 : 500,
  color: isSelected ? "#FFFFFF" : "#64748B",
});

export const SubMainBox: SxProps<Theme> = {
  mx: 1.25,
  mb: 0.45,
  borderRadius: "12px",
  overflow: "hidden",
};

export const subListItemButton = (
  isSelected: boolean,
  drawerOpen: boolean,
): SxProps<Theme> => ({
  minHeight: 40,
  px: 1.4,
  py: 0.7,
  pl: drawerOpen ? 4.5 : 1.5,
  borderRadius: "12px",

  color: isSelected ? "#FFFFFF" : "#7A8494",

  background: isSelected
    ? SIDEBAR_GRADIENT
    : "transparent",

  boxShadow: isSelected
    ? "0 8px 20px rgba(139, 92, 246, 0.18)"
    : "none",

  transition:
    "background 0.2s ease, transform 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",

  "& .MuiListItemIcon-root": {
    color: isSelected ? "#FFFFFF" : "#94A3B8",
  },

  "&:hover": {
    background: isSelected
      ? SIDEBAR_GRADIENT
      : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.08))",

    color: isSelected ? "#FFFFFF" : "#6D28D9",
    transform: "translateX(2px)",

    "& .MuiListItemIcon-root": {
      color: isSelected ? "#FFFFFF" : "#8B5CF6",
    },
  },

  "&.Mui-selected": {
    background: `${SIDEBAR_GRADIENT} !important`,
    color: "#FFFFFF",

    "&:hover": {
      background: `${SIDEBAR_GRADIENT} !important`,
    },
  },
});

export const subListItemText = (
  isSelected: boolean,
): SxProps<Theme> => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: "13px",
  fontWeight: isSelected ? 650 : 500,
  color: isSelected ? "#FFFFFF" : "#7A8494",
  letterSpacing: "-0.01em",
});

export const drawerBox = (
  drawerOpen: boolean,
  drawerWidth: number,
): SxProps<Theme> => ({
  width: {
    md: drawerOpen ? drawerWidth : 76,
  },

  flexShrink: {
    md: 0,
  },

  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "fixed",
  height: "100vh",
  top: 0,
  left: 0,
  zIndex: 1200,
});

export const smallScreenDrawer = (
  drawerWidth: number,
): SxProps<Theme> => ({
  display: {
    xs: "block",
    md: "none",
  },

  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",

    background: `
      radial-gradient(
        circle at 10% 0%,
        rgba(139, 92, 246, 0.11),
        transparent 28%
      ),
      radial-gradient(
        circle at 100% 100%,
        rgba(34, 211, 238, 0.10),
        transparent 30%
      ),
      rgba(255, 255, 255, 0.97)
    `,

    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",

    position: "fixed",
    borderRight: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "16px 0 50px rgba(15, 23, 42, 0.08)",
  },
});

export const largeScreenDrawer = (
  drawerOpen: boolean,
  drawerWidth: number,
): SxProps<Theme> => ({
  display: {
    xs: "none",
    md: "block",
  },

  "& .MuiDrawer-paper": {
    width: drawerOpen ? drawerWidth : 76,

    transition:
      "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    overflowX: "hidden",
    overflowY: "hidden",
    boxSizing: "border-box",

    background: `
      radial-gradient(
        circle at 0% 0%,
        rgba(139, 92, 246, 0.12),
        transparent 28%
      ),
      radial-gradient(
        circle at 100% 100%,
        rgba(34, 211, 238, 0.10),
        transparent 32%
      ),
      rgba(255, 255, 255, 0.95)
    `,

    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",

    height: "100vh",
    top: 0,
    position: "fixed",

    borderRight:
      "1px solid rgba(148, 163, 184, 0.15)",

    boxShadow:
      "10px 0 40px rgba(15, 23, 42, 0.045)",
  },
});

export const sidebarInner: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

export const sidebarMenuArea = (
  drawerOpen: boolean,
): SxProps<Theme> => ({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",

  px: drawerOpen ? 0.5 : 0,
  py: 2,

  "&::-webkit-scrollbar": {
    width: 5,
  },

  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },

  "&::-webkit-scrollbar-thumb": {
    background:
      "linear-gradient(180deg, #8B5CF6 0%, #22D3EE 100%)",
    borderRadius: "999px",
  },

  scrollbarWidth: "thin",
  scrollbarColor: "#A78BFA transparent",
});

export const sectionWrapper: SxProps<Theme> = {
  my: 2.4,
  px: 2,
  display: {
    xs: "none",
    sm: "flex",
  },
};

export const sectionLine: SxProps<Theme> = {
  flex: 1,
  height: "1px",
  background:
    "linear-gradient(90deg, transparent, rgba(139,92,246,0.22), transparent)",
};

export const sectionText: SxProps<Theme> = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: "10px",
  lineHeight: "16px",
  letterSpacing: "0.13em",
  color: "#A0A9B8",
  mx: 1.4,
  whiteSpace: "nowrap",
};

export const profileArea = (
  drawerOpen: boolean,
): SxProps<Theme> => ({
  px: drawerOpen ? 1.5 : 0.8,
  py: 1.25,

  borderTop:
    "1px solid rgba(148, 163, 184, 0.14)",

  background:
    "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(248,250,252,0.88))",
});

export const popoverPaper: SxProps<Theme> = {
  minWidth: 220,
  maxWidth: 290,
  mt: 0.2,
  p: 0.75,

  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.16)",

  background: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",

  boxShadow:
    "0 24px 60px rgba(15, 23, 42, 0.16)",
};

export const popoverListItem = (
  isSelected: boolean,
): SxProps<Theme> => ({
  minHeight: 42,
  px: 1.5,
  py: 0.8,
  mb: 0.4,
  borderRadius: "12px",

  color: isSelected ? "#FFFFFF" : "#64748B",

  background: isSelected
    ? SIDEBAR_GRADIENT
    : "transparent",

  "& .MuiListItemIcon-root": {
    color: isSelected ? "#FFFFFF" : "#94A3B8",
  },

  "&:hover": {
    background: isSelected
      ? SIDEBAR_GRADIENT
      : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.08))",
  },

  "&.Mui-selected": {
    background: `${SIDEBAR_GRADIENT} !important`,

    "&:hover": {
      background: `${SIDEBAR_GRADIENT} !important`,
    },
  },
});