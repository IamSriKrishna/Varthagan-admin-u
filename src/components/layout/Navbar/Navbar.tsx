"use client";

import * as classes from "@/components/layout/Navbar/Navbar.styles";
import VendorsSelect from "@/components/vendors/VendorsSelect";
import { RootState } from "@/store";
import { setSelectedVendor } from "@/store/vendors/vendorsSlice";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { ArrowLeft, Columns2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  drawerOpen: boolean;
  drawerWidth: number;
  handleDrawerToggle: () => void;
  isMobile: boolean;
}

export default function Navbar({ drawerOpen, drawerWidth, handleDrawerToggle, isMobile }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const handleBack = () => router.back();
  const userType = useSelector((state: RootState) => state.auth.user?.user_type || "");
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const dispatch = useDispatch();

  return (
    <AppBar position="fixed" elevation={0} sx={classes.appbar(drawerOpen, drawerWidth)}>
      <Toolbar disableGutters sx={classes.navbarSecondBox}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                ml: { xs: 1, md: 2 },
                borderRadius: 1,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Columns2 size={20} />
            </IconButton>
          )}
          {!isHomePage && (
            <IconButton
              color="inherit"
              onClick={handleBack}
              sx={{
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              <ArrowLeft size={18} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14 }}>
                Back
              </Typography>
            </IconButton>
          )}
        </Box>
        {userType === "superadmin" && (
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              minWidth: 300,
              mr: 2,
            }}
          >
            <VendorsSelect
              label=""
              blurOnSelect={true}
              value={selectedVendorId}
              disableClear={true}
              // disable={userType == "admin" ? true : false}
              onChange={(a: string | number | null, b?: string | number | null) => {
                const v = b !== undefined ? b : a;
                dispatch(setSelectedVendor(v));
              }}
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
