import { SxProps, Theme } from "@mui/material";

export const mainContainerBox: SxProps<Theme> = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 2,
  padding: theme.spacing(2),
  minHeight: 200,
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",

  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.grey[100],
});

export const TitleBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  mb: 1,
};
export const htmlPreviewSx: SxProps<Theme> = {
  "&, & *, & *[style], & *[style*='color'], & *[style*='background'], & *[style*='background-color']": {
    position: "relative !important",
    top: "auto !important",
    left: "auto !important",
    transform: "none !important",
    animation: "none !important",
    background: "none !important",
    backgroundColor: "transparent !important",
    color: "#fff !important",
    WebkitTextFillColor: "white !important",
    fontSize: "14px !important",
  },
};
