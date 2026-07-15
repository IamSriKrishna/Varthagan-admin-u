"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import PurchaseClaimsPage from "@/components/purchase-claims/PurchaseClaimsPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8f9fc",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <PurchaseClaimsPage />
    </Suspense>
  );
}