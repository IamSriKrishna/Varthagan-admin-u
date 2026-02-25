import { SxProps, Theme } from "@mui/material";

export const mainListItemButton: SxProps<Theme> = {
  borderRadius: 1,
  py: 1,
  px: 2,
  fontSize: 13,
  height: 41,
  maxHeight: 41,
  borderTopRightRadius: 9999,
  borderBottomRightRadius: 9999,
  mb: 1,
};

export const listItemButton = (isSelected: boolean): SxProps<Theme> => ({
  pl: 2,
  borderRadius: 1,
  bgcolor: isSelected ? "rgba(0, 0, 0, 0.06)" : "transparent",
  "&:hover": {
    bgcolor: "rgba(0, 0, 0, 0.08)",
  },
});

export const listItemText = (isSelected: boolean): SxProps<Theme> => ({
  fontSize: 13,
  fontWeight: isSelected ? "bold" : "normal",
});

export const SubMainBox: SxProps<Theme> = {
  mb: 1,
  borderTopRightRadius: 9999,
  borderBottomRightRadius: 9999,
};

export const subListItemButton = (isSelected: boolean, drawerOpen: boolean): SxProps<Theme> => ({
  maxHeight: 41,
  px: 3,
  mb: 1,
  pl: drawerOpen ? 5 : 2,
  borderTopRightRadius: 9999,
  borderBottomRightRadius: 9999,
  color: isSelected ? "#fff" : "",
  "& .MuiListItemIcon-root": {
    color: isSelected ? "#fff" : "",
  },
});

export const subListItemText = (isSelected: boolean): SxProps<Theme> => ({
  fontSize: 14,
  fontWeight: 400,
  color: isSelected ? "#fff" : "",
});

export const drawerBox = (drawerOpen: boolean, drawerWidth: number): SxProps<Theme> => ({
  width: { md: drawerOpen ? drawerWidth : 70 },
  flexShrink: { md: 0 },
  transition: "width 0.3s",
});

export const smallScreenDrawer = (drawerWidth: number): SxProps<Theme> => ({
  display: { xs: "block", md: "none" },
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: "white",
    // height: "100vh",
    position: "fixed",
  },
});

export const largeScreenDrawer = (drawerOpen: boolean, drawerWidth: number): SxProps<Theme> => ({
  display: { xs: "none", md: "block" },
  "& .MuiDrawer-paper": {
    width: drawerOpen ? drawerWidth : 70,
    transition: "width 0.3s",
    overflowX: "hidden",
    boxSizing: "border-box",
    backgroundColor: "white",
    // height: "100vh",
    position: "fixed",
    borderRight: "none",
  },
});
