"use client";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { RawMaterialBag, RawMaterialListResponse } from "@/models/rawMaterial.model";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { PencilLine, Plus, Search, Trash2, ChevronDown, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { rawMaterialService } from "@/lib/api/rawMaterialService";
import { RAW_MATERIAL_STATUS_COLORS } from "@/constants/rawMaterial.constants";
import RawMaterialDialog from "@/components/rawMaterial/RawMaterialDialog";

// ── Status Config for Timeline ─────────────────────────────────────────────

const MATERIAL_STATUS_CONFIG = {
  available: {
    label: "Available",
    bg: "#ECFDF5",
    color: "#059669",
    dot: "#10B981",
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
  partial: {
    label: "Partial",
    bg: "#FFFBEB",
    color: "#D97706",
    dot: "#F59E0B",
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
  consumed: {
    label: "Consumed",
    bg: "#FEE2E2",
    color: "#DC2626",
    dot: "#EF4444",
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RawMaterialsPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bags, setBags] = useState<RawMaterialBag[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchBags = useCallback(async () => {
    try {
      setLoading(true);
      const response: RawMaterialListResponse = await rawMaterialService.getBags(
        rowsPerPage,
        page * rowsPerPage
      );
      if (response.success) {
        setBags(response.data?.bags || []);
        setTotalCount(response.data?.total || 0);
      } else {
        showToastMessage("Failed to fetch raw materials", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch raw materials", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchBags();
  }, [fetchBags]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // Group bags by purchase order
  const groupBagsByPO = (): { [key: string]: RawMaterialBag[] } => {
    const grouped: { [key: string]: RawMaterialBag[] } = {};
    bags.forEach((bag) => {
      const poId = bag.purchase_order_id;
      if (!grouped[poId]) grouped[poId] = [];
      grouped[poId].push(bag);
    });
    return grouped;
  };

  const groupedBags = groupBagsByPO();
  const groupedBagKeys = Object.keys(groupedBags);

  // Get the first bag for each group to display in the main row
  const displayBags = groupedBagKeys.map((poId) => {
    const poBags = groupedBags[poId].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
    return {
      ...poBags[0],
      _groupSize: poBags.length,
      _allBags: poBags,
    };
  });

  // ── Column definitions ─────────────────────────────────────────────────────

  const columns: ITableColumn<any>[] = [
    {
      key: "action" as any,
      label: "",
      render: (row: any) =>
        row._groupSize > 1 ? (
          <IconButton
            size="small"
            onClick={() => {
              const poId = row.purchase_order_id;
              const newExpanded = new Set(expandedPOs);
              if (newExpanded.has(poId)) {
                newExpanded.delete(poId);
              } else {
                newExpanded.add(poId);
              }
              setExpandedPOs(newExpanded);
            }}
            sx={{
              color: "#4F46E5",
              width: 30,
              height: 30,
              transition: "transform 0.2s",
              transform: expandedPOs.has(row.purchase_order_id) ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={16} />
          </IconButton>
        ) : null,
    },
    {
      key: "product_name" as keyof RawMaterialBag,
      label: "Product Name",
      render: (row) => (
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
            <HighlightedCell value={row.product_name} search={filters.search} />
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "#9ca3af",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.02em",
            }}
          >
            {row.product_id}
          </Typography>
        </Box>
      ),
    },
    {
      key: "vendor_name" as keyof RawMaterialBag,
      label: "Vendor",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "#4f63d2",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <HighlightedCell value={row.vendor_name} search={filters.search} />
        </Typography>
      ),
    },
    {
      key: "purchase_order_no" as keyof RawMaterialBag,
      label: "PO No",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#374151",
            letterSpacing: "0.02em",
          }}
        >
          {row.purchase_order_no}
        </Typography>
      ),
    },
    {
      key: "bag_number" as keyof RawMaterialBag,
      label: "Bag #",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          Bag {row.bag_number}
        </Typography>
      ),
    },
    {
      key: "expected_kg" as keyof RawMaterialBag,
      label: "Expected (KG)",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#374151",
          }}
        >
          {row.expected_kg.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "actual_kg" as keyof RawMaterialBag,
      label: "Actual (KG)",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#374151",
            fontWeight: 600,
          }}
        >
          {row.actual_kg.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "remaining_kg" as keyof RawMaterialBag,
      label: "Remaining (KG)",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontFamily: "'DM Mono', monospace",
            color: "#374151",
            fontWeight: 600,
          }}
        >
          {(row.expected_kg - row.actual_kg).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "status" as keyof RawMaterialBag,
      label: "Status",
      render: (row) => (
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            bgcolor:
              RAW_MATERIAL_STATUS_COLORS[row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS] +
              "20",
            color:
              RAW_MATERIAL_STATUS_COLORS[row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS],
            border: `1px solid ${RAW_MATERIAL_STATUS_COLORS[row.status as keyof typeof RAW_MATERIAL_STATUS_COLORS]}`,
            borderRadius: "6px",
            height: 22,
          }}
        />
      ),
    },
    {
      key: "created_at" as keyof RawMaterialBag,
      label: "Created",
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
  ];

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <BBTitle title="Raw Materials" />
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mt: 0.5 }}>
              Manage raw material bags received from purchase orders
            </Typography>
          </Box>
          <BBButton
            variant="contained"
            onClick={() => setDialogOpen(true)}
            startIcon={<Plus size={16} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Receive Materials
          </BBButton>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
        <Stack direction="row" alignItems="center" sx={{ gap: 1, px: 1 }}>
          <Search size={16} color="#94A3B8" />
          <BBInputBase
            name="search"
            label=""
            placeholder="Search by product, vendor, or PO..."
            value={filters.search}
            onChange={(e) => handleTypeChange("search", e.target.value)}
          />
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <BBLoader />
        </Box>
      ) : (
        <>
          <BBTable
            data={displayBags}
            columns={columns}
            pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />

          {/* ── Material Timeline (Expanded rows) ─────────────────────────────────── */}
          {Array.from(expandedPOs).map((poId) => {
            const poBags = groupedBags[poId] || [];
            if (poBags.length <= 1) return null;
            
            const sortedBags = poBags.sort((a, b) => {
              const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
              const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
              return bTime - aTime;
            });

            return (
              <Box
                key={`timeline-${poId}`}
                sx={{
                  backgroundColor: "#F8FAFC",
                  borderTop: "2px solid #F1F5F9",
                  p: 3,
                }}
              >
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", mb: 2.5 }}>
                  Material Timeline for {poBags[0].purchase_order_no || "PO"}
                </Typography>

                <Stack spacing={0}>
                  {sortedBags.map((bag, idx) => {
                    const cfg = MATERIAL_STATUS_CONFIG[bag.status as keyof typeof MATERIAL_STATUS_CONFIG] || MATERIAL_STATUS_CONFIG.available;
                    const isLast = idx === sortedBags.length - 1;

                    return (
                      <Stack key={bag.id} direction="row" spacing={2}>
                        {/* Timeline dot and line */}
                        <Stack sx={{ alignItems: "center", mt: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor: cfg.bg,
                              border: `2px solid ${cfg.dot}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: cfg.dot }} />
                          </Box>
                          {!isLast && (
                            <Box
                              sx={{
                                width: 2,
                                height: 60,
                                backgroundColor: "#CBD5E1",
                                mt: -1,
                              }}
                            />
                          )}
                        </Stack>

                        {/* Bag details */}
                        <Stack sx={{ flex: 1, pb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                                Bag {bag.bag_number}
                              </Typography>
                              <Typography sx={{ fontSize: "12px", color: "#64748B", mt: 0.25 }}>
                                {dayjs(bag.created_at).format("DD MMM YYYY, hh:mm A")}
                              </Typography>
                            </Box>
                            <Chip
                              label={cfg.label}
                              size="small"
                              sx={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                                border: `1px solid ${cfg.dot}33`,
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            />
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={3}
                            sx={{ mt: 1.5, p: 1.5, backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #F1F5F9" }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Expected KG</Typography>
                              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", fontFamily: "'DM Mono', monospace" }}>
                                {bag.expected_kg.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Actual KG</Typography>
                              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", fontFamily: "'DM Mono', monospace" }}>
                                {bag.actual_kg.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Remaining KG</Typography>
                              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: (bag.expected_kg - bag.actual_kg) > 0 ? "#DC2626" : "#15803D", fontFamily: "'DM Mono', monospace" }}>
                                {(bag.expected_kg - bag.actual_kg).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </>
      )}

      <RawMaterialDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          fetchBags();
        }}
      />

      <BBDialog
        title="Delete Raw Material"
        subtitle="Are you sure you want to delete this raw material bag? This action cannot be undone."
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          // Handle delete if needed
          setDeleteDialogOpen(false);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Paper>
  );
}
