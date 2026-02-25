"use client";

import { ICategoryImage } from "@/models/ICategory";
import { IProductImage } from "@/models/IProduct";
import { Backdrop, Box, Dialog, DialogContent, Fade, Grid, IconButton, Paper, Tooltip } from "@mui/material";
import { Move, Trash2, X, ZoomIn } from "lucide-react";
import React, { useState } from "react";
import * as classes from "@/styles/ImageCard.styles";

interface ImageCardProps {
  img: ICategoryImage | IProductImage;
  index: number;
  onDelete: (id: string) => void;
  onDragStart?: (index: number) => void;
  onDrop?: (index: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ img, index, onDelete, onDragStart, onDrop }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Grid
        key={img.id}
        size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
        component="div"
        draggable={!!onDragStart && !!onDrop}
        onDragStart={onDragStart ? () => onDragStart(index) : undefined}
        onDragOver={onDrop ? (e) => e.preventDefault() : undefined}
        onDrop={onDrop ? () => onDrop(index) : undefined}
        sx={{
          "&:hover .drag-handle": {
            opacity: onDragStart ? 1 : 0,
          },
          "&:hover .image-type-chip": {
            opacity: 1,
          },
        }}
      >
        <Paper elevation={0} sx={classes.CardPaper}>
          <Box sx={classes.ImageContainer}>
            {onDragStart && (
              <IconButton className="drag-handle" size="small" sx={classes.dragHandle}>
                <Move className="w-3.5 h-3.5" />
              </IconButton>
            )}

            <Box component="img" src={img.image_url} alt="Salon Image" sx={classes.ImageBox} />
            <Box className="image-overlay" sx={classes.imageOverlay}>
              <Box />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {img.image_type !== "icon" && (
                  <Tooltip title="View Full Image" placement="left" arrow>
                    <IconButton size="small" sx={classes.overlayActionButton("view")} onClick={() => setOpen(true)}>
                      <ZoomIn className="w-4 h-4" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete Image" placement="left" arrow>
                  <IconButton size="small" sx={classes.overlayActionButton("delete")} onClick={() => onDelete(img.id)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        slots={{
          backdrop: Backdrop,
          transition: Fade,
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            },
            timeout: 500,
          },
          transition: {
            timeout: 300,
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
          },
        }}
      >
        <DialogContent sx={{ ...classes.DialogContentStyle, p: 0 }}>
          <Box sx={{ position: "relative" }}>
            <Box component="img" src={img.image_url} alt="Full View" sx={classes.FullImageStyle} />

            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#1f2937",
                "&:hover": { backgroundColor: "#ffffff", transform: "rotate(90deg)" },
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
            >
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCard;
