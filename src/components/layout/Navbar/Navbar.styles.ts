import { SxProps, Theme } from "@mui/material";

export const appbar =
  (drawerOpen: boolean, drawerWidth: number): SxProps<Theme> =>
  (theme) => ({
    backgroundColor: "#f5f5f5",
    height: 64,
    color: theme.palette.text.primary,
    // zIndex: theme.zIndex.drawer + 1,
    ml: { md: drawerOpen ? `${drawerWidth}px` : "85px" },
    width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : "calc(100% - 85px)" },

    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    px: 2,
  });

export const navbarSecondBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  height: "100%",
};

export const popoverPaperSx: SxProps<Theme> = (theme) => ({
  borderRadius: 2,
  boxShadow: theme.shadows[4],
  minWidth: 180,
  p: 1,
  backgroundColor: theme.palette.background.paper,
  mt: 1,
});

export const popoverListItemButton: SxProps<Theme> = (theme) => ({
  borderRadius: 1,
  px: 2,
  py: 0.5,
  transition: "background 0.2s",
  "&:hover": { backgroundColor: theme.palette.action.hover },
});

export const logoutListItemButton: SxProps<Theme> = (theme) => ({
  ...popoverListItemButton(theme),
  mt: 0.5,
});

export const listItemIconPrimary: SxProps<Theme> = {
  minWidth: 32,
  color: "primary.main",
};

export const listItemIconError: SxProps<Theme> = {
  minWidth: 32,
  color: "error.main",
};

export const avatarColor: SxProps<Theme> = {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: 10,
  height: 10,
  backgroundColor: "green",
  borderRadius: "50%",
  border: "2px solid white",
};
