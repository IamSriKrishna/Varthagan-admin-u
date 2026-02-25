// app/vendors/vendor/[vendorId]/page.tsx
"use client";

import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import VendorForm from "@/components/vendors/VendorForm";

export default function VendorPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        }>
          <VendorForm />
        </Suspense>
      </Box>
    </Container>
  );
}