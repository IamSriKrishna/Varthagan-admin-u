import React from "react";
import { Box, Typography } from "@mui/material";
import { ImageOff } from "lucide-react";

interface NoImageAvailableProps {
  message?: string;
  height?: number | string;
  width?: number | string;
  iconSize?: number;
}

const NoImageAvailable: React.FC<NoImageAvailableProps> = ({
  message = "No image available",
  height = 80,
  width = 80,
  iconSize = 28,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={height}
      width={width}
      border="1px dashed #ccc"
      borderRadius={2}
      bgcolor="#fafafa"
      px={1}
      py={1.5}
      textAlign="center"
    >
      <ImageOff size={iconSize} color="#9e9e9e" />
      <Typography variant="caption" color="text.secondary" mt={0.5}>
        {message}
      </Typography>
    </Box>
  );
};

export default NoImageAvailable;
