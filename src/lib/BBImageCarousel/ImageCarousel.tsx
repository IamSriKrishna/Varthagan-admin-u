"use client";
import { Box, Skeleton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { dotSx, imageBoxSx } from "./ImageCarousel.styles";

interface ImageItem {
  image_url: string;
}

const ImageCarousel = ({
  images = [],
  height = 80,
  width = 80,
}: {
  images?: ImageItem[];
  height?: number;
  width?: number;
}) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // hook stays at top-level
  useEffect(() => {
    setLoading(true);
  }, [current]);

  // ✅ early return only AFTER hooks
  if (!images.length) return null;

  return (
    <Box position="relative" width={width} height={height}>
      {loading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{ borderRadius: 1, position: "absolute", top: 0, left: 0 }}
        />
      )}

      <Box
        component="img"
        src={images[current]?.image_url}
        alt="Product"
        sx={{ ...imageBoxSx, display: loading ? "none" : "block" }}
        onLoad={() => setLoading(false)}
      />

      {images.length > 1 && !loading && (
        <Stack direction="row" spacing={0.5} justifyContent="center" position="absolute" bottom={4} width="100%">
          {images.map((_, idx) => (
            <Box key={idx} sx={dotSx(idx === current)} onClick={() => setCurrent(idx)} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ImageCarousel;
