"use client";

import {
  Box, Typography, TextField, Button, Stack, FormControl,
  Select, MenuItem, Switch, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, CircularProgress, Alert,
  Chip, Tooltip, LinearProgress,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import {
  Trash2, Plus, Save, Package, ShoppingCart, Truck,
  Archive, RotateCcw, Tag, Layers, Info, ChevronRight,
  CheckCircle2, AlertCircle, BarChart3, Hash, FileText,
} from "lucide-react";
import { Item, ItemType, ItemStructure } from "@/models/item.model";
import { Vendor } from "@/models/vendor.model";
import { vendorService } from "@/services/vendorService";

interface ItemFormProps { item?: Item; onSave?: (data: any) => Promise<void>; loading?: boolean; }
interface AttributeDefinition { key: string; options: string[]; }
interface Variant { sku: string; attribute_map: Record<string, string>; selling_price: number; cost_price: number; stock_quantity: number; }

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  // Surfaces
  canvas:   "#F4F3F0",
  sidebar:  "#1C1C1E",
  card:     "#FFFFFF",
  cardHov:  "#FAFAF9",
  inset:    "#F8F7F4",

  // Borders
  line:     "#E6E4DF",
  line2:    "#D0CEC8",

  // Text
  ink:      "#18181A",
  sub:      "#5C5B57",
  muted:    "#9E9C96",
  ghost:    "#C8C6BE",

  // Accent
  violet:   "#5B4FF5",
  violetL:  "#EEF0FF",
  violetD:  "#3D34D4",

  // Status
  emerald:  "#059669",
  emeraldL: "#ECFDF5",
  amber:    "#D97706",
  amberL:   "#FFFBEB",
  rose:     "#E11D48",
  roseL:    "#FFF1F2",
  sky:      "#0284C7",
  skyL:     "#F0F9FF",
  orange:   "#EA580C",
  orangeL:  "#FFF7ED",
  purple:   "#7C3AED",
  purpleL:  "#F5F3FF",
  teal:     "#0D9488",
  tealL:    "#F0FDFA",
};

const FONT_SANS = "'Geist', 'DM Sans', system-ui, sans-serif";
const FONT_MONO = "'Geist Mono', 'JetBrains Mono', monospace";

const NAV_ITEMS = [
  { id: "basic",     label: "Basic Info",   icon: Package,    accent: C.violet  },
  { id: "attributes",label: "Attributes",   icon: Tag,        accent: C.orange  },
  { id: "variants",  label: "Variants",     icon: Layers,     accent: C.emerald },
  { id: "sales",     label: "Sales",        icon: ShoppingCart, accent: C.purple },
  { id: "purchase",  label: "Purchase",     icon: Truck,      accent: C.rose    },
  { id: "inventory", label: "Inventory",    icon: Archive,    accent: C.sky     },
  { id: "returns",   label: "Returns",      icon: RotateCcw,  accent: C.amber   },
];

// ─── Tiny helpers ────────────────────────────────────────────────────────────
const inp = (accent = C.violet) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: C.inset,
    fontFamily: FONT_SANS,
    fontSize: "0.875rem",
    color: C.ink,
    transition: "background 0.15s, box-shadow 0.15s",
    "& fieldset": { borderColor: C.line, borderWidth: "1.5px", transition: "border-color 0.15s" },
    "&:hover": { backgroundColor: "#F3F2EE" },
    "&:hover fieldset": { borderColor: C.line2 },
    "&.Mui-focused": { backgroundColor: "#fff", boxShadow: `0 0 0 3px ${accent}22` },
    "&.Mui-focused fieldset": { borderColor: accent, borderWidth: "1.5px" },
    "& input::placeholder, & textarea::placeholder": { color: C.ghost, opacity: 1 },
  },
  "& .MuiSelect-root": { fontFamily: FONT_SANS },
});

const mono = { "& input, & textarea": { fontFamily: FONT_MONO, fontSize: "0.82rem", letterSpacing: "0.03em" } };
const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
const g3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" };
const g4 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" };

function Lbl({ children, hint, required }: { children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: C.sub, fontFamily: FONT_SANS, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {children}{required && <span style={{ color: C.rose, marginLeft: 2 }}>*</span>}
      </Typography>
      {hint && <Tooltip title={hint} placement="top" arrow>
        <Info size={10} color={C.ghost} style={{ cursor: "help" }} />
      </Tooltip>}
    </Box>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <Box id={id} sx={{ scrollMarginTop: "72px" }} />;
}

function SectionHeading({ icon: Icon, title, subtitle, accent, badge }: {
  icon: any; title: string; subtitle?: string; accent: string; badge?: number;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3.5 }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: "11px", flexShrink: 0, mt: "1px",
        background: `linear-gradient(135deg, ${accent}20 0%, ${accent}10 100%)`,
        border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 1px 4px ${accent}18`,
      }}>
        <Icon size={16} color={accent} strokeWidth={2.2} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: C.ink, fontFamily: FONT_SANS, letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {badge !== undefined && badge > 0 && (
            <Box sx={{ px: 1, height: 20, borderRadius: "10px", bgcolor: accent, display: "flex", alignItems: "center" }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff", fontFamily: FONT_SANS }}>{badge}</Typography>
            </Box>
          )}
        </Box>
        {subtitle && <Typography sx={{ fontSize: "0.78rem", color: C.muted, mt: 0.4, fontFamily: FONT_SANS }}>{subtitle}</Typography>}
      </Box>
    </Box>
  );
}

function Card({ children, sx = {} }: { children: React.ReactNode; sx?: any }) {
  return (
    <Box sx={{
      bgcolor: C.card,
      borderRadius: "14px",
      border: `1.5px solid ${C.line}`,
      p: "28px 32px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
      mb: 3,
      ...sx,
    }}>
      {children}
    </Box>
  );
}

function ToggleCard({ label, desc, checked, onChange, disabled, accent = C.violet }: {
  label: string; desc: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean; accent?: string;
}) {
  return (
    <Box onClick={() => !disabled && onChange(!checked)} sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      p: "16px 20px", borderRadius: "10px",
      border: `1.5px solid ${checked ? accent + "40" : C.line}`,
      bgcolor: checked ? accent + "08" : C.inset,
      cursor: disabled ? "default" : "pointer",
      transition: "all 0.18s",
      userSelect: "none",
      "&:hover": !disabled ? { border: `1.5px solid ${accent}55`, bgcolor: accent + "0C" } : {},
    }}>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        {checked
          ? <CheckCircle2 size={18} color={accent} />
          : <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.line2}`, bgcolor: C.inset }} />
        }
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: checked ? C.ink : C.sub, fontFamily: FONT_SANS }}>{label}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: C.muted, fontFamily: FONT_SANS, mt: 0.2 }}>{desc}</Typography>
        </Box>
      </Box>
      <Switch size="small" checked={checked} onChange={e => { e.stopPropagation(); onChange(e.target.checked); }} disabled={disabled}
        onClick={e => e.stopPropagation()}
        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: accent }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: accent } }} />
    </Box>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Box sx={{ p: "12px 16px", borderRadius: "10px", bgcolor: color + "0D", border: `1px solid ${color}22`, flex: 1 }}>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_SANS }}>{label}</Typography>
      <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: C.ink, fontFamily: FONT_MONO, mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function ItemForm({ item, onSave, loading = false }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    type: (item?.type || "goods") as ItemType,
    item_details: {
      structure: (item?.item_details?.structure || "single") as ItemStructure,
      unit: item?.item_details?.unit || "piece",
      sku: item?.item_details?.sku || "",
      upc: item?.item_details?.upc || "",
      ean: item?.item_details?.ean || "",
      description: item?.item_details?.description || "",
      attribute_definitions: item?.item_details?.attribute_definitions || [],
      variants: item?.item_details?.variants || [],
    },
    sales_info: { account: item?.sales_info?.account || "", selling_price: item?.sales_info?.selling_price || 0, currency: item?.sales_info?.currency || "INR", description: item?.sales_info?.description || "" },
    purchase_info: { account: item?.purchase_info?.account || "", cost_price: item?.purchase_info?.cost_price || 0, currency: item?.purchase_info?.currency || "INR", preferred_vendor_id: item?.purchase_info?.preferred_vendor_id || null, description: item?.purchase_info?.description || "" },
    inventory: { track_inventory: item?.inventory?.track_inventory ?? true, inventory_account: item?.inventory?.inventory_account || "", inventory_valuation_method: item?.inventory?.inventory_valuation_method || "FIFO", reorder_point: item?.inventory?.reorder_point || 0 },
    return_policy: { returnable: item?.return_policy?.returnable ?? true },
  });

  const [attributes, setAttributes] = useState<AttributeDefinition[]>(formData.item_details.attribute_definitions);
  const [variants, setVariants]     = useState<Variant[]>(formData.item_details.variants);
  const [variantForm, setVariantForm] = useState<Partial<Variant>>({});
  const [attrForm, setAttrForm]     = useState({ key: "", options: "" });
  const [editIdx, setEditIdx]       = useState<number | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [vendors, setVendors]       = useState<Vendor[]>([]);
  const [loadingV, setLoadingV]     = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const set = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split(".");
      const obj = { ...prev } as any;
      let cur = obj;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  useEffect(() => { fetchVendors(); }, []);
  useEffect(() => { if (formData.item_details.structure === "single") { setAttributes([]); setVariants([]); } }, [formData.item_details.structure]);

  const fetchVendors = async () => {
    try { setLoadingV(true); const r = await vendorService.getVendors(1, 100); setVendors(r.data || []); }
    catch { setVendors([]); } finally { setLoadingV(false); }
  };

  const handleAddAttribute = () => {
    if (!attrForm.key.trim()) { setError("Attribute name is required"); return; }
    if (!attrForm.options.trim()) { setError("Options are required"); return; }
    setAttributes([...attributes, { key: attrForm.key, options: attrForm.options.split(",").map(o => o.trim()).filter(Boolean) }]);
    setAttrForm({ key: "", options: "" }); setError(null);
  };

  const handleAddVariant = () => {
    if (!variantForm.sku?.trim())                                         { setError("Variant SKU is required"); return; }
    if (!variantForm.selling_price || variantForm.selling_price <= 0)    { setError("Valid selling price is required"); return; }
    if (!variantForm.cost_price || variantForm.cost_price <= 0)          { setError("Valid cost price is required"); return; }
    if (variantForm.stock_quantity === undefined || variantForm.stock_quantity < 0) { setError("Valid stock quantity is required"); return; }
    for (const a of attributes) { if (!variantForm.attribute_map?.[a.key]) { setError(`${a.key} is required`); return; } }
    if (editIdx !== null) {
      const u = [...variants]; u[editIdx] = variantForm as Variant; setVariants(u); setEditIdx(null);
    } else { setVariants([...variants, variantForm as Variant]); }
    setVariantForm({}); setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (!formData.name.trim())            { setError("Item name is required"); return; }
      if (!formData.item_details.sku.trim()) { setError("Item SKU is required"); return; }
      if (formData.item_details.structure === "variants") {
        if (attributes.length === 0) { setError("At least one attribute required"); return; }
        if (variants.length === 0)   { setError("At least one variant required"); return; }
        for (const v of variants) for (const a of attributes) {
          if (!v.attribute_map?.[a.key]) { setError(`Variant ${v.sku} missing: ${a.key}`); return; }
        }
      }
      const payload = { ...formData, item_details: { ...formData.item_details, ...(formData.item_details.structure === "variants" ? { attribute_definitions: attributes, variants: variants.map(v => ({ sku: v.sku, attribute_map: v.attribute_map || {}, selling_price: v.selling_price, cost_price: v.cost_price, stock_quantity: v.stock_quantity })) } : { attribute_definitions: [], variants: undefined }) } };
      await onSave?.(payload);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save item"); }
  };

  const isVariant = formData.item_details.structure === "variants";

  const visibleNav = NAV_ITEMS.filter(n => {
    if (n.id === "attributes" || n.id === "variants") return isVariant;
    return true;
  });

  const selSx = (accent = C.violet) => ({
    borderRadius: "10px", bgcolor: C.inset, fontFamily: FONT_SANS, fontSize: "0.875rem",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.line, borderWidth: "1.5px" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.line2 },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accent, borderWidth: "1.5px" },
  });
  const miSx = { fontFamily: FONT_SANS, fontSize: "0.875rem" };

  const SmallAddBtn = ({ onClick, label, accent = C.violet }: { onClick: () => void; label: string; accent?: string }) => (
    <Button size="small" onClick={onClick} disabled={loading} startIcon={<Plus size={13} strokeWidth={2.5} />}
      sx={{ textTransform: "none", fontFamily: FONT_SANS, fontWeight: 600, fontSize: "0.78rem", color: accent, bgcolor: accent + "10", border: `1.5px solid ${accent}30`, borderRadius: "8px", px: 2, py: 0.75, "&:hover": { bgcolor: accent + "1A", border: `1.5px solid ${accent}55` }, transition: "all 0.15s" }}>
      {label}
    </Button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
        :root { --font: 'DM Sans', system-ui, sans-serif; --mono: 'DM Mono', monospace; }
        * { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0CEC8; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #B8B6AF; }
      `}</style>

      {/* ── Full-screen shell ── */}
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: C.canvas, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {loading && <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: "2px", "& .MuiLinearProgress-bar": { bgcolor: C.violet } }} />}

        {/* ── TOP BAR ── */}
        <Box sx={{
          position: "sticky", top: 0, zIndex: 100,
          height: 56, display: "flex", alignItems: "center",
          px: 3, gap: 2,
          bgcolor: "rgba(244,243,240,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.line}`,
        }}>
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <Typography sx={{ fontSize: "0.8rem", color: C.muted, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", "&:hover": { color: C.sub } }}>Inventory</Typography>
            <ChevronRight size={13} color={C.ghost} />
            <Typography sx={{ fontSize: "0.8rem", color: C.muted, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", "&:hover": { color: C.sub } }}>Items</Typography>
            <ChevronRight size={13} color={C.ghost} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>
              {item ? formData.name || "Edit Item" : "New Item"}
            </Typography>
          </Box>

          {/* Top-bar actions */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.75, borderRadius: "8px", bgcolor: C.inset, border: `1px solid ${C.line}` }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: item ? C.amber : C.muted }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: C.sub, fontFamily: "'DM Sans', sans-serif" }}>
                {item ? "Editing" : "Draft"}
              </Typography>
            </Box>
            <Button size="small" sx={{ textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.82rem", color: C.sub, px: 2, borderRadius: "8px", "&:hover": { bgcolor: C.line } }}>
              Discard
            </Button>
            <Button variant="contained" size="small" onClick={handleSave} disabled={loading}
              startIcon={loading ? <CircularProgress size={13} sx={{ color: "rgba(255,255,255,0.7)" }} /> : <Save size={13} strokeWidth={2.5} />}
              sx={{ textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", px: 2.5, borderRadius: "8px", bgcolor: C.violet, boxShadow: `0 2px 8px ${C.violet}40`, "&:hover": { bgcolor: C.violetD, boxShadow: `0 4px 12px ${C.violet}50` }, "&:disabled": { bgcolor: C.line, color: C.muted, boxShadow: "none" }, transition: "all 0.15s" }}>
              {loading ? "Saving…" : "Save Item"}
            </Button>
          </Box>
        </Box>

        {/* ── BODY: sidebar + content ── */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT SIDEBAR ── */}
          <Box sx={{
            width: 240, flexShrink: 0,
            bgcolor: C.sidebar,
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            position: "sticky", top: 56, height: "calc(100vh - 56px)",
            overflowY: "auto",
          }}>
            {/* Item identity block */}
            <Box sx={{ px: 3, pt: 4, pb: 3 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: "14px", mb: 2,
                background: `linear-gradient(135deg, ${C.violet}88 0%, ${C.purple}88 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid rgba(255,255,255,0.12)`,
              }}>
                <Package size={22} color="#fff" strokeWidth={1.8} />
              </Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.3, mb: 0.5 }}>
                {formData.name || (item ? "Edit Item" : "New Item")}
              </Typography>
              {formData.item_details.sku && (
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
                  {formData.item_details.sku}
                </Typography>
              )}
            </Box>

            {/* Quick stats */}
            <Box sx={{ px: 2, pb: 3, display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[
                { icon: BarChart3, label: "Type",      value: formData.type === "goods" ? "Goods" : "Service" },
                { icon: Layers,    label: "Structure",  value: isVariant ? `Variants (${variants.length})` : "Single" },
                { icon: Hash,      label: "Attributes", value: isVariant ? attributes.length : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, borderRadius: "8px" }}>
                  <Icon size={13} color="rgba(255,255,255,0.3)" />
                  <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mx: 3, borderTop: "1px solid rgba(255,255,255,0.07)", mb: 2 }} />

            {/* Nav */}
            <Box sx={{ px: 2, pb: 4, flex: 1 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", px: 2, mb: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                Sections
              </Typography>
              <Stack spacing={0.25}>
                {visibleNav.map(({ id, label, icon: Icon, accent }) => {
                  const active = activeSection === id;
                  return (
                    <Box key={id} onClick={() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setActiveSection(id); }}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.1, borderRadius: "8px", cursor: "pointer", transition: "all 0.12s",
                        bgcolor: active ? "rgba(255,255,255,0.1)" : "transparent",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                      }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: active ? accent + "33" : "rgba(255,255,255,0.07)", transition: "all 0.12s" }}>
                        <Icon size={12} color={active ? accent : "rgba(255,255,255,0.4)"} strokeWidth={2.2} />
                      </Box>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s" }}>
                        {label}
                      </Typography>
                      {active && <Box sx={{ ml: "auto", width: 5, height: 5, borderRadius: "50%", bgcolor: accent }} />}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>

          {/* ── MAIN SCROLL AREA ── */}
          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 4, xl: 6 }, py: 4 }}>

            {error && (
              <Alert severity="error" icon={<AlertCircle size={16} />} onClose={() => setError(null)}
                sx={{ mb: 3, borderRadius: "10px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", border: `1.5px solid ${C.rose}30`, bgcolor: C.roseL }}>
                {error}
              </Alert>
            )}

            {/* ══════════ BASIC INFO ══════════ */}
            <SectionAnchor id="basic" />
            <Card>
              <SectionHeading icon={Package} title="Basic Information" subtitle="Name, type, identifiers and product description" accent={C.violet} />

              {/* Hero name field */}
              <Box sx={{ mb: 3 }}>
                <Lbl required>Item Name</Lbl>
                <TextField fullWidth placeholder="e.g., Premium Stainless Water Bottle 1L" value={formData.name}
                  onChange={e => set("name", e.target.value)} disabled={loading}
                  sx={{ ...inp(C.violet), "& .MuiOutlinedInput-root": { ...inp(C.violet)["& .MuiOutlinedInput-root"], fontSize: "1.05rem", fontWeight: 600 } }} />
              </Box>

              <Box sx={g4}>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Lbl>Item Type</Lbl>
                  <FormControl fullWidth disabled={loading}>
                    <Select value={formData.type} onChange={e => set("type", e.target.value)} sx={selSx()}>
                      <MenuItem value="goods" sx={miSx}>📦  Goods</MenuItem>
                      <MenuItem value="service" sx={miSx}>⚡  Service</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Lbl>Structure</Lbl>
                  <FormControl fullWidth disabled={loading}>
                    <Select value={formData.item_details.structure} onChange={e => set("item_details.structure", e.target.value)} sx={selSx()}>
                      <MenuItem value="single" sx={miSx}>⬡  Single item</MenuItem>
                      <MenuItem value="variants" sx={miSx}>⬡⬡  Has variants</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ ...g4, mt: 2.5 }}>
                <Box>
                  <Lbl hint="e.g., piece, kg, litre">Unit</Lbl>
                  <TextField fullWidth value={formData.item_details.unit} onChange={e => set("item_details.unit", e.target.value)} disabled={loading} placeholder="piece" sx={inp()} />
                </Box>
                <Box>
                  <Lbl hint="Stock Keeping Unit" required>SKU</Lbl>
                  <TextField fullWidth value={formData.item_details.sku} onChange={e => set("item_details.sku", e.target.value)} disabled={loading} placeholder="SKU-001" sx={{ ...inp(), ...mono }} />
                </Box>
                <Box>
                  <Lbl>UPC</Lbl>
                  <TextField fullWidth value={formData.item_details.upc} onChange={e => set("item_details.upc", e.target.value)} disabled={loading} placeholder="012345678901" sx={{ ...inp(), ...mono }} />
                </Box>
                <Box>
                  <Lbl>EAN</Lbl>
                  <TextField fullWidth value={formData.item_details.ean} onChange={e => set("item_details.ean", e.target.value)} disabled={loading} placeholder="1234567890123" sx={{ ...inp(), ...mono }} />
                </Box>
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <Lbl>Description</Lbl>
                <TextField fullWidth multiline rows={3} value={formData.item_details.description} onChange={e => set("item_details.description", e.target.value)} disabled={loading} placeholder="Describe your item for internal and customer-facing use…" sx={inp()} />
              </Box>
            </Card>

            {/* ══════════ ATTRIBUTES ══════════ */}
            {isVariant && (<>
              <SectionAnchor id="attributes" />
              <Card>
                <SectionHeading icon={Tag} title="Variant Attributes" subtitle="Define the product dimensions that drive variant creation" accent={C.orange} badge={attributes.length} />

                {/* Existing attributes */}
                {attributes.length > 0 && (
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {attributes.map((attr, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: "10px 16px", borderRadius: "10px", border: `1.5px solid ${C.line}`, bgcolor: C.inset, transition: "border-color 0.15s", "&:hover": { borderColor: C.line2 } }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: C.orange + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Tag size={12} color={C.orange} />
                        </Box>
                        <Typography sx={{ fontSize: "0.83rem", fontWeight: 700, color: C.ink, fontFamily: "'DM Sans', sans-serif", minWidth: 90 }}>{attr.key}</Typography>
                        <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {attr.options.map(o => (
                            <Box key={o} sx={{ px: 1.25, height: 22, borderRadius: "6px", bgcolor: C.card, border: `1px solid ${C.line}`, display: "flex", alignItems: "center" }}>
                              <Typography sx={{ fontSize: "0.73rem", color: C.sub, fontFamily: "'DM Sans', sans-serif" }}>{o}</Typography>
                            </Box>
                          ))}
                        </Box>
                        <IconButton size="small" onClick={() => setAttributes(attributes.filter((_, j) => j !== i))}
                          sx={{ color: C.muted, "&:hover": { color: C.rose, bgcolor: C.roseL }, borderRadius: "7px", width: 30, height: 30 }}>
                          <Trash2 size={13} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}

                {/* Add attribute row */}
                <Box sx={{ p: "18px 20px", borderRadius: "10px", border: `1.5px dashed ${C.orange}44`, bgcolor: C.orangeL + "66" }}>
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2, fontFamily: "'DM Sans', sans-serif" }}>Add attribute</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 2, alignItems: "flex-end" }}>
                    <Box>
                      <Lbl>Name</Lbl>
                      <TextField fullWidth size="small" placeholder="Color, Size…" value={attrForm.key} onChange={e => setAttrForm({ ...attrForm, key: e.target.value })} disabled={loading} sx={inp(C.orange)} onKeyDown={e => e.key === "Enter" && handleAddAttribute()} />
                    </Box>
                    <Box>
                      <Lbl hint="Separate values with commas">Options</Lbl>
                      <TextField fullWidth size="small" placeholder="Red, Blue, Green" value={attrForm.options} onChange={e => setAttrForm({ ...attrForm, options: e.target.value })} disabled={loading} sx={inp(C.orange)} onKeyDown={e => e.key === "Enter" && handleAddAttribute()} />
                    </Box>
                    <SmallAddBtn onClick={handleAddAttribute} label="Add" accent={C.orange} />
                  </Box>
                </Box>
              </Card>
            </>)}

            {/* ══════════ VARIANTS ══════════ */}
            {isVariant && (<>
              <SectionAnchor id="variants" />
              <Card>
                <SectionHeading icon={Layers} title="Variants" subtitle="Each unique attribute combination creates a separate SKU" accent={C.emerald} badge={variants.length} />

                {/* Summary stats */}
                {variants.length > 0 && (
                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <StatBadge label="Variants" value={variants.length} color={C.emerald} />
                    <StatBadge label="Total Stock" value={variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)} color={C.sky} />
                    <StatBadge label="Avg. Sell Price" value={`₹${variants.length ? Math.round(variants.reduce((s, v) => s + v.selling_price, 0) / variants.length) : 0}`} color={C.purple} />
                    <StatBadge label="Avg. Cost" value={`₹${variants.length ? Math.round(variants.reduce((s, v) => s + v.cost_price, 0) / variants.length) : 0}`} color={C.amber} />
                  </Box>
                )}

                {/* Table */}
                {variants.length > 0 && (
                  <Box sx={{ borderRadius: "10px", border: `1.5px solid ${C.line}`, overflow: "hidden", mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: C.inset }}>
                          {["SKU", "Attributes", "Sell Price", "Cost", "Stock", ""].map((h, i) => (
                            <TableCell key={h} align={i >= 2 && i <= 4 ? "right" : i === 5 ? "center" : "left"}
                              sx={{ fontSize: "0.68rem", fontWeight: 700, color: C.muted, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em", py: 1.5, borderBottom: `1.5px solid ${C.line}`, bgcolor: "transparent" }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variants.map((v, i) => (
                          <TableRow key={i} sx={{ bgcolor: editIdx === i ? C.violetL : C.card, "&:hover": { bgcolor: C.inset }, transition: "background 0.1s", "&:not(:last-child) td": { borderBottom: `1px solid ${C.line}` } }}>
                            <TableCell sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 500, color: C.ink, py: 1.5 }}>{v.sku}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {Object.entries(v.attribute_map).map(([k, val]) => (
                                  <Box key={k} sx={{ px: 1, height: 20, borderRadius: "5px", bgcolor: C.violet + "12", border: `1px solid ${C.violet}25`, display: "flex", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 500, color: C.violet, fontFamily: "'DM Sans', sans-serif" }}>{k}: {val}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.83rem", fontWeight: 700, color: C.emerald, py: 1.5 }}>₹{v.selling_price.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.83rem", color: C.sub, py: 1.5 }}>₹{v.cost_price.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.5, height: 22, borderRadius: "6px", bgcolor: v.stock_quantity > 10 ? C.emeraldL : v.stock_quantity > 0 ? C.amberL : C.roseL, border: `1px solid ${v.stock_quantity > 10 ? C.emerald + "33" : v.stock_quantity > 0 ? C.amber + "33" : C.rose + "33"}` }}>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: v.stock_quantity > 10 ? C.emerald : v.stock_quantity > 0 ? C.amber : C.rose, fontFamily: "'DM Mono', monospace" }}>{v.stock_quantity}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                                <Button size="small" onClick={() => { setVariantForm(v); setEditIdx(i); }}
                                  sx={{ minWidth: "auto", px: 1.25, py: 0.4, fontSize: "0.72rem", textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: C.violet, borderRadius: "6px", "&:hover": { bgcolor: C.violetL } }}>
                                  Edit
                                </Button>
                                <IconButton size="small" onClick={() => { setVariants(variants.filter((_, j) => j !== i)); if (editIdx === i) { setEditIdx(null); setVariantForm({}); } }}
                                  sx={{ color: C.muted, "&:hover": { color: C.rose, bgcolor: C.roseL }, borderRadius: "6px", width: 27, height: 27 }}>
                                  <Trash2 size={12} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {/* Add / edit variant */}
                <Box sx={{ p: "20px 22px", borderRadius: "10px", border: `1.5px dashed ${C.emerald}44`, bgcolor: C.emeraldL + "55" }}>
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {editIdx !== null ? "✏ Editing variant" : "+ Add variant"}
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Lbl required>Variant SKU</Lbl>
                      <TextField fullWidth size="small" placeholder="VAR-RED-L" value={variantForm.sku || ""} onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })} disabled={loading} sx={{ ...inp(C.emerald), ...mono }} />
                    </Box>
                    <Box sx={g3}>
                      <Box><Lbl required>Selling Price</Lbl><TextField type="number" fullWidth size="small" inputProps={{ step: "0.01" }} value={variantForm.selling_price || ""} onChange={e => setVariantForm({ ...variantForm, selling_price: parseFloat(e.target.value) })} disabled={loading} sx={{ ...inp(C.emerald), ...mono }} /></Box>
                      <Box><Lbl required>Cost Price</Lbl><TextField type="number" fullWidth size="small" inputProps={{ step: "0.01" }} value={variantForm.cost_price || ""} onChange={e => setVariantForm({ ...variantForm, cost_price: parseFloat(e.target.value) })} disabled={loading} sx={{ ...inp(C.emerald), ...mono }} /></Box>
                      <Box><Lbl required>Stock Qty</Lbl><TextField type="number" fullWidth size="small" value={variantForm.stock_quantity ?? ""} onChange={e => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) })} disabled={loading} sx={{ ...inp(C.emerald), ...mono }} /></Box>
                    </Box>
                    {attributes.length > 0 && (
                      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(attributes.length, 4)}, 1fr)`, gap: 2 }}>
                        {attributes.map(attr => (
                          <Box key={attr.key}>
                            <Lbl required>{attr.key}</Lbl>
                            <FormControl fullWidth size="small" disabled={loading}>
                              <Select value={variantForm.attribute_map?.[attr.key] || ""} onChange={e => setVariantForm({ ...variantForm, attribute_map: { ...(variantForm.attribute_map || {}), [attr.key]: e.target.value } })} displayEmpty sx={selSx(C.emerald)}>
                                <MenuItem value="" disabled sx={miSx}><em style={{ color: C.ghost }}>Select…</em></MenuItem>
                                {attr.options.map(o => <MenuItem key={o} value={o} sx={miSx}>{o}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Box>
                        ))}
                      </Box>
                    )}
                    <Box sx={{ display: "flex", gap: 1.5, pt: 0.5 }}>
                      <SmallAddBtn onClick={handleAddVariant} label={editIdx !== null ? "Update Variant" : "Add Variant"} accent={C.emerald} />
                      {editIdx !== null && (
                        <Button size="small" onClick={() => { setEditIdx(null); setVariantForm({}); }}
                          sx={{ textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: C.sub, "&:hover": { color: C.ink } }}>
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </>)}

            {/* ══════════ SALES + PURCHASE (side by side) ══════════ */}
            <Box sx={{ ...g2, mb: 3 }}>

              {/* SALES */}
              <Box>
                <SectionAnchor id="sales" />
                <Card sx={{ mb: 0, height: "100%" }}>
                  <SectionHeading icon={ShoppingCart} title="Sales" subtitle="Revenue account & pricing" accent={C.purple} />
                  <Stack spacing={2.5}>
                    <Box><Lbl>Sales Account</Lbl><TextField fullWidth value={formData.sales_info.account} onChange={e => set("sales_info.account", e.target.value)} disabled={loading} placeholder="Sales Revenue" sx={inp(C.purple)} /></Box>
                    <Box sx={g2}>
                      <Box><Lbl>Selling Price</Lbl><TextField type="number" fullWidth inputProps={{ step: "0.01" }} value={formData.sales_info.selling_price} onChange={e => set("sales_info.selling_price", parseFloat(e.target.value))} disabled={loading} sx={{ ...inp(C.purple), ...mono }} /></Box>
                      <Box><Lbl>Currency</Lbl><TextField fullWidth value={formData.sales_info.currency} onChange={e => set("sales_info.currency", e.target.value)} disabled={loading} sx={{ ...inp(C.purple), ...mono }} /></Box>
                    </Box>
                    <Box><Lbl>Notes</Lbl><TextField fullWidth multiline rows={2} value={formData.sales_info.description} onChange={e => set("sales_info.description", e.target.value)} disabled={loading} placeholder="Notes for the sales team…" sx={inp(C.purple)} /></Box>
                  </Stack>
                </Card>
              </Box>

              {/* PURCHASE */}
              <Box>
                <SectionAnchor id="purchase" />
                <Card sx={{ mb: 0, height: "100%" }}>
                  <SectionHeading icon={Truck} title="Purchase" subtitle="Cost account & vendor" accent={C.rose} />
                  <Stack spacing={2.5}>
                    <Box><Lbl>Purchase Account</Lbl><TextField fullWidth value={formData.purchase_info.account} onChange={e => set("purchase_info.account", e.target.value)} disabled={loading} placeholder="Cost of Goods Sold" sx={inp(C.rose)} /></Box>
                    <Box sx={g2}>
                      <Box><Lbl>Cost Price</Lbl><TextField type="number" fullWidth inputProps={{ step: "0.01" }} value={formData.purchase_info.cost_price} onChange={e => set("purchase_info.cost_price", parseFloat(e.target.value))} disabled={loading} sx={{ ...inp(C.rose), ...mono }} /></Box>
                      <Box><Lbl>Currency</Lbl><TextField fullWidth value={formData.purchase_info.currency} onChange={e => set("purchase_info.currency", e.target.value)} disabled={loading} sx={{ ...inp(C.rose), ...mono }} /></Box>
                    </Box>
                    <Box>
                      <Lbl>Preferred Vendor</Lbl>
                      <FormControl fullWidth disabled={loading || loadingV}>
                        <Select value={formData.purchase_info.preferred_vendor_id ? String(formData.purchase_info.preferred_vendor_id) : ""} onChange={e => set("purchase_info.preferred_vendor_id", e.target.value ? parseInt(e.target.value, 10) : null)} displayEmpty sx={selSx(C.rose)}>
                          <MenuItem value="" sx={{ ...miSx, color: C.muted }}><em>No preferred vendor</em></MenuItem>
                          {vendors.map(v => <MenuItem key={v.id} value={String(v.id)} sx={miSx}>{v.display_name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box><Lbl>Notes</Lbl><TextField fullWidth multiline rows={2} value={formData.purchase_info.description} onChange={e => set("purchase_info.description", e.target.value)} disabled={loading} placeholder="Notes for purchasing…" sx={inp(C.rose)} /></Box>
                  </Stack>
                </Card>
              </Box>
            </Box>

            {/* ══════════ INVENTORY + RETURNS (side by side) ══════════ */}
            <Box sx={{ ...g2, mb: 4 }}>

              {/* INVENTORY */}
              <Box>
                <SectionAnchor id="inventory" />
                <Card sx={{ mb: 0, height: "100%" }}>
                  <SectionHeading icon={Archive} title="Inventory" subtitle="Stock tracking & valuation settings" accent={C.sky} />
                  <Stack spacing={2.5}>
                    <ToggleCard label="Track Inventory" desc="Monitor stock levels, get reorder alerts" checked={formData.inventory.track_inventory} onChange={v => set("inventory.track_inventory", v)} disabled={loading} accent={C.sky} />
                    <Box><Lbl hint="e.g., Inventory – Water Bottles">Inventory Account</Lbl><TextField fullWidth value={formData.inventory.inventory_account} onChange={e => set("inventory.inventory_account", e.target.value)} disabled={loading} placeholder="Inventory – {Product Type}" sx={inp(C.sky)} /></Box>
                    <Box sx={g2}>
                      <Box><Lbl hint="FIFO, LIFO, Average">Valuation Method</Lbl><TextField fullWidth value={formData.inventory.inventory_valuation_method} onChange={e => set("inventory.inventory_valuation_method", e.target.value)} disabled={loading} sx={inp(C.sky)} /></Box>
                      <Box><Lbl hint="Alert when stock drops below this">Reorder Point</Lbl><TextField type="number" fullWidth value={formData.inventory.reorder_point} onChange={e => set("inventory.reorder_point", parseInt(e.target.value))} disabled={loading} sx={{ ...inp(C.sky), ...mono }} /></Box>
                    </Box>
                  </Stack>
                </Card>
              </Box>

              {/* RETURNS */}
              <Box>
                <SectionAnchor id="returns" />
                <Card sx={{ mb: 0, height: "100%" }}>
                  <SectionHeading icon={RotateCcw} title="Return Policy" subtitle="Configure customer return eligibility" accent={C.amber} />
                  <ToggleCard label="Item is Returnable" desc={formData.return_policy.returnable ? "Customers can return within your return window" : "This item is non-returnable once purchased"} checked={formData.return_policy.returnable} onChange={v => set("return_policy.returnable", v)} disabled={loading} accent={C.amber} />

                  {/* Margin preview */}
                  {formData.sales_info.selling_price > 0 && formData.purchase_info.cost_price > 0 && (
                    <Box sx={{ mt: 3, p: "16px 18px", borderRadius: "10px", bgcolor: C.inset, border: `1.5px solid ${C.line}` }}>
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5, fontFamily: "'DM Sans', sans-serif" }}>Margin Preview</Typography>
                      {(() => {
                        const sell = formData.sales_info.selling_price;
                        const cost = formData.purchase_info.cost_price;
                        const margin = sell - cost;
                        const pct = ((margin / sell) * 100).toFixed(1);
                        return (
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Gross Margin</Typography>
                              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: margin >= 0 ? C.emerald : C.rose, fontFamily: "'DM Mono', monospace" }}>₹{margin.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Margin %</Typography>
                              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: parseFloat(pct) >= 20 ? C.emerald : parseFloat(pct) >= 0 ? C.amber : C.rose, fontFamily: "'DM Mono', monospace" }}>{pct}%</Typography>
                            </Box>
                          </Box>
                        );
                      })()}
                    </Box>
                  )}
                </Card>
              </Box>
            </Box>

            {/* Bottom padding */}
            <Box sx={{ height: 24 }} />
          </Box>
        </Box>
      </Box>
    </>
  );
}