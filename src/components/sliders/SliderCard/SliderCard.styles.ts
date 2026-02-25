import { SxProps, Theme } from "@mui/material";

export const containerSx: SxProps<Theme> = {
  mt: 2,
  height: "500px",
};

export const dragIconSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  cursor: "grab",
  opacity: 0.5,
  transition: "opacity 0.3s",
};

export const sliderCardStyles: SxProps<Theme> = {
  p: 2,
  mb: 2,
  display: "grid",
  gridTemplateColumns: "56px 56px 1fr auto auto auto",
  gap: 1,
  alignItems: "center",
};
