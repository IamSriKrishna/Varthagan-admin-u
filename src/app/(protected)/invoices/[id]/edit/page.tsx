"use client";

import { invoices } from "@/constants/apiConstants";
import { config } from "@/config";
import { IInvoice, IInvoiceResponse } from "@/models/IInvoice";
import useFetch from "@/hooks/useFetch";
import { BBTitle, BBLoader } from "@/lib";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { Box, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;

  const { data: result, loading } = useFetch<any>({
    url: invoices.getInvoiceById(invoiceId),
    baseUrl: config.apiDomain || config.customerDomain,
    options: { skip: !invoiceId },
  });

  // Handle both response formats: { data: invoice } and direct invoice object
  const invoice: IInvoice | undefined = result?.data || result;

  // Debug logging
  React.useEffect(() => {
    if (result && !loading) {
      console.log("Edit Invoice - API Response:", result);
      console.log("Edit Invoice - Extracted Invoice:", invoice);
    }
  }, [result, loading]);

  if (loading) {
    return <BBLoader />;
  }

  if (!invoice || !invoice.invoice_number) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Invoice not found</Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Invoice ID: {invoiceId}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <BBTitle title={`Edit Invoice ${invoice.invoice_number}`} />
        {invoice && <InvoiceForm initialData={invoice} />}
      </Stack>
    </Box>
  );
}
