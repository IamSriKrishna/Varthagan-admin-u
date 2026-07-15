"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import PurchaseDispenseForm from "@/components/purchase-dispenses/PurchaseDispenseForm";

export default function PurchaseDispensePage() {
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
      <PurchaseDispenseForm />
    </Suspense>
  );
}
