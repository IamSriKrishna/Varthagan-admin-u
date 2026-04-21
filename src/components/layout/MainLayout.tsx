"use client";

import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import * as classes from "./Layout.styles";
import Navbar from "./Navbar/Navbar";
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

      {/* <Navbar
        drawerOpen={drawerOpen}
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      /> */}
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
          }}
        >
          <Box component="main" sx={classes.mainLayoutBox}>
            <Toolbar />
            {children}
          </Box>
        </Box>
      </Box>
      {blurActive && (
        <Box sx={classes.overlayTextStyle}>
          <Box>
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 1, fontSize: "0.9rem", opacity: 0.8 }}>
              Tap the menu icon to select a vendor
            </Box>
            <Box>Select Vendor to Continue</Box>
          </Box>

          <Box sx={classes.arrowStyle(mobileOpen)}>
            <svg
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#764ba2"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 7L7 17"></path>
              <path d="M17 17H7V7"></path>
            </svg>
          </Box>

          <style>{`
      @keyframes arrowBounce {
        0% { transform: translateY(0) rotate(-180deg); opacity: 0.7; }
        50% { transform: translateY(-10px) rotate(-180deg); opacity: 1; }
        100% { transform: translateY(0) rotate(-180deg); opacity: 0.7; }
      }

      @media (max-width: 900px) {
        @keyframes arrowBounce {
          0% { transform: translateY(0) rotate(80deg); opacity: 0.7; }
          50% { transform: translateY(-10px) rotate(80deg); opacity: 1; }
          100% { transform: translateY(0) rotate(80deg); opacity: 0.7; }
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
        </Box>
      )}
    </Box>
  );
}
