"use client";

import userlogo from "@/assets/images/user-logo.png";
import { Avatar, Box, Popover, Typography } from "@mui/material";
import { ChevronRight, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import * as classes from "./ProfileMenu.styles";

interface ProfileMenuProps {
  drawerOpen: boolean;
  userName: string;
  userType: string;
  handleLogout: () => void;
  userAvatar?: string;
}

export default function ProfileMenu({ drawerOpen, userName, userType, handleLogout, userAvatar }: ProfileMenuProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleProfileClick = () => {
    handlePopoverClose();
    router.push("/profile");
  };

  const handleLogoutClick = () => {
    handlePopoverClose();
    handleLogout();
  };

  return (
    <Box sx={classes.profileBoxContainer}>
      <Box onMouseEnter={handlePopoverOpen} sx={classes.profileBox(drawerOpen)}>
        <Avatar src={userAvatar || userlogo.src} sx={classes.avatarSx} />

        {drawerOpen && (
          <Box sx={classes.userInfoBox}>
            <Typography variant="body2" sx={classes.userNameText}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={classes.userTypeText}>
              {userType}
            </Typography>
          </Box>
        )}

        {drawerOpen && <ChevronRight size={16} style={classes.chevronIconStyle(open)} />}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 1,
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            onMouseLeave: handlePopoverClose,
            sx: classes.popoverPaperSx,
          },
        }}
      >
        <Box sx={classes.popoverContentBox}>
          <Box sx={classes.menuItemsContainer}>
            <Box sx={classes.menuItemHeader}>
              <User size={20} color="#1976D2" />
              <Typography sx={classes.headerText}>{userType}</Typography>
            </Box>
            <Box onClick={handleProfileClick} sx={classes.menuItemBox}>
              <User size={18} color="#666" />
              <Typography sx={classes.menuItemText}>View Profile</Typography>
            </Box>

            {/* <Box onClick={handleProfileClick} sx={classes.menuItemBox}>
              <Key size={18} color="#666" />
              <Typography sx={classes.menuItemText}>Change Password</Typography>
            </Box> */}

            <Box onClick={handleLogoutClick} sx={classes.logoutMenuItemBox}>
              <LogOut size={18} color="#D32F2F" />
              <Typography sx={classes.menuItemText}>Logout</Typography>
            </Box>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
