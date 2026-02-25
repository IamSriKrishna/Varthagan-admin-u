import { SxProps, Theme } from "@mui/material";

export const descriptionStyle: SxProps<Theme> = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  "& h1": {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "4px",
  },
  "& p": {
    margin: 0,
  },
};

export const ImageStyle: SxProps<Theme> = {
  width: 38,
  height: 38,
  borderRadius: 1.5,
  objectFit: "cover",
  border: "1px solid #e0e0e0",
};
export const FileDropStyle: SxProps<Theme> = {
  px: 2,
  pt: 2,
  color: "#2E263DE5",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontStyle: "normal",
  fontSize: "18px",
  lineHeight: "28px",
  letterSpacing: "0px",
};

export const Badge = (type: string): SxProps<Theme> => ({
  width: "91px",
  height: "24px",
  minWidth: "24px",
  backgroundColor: type == "service" ? "#56CA0029" : "#FFB40029",
  borderRadius: "999px",
  px: 1.5,
  py: "2px",
  gap: "4px",
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  textTransform: "capitalize",
  color: "#000",
});
export const getStatusTypeBadge = (type: string): SxProps<Theme> => ({
  width: "91px",
  height: "24px",
  minWidth: "24px",
  backgroundColor: type == "active" ? "#56CA0029" : "#FFB40029",
  borderRadius: "999px",
  px: 1.5,
  py: "2px",
  gap: "4px",
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  textTransform: "capitalize",
  color: "#000",
});
export const getMemberBadge = (type: boolean): SxProps<Theme> => ({
  width: "91px",
  height: "24px",
  minWidth: "24px",
  backgroundColor: type === true ? "#56CA0029" : "#FFB40029",
  borderRadius: "999px",
  px: 1.5,
  py: "2px",
  gap: "4px",
  opacity: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  textTransform: "capitalize",
  color: "#000",
});
