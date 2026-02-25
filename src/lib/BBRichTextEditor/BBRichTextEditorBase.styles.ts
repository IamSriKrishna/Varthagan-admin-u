import { SxProps, Theme } from "@mui/material";

export const editorWrapper = (isError?: boolean): SxProps<Theme> => ({
  border: "1px solid",
  borderColor: isError ? "error.main" : "grey.300",
  borderRadius: "8px",
  overflow: "hidden",
  "& .ql-toolbar": {
    border: "none",
    borderBottom: "1px solid",
    borderColor: isError ? "error.main" : "#ccc",
    borderRadius: 0,
  },
  "& .ql-container": {
    border: "none",
  },
  "& .ql-editor": {
    minHeight: "150px",
    fontSize: "16px",
    backgroundColor: "#fff",
  },
  "& .ql-toolbar button.ql-active": {
    backgroundColor: "#8C57FF29 !important",
    borderRadius: "6px",
    color: "#000 !important",
    "& svg": {
      fill: "#000 !important",
    },
  },
  "& .ql-toolbar button": {
    marginRight: "4px",
  },
});

export const labelStyle: SxProps<Theme> = {
  mb: 1,
  fontWeight: 500,
};
