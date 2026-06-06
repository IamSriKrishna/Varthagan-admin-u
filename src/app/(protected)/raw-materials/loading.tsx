"use client";
import { BBLoader } from "@/lib";
import { Box } from "@mui/material";

export default function RawMaterialsLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
      <BBLoader />
    </Box>
  );
}
