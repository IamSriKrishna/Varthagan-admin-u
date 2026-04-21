"use client";
import { category, products } from "@/constants/apiConstants";
import { activeTypescategories } from "@/constants/commonConstans";
import { productTypes } from "@/constants/productConstans";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box, Button, Chip, Collapse, Divider, Grid, IconButton,
  Paper, Stack, Typography, Avatar, Tooltip, Badge,
} from "@mui/material";
import {
  Filter, PencilLine, Plus, Trash2, Package2,
  TrendingUp, TrendingDown, Layers, Search,
  SlidersHorizontal, X, ChevronDown, Sparkles,
  BarChart3, BoxSelect, ShoppingBag, Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { ICategorys } from "@/models/ICategory";
import { productService } from "@/lib/api/productService";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  // Core backgrounds
  pageBg:      "#F7F8FC",
  cardBg:      "#FFFFFF",
  subtleBg:    "#F4F5F9",
  glassOverlay:"rgba(255,255,255,0.85)",

  // Brand — deep violet-indigo
  brand:       "#4F46E5",
  brandMid:    "#818CF8",
  brandSoft:   "#EEF2FF",
  brandXSoft:  "#F5F3FF",
  brandDark:   "#3730A3",
  brandGlow:   "rgba(79,70,229,0.18)",

  // Accent — electric amber
  accent:      "#F59E0B",
  accentSoft:  "#FFFBEB",

  // Semantic
  success:     "#059669",
  successSoft: "#ECFDF5",
  successMid:  "#6EE7B7",
  danger:      "#DC2626",
  dangerSoft:  "#FEF2F2",
  dangerMid:   "#FECACA",
  warning:     "#D97706",
  warningSoft: "#FFFBEB",
  neutral:     "#9CA3AF",

  // Text hierarchy
  text:        "#0F172A",
  textMid:     "#334155",
  textLight:   "#64748B",
  textXLight:  "#CBD5E1",
  textGhost:   "#E2E8F0",

  // Borders
  border:      "#E8EBF2",
  borderMid:   "#D1D5DB",
  borderFocus: "#818CF8",

  // Elevation shadows
  shadow:      "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
  shadowSm:    "0 2px 8px rgba(15,23,42,0.07)",
  shadowMd:    "0 4px 16px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.05)",
  shadowLg:    "0 12px 40px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.07)",
  shadowBrand: "0 4px 18px rgba(79,70,229,0.30)",
  shadowBrandHover:"0 8px 28px rgba(79,70,229,0.40)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function colorFromString(str: string) {
  const palette = [
    { bg: "#EEF2FF", fg: "#4F46E5", border: "#C7D2FE" },
    { bg: "#F0FDF4", fg: "#059669", border: "#A7F3D0" },
    { bg: "#FFF7ED", fg: "#D97706", border: "#FDE68A" },
    { bg: "#FDF2F8", fg: "#BE185D", border: "#FBCFE8" },
    { bg: "#EFF6FF", fg: "#1D4ED8", border: "#BFDBFE" },
    { bg: "#F5F3FF", fg: "#7C3AED", border: "#DDD6FE" },
    { bg: "#ECFDF5", fg: "#065F46", border: "#6EE7B7" },
    { bg: "#FFFBEB", fg: "#B45309", border: "#FDE68A" },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Product Avatar ───────────────────────────────────────────────────────────
function ProductAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const { bg, fg, border } = colorFromString(name);
  return (
    <Avatar
      sx={{
        width: 40, height: 40, borderRadius: "12px",
        background: `linear-gradient(135deg, ${bg}, ${bg}CC)`,
        color: fg, fontSize: "0.75rem", fontWeight: 800,
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        flexShrink: 0,
        border: `1.5px solid ${border}`,
        boxShadow: `0 2px 8px ${fg}18`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "scale(1.08) rotate(-2deg)",
          boxShadow: `0 4px 14px ${fg}30`,
        },
      }}
    >
      {initials}
    </Avatar>
  );
}

// ─── Price Cell ───────────────────────────────────────────────────────────────
function PriceCell({ cost, selling }: { cost: number; selling: number }) {
  const profit = selling - cost;
  const isUp = profit >= 0;
  const markup = cost > 0 ? ((profit / cost) * 100).toFixed(1) : null;
  return (
    <Stack spacing={0.4}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography
          sx={{
            fontFamily: "'DM Mono', monospace", fontWeight: 800,
            color: T.text, fontSize: "0.88rem", letterSpacing: "-0.02em",
          }}
        >
          ₹{typeof selling?.toFixed === "function" ? selling.toFixed(2) : selling}
        </Typography>
        {markup && (
          <Box
            sx={{
              display: "inline-flex", alignItems: "center", gap: 0.4,
              px: 0.75, py: 0.15, borderRadius: "5px",
              background: isUp
                ? `linear-gradient(135deg, ${T.successSoft}, #D1FAE5)`
                : `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
              border: `1px solid ${isUp ? T.successMid : T.dangerMid}`,
            }}
          >
            {isUp
              ? <TrendingUp size={9} color={T.success} />
              : <TrendingDown size={9} color={T.danger} />}
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: isUp ? T.success : T.danger, fontFamily: "'DM Mono', monospace" }}>
              {markup}%
            </Typography>
          </Box>
        )}
      </Stack>
      <Typography sx={{ fontFamily: "'DM Mono', monospace", color: T.textLight, fontSize: "0.7rem" }}>
        Cost ₹{typeof cost?.toFixed === "function" ? cost.toFixed(2) : cost}
      </Typography>
    </Stack>
  );
}

// ─── Variant Badge ────────────────────────────────────────────────────────────
function VariantBadge({ count }: { count: number }) {
  const active = count > 1;
  return (
    <Box
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5,
        px: 1.25, py: 0.35, borderRadius: "8px",
        background: active
          ? `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`
          : T.subtleBg,
        border: `1.5px solid ${active ? T.brandMid : T.border}`,
        transition: "all 0.2s",
        "&:hover": active ? {
          background: `linear-gradient(135deg, #E0E7FF, ${T.brandSoft})`,
          transform: "scale(1.05)",
        } : {},
      }}
    >
      <Layers size={11} color={active ? T.brand : T.textLight} />
      <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: active ? T.brand : T.textLight, fontFamily: "'DM Mono', monospace" }}>
        {count}
      </Typography>
    </Box>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, gradient, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon?: any; gradient?: string; accent?: string;
}) {
  return (
    <Box
      sx={{
        flex: 1, minWidth: 140, position: "relative", overflow: "hidden",
        px: 2.5, py: 2.25,
        background: gradient ?? T.cardBg,
        border: `1.5px solid ${T.border}`,
        borderRadius: "16px",
        boxShadow: T.shadowSm,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: T.shadowMd },
        "&::before": gradient ? {
          content: '""',
          position: "absolute", top: 0, right: 0,
          width: 80, height: 80, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent ?? T.brand}18 0%, transparent 70%)`,
          transform: "translate(20px, -20px)",
        } : {},
      }}
    >
      {Icon && (
        <Box
          sx={{
            display: "inline-flex", p: 0.75, borderRadius: "8px",
            background: `${accent ?? T.brand}15`,
            mb: 1,
          }}
        >
          <Icon size={14} color={accent ?? T.brand} strokeWidth={2.5} />
        </Box>
      )}
      <Typography sx={{ color: T.textLight, fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1.45rem", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ color: T.textLight, fontSize: "0.68rem", mt: 0.4, fontWeight: 500 }}>{sub}</Typography>
      )}
    </Box>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Box
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5,
        px: 1.25, py: 0.4, borderRadius: "8px",
        background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
        border: `1.5px solid ${T.brandMid}`,
        animation: "pillPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "@keyframes pillPop": {
          from: { transform: "scale(0.8)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
      }}
    >
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: T.brand }}>
        {label}
      </Typography>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          p: 0.15, color: T.brand, width: 16, height: 16,
          "&:hover": { backgroundColor: T.brandMid + "60" },
          borderRadius: "4px",
        }}
      >
        <X size={10} />
      </IconButton>
    </Box>
  );
}

// ─── Row Action Buttons ───────────────────────────────────────────────────────
function ActionButtons({
  onEdit, onDelete,
}: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ opacity: 0, transition: "opacity 0.15s", ".MuiTableRow-root:hover &": { opacity: 1 } }}>
      <Tooltip title="Edit" placement="top" arrow>
        <IconButton
          size="small" onClick={onEdit}
          sx={{
            color: T.brand, background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
            borderRadius: "9px", width: 32, height: 32,
            border: `1.5px solid ${T.brandMid}`,
            "&:hover": { background: `linear-gradient(135deg, #E0E7FF, ${T.brandMid}60)`, transform: "scale(1.08)", boxShadow: T.shadowBrand },
            transition: "all 0.15s",
          }}
        >
          <PencilLine size={14} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" placement="top" arrow>
        <IconButton
          size="small" onClick={onDelete}
          sx={{
            color: T.danger, background: `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
            borderRadius: "9px", width: 32, height: 32,
            border: `1.5px solid ${T.dangerMid}`,
            "&:hover": { background: `linear-gradient(135deg, #FEE2E2, ${T.dangerMid}80)`, transform: "scale(1.08)", boxShadow: `0 4px 12px ${T.danger}30` },
            transition: "all 0.15s",
          }}
        >
          <Trash2 size={14} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Products() {
  const [page, setPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "", type: "", active: "", category_ids: "",
  });

  const { data: categoryData } = useFetch<{ data: ICategorys }>({ url: `${category.getCategory}` });
  const categoryOptions =
    categoryData?.data?.categories?.map((cat) => ({
      label: cat.category_name, value: cat.id,
    })) || [];

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch) params.append("search", debouncedSearch);
    if (filters.category_ids) params.append("category_ids", filters.category_ids);
    if (filters.type?.trim()) params.append("type", filters.type);
    if (String(filters.active).trim()) params.append("is_active", String(filters.active));
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));
    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);

  const { data: results, refetch, loading } = useFetch<{ products: any[]; total: number }>({
    url: `${products.postProduct}?${queryParams}`,
  });

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const response = await productService.deleteProduct(selectedId);
      if (response?.success) {
        showToastMessage(response.message || "Product deleted successfully", "success");
        refetch();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "message" in e ? (e as any).message : "Something went wrong.";
      showToastMessage(msg, "error");
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const activeFilterCount = [filters.type, filters.category_ids, filters.active].filter(Boolean).length;

  const productList: any[] = results?.products ?? [];
  const totalProducts = results?.total ?? 0;
  const activeProducts = productList.filter((p) => p.is_active !== false).length;
  const totalVariants = productList.reduce((acc, p) => acc + (p.product_details?.variants?.length ?? 0), 0);

  // ─── Columns ─────────────────────────────────────────────────────────────────
  const columns: ITableColumn<any>[] = [
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={1.75}>
          <ProductAvatar name={row.name ?? "P"} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.875rem", lineHeight: 1.3, mb: 0.3 }}>
              {row.name}
            </Typography>
            {row.product_details?.base_sku && (
              <Box
                sx={{
                  display: "inline-flex", alignItems: "center",
                  px: 0.75, py: 0.15, borderRadius: "5px",
                  background: T.subtleBg, border: `1px solid ${T.border}`,
                }}
              >
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: T.textLight, fontWeight: 600 }}>
                  {row.product_details.base_sku}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      ),
      cellStyle: { minWidth: 220 },
    },
    {
      key: "unit",
      label: "Unit",
      render: (row) => (
        <Box
          sx={{
            display: "inline-flex", alignItems: "center",
            px: 1.25, py: 0.35, borderRadius: "8px",
            background: T.subtleBg, border: `1.5px solid ${T.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: T.textMid, fontSize: "0.72rem" }}>
            {row.product_details?.unit ?? "—"}
          </Typography>
        </Box>
      ),
      cellStyle: { minWidth: 80 },
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <Tooltip title={row.product_details?.description ?? ""} placement="top" arrow>
          <Typography
            sx={{
              maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", color: T.textMid, fontSize: "0.82rem", cursor: "default",
            }}
          >
            {row.product_details?.description || (
              <span style={{ color: T.textXLight, fontStyle: "italic", fontSize: "0.78rem" }}>No description</span>
            )}
          </Typography>
        </Tooltip>
      ),
      cellStyle: { minWidth: 200, maxWidth: 260 },
    },
    {
      key: "pricing",
      label: "Pricing",
      render: (row) => (
        <PriceCell
          cost={row.purchase_info?.cost_price ?? 0}
          selling={row.sales_info?.selling_price ?? 0}
        />
      ),
      cellStyle: { minWidth: 150 },
    },
    {
      key: "variants",
      label: "Variants",
      render: (row) => <VariantBadge count={row.product_details?.variants?.length ?? 0} />,
      cellStyle: { minWidth: 90, textAlign: "center" },
    },
    {
      key: "action",
      label: "",
      render: (row) => (
        <ActionButtons
          onEdit={() => router.push(`/products/product/${row.id}`)}
          onDelete={() => { setSelectedId(row.id); setOpen(true); }}
        />
      ),
      cellStyle: { minWidth: 90, textAlign: "right" },
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: T.pageBg,
        pb: 8,
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
        // Subtle dot grid background
        backgroundImage: `radial-gradient(${T.border} 1.2px, transparent 1.2px)`,
        backgroundSize: "28px 28px",
      }}
    >
      <BBLoader enabled={loading} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: `${T.glassOverlay}`,
          backdropFilter: "blur(20px)",
          borderBottom: `1.5px solid ${T.border}`,
          px: { xs: 2, md: 4 },
          py: 2,
          position: "sticky", top: 0, zIndex: 20,
          boxShadow: "0 1px 0 #E8EBF2, 0 4px 20px rgba(15,23,42,0.05)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Animated logo icon */}
            <Box
              sx={{
                width: 42, height: 42, borderRadius: "13px",
                background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.shadowBrand,
                position: "relative", overflow: "hidden",
                "&::after": {
                  content: '""', position: "absolute",
                  top: -10, right: -10, width: 30, height: 30,
                  borderRadius: "50%", background: "rgba(255,255,255,0.12)",
                },
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "rotate(-5deg) scale(1.05)", boxShadow: T.shadowBrandHover },
              }}
            >
              <ShoppingBag size={19} color="#fff" />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1rem", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  Products
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.4,
                    px: 0.9, py: 0.25, borderRadius: "6px",
                    background: `linear-gradient(135deg, ${T.brandXSoft}, ${T.brandSoft})`,
                    border: `1px solid ${T.brandMid}`,
                  }}
                >
                  <Zap size={9} color={T.brand} />
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                    {totalProducts}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: T.textLight, fontSize: "0.7rem", mt: 0.15 }}>
                Catalogue & inventory
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            {/* Filter toggle */}
            <Button
              variant="outlined"
              startIcon={<SlidersHorizontal size={14} />}
              endIcon={
                activeFilterCount > 0 ? (
                  <Box
                    sx={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                      color: "#fff", fontSize: "0.62rem", fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: T.shadowBrand,
                    }}
                  >
                    {activeFilterCount}
                  </Box>
                ) : (
                  <ChevronDown size={13} style={{ transform: filterOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
                )
              }
              onClick={() => setFilterOpen(!filterOpen)}
              sx={{
                borderColor: filterOpen ? T.brand : T.border,
                color: filterOpen ? T.brand : T.textMid,
                background: filterOpen
                  ? `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`
                  : T.cardBg,
                borderRadius: "11px", textTransform: "none",
                fontWeight: 700, fontSize: "0.82rem",
                height: 38, px: 2,
                borderWidth: "1.5px",
                "&:hover": {
                  borderColor: T.brand,
                  background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                  color: T.brand,
                },
                transition: "all 0.18s",
              }}
            >
              Filters
            </Button>

            {/* New product CTA */}
            <Button
              variant="contained"
              startIcon={<Plus size={15} strokeWidth={2.5} />}
              onClick={() => router.push("/products/create")}
              sx={{
                background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
                borderRadius: "11px", textTransform: "none",
                fontWeight: 800, fontSize: "0.85rem",
                height: 38, px: 2.5,
                boxShadow: T.shadowBrand,
                border: "none",
                "&:hover": {
                  background: `linear-gradient(135deg, #6366F1 0%, ${T.brand} 100%)`,
                  boxShadow: T.shadowBrandHover,
                  transform: "translateY(-1.5px)",
                },
                transition: "all 0.18s",
              }}
            >
              New Product
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3.5 }}>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <Stack
          direction="row" spacing={2} mb={3}
          flexWrap="wrap" useFlexGap
          sx={{
            "& > *": {
              animation: "fadeSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
            },
            "& > *:nth-child(1)": { animationDelay: "0ms" },
            "& > *:nth-child(2)": { animationDelay: "60ms" },
            "& > *:nth-child(3)": { animationDelay: "120ms" },
            "& > *:nth-child(4)": { animationDelay: "180ms" },
            "@keyframes fadeSlideUp": {
              from: { opacity: 0, transform: "translateY(12px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <StatCard
            label="Total Products"
            value={totalProducts}
            sub="in catalogue"
            icon={BarChart3}
            accent={T.brand}
          />
          <StatCard
            label="This Page"
            value={productList.length}
            sub="loaded results"
            icon={BoxSelect}
            accent="#7C3AED"
          />
          <StatCard
            label="Total Variants"
            value={totalVariants}
            sub="across page"
            icon={Layers}
            accent={T.warning}
          />
          <StatCard
            label="Active"
            value={activeProducts}
            sub="on this page"
            icon={Sparkles}
            accent={T.success}
          />
        </Stack>

        {/* ── Main card ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            background: T.cardBg,
            borderRadius: "20px",
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowMd,
            overflow: "hidden",
            animation: "fadeSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
            "@keyframes fadeSlideUp": {
              from: { opacity: 0, transform: "translateY(14px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* ── Filter panel ─────────────────────────────────────────────── */}
          <Collapse in={filterOpen} timeout={300}>
            <Box
              sx={{
                px: 3, pt: 3, pb: 2.5,
                background: `linear-gradient(180deg, #F8F9FF 0%, ${T.cardBg} 100%)`,
                borderBottom: `1.5px solid ${T.border}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2.25}>
                <Box
                  sx={{
                    p: 0.6, borderRadius: "7px",
                    background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                    border: `1px solid ${T.brandMid}`,
                  }}
                >
                  <Filter size={12} color={T.brand} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: T.textMid, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Filters
                </Typography>
                {activeFilterCount > 0 && (
                  <Button
                    size="small"
                    onClick={() => setFilters(f => ({ ...f, type: "", active: "", category_ids: "" }))}
                    sx={{
                      ml: "auto", textTransform: "none", color: T.danger,
                      fontWeight: 700, fontSize: "0.72rem", p: 0, minWidth: 0,
                      "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <BBDropdownBase
                    name="type" label="Product Type" value={filters.type}
                    options={[{ value: "", label: "All types" }, ...productTypes]}
                    onDropdownChange={(_e, _n, val) => handleFilterChange("type", val as string)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <BBDropdownBase
                    name="category_ids" label="Category" value={filters.category_ids}
                    options={[{ value: "", label: "All categories" }, ...categoryOptions]}
                    onDropdownChange={(_e, _n, val) => handleFilterChange("category_ids", val as string)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <BBDropdownBase
                    name="active" label="Status" value={filters.active}
                    options={[{ value: "", label: "All statuses" }, ...activeTypescategories]}
                    onDropdownChange={(_e, _n, val) => handleFilterChange("active", val as string)}
                  />
                </Grid>
              </Grid>

              {activeFilterCount > 0 && (
                <Stack direction="row" spacing={1} mt={2.25} flexWrap="wrap" useFlexGap alignItems="center">
                  <Typography sx={{ color: T.textLight, fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Active:
                  </Typography>
                  {filters.type && (
                    <FilterPill label={`Type: ${filters.type}`} onRemove={() => handleFilterChange("type", "")} />
                  )}
                  {filters.category_ids && (
                    <FilterPill
                      label={`Category: ${categoryOptions.find(c => String(c.value) === filters.category_ids)?.label ?? filters.category_ids}`}
                      onRemove={() => handleFilterChange("category_ids", "")}
                    />
                  )}
                  {filters.active && (
                    <FilterPill label={`Status: ${filters.active}`} onRemove={() => handleFilterChange("active", "")} />
                  )}
                </Stack>
              )}
            </Box>
          </Collapse>

          {/* ── Search & count bar ───────────────────────────────────────── */}
          <Box
            sx={{
              px: 3, py: 2,
              borderBottom: `1.5px solid ${T.border}`,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 2, flexWrap: "wrap",
              background: T.cardBg,
            }}
          >
            <Box sx={{ position: "relative", flex: "0 0 320px" }}>
              <Search
                size={14} color={T.textLight}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}
              />
              <BBInputBase
                label="" name="search"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search products, SKUs…"
                sx={{
                  "& .MuiInputBase-root": {
                    pl: "38px",
                    borderRadius: "12px",
                    backgroundColor: T.subtleBg,
                    border: `1.5px solid ${T.border}`,
                    transition: "border-color 0.18s, box-shadow 0.18s",
                    "&:focus-within": {
                      borderColor: T.brandMid,
                      boxShadow: `0 0 0 3px ${T.brandGlow}`,
                      backgroundColor: T.cardBg,
                    },
                  },
                }}
              />
              {filters.search && (
                <IconButton
                  size="small"
                  onClick={() => handleFilterChange("search", "")}
                  sx={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    color: T.textLight, p: 0.25, borderRadius: "6px",
                    "&:hover": { backgroundColor: T.subtleBg, color: T.text },
                  }}
                >
                  <X size={12} />
                </IconButton>
              )}
            </Box>

            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                px: 1.5, py: 0.5, borderRadius: "9px",
                background: totalProducts > 0 ? T.brandXSoft : T.subtleBg,
                border: `1.5px solid ${totalProducts > 0 ? T.brandMid : T.border}`,
              }}
            >
              <Typography sx={{ color: T.textLight, fontSize: "0.72rem", fontWeight: 500 }}>
                {totalProducts > 0 ? (
                  <>
                    <span style={{ fontWeight: 900, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                      {totalProducts}
                    </span>
                    {" "}products found
                  </>
                ) : "No products"}
              </Typography>
            </Box>
          </Box>

          {/* ── Table ────────────────────────────────────────────────────── */}
          <Box
            sx={{
              width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch",
              "& .MuiTableRow-root:not(.MuiTableRow-head)": {
                transition: "background 0.12s",
                "&:hover": {
                  background: `linear-gradient(90deg, ${T.brandXSoft}80, ${T.subtleBg}50)`,
                },
              },
              "& .MuiTableCell-root": {
                borderBottom: `1px solid ${T.border}`,
                py: 1.75, px: 2.5,
              },
              "& .MuiTableCell-head": {
                background: `linear-gradient(180deg, #F8F9FF, ${T.subtleBg})`,
                color: T.textLight, fontSize: "0.68rem", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.08em",
                borderBottom: `2px solid ${T.border}`,
                py: 1.5,
              },
            }}
          >
            <BBTable
              data={productList}
              columns={columns}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalProducts}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
            />
          </Box>

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {!loading && productList.length === 0 && (
            <Box
              sx={{
                py: 12, textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center",
                animation: "fadeSlideUp 0.4s ease both",
              }}
            >
              {/* Decorative rings */}
              <Box sx={{ position: "relative", width: 88, height: 88, mb: 3, mx: "auto" }}>
                <Box sx={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: `2px dashed ${T.brandMid}`,
                  animation: "spin 12s linear infinite",
                  "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                }} />
                <Box sx={{
                  position: "absolute", inset: 12, borderRadius: "50%",
                  border: `1.5px solid ${T.brandSoft}`,
                  animation: "spin 8s linear infinite reverse",
                }} />
                <Box sx={{
                  position: "absolute", inset: 22, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShoppingBag size={24} color={T.brand} />
                </Box>
              </Box>

              <Typography sx={{ fontWeight: 900, color: T.text, mb: 0.75, fontSize: "1.05rem", letterSpacing: "-0.03em" }}>
                No products yet
              </Typography>
              <Typography sx={{ color: T.textLight, mb: 3.5, fontSize: "0.85rem", maxWidth: 280, mx: "auto", lineHeight: 1.6 }}>
                {filters.search || activeFilterCount > 0
                  ? "Try adjusting your search or filters"
                  : "Add your first product to get started with your catalogue"}
              </Typography>
              {!filters.search && activeFilterCount === 0 && (
                <Button
                  variant="contained"
                  startIcon={<Plus size={15} strokeWidth={2.5} />}
                  onClick={() => router.push("/products/create")}
                  sx={{
                    background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                    borderRadius: "12px", textTransform: "none",
                    fontWeight: 800, fontSize: "0.85rem",
                    height: 42, px: 3,
                    boxShadow: T.shadowBrand,
                    "&:hover": { boxShadow: T.shadowBrandHover, transform: "translateY(-2px)" },
                    transition: "all 0.18s",
                  }}
                >
                  Create First Product
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Delete dialog ──────────────────────────────────────────────────── */}
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Product"
        maxWidth="sm"
        content={
          <Box>
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                p: 2.25, mb: 2, borderRadius: "12px",
                background: `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
                border: `1.5px solid ${T.dangerMid}`,
              }}
            >
              <Box sx={{ p: 0.75, borderRadius: "8px", background: `${T.danger}15` }}>
                <Trash2 size={16} color={T.danger} />
              </Box>
              <Typography sx={{ fontWeight: 700, color: T.danger, fontSize: "0.875rem" }}>
                This action cannot be undone
              </Typography>
            </Box>
            <Typography sx={{ color: T.textMid, lineHeight: 1.75, fontSize: "0.875rem" }}>
              The product will be permanently removed from your catalogue. All associated variants and pricing data will be lost.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete Product"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}