"use client";

import { invoices } from "@/constants/apiConstants";
import { config } from "@/config";
import { IInvoice, IInvoiceResponse } from "@/models/IInvoice";
import useFetch from "@/hooks/useFetch";
import { BBTitle, BBLoader } from "@/lib";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";
import {
  Box,
  Stack,
  Button,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Download, Edit2, Send, Trash2 } from "lucide-react";

const statusColorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  draft: "default",
  sent: "info",
  partial: "warning",
  paid: "success",
  overdue: "error",
  void: "error",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const { data: result, loading, refetch } = useFetch<any>({
    url: invoices.getInvoiceById(invoiceId),
    baseUrl: config.apiDomain || config.customerDomain,
    options: { skip: !invoiceId },
  });

  // Handle both response formats: { data: invoice } and direct invoice object
  const invoice: IInvoice | undefined = result?.data || result;

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setCompanyLoading(true);
        const apiDomain = config.apiDomain || config.customerDomain || "";
        const response = await appFetch(`${apiDomain}/companies/me`, {
          method: "GET",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompanyData(data);
        }
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  // Format address from company data
  const formatAddress = (addressData: any) => {
    if (!addressData) return "Address not available";
    
    const parts = [
      addressData.address_line1,
      addressData.address_line2,
      addressData.city,
      addressData.state?.state_name,
      addressData.country?.country_name,
      addressData.pincode,
    ].filter(Boolean);
    
    return parts.join(", ");
  };

  // Get company details
  const companyName = companyData?.company?.company_name || "Company Name";
  const companyAddress = formatAddress(companyData?.address);

  // Debug logging
  React.useEffect(() => {
    if (result && !loading) {
      console.log("Invoice Detail - API Response:", result);
      console.log("Invoice Detail - Extracted Invoice:", invoice);
    }
  }, [result, loading]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const apiDomain = config.apiDomain || config.customerDomain || "";
        const response = await appFetch(
          `${apiDomain}${invoices.deleteInvoice(invoiceId)}`,
          { method: "DELETE" }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          showToastMessage("Invoice deleted successfully", "success");
          router.push("/invoices");
        } else {
          showToastMessage(result.message || "Failed to delete invoice", "error");
        }
      } catch (error: any) {
        showToastMessage(error?.message || "Failed to delete invoice", "error");
      }
    }
  };

  if (loading || companyLoading) {
    return <BBLoader />;
  }

  if (!invoice || !invoice.invoice_number) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Invoice not found</Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Invoice ID: {invoiceId}
        </Typography>
        {result && (
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Response: {JSON.stringify(result).substring(0, 200)}...
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <BBTitle title={`Invoice ${invoice.invoice_number}`} />
            <Chip
              label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              color={statusColorMap[invoice.status] || "default"}
              sx={{ mt: 1 }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={() => {
                window.print();
              }}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit2 size={18} />}
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<Send size={18} />}
              disabled={invoice.status === "sent" || invoice.status === "paid"}
            >
              Send
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Invoice View - PDF Like Display */}
        <Paper sx={{ p: 0 }} className="printable-invoice">
          <InvoiceDetailView
            invoice={invoice}
            companyName={companyName}
            companyAddress={companyAddress}
          />
        </Paper>
      </Stack>
    </Box>
  );
}
