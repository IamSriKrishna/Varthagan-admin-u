import { SxProps, Theme } from "@mui/material";
export const tableStyle: SxProps<Theme> = {
  borderTop: "1px solid #e0e0e0",
  borderLeft: "1px solid #e0e0e0",
  borderRight: "1px solid #e0e0e0",
};
export const thStyle: SxProps<Theme> = {
  fontWeight: "bold",
  borderBottom: "1px solid #e0e0e0",
  padding: "8px",
  textAlign: "center",
  verticalAlign: "middle",
  backgroundColor: "#f0f4ff",
  color: "#333",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
};
export const footStyle: SxProps<Theme> = {
  fontWeight: "bold",
  borderBottom: "1px solid #e0e0e0",
  padding: "8px",
  textAlign: "center",
  verticalAlign: "middle",
  backgroundColor: "#f0f4ff",
  color: "#333",
  fontSize: "16px",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
};

export const tdStyle: SxProps<Theme> = {
  borderBottom: "1px solid #e0e0e0",
  padding: "8px",
  textAlign: "center",
  verticalAlign: "middle",
  borderLeft: "none",
  borderRight: "none",
};

export const rowStyle: SxProps<Theme> = {
  cursor: "pointer",
  "&:nth-of-type(odd)": {
    backgroundColor: "#ffffff", // white for odd rows
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#f9f9f9", // very light gray for even rows
  },
  "&:hover": {
    backgroundColor: "#e8f4ff", // soft highlight on hover
  },
};
