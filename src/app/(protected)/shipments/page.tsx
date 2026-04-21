"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  InputBase,
} from "@mui/material";
import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Truck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import { BBButton, BBDialog, BBLoader } from "@/lib";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Shipment, ShipmentStatus } from "@/models/shipment.model";
import { shipmentService } from "@/services/shipmentService";
import { showToastMessage } from "@/utils/toastUtil";
import dayjs from "dayjs";

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterTab = "all" | ShipmentStatus;

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { bg: string; color: string; border: string; dot: string; label: string }
> = {
  created: {
    bg: "#f8fafc",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
    label: "Created",
  },
  shipped: {
    bg: "#eff6ff",
    color: "#2563eb",
    border: "#bfdbfe",
    dot: "#3b82f6",
    label: "Shipped",
  },
  in_transit: {
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
    dot: "#f59e0b",
    label: "In transit",
  },
  delivered: {
    bg: "#ecfdf5",
    color: "#059669",
    border: "#a7f3d0",
    dot: "#10b981",
    label: "Delivered",
  },
  cancelled: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    dot: "#ef4444",
    label: "Cancelled",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const FONT = "'Sora', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  status,
  count,
}: {
  status: ShipmentStatus;
  count: number;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "#ffffff",
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderRight: "1px solid #eeede8",
        "&:last-child": { borderRight: "none" },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
        }}
      />
      <Box>
        <Typography
          sx={{
            fontSize: "0.6rem",
            fontWeight: 600,
            color: "#9c9a93",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: FONT,
          }}
        >
          {cfg.label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#1c1b18",
            letterSpacing: "-0.3px",
            fontFamily: FONT,
            lineHeight: 1.2,
            mt: 0.25,
          }}
        >
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("created");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

useEffect(() => { fetchShipments(); }, [page, rowsPerPage, search, activeFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getShipments(page + 1, rowsPerPage, search);
      let filteredData = response.data || [];
      
      // Apply client-side status filtering
      if (activeFilter !== "all") {
        filteredData = filteredData.filter((shipment) => shipment.status === activeFilter);
      }
      
      setShipments(filteredData);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await shipmentService.deleteShipment(deletingId);
      showToastMessage("Shipment deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchShipments();
    } catch (err) {
      showToastMessage("Failed to delete shipment", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenUpdateStatusDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setUpdateStatusDialogOpen(true);
  };

  const handleUpdateShipmentStatus = async () => {
    if (!selectedShipment) return;
    try {
      setIsUpdatingStatus(true);
      await shipmentService.updateShipmentStatus(selectedShipment.id, {
        status: newStatus,
      });
      setShipments((prev) =>
        prev.map((s) =>
          s.id === selectedShipment.id ? { ...s, status: newStatus } : s
        )
      );
      showToastMessage("Shipment status updated successfully", "success");
      setUpdateStatusDialogOpen(false);
      setSelectedShipment(null);
    } catch (err) {
      showToastMessage("Failed to update shipment status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: ITableColumn<Shipment>[] = [
    {
      key: "shipment_no",
      label: "Shipment",
      render: (row: Shipment) => (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          onClick={() => router.push(`/shipments/${row.id}`)}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "9px",
              bgcolor: "#f5f4f0",
              border: "1px solid #eeede8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Truck size={14} color="#9c9a93" />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#2563eb",
                fontFamily: FONT,
                letterSpacing: "-0.1px",
                lineHeight: 1.3,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <HighlightedCell value={row.shipment_no} search={search} />
            </Typography>
            {row.tracking_no && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#9c9a93",
                  fontFamily: MONO,
                  letterSpacing: "0.02em",
                  mt: 0.25,
                }}
              >
                {row.tracking_no}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: "carrier",
      label: "Carrier",
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: "0.8125rem",
            fontFamily: FONT,
            fontWeight: 500,
            color: row.carrier ? "#5c5a53" : "#d4d1c8",
          }}
        >
          <HighlightedCell value={row.carrier || "—"} search={search} />
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Shipment) => {
        const cfg = STATUS_CONFIG[row.status];
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              px: 1.25,
              py: 0.5,
              borderRadius: "6px",
              bgcolor: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: cfg.dot,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: cfg.color,
                fontFamily: FONT,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {cfg.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "ship_date",
      label: "Ship date",
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: "0.8125rem",
            fontFamily: FONT,
            color: "#5c5a53",
          }}
        >
          {dayjs(row.ship_date).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      key: "shipping_charges",
      label: "Charges",
      render: (row: Shipment) => (
        <Typography
          sx={{
            fontSize: "0.8125rem",
            fontFamily: MONO,
            color: "#1c1b18",
            fontWeight: 500,
          }}
        >
          ₹{row.shipping_charges?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      key: "action" as any,
      label: "",
      render: (row: Shipment) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            opacity: 0,
            transition: "opacity 0.15s ease",
            justifyContent: "flex-end",
            ".MuiTableRow-root:hover &": { opacity: 1 },
          }}
        >
          {[
            {
              icon: <CheckCircle size={12} />,
              title: "Update status",
              cls: "upd",
              hoverBg: "#f5f3ff",
              hoverBorder: "#ddd6fe",
              hoverColor: "#7c3aed",
              onClick: () => handleOpenUpdateStatusDialog(row),
            },
            {
              icon: <Eye size={12} />,
              title: "View shipment",
              cls: "view",
              hoverBg: "#eff6ff",
              hoverBorder: "#bfdbfe",
              hoverColor: "#2563eb",
              onClick: () => router.push(`/shipments/${row.id}`),
            },
            {
              icon: <Edit size={12} />,
              title: "Edit shipment",
              cls: "edit",
              hoverBg: "#ecfdf5",
              hoverBorder: "#a7f3d0",
              hoverColor: "#059669",
              onClick: () => router.push(`/shipments/${row.id}/edit`),
            },
            {
              icon: <Trash2 size={12} />,
              title: "Delete shipment",
              cls: "del",
              hoverBg: "#fef2f2",
              hoverBorder: "#fecaca",
              hoverColor: "#dc2626",
              onClick: () => handleDeleteClick(row.id),
            },
          ].map((btn) => (
            <Tooltip title={btn.title} arrow key={btn.title}>
              <IconButton
                size="small"
                onClick={btn.onClick}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  border: "1px solid #eeede8",
                  bgcolor: "#ffffff",
                  color: "#9c9a93",
                  "&:hover": {
                    bgcolor: btn.hoverBg,
                    borderColor: btn.hoverBorder,
                    color: btn.hoverColor,
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.13s ease",
                }}
              >
                {btn.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      ),
    },
  ];

  // ── Computed stats ───────────────────────────────────────────────────────────

  const statuses: ShipmentStatus[] = [
    "created",
    "shipped",
    "in_transit",
    "delivered",
    "cancelled",
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "#f5f4f0",
          fontFamily: FONT,
        }}
      >
        <BBLoader enabled={loading} />

        {/* ── Page header ── */}
        <Box
          sx={{
            px: 3.5,
            pt: 2.5,
            pb: 2.5,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #eeede8",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  bgcolor: "#1c1b18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Truck size={20} color="white" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1c1b18",
                    fontFamily: FONT,
                    letterSpacing: "-0.4px",
                    lineHeight: 1.2,
                  }}
                >
                  Shipments
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#9c9a93",
                    fontFamily: FONT,
                    mt: 0.25,
                  }}
                >
                  {total} shipment{total !== 1 ? "s" : ""} in system
                </Typography>
              </Box>
            </Box>

            <BBButton
              variant="contained"
              onClick={() => router.push("/shipments/create")}
              startIcon={<Plus size={14} />}
              sx={{
                px: 2.25,
                py: 1,
                borderRadius: "10px",
                bgcolor: "#1c1b18",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.8125rem",
                textTransform: "none",
                letterSpacing: "-0.1px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#2d2c28",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.15s ease",
              }}
            >
              Create shipment
            </BBButton>
          </Stack>
        </Box>

        {/* ── Stats bar ── */}
        <Box
          sx={{
            display: "flex",
            borderBottom: "1px solid #eeede8",
            bgcolor: "#ffffff",
            "& > *": { borderRight: "1px solid #eeede8" },
            "& > *:last-child": { borderRight: "none" },
          }}
        >
          {statuses.map((s) => (
            <StatCard key={s} status={s} count={0} />
          ))}
        </Box>

        {/* ── Error banner ── */}
        {error && (
          <Box sx={{ px: 3.5, pt: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.75,
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
              }}
            >
              <AlertTriangle size={15} color="#dc2626" />
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "#dc2626",
                  fontFamily: FONT,
                }}
              >
                {error}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Toolbar ── */}
        <Box
          sx={{
            px: 3.5,
            py: 2,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #eeede8",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Search */}
          <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 360 }}>
            <Box
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9c9a93",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <Search size={14} />
            </Box>
            <InputBase
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by shipment number or tracking…"
              sx={{
                width: "100%",
                pl: 4.5,
                pr: 1.5,
                py: 1,
                fontSize: "0.8125rem",
                fontFamily: FONT,
                color: "#1c1b18",
                bgcolor: "#faf9f7",
                border: "1px solid #eeede8",
                borderRadius: "10px",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#d4d1c8" },
                "&.Mui-focused": {
                  bgcolor: "#ffffff",
                  borderColor: "#1c1b18",
                  boxShadow: "0 0 0 3px rgba(28,27,24,0.06)",
                },
                "& ::placeholder": { color: "#9c9a93" },
              }}
            />
          </Box>

          {/* Filter tabs */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {FILTER_TABS.map((tab) => (
              <Box
                key={tab.key}
                component="button"
                onClick={() => {
                  setActiveFilter(tab.key);
                  setPage(0);
                }}
                sx={{
                  px: 1.75,
                  py: 0.875,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor:
                    activeFilter === tab.key ? "#1c1b18" : "#eeede8",
                  bgcolor:
                    activeFilter === tab.key ? "#1c1b18" : "transparent",
                  color:
                    activeFilter === tab.key ? "#ffffff" : "#5c5a53",
                  fontFamily: FONT,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.13s ease",
                  "&:hover":
                    activeFilter !== tab.key
                      ? { borderColor: "#d4d1c8", color: "#1c1b18", bgcolor: "#faf9f7" }
                      : {},
                }}
              >
                {tab.label}
              </Box>
            ))}
          </Box>

          {search && (
            <Chip
              label={`${shipments.length} result${shipments.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: FONT,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                borderRadius: "7px",
                height: 26,
              }}
            />
          )}
        </Box>

        {/* ── Table ── */}
        <Box sx={{ mx: 3.5, my: 3 }}>
          <Box
            sx={{
              bgcolor: "#ffffff",
              border: "1px solid #eeede8",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {shipments.length === 0 && !loading ? (
              /* Empty state */
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    bgcolor: "#f5f4f0",
                    border: "1px solid #eeede8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Truck size={24} color="#9c9a93" />
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "#1c1b18",
                      fontFamily: FONT,
                      letterSpacing: "-0.2px",
                      mb: 0.5,
                    }}
                  >
                    {search ? "No shipments found" : "No shipments yet"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#9c9a93",
                      fontFamily: FONT,
                    }}
                  >
                    {search
                      ? `No results for "${search}"`
                      : "Create your first shipment to get started"}
                  </Typography>
                </Box>
                {!search && (
                  <BBButton
                    variant="contained"
                    onClick={() => router.push("/shipments/create")}
                    startIcon={<Plus size={14} />}
                    sx={{
                      mt: 0.5,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontFamily: FONT,
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      bgcolor: "#1c1b18",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#2d2c28" },
                    }}
                  >
                    Create shipment
                  </BBButton>
                )}
              </Box>
            ) : (
              <BBTable
                columns={columns}
                data={shipments}
                pagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={total}
                onPageChange={(newPage) => setPage(newPage)}
                onRowsPerPageChange={(n) => {
                  setRowsPerPage(n);
                  setPage(0);
                }}
                sx={{
                  "& .MuiTableHead-root .MuiTableCell-root": {
                    bgcolor: "#faf9f7",
                    color: "#9c9a93",
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                    borderBottom: "1px solid #eeede8",
                    py: 1.5,
                  },
                  "& .MuiTableBody-root .MuiTableRow-root": {
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                    "&:hover": { bgcolor: "#faf9f7" },
                  },
                  "& .MuiTableBody-root .MuiTableCell-root": {
                    borderBottom: "1px solid #f5f4f0",
                    py: 1.75,
                    fontFamily: FONT,
                  },
                  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                    { borderBottom: "none" },
                  "& .MuiTablePagination-root": {
                    borderTop: "1px solid #eeede8",
                    bgcolor: "#faf9f7",
                    fontFamily: FONT,
                    fontSize: "0.75rem",
                    color: "#9c9a93",
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* ── Delete dialog ── */}
        <BBDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeletingId(null);
          }}
          title="Delete shipment"
          maxWidth="sm"
          content={
            <Box sx={{ pt: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  p: 1.75,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "8px",
                    bgcolor: "#fecaca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.125,
                  }}
                >
                  <AlertTriangle size={14} color="#dc2626" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      color: "#dc2626",
                      fontFamily: FONT,
                      mb: 0.5,
                    }}
                  >
                    Permanent deletion
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#b91c1c",
                      fontFamily: FONT,
                      lineHeight: 1.55,
                    }}
                  >
                    This shipment and all associated tracking information will
                    be permanently removed from the system.
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "#5c5a53",
                  fontFamily: FONT,
                }}
              >
                Are you sure you want to delete this shipment?
              </Typography>
            </Box>
          }
          onConfirm={handleConfirmDelete}
          confirmText={deleting ? "Deleting…" : "Delete shipment"}
          cancelText="Keep shipment"
          confirmColor="error"
        />

        {/* ── Status Update dialog ── */}
        <Dialog
          open={updateStatusDialogOpen}
          onClose={() => setUpdateStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "14px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              border: "1px solid #eeede8",
              fontFamily: FONT,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: "#1c1b18",
              letterSpacing: "-0.2px",
              pb: 2,
              borderBottom: "1px solid #eeede8",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                bgcolor: "#f5f3ff",
                border: "1px solid #ddd6fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#7c3aed",
              }}
            >
              <CheckCircle size={15} />
            </Box>
            <Box>
              Update shipment status
              {selectedShipment && (
                <Typography
                  component="div"
                  sx={{
                    fontSize: "0.75rem",
                    color: "#9c9a93",
                    fontWeight: 400,
                    mt: 0.25,
                    fontFamily: FONT,
                  }}
                >
                  {selectedShipment.shipment_no}
                </Typography>
              )}
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
              {/* Current status */}
              {selectedShipment && (
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#9c9a93",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontFamily: FONT,
                      mb: 0.875,
                    }}
                  >
                    Current status
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "8px",
                      bgcolor:
                        STATUS_CONFIG[selectedShipment.status as ShipmentStatus]
                          .bg,
                      border: `1px solid ${STATUS_CONFIG[selectedShipment.status as ShipmentStatus].border}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor:
                          STATUS_CONFIG[
                            selectedShipment.status as ShipmentStatus
                          ].dot,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color:
                          STATUS_CONFIG[
                            selectedShipment.status as ShipmentStatus
                          ].color,
                        fontFamily: FONT,
                      }}
                    >
                      {
                        STATUS_CONFIG[selectedShipment.status as ShipmentStatus]
                          .label
                      }
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* New status */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#9c9a93",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                    mb: 0.875,
                  }}
                >
                  New status
                </Typography>
                <Select
                  fullWidth
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as ShipmentStatus)
                  }
                  size="small"
                  sx={{
                    fontFamily: FONT,
                    fontSize: "0.8125rem",
                    borderRadius: "10px",
                    bgcolor: "#faf9f7",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#eeede8",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d4d1c8",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1c1b18",
                      borderWidth: "1px",
                    },
                    "& .MuiSelect-select": { fontFamily: FONT },
                  }}
                >
                  {(
                    Object.entries(STATUS_CONFIG) as [
                      ShipmentStatus,
                      (typeof STATUS_CONFIG)[ShipmentStatus]
                    ][]
                  ).map(([value, cfg]) => (
                    <MenuItem
                      key={value}
                      value={value}
                      sx={{ fontFamily: FONT, fontSize: "0.8125rem" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: cfg.dot,
                          }}
                        />
                        {cfg.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{ p: 2.5, borderTop: "1px solid #eeede8", gap: 1 }}
          >
            <Button
              onClick={() => setUpdateStatusDialogOpen(false)}
              sx={{
                textTransform: "none",
                borderRadius: "9px",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 2,
                color: "#5c5a53",
                border: "1px solid #eeede8",
                "&:hover": { bgcolor: "#faf9f7", borderColor: "#d4d1c8" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateShipmentStatus}
              disabled={
                isUpdatingStatus ||
                !newStatus ||
                newStatus === selectedShipment?.status
              }
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "9px",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 2.5,
                bgcolor: "#1c1b18",
                boxShadow: "none",
                "&:hover:not(:disabled)": {
                  bgcolor: "#2d2c28",
                  boxShadow: "none",
                },
                "&:disabled": { opacity: 0.4 },
              }}
            >
              {isUpdatingStatus ? "Updating…" : "Update status"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}