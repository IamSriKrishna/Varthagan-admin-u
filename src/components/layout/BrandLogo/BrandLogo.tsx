"use client";

import logo from "@/assets/images/mainlogo.jpg";
import { Box, IconButton, Typography } from "@mui/material";
import { ArrowLeftFromLine, ArrowRightToLine, X } from "lucide-react";
import Image from "next/image";
import * as classes from "./BrandLogo.styles";

interface BrandLogoProps {
  open?: boolean;
  onClose?: () => void;
  isSmallScreen?: boolean;
}

export default function BrandLogo({ open, onClose, isSmallScreen = false }: BrandLogoProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: open ? "space-between" : "flex-start",
        px: 2,
        height: 64,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          gap: 2,
          ...(open === false
            ? {
              "&:hover .brand-logo": { opacity: 0 },
              "&:hover .toggle-btn": { opacity: 1, transform: "translateX(0)" },
            }
            : {}),
        }}
      >
        <Box className="brand-logo" sx={classes.brandLogoContainer}>
          <Image src={logo} alt="Logo" width={40} height={40} style={{ objectFit: "cover" }} />
        </Box>

        <Typography variant="h6" sx={classes.brandLogoText}>
          Varthagan App
        </Typography>

        {!open && !isSmallScreen && onClose && (
          <IconButton className="toggle-btn" onClick={onClose} sx={classes.toggleIconButton} color="primary">
            <ArrowRightToLine size={20} />
          </IconButton>
        )}
      </Box>

      {open && onClose && !isSmallScreen && (
        <IconButton onClick={onClose} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }} color="primary">
          <ArrowLeftFromLine size={20} />
        </IconButton>
      )}

      {isSmallScreen && onClose && (
        <IconButton onClick={onClose} sx={{ p: 0.5, "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}>
          <X size={22} />
        </IconButton>
      )}
    </Box>
  );
}
