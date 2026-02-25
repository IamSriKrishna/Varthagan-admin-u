import { SxProps, Theme } from "@mui/material";

export const ImageContainer: SxProps<Theme> = {
  position: "relative",
  width: 150,
  height: 150,
  borderRadius: 2,
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
    "& .image-overlay": {
      opacity: 1,
    },
  },
};

export const CardPaper: SxProps<Theme> = {
  position: "relative",
  width: 150,
  height: 150,
  borderRadius: 2,
  overflow: "hidden",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 24px rgba(149, 157, 165, 0.2)",
    borderColor: "#d1d5db",
  },
};

export const ImageBox: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
};

export const imageOverlay: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.4) 100%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-end",
  padding: 1.25,
  opacity: 0,
  transition: "opacity 0.3s ease",
};

export const overlayButton: SxProps<Theme> = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  color: "#4A5568",
  width: 32,
  height: 32,
  marginBottom: 0.75,
  backdropFilter: "blur(10px)",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: "#ffffff",
    transform: "scale(1.15)",
  },
  "&:last-child": {
    marginBottom: 0,
  },
};

export const overlayActionButton = (type: "view" | "delete"): SxProps<Theme> => ({
  backgroundColor: type == "view" ? "rgba(59, 130, 246, 0.95)" : "rgba(239, 68, 68, 0.95)",
  color: "#ffffff",
  width: 32,
  height: 32,
  marginBottom: 0.75,
  backdropFilter: "blur(10px)",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: type === "view" ? "#2563eb" : "#dc2626",
    transform: "scale(1.15)",
    boxShadow: type === "view" ? "0 4px 12px rgba(59,130,246,0.4)" : "0 4px 12px rgba(239,68,68,0.4)",
  },
  "&:last-child": {
    marginBottom: 0,
  },
});

export const deleteButton: SxProps<Theme> = {
  backgroundColor: "rgba(239, 68, 68, 0.95)",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#dc2626",
    boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
  },
};

export const dragHandle: SxProps<Theme> = {
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: "rgba(255,255,255,0.95)",
  color: "#6B7280",
  width: 28,
  height: 28,
  zIndex: 1,
  opacity: 0,
  transition: "opacity 0.3s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

export const DialogContentStyle: SxProps<Theme> = {
  padding: 0,
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 500,
  overflow: "hidden",
};

export const IconButtonStyle: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  right: 0,
  width: 44,
  height: 44,
  backgroundColor: "rgba(255,255,255,0.95)",
  color: "#1f2937",
  zIndex: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  "&:hover": {
    backgroundColor: "#ffffff",
    transform: "rotate(90deg)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
  },
  transition: "all 0.3s ease",
};

export const FullImageStyle: SxProps<Theme> = {
  maxWidth: "90vw",
  maxHeight: "90vh",
  objectFit: "contain",
  borderRadius: 2,
};

export const imageTypeChip: SxProps<Theme> = {
  position: "absolute",
  top: 10,
  left: 10,
  backgroundColor: "rgba(255,255,255,0.95)",
  color: "#6366f1",
  padding: "3px 10px",
  borderRadius: 12,
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  backdropFilter: "blur(10px)",
  opacity: 0,
  transition: "opacity 0.3s ease",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export const dialogBackdrop: SxProps<Theme> = {
  backgroundColor: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(8px)",
};

export const imageCounter: SxProps<Theme> = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "rgba(255,255,255,0.95)",
  color: "#1f2937",
  padding: "8px 16px",
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 500,
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  zIndex: 10,
};
