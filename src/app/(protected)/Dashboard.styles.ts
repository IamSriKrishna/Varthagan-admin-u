import { gradients } from "@/styles/gradients";
import { SxProps, Theme, useMediaQuery, useTheme } from "@mui/material";

// Header Section
export const headerCard: SxProps<Theme> = {
  bgcolor: "white",
  borderRadius: 3,
  p: { xs: 2, sm: 3 },
  mb: 3,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  border: "1px solid",
  borderColor: "grey.100",
};

export const toggleButtton: SxProps<Theme> = {
  backgroundColor: "rgba(102, 126, 234, 0.1)",
  color: "#667eea",
  "&:hover": { backgroundColor: "rgba(102, 126, 234, 0.2)" },
  textTransform: "none",
  fontWeight: 600,
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  px: { xs: 1.5, sm: 2 },
  py: { xs: 0.5, sm: 1 },
  display: "flex",
  justifyContent: { xs: "center", md: "flex-start" },
  "& .MuiButton-startIcon": {
    marginLeft: { xs: 0, sm: 1 },
    marginRight: { xs: 0, sm: 1 },
  },
};

export const CollapseIconBox: SxProps<Theme> = {
  mt: 2,
  pt: 2,
  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
};

export const headerTitle: SxProps<Theme> = {
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  fontWeight: 700,
  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
  background: gradients.primary,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
export const dropdownFilter: SxProps<Theme> = {
  minWidth: 130,
  backgroundColor: "rgba(102, 126, 234, 0.1)",
  borderRadius: 1,

  "&:hover": {
    backgroundColor: "rgba(102, 126, 234, 0.15)",
  },

  // ---- SELECTED TEXT FIX ----
  "& .MuiOutlinedInput-input": {
    color: "#667eea !important", // <-- TRUE FIX
    fontSize: "1rem",
    fontWeight: 600,
    padding: "4px 8px",
  },

  // Dropdown view text
  "& .MuiSelect-select": {
    color: "#667eea",
    fontSize: "1rem",
    fontWeight: 600,
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
  },

  // Input root wrapper
  "& .MuiOutlinedInput-root": {
    fontSize: "1rem",
    fontWeight: 600,
    backgroundColor: "rgba(102, 126, 234, 0.06)",
    height: 36,
    paddingRight: 1,
    color: "#667eea",
    borderRadius: 1,

    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },

  // Icon color
  "& .MuiSelect-icon": {
    fontSize: "1.1rem",
    color: "#667eea",
  },
};

export const statsCard: SxProps<Theme> = {
  borderRadius: 3,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid",
  borderColor: "grey.100",
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  "&:hover": {
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    transform: { xs: "none", sm: "translateY(-8px)" },
    borderColor: "primary.light",
  },
};

export const statsCardContent: SxProps<Theme> = {
  display: "flex",
  position: "relative",
  flexDirection: "column",
  gap: 2,
  p: { xs: 2, sm: 3 },
  height: "100%",
};

export const statsTopSection: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

export const statsTextBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};

export const statsLabel: SxProps<Theme> = {
  fontSize: { xs: "0.75rem", sm: "0.85rem" },
  fontWeight: 600,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const statsValue: SxProps<Theme> = {
  fontSize: { xs: "1.5rem", sm: "2rem" },
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.2,
};

export const statsIconBox: SxProps<Theme> = {
  width: { xs: 40, sm: 48 },
  height: { xs: 40, sm: 48 },
  borderRadius: 2,
  background: gradients.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
};

export const statsChartBox: SxProps<Theme> = {
  mt: "auto",
  pt: 2,
  borderTop: "1px solid",
  borderColor: "grey.100",
};

export const ordersCard: SxProps<Theme> = {
  borderRadius: 4,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  bgcolor: "#fff",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid",
  borderColor: "grey.100",
  height: "100%",
  "&:hover": {
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
    transform: { xs: "none", sm: "translateY(-4px)" },
  },
};

export const ordersHeader: SxProps<Theme> = {
  pb: 2,
  pt: { xs: 2, sm: 3 },
  px: { xs: 2, sm: 3 },
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
  borderBottom: "1px solid",
  borderColor: "grey.100",
};

export const ordersHeaderStack: SxProps<Theme> = {
  mb: 0,
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1.5, sm: 0 },
  alignItems: { xs: "flex-start", sm: "center" },
};

export const ordersIconBox: SxProps<Theme> = {
  width: { xs: 40, sm: 48 },
  height: { xs: 40, sm: 48 },
  background: gradients.primary,
  borderRadius: 2.5,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: { xs: "none", sm: "scale(1.05) rotate(5deg)" },
    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
  },
};

export const ordersTitleBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};

export const ordersTitle: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1rem", sm: "1.15rem" },
  background: gradients.primary,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const ordersSubtitle: SxProps<Theme> = {
  fontSize: { xs: "0.7rem", sm: "0.75rem" },
  fontWeight: 500,
};

export const ordersBadge: SxProps<Theme> = {
  px: { xs: 1.5, sm: 2 },
  py: 0.75,
  borderRadius: 3,
  background: gradients.primary,
  color: "#fff",
  fontWeight: 700,
  fontSize: { xs: "0.7rem", sm: "0.8rem" },
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  alignSelf: { xs: "flex-start", sm: "auto" },
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%, 100%": { opacity: 1, transform: "scale(1)" },
    "50%": { opacity: 0.9, transform: "scale(1.02)" },
  },
};

export const ordersListContent: SxProps<Theme> = {
  pt: 1.5,
  pb: 2,
  maxHeight: { xs: 400, sm: 480 },
  overflowY: "auto",
  px: { xs: 2, sm: 3 },
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: gradients.primary,
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: gradients.primary,
  },
};

export const orderItem: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: { xs: "flex-start", sm: "center" },
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1.5, sm: 0 },
  py: { xs: 1.5, sm: 2 },
  px: { xs: 1.5, sm: 2 },
  borderRadius: 2,
  mb: 1,
  transition: "all 0.3s ease",
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
  border: "1px solid transparent",
  "&:hover": {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
    borderColor: "primary.light",
    transform: { xs: "none", sm: "translateX(4px)" },
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.15)",
  },
};

export const orderAvatar: SxProps<Theme> = {
  width: { xs: 40, sm: 48 },
  height: { xs: 40, sm: 48 },
  background: gradients.primary,
  fontSize: { xs: "1rem", sm: "1.1rem" },
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
  border: "2px solid",
  borderColor: "background.paper",
};

export const orderDetailsBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  flex: 1,
};

export const orderCustomerName: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "0.875rem", sm: "0.95rem" },
  color: "text.primary",
};

export const orderProductName: SxProps<Theme> = {
  fontSize: { xs: "0.75rem", sm: "0.8rem" },
  fontWeight: 500,
};

export const orderStatusBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.8,
  px: { xs: 1.25, sm: 1.5 },
  py: 0.75,
  borderRadius: 2,
  background: "rgba(255, 255, 255, 0.8)",
  border: "1px solid",
  borderColor: "grey.200",
  transition: "all 0.3s ease",
  alignSelf: { xs: "flex-start", sm: "auto" },
  "&:hover": {
    background: "rgba(255, 255, 255, 1)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};

export const orderStatusText: SxProps<Theme> = {
  fontSize: { xs: "0.75rem", sm: "0.8rem" },
  fontWeight: 600,
  textTransform: "capitalize",
};

// Empty State
export const emptyStateBox: SxProps<Theme> = {
  textAlign: "center",
  py: { xs: 6, sm: 8 },
  px: { xs: 2, sm: 3 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

export const emptyIconBox: SxProps<Theme> = {
  width: { xs: 64, sm: 80 },
  height: { xs: 64, sm: 80 },
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mb: 1,
};

export const emptyStateTitle: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: { xs: "0.875rem", sm: "0.95rem" },
};

export const emptyStateSubtitle: SxProps<Theme> = {
  fontSize: { xs: "0.75rem", sm: "0.8rem" },
  maxWidth: 300,
};

// Pie Chart Card
export const pieChartCard: SxProps<Theme> = {
  borderRadius: 4,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  border: "1px solid",
  borderColor: "grey.100",
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
    transform: { xs: "none", sm: "translateY(-4px)" },
  },
};

export const pieChartContent: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

export const pieChartTitle: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1rem", sm: "1.15rem" },
  textAlign: "center",
  background: gradients.primary,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const pieChartBox: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  maxWidth: { xs: 260, sm: 320, md: 380, lg: 450 },
  aspectRatio: "1 / 1",
  overflow: "hidden",
};
export const usePieChartRadii = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return {
    innerRadius: isXs ? 30 : isMd ? 40 : 50,
    outerRadius: isXs ? 60 : isMd ? 80 : 90,
  };
};
