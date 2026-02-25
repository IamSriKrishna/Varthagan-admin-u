import { SxProps, Theme } from "@mui/material";

export const partnerOptionBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  p: 1,
  borderRadius: 1,
};

export const partnerOptionInnerBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

export const partnerDetailsRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.5,
};

export const specializationChip: SxProps<Theme> = {
  fontSize: "0.7rem",
  color: "primary.main",
  borderColor: "primary.main",
  height: 20,
};

export const dialogTitleBox: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const orderDetailsPaper: SxProps<Theme> = {
  p: 2.5,
  bgcolor: "grey.50",
  borderRadius: 2,
  border: "1px solid",
  borderColor: "grey.200",
};

export const selectedPartnerPaper: SxProps<Theme> = {
  p: 2.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "grey.200",
  bgcolor: "white",
};
