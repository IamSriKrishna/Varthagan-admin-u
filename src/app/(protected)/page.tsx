'use client';

import { config } from "@/config";
import { orders } from "@/constants/apiConstants";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { useDashboard } from "@/hooks/useDashboard";
import { BBLoader } from "@/lib";
import { IStatsResponse } from "@/models/IDashboard";
import { IOrdersResponse } from "@/models/IOrders";
import { EntityTrends } from "@/models/dashboard.model";
import { RootState } from "@/store";
import { User } from "@/lib/api/userApi";
import { AdminUserSelector } from "@/components/AdminUserSelector";
import {
  stockService,
  StockSummaryItem,    // from GET /api/stock/summary  → used in Stock tab
  DashboardStockItem,  // from GET /dashboard/stock    → used in Inventory tab
  DashboardStockResponse,
  StockSummaryResponse,
} from "@/lib/api/stockService";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  XCircle,
  Activity,
  Layers,
  ArrowUpRight,
  Zap,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — Warm Cream Light Theme
───────────────────────────────────────────────────────────── */
const C = {
  bg:        "#F7F4EF",
  surface:   "#FFFFFF",
  surfaceAlt:"#FDFBF8",
  border:    "#E8E2D9",
  borderMid: "#D4CCBE",
  ink:       "#1A1714",
  inkMid:    "#3D3830",
  muted:     "#8A8279",
  subtle:    "#B8B0A4",
  saffron:   "#E8690A",
  saffronLt: "#FEF3EA",
  teal:      "#0D7C6E",
  tealLt:    "#E6F5F3",
  plum:      "#6B3FA0",
  plumLt:    "#F2ECF9",
  rust:      "#B84040",
  rustLt:    "#FDEAEA",
  pine:      "#2D6A4F",
  pineLt:    "#E8F5EE",
  gold:      "#C17D27",
  goldLt:    "#FDF5E6",
  azure:     "#2563EB",
  azureLt:   "#EBF2FE",
  ok:        "#2D6A4F",
  warn:      "#C17D27",
  danger:    "#B84040",
};

const DISPLAY = "'Fraunces', 'Playfair Display', Georgia, serif";
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif";
const MONO    = "'DM Mono', 'IBM Plex Mono', monospace";

/* ─── InlineSpark ─────────────────────────────────────────── */
function InlineSpark({ data, color = C.saffron, h = 44 }: { data: number[]; color?: string; h?: number }) {
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
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} style={{ width: "100%", height: h }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3.5" fill={color} stroke={C.surface} strokeWidth="1.5" />
    </svg>
  );
}

/* ─── DonutMini ────────────────────────────────────────────── */
function DonutMini({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
    </svg>
  );
}

/* ─── ProgressBar ──────────────────────────────────────────── */
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <Box sx={{ height: 4, bgcolor: C.border, borderRadius: 99, overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: color, borderRadius: 99, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }} />
    </Box>
  );
}

/* ─── StockStatusChip ──────────────────────────────────────── */
function StockChip({ status }: { status: 'in_stock' | 'low_stock' | 'out_of_stock' }) {
  const map = {
    in_stock:     { bg: C.pineLt,  fg: C.pine,   label: "In Stock" },
    low_stock:    { bg: C.goldLt,  fg: C.gold,   label: "Low Stock" },
    out_of_stock: { bg: C.rustLt,  fg: C.rust,   label: "Out of Stock" },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.fg, padding: "3px 11px",
      borderRadius: 99, fontSize: 11, fontWeight: 600, fontFamily: BODY,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.fg, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ─── Types ─────────────────────────────────────────────────── */
type TrendDataMap = { [key: string]: EntityTrends | null };
type TabId = "overview" | "inventory" | "activity" | "stock";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .db-root *, .db-root *::before, .db-root *::after { box-sizing: border-box; }

  .db-card {
    background: ${C.surface};
    border-radius: 18px;
    border: 1px solid ${C.border};
    box-shadow: 0 1px 2px rgba(26,23,20,0.04), 0 6px 24px rgba(26,23,20,0.05);
    transition: box-shadow 0.22s ease, transform 0.22s ease;
  }
  .db-card:hover {
    box-shadow: 0 2px 8px rgba(26,23,20,0.06), 0 12px 40px rgba(26,23,20,0.09);
    transform: translateY(-1.5px);
  }
  .db-card-flat {
    background: ${C.surface};
    border-radius: 18px;
    border: 1px solid ${C.border};
  }
  .db-kpi { position: relative; overflow: hidden; }
  .db-kpi::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--kpi-bg, transparent);
    opacity: 0.5;
    border-radius: 18px;
    pointer-events: none;
  }
  .db-tab {
    padding: 9px 20px; border-radius: 12px; cursor: pointer;
    font-size: 13px; font-weight: 600; border: 1.5px solid transparent;
    transition: all 0.18s ease; font-family: ${BODY};
    display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .db-tab-on  { background: ${C.ink}; color: #fff; box-shadow: 0 4px 16px rgba(26,23,20,0.22); border-color: ${C.ink}; }
  .db-tab-off { background: ${C.surface}; color: ${C.muted}; border-color: ${C.border}; }
  .db-tab-off:hover { border-color: ${C.ink}; color: ${C.ink}; background: ${C.surfaceAlt}; }
  .db-btn {
    padding: 9px 18px; border-radius: 11px; cursor: pointer; font-weight: 600;
    font-size: 13px; border: 1.5px solid ${C.border}; background: ${C.surface};
    color: ${C.inkMid}; font-family: ${BODY}; transition: all 0.18s ease;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .db-btn:hover { border-color: ${C.borderMid}; background: ${C.surfaceAlt}; color: ${C.ink}; }
  .db-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .db-tr { transition: background 0.12s; }
  .db-tr:hover td { background: ${C.surfaceAlt} !important; }
  .db-rule { height: 1px; background: ${C.border}; border: none; margin: 0; }
  .db-num { font-family: ${MONO}; font-feature-settings: "tnum"; }
  @keyframes dbUp   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes dbLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
  .db-fade  { animation: dbUp   0.48s cubic-bezier(0.22,1,0.36,1) both; }
  .db-left  { animation: dbLeft 0.38s cubic-bezier(0.22,1,0.36,1) both; }
  .db-spin  { animation: spin 1s linear infinite; }
  .db-pulse { animation: pulse 2.2s ease infinite; }
  .db-header {
    background: ${C.ink};
    position: relative;
    overflow: hidden;
    border-radius: 20px;
  }
  .db-header::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, ${C.saffron}44 0%, transparent 70%);
    pointer-events: none;
  }
  .db-header::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 10%;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, ${C.teal}33 0%, transparent 70%);
    pointer-events: none;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.borderMid}; border-radius: 99px; }
`;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const userType         = useSelector((s: RootState) => s.auth.user?.user_type || "");
  const currentUserRole  = useSelector((s: RootState) => s.auth.user?.role || "");

  const [selectedCustomerType, setSelectedCustomerType] = useState("mobile_user");
  const [allExpanded,  setAllExpanded]  = useState(false);
  const [trendDataMap, setTrendDataMap] = useState<TrendDataMap>({});
  const [activeTab,    setActiveTab]    = useState<TabId>("overview");
  const [viewUserId,   setViewUserId]   = useState<number | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // ── Stock tab state: GET /api/stock/summary → StockSummaryItem[]
  const [summaryStocks,   setSummaryStocks]   = useState<StockSummaryItem[]>([]);
  const [summaryMeta,     setSummaryMeta]     = useState<{ total_stock_value: number; total_sold_product_value: number } | null>(null);
  const [summaryLoading,  setSummaryLoading]  = useState(false);
  const [summaryError,    setSummaryError]    = useState<string | null>(null);

  // ── Inventory tab state: GET /dashboard/stock → DashboardStockItem[]
  const [dashStocks,   setDashStocks]   = useState<DashboardStockItem[]>([]);
  const [dashStockMeta, setDashStockMeta] = useState<Omit<DashboardStockResponse, 'data'> | null>(null);
  const [dashStockLoading, setDashStockLoading] = useState(false);
  const [dashStockError,   setDashStockError]   = useState<string | null>(null);

  /* ── URL param: view_user_id ── */
  useEffect(() => {
    const uid = searchParams?.get("view_user_id");
    if (uid) { const p = parseInt(uid, 10); if (!isNaN(p)) setViewUserId(p); }
  }, [searchParams]);

  const {
    dashboardMetrics, loadingMetrics,
    activitySummary,  loadingActivity,
    stockInfo,        loadingStock,
    loadingTrends,
    fetchDashboardMetrics, fetchActivitySummary,
    fetchStockInfo,        fetchEntityTrends,
    refreshDashboard,      refreshing,
  } = useDashboard();

  const getTrend = (key: string): number[] => {
    const t = trendDataMap[key];
    return t?.data?.length ? t.data.map((d) => d.count || 0) : [];
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user); setViewUserId(user.id); setShowUserSelector(false);
    const p = new URLSearchParams(); p.set("view_user_id", String(user.id));
    router.push(`/?${p.toString()}`);
  };
  const handleClearUserSelection = () => {
    setSelectedUser(null); setViewUserId(undefined); setShowUserSelector(false);
    router.push("/");
  };

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

  const { data: statsResults, loading: statsLoading } = useSmartFetch<IStatsResponse>({
    url: `${orders.getDashboardStats}?${statsQueryParams}`,
    baseUrl: config.loginDomain, isCaching: true,
  });
  const { data: results, loading, refetch } = useSmartFetch<IOrdersResponse>({
    url: userType === "admin"
      ? orders.getDashboardById(String(selectedVendorId ?? ""))
      : `${orders.getDashboard}?${queryParams}`,
    baseUrl: config.orderDomain,
  });

  /* ── On mount: load dashboard metrics + trends ── */
  useEffect(() => {
    const loadTrends = async () => {
      const entities = ["customer","vendor","item","shipment","invoice","sales_order","purchase_order"];
      for (const e of entities) {
        const t = await fetchEntityTrends(e, 30, viewUserId);
        if (t) setTrendDataMap((prev) => ({ ...prev, [e]: t }));
      }
    };
    fetchDashboardMetrics(viewUserId);
    fetchActivitySummary(viewUserId);
    fetchStockInfo(viewUserId);
    loadTrends();
  }, [fetchDashboardMetrics, fetchActivitySummary, fetchStockInfo, fetchEntityTrends, viewUserId]);

  /* ── Stock tab: GET /api/stock/summary ──────────────────────────────
     Response fields: purchased_total, sold_total, last_purchased, last_sold,
                      sku, variant_name, type, stock_value
     For superadmin: includes view_user_id parameter when user is selected
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "stock") return;
    const run = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        // Calls GET /api/stock/summary
        // If superadmin with selected user, include view_user_id parameter
        const userIdParam = currentUserRole === "superadmin" && viewUserId ? viewUserId : undefined;
        const res: StockSummaryResponse = await stockService.getStockSummary(userIdParam);

        setSummaryStocks(res.stocks);
        setSummaryMeta({
          total_stock_value:        res.total_stock_value,
          total_sold_product_value: res.total_sold_product_value,
        });
      } catch (e) {
        setSummaryError(e instanceof Error ? e.message : String(e));
        setSummaryStocks([]);
        setSummaryMeta(null);
      } finally {
        setSummaryLoading(false);
      }
    };
    run();
  }, [activeTab, viewUserId, currentUserRole]);

  /* ── Inventory tab: GET /dashboard/stock ────────────────────────────
     Response fields: purchased_stock, sold_stock, last_purchased_date,
                      last_sold_date, status, revaluation_amount
     For superadmin: includes view_user_id parameter when user is selected
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "inventory") return;
    const run = async () => {
      try {
        setDashStockLoading(true);
        setDashStockError(null);

        // Calls GET /dashboard/stock — pass the API base URL
        // If superadmin with selected user, include view_user_id parameter
        const userIdParam = currentUserRole === "superadmin" && viewUserId ? viewUserId : undefined;
        const res: DashboardStockResponse = await stockService.getDashboardStock(config.apiDomain || "", userIdParam);

        const { data, ...meta } = res;
        setDashStocks(data);
        setDashStockMeta(meta);
      } catch (e) {
        setDashStockError(e instanceof Error ? e.message : String(e));
        setDashStocks([]);
        setDashStockMeta(null);
      } finally {
        setDashStockLoading(false);
      }
    };
    run();
  }, [activeTab, viewUserId, currentUserRole]);

  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });

  const ordersList = results?.data?.orders ?? [];
  const lowStock   = stockInfo?.low_stock_count  ?? 0;
  const outOfStock = stockInfo?.out_of_stock_count ?? 0;
  const dm         = dashboardMetrics;

  const ENTITY_COLORS: Record<string, string> = {
    customer: C.azure, vendor: C.plum, item: C.teal,
    shipment: C.pine, invoice: C.gold, sales_order: C.saffron, purchase_order: C.rust,
  };

  const kpiCards = dm ? [
    { title: "Customers",       value: dm.customer_metrics.total,        sub: `${dm.customer_metrics.active} active`,            color: C.azure,   spark: getTrend("customer"),        icon: Users },
    { title: "Vendors",         value: dm.vendor_metrics.total,          sub: `${dm.vendor_metrics.active} active`,              color: C.plum,    spark: getTrend("vendor"),          icon: ShoppingCart },
    { title: "Inventory Items", value: dm.item_metrics.total,            sub: `${dm.item_metrics.item_groups} groups`,            color: C.teal,    spark: getTrend("item"),            icon: Package },
    { title: "Shipments",       value: dm.shipment_metrics.total,        sub: `${dm.shipment_metrics.in_transit} in transit`,    color: C.pine,    spark: getTrend("shipment"),        icon: Truck },
    { title: "Revenue",         value: `₹${(dm.invoice_metrics.total_amount/100000).toFixed(1)}L`, sub: `${dm.invoice_metrics.overdue_count} overdue`, color: C.gold, spark: getTrend("invoice"), icon: DollarSign },
    { title: "Sales Orders",    value: dm.sales_order_metrics.total,     sub: `${dm.sales_order_metrics.pending_count} pending`,  color: C.saffron, spark: getTrend("sales_order"),     icon: BarChart3 },
    { title: "Purchase Orders", value: dm.purchase_order_metrics.total,  sub: `${dm.purchase_order_metrics.completed_count} done`, color: C.rust,  spark: getTrend("purchase_order"),  icon: FileText },
    { title: "Packages",        value: dm.package_metrics.total,         sub: `${dm.package_metrics.delivered_count} delivered`,  color: C.inkMid, spark: getTrend("shipment"),        icon: Layers },
  ] : [];

  /* ─── Sub-components ─────────────────────────────────────── */
  const IconBox = ({ Icon, color, size = 38 }: { Icon: React.ElementType; color: string; size?: number }) => (
    <Box sx={{
      width: size, height: size, borderRadius: "10px", flexShrink: 0,
      background: `${color}16`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={size * 0.47} color={color} strokeWidth={1.8} />
    </Box>
  );

  const SectionHeading = ({ children, delay = "0s" }: { children: React.ReactNode; delay?: string }) => (
    <Typography className="db-left" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: C.ink, mb: 2, mt: 0.5, animationDelay: delay }}>
      {children}
    </Typography>
  );

  const TH = ({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" }) => (
    <th style={{
      padding: "13px 16px", textAlign: align, fontSize: 10, fontWeight: 700,
      color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em",
      borderBottom: `1.5px solid ${C.border}`, background: C.bg, fontFamily: BODY,
    }}>{children}</th>
  );

  const LoadingSpinner = ({ label }: { label: string }) => (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Box className="db-spin" sx={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.saffron, mx: "auto", mb: 2 }} />
      <Typography sx={{ color: C.muted, fontSize: 13 }}>{label}</Typography>
    </Box>
  );

  const ErrorState = ({ msg }: { msg: string }) => (
    <Box sx={{ p: 4, textAlign: "center", bgcolor: C.rustLt, border: `1px solid ${C.rust}33`, borderRadius: 3 }}>
      <AlertCircle size={28} color={C.rust} style={{ marginBottom: 12 }} />
      <Typography sx={{ color: C.rust, fontWeight: 700, mb: 0.5 }}>Error Loading Data</Typography>
      <Typography sx={{ color: C.muted, fontSize: 13 }}>{msg}</Typography>
    </Box>
  );

  const EmptyState = ({ msg, sub }: { msg: string; sub?: string }) => (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: C.bg, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
        <Package size={22} color={C.subtle} />
      </Box>
      <Typography sx={{ color: C.inkMid, fontWeight: 600, fontSize: 15, mb: 0.5 }}>{msg}</Typography>
      {sub && <Typography sx={{ color: C.muted, fontSize: 13 }}>{sub}</Typography>}
    </Box>
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Box className="db-root" sx={{ fontFamily: BODY, color: C.ink, bgcolor: C.bg, minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      <style>{GLOBAL_CSS}</style>
      <BBLoader enabled={loading || statsLoading || loadingMetrics || loadingActivity || loadingStock || loadingTrends} />

      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="db-header db-fade" style={{ marginBottom: 24, padding: "28px 32px", animationDelay: "0s", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 2 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="db-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: C.saffron, boxShadow: `0 0 0 3px ${C.saffron}40`, display: "inline-block", flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: BODY }}>
                Live · Updating now
              </span>
            </div>
            <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, fontFamily: DISPLAY }}>
              Business Overview
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 5, fontFamily: BODY }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {currentUserRole === "superadmin" ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowUserSelector(!showUserSelector)} style={{
                  background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.9)", padding: "9px 16px", borderRadius: 11, fontSize: 13,
                  fontWeight: 600, fontFamily: BODY, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  <Users size={14} />
                  {selectedUser ? selectedUser.username : "Select User"}
                  <ChevronDown size={13} />
                </button>
                {showUserSelector && (
                  <AdminUserSelector onUserSelect={handleUserSelect} selectedUserId={viewUserId} isOpen={showUserSelector} />
                )}
                {selectedUser && (
                  <Tooltip title="Clear user selection">
                    <button onClick={handleClearUserSelection} style={{
                      marginLeft: 6, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.75)", padding: "9px 11px", borderRadius: 11, cursor: "pointer",
                      display: "inline-flex", alignItems: "center",
                    }}>
                      <XCircle size={14} />
                    </button>
                  </Tooltip>
                )}
              </div>
            ) : (
              <select value={selectedCustomerType} onChange={(e) => setSelectedCustomerType(e.target.value)} style={{
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.9)", padding: "9px 14px", borderRadius: 11, fontSize: 13,
                fontWeight: 600, fontFamily: BODY, cursor: "pointer", outline: "none",
              }}>
                <option value="mobile_user" style={{ color: C.ink, background: "#fff" }}>Mobile User</option>
                <option value="partner"     style={{ color: C.ink, background: "#fff" }}>Partner</option>
                <option value="vendor"      style={{ color: C.ink, background: "#fff" }}>Vendor</option>
              </select>
            )}

            <Tooltip title="Refresh all metrics">
              <button onClick={() => refreshDashboard(viewUserId)} disabled={refreshing} style={{
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.9)", padding: "9px 16px", borderRadius: 11, fontSize: 13,
                fontWeight: 600, fontFamily: BODY, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}>
                <RefreshCw size={13} className={refreshing ? "db-spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </Tooltip>

            <button onClick={() => setAllExpanded((v) => !v)} style={{
              background: C.saffron, border: "none", color: "#fff", padding: "9px 16px", borderRadius: 11,
              fontSize: 13, fontWeight: 700, fontFamily: BODY, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 14px rgba(232,105,10,0.40)",
            }}>
              {allExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {allExpanded ? "Hide Trends" : "Show Trends"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ STOCK ALERT ══════════════════════════════════════════════════ */}
      {(lowStock > 0 || outOfStock > 0) && (
        <Box className="db-card db-fade" sx={{
          mb: 3, p: "14px 20px", display: "flex", alignItems: "center", gap: 2,
          bgcolor: C.goldLt, border: `1.5px solid ${C.gold}44`, animationDelay: "0.06s",
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${C.gold}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle size={18} color={C.gold} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#7C4F14", mb: 0.2 }}>Inventory Alert</Typography>
            <Typography sx={{ fontSize: 12, color: C.gold }}>
              <b>{lowStock}</b> items low · <b>{outOfStock}</b> out of stock
            </Typography>
          </Box>
          <button className="db-btn" style={{ borderColor: `${C.gold}55`, color: C.gold, fontSize: 12, padding: "7px 14px" }}
            onClick={() => setActiveTab("inventory")}>
            View Inventory →
          </button>
        </Box>
      )}

      {/* ══ TAB BAR ══════════════════════════════════════════════════════ */}
      <Stack direction="row" gap={1} mb={3} flexWrap="wrap">
        {([
          { id: "overview",  label: "Overview",  Icon: Activity },
          { id: "inventory", label: "Inventory", Icon: Package },
          { id: "activity",  label: "Activity",  Icon: Zap },
          { id: "stock",     label: "Stock",     Icon: Layers },
        ] as const).map(({ id, label, Icon }, i) => (
          <button key={id} className={`db-tab db-fade ${activeTab === id ? "db-tab-on" : "db-tab-off"}`}
            style={{ animationDelay: `${0.1 + i * 0.04}s` }} onClick={() => setActiveTab(id)}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {kpiCards.map(({ title, value, sub, color, spark, icon: Icon }, i) => (
              <Grid key={title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Box className="db-card db-kpi db-fade" sx={{ p: 2.5, animationDelay: `${0.14 + i * 0.04}s`, "--kpi-bg": `${color}06` } as any}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <IconBox Icon={Icon} color={color} size={40} />
                    <ArrowUpRight size={15} color={C.subtle} />
                  </Stack>
                  <Typography className="db-num" sx={{ fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: "-0.04em", lineHeight: 1, mb: 0.5 }}>
                    {value}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 500, mb: 0.3 }}>{sub}</Typography>
                  <Typography sx={{ fontSize: 11, color: C.subtle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</Typography>
                  <Collapse in={allExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${C.border}` }}>
                      <InlineSpark data={spark} color={color} h={40} />
                      <Typography sx={{ fontSize: 10, color: C.subtle, textAlign: "right", mt: 0.5, fontFamily: MONO }}>30-day trend</Typography>
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            ))}
          </Grid>

          {dm && (
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {/* Shipment Pipeline */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="db-card db-fade" sx={{ p: 3, height: "100%", animationDelay: "0.44s" }}>
                  <Stack direction="row" alignItems="center" gap={1.2} mb={3}>
                    <IconBox Icon={Truck} color={C.pine} size={32} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Shipment Pipeline</Typography>
                  </Stack>
                  {[
                    { label: "In Transit", val: dm.shipment_metrics.in_transit,  color: C.azure },
                    { label: "Delivered",  val: dm.shipment_metrics.delivered,   color: C.pine },
                    { label: "Pending",    val: dm.shipment_metrics.pending,     color: C.gold },
                    { label: "Shipped",    val: dm.shipment_metrics.shipped,     color: C.teal },
                  ].map(({ label, val, color }) => (
                    <Box key={label} mb={2.2}>
                      <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</Typography>
                        <Typography className="db-num" sx={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{val.toLocaleString()}</Typography>
                      </Stack>
                      <Bar value={val} max={dm.shipment_metrics.total} color={color} />
                    </Box>
                  ))}
                  <Box sx={{ mt: 2.5, p: 2, bgcolor: C.bg, borderRadius: 2.5, display: "flex", alignItems: "center", gap: 2, border: `1px solid ${C.border}` }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={15} color={C.teal} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg. Delivery</Typography>
                      <Typography className="db-num" sx={{ fontSize: 18, fontWeight: 700, color: C.teal }}>
                        {dm.shipment_metrics.average_delivery_time_days}
                        <Typography component="span" sx={{ fontSize: 12, color: C.muted, ml: 0.5 }}>days</Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Invoice Health */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="db-card db-fade" sx={{ p: 3, height: "100%", animationDelay: "0.48s" }}>
                  <Stack direction="row" alignItems="center" gap={1.2} mb={3}>
                    <IconBox Icon={FileText} color={C.gold} size={32} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Invoice Health</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={3} mb={3}>
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <DonutMini pct={dm.invoice_metrics.paid_count / (dm.invoice_metrics.total || 1)} color={C.pine} size={66} />
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography className="db-num" sx={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                          {Math.round((dm.invoice_metrics.paid_count / (dm.invoice_metrics.total || 1)) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>Paid Rate</Typography>
                      <Typography className="db-num" sx={{ fontSize: 22, fontWeight: 700, color: C.pine }}>
                        {dm.invoice_metrics.paid_count.toLocaleString()}
                        <Typography component="span" className="db-num" sx={{ fontSize: 13, color: C.muted, ml: 0.5 }}>
                          / {dm.invoice_metrics.total.toLocaleString()}
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>
                  {[
                    { label: "Total Revenue", val: `₹${(dm.invoice_metrics.total_amount / 100000).toFixed(1)}L`,          color: C.ink },
                    { label: "Outstanding",   val: `₹${(dm.invoice_metrics.outstanding_amount / 1000).toFixed(0)}K`,      color: C.gold },
                    { label: "Overdue",       val: dm.invoice_metrics.overdue_count,                                       color: C.rust },
                    { label: "Pending",       val: dm.invoice_metrics.pending_count,                                       color: C.azure },
                  ].map(({ label, val, color }) => (
                    <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1, borderTop: `1px solid ${C.border}` }}>
                      <Typography sx={{ fontSize: 12, color: C.muted }}>{label}</Typography>
                      <Typography className="db-num" sx={{ fontSize: 13, fontWeight: 700, color }}>{val}</Typography>
                    </Stack>
                  ))}
                </Box>
              </Grid>

              {/* Orders Overview */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className="db-card db-fade" sx={{ p: 3, height: "100%", animationDelay: "0.52s" }}>
                  <Stack direction="row" alignItems="center" gap={1.2} mb={3}>
                    <IconBox Icon={BarChart3} color={C.saffron} size={32} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Orders Overview</Typography>
                  </Stack>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      { label: "Sales",    total: dm.sales_order_metrics.total,    done: dm.sales_order_metrics.completed_count,    pending: dm.sales_order_metrics.pending_count,    amount: `₹${(dm.sales_order_metrics.total_amount/100000).toFixed(1)}L`,    color: C.azure },
                      { label: "Purchase", total: dm.purchase_order_metrics.total, done: dm.purchase_order_metrics.completed_count, pending: dm.purchase_order_metrics.pending_count, amount: `₹${(dm.purchase_order_metrics.total_amount/100000).toFixed(1)}L`, color: C.plum },
                    ].map(({ label, total, done, pending, amount, color }) => (
                      <Grid key={label} size={6}>
                        <Box sx={{ background: `${color}0A`, border: `1px solid ${color}20`, borderRadius: 3, p: 2 }}>
                          <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.8 }}>{label}</Typography>
                          <Typography className="db-num" sx={{ fontSize: 24, fontWeight: 700, color, mb: 1 }}>{total.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: 11, color: C.muted }}>✓ {done} done</Typography>
                          <Typography sx={{ fontSize: 11, color: C.muted, mb: 1 }}>⏳ {pending} pending</Typography>
                          <Typography className="db-num" sx={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{amount}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ p: 2, bgcolor: C.bg, borderRadius: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.border}` }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>Packages Delivered</Typography>
                      <Typography className="db-num" sx={{ fontSize: 20, fontWeight: 700, color: C.pine }}>{dm.package_metrics.delivered_count.toLocaleString()}</Typography>
                    </Box>
                    <span style={{ background: C.tealLt, color: C.teal, padding: "4px 11px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: BODY }}>
                      {dm.package_metrics.in_transit_count} in transit
                    </span>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Trend Tables */}
          {Object.entries(trendDataMap).map(([entity, trends]) => {
            if (!trends?.data?.length) return null;
            const col = ENTITY_COLORS[entity] ?? C.ink;
            return (
              <Box key={entity} sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
                  <Box sx={{ width: 3, height: 18, bgcolor: col, borderRadius: 99 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                    {entity.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} — 30-Day Trend
                  </Typography>
                </Stack>
                <Box className="db-card-flat" sx={{ overflow: "hidden" }}>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <TH align="left">Date</TH>
                          <TH align="center">Total</TH>
                          <TH align="center">Active</TH>
                          <TH align="center">Created Today</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.data.slice(0, 10).map((tr, idx) => (
                          <tr key={idx} className="db-tr" style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? C.surface : C.bg }}>
                            <td style={{ padding: "11px 16px", fontSize: 12, color: C.inkMid, fontFamily: MONO }}>{new Date(tr.date).toLocaleDateString("en-IN")}</td>
                            <td style={{ padding: "11px 16px", textAlign: "center" }}>
                              <span style={{ background: `${col}14`, color: col, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: MONO }}>{tr.count}</span>
                            </td>
                            <td style={{ padding: "11px 16px", textAlign: "center" }}>
                              <span style={{ background: C.pineLt, color: C.pine, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: MONO }}>{tr.active_count}</span>
                            </td>
                            <td style={{ padding: "11px 16px", textAlign: "center" }}>
                              <span style={{ background: C.goldLt, color: C.gold, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: MONO }}>{tr.created_today}</span>
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

      {/* ═══════════════════════════════════════════════════════════════
          INVENTORY TAB
          Source: GET /dashboard/stock
          Fields: purchased_stock · sold_stock · last_purchased_date · last_sold_date · status
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <>
          {dashStockLoading && <LoadingSpinner label="Loading inventory…" />}
          {dashStockError  && <ErrorState msg={dashStockError} />}

          {!dashStockLoading && !dashStockError && (
            <>
              {/* KPI strip from /dashboard/stock meta */}
              {dashStockMeta && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: "Total Products",  val: dashStockMeta.total_products,     color: C.azure,  icon: Package },
                    { label: "In Stock",        val: dashStockMeta.in_stock_count,     color: C.pine,   icon: CheckCircle },
                    { label: "Low Stock",       val: dashStockMeta.low_stock_count,    color: C.gold,   icon: Clock },
                    { label: "Out of Stock",    val: dashStockMeta.out_of_stock_count, color: C.rust,   icon: XCircle },
                    { label: "Total Quantity",  val: dashStockMeta.total_quantity,     color: C.plum,   icon: Layers },
                  ].map(({ label, val, color, icon: Icon }, i) => (
                    <Grid key={label} size={{ xs: 6, sm: 4, md: "auto" }}>
                      <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.06 * i}s` }}>
                        <IconBox Icon={Icon} color={color} size={36} />
                        <Typography className="db-num" sx={{ fontSize: 24, fontWeight: 700, color, mt: 1.5, mb: 0.3 }}>{val?.toLocaleString()}</Typography>
                        <Typography sx={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {dashStocks.length === 0 ? (
                <EmptyState msg="No inventory data" sub="No products returned from /dashboard/stock" />
              ) : (
                <>
                  <SectionHeading>Product Inventory — {dashStocks.length} items</SectionHeading>

                  {/* Table: uses DashboardStockItem field names */}
                  <Box className="db-card-flat db-fade" sx={{ mb: 3, overflow: "hidden", animationDelay: "0.22s" }}>
                    <Box sx={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                        <thead>
                          <tr>
                            <TH align="left">Product</TH>
                            <TH align="center">Current</TH>
                            <TH align="center">Available</TH>
                            <TH align="center">Reserved</TH>
                            {/* purchased_stock — NOT purchased_total */}
                            <TH align="center">Purchased</TH>
                            {/* sold_stock — NOT sold_total */}
                            <TH align="center">Sold</TH>
                            <TH align="center">Avg Cost</TH>
                            <TH align="center">Status</TH>
                            {/* last_purchased_date — NOT last_purchased */}
                            <TH align="center">Last Purchase</TH>
                            {/* last_sold_date — NOT last_sold */}
                            <TH align="center">Last Sale</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {dashStocks.map((item: DashboardStockItem, idx) => (
                            <tr key={`${item.product_id}-${idx}`} className="db-tr"
                              style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? C.surface : C.bg }}>
                              <td style={{ padding: "14px 16px" }}>
                                <Typography sx={{ fontWeight: 600, fontSize: 13, color: C.ink }}>{item.product_name}</Typography>
                                <Typography className="db-num" sx={{ fontSize: 10, color: C.subtle, mt: 0.2 }}>{item.product_id}</Typography>
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography className="db-num" sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{item.current_stock}</Typography>
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography className="db-num" sx={{ fontSize: 13, color: C.muted }}>{item.available_stock}</Typography>
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <span style={{ background: item.reserved_stock > 0 ? C.goldLt : C.bg, color: item.reserved_stock > 0 ? C.gold : C.subtle, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: MONO }}>
                                  {item.reserved_stock}
                                </span>
                              </td>
                              {/* purchased_stock from /dashboard/stock */}
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography className="db-num" sx={{ fontSize: 12, color: C.inkMid }}>{item.purchased_stock.toLocaleString()}</Typography>
                              </td>
                              {/* sold_stock from /dashboard/stock */}
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <span style={{ background: C.azureLt, color: C.azure, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: MONO }}>
                                  {item.sold_stock.toLocaleString()}
                                </span>
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography className="db-num" sx={{ fontSize: 13, fontWeight: 600, color: C.inkMid }}>₹{item.average_cost.toLocaleString()}</Typography>
                              </td>
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <StockChip status={item.status} />
                              </td>
                              {/* last_purchased_date from /dashboard/stock */}
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: 11, color: C.muted }}>
                                  {item.last_purchased_date
                                    ? new Date(item.last_purchased_date).toLocaleDateString("en-IN")
                                    : "—"}
                                </Typography>
                              </td>
                              {/* last_sold_date from /dashboard/stock */}
                              <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: 11, color: C.muted }}>
                                  {item.last_sold_date
                                    ? new Date(item.last_sold_date).toLocaleDateString("en-IN")
                                    : "—"}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Box>

                  {/* Card grid */}
                  <SectionHeading>Card View</SectionHeading>
                  <Grid container spacing={2}>
                    {dashStocks.map((item: DashboardStockItem, idx) => {
                      const sc = { in_stock: C.pine, low_stock: C.gold, out_of_stock: C.rust }[item.status];
                      const util = item.current_stock > 0
                        ? Math.round((item.reserved_stock / item.current_stock) * 100)
                        : 0;
                      return (
                        <Grid key={`${item.product_id}-card-${idx}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.035 * idx}s` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: C.ink, mb: 0.3 }}>{item.product_name}</Typography>
                                <Typography className="db-num" sx={{ fontSize: 10, color: C.subtle }}>{item.product_id}</Typography>
                              </Box>
                              <StockChip status={item.status} />
                            </Stack>
                            <hr className="db-rule" style={{ marginBottom: 14 }} />
                            <Grid container spacing={1} sx={{ mb: 1.5 }}>
                              {[
                                { label: "Current",    val: item.current_stock,    color: C.azure },
                                { label: "Available",  val: item.available_stock,  color: C.pine },
                                // purchased_stock from /dashboard/stock
                                { label: "Purchased",  val: item.purchased_stock,  color: C.teal },
                                // sold_stock from /dashboard/stock
                                { label: "Sold",       val: item.sold_stock,       color: C.rust },
                              ].map(({ label, val, color }) => (
                                <Grid key={label} size={6}>
                                  <Box sx={{ bgcolor: C.bg, borderRadius: 2, p: 1.2 }}>
                                    <Typography sx={{ fontSize: 9, color: C.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
                                    <Typography className="db-num" sx={{ fontSize: 18, fontWeight: 700, color }}>{val.toLocaleString()}</Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                              <Typography sx={{ fontSize: 10, color: C.muted }}>Reserved utilization</Typography>
                              <Typography className="db-num" sx={{ fontSize: 10, fontWeight: 700, color: sc }}>{util}%</Typography>
                            </Stack>
                            <Bar value={item.reserved_stock} max={item.current_stock} color={sc} />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
                              <Typography sx={{ fontSize: 10, color: C.subtle }}>
                                {/* last_purchased_date from /dashboard/stock */}
                                📦 {item.last_purchased_date ? new Date(item.last_purchased_date).toLocaleDateString("en-IN") : "—"}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: C.subtle }}>
                                {/* last_sold_date from /dashboard/stock */}
                                🛒 {item.last_sold_date ? new Date(item.last_sold_date).toLocaleDateString("en-IN") : "No sales"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ACTIVITY TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "activity" && (
        <>
          {activitySummary && (
            <>
              <SectionHeading>Today's Activity</SectionHeading>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: "Customers",       val: activitySummary.created_customers_today,       color: C.azure,   icon: Users },
                  { label: "Vendors",         val: activitySummary.created_vendors_today,         color: C.plum,    icon: ShoppingCart },
                  { label: "Items",           val: activitySummary.created_items_today,           color: C.teal,    icon: Package },
                  { label: "Sales Orders",    val: activitySummary.created_sales_orders_today,   color: C.pine,    icon: BarChart3 },
                  { label: "Purchase Orders", val: activitySummary.created_purchase_orders_today, color: C.gold,    icon: FileText },
                  { label: "Shipped",         val: activitySummary.shipped_today,                color: C.rust,    icon: Truck },
                  { label: "Delivered",       val: activitySummary.delivered_today,              color: C.saffron, icon: CheckCircle },
                ].map(({ label, val, color, icon: Icon }, i) => (
                  <Grid key={label} size={{ xs: 6, sm: 4, md: 3, lg: "auto" }}>
                    <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.05 * i}s` }}>
                      <IconBox Icon={Icon} color={color} size={36} />
                      <Typography className="db-num" sx={{ fontSize: 28, fontWeight: 700, color, mt: 1.5, mb: 0.3 }}>{val}</Typography>
                      <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {dm && (
            <>
              <SectionHeading>Business Metrics Deep Dive</SectionHeading>
              <Grid container spacing={2.5}>
                {[
                  { title: "Customers", icon: Users,        color: C.azure,
                    rows: [["Total", dm.customer_metrics.total], ["Active", dm.customer_metrics.active], ["Inactive", dm.customer_metrics.inactive], ["New Today", dm.customer_metrics.created_today]] },
                  { title: "Packages",  icon: Layers,       color: C.teal,
                    rows: [["Total", dm.package_metrics.total], ["Delivered", dm.package_metrics.delivered_count], ["In Transit", dm.package_metrics.in_transit_count], ["Pending", dm.package_metrics.pending_count]] },
                  { title: "Items",     icon: Package,      color: C.plum,
                    rows: [["Total Items", dm.item_metrics.total], ["Total Stock", dm.item_metrics.total_stock], ["Low Stock", dm.item_metrics.low_stock_items], ["Out of Stock", dm.item_metrics.out_of_stock_items]] },
                  { title: "Vendors",   icon: ShoppingCart, color: C.gold,
                    rows: [["Total", dm.vendor_metrics.total], ["Active", dm.vendor_metrics.active], ["Inactive", dm.vendor_metrics.inactive], ["New Today", dm.vendor_metrics.created_today]] },
                ].map(({ title, icon: Icon, color, rows }, i) => (
                  <Grid key={title} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.07 * i}s` }}>
                      <Stack direction="row" alignItems="center" gap={1.2} mb={2.5}>
                        <IconBox Icon={Icon} color={color} size={32} />
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{title}</Typography>
                      </Stack>
                      {rows.map(([label, val]) => (
                        <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1.1, borderTop: `1px solid ${C.border}` }}>
                          <Typography sx={{ fontSize: 12, color: C.muted }}>{label}</Typography>
                          <Typography className="db-num" sx={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{(val as number)?.toLocaleString()}</Typography>
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

      {/* ═══════════════════════════════════════════════════════════════
          STOCK TAB
          Source: GET /api/stock/summary
          Fields: purchased_total · sold_total · last_purchased · last_sold
                  sku · variant_name · type · stock_value
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "stock" && (
        <>
          {summaryLoading && <LoadingSpinner label="Loading stock summary…" />}
          {summaryError   && <ErrorState msg={summaryError} />}

          {!summaryLoading && !summaryError && (
            <>
              {/* Totals from /api/stock/summary response */}
              {summaryMeta && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: "Total Stock Value",      val: summaryMeta.total_stock_value,        color: C.saffron, icon: DollarSign, fmt: (v: number) => `₹${(v/100000).toFixed(1)}L` },
                    { label: "Total Sold Value",       val: summaryMeta.total_sold_product_value, color: C.rust,    icon: BarChart3,  fmt: (v: number) => `₹${(v/100000).toFixed(1)}L` },
                    { label: "Total Current Stock",    val: summaryStocks.reduce((s, x) => s + x.current_stock, 0),  color: C.pine,  icon: Package,      fmt: (v: number) => v.toLocaleString() },
                    { label: "Total Available Stock",  val: summaryStocks.reduce((s, x) => s + x.available_stock, 0), color: C.teal, icon: CheckCircle,  fmt: (v: number) => v.toLocaleString() },
                    { label: "Variants",               val: summaryStocks.length,                 color: C.plum,    icon: Layers,    fmt: (v: number) => v.toLocaleString() },
                  ].map(({ label, val, color, icon: Icon, fmt }, i) => (
                    <Grid key={label} size={{ xs: 6, sm: 4, lg: "auto" }}>
                      <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.05 * i}s` }}>
                        <IconBox Icon={Icon} color={color} size={36} />
                        <Typography className="db-num" sx={{ fontSize: 20, fontWeight: 700, color, mt: 1.5, mb: 0.3 }}>{fmt(val)}</Typography>
                        <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {summaryStocks.length === 0 ? (
                <EmptyState msg="No stock data" sub="No variants returned from /api/stock/summary" />
              ) : (
                <>
                  <SectionHeading>Variant-Level Stock — {summaryStocks.length} variants</SectionHeading>

                  {/* Table: uses StockSummaryItem field names */}
                  <Box className="db-card-flat db-fade" sx={{ mb: 3, overflowX: "auto", animationDelay: "0.18s" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr>
                          <TH align="left">Product / Variant</TH>
                          <TH align="center">SKU</TH>
                          <TH align="center">Type</TH>
                          <TH align="center">Current</TH>
                          <TH align="center">Available</TH>
                          <TH align="center">Reserved</TH>
                          {/* purchased_total — NOT purchased_stock */}
                          <TH align="center">Purchased Total</TH>
                          {/* sold_total — NOT sold_stock */}
                          <TH align="center">Sold Total</TH>
                          <TH align="center">Avg Cost</TH>
                          <TH align="center">Stock Value</TH>
                          {/* last_purchased — NOT last_purchased_date */}
                          <TH align="center">Last Purchased</TH>
                          {/* last_sold — NOT last_sold_date */}
                          <TH align="center">Last Sold</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryStocks.map((stock: StockSummaryItem, idx) => (
                          <tr key={`${stock.product_id}-${stock.sku}-${idx}`} className="db-tr"
                            style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? C.surface : C.bg }}>
                            <td style={{ padding: "13px 16px" }}>
                              <Typography sx={{ fontWeight: 600, fontSize: 13, color: C.ink }}>{stock.product_name}</Typography>
                              <Typography className="db-num" sx={{ fontSize: 10, color: C.subtle, mt: 0.2 }}>
                                {stock.variant_name} · {stock.product_id}
                              </Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 11, color: C.muted }}>{stock.sku}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <span style={{ background: C.plumLt, color: C.plum, padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                                {stock.type}
                              </span>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontWeight: 700, fontSize: 13, color: C.azure }}>{stock.current_stock}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 12, color: C.inkMid }}>{stock.available_stock}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 12, color: stock.reserved_stock > 0 ? C.gold : C.subtle }}>{stock.reserved_stock}</Typography>
                            </td>
                            {/* purchased_total from /api/stock/summary */}
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 12, color: C.inkMid }}>{stock.purchased_total.toLocaleString()}</Typography>
                            </td>
                            {/* sold_total from /api/stock/summary */}
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 12, fontWeight: 600, color: C.rust }}>{stock.sold_total.toLocaleString()}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 12, color: C.muted }}>₹{stock.average_cost.toLocaleString()}</Typography>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography className="db-num" sx={{ fontSize: 13, fontWeight: 700, color: C.ink }}>₹{stock.stock_value.toLocaleString("en-IN")}</Typography>
                            </td>
                            {/* last_purchased from /api/stock/summary */}
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography sx={{ fontSize: 11, color: C.muted }}>
                                {stock.last_purchased
                                  ? new Date(stock.last_purchased).toLocaleDateString("en-IN")
                                  : "—"}
                              </Typography>
                            </td>
                            {/* last_sold from /api/stock/summary */}
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <Typography sx={{ fontSize: 11, color: C.muted }}>
                                {stock.last_sold
                                  ? new Date(stock.last_sold).toLocaleDateString("en-IN")
                                  : "—"}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>

                  {/* Variant Cards */}
                  <SectionHeading>Stock by Variant</SectionHeading>
                  <Grid container spacing={2}>
                    {summaryStocks.map((stock: StockSummaryItem, idx) => {
                      // availability % based on purchased_total vs available
                      const pct = stock.purchased_total > 0
                        ? (stock.available_stock / stock.purchased_total) * 100
                        : 0;
                      const col = pct === 0 ? C.rust : pct < 20 ? C.gold : pct < 50 ? C.gold : C.pine;
                      const lbl = pct === 0 ? "Out" : pct < 20 ? "Low" : pct < 50 ? "Medium" : "Good";

                      return (
                        <Grid key={`${stock.product_id}-${stock.sku}`} size={{ xs: 12, sm: 6, lg: 3 }}>
                          <Box className="db-card db-fade" sx={{ p: 2.5, animationDelay: `${0.035 * idx}s` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 12, color: C.ink, mb: 0.2 }}>{stock.product_name}</Typography>
                                <Typography className="db-num" sx={{ fontSize: 10, color: C.subtle }}>{stock.sku}</Typography>
                              </Box>
                              <Stack alignItems="flex-end" gap={0.5}>
                                <span style={{ background: `${col}18`, color: col, padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{lbl}</span>
                                <span style={{ background: C.plumLt, color: C.plum, padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700 }}>{stock.type}</span>
                              </Stack>
                            </Stack>
                            <hr className="db-rule" style={{ marginBottom: 14 }} />

                            <Grid container spacing={1} sx={{ mb: 1.5 }}>
                              {[
                                { label: "Current",    val: stock.current_stock,    color: C.azure },
                                { label: "Available",  val: stock.available_stock,  color: C.pine },
                                // purchased_total from /api/stock/summary
                                { label: "Purchased",  val: stock.purchased_total,  color: C.teal },
                                // sold_total from /api/stock/summary
                                { label: "Sold",       val: stock.sold_total,       color: C.rust },
                              ].map(({ label, val, color }) => (
                                <Grid key={label} size={6}>
                                  <Box sx={{ bgcolor: C.bg, borderRadius: 2, p: 1, textAlign: "center" }}>
                                    <Typography sx={{ fontSize: 9, color: C.subtle, fontWeight: 700, mb: 0.2 }}>{label}</Typography>
                                    <Typography className="db-num" sx={{ fontSize: 15, fontWeight: 700, color }}>{val.toLocaleString()}</Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>

                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                              <Typography sx={{ fontSize: 10, color: C.muted }}>Stock Value</Typography>
                              <Typography className="db-num" sx={{ fontSize: 11, fontWeight: 700, color: C.ink }}>
                                ₹{stock.stock_value.toLocaleString("en-IN")}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                              <Typography sx={{ fontSize: 10, color: C.muted }}>Avg Cost</Typography>
                              <Typography className="db-num" sx={{ fontSize: 11, color: C.inkMid }}>₹{stock.average_cost.toLocaleString()}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                              <Typography sx={{ fontSize: 10, color: C.muted }}>Availability</Typography>
                              <Typography className="db-num" sx={{ fontSize: 10, fontWeight: 700, color: col }}>{pct.toFixed(0)}%</Typography>
                            </Stack>

                            <Box sx={{ height: 5, bgcolor: C.border, borderRadius: 99, overflow: "hidden", mb: 1.5 }}>
                              <Box sx={{ width: `${Math.min(pct, 100)}%`, height: "100%", bgcolor: col, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
                            </Box>

                            <Typography sx={{ fontSize: 9, color: C.subtle, lineHeight: 1.6 }}>
                              {/* last_purchased from /api/stock/summary */}
                              📦 {stock.last_purchased ? new Date(stock.last_purchased).toLocaleDateString("en-IN") : "—"}
                              {" · "}
                              {/* last_sold from /api/stock/summary */}
                              🛒 {stock.last_sold ? new Date(stock.last_sold).toLocaleDateString("en-IN") : "Never sold"}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Typography sx={{ fontSize: 11, color: C.subtle }}>
          Last refreshed · {new Date().toLocaleTimeString("en-IN")}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.subtle }}>
          Business Intelligence Dashboard
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;