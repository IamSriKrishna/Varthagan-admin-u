"use client";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useState } from "react";
import * as classes from "./Campaginmanagement.styles";

interface SlideItem {
  image_url: string;
  name?: string;
  call_back_link?: string;
  html_text?: string;
}

export const ImageCarouselCard = ({
  images = [],
  height = "auto",
  width = "100%",
}: {
  images?: SlideItem[];
  height?: number | string;
  width?: number | string;
}) => {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const currentSlide = images[current];

  return (
    <Box position="relative" width={width} height={height} borderRadius={2} overflow="hidden" minHeight={180}>
      <Box
        component="img"
        src={currentSlide.image_url}
        alt={currentSlide.name || "Slide"}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2, p: 2, height: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" gutterBottom color="white" sx={{ fontSize: "0.875rem" }}>
            {currentSlide.name}
          </Typography>
          {currentSlide.call_back_link && (
            <Link
              href={currentSlide.call_back_link}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                fontWeight: 600,
                fontSize: 14,
                color: "primary.main",
                bgcolor: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Link
            </Link>
          )}
        </Box>

        {currentSlide.html_text && (
          <Box
            sx={classes.htmlPreviewSx}
            dangerouslySetInnerHTML={{
              __html: currentSlide.html_text,
            }}
          />
        )}
      </Box>

      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          position="absolute"
          bottom={8}
          width="100%"
          zIndex={3}
        >
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrent(idx)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: idx === current ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
