'use client';

import { config } from "@/config";
import { orders } from "@/constants/apiConstants";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { useDashboard } from "@/hooks/useDashboard";
import { BBDropdownBase, BBLoader } from "@/lib";
import { IStatsResponse } from "@/models/IDashboard";
import { IOrdersResponse } from "@/models/IOrders";
import { EntityTrends } from "@/models/dashboard.model";
import { RootState } from "@/store";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  TrendingUp,
  TrendingDown,
  XCircle,
  Activity,
  Layers,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

/* ─────────────────────────────────────────────
   Inline styles & tokens — no external CSS file
───────────────────────────────────────────── */
const TOKEN = {
  indigo:   "#4F46E5",
  indigoLt: "#EEF2FF",
  violet:   "#7C3AED",
  cyan:     "#0891B2",
  emerald:  "#059669",
  amber:    "#D97706",
  rose:     "#E11D48",
  slate:    "#1E293B",
  muted:    "#64748B",
  border:   "#E2E8F0",
  surface:  "#FFFFFF",
  bg:       "#F8FAFC",
};

const FONT = "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'DM Mono', monospace";

/** Tiny SVG spark-line rendered purely in-component */
function InlineSpark({
  data,
  color = TOKEN.indigo,
  h = 44,
}: {
  data: number[];
  color?: string;
  h?: number;
}) {
  if (!data || data.length < 2) return null;
  const W = 120;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${h - 4 - ((v - min) / range) * (h - 8)}`)
    .join(" ");
  const last = pts.split(" ").pop()!;
  const [lx, ly] = last.split(",").map(Number);
  return (
    <svg viewBox={`0 0 ${W} ${h}`} style={{ width: "100%", height: h }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${W},${h}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="3.5" fill={color} />
    </svg>
  );
}

/** Thin donut ring */
function DonutMini({
  pct,
  color,
  size = 52,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TOKEN.border} strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
    </svg>
  );
}

/** Horizontal progress bar */
function Bar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <Box
      sx={{
        height: 5,
        bgcolor: TOKEN.border,
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          bgcolor: color,
          borderRadius: 99,
          transition: "width 1s ease",
        }}
      />
    </Box>
  );
}

/** Status chip */
function StockChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    in_stock:     { bg: "#DCFCE7", color: "#16A34A", label: "In Stock" },
    low_stock:    { bg: "#FEF9C3", color: "#CA8A04", label: "Low Stock" },
    out_of_stock: { bg: "#FEE2E2", color: "#DC2626", label: "Out of Stock" },
  };
  const cfg = map[status] ?? { bg: TOKEN.indigoLt, color: TOKEN.indigo, label: status };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

/* ─── Types ──────────────────────────────── */
type TrendDataMap = { [key: string]: EntityTrends | null };

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Dashboard = () => {
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const userType        = useSelector((s: RootState) => s.auth.user?.user_type || "");

  const [selectedCustomerType, setSelectedCustomerType] = useState("mobile_user");
  const [allExpanded, setAllExpanded]   = useState(false);
  const [trendDataMap, setTrendDataMap] = useState<TrendDataMap>({});
  const [activeTab, setActiveTab]       = useState<"overview" | "inventory" | "activity">("overview");

  /* dashboard hook */
  const {
    dashboardMetrics, loadingMetrics,
    activitySummary,  loadingActivity,
    stockInfo,        loadingStock,
    loadingTrends,
    fetchDashboardMetrics,
    fetchActivitySummary,
    fetchStockInfo,
    fetchEntityTrends,
    refreshDashboard,
    refreshing,
  } = useDashboard();

  /* sparkline helper */
  const getTrend = (key: string): number[] => {
    const t = trendDataMap[key];
    return t?.data?.length ? t.data.map((d) => d.count || 0) : [];
  };

  /* query params */
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedVendorId) p.append("vendor_id", String(selectedVendorId));
    return p.toString();
  }, [selectedVendorId]);

  const statsQueryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.append("customer_type", selectedCustomerType);
    return p.toString();
  }, [selectedCustomerType]);

  /* smart-fetch hooks */
  const { data: statsResults, loading: statsLoading } = useSmartFetch<IStatsResponse>({
    url: `${orders.getDashboardStats}?${statsQueryParams}`,
    baseUrl: config.loginDomain,
    isCaching: true,
  });

  const { data: results, loading, refetch } = useSmartFetch<IOrdersResponse>({
    url:
      userType === "admin"
        ? orders.getDashboardById(String(selectedVendorId ?? ""))
        : `${orders.getDashboard}?${queryParams}`,
    baseUrl: config.orderDomain,
  });

  /* on mount: load everything */
  useEffect(() => {
    const loadTrends = async () => {
      const entities = ["customer", "vendor", "item", "shipment", "invoice", "sales_order", "purchase_order"];
      for (const e of entities) {
        const t = await fetchEntityTrends(e, 30);
        if (t) setTrendDataMap((prev) => ({ ...prev, [e]: t }));
      }
    };
    fetchDashboardMetrics();
    fetchActivitySummary();
    fetchStockInfo();
    loadTrends();
  }, [fetchDashboardMetrics, fetchActivitySummary, fetchStockInfo, fetchEntityTrends]);

  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });

  const ordersList   = results?.data?.orders ?? [];
  const orderPending = ordersList.filter((o) => o.order_status === "pending").length;
  const lowStock     = stockInfo?.low_stock_count ?? 0;
  const outOfStock   = stockInfo?.out_of_stock_count ?? 0;
  const dm           = dashboardMetrics;

  /* ── KPI card data ──────────────────────── */
  const kpiCards = dm
    ? [
        { title: "Total Customers",   value: dm.customer_metrics.total,        sub: `${dm.customer_metrics.active} active`,         color: TOKEN.indigo,  spark: getTrend("customer"),       icon: Bell },
        { title: "Total Vendors",     value: dm.vendor_metrics.total,          sub: `${dm.vendor_metrics.active} active`,           color: TOKEN.violet,  spark: getTrend("vendor"),         icon: ShoppingCart, bar: true },
        { title: "Total Items",       value: dm.item_metrics.total,            sub: `${dm.item_metrics.item_groups} groups`,         color: TOKEN.cyan,    spark: getTrend("item"),           icon: Package,      bar: true },
        { title: "Total Shipments",   value: dm.shipment_metrics.total,        sub: `${dm.shipment_metrics.in_transit} in transit`,  color: TOKEN.emerald, spark: getTrend("shipment"),       icon: Truck },
        { title: "Invoice Revenue",   value: `₹${(dm.invoice_metrics.total_amount / 100000).toFixed(1)}L`, sub: `${dm.invoice_metrics.overdue_count} overdue`, color: TOKEN.amber, spark: getTrend("invoice"), icon: FileText },
        { title: "Sales Orders",      value: dm.sales_order_metrics.total,     sub: `${dm.sales_order_metrics.pending_count} pending`, color: TOKEN.rose,  spark: getTrend("sales_order"),    icon: BarChart3 },
        { title: "Purchase Orders",   value: dm.purchase_order_metrics.total,  sub: `${dm.purchase_order_metrics.completed_count} done`, color: "#7C3AED", spark: getTrend("purchase_order"), icon: ShoppingCart },
        { title: "Packages",          value: dm.package_metrics.total,         sub: `${dm.package_metrics.delivered_count} delivered`, color: "#0891B2",  spark: getTrend("shipment"),       icon: Layers },
      ]
    : [];

  /* ── inline CSS injected once ───────────── */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    .bb-dash * { box-sizing: border-box; }
    .bb-card {
      background: ${TOKEN.surface};
      border-radius: 16px;
      border: 1px solid ${TOKEN.border};
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(79,70,229,0.05);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .bb-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.07), 0 8px 32px rgba(79,70,229,0.09);
      transform: translateY(-1px);
    }
    .bb-kpi { position: relative; overflow: hidden; }
    .bb-kpi::after {
      content: '';
      position: absolute;
      top: -30px; right: -30px;
      width: 110px; height: 110px;
      border-radius: 50%;
      background: var(--kpi-color, ${TOKEN.indigo});
      opacity: 0.06;
      pointer-events: none;
    }
    .bb-tab {
      padding: 8px 18px; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 600; border: 1.5px solid transparent;
      transition: all 0.18s ease; font-family: ${FONT};
      display: flex; align-items: center; gap: 6px;
    }
    .bb-tab-on  { background: ${TOKEN.indigo}; color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,0.32); }
    .bb-tab-off { background: ${TOKEN.surface}; color: ${TOKEN.muted}; border-color: ${TOKEN.border}; }
    .bb-tab-off:hover { border-color: ${TOKEN.indigo}; color: ${TOKEN.indigo}; background: ${TOKEN.indigoLt}; }
    .bb-btn-ghost {
      padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 600;
      font-size: 13px; border: 1.5px solid ${TOKEN.border}; background: ${TOKEN.surface};
      color: ${TOKEN.slate}; font-family: ${FONT}; transition: all 0.18s ease;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .bb-btn-ghost:hover { border-color: ${TOKEN.indigo}; color: ${TOKEN.indigo}; background: ${TOKEN.indigoLt}; }
    .bb-btn-primary {
      padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 700;
      font-size: 13px; border: none; background: ${TOKEN.indigo}; color: #fff;
      font-family: ${FONT}; transition: all 0.18s ease;
      display: inline-flex; align-items: center; gap: 6px;
      box-shadow: 0 4px 12px rgba(79,70,229,0.28);
    }
    .bb-btn-primary:hover { background: ${TOKEN.violet}; box-shadow: 0 6px 18px rgba(79,70,229,0.38); transform: translateY(-1px); }
    .bb-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .bb-tr { transition: background 0.12s; }
    .bb-tr:hover td { background: ${TOKEN.indigoLt} !important; }
    @keyframes bbFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bb-fade { animation: bbFadeUp 0.45s ease both; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .bb-spin { animation: spin 1s linear infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .bb-pulse { animation: pulse 2s infinite; }
  `;

  return (
    <Box className="bb-dash" sx={{ fontFamily: FONT, color: TOKEN.slate, bgcolor: TOKEN.bg, minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      <style>{globalStyles}</style>
      <BBLoader enabled={loading || statsLoading || loadingMetrics || loadingActivity || loadingStock || loadingTrends} />

      {/* ══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <div
        className="bb-card bb-fade"
        style={{
          marginBottom: 24,
          padding: "24px 28px",
          background: `linear-gradient(130deg, ${TOKEN.indigo} 0%, ${TOKEN.violet} 100%)`,
          border: "none",
          borderRadius: 16,
          animationDelay: "0s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                className="bb-pulse"
                style={{ width: 9, height: 9, borderRadius: "50%", background: "#A5F3FC", boxShadow: "0 0 0 3px rgba(165,243,252,0.3)", display: "inline-block", flexShrink: 0 }}
              />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT }}>
                Live Dashboard
              </span>
            </div>
            <div style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, fontFamily: FONT }}>
              Business Overview
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 4, fontFamily: FONT }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={selectedCustomerType}
              onChange={(e) => setSelectedCustomerType(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#ffffff", padding: "8px 14px", borderRadius: 10, fontSize: 13,
                fontWeight: 600, fontFamily: FONT, cursor: "pointer", outline: "none",
              }}
            >
              <option value="mobile_user" style={{ color: TOKEN.slate, background: "#fff" }}>Mobile User</option>
              <option value="partner"     style={{ color: TOKEN.slate, background: "#fff" }}>Partner</option>
              <option value="vendor"      style={{ color: TOKEN.slate, background: "#fff" }}>Vendor</option>
            </select>

            <Tooltip title="Refresh all metrics">
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                style={{
                  background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "#ffffff", padding: "8px 14px", borderRadius: 10, fontSize: 13,
                  fontWeight: 600, fontFamily: FONT, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <RefreshCw size={14} className={refreshing ? "bb-spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </Tooltip>

            <button
              onClick={() => setAllExpanded((v) => !v)}
              style={{
                background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#ffffff", padding: "8px 14px", borderRadius: 10, fontSize: 13,
                fontWeight: 600, fontFamily: FONT, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {allExpanded ? "Hide Graphs" : "Show Graphs"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ STOCK ALERT ══════════════════════════════════════════════════════ */}
      {(lowStock > 0 || outOfStock > 0) && (
        <Box
          className="bb-card bb-fade"
          sx={{
            mb: 3, p: 2, display: "flex", alignItems: "center", gap: 2,
            bgcolor: "#FFFBEB", border: `1px solid #FCD34D`, animationDelay: "0.08s",
          }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle size={20} color={TOKEN.amber} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>Inventory Alert</Typography>
            <Typography sx={{ fontSize: 12, color: "#B45309" }}>
              <b>{lowStock}</b> items low on stock · <b>{outOfStock}</b> out of stock
            </Typography>
          </Box>
          <button className="bb-btn-ghost" style={{ borderColor: "#FCD34D", color: "#92400E", fontSize: 12 }} onClick={() => setActiveTab("inventory")}>
            View Inventory
          </button>
        </Box>
      )}

      {/* ══ TAB BAR ══════════════════════════════════════════════════════════ */}
      <Stack direction="row" gap={1} mb={3} flexWrap="wrap">
        {([
          { id: "overview",  label: "Overview",  Icon: Activity },
          { id: "inventory", label: "Inventory", Icon: Package },
          { id: "activity",  label: "Activity",  Icon: BarChart3 },
        ] as const).map(({ id, label, Icon }, i) => (
          <button
            key={id}
            className={`bb-tab bb-fade ${activeTab === id ? "bb-tab-on" : "bb-tab-off"}`}
            style={{ animationDelay: `${0.12 + i * 0.05}s` }}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI grid */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {kpiCards.map(({ title, value, sub, color, spark, icon: Icon }, i) => (
              <Grid key={title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Box
                  className="bb-card bb-kpi bb-fade"
                  sx={{ p: 2.5, "--kpi-color": color, animationDelay: `${0.15 + i * 0.04}s` } as any}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                        {title}
                      </Typography>
                      <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: TOKEN.slate, lineHeight: 1.1, fontFamily: MONO }}>
                        {value}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: TOKEN.muted, mt: 0.4, fontWeight: 500 }}>{sub}</Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: 3, flexShrink: 0,
                        background: `${color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon size={20} color={color} strokeWidth={2} />
                    </Box>
                  </Stack>

                  <Collapse in={allExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1.5 }}>
                      <InlineSpark data={spark} color={color} h={42} />
                      <Typography sx={{ fontSize: 10, color: TOKEN.muted, textAlign: "right", mt: 0.5, fontFamily: MONO }}>30d trend</Typography>
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* ── Detail row ── */}
          {dm && (
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {/* Shipment pipeline */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="bb-card bb-fade" sx={{ p: 3, height: "100%", animationDelay: "0.48s" }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={2.5}>
                    <Truck size={16} color={TOKEN.emerald} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate }}>Shipment Pipeline</Typography>
                  </Stack>
                  {[
                    { label: "In Transit", val: dm.shipment_metrics.in_transit,  color: TOKEN.indigo },
                    { label: "Delivered",  val: dm.shipment_metrics.delivered,   color: TOKEN.emerald },
                    { label: "Pending",    val: dm.shipment_metrics.pending,     color: TOKEN.amber },
                    { label: "Shipped",    val: dm.shipment_metrics.shipped,     color: TOKEN.cyan },
                  ].map(({ label, val, color }) => (
                    <Box key={label} mb={1.8}>
                      <Stack direction="row" justifyContent="space-between" mb={0.6}>
                        <Typography sx={{ fontSize: 12, color: TOKEN.muted, fontWeight: 600 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: TOKEN.slate, fontFamily: MONO }}>{val.toLocaleString()}</Typography>
                      </Stack>
                      <Bar value={val} max={dm.shipment_metrics.total} color={color} />
                    </Box>
                  ))}
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: TOKEN.indigoLt, borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Clock size={15} color={TOKEN.indigo} />
                    <Box>
                      <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontWeight: 600 }}>AVG DELIVERY TIME</Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: TOKEN.indigo, fontFamily: MONO }}>
                        {dm.shipment_metrics.average_delivery_time_days} days
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Invoice health */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="bb-card bb-fade" sx={{ p: 3, height: "100%", animationDelay: "0.52s" }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={2.5}>
                    <FileText size={16} color={TOKEN.amber} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate }}>Invoice Health</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={2.5} mb={2.5}>
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <DonutMini
                        pct={dm.invoice_metrics.paid_count / (dm.invoice_metrics.total || 1)}
                        color={TOKEN.emerald}
                        size={64}
                      />
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: TOKEN.slate, fontFamily: MONO }}>
                          {Math.round((dm.invoice_metrics.paid_count / (dm.invoice_metrics.total || 1)) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Paid Rate</Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: TOKEN.emerald, fontFamily: MONO }}>
                        {dm.invoice_metrics.paid_count.toLocaleString()}
                        <Typography component="span" sx={{ fontSize: 12, color: TOKEN.muted, fontWeight: 500, ml: 0.5 }}>
                          / {dm.invoice_metrics.total.toLocaleString()}
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>
                  {[
                    { label: "Total Revenue",   val: `₹${(dm.invoice_metrics.total_amount / 100000).toFixed(1)}L`, color: TOKEN.slate },
                    { label: "Outstanding",     val: `₹${(dm.invoice_metrics.outstanding_amount / 1000).toFixed(0)}K`, color: TOKEN.amber },
                    { label: "Overdue",         val: dm.invoice_metrics.overdue_count, color: TOKEN.rose },
                    { label: "Pending",         val: dm.invoice_metrics.pending_count, color: TOKEN.indigo },
                  ].map(({ label, val, color }) => (
                    <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 0.9, borderTop: `1px solid ${TOKEN.border}` }}>
                      <Typography sx={{ fontSize: 12, color: TOKEN.muted }}>{label}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color, fontFamily: MONO }}>{val}</Typography>
                    </Stack>
                  ))}
                </Box>
              </Grid>

              {/* Orders summary */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="bb-card bb-fade" sx={{ p: 3, height: "100%", animationDelay: "0.56s" }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={2.5}>
                    <BarChart3 size={16} color={TOKEN.rose} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate }}>Orders Overview</Typography>
                  </Stack>
                  <Grid container spacing={1.5}>
                    {[
                      {
                        label: "Sales Orders", total: dm.sales_order_metrics.total,
                        completed: dm.sales_order_metrics.completed_count,
                        pending: dm.sales_order_metrics.pending_count,
                        amount: `₹${(dm.sales_order_metrics.total_amount / 100000).toFixed(1)}L`,
                        color: TOKEN.indigo,
                      },
                      {
                        label: "Purchase Orders", total: dm.purchase_order_metrics.total,
                        completed: dm.purchase_order_metrics.completed_count,
                        pending: dm.purchase_order_metrics.pending_count,
                        amount: `₹${(dm.purchase_order_metrics.total_amount / 100000).toFixed(1)}L`,
                        color: TOKEN.violet,
                      },
                    ].map(({ label, total, completed, pending, amount, color }) => (
                      <Grid key={label} size={6}>
                        <Box sx={{ background: `${color}0d`, border: `1px solid ${color}22`, borderRadius: 2.5, p: 1.8 }}>
                          <Typography sx={{ fontSize: 11, color: TOKEN.muted, fontWeight: 600, mb: 0.5 }}>{label}</Typography>
                          <Typography sx={{ fontSize: 22, fontWeight: 800, color, fontFamily: MONO, mb: 0.8 }}>{total.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: 11, color: TOKEN.muted, mb: 0.3 }}>✓ {completed} done</Typography>
                          <Typography sx={{ fontSize: 11, color: TOKEN.muted, mb: 1 }}>⏳ {pending} pending</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: TOKEN.slate }}>{amount}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Package mini */}
                  <Box sx={{ mt: 2, p: 1.5, border: `1px solid ${TOKEN.border}`, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Packages Delivered</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: TOKEN.emerald, fontFamily: MONO }}>{dm.package_metrics.delivered_count.toLocaleString()}</Typography>
                    </Box>
                    <Chip
                      label={`${dm.package_metrics.in_transit_count} in transit`}
                      size="small"
                      sx={{ bgcolor: `${TOKEN.cyan}18`, color: TOKEN.cyan, fontWeight: 700, fontSize: 11 }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Entity Trends tables */}
          {Object.entries(trendDataMap).map(([entity, trends]) => {
            if (!trends?.data?.length) return null;
            return (
              <Box key={entity} sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate, mb: 1.5, mt: 1 }}>
                  {entity.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Trends — Last 30 Days
                </Typography>
                <Box className="bb-card" sx={{ p: 0, overflow: "hidden" }}>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: TOKEN.bg }}>
                          {["Date", "Total", "Active", "Created Today"].map((h) => (
                            <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1.5px solid ${TOKEN.border}` }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {trends.data.slice(0, 10).map((tr, idx) => (
                          <tr key={idx} className="bb-tr" style={{ borderBottom: `1px solid ${TOKEN.bg}` }}>
                            <td style={{ padding: "10px 16px", fontSize: 13, color: TOKEN.slate, fontFamily: MONO }}>{new Date(tr.date).toLocaleDateString("en-IN")}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ background: TOKEN.indigoLt, color: TOKEN.indigo, padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: MONO }}>{tr.count}</span>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ background: "#DCFCE7", color: TOKEN.emerald, padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: MONO }}>{tr.active_count}</span>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ background: "#FEF9C3", color: TOKEN.amber, padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: MONO }}>{tr.created_today}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          INVENTORY TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && stockInfo && (
        <>
          {/* Stock KPI strip */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total Items",    val: stockInfo.total_items,       color: TOKEN.indigo,  bg: TOKEN.indigoLt, icon: Package },
              { label: "In Stock",       val: stockInfo.in_stock_count,    color: TOKEN.emerald, bg: "#DCFCE7",      icon: CheckCircle },
              { label: "Low Stock",      val: stockInfo.low_stock_count,   color: TOKEN.amber,   bg: "#FEF9C3",      icon: Clock },
              { label: "Out of Stock",   val: stockInfo.out_of_stock_count, color: TOKEN.rose,   bg: "#FEE2E2",      icon: XCircle },
              { label: "Total Quantity", val: stockInfo.total_quantity,    color: TOKEN.violet,  bg: "#F5F3FF",      icon: Layers },
            ].map(({ label, val, color, bg, icon: Icon }, i) => (
              <Grid key={label} size={{ xs: 6, sm: 4, md: "auto" }}>
                <Box className="bb-card bb-fade" sx={{ p: 2.5, bgcolor: bg, border: `1px solid ${color}22`, animationDelay: `${0.07 * i}s` }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.2 }}>
                    <Icon size={18} color={color} strokeWidth={2} />
                  </Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color, fontFamily: MONO }}>{val?.toLocaleString()}</Typography>
                  <Typography sx={{ fontSize: 11, color: TOKEN.muted, fontWeight: 600, mt: 0.3 }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Table view */}
          {stockInfo.data?.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate, mb: 1.5 }}>
                Inventory Details ({stockInfo.data.length} items)
              </Typography>
              <Box className="bb-card bb-fade" sx={{ mb: 3, overflow: "hidden", animationDelay: "0.25s" }}>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: TOKEN.bg }}>
                        {["Item", "Current", "Available", "Reserved", "In Transit", "Utilization", "Status"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 16px",
                              textAlign: h === "Item" ? "left" : "center",
                              fontSize: 11, fontWeight: 700, color: TOKEN.muted,
                              textTransform: "uppercase", letterSpacing: "0.06em",
                              borderBottom: `2px solid ${TOKEN.border}`,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stockInfo.data.map((item, idx) => {
                        const util = item.current_quantity > 0 ? Math.round((item.reserved_quantity / item.current_quantity) * 100) : 0;
                        const utColor = util > 70 ? TOKEN.rose : util > 40 ? TOKEN.amber : TOKEN.emerald;
                        return (
                          <tr key={item.item_id} className="bb-tr" style={{ borderBottom: `1px solid ${TOKEN.border}`, background: idx % 2 === 0 ? TOKEN.surface : TOKEN.bg }}>
                            <td style={{ padding: "13px 16px" }}>
                              <Typography sx={{ fontWeight: 600, fontSize: 13, color: TOKEN.slate }}>{item.item_name}</Typography>
                              <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontFamily: MONO, mt: 0.2 }}>{item.item_id}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: MONO, color: TOKEN.slate }}>{item.current_quantity}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography sx={{ fontWeight: 600, fontSize: 13, fontFamily: MONO, color: TOKEN.muted }}>{item.available_quantity}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <span style={{
                                background: item.reserved_quantity > 0 ? "#FEF3C7" : TOKEN.bg,
                                color: item.reserved_quantity > 0 ? "#92400E" : TOKEN.muted,
                                padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: MONO,
                              }}>
                                {item.reserved_quantity}
                              </span>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <span style={{ background: "#EFF6FF", color: "#1D4ED8", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: MONO }}>
                                {item.in_transit_quantity}
                              </span>
                            </td>
                            <td style={{ padding: "13px 20px", minWidth: 130 }}>
                              <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{ flex: 1, height: 5, bgcolor: TOKEN.border, borderRadius: 99, overflow: "hidden" }}>
                                  <Box sx={{ width: `${util}%`, height: "100%", bgcolor: utColor, borderRadius: 99, transition: "width 1s ease" }} />
                                </Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: utColor, minWidth: 32, textAlign: "right", fontFamily: MONO }}>{util}%</Typography>
                              </Stack>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <StockChip status={item.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Box>

              {/* Card grid */}
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate, mb: 1.5 }}>Stock Items — Card View</Typography>
              <Grid container spacing={2}>
                {stockInfo.data.map((item, idx) => {
                  const sc = { in_stock: TOKEN.emerald, low_stock: TOKEN.amber, out_of_stock: TOKEN.rose }[item.status] ?? TOKEN.muted;
                  const util = item.current_quantity > 0 ? Math.round((item.reserved_quantity / item.current_quantity) * 100) : 0;
                  return (
                    <Grid key={item.item_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Box className="bb-card bb-fade" sx={{ p: 2.5, cursor: "pointer", animationDelay: `${0.04 * idx}s` }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: TOKEN.slate, mb: 0.3 }}>{item.item_name}</Typography>
                            <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontFamily: MONO }}>{item.item_id}</Typography>
                          </Box>
                          <StockChip status={item.status} />
                        </Stack>
                        <Divider sx={{ mb: 1.5, borderColor: TOKEN.border }} />
                        <Grid container spacing={1} sx={{ mb: 1.5 }}>
                          {[
                            { label: "Current",    val: item.current_quantity,    color: TOKEN.indigo },
                            { label: "Available",  val: item.available_quantity,  color: TOKEN.emerald },
                            { label: "Reserved",   val: item.reserved_quantity,   color: item.reserved_quantity > 0 ? TOKEN.amber : TOKEN.muted },
                            { label: "In Transit", val: item.in_transit_quantity, color: TOKEN.cyan },
                          ].map(({ label, val, color }) => (
                            <Grid key={label} size={6}>
                              <Box sx={{ bgcolor: TOKEN.bg, borderRadius: 2, p: 1.2 }}>
                                <Typography sx={{ fontSize: 10, color: TOKEN.muted, fontWeight: 600 }}>{label}</Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color, fontFamily: MONO }}>{val}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        <Stack direction="row" justifyContent="space-between" mb={0.6}>
                          <Typography sx={{ fontSize: 11, color: TOKEN.muted }}>Utilization</Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: sc, fontFamily: MONO }}>{util}%</Typography>
                        </Stack>
                        <Bar value={item.reserved_quantity} max={item.current_quantity} color={sc} />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ACTIVITY TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "activity" && (
        <>
          {activitySummary && (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate, mb: 1.5 }}>Today's Activity</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: "Customers Created",  val: activitySummary.created_customers_today,    color: TOKEN.indigo,  icon: Bell },
                  { label: "Vendors Created",    val: activitySummary.created_vendors_today,      color: TOKEN.violet,  icon: ShoppingCart },
                  { label: "Items Created",      val: activitySummary.created_items_today,        color: TOKEN.cyan,    icon: Package },
                  { label: "Sales Orders",       val: activitySummary.created_sales_orders_today, color: TOKEN.emerald, icon: BarChart3 },
                  { label: "Purchase Orders",    val: activitySummary.created_purchase_orders_today, color: TOKEN.amber, icon: FileText },
                  { label: "Shipped Today",      val: activitySummary.shipped_today,              color: TOKEN.rose,    icon: Truck },
                  { label: "Delivered Today",    val: activitySummary.delivered_today,            color: "#0891B2",     icon: CheckCircle },
                ].map(({ label, val, color, icon: Icon }, i) => (
                  <Grid key={label} size={{ xs: 6, sm: 4, md: 3, lg: "auto" }}>
                    <Box className="bb-card bb-fade" sx={{ p: 2.5, animationDelay: `${0.06 * i}s` }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                        <Icon size={17} color={color} strokeWidth={2} />
                      </Box>
                      <Typography sx={{ fontSize: 26, fontWeight: 800, color, fontFamily: MONO, mb: 0.3 }}>{val}</Typography>
                      <Typography sx={{ fontSize: 11, color: TOKEN.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Deep-dive metric panels */}
          {dm && (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate, mb: 1.5 }}>Business Metrics Deep Dive</Typography>
              <Grid container spacing={2.5}>
                {[
                  {
                    title: "Customers", icon: Bell, color: TOKEN.indigo,
                    rows: [
                      { label: "Total",         val: dm.customer_metrics.total },
                      { label: "Active",        val: dm.customer_metrics.active },
                      { label: "Inactive",      val: dm.customer_metrics.inactive },
                      { label: "New Today",     val: dm.customer_metrics.created_today },
                    ],
                  },
                  {
                    title: "Packages", icon: Layers, color: TOKEN.cyan,
                    rows: [
                      { label: "Total",         val: dm.package_metrics.total },
                      { label: "Delivered",     val: dm.package_metrics.delivered_count },
                      { label: "In Transit",    val: dm.package_metrics.in_transit_count },
                      { label: "Pending",       val: dm.package_metrics.pending_count },
                    ],
                  },
                  {
                    title: "Items", icon: Package, color: TOKEN.violet,
                    rows: [
                      { label: "Total Items",   val: dm.item_metrics.total },
                      { label: "Total Stock",   val: dm.item_metrics.total_stock },
                      { label: "Low Stock",     val: dm.item_metrics.low_stock_items },
                      { label: "Out of Stock",  val: dm.item_metrics.out_of_stock_items },
                    ],
                  },
                  {
                    title: "Vendors", icon: ShoppingCart, color: TOKEN.amber,
                    rows: [
                      { label: "Total",         val: dm.vendor_metrics.total },
                      { label: "Active",        val: dm.vendor_metrics.active },
                      { label: "Inactive",      val: dm.vendor_metrics.inactive },
                      { label: "New Today",     val: dm.vendor_metrics.created_today },
                    ],
                  },
                ].map(({ title, icon: Icon, color, rows }, i) => (
                  <Grid key={title} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Box className="bb-card bb-fade" sx={{ p: 2.5, animationDelay: `${0.08 * i}s` }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={16} color={color} strokeWidth={2} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: TOKEN.slate }}>{title}</Typography>
                      </Stack>
                      {rows.map(({ label, val }) => (
                        <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1, borderTop: `1px solid ${TOKEN.border}` }}>
                          <Typography sx={{ fontSize: 12, color: TOKEN.muted }}>{label}</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TOKEN.slate, fontFamily: MONO }}>{val?.toLocaleString()}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Footer */}
      <Box sx={{ mt: 5, pt: 2.5, borderTop: `1px solid ${TOKEN.border}`, textAlign: "center" }}>
        <Typography sx={{ fontSize: 12, color: TOKEN.muted }}>
          Dashboard · Last refreshed {new Date().toLocaleTimeString("en-IN")}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;