import { SxProps, Theme } from "@mui/material";
export const dropZone: (isDragging: boolean) => SxProps<Theme> = (isDragging) => ({
  border: "1px dashed",
  borderColor: isDragging ? "primary.main" : "grey.400",
  borderRadius: 2,
  p: 4,
  textAlign: "center",
  backgroundColor: isDragging ? "grey.100" : "background.paper",
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",
});
export const cardContent: SxProps<Theme> = {
  border: "1px dashed #D0D5DD",
  borderRadius: "8px",
  p: 4,
  width: 150,
  height: 150,
  textAlign: "center",
  bgcolor: "#FAFAFA",
  transition: "background-color 0.2s, border 0.2s",
  cursor: "pointer",
};

export const cardContentDragging: SxProps<Theme> = {
  ...cardContent,
  border: "2px dashed #1976d2",
  backgroundColor: "#f0f8ff",
};

export const uploadIconButton: SxProps<Theme> = {
  mb: 2,
  width: 48,
  height: 48,
  borderRadius: "50%",
  bgcolor: "#F2F4F7",
  color: "#7F56D9",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const loaderIconStyle: SxProps<Theme> = {
  animation: "spin 1s linear infinite",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
};
