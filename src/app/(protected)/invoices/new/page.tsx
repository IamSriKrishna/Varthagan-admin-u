"use client";

import { BBTitle } from "@/lib";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { Box, Stack } from "@mui/material";

export default function NewInvoicePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <BBTitle title="New Invoice" />
        <InvoiceForm />
      </Stack>
    </Box>
  );
}
