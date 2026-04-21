"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Button, Stack, Typography, CircularProgress,
  Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";
import { BBTitle, BBButton } from "@/lib";
import {
  ArrowLeft, Edit, Download, Package2, Layers,
  CalendarDays, Clock, Hash, Tag, ShoppingBag,
  Zap, AlertTriangle, ChevronRight, BoxSelect,
  Activity, RefreshCw,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { showToastMessage } from "@/utils/toastUtil";
import { ProductGroupDetailsOutput } from "@/models/product-group.model";

interface ProductGroupDetailsResponse {
  success: boolean;
  data: ProductGroupDetailsOutput;
  message?: string;
}

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  pageBg:       "#F7F8FC",
  cardBg:       "#FFFFFF",
  subtleBg:     "#F4F5F9",
  glassOverlay: "rgba(255,255,255,0.85)",

  brand:        "#4F46E5",
  brandMid:     "#818CF8",
  brandSoft:    "#EEF2FF",
  brandXSoft:   "#F5F3FF",
  brandDark:    "#3730A3",
  brandGlow:    "rgba(79,70,229,0.18)",

  success:      "#059669",
  successSoft:  "#ECFDF5",
  successMid:   "#6EE7B7",
  danger:       "#DC2626",
  dangerSoft:   "#FEF2F2",
  dangerMid:    "#FECACA",
  warning:      "#D97706",
  warningSoft:  "#FFFBEB",
  warningMid:   "#FDE68A",

  text:         "#0F172A",
  textMid:      "#334155",
  textLight:    "#64748B",
  textXLight:   "#CBD5E1",
  textGhost:    "#E2E8F0",

  border:       "#E8EBF2",
  borderMid:    "#D1D5DB",

  shadow:       "0 1px 3px rgba(15,23,42,0.06)",
  shadowSm:     "0 2px 8px rgba(15,23,42,0.07)",
  shadowMd:     "0 4px 16px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.05)",
  shadowLg:     "0 12px 40px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.07)",
  shadowBrand:  "0 4px 18px rgba(79,70,229,0.30)",
  shadowBrandHover: "0 8px 28px rgba(79,70,229,0.40)",
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

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({ active }: { active: boolean }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1.1, py: 0.3, borderRadius: "7px",
      background: active
        ? `linear-gradient(135deg, ${T.successSoft}, #D1FAE5)`
        : `linear-gradient(135deg, ${T.subtleBg}, #F1F5F9)`,
      border: `1.5px solid ${active ? T.successMid : T.border}`,
    }}>
      <Box sx={{
        width: 6, height: 6, borderRadius: "50%",
        background: active ? T.success : T.textLight,
        boxShadow: active ? `0 0 0 2px ${T.success}30` : "none",
        animation: active ? "pulse 2s ease-in-out infinite" : "none",
        "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
      }} />
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: active ? T.success : T.textLight }}>
        {active ? "Active" : "Inactive"}
      </Typography>
    </Box>
  );
}

// ─── Info Stat Block ──────────────────────────────────────────────────────────
function InfoBlock({
  icon: Icon, label, value, mono, accent,
}: { icon: any; label: string; value: string | number; mono?: boolean; accent?: string }) {
  const color = accent ?? T.brand;
  return (
    <Box sx={{
      flex: 1, minWidth: 140,
      px: 2, py: 1.75,
      background: T.cardBg,
      border: `1.5px solid ${T.border}`,
      borderRadius: "14px",
      boxShadow: T.shadowSm,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: T.shadowMd },
      position: "relative", overflow: "hidden",
      "&::before": {
        content: '""', position: "absolute",
        top: 0, right: 0, width: 60, height: 60,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        transform: "translate(15px,-15px)",
      },
    }}>
      <Box sx={{ display: "inline-flex", p: 0.6, borderRadius: "7px", background: `${color}14`, mb: 1 }}>
        <Icon size={13} color={color} strokeWidth={2.5} />
      </Box>
      <Typography sx={{ color: T.textLight, fontWeight: 700, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{
        fontWeight: 800, color: T.text, fontSize: "0.82rem", lineHeight: 1.4,
        wordBreak: "break-all",
        fontFamily: mono ? "'DM Mono', monospace" : "inherit",
      }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Position Badge ───────────────────────────────────────────────────────────
function PositionBadge({ pos }: { pos: number }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: "8px",
      background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
      border: `1.5px solid ${T.brandMid}`,
    }}>
      <Typography sx={{ fontWeight: 900, fontSize: "0.72rem", color: T.brand, fontFamily: "'DM Mono', monospace" }}>
        {pos}
      </Typography>
    </Box>
  );
}

// ─── Quantity Badge ───────────────────────────────────────────────────────────
function QtyBadge({ qty }: { qty: number }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.4,
      px: 1, py: 0.25, borderRadius: "7px",
      background: qty > 1
        ? `linear-gradient(135deg, ${T.warningSoft}, #FEF3C7)`
        : T.subtleBg,
      border: `1.5px solid ${qty > 1 ? T.warningMid : T.border}`,
    }}>
      <Layers size={10} color={qty > 1 ? T.warning : T.textLight} />
      <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: qty > 1 ? T.warning : T.textLight, fontFamily: "'DM Mono', monospace" }}>
        ×{qty}
      </Typography>
    </Box>
  );
}

// ─── Variant Details Pill ─────────────────────────────────────────────────────
function VariantDetails({ 
  details, 
  product, 
  variantSku 
}: { 
  details?: Record<string, any> | null; 
  product?: any;
  variantSku?: string | null;
}) {
  // If we have explicit variant_details, use them
  if (details && Object.keys(details).length > 0) {
    const entries = Object.entries(details);
    return (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {entries.map(([key, val]) => (
          <Box key={key} sx={{
            display: "inline-flex", alignItems: "center", gap: 0.4,
            px: 0.9, py: 0.2, borderRadius: "6px",
            background: T.subtleBg, border: `1px solid ${T.border}`,
          }}>
            <Typography sx={{ fontSize: "0.62rem", color: T.textLight, fontWeight: 700, textTransform: "capitalize" }}>
              {key}:
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: T.textMid, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
              {String(val)}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  // Try to extract variant attributes from product.product_details.attribute_definitions
  if (product?.product_details?.attribute_definitions && Array.isArray(product.product_details.attribute_definitions)) {
    const attrs = product.product_details.attribute_definitions.map((def: any) => def.key || "").filter(Boolean);
    if (attrs.length > 0) {
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {attrs.map((attr: string) => (
            <Box key={attr} sx={{
              display: "inline-flex", alignItems: "center", gap: 0.4,
              px: 0.9, py: 0.2, borderRadius: "6px",
              background: T.subtleBg, border: `1px solid ${T.border}`,
            }}>
              <Typography sx={{ fontSize: "0.62rem", color: T.textLight, fontWeight: 700, textTransform: "capitalize" }}>
                {attr}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: T.textMid, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
                ✓
              </Typography>
            </Box>
          ))}
        </Stack>
      );
    }
  }

  return (
    <Typography sx={{ color: T.textXLight, fontSize: "0.72rem", fontStyle: "italic" }}>N/A</Typography>
  );
}

// ─── Product Cell ─────────────────────────────────────────────────────────────
function ProductCell({ name, id }: { name: string; id: string }) {
  const initials = (name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const { bg, fg, border } = colorFromString(name ?? id);
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
        background: `linear-gradient(135deg, ${bg}, ${bg}CC)`,
        border: `1.5px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 6px ${fg}15`,
      }}>
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: "0.65rem", color: fg }}>
          {initials}
        </Typography>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.82rem", lineHeight: 1.3 }}>
          {name || "Unknown Product"}
        </Typography>
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: T.textLight }}>
          {id.slice(0, 8)}…
        </Typography>
      </Box>
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductGroupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [productGroup, setProductGroup] = useState<ProductGroupDetailsOutput | null>(null);

  const { data: fetchedData, loading: isLoading, error } = useFetch<ProductGroupDetailsResponse>({
    url: `/product-groups/${params.id}`,
  });

  useEffect(() => {
    if (fetchedData?.data) setProductGroup(fetchedData.data);
    if (error) showToastMessage("Failed to load product group details", "error");
  }, [fetchedData, error]);

  const componentCount = productGroup?.components?.length ?? 0;
  const totalQty = productGroup?.components?.reduce((sum, c) => sum + c.quantity, 0) ?? 0;

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: T.pageBg,
      pb: 8,
      fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
      backgroundImage: `radial-gradient(${T.border} 1.2px, transparent 1.2px)`,
      backgroundSize: "28px 28px",
    }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        background: T.glassOverlay,
        backdropFilter: "blur(20px)",
        borderBottom: `1.5px solid ${T.border}`,
        px: { xs: 2, md: 4 }, py: 2,
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 0 #E8EBF2, 0 4px 20px rgba(15,23,42,0.05)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Back button */}
            <Button
              startIcon={<ArrowLeft size={15} />}
              onClick={() => router.back()}
              sx={{
                color: T.textMid, textTransform: "none",
                fontWeight: 700, fontSize: "0.82rem",
                borderRadius: "10px", px: 1.75, height: 36,
                border: `1.5px solid ${T.border}`,
                background: T.cardBg,
                "&:hover": { background: T.subtleBg, borderColor: T.borderMid, color: T.text },
                transition: "all 0.15s",
              }}
            >
              Back
            </Button>

            {/* Title block */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 42, height: 42, borderRadius: "13px",
                background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.shadowBrand,
                transition: "transform 0.2s",
                "&:hover": { transform: "rotate(-5deg) scale(1.05)" },
              }}>
                <Package2 size={19} color="#fff" />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1rem", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {productGroup?.name ?? "Product Group"}
                  </Typography>
                  {productGroup && <StatusChip active={productGroup.is_active} />}
                </Stack>
                <Typography sx={{ color: T.textLight, fontSize: "0.7rem", mt: 0.15 }}>
                  Group details & components
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<Download size={14} />}
              sx={{
                borderColor: T.border, color: T.textMid,
                background: T.cardBg, borderWidth: "1.5px",
                borderRadius: "11px", textTransform: "none",
                fontWeight: 700, fontSize: "0.82rem", height: 38, px: 2,
                "&:hover": { borderColor: T.borderMid, background: T.subtleBg },
                transition: "all 0.15s",
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit size={14} />}
              onClick={() => router.push(`/products/product-groups/${params.id}/edit`)}
              sx={{
                background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                borderRadius: "11px", textTransform: "none",
                fontWeight: 800, fontSize: "0.85rem",
                height: 38, px: 2.5,
                boxShadow: T.shadowBrand, border: "none",
                "&:hover": {
                  background: `linear-gradient(135deg, #6366F1, ${T.brand})`,
                  boxShadow: T.shadowBrandHover, transform: "translateY(-1.5px)",
                },
                transition: "all 0.18s",
              }}
            >
              Edit Group
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3.5 }}>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 16, gap: 2 }}>
            <Box sx={{ position: "relative", width: 56, height: 56 }}>
              <CircularProgress size={56} thickness={2.5} sx={{ color: T.brand, opacity: 0.2, position: "absolute" }} variant="determinate" value={100} />
              <CircularProgress size={56} thickness={2.5} sx={{ color: T.brand, position: "absolute" }} />
            </Box>
            <Typography sx={{ color: T.textLight, fontSize: "0.82rem", fontWeight: 600 }}>
              Loading group details…
            </Typography>
          </Box>
        )}

        {/* ── Error state ───────────────────────────────────────────────────── */}
        {!isLoading && !productGroup && (
          <Box sx={{
            background: T.cardBg, borderRadius: "20px",
            border: `1.5px solid ${T.dangerMid}`,
            boxShadow: T.shadowMd,
            py: 10, textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center",
            animation: "fadeSlideUp 0.4s ease both",
            "@keyframes fadeSlideUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
          }}>
            <Box sx={{
              p: 2, borderRadius: "16px", mb: 2,
              background: `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
              border: `1.5px solid ${T.dangerMid}`,
            }}>
              <AlertTriangle size={28} color={T.danger} />
            </Box>
            <Typography sx={{ fontWeight: 900, color: T.text, mb: 0.75, fontSize: "1rem" }}>
              Product group not found
            </Typography>
            <Typography sx={{ color: T.textLight, mb: 3, fontSize: "0.85rem" }}>
              This group may have been deleted or the ID is invalid
            </Typography>
            <Button
              onClick={() => router.back()}
              startIcon={<ArrowLeft size={14} />}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 700,
                border: `1.5px solid ${T.border}`, color: T.textMid, px: 2.5,
                "&:hover": { background: T.subtleBg },
              }}
            >
              Go Back
            </Button>
          </Box>
        )}

        {/* ── Details ───────────────────────────────────────────────────────── */}
        {!isLoading && productGroup && (
          <Stack
            spacing={2.5}
            sx={{
              "& > *": { animation: "fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both" },
              "& > *:nth-child(1)": { animationDelay: "0ms" },
              "& > *:nth-child(2)": { animationDelay: "80ms" },
              "& > *:nth-child(3)": { animationDelay: "140ms" },
              "@keyframes fadeSlideUp": {
                from: { opacity: 0, transform: "translateY(14px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {/* ── Overview card ─────────────────────────────────────────────── */}
            <Box sx={{
              background: T.cardBg, borderRadius: "20px",
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadowMd, overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""', position: "absolute",
                top: 0, left: 0, right: 0, height: "3px",
                background: `linear-gradient(90deg, ${T.brand}, ${T.brandMid}, #A78BFA)`,
              },
            }}>
              {/* Header */}
              <Box sx={{ px: 3, pt: 3.5, pb: 2.5 }}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  {/* Big avatar */}
                  <Box sx={{
                    width: 56, height: 56, borderRadius: "16px", flexShrink: 0,
                    background: (() => { const { bg, border } = colorFromString(productGroup.name); return `linear-gradient(135deg, ${bg}, ${bg}CC)`; })(),
                    border: `2px solid ${colorFromString(productGroup.name).border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 14px ${colorFromString(productGroup.name).fg}20`,
                  }}>
                    <Typography sx={{
                      fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: "1rem",
                      color: colorFromString(productGroup.name).fg,
                    }}>
                      {productGroup.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </Typography>
                  </Box>

                  <Box flex={1} minWidth={0}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5} flexWrap="wrap">
                      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                        {productGroup.name}
                      </Typography>
                      <StatusChip active={productGroup.is_active} />
                    </Stack>
                    <Typography sx={{ color: T.textLight, fontSize: "0.85rem", lineHeight: 1.65, maxWidth: 600 }}>
                      {productGroup.description || (
                        <span style={{ color: T.textXLight, fontStyle: "italic" }}>No description provided</span>
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Divider */}
              <Box sx={{ mx: 3, height: "1px", background: `linear-gradient(90deg, transparent, ${T.border}, transparent)` }} />

              {/* Info blocks */}
              <Box sx={{ px: 3, py: 2.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
                  <InfoBlock
                    icon={Hash} label="Group ID"
                    value={productGroup.id}
                    mono accent={T.brand}
                  />
                  <InfoBlock
                    icon={Layers} label="Total Components"
                    value={componentCount}
                    accent={T.brand}
                  />
                  <InfoBlock
                    icon={BoxSelect} label="Total Quantity"
                    value={totalQty}
                    accent={T.warning}
                  />
                  <InfoBlock
                    icon={CalendarDays} label="Created"
                    value={new Date(productGroup.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    accent="#7C3AED"
                  />
                  <InfoBlock
                    icon={RefreshCw} label="Last Updated"
                    value={new Date(productGroup.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    accent={T.success}
                  />
                </Stack>
              </Box>
            </Box>

            {/* ── Components table card ──────────────────────────────────────── */}
            <Box sx={{
              background: T.cardBg, borderRadius: "20px",
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadowMd, overflow: "hidden",
            }}>
              {/* Table header */}
              <Box sx={{
                px: 3, py: 2.25,
                borderBottom: `1.5px solid ${T.border}`,
                background: `linear-gradient(180deg, #F8F9FF, ${T.cardBg})`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{
                    p: 0.75, borderRadius: "8px",
                    background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                    border: `1px solid ${T.brandMid}`,
                  }}>
                    <Layers size={14} color={T.brand} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "0.9rem", letterSpacing: "-0.02em" }}>
                    Components
                  </Typography>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.4,
                    px: 0.9, py: 0.25, borderRadius: "6px",
                    background: `linear-gradient(135deg, ${T.brandXSoft}, ${T.brandSoft})`,
                    border: `1px solid ${T.brandMid}`,
                  }}>
                    <Zap size={9} color={T.brand} />
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                      {componentCount}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Table */}
              {componentCount === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: "16px", mx: "auto", mb: 2,
                    background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                    border: `1.5px solid ${T.brandMid}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Layers size={22} color={T.brand} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: T.textMid, fontSize: "0.9rem" }}>No components</Typography>
                  <Typography sx={{ color: T.textLight, fontSize: "0.8rem", mt: 0.5 }}>
                    This group has no components added yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  overflowX: "auto",
                  "& .MuiTableCell-root": {
                    borderBottom: `1px solid ${T.border}`,
                    py: 1.75, px: 2,
                  },
                  "& .MuiTableCell-head": {
                    background: `linear-gradient(180deg, #F8F9FF, ${T.subtleBg})`,
                    color: T.textLight, fontSize: "0.65rem", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    borderBottom: `2px solid ${T.border}`,
                    py: 1.5,
                  },
                  "& .MuiTableRow-root:not(.MuiTableRow-head)": {
                    transition: "background 0.12s",
                    "&:hover": { background: `linear-gradient(90deg, ${T.brandXSoft}80, ${T.subtleBg}50)` },
                  },
                  "& .MuiTableRow-root:last-child td": { borderBottom: "none" },
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell>Variant SKU</TableCell>
                        <TableCell>Variant Details</TableCell>
                        <TableCell>Added</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productGroup.components.map((component, idx) => (
                        <TableRow key={component.id}>
                          {/* Position */}
                          <TableCell>
                            <PositionBadge pos={component.position ?? idx + 1} />
                          </TableCell>

                          {/* Product */}
                          <TableCell>
                            <ProductCell
                              name={component.product?.name ?? "Unknown Product"}
                              id={component.product_id}
                            />
                          </TableCell>

                          {/* Quantity */}
                          <TableCell align="center">
                            <QtyBadge qty={component.quantity} />
                          </TableCell>

                          {/* Variant SKU */}
                          <TableCell>
                            {component.variant_sku ? (
                              <Box sx={{
                                display: "inline-flex", alignItems: "center",
                                px: 1, py: 0.3, borderRadius: "6px",
                                background: T.subtleBg, border: `1px solid ${T.border}`,
                              }}>
                                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: T.textMid, fontWeight: 600 }}>
                                  {component.variant_sku}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography sx={{ color: T.textXLight, fontSize: "0.72rem", fontStyle: "italic" }}>N/A</Typography>
                            )}
                          </TableCell>

                          {/* Variant details */}
                          <TableCell>
                            <VariantDetails 
                              details={component.variant_details} 
                              product={component.product}
                              variantSku={component.variant_sku}
                            />
                          </TableCell>

                          {/* Created date */}
                          <TableCell>
                            <Typography sx={{ color: T.textLight, fontSize: "0.72rem", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>
                              {new Date(component.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>

            {/* ── Footer actions ─────────────────────────────────────────────── */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                startIcon={<ArrowLeft size={14} />}
                onClick={() => router.back()}
                sx={{
                  borderRadius: "11px", textTransform: "none",
                  fontWeight: 700, color: T.textMid,
                  border: `1.5px solid ${T.border}`,
                  px: 2.5, height: 40, background: T.cardBg,
                  "&:hover": { background: T.subtleBg, borderColor: T.borderMid },
                  transition: "all 0.15s",
                }}
              >
                Back to List
              </Button>
              <Button
                startIcon={<Edit size={14} />}
                onClick={() => router.push(`/products/product-groups/${params.id}/edit`)}
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                  borderRadius: "11px", textTransform: "none",
                  fontWeight: 800, fontSize: "0.85rem",
                  height: 40, px: 2.5,
                  boxShadow: T.shadowBrand, border: "none",
                  "&:hover": { boxShadow: T.shadowBrandHover, transform: "translateY(-1.5px)" },
                  transition: "all 0.18s",
                }}
              >
                Edit Group
              </Button>
              <Button
                startIcon={<Download size={14} />}
                sx={{
                  borderRadius: "11px", textTransform: "none",
                  fontWeight: 700, color: T.brand,
                  border: `1.5px solid ${T.brandMid}`,
                  px: 2.5, height: 40,
                  background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                  "&:hover": { background: `linear-gradient(135deg, #E0E7FF, ${T.brandSoft})`, boxShadow: T.shadowBrand },
                  transition: "all 0.15s",
                }}
              >
                Export Details
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
}