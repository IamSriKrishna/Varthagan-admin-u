import React from "react";
import { theme } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

const BBThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default BBThemeProvider;
