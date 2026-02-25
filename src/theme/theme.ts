import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#3D46F2",
    },
    background: {
      default: "#F4F5FA",
      paper: "#ffffff",
    },
    text: {
      primary: "#0C1421",
      secondary: "#313957",
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 36,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        },
      },
    },
  },
});
