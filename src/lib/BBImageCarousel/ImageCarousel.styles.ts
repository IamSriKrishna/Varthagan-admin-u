import { SxProps, Theme } from "@mui/material";

export const imageBoxSx: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: 1,
};

export const navButtonBaseSx: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#fff",
  backgroundColor: "rgba(0,0,0,0.3)",
  "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
};

export const leftButtonSx: SxProps<Theme> = {
  ...navButtonBaseSx,
  left: 0,
};

export const rightButtonSx: SxProps<Theme> = {
  ...navButtonBaseSx,
  right: 0,
};

export const dotSx = (active: boolean): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  bgcolor: active ? "white" : "gray",
  cursor: "pointer",
});
