
"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import PurchaseClaimForm from "@/components/purchase-claims/PurchaseClaimForm";

export default function PurchaseClaimPage() {
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
      <PurchaseClaimForm />
    </Suspense>
  );
}