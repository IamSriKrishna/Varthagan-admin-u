import { SxProps, Theme } from "@mui/material";

export const tabsContainerSx: SxProps<Theme> = {
  backgroundColor: "white",
  borderRadius: 2,
  padding: "6px",
  width: "fit-content",
  minHeight: "unset",
  gap: 2,
};

export const getTabSx = (isSelected: boolean, index: number) => ({
  textTransform: "none",
  minHeight: "unset",
  minWidth: 120,
  padding: "8px 16px",
  borderRadius: 1,
  fontWeight: 500,
  backgroundColor: isSelected ? "primary.main" : "transparent",
  color: isSelected ? "white" : "text.primary",
  transition: "0.3s",
  marginLeft: index > 0 ? 1 : 0,
  "&:hover": {
    backgroundColor: isSelected ? "primary.dark" : "#f0f0f0",
  },
  "&.Mui-selected": {
    color: "white",
  },
});
