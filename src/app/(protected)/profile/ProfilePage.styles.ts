import { SxProps, Theme } from "@mui/material";

export const profileCard: SxProps<Theme> = {
  borderRadius: 3,
  p: 4,
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  height: "100%",
};

export const profileHeaderStack: SxProps<Theme> = {
  mb: 4,
};

export const avatarContainer: SxProps<Theme> = {
  position: "relative",
};

export const profileAvatar: SxProps<Theme> = {
  width: 120,
  height: 120,
  border: "4px solid",
  borderColor: "primary.main",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
};

export const onlineStatusBadge: SxProps<Theme> = {
  position: "absolute",
  bottom: 4,
  right: 4,
  width: 24,
  height: 24,
  borderRadius: "50%",
  bgcolor: "success.main",
  border: "3px solid white",
};

export const profileTextCenter: SxProps<Theme> = {
  textAlign: "center",
};

export const roleChip: SxProps<Theme> = {
  fontWeight: 600,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

export const profileDetailsStack: SxProps<Theme> = {
  spacing: 2.5,
};

// Profile Info Card Styles
export const profileInfoPaper: SxProps<Theme> = {
  p: 2.5,
  borderRadius: 2,
  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: 2,
  },
};

export const profileInfoBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const profileIconBox: SxProps<Theme> = {
  width: 48,
  height: 48,
  borderRadius: 1.5,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  flexShrink: 0,
};

export const profileInfoTextBox: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
};

export const profileInfoLabel: SxProps<Theme> = {
  display: "block",
};

export const profileInfoValue: SxProps<Theme> = {
  mt: 0.5,
};

// Password Card Styles
export const passwordCard: SxProps<Theme> = {
  borderRadius: 3,
  p: 4,
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  height: "100%",
};

export const passwordHeaderBox: SxProps<Theme> = {
  mb: 4,
};

export const passwordHeaderInner: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 1.5,
};

export const passwordIconBox: SxProps<Theme> = {
  width: 48,
  height: 48,
  borderRadius: 1.5,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};

export const passwordHeaderDescription: SxProps<Theme> = {
  ml: 7.5,
};

export const passwordFormStack: SxProps<Theme> = {
  spacing: 3,
};

// Password Strength Indicator Styles
export const strengthIndicatorBox: SxProps<Theme> = {
  mt: 1.5,
};

export const strengthBarsBox: SxProps<Theme> = {
  display: "flex",
  gap: 0.5,
  mb: 1,
};

export const strengthBar = (level: number, currentStrength: number, color: string): SxProps<Theme> => ({
  flex: 1,
  height: 4,
  borderRadius: 0.5,
  bgcolor: level <= currentStrength ? `${color}.main` : "grey.300",
  transition: "all 0.3s ease",
});

// Password Requirements Styles
export const requirementsPaper: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  bgcolor: "grey.50",
  border: "1px solid",
  borderColor: "grey.200",
};

export const requirementsTitle: SxProps<Theme> = {
  display: "block",
  mb: 1,
};

export const requirementsStack: SxProps<Theme> = {
  spacing: 0.75,
};

export const requirementBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const requirementCheckbox = (isValid: boolean): SxProps<Theme> => ({
  width: 16,
  height: 16,
  borderRadius: "50%",
  bgcolor: isValid ? "success.main" : "grey.300",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
});

export const requirementCheckboxInner: SxProps<Theme> = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  bgcolor: "white",
};

export const requirementText = (isValid: boolean): SxProps<Theme> => ({
  color: isValid ? "success.main" : "text.secondary",
});

// Submit Button Styles
export const submitButton: SxProps<Theme> = {
  py: 1.75,
  fontSize: "1rem",
  fontWeight: 600,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease",
};
