import { SxProps, Theme } from "@mui/material";

export const mainCard: SxProps<Theme> = {
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
  backgroundColor: "#ffffff",
};

export const sectionHeader: SxProps<Theme> = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#1f2937",
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 2,
};

export const imageSection: SxProps<Theme> = {
  borderRadius: "8px",
  border: "2px dashed #e5e7eb",
  padding: "20px",
  backgroundColor: "#f9fafb",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
  },
};

export const imageSectionFilled: SxProps<Theme> = {
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
};

export const formSection: SxProps<Theme> = {
  px: { xs: 2, sm: 3 },
  py: { xs: 1, sm: 2, md: 3 },
};

export const divider: SxProps<Theme> = {
  my: 3,
  borderColor: "#e5e7eb",
};

export const uploadLabel: SxProps<Theme> = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#374151",
  mb: 1.5,
  display: "flex",
  alignItems: "center",
  gap: 0.75,
};

export const helperText: SxProps<Theme> = {
  fontSize: "13px",
  color: "#6b7280",
  mt: 1,
  fontStyle: "italic",
};
