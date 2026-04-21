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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { useDebounce } from "@/hooks/useDebounce";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

type InvoiceStatus = "draft" | "issued" | "sent" | "partial" | "paid" | "overdue" | "void";

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
        border: "1px solid #f1f5f9",
        borderRadius: 3,
        transition: "all 0.2s ease",
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
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" },
];

const STATUS_TABS = ["All", "Draft", "Sent", "Partial", "Paid", "Overdue", "Void","Issued"];

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

  const { data: result, refetch, loading } = useFetch<IInvoiceListResponse>({
    url: `${invoices.getInvoices}?${queryParams}`,
    baseUrl: config.apiDomain || config.customerDomain,
  });

  const allInvoices = result?.invoices || [];
  const total = result?.total || 0;

  const paidCount = allInvoices.filter((i) => i.status === "paid").length;
  const overdueCount = allInvoices.filter((i) => i.status === "overdue").length;
  const draftCount = allInvoices.filter((i) => i.status === "draft").length;
  const totalAmount = allInvoices.reduce((s, i) => s + (i.total || 0), 0);

  const handleEdit = (invoice: IInvoice) => router.push(`/invoices/${invoice.id}/edit`);

  const handleDelete = async (invoice: IInvoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return;
    try {
      const apiDomain = config.apiDomain || config.customerDomain || "";
      const res = await appFetch(`${apiDomain}${invoices.deleteInvoice(invoice.id || "")}`, {
        method: "DELETE",
      });
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
      const url = `/api/invoices/${selectedInvoice.id}/status`;
      
      const res = await appFetch(url, {
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
        showToastMessage(data.message || "Failed to update invoice status", "error");
      }
    } catch (err: any) {
      console.error("Error updating invoice status:", err);
      showToastMessage(err?.message || "Failed to update invoice status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: "Draft",
    issued: "Issued",
    sent: "Sent",
    partial: "Partial",
    paid: "Paid",
    overdue: "Overdue",
    void: "Void",
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        {/* ── Header ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Invoices
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "#64748b", mt: 0.5 }}>
              {total} invoice{total !== 1 ? "s" : ""} · last updated just now
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/invoices/new")}
            sx={{
              bgcolor: "#0f172a",
              borderRadius: 2.5,
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: 0,
              boxShadow: "0 4px 14px rgba(15,23,42,0.25)",
              "&:hover": {
                bgcolor: "#1e293b",
                boxShadow: "0 6px 20px rgba(15,23,42,0.35)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            New Invoice
          </Button>
        </Stack>

        {/* ── Stat Cards ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            label="Total Invoices"
            value={total}
            icon={<ReceiptOutlinedIcon sx={{ fontSize: 22 }} />}
            color="#6366f1"
            bg="#eef2ff"
          />
          <StatCard
            label="Paid"
            value={paidCount}
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 22 }} />}
            color="#16a34a"
            bg="#f0fdf4"
          />
          <StatCard
            label="Overdue"
            value={overdueCount}
            icon={<WarningAmberOutlinedIcon sx={{ fontSize: 22 }} />}
            color="#dc2626"
            bg="#fef2f2"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${(totalAmount / 100000).toFixed(1)}L`}
            icon={<TrendingUpOutlinedIcon sx={{ fontSize: 22 }} />}
            color="#0ea5e9"
            bg="#f0f9ff"
          />
        </Box>

        {/* ── Main Table Card ── */}
        <Card elevation={0} sx={{ border: "1px solid #f1f5f9", borderRadius: 3, overflow: "hidden" }}>
          {/* Toolbar */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={2}
            >
              {/* Status Tabs */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {STATUS_TABS.map((tab) => (
                  <Button
                    key={tab}
                    variant="text"
                    size="small"
                    onClick={() => { setActiveTab(tab); setPage(0); }}
                    sx={{
                      borderRadius: 2,
                      px: 1.75,
                      py: 0.6,
                      fontSize: "0.8rem",
                      fontWeight: activeTab === tab ? 700 : 500,
                      textTransform: "none",
                      color: activeTab === tab ? "#fff" : "#64748b",
                      bgcolor: activeTab === tab ? "#0f172a" : "transparent",
                      "&:hover": {
                        bgcolor: activeTab === tab ? "#1e293b" : "#f1f5f9",
                      },
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab}
                  </Button>
                ))}
              </Stack>

              {/* Search */}
              <TextField
                placeholder="Search invoices…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    fontSize: "0.875rem",
                    bgcolor: "#f8fafc",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": { borderColor: "#0f172a", borderWidth: 1.5 },
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Table */}
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
              onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusUpdate={(invoice) => {
                setSelectedInvoice(invoice);
                setNewStatus((invoice.status as InvoiceStatus) || "sent");
                setOpenStatusDialog(true);
              }}
            />
          )}
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Invoice Status</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Invoice: <strong>{selectedInvoice?.invoice_number}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current Status: <Chip label={STATUS_LABELS[selectedInvoice?.status as InvoiceStatus] || "Unknown"} size="small" />
            </Typography>
            <FormControl fullWidth>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                New Status
              </Typography>
              <Select
                value={newStatus}
                onChange={(e: SelectChangeEvent<InvoiceStatus>) => setNewStatus(e.target.value as InvoiceStatus)}
                sx={{ borderRadius: 1 }}
                disabled={updatingStatus}
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
          <DialogActions>
            <Button variant="text" onClick={() => setOpenStatusDialog(false)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              color="primary"
              variant="contained"
              disabled={updatingStatus}
            >
              {updatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}