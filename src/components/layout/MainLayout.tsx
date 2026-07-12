"use client";

import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import * as classes from "./Layout.styles";
// import Navbar from "./Navbar/Navbar";
import Sidebar from "./SideBar/Sidebar";

const drawerWidth = 240;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [delayedBlur, setDelayedBlur] = useState(false);

  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const blurActive = selectedVendorId && delayedBlur;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setDrawerOpen((prev) => !prev);
      setOpenMenuKey(null);
    }
  };
  useEffect(() => {
    if (selectedVendorId) {
      setDelayedBlur(false);
      return;
    }

    const timer = setTimeout(() => {
      setDelayedBlur(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedVendorId]);

  return (
    <Box sx={{ display: "flex", position: "relative", minHeight: "100vh" }}>
      {/* <CssBaseline /> */}

     
      <Box
        sx={{
          filter: blurActive ? "blur(4px)" : "none",
          opacity: blurActive ? 0.4 : 1,
          pointerEvents: blurActive ? "none" : "auto",
          transition: "0.3s ease",
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          drawerOpen={drawerOpen}
          handleDrawerToggle={handleDrawerToggle}
          setOpenMenuKey={setOpenMenuKey}
          openMenuKey={openMenuKey}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            transition: "margin-left 0.3s",
            marginLeft: { xs: 0, md: drawerOpen ? "240px" : "70px" },
          }}
        >
          <Box component="main" sx={classes.mainLayoutBox}>
            
            {children}
          </Box>
        </Box>
      </Box>
      
    </Box>
  );
}
