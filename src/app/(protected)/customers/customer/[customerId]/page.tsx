// src/app/(protected)/customers/customer/[customerId]/page.tsx
"use client";

import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import CustomerForm from "@/components/customers/CustomerForm";

export default function CustomerPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        }>
          <CustomerForm />
        </Suspense>
      </Box>
    </Container>
  );
}
