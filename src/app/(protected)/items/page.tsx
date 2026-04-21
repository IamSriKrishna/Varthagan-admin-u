"use client";

import { useState, useEffect } from "react";
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
import { Edit, Eye, Package, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import { BBButton, BBDialog, BBInputBase, BBLoader } from "@/lib";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Item } from "@/models/item.model";
import { itemService } from "@/services/itemService";

// ── Helpers ────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#e8edff", color: "#3d52c7" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fff3cd", color: "#92400e" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#fef9c3", color: "#854d0e" },
];

function getAvatarStyle(name: string) {
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage, search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itemService.getItems(page + 1, rowsPerPage, search);
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
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
      await itemService.deleteItem(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: ITableColumn<Item>[] = [
    {
      key: "name",
      label: "Item",
      render: (row: Item) => {
        const style = getAvatarStyle(row.name);
        return (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
            onClick={() => router.push(`/items/${row.id}`)}
          >
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
                flexShrink: 0,
              }}
            >
              {getInitials(row.name)}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#4f63d2",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.3,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <HighlightedCell value={row.name} search={search} />
              </Typography>
              {row.item_details?.sku && (
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.02em",
                    mt: 0.1,
                  }}
                >
                  {row.item_details.sku}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (row: Item) => {
        const isGoods = row.type === "goods";
        return (
          <Chip
            label={isGoods ? "Goods" : "Service"}
            size="small"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              height: 22,
              borderRadius: "6px",
              bgcolor: isGoods ? "#f0f4ff" : "#f0fdf4",
              color: isGoods ? "#4f63d2" : "#065f46",
              border: "1px solid",
              borderColor: isGoods ? "#c7d2fe" : "#bbf7d0",
            }}
          />
        );
      },
    },
    {
      key: "id",
      label: "SKU",
      render: (row: Item) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: row.item_details?.sku ? "#374151" : "#d1d5db",
            letterSpacing: "0.02em",
          }}
        >
          <HighlightedCell value={row.item_details?.sku || "—"} search={search} />
        </Typography>
      ),
    },
    {
      key: "item_details",
      label: "Structure",
      render: (row: Item) => {
        const isVariants = row.item_details?.structure === "variants";
        return (
          <Chip
            label={isVariants ? "Variants" : "Single"}
            size="small"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              height: 22,
              borderRadius: "6px",
              bgcolor: isVariants ? "#fdf4ff" : "#f8f9fc",
              color: isVariants ? "#7c3aed" : "#6b7280",
              border: "1px solid",
              borderColor: isVariants ? "#e9d5ff" : "#e5e7eb",
            }}
          />
        );
      },
    },
    {
      key: "sales_info",
      label: "Variants",
      render: (row: Item) =>
        row.item_details?.structure === "variants" ? (
          <Chip
            label={`${row.item_details?.variants?.length || 0} variants`}
            size="small"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              height: 22,
              borderRadius: "6px",
              bgcolor: "#f0f4ff",
              color: "#4f63d2",
              border: "1px solid #c7d2fe",
            }}
          />
        ) : (
          <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
        ),
    },
    {
      key: "action" as any,
      label: "",
      render: (row: Item) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiTableRow-root:hover &": { opacity: 1 },
          }}
        >
          <Tooltip title="View item" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/items/${row.id}`)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: "#0369a1", bgcolor: "#e0f2fe",
                "&:hover": { bgcolor: "#bae6fd", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <Eye size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit item" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/items/${row.id}/edit`)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: "#4f63d2", bgcolor: "#f0f4ff",
                "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <Edit size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete item" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row.id)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: "#ef4444", bgcolor: "#fef2f2",
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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8f9fc" }}>
      <BBLoader enabled={loading} />

      {/* ── Page header ──────────────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, bgcolor: "#ffffff", borderBottom: "1px solid #f0f0f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 46, height: 46, borderRadius: "13px",
                background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(79,99,210,0.3)", flexShrink: 0,
              }}
            >
              <Package size={22} color="white" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.4px", lineHeight: 1.15 }}>
                Items
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", mt: 0.25 }}>
                {total} item{total !== 1 ? "s" : ""} in inventory
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            onClick={() => router.push("/items/create")}
            startIcon={<Plus size={16} />}
            sx={{
              px: 2.5, py: 1.1, borderRadius: "11px",
              background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
              boxShadow: "0 4px 14px rgba(79,99,210,0.35)",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.875rem", textTransform: "none",
              "&:hover": { background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)", boxShadow: "0 6px 20px rgba(79,99,210,0.45)", transform: "translateY(-1px)" },
              transition: "all 0.2s ease",
            }}
          >
            Create Item
          </BBButton>
        </Stack>
      </Box>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Box
            sx={{
              display: "flex", alignItems: "flex-start", gap: 1.5, p: 2,
              bgcolor: "#fff5f5", border: "1px solid #fee2e2", borderRadius: "12px",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", color: "#991b1b", fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3, mt: 2.5, borderRadius: "14px 14px 0 0",
          border: "1px solid #eeeff5", borderBottom: "none",
          bgcolor: "#ffffff", px: 2.5, py: 2,
          display: "flex", alignItems: "center", gap: 2,
        }}
      >
        <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 380 }}>
          <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <Search size={15} />
          </Box>
          <BBInputBase
            label=""
            name="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search items by name or SKU…"
            sx={{ pl: 4.5 }}
          />
        </Box>
        {search && (
          <Chip
            label={`${items.length} result${items.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ fontSize: "0.75rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", bgcolor: "#f0f4ff", color: "#4f63d2", border: "1px solid #c7d2fe", borderRadius: "8px" }}
          />
        )}
      </Box>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          mx: 3, mb: 3,
          borderRadius: "0 0 14px 14px",
          border: "1px solid #eeeff5", borderTop: "none",
          bgcolor: "#ffffff", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        {items.length === 0 && !loading ? (
          /* ── Empty state ── */
          <Box
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", py: 8, gap: 2,
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "16px",
                background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(79,99,210,0.25)",
              }}
            >
              <Package size={26} color="white" />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
                {search ? "No items found" : "No items yet"}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                {search ? `No results for "${search}"` : "Create your first item to get started"}
              </Typography>
            </Box>
            {!search && (
              <BBButton
                variant="contained"
                onClick={() => router.push("/items/create")}
                startIcon={<Plus size={15} />}
                sx={{
                  mt: 1, borderRadius: "10px", textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                  background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 14px rgba(79,99,210,0.3)",
                  "&:hover": { background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)" },
                }}
              >
                Create Item
              </BBButton>
            )}
          </Box>
        ) : (
          <BBTable
            columns={columns}
            data={items}
            pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRowsPerPage) => { setRowsPerPage(newRowsPerPage); setPage(0); }}
            sx={{
              "& .MuiTableHead-root .MuiTableCell-root": {
                bgcolor: "#fafbff", color: "#6b7280", fontWeight: 600, fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.06em",
                fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid #eeeff5", py: 1.5,
              },
              "& .MuiTableBody-root .MuiTableRow-root": {
                cursor: "pointer", transition: "background 0.12s ease",
                "&:hover": { bgcolor: "#fafbff" },
              },
              "& .MuiTableBody-root .MuiTableCell-root": {
                borderBottom: "1px solid #f5f5fa", py: 1.5,
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        )}
      </Box>

      {/* ── Delete dialog ─────────────────────────────────────────────── */}
      <BBDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingId(null); }}
        title="Delete Item"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                display: "flex", alignItems: "flex-start", gap: 2, p: 2,
                bgcolor: "#fff5f5", border: "1px solid #fee2e2", borderRadius: "10px", mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: "8px", bgcolor: "#fee2e2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, mt: 0.25,
                }}
              >
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#991b1b", fontFamily: "'DM Sans', sans-serif", mb: 0.5 }}>
                  This action cannot be undone
                </Typography>
                <Typography sx={{ fontSize: "0.8125rem", color: "#b91c1c", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                  This item and all its associated data — including variants, pricing, and inventory records — will be permanently removed.
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              Are you sure you want to permanently delete this item?
            </Typography>
          </Box>
        }
        onConfirm={handleConfirmDelete}
        confirmText={deleting ? "Deleting…" : "Delete Item"}
        cancelText="Keep Item"
        confirmColor="error"
      />
    </Box>
  );
}