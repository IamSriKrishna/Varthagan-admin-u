"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import PurchaseDispensesPage from "@/components/purchase-dispenses/PurchaseDispensesPage";

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
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <PurchaseDispensesPage />
    </Suspense>
  );
}
