"use client";

import { invoices } from "@/constants/apiConstants";
import { config } from "@/config";
import { IInvoice } from "@/models/IInvoice";
import useFetch from "@/hooks/useFetch";
import { BBLoader } from "@/lib";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";
import {
  Box,
  Stack,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Edit2, Send, Trash2 } from "lucide-react";

// ── Brand tokens (kept in sync with InvoiceDetailView) ──────────
const GRADIENT = "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)";
const INK = "#151726";
const SUB = "#7B7F99";

const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
  draft: { bg: "#F4F2FF", color: "#6C3FD1", border: "#D8CDFB" },
  sent: { bg: "#EEF6FF", color: "#1D6FD1", border: "#C6E0FB" },
  partial: { bg: "#FFFBEB", color: "#92400E", border: "#FBBF24" },
  paid: { bg: "#F0FDF6", color: "#15803D", border: "#6DDC98" },
  overdue: { bg: "#FFF5F5", color: "#C0392B", border: "#F5A5A5" },
  void: { bg: "#F5F5F7", color: "#6B6F80", border: "#DADCE3" },
};

const pageStyles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    p: { xs: 1.5, sm: 2.5, lg: 3.5 },
    bgcolor: "#F5F6FB",
    backgroundImage:
      "radial-gradient(circle at top left, rgba(139,92,246,0.08), transparent 32%), radial-gradient(circle at top right, rgba(34,211,238,0.07), transparent 28%)",
  },
  content: {
    width: "100%",
    maxWidth: "1600px",
    mx: "auto",
  },
  headerCard: {
    borderRadius: "20px",
    border: "1px solid rgba(226,228,240,0.9)",
    bgcolor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(14px)",
    p: { xs: 2, md: 2.75 },
    boxShadow: "0 16px 40px -28px rgba(41,35,90,0.35)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
    gap: 2,
    mb: 0,
  },
  backRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1,
  },
  backButton: {
    color: SUB,
    border: "1px solid #E4E6F0",
    borderRadius: "8px",
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#FAFAFF", borderColor: "#D8CDFB" },
  },
  eyebrow: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9A79E8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    flexWrap: "wrap" as const,
  },
  pageTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: { xs: "22px", md: "28px", xl: "30px" },
    color: INK,
    letterSpacing: "-0.3px",
  },
  statusChip: (status: string) => {
    const s = statusStyles[status] || statusStyles.draft;
    return {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      fontSize: "11px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.6px",
      px: 1.4,
      py: 0.5,
      borderRadius: "20px",
      bgcolor: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      display: "inline-block",
      lineHeight: 1.4,
    };
  },
  metaText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: SUB,
    mt: 0.5,
  },
  actionsRow: {
    display: "grid",
    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, auto)" },
    gap: 1,
    justifyContent: { xs: "stretch", sm: "end" },
  },
  outlinedBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "none" as const,
    color: "#4B4F6B",
    borderColor: "#E0E2EE",
    borderRadius: "10px",
    px: 2,
    bgcolor: "#fff",
    width: { xs: "100%", sm: "auto" },
    "&:hover": {
      borderColor: "#C9BEF7",
      bgcolor: "#FAFAFF",
    },
    minHeight: 42,
    whiteSpace: "nowrap",
  },
  primaryBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    textTransform: "none" as const,
    color: "#fff",
    borderRadius: "10px",
    px: 2.2,
    background: GRADIENT,
    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.28)",
    width: { xs: "100%", sm: "auto" },
    "&:hover": {
      background: GRADIENT,
      opacity: 0.92,
      boxShadow: "0 6px 16px rgba(139, 92, 246, 0.36)",
    },
    "&.Mui-disabled": {
      background: "#E9EAF3",
      color: "#B4B7C9",
      boxShadow: "none",
    },
    minHeight: 42,
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "none" as const,
    color: "#C0392B",
    borderColor: "#F5D6D3",
    borderRadius: "10px",
    px: 2,
    bgcolor: "#fff",
    width: { xs: "100%", sm: "auto" },
    "&:hover": {
      borderColor: "#EFA9A2",
      bgcolor: "#FFF7F6",
    },
    minHeight: 42,
    whiteSpace: "nowrap",
  },
  invoiceFrame: {
    borderRadius: { xs: "16px", md: "22px" },
    border: "1px solid #E6E8F3",
    bgcolor: "#fff",
    boxShadow: "0 20px 60px -24px rgba(93, 68, 210, 0.16)",
    overflow: "hidden",
    width: "100%",
  },
  errorBox: {
    borderRadius: "16px",
    border: "1px solid #F5D6D3",
    bgcolor: "#FFF7F6",
    p: 3,
    maxWidth: 520,
    mx: "auto",
    mt: 6,
    textAlign: "center" as const,
  },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const { data: result, loading } = useFetch<any>({
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
      <Box sx={pageStyles.page}>
        <Box sx={pageStyles.errorBox}>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#C0392B", fontSize: 15 }}>
            Invoice not found
          </Typography>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: SUB, mt: 1 }}>
            Invoice ID: {invoiceId}
          </Typography>
          {result && (
            <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#B4B7C9", mt: 1.5, wordBreak: "break-word" }}>
              {JSON.stringify(result).substring(0, 200)}...
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/invoices")}
            sx={{ ...pageStyles.outlinedBtn, mt: 2.5 }}
          >
            Back to Invoices
          </Button>
        </Box>
      </Box>
    );
  }

  const statusLabel = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

  return (
    <Box sx={pageStyles.page}>
      <Stack spacing={3} sx={pageStyles.content}>
        {/* ── Header with Actions ── */}
        <Box sx={pageStyles.headerCard}>
          <Box sx={pageStyles.backRow}>
            <Tooltip title="Back to invoices">
              <IconButton size="small" sx={pageStyles.backButton} onClick={() => router.push("/invoices")}>
                <ArrowLeft size={16} />
              </IconButton>
            </Tooltip>
            <Typography sx={pageStyles.eyebrow}>Invoices</Typography>
          </Box>

          <Box sx={pageStyles.topBar}>
            <Box>
              <Box sx={pageStyles.titleRow}>
                <Typography sx={pageStyles.pageTitle}>Invoice #{invoice.invoice_number}</Typography>
                <Box component="span" sx={pageStyles.statusChip(invoice.status)}>
                  {statusLabel}
                </Box>
              </Box>
              <Typography sx={pageStyles.metaText}>
                Due {dayjs(invoice.due_date).format("DD MMM YYYY")}
                {invoice.customer?.display_name ? ` · ${invoice.customer.display_name}` : ""}
              </Typography>
            </Box>

            <Box sx={pageStyles.actionsRow}>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={() => window.print()}
                sx={pageStyles.outlinedBtn}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit2 size={16} />}
                onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                sx={pageStyles.outlinedBtn}
              >
                Edit
              </Button>
              <Button
                startIcon={<Send size={16} />}
                disabled={invoice.status === "sent" || invoice.status === "paid"}
                sx={pageStyles.primaryBtn}
              >
                Send
              </Button>
              <Button
                variant="outlined"
                startIcon={<Trash2 size={16} />}
                onClick={handleDelete}
                sx={pageStyles.deleteBtn}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ── Invoice View - PDF Like Display ── */}
        <Box sx={pageStyles.invoiceFrame} className="printable-invoice">
          <InvoiceDetailView
            invoice={invoice}
            companyName={companyName}
            companyAddress={companyAddress}
          />
        </Box>
      </Stack>
    </Box>
  );
}