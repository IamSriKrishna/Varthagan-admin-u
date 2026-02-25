import { SxProps, Theme } from "@mui/material";

// Profile box container
export const profileBoxContainer: SxProps<Theme> = {
  position: "relative",
  width: "100%",
};

// Profile box
export const profileBox = (drawerOpen: boolean): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: drawerOpen ? 1.5 : 0,
  pr: 1.5,
  py: 0.5,
  pl: "7px",
  borderRadius: 1,
  backgroundColor: "#F5F5F5",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#EEEEEE",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
});

// Avatar
export const avatarSx: SxProps<Theme> = {
  width: 40,
  height: 40,
};

// User info box
export const userInfoBox: SxProps<Theme> = {
  flex: 1,
  overflow: "hidden",
  ml: 1,
};

// User name text
export const userNameText: SxProps<Theme> = {
  fontWeight: 600,
  fontSize: 14,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// User type text
export const userTypeText: SxProps<Theme> = {
  fontSize: 12,
  color: "#666",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// Chevron icon style
export const chevronIconStyle = (open: boolean): React.CSSProperties => ({
  marginLeft: "auto",
  color: "#999",
  transition: "transform 0.2s",
  transform: open ? "rotate(90deg)" : "rotate(0deg)",
});

// Popover paper
export const popoverPaperSx: SxProps<Theme> = {
  mt: 1,
  ml: 1,
  minWidth: 220,
  borderRadius: 2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  overflow: "visible",
};

// Popover content box
export const popoverContentBox: SxProps<Theme> = {
  p: 1,
  position: "relative",
  zIndex: 1,
  backgroundColor: "white",
  borderRadius: 1,
};

// Menu items container
export const menuItemsContainer: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};
export const menuItemBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  p: 1,
  borderRadius: 1,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#F5F5F5",
    transform: "translateX(4px)",
  },
};

export const logoutMenuItemBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  p: 1,
  borderRadius: 1,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#FFF0F0",
    transform: "translateX(4px)",
    "& svg": {
      color: "#D32F2F",
    },
    "& p": {
      color: "#D32F2F",
    },
  },
};

// Menu item text
export const menuItemText: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 500,
  color: "#333",
};
// In ProfileMenu.styles.ts - Update the menuItemHeader:

export const menuItemHeader: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.5,
  p: 1.5,
  mb: 1,
  borderRadius: 1,
  backgroundColor: "#F8F9FA",
  borderBottom: "2px solid #E0E0E0",
};

export const headerText: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 600,
  color: "#1976D2",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
