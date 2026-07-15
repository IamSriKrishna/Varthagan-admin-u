
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Eye,
  FileWarning,
  PackageSearch,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Store,
} from "lucide-react";

import { BBButton, BBInputBase, BBLoader, BBTable } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { showToastMessage } from "@/utils/toastUtil";
import {
  PurchaseClaim,
  PurchaseClaimItem,
} from "@/models/purchaseClaim.model";
import { PurchaseOrder } from "@/models/purchaseOrder.model";
import { purchaseClaimService } from "@/services/purchaseClaimService";

type ClaimRow = PurchaseClaim & {
  product_names: string;
  claim_types: string;
  total_claim_quantity: number;
  total_pending_replacement: number;
  item_count: number;
};

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; border: string; icon: React.ReactNode }
> = {
  open: {
    bg: "#fff7ed",
    color: "#c2410c",
    border: "#fed7aa",
    icon: <Clock3 size={12} />,
  },
  partial: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    icon: <AlertTriangle size={12} />,
  },
  resolved: {
    bg: "#ecfdf5",
    color: "#047857",
    border: "#a7f3d0",
    icon: <CheckCircle2 size={12} />,
  },
  cancelled: {
    bg: "#f8fafc",
    color: "#64748b",
    border: "#e2e8f0",
    icon: <AlertTriangle size={12} />,
  },
};

function getVendorName(purchaseOrder?: PurchaseOrder): string {
  if (!purchaseOrder) return "—";

  return (
    purchaseOrder.vendor?.display_name ||
    purchaseOrder.vendor?.company_name ||
    `Vendor #${purchaseOrder.vendor_id}`
  );
}

function getClaimProductNames(items: PurchaseClaimItem[]): string {
  const uniqueNames = Array.from(
    new Set(items.map((item) => item.product_name).filter(Boolean))
  );

  if (uniqueNames.length === 0) return "—";
  if (uniqueNames.length <= 2) return uniqueNames.join(", ");

  return `${uniqueNames.slice(0, 2).join(", ")} +${uniqueNames.length - 2}`;
}

function getClaimTypes(items: PurchaseClaimItem[]): string {
  const types = Array.from(new Set(items.map((item) => item.type)));

  return types
    .map((type) => (type === "missing" ? "Missing" : "Damaged"))
    .join(" / ");
}

function getTotalBaseQuantity(items: PurchaseClaimItem[]): number {
  return items.reduce(
    (total, item) => total + Number(item.base_quantity || 0),
    0
  );
}

function getTotalPendingReplacement(items: PurchaseClaimItem[]): number {
  return items.reduce(
    (total, item) =>
      total + Number(item.replacement_pending_base || 0),
    0
  );
}

function getPrimaryUnit(items: PurchaseClaimItem[]): string {
  const units = Array.from(
    new Set(items.map((item) => item.base_unit).filter(Boolean))
  );

  return units.length === 1 ? units[0] : "base units";
}

export default function PurchaseClaimsPage() {
  const router = useRouter();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    []
  );
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] =
    useState<string>("");
  const [claims, setClaims] = useState<PurchaseClaim[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPurchaseOrder = useMemo(
    () =>
      purchaseOrders.find(
        (purchaseOrder) => purchaseOrder.id === selectedPurchaseOrderId
      ),
    [purchaseOrders, selectedPurchaseOrderId]
  );

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoadingPurchaseOrders(true);
      setError(null);

      const result = await purchaseClaimService.getPurchaseOrders();
      setPurchaseOrders(result);

      if (result.length > 0) {
        setSelectedPurchaseOrderId((currentValue) =>
          currentValue || result[0].id
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load purchase orders";

      setError(message);
      showToastMessage(message, "error");
    } finally {
      setLoadingPurchaseOrders(false);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    if (!selectedPurchaseOrderId) {
      setClaims([]);
      return;
    }

    try {
      setLoadingClaims(true);
      setError(null);

      const response =
        await purchaseClaimService.getClaimsByPurchaseOrder(
          selectedPurchaseOrderId
        );

      setClaims(response.data ?? []);
      setPage(0);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load purchase claims";

      setClaims([]);
      setError(message);
      showToastMessage(message, "error");
    } finally {
      setLoadingClaims(false);
    }
  }, [selectedPurchaseOrderId]);

  useEffect(() => {
    void loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  const rows = useMemo<ClaimRow[]>(
    () =>
      claims.map((claim) => ({
        ...claim,
        product_names: getClaimProductNames(claim.items || []),
        claim_types: getClaimTypes(claim.items || []),
        total_claim_quantity: getTotalBaseQuantity(claim.items || []),
        total_pending_replacement: getTotalPendingReplacement(
          claim.items || []
        ),
        item_count: claim.items?.length || 0,
      })),
    [claims]
  );

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      if (!matchesStatus) return false;
      if (!searchValue) return true;

      return [
        row.claim_number,
        row.purchase_order_number,
        row.product_names,
        row.claim_types,
        row.notes,
        row.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [rows, search, statusFilter]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const totalOpen = claims.filter((claim) => claim.status === "open").length;
  const totalPartial = claims.filter(
    (claim) => claim.status === "partial"
  ).length;
  const totalResolved = claims.filter(
    (claim) => claim.status === "resolved"
  ).length;

  const totalPendingQuantity = claims.reduce(
    (total, claim) =>
      total + getTotalPendingReplacement(claim.items || []),
    0
  );

  const columns: ITableColumn<ClaimRow>[] = [
    {
      key: "claim_number" as keyof ClaimRow,
      label: "Claim",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#fff7ed",
              color: "#ea580c",
              border: "1.5px solid #fed7aa",
            }}
          >
            <FileWarning size={17} />
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "#1a1d2e",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.3,
              }}
            >
              <HighlightedCell
                value={row.claim_number}
                search={search}
              />
            </Typography>

            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "#9ca3af",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {dayjs(row.date).format("DD MMM YYYY")}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "product_names" as keyof ClaimRow,
      label: "Products",
      render: (row) => (
        <Box>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
              maxWidth: 240,
            }}
          >
            <HighlightedCell
              value={row.product_names}
              search={search}
            />
          </Typography>

          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "#9ca3af",
              fontFamily: "'DM Sans', sans-serif",
              mt: 0.2,
            }}
          >
            {row.item_count} item{row.item_count !== 1 ? "s" : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "claim_types" as keyof ClaimRow,
      label: "Type",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {Array.from(new Set(row.items.map((item) => item.type))).map(
            (type) => {
              const isMissing = type === "missing";

              return (
                <Chip
                  key={type}
                  label={isMissing ? "Missing" : "Damaged"}
                  size="small"
                  icon={
                    isMissing ? (
                      <PackageSearch size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )
                  }
                  sx={{
                    height: 24,
                    borderRadius: "7px",
                    bgcolor: isMissing ? "#fff7ed" : "#fef2f2",
                    color: isMissing ? "#c2410c" : "#b91c1c",
                    border: "1px solid",
                    borderColor: isMissing ? "#fed7aa" : "#fecaca",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    "& .MuiChip-icon": {
                      color: "inherit",
                    },
                  }}
                />
              );
            }
          )}
        </Box>
      ),
    },
    {
      key: "total_claim_quantity" as keyof ClaimRow,
      label: "Claim Quantity",
      render: (row) => {
        const unit = getPrimaryUnit(row.items);

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {row.items.some((item) => item.is_raw_material) ? (
              <Scale size={14} color="#0891b2" />
            ) : (
              <Boxes size={14} color="#4f63d2" />
            )}

            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#374151",
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {row.total_claim_quantity.toLocaleString()} {unit}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "total_pending_replacement" as keyof ClaimRow,
      label: "Replacement Pending",
      render: (row) => {
        const unit = getPrimaryUnit(row.items);
        const hasPending = row.total_pending_replacement > 0;

        return (
          <Chip
            label={
              hasPending
                ? `${row.total_pending_replacement.toLocaleString()} ${unit}`
                : "Completed / None"
            }
            size="small"
            sx={{
              height: 24,
              borderRadius: "7px",
              bgcolor: hasPending ? "#eff6ff" : "#ecfdf5",
              color: hasPending ? "#1d4ed8" : "#047857",
              border: "1px solid",
              borderColor: hasPending ? "#bfdbfe" : "#a7f3d0",
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        );
      },
    },
    {
      key: "status" as keyof ClaimRow,
      label: "Status",
      render: (row) => {
        const style = STATUS_STYLES[row.status] ?? STATUS_STYLES.open;

        return (
          <Chip
            label={row.status}
            size="small"
            icon={style.icon as React.ReactElement}
            sx={{
              height: 24,
              borderRadius: "7px",
              bgcolor: style.bg,
              color: style.color,
              border: "1px solid",
              borderColor: style.border,
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "capitalize",
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        );
      },
    },
    {
      key: "action" as any,
      label: "",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiTableRow-root:hover &": {
              opacity: 1,
            },
          }}
        >
          <Tooltip title="View claim" arrow>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/purchase-claims/claim/${row.id}`);
              }}
              sx={{
                width: 31,
                height: 31,
                borderRadius: "8px",
                color: "#4f63d2",
                bgcolor: "#f0f4ff",
                "&:hover": {
                  bgcolor: "#e0e7ff",
                  transform: "scale(1.05)",
                },
              }}
            >
              <Eye size={15} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BBLoader enabled={loadingPurchaseOrders || loadingClaims} />

      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f0f0f5",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(239,68,68,0.28)",
              }}
            >
              <FileWarning size={22} color="white" />
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
                Purchase Claims
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                Track missing, damaged, and vendor replacement items
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.25 }}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => void loadClaims()}
                disabled={!selectedPurchaseOrderId || loadingClaims}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                <RefreshCw size={17} />
              </IconButton>
            </Tooltip>

            <BBButton
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() =>
                router.push("/purchase-claims/claim/new")
              }
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                  boxShadow: "0 6px 20px rgba(239,68,68,0.4)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              New Claim
            </BBButton>
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 3,
          pt: 2.5,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.5,
        }}
      >
        <SummaryCard
          label="Total Claims"
          value={claims.length}
          icon={<FileWarning size={17} />}
          bg="#fff7ed"
          color="#c2410c"
        />
        <SummaryCard
          label="Open / Partial"
          value={totalOpen + totalPartial}
          icon={<Clock3 size={17} />}
          bg="#eff6ff"
          color="#1d4ed8"
        />
        <SummaryCard
          label="Resolved"
          value={totalResolved}
          icon={<CheckCircle2 size={17} />}
          bg="#ecfdf5"
          color="#047857"
        />
        <SummaryCard
          label="Replacement Pending"
          value={totalPendingQuantity.toLocaleString()}
          icon={<PackageSearch size={17} />}
          bg="#f5f3ff"
          color="#6d28d9"
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mx: 3,
            mt: 2,
            borderRadius: "12px",
            border: "1px solid #fee2e2",
            bgcolor: "#fff5f5",
          }}
        >
          {error}
        </Alert>
      )}

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
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "stretch", lg: "center" },
          gap: 1.5,
        }}
      >
        <TextField
          select
          label="Purchase Order"
          value={selectedPurchaseOrderId}
          onChange={(event) => {
            setSelectedPurchaseOrderId(event.target.value);
            setPage(0);
          }}
          sx={{
            minWidth: { xs: "100%", lg: 310 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        >
          {purchaseOrders.map((purchaseOrder) => (
            <MenuItem key={purchaseOrder.id} value={purchaseOrder.id}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {purchaseOrder.purchase_order_no}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "#9ca3af",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {getVendorName(purchaseOrder)}
                  </Typography>
                </Box>

                <Chip
                  label={purchaseOrder.status}
                  size="small"
                  sx={{
                    height: 21,
                    borderRadius: "6px",
                    bgcolor: "#f0f4ff",
                    color: "#4f63d2",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            maxWidth: { xs: "100%", lg: 380 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Search size={15} />
          </Box>

          <BBInputBase
            label=""
            name="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search claims, products, or notes..."
            sx={{ pl: 4.5 }}
          />
        </Box>

        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(0);
          }}
          sx={{
            minWidth: { xs: "100%", lg: 160 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="partial">Partial</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>

        {selectedPurchaseOrder && (
          <Box
            sx={{
              ml: { lg: "auto" },
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              bgcolor: "#f8f9ff",
              border: "1px solid #e0e7ff",
              borderRadius: "10px",
            }}
          >
            <Store size={14} color="#4f63d2" />

            <Box>
              <Typography
                sx={{
                  fontSize: "0.62rem",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 800,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Vendor
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.76rem",
                  color: "#374151",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {getVendorName(selectedPurchaseOrder)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

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
          data={paginatedRows}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          onRowClick={(row: ClaimRow) =>
            router.push(`/purchase-claims/claim/${row.id}`)
          }
          sx={{
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: "#f8fbff",
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
              "&:hover": {
                bgcolor: "#fffaf7",
              },
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              borderBottom: "1px solid #f5f5fa",
              py: 1.5,
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </Box>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  bg,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#ffffff",
        border: "1px solid #eeeff5",
        borderRadius: "13px",
        boxShadow: "0 3px 14px rgba(15,23,42,0.035)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          bgcolor: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "0.66rem",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: "1.05rem",
            color: "#1a1d2e",
            fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}