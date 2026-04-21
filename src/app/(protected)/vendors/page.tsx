"use client";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Vendor, VendorListResponse } from "@/models/vendor.model";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { Building2, Mail, PencilLine, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { vendorService } from "@/lib/api/vendorService";

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#e8edff", color: "#3d52c7" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fff3cd", color: "#92400e" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

function getAvatarStyle(name: string) {
  const idx =
    name
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function getPrimaryContact(vendor: Vendor): string {
  return vendor.work_phone || vendor.mobile || "—";
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const response: VendorListResponse = await vendorService.getVendors(
        page + 1,
        rowsPerPage,
        debouncedSearch.trim() || undefined
      );
      if (response.success) {
        setVendors(response.data || []);
        setTotalCount(response.pagination?.total || 0);
      } else {
        showToastMessage("Failed to fetch vendors", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch vendors", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleDeleteVendor = useCallback(
    async (id: string | number) => {
      try {
        await vendorService.deleteVendor(id);
        showToastMessage("Vendor deleted successfully", "success");
        fetchVendors();
        setOpen(false);
      } catch (error: any) {
        showToastMessage(error.message || "Failed to delete vendor", "error");
      }
    },
    [fetchVendors]
  );

  const handleDelete = async () => {
    if (!selectedId) return;
    await handleDeleteVendor(selectedId);
  };

  // ── Column definitions ─────────────────────────────────────────────────────

  const columns: ITableColumn<Vendor>[] = [
    {
      key: "display_name" as keyof Vendor,
      label: "Vendor",
      render: (row) => {
        const name = row.display_name || "Unknown";
        const style = getAvatarStyle(name);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: style.bg,
                color: style.color,
                fontFamily: "'DM Sans', sans-serif",
                border: "1.5px solid",
                borderColor: style.color + "33",
              }}
            >
              {getInitials(name)}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                <HighlightedCell value={name} search={filters.search} />
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.02em",
                }}
              >
                #{String(row.id || "").padStart(5, "0")}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: "email_address" as keyof Vendor,
      label: "Email",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.email_address ? (
            <>
              <Mail size={13} color="#9ca3af" />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#4f63d2",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <HighlightedCell
                  value={row.email_address}
                  search={filters.search}
                />
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "work_phone" as keyof Vendor,
      label: "Phone",
      render: (row) => {
        const contact = getPrimaryContact(row);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {contact !== "—" && <Phone size={13} color="#9ca3af" />}
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontFamily: "'DM Mono', monospace",
                color: contact === "—" ? "#d1d5db" : "#374151",
                letterSpacing: "0.02em",
              }}
            >
              {contact}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "vendor_language" as keyof Vendor,
      label: "Language",
      render: (row) =>
        row.vendor_language ? (
          <Chip
            label={row.vendor_language}
            size="small"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: "#f0f4ff",
              color: "#4f63d2",
              border: "1px solid #c7d2fe",
              borderRadius: "6px",
              height: 22,
            }}
          />
        ) : (
          <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
        ),
    },
    {
      key: "created_at" as keyof Vendor,
      label: "Registered",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#6b7280",
            letterSpacing: "0.01em",
          }}
        >
          {dayjs(row.created_at).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      key: "action" as any,
      label: "",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiTableRow-root:hover &": { opacity: 1 },
          }}
        >
          <Tooltip title="Edit vendor" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/vendors/vendor/${row.id}`)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#4f63d2",
                bgcolor: "#f0f4ff",
                "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <PencilLine size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete vendor" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedId(row.id || "");
                setOpen(true);
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#ef4444",
                bgcolor: "#fef2f2",
                "&:hover": { bgcolor: "#fee2e2", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      <BBLoader enabled={loading} />

      {/* ── Page header ──────────────────────────────────────────────────── */}
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
            {/* Icon badge */}
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(79, 99, 210, 0.3)",
                flexShrink: 0,
              }}
            >
              <Users size={22} color="white" />
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
                Vendors
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalCount} vendor{totalCount !== 1 ? "s" : ""} registered
              </Typography>
            </Box>
          </Box>

          {/* Add vendor */}
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/vendors/vendor/new")}
            startIcon={<Plus size={16} />}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: "11px",
              background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
              boxShadow: "0 4px 14px rgba(79, 99, 210, 0.35)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)",
                boxShadow: "0 6px 20px rgba(79, 99, 210, 0.45)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Add Vendor
          </BBButton>
        </Stack>
      </Box>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
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
          gap: 2,
        }}
      >
        {/* Search */}
        <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 380 }}>
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Search size={15} />
          </Box>
          <BBInputBase
            label=""
            name="search"
            value={filters.search}
            onChange={(e) => handleTypeChange("search", e.target.value)}
            placeholder="Search by name, email, or company…"
            sx={{ pl: 4.5 }}
          />
        </Box>

        {/* Stat pill */}
        {filters.search && (
          <Chip
            label={`${vendors.length} result${vendors.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: "#f0f4ff",
              color: "#4f63d2",
              border: "1px solid #c7d2fe",
              borderRadius: "8px",
            }}
          />
        )}
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
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
        <BBTable
          data={vendors}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
          sx={{
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: "#fafbff",
              color: "#6b7280",
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: "'DM Sans', sans-serif",
              borderBottom: "1px solid #eeeff5",
              py: 1.5,
            },
            "& .MuiTableBody-root .MuiTableRow-root": {
              cursor: "pointer",
              transition: "background 0.12s ease",
              "&:hover": { bgcolor: "#fafbff" },
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              borderBottom: "1px solid #f5f5fa",
              py: 1.5,
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </Box>

      {/* ── Delete dialog ─────────────────────────────────────────────────── */}
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Vendor"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            {/* Warning icon strip */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                bgcolor: "#fff5f5",
                border: "1px solid #fee2e2",
                borderRadius: "10px",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#991b1b",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.5,
                  }}
                >
                  This action cannot be undone
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: "#b91c1c",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  All data associated with this vendor — including contacts,
                  purchase orders, and transaction history — will be permanently
                  removed.
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6b7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Are you sure you want to permanently delete this vendor?
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete Vendor"
        cancelText="Keep Vendor"
        confirmColor="error"
      />
    </Box>
  );
}