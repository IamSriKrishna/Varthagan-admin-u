"use client";

import { invoices } from "@/constants/apiConstants";
import { config } from "@/config";
import { IInvoice, IInvoiceListResponse } from "@/models/IInvoice";
import useFetch from "@/hooks/useFetch";
import { BBLoader } from "@/lib";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Select,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  SelectChangeEvent,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Plus,
  Search,
  ReceiptText,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #eeeff5",
        borderRadius: "14px",
        bgcolor: "#ffffff",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
        "&:hover": {
          borderColor: color,
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${color}22`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 0.75,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "#1a1d2e",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "13px",
              bgcolor: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              border: `1px solid ${color}22`,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const STATUS_TABS = [
  "All",
  "Draft",
  "Sent",
  "Partial",
  "Paid",
  "Overdue",
  "Void",
  "Issued",
];

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  sent: "Sent",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export default function InvoicesPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [newStatus, setNewStatus] = useState<InvoiceStatus>("sent");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    if (debouncedSearch) params.append("search", debouncedSearch);
    if (activeTab !== "All") params.append("status", activeTab.toLowerCase());

    return params.toString();
  }, [page, rowsPerPage, debouncedSearch, activeTab]);

  const {
    data: result,
    refetch,
    loading,
  } = useFetch<IInvoiceListResponse>({
    url: `${invoices.getInvoices}?${queryParams}`,
    baseUrl: config.apiDomain || config.customerDomain,
  });

  const allInvoices = result?.invoices || [];
  const total = result?.total || 0;

  const paidCount = allInvoices.filter((i) => i.status === "paid").length;
  const overdueCount = allInvoices.filter((i) => i.status === "overdue").length;
  const draftCount = allInvoices.filter((i) => i.status === "draft").length;
  const totalAmount = allInvoices.reduce((s, i) => s + (i.total || 0), 0);

  const handleEdit = (invoice: IInvoice) =>
    router.push(`/invoices/${invoice.id}/edit`);

  const handleDelete = async (invoice: IInvoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return;

    try {
      const apiDomain = config.apiDomain || config.customerDomain || "";

      const res = await appFetch(
        `${apiDomain}${invoices.deleteInvoice(invoice.id || "")}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        showToastMessage("Invoice deleted successfully", "success");
        await refetch();
      } else {
        showToastMessage(data.message || "Failed to delete invoice", "error");
      }
    } catch (err: any) {
      showToastMessage(err?.message || "Failed to delete invoice", "error");
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedInvoice?.id) return;

    setUpdatingStatus(true);

    try {
      const res = await appFetch(`/api/invoices/${selectedInvoice.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.data || data.status)) {
        showToastMessage("Invoice status updated successfully", "success");
        setOpenStatusDialog(false);
        setSelectedInvoice(null);
        await refetch();
      } else {
        showToastMessage(
          data.message || "Failed to update invoice status",
          "error"
        );
      }
    } catch (err: any) {
      showToastMessage(
        err?.message || "Failed to update invoice status",
        "error"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f0f0f5",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(14, 165, 233, 0.3)",
                flexShrink: 0,
              }}
            >
              <ReceiptText size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.15,
                }}
              >
                Invoices
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {total} invoice{total !== 1 ? "s" : ""} registered
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => router.push("/invoices/new")}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                boxShadow: "0 6px 20px rgba(14, 165, 233, 0.45)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            New Invoice
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mx: 3,
          mt: 2.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <StatCard
          label="Total Invoices"
          value={total}
          icon={<ReceiptText size={22} />}
          color="#4f63d2"
          bg="#f0f4ff"
        />

        <StatCard
          label="Paid"
          value={paidCount}
          icon={<CheckCircle2 size={22} />}
          color="#15803d"
          bg="#f0fdf6"
        />

        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={<AlertTriangle size={22} />}
          color="#ef4444"
          bg="#fef2f2"
        />

        <StatCard
          label="Revenue"
          value={`₹${(totalAmount / 100000).toFixed(1)}L`}
          icon={<TrendingUp size={22} />}
          color="#0ea5e9"
          bg="#e0f2fe"
        />
      </Box>

      {/* Toolbar */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: "14px 14px 0 0",
          border: "1px solid #eeeff5",
          borderBottom: "none",
          bgcolor: "#ffffff",
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab}
              size="small"
              onClick={() => {
                setActiveTab(tab);
                setPage(0);
              }}
              sx={{
                borderRadius: "9px",
                px: 1.75,
                py: 0.65,
                fontSize: "0.8rem",
                fontWeight: activeTab === tab ? 700 : 600,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "none",
                color: activeTab === tab ? "#4f63d2" : "#9ca3af",
                bgcolor: activeTab === tab ? "#f0f4ff" : "transparent",
                border:
                  activeTab === tab
                    ? "1px solid #c7d2fe"
                    : "1px solid transparent",
                "&:hover": {
                  bgcolor: activeTab === tab ? "#e0e7ff" : "#f8fbff",
                },
                transition: "all 0.15s ease",
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>

        <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 380 }}>
          <TextField
            placeholder="Search invoices…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 38,
                borderRadius: "10px",
                bgcolor: "#f8f9fc",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8125rem",
                "& fieldset": {
                  borderColor: "#e8eaf0",
                },
                "&:hover fieldset": {
                  borderColor: "#c7d2fe",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                },
              },
            }}
          />
        </Box>

        {searchQuery && (
          <Chip
            label="Filtered"
            size="small"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: "#e0f2fe",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
            }}
          />
        )}
      </Box>

      {/* Table */}
      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: "0 0 14px 14px",
          border: "1px solid #eeeff5",
          borderTop: "none",
          bgcolor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <BBLoader />
          </Box>
        ) : (
          <InvoiceTable
            data={allInvoices}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={setPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(0);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusUpdate={(invoice) => {
              setSelectedInvoice(invoice);
              setNewStatus((invoice.status as InvoiceStatus) || "sent");
              setOpenStatusDialog(true);
            }}
          />
        )}
      </Box>

      {/* Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid #e8eaf0",
            boxShadow: "0 20px 60px rgba(79,99,210,0.15)",
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #0ea5e9, #6366f1)",
            borderRadius: "16px 16px 0 0",
          }}
        />

        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800,
            fontSize: "1rem",
            color: "#1a1d2e",
          }}
        >
          Update Invoice Status
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "#9ca3af",
                mb: 0.5,
              }}
            >
              Invoice
            </Typography>

            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#4f63d2",
              }}
            >
              {selectedInvoice?.invoice_number}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "#9ca3af",
                mb: 0.75,
              }}
            >
              Current Status
            </Typography>

            <Chip
              label={
                STATUS_LABELS[selectedInvoice?.status as InvoiceStatus] ||
                "Unknown"
              }
              size="small"
              sx={{
                height: 22,
                fontSize: "0.7rem",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                bgcolor: "#f0f4ff",
                color: "#4f63d2",
                border: "1px solid #c7d2fe",
                borderRadius: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            />
          </Box>

          <FormControl fullWidth>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "#6b7280",
                mb: 0.75,
                fontWeight: 700,
              }}
            >
              New Status
            </Typography>

            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent<InvoiceStatus>) =>
                setNewStatus(e.target.value as InvoiceStatus)
              }
              size="small"
              disabled={updatingStatus}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: "8px",
                fontSize: "0.8125rem",
              }}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="issued">Issued</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="void">Void</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenStatusDialog(false)}
            disabled={updatingStatus}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "none",
              borderRadius: "8px",
              color: "#6b7280",
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updatingStatus}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
            }}
          >
            {updatingStatus ? "Updating…" : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}