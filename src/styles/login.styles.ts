import { keyframes } from "@emotion/react";
import { SxProps, Theme } from "@mui/material";

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.55;
    transform: scale(1);
  }

  50% {
    opacity: 0.85;
    transform: scale(1.08);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const loginPage: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",

  background: `
    radial-gradient(
      circle at 12% 15%,
      rgba(139, 92, 246, 0.16),
      transparent 32%
    ),
    radial-gradient(
      circle at 88% 85%,
      rgba(34, 211, 238, 0.16),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #FCFAFF 0%,
      #F8FAFC 50%,
      #F0FDFF 100%
    )
  `,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  p: {
    xs: 0,
    md: 3,
    lg: 4,
  },
};

export const backgroundGrid: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  opacity: 0.32,
  backgroundImage: `
    linear-gradient(rgba(124, 58, 237, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 58, 237, 0.055) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
  maskImage:
    "linear-gradient(to bottom, black, transparent 92%)",
  pointerEvents: "none",
};

export const glowOne: SxProps<Theme> = {
  position: "absolute",
  width: 430,
  height: 430,
  borderRadius: "50%",
  left: "-140px",
  top: "-130px",
  background:
    "radial-gradient(circle, rgba(167,139,250,0.34), transparent 68%)",
  filter: "blur(10px)",
  animation: `${pulseGlow} 8s ease-in-out infinite`,
  pointerEvents: "none",
};

export const glowTwo: SxProps<Theme> = {
  position: "absolute",
  width: 520,
  height: 520,
  borderRadius: "50%",
  right: "-190px",
  bottom: "-210px",
  background:
    "radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%)",
  filter: "blur(12px)",
  animation: `${pulseGlow} 10s ease-in-out infinite`,
  pointerEvents: "none",
};

export const glowThree: SxProps<Theme> = {
  position: "absolute",
  width: 330,
  height: 330,
  borderRadius: "50%",
  left: "38%",
  bottom: "-180px",
  background:
    "radial-gradient(circle, rgba(251,191,36,0.18), transparent 70%)",
  pointerEvents: "none",
};

export const loginShell: SxProps<Theme> = {
  width: "100%",
  maxWidth: 1500,
  minHeight: {
    xs: "100vh",
    md: "calc(100vh - 48px)",
    lg: "calc(100vh - 64px)",
  },
  position: "relative",
  zIndex: 2,
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "minmax(440px, 0.88fr) minmax(520px, 1.12fr)",
  },
  backgroundColor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: {
    xs: "none",
    md: "1px solid rgba(255,255,255,0.95)",
  },
  borderRadius: {
    xs: 0,
    md: "34px",
  },
  boxShadow: {
    xs: "none",
    md: `
      0 30px 100px rgba(64, 52, 110, 0.14),
      0 8px 30px rgba(15, 23, 42, 0.07)
    `,
  },
  overflow: "hidden",
};

export const formSection: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: {
    xs: "100vh",
    md: "auto",
  },
  px: {
    xs: 3,
    sm: 6,
    md: 6,
    lg: 8,
  },
  py: {
    xs: 3,
    md: 4,
    lg: 5,
  },
  backgroundColor: "rgba(255,255,255,0.84)",
};

export const topBrand: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const logoBox: SxProps<Theme> = {
  width: 48,
  height: 48,
  borderRadius: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  background: "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)",
  boxShadow:
    "0 12px 30px rgba(124,58,237,0.3)",
  "& span": {
    fontFamily: "'Inter', sans-serif",
    fontSize: 23,
    fontWeight: 800,
  },
};

export const brandName: SxProps<Theme> = {
  fontFamily: "'Inter', sans-serif",
  color: "#171126",
  fontWeight: 800,
  fontSize: 18,
  lineHeight: 1.2,
};

export const brandSubtitle: SxProps<Theme> = {
  fontFamily: "'Inter', sans-serif",
  color: "#82778f",
  fontWeight: 500,
  fontSize: 12,
  mt: 0.25,
};

export const formContent: SxProps<Theme> = {
  width: "100%",
  maxWidth: 470,
  my: "auto",
  py: {
    xs: 5,
    md: 4,
  },
  animation: `${fadeIn} 0.65s ease both`,
};

export const accessChip: SxProps<Theme> = {
  height: 32,
  mb: 2.2,
  borderRadius: "999px",
  color: "#7C3AED",
  background:
    "linear-gradient(135deg, rgba(139,92,246,0.11) 0%, rgba(34,211,238,0.11) 100%)",
  border: "1px solid rgba(139, 92, 246, 0.18)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 700,

  "& .MuiChip-icon": {
    color: "#7C3AED",
  },
};

export const heading: SxProps<Theme> = {
  fontFamily: "'Inter', sans-serif",
  fontSize: {
    xs: 38,
    sm: 46,
    md: 44,
    lg: 50,
  },
  lineHeight: 1.08,
  letterSpacing: "-0.045em",
  fontWeight: 800,
  color: "#171126",
  maxWidth: 470,
};

export const headingAccent: SxProps<Theme> = {
  display: "inline",
  background: "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export const description: SxProps<Theme> = {
  mt: 2,
  mb: 4,
  maxWidth: 440,
  fontFamily: "'Inter', sans-serif",
  fontSize: {
    xs: 15,
    sm: 16,
  },
  lineHeight: 1.75,
  color: "#6f6878",
};

export const inputStack: SxProps<Theme> = {
  "& .MuiFormControl-root": {
    width: "100%",
  },

  "& .MuiInputLabel-root": {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#8B5CF6",
  },

  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.035)",

    transition:
      "box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease",

    "& fieldset": {
      borderColor: "#E2E8F0",
    },

    "&:hover fieldset": {
      borderColor: "#A78BFA",
    },

    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      boxShadow:
        "0 0 0 4px rgba(139, 92, 246, 0.1), 0 8px 24px rgba(34, 211, 238, 0.08)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#8B5CF6",
      borderWidth: "1.5px",
    },
  },
};

export const formActions: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
};

export const securityText: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  fontWeight: 500,
  color: "#8a8094",
};

export const forgotPassword: SxProps<Theme> = {
  border: 0,
  outline: 0,
  background: "transparent",
  cursor: "pointer",
  p: 0,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: "#7c3aed",
  transition: "color 0.2s ease",
  "&:hover": {
    color: "#5b21b6",
  },
};

export const submitButton: SxProps<Theme> = {
  pt: 0.8,

  "& button": {
    minHeight: "56px !important",
    borderRadius: "15px !important",
    textTransform: "none !important",
    fontFamily: "'Inter', sans-serif !important",
    fontSize: "15px !important",
    fontWeight: "700 !important",
    color: "#ffffff !important",

    background:
      "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%) !important",

    boxShadow:
      "0 14px 32px rgba(139, 92, 246, 0.28) !important",

    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important",

    "&:hover": {
      transform: "translateY(-2px)",
      filter: "brightness(1.05)",
      boxShadow:
        "0 18px 40px rgba(34, 211, 238, 0.32) !important",
    },

    "&:active": {
      transform: "translateY(0)",
    },
  },
};

export const buttonContent: SxProps<Theme> = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
};

export const trustRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.4,
  mt: 3,
  flexWrap: "wrap",
};

export const trustItem: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.6,
  color: "#81788c",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 500,
};

export const trustDot: SxProps<Theme> = {
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: "#c4b5fd",
  display: {
    xs: "none",
    sm: "block",
  },
};

export const footerText: SxProps<Theme> = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "#9b93a4",
  mt: 3,
};

export const mediaSection: SxProps<Theme> = {
  display: {
    xs: "none",
    md: "block",
  },
  position: "relative",
  minWidth: 0,
  p: {
    md: 2.5,
    lg: 3,
  },
};

export const videoCard: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: 600,
  borderRadius: "28px",
  overflow: "hidden",
  backgroundColor: "#171126",
  boxShadow:
    "0 24px 70px rgba(41,29,70,0.22)",
  "& video": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },
};

export const videoOverlay: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(
      180deg,
      rgba(17, 12, 28, 0.08) 0%,
      rgba(17, 12, 28, 0.14) 45%,
      rgba(17, 12, 28, 0.82) 100%
    )
  `,
};

export const videoTopContent: SxProps<Theme> = {
  position: "absolute",
  top: 28,
  left: 28,
  right: 28,
  display: "flex",
  justifyContent: "flex-start",
};

export const videoChip: SxProps<Theme> = {
  height: 34,
  borderRadius: "999px",
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.17)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.26)",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 12,
  "& .MuiChip-icon": {
    color: "#ffffff",
  },
};

export const videoBottomContent: SxProps<Theme> = {
  position: "absolute",
  left: {
    md: 36,
    lg: 48,
  },
  right: {
    md: 36,
    lg: 48,
  },
  bottom: {
    md: 40,
    lg: 50,
  },
};

export const videoTitle: SxProps<Theme> = {
  color: "#ffffff",
  fontFamily: "'Inter', sans-serif",
  fontSize: {
    md: 38,
    lg: 48,
  },
  fontWeight: 800,
  lineHeight: 1.07,
  letterSpacing: "-0.04em",
  textShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

export const videoDescription: SxProps<Theme> = {
  mt: 1.8,
  mb: 2.8,
  maxWidth: 470,
  color: "rgba(255,255,255,0.82)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.65,
};

export const featureBadge: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.7,
  px: 1.4,
  py: 0.9,
  borderRadius: "999px",
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.13)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.2)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
};

export const floatingMetric: SxProps<Theme> = {
  position: "absolute",
  top: {
    md: 60,
    lg: 72,
  },
  right: {
    md: 44,
    lg: 58,
  },
  display: "flex",
  alignItems: "center",
  gap: 1.2,
  p: 1.4,
  pr: 2,
  borderRadius: "18px",
  backgroundColor: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.95)",
  boxShadow:
    "0 18px 40px rgba(17,12,28,0.16)",
  animation: `${floatAnimation} 5s ease-in-out infinite`,
};

export const metricIcon: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#7C3AED",
  background:
    "linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(34,211,238,0.14) 100%)",
};

export const metricValue: SxProps<Theme> = {
  color: "#171126",
  fontFamily: "'Inter', sans-serif",
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1.2,
};

export const metricLabel: SxProps<Theme> = {
  color: "#81788c",
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  fontWeight: 500,
  mt: 0.2,
};

// Aliases for backward compatibility with old import names
export const loginContainer = loginPage;
export const loginFormBox = formSection;
export const loginFormContainerBox = loginShell;
export const loginImageBox = mediaSection;
export const textTypography = heading;
export const textParagraph = description;
export const textForgotPassword = forgotPassword;