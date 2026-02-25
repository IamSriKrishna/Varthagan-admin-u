"use client";

import React from "react";
import { LinearProgress, Box, SxProps, Theme } from "@mui/material";
import { gradients } from "@/styles/gradients";

interface BBLoaderProps {
  enabled?: boolean;
}

const BBLoader: React.FC<BBLoaderProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  const boxSx: SxProps<Theme> = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    zIndex: 1300,
  };

  return (
    <Box sx={boxSx}>
      <LinearProgress
        sx={{
          height: 4,
          "& .MuiLinearProgress-bar": {
            background: gradients.primary,
          },
        }}
      />
    </Box>
  );
};

export default BBLoader;
