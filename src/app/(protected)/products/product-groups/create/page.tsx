"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Button, Stack, Typography, TextField, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogContent, DialogActions, CircularProgress,
  Tooltip, InputAdornment,
} from "@mui/material";
import { BBTitle, BBButton } from "@/lib";
import {
  ArrowLeft, Plus, Trash2, Search, Package2, Layers,
  Zap, ShoppingBag, TrendingUp, TrendingDown, X,
  ChevronRight, AlertTriangle, CheckCircle2, Tag,
  DollarSign, ReceiptText,
} from "lucide-react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { showToastMessage } from "@/utils/toastUtil";
import { products } from "@/constants/apiConstants";
import { CreateProductGroupInput, ProductVariant } from "@/models/product-group.model";
import { productGroupService } from "@/services/productGroupService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductItem {
  id: string; sku: string; name: string;
  cost_price: number; selling_price: number;
  variants?: ProductVariant[];
}
interface SelectedProductComponent {
  product_id: string; product_name: string;
  variant_sku: string | null; quantity: number; position: number;
  variant_details?: Record<string, string>; variants?: ProductVariant[];
}
interface ProductGroupFormData {
  name: string; description: string; is_active: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Product group name is required"),
  description: Yup.string(),
  is_active: Yup.boolean().required("Status is required"),
});

const initialValues: ProductGroupFormData = {
  name: "", description: "", is_active: true,
};

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

  border:       "#E8EBF2",
  borderMid:    "#D1D5DB",

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

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function SectionCard({
  icon: Icon, title, badge, topAction, children,
}: {
  icon: any; title: string; badge?: string | number;
  topAction?: React.ReactNode; children: React.ReactNode;
}) {
  return (
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
      {/* Card header */}
      <Box sx={{
        px: 3, pt: 3.5, pb: 2,
        borderBottom: `1.5px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(180deg, #F8F9FF, ${T.cardBg})`,
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            p: 0.75, borderRadius: "9px",
            background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
            border: `1px solid ${T.brandMid}`,
          }}>
            <Icon size={15} color={T.brand} strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "0.92rem", letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {badge !== undefined && (
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.4,
              px: 0.9, py: 0.25, borderRadius: "6px",
              background: `linear-gradient(135deg, ${T.brandXSoft}, ${T.brandSoft})`,
              border: `1px solid ${T.brandMid}`,
            }}>
              <Zap size={9} color={T.brand} />
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                {badge}
              </Typography>
            </Box>
          )}
        </Stack>
        {topAction}
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}

// ─── Styled input label ───────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography sx={{ fontWeight: 700, color: T.textMid, fontSize: "0.8rem", mb: 0.75, display: "flex", alignItems: "center", gap: 0.4 }}>
      {children}
      {required && <span style={{ color: T.danger, fontSize: "0.9em" }}>*</span>}
    </Typography>
  );
}

// ─── Shared input sx ──────────────────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "11px",
    backgroundColor: T.subtleBg,
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.18s",
    "& fieldset": { borderColor: T.border, borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: T.brandMid },
    "&.Mui-focused": {
      backgroundColor: T.cardBg,
      boxShadow: `0 0 0 3px ${T.brandGlow}`,
    },
    "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: "1.5px" },
  },
};

// ─── Position Badge ───────────────────────────────────────────────────────────
function PosBadge({ n }: { n: number }) {
  return (
    <Box sx={{
      width: 28, height: 28, borderRadius: "8px",
      background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
      border: `1.5px solid ${T.brandMid}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Typography sx={{ fontWeight: 900, fontSize: "0.72rem", color: T.brand, fontFamily: "'DM Mono', monospace" }}>{n}</Typography>
    </Box>
  );
}

// ─── Product mini-row in dialog ───────────────────────────────────────────────
function DialogProductRow({ product, onAdd, added }: { product: ProductItem; onAdd: () => void; added: boolean }) {
  const { bg, fg, border } = colorFromString(product.name);
  const initials = product.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const profit = product.selling_price - product.cost_price;
  const isUp = profit >= 0;

  return (
    <Box
      onClick={added ? undefined : onAdd}
      sx={{
        display: "flex", alignItems: "center",
        gap: 2, px: 2, py: 1.75,
        borderRadius: "14px",
        border: `1.5px solid ${added ? T.successMid : T.border}`,
        background: added
          ? `linear-gradient(135deg, ${T.successSoft}, #D1FAE5)`
          : T.cardBg,
        cursor: added ? "default" : "pointer",
        transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
        "&:hover": added ? {} : {
          border: `1.5px solid ${T.brandMid}`,
          background: `linear-gradient(135deg, ${T.brandXSoft}, ${T.brandSoft})`,
          transform: "translateX(3px)",
          boxShadow: T.shadowSm,
        },
      }}
    >
      {/* Avatar */}
      <Box sx={{
        width: 38, height: 38, borderRadius: "11px", flexShrink: 0,
        background: `linear-gradient(135deg, ${bg}, ${bg}CC)`,
        border: `1.5px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 8px ${fg}18`,
      }}>
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: "0.72rem", color: fg }}>
          {initials}
        </Typography>
      </Box>

      {/* Info */}
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.85rem", lineHeight: 1.3 }}>
          {product.name}
        </Typography>
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.67rem", color: T.textLight }}>
          {product.sku}
        </Typography>
      </Box>

      {/* Pricing */}
      <Stack alignItems="flex-end" spacing={0.25} flexShrink={0}>
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: "0.82rem", color: T.text }}>
          ₹{product.selling_price.toFixed(2)}
        </Typography>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.3,
          px: 0.7, py: 0.15, borderRadius: "5px",
          background: isUp
            ? `linear-gradient(135deg, ${T.successSoft}, #D1FAE5)`
            : `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
          border: `1px solid ${isUp ? T.successMid : T.dangerMid}`,
        }}>
          {isUp
            ? <TrendingUp size={9} color={T.success} />
            : <TrendingDown size={9} color={T.danger} />}
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: isUp ? T.success : T.danger, fontFamily: "'DM Mono', monospace" }}>
            ₹{Math.abs(profit).toFixed(0)}
          </Typography>
        </Box>
      </Stack>

      {/* Variant chip */}
      {product.variants && product.variants.length > 0 && (
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.4,
          px: 0.9, py: 0.3, borderRadius: "7px",
          background: T.brandSoft, border: `1px solid ${T.brandMid}`,
          flexShrink: 0,
        }}>
          <Layers size={10} color={T.brand} />
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: T.brand }}>
            {product.variants.length}
          </Typography>
        </Box>
      )}

      {/* Added / arrow indicator */}
      {added ? (
        <CheckCircle2 size={18} color={T.success} style={{ flexShrink: 0 }} />
      ) : (
        <ChevronRight size={16} color={T.textLight} style={{ flexShrink: 0, transition: "transform 0.15s" }} />
      )}
    </Box>
  );
}

// ─── Summary pill ─────────────────────────────────────────────────────────────
function SummaryPill({
  label, value, icon: Icon, accent, bg,
}: { label: string; value: string; icon: any; accent: string; bg: string }) {
  return (
    <Box sx={{
      flex: 1, minWidth: 120, px: 2.25, py: 2,
      background: bg, borderRadius: "14px",
      border: `1.5px solid ${accent}20`,
      position: "relative", overflow: "hidden",
      transition: "transform 0.18s",
      "&:hover": { transform: "translateY(-2px)" },
      "&::before": {
        content: '""', position: "absolute",
        top: -20, right: -20, width: 60, height: 60, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
      },
    }}>
      <Box sx={{ display: "inline-flex", p: 0.6, borderRadius: "7px", background: `${accent}15`, mb: 1 }}>
        <Icon size={13} color={accent} strokeWidth={2.5} />
      </Box>
      <Typography sx={{ color: T.textLight, fontWeight: 700, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1.1rem", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.03em" }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateProductGroupPage() {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductComponent[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: productsData, loading: productsLoading, refetch: refetchProducts } =
    useFetch<{ products: any[]; total: number }>({ url: products.postProduct });

  const availableProducts: ProductItem[] =
    productsData?.products?.map((p: any) => ({
      id: p.id,
      sku: p.product_details?.base_sku || p.sku || "",
      name: p.name,
      cost_price: p.purchase_info?.cost_price || 0,
      selling_price: p.sales_info?.selling_price || 0,
      variants: p.product_details?.variants || [],
    })) || [];

  const filteredProducts = searchTerm
    ? availableProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableProducts;

  const handleAddProduct = (product: ProductItem) => {
    if (selectedProducts.some((p) => p.product_id === product.id)) {
      showToastMessage("Product already added to group", "error");
      return;
    }
    setSelectedProducts((prev) => [
      ...prev,
      {
        product_id: product.id, product_name: product.name,
        variant_sku: null, quantity: 1,
        position: prev.length + 1, variants: product.variants || [],
      },
    ]);
    setSearchTerm("");
    showToastMessage("Product added to group", "success");
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      next.forEach((p, i) => (p.position = i + 1));
      return next;
    });
  };

  const handleVariantChange = (index: number, variantSku: string) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next[index].variant_sku = variantSku || null;
      return next;
    });
  };

  const handleQtyChange = (index: number, val: string) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next[index].quantity = parseInt(val) || 1;
      return next;
    });
  };

  const totalCost = selectedProducts.reduce((sum, p) => {
    const prod = availableProducts.find((ap) => ap.id === p.product_id);
    return sum + (prod?.cost_price || 0) * p.quantity;
  }, 0);
  const totalSelling = selectedProducts.reduce((sum, p) => {
    const prod = availableProducts.find((ap) => ap.id === p.product_id);
    return sum + (prod?.selling_price || 0) * p.quantity;
  }, 0);
  const totalProfit = totalSelling - totalCost;

  const handleCreateProductGroup = async (values: ProductGroupFormData) => {
    if (selectedProducts.length === 0) {
      showToastMessage("Please add at least one product to the group", "error");
      return;
    }
    try {
      setIsLoading(true);
      const payload: CreateProductGroupInput = {
        name: values.name, description: values.description,
        is_active: values.is_active,
        products: selectedProducts.map((p) => ({
          product_id: p.product_id, quantity: p.quantity,
          variant_sku: p.variant_sku, position: p.position,
          variant_details: p.variant_details,
        })),
      };
      const response = await productGroupService.createProductGroup(payload);
      if (response?.success) {
        showToastMessage("Product group created successfully", "success");
        router.push("/products/product-groups");
      } else {
        showToastMessage("Failed to create product group", "error");
      }
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error.message as string) : "Failed to create product group";
      showToastMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: T.pageBg, pb: 8,
      fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
      backgroundImage: `radial-gradient(${T.border} 1.2px, transparent 1.2px)`,
      backgroundSize: "28px 28px",
    }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        background: T.glassOverlay, backdropFilter: "blur(20px)",
        borderBottom: `1.5px solid ${T.border}`,
        px: { xs: 2, md: 4 }, py: 2,
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 0 #E8EBF2, 0 4px 20px rgba(15,23,42,0.05)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowLeft size={15} />}
              onClick={() => router.back()}
              sx={{
                color: T.textMid, textTransform: "none", fontWeight: 700,
                fontSize: "0.82rem", borderRadius: "10px", px: 1.75, height: 36,
                border: `1.5px solid ${T.border}`, background: T.cardBg,
                "&:hover": { background: T.subtleBg, borderColor: T.borderMid },
                transition: "all 0.15s",
              }}
            >
              Back
            </Button>
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
              <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1rem", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Create Product Group
              </Typography>
              <Typography sx={{ color: T.textLight, fontSize: "0.7rem", mt: 0.15 }}>
                Bundle products into a group
              </Typography>
            </Box>
          </Stack>

          {/* Step indicator */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            {[
              { n: 1, label: "Info" },
              { n: 2, label: "Products" },
            ].map(({ n, label }, i) => (
              <Stack key={n} direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  px: 1.25, py: 0.4, borderRadius: "8px",
                  background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                  border: `1.5px solid ${T.brandMid}`,
                }}>
                  <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: "0.68rem", color: T.brand }}>
                    {n}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: T.brand }}>
                    {label}
                  </Typography>
                </Box>
                {i === 0 && <ChevronRight size={12} color={T.textXLight} />}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3.5 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleCreateProductGroup}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form>
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
                {/* ── Basic info ─────────────────────────────────────────── */}
                <SectionCard icon={Tag} title="Basic Information">
                  <Stack spacing={2.5}>
                    {/* Name */}
                    <Box>
                      <FieldLabel required>Product Group Name</FieldLabel>
                      <TextField
                        fullWidth name="name"
                        value={values.name} onChange={handleChange}
                        placeholder="e.g., Complete Water Bottle Package"
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                        size="small"
                        sx={inputSx}
                      />
                    </Box>

                    {/* Description */}
                    <Box>
                      <FieldLabel>Description</FieldLabel>
                      <TextField
                        fullWidth name="description"
                        value={values.description} onChange={handleChange}
                        placeholder="Full packaging solution including…"
                        multiline rows={3} size="small"
                        sx={inputSx}
                      />
                    </Box>

                    {/* Status */}
                    <Box>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        fullWidth name="is_active"
                        value={values.is_active}
                        onChange={handleChange}
                        size="small"
                        sx={{
                          borderRadius: "11px",
                          backgroundColor: T.subtleBg,
                          fontSize: "0.875rem", fontWeight: 600,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: T.border, borderWidth: "1.5px" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.brandMid },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.brand, borderWidth: "1.5px" },
                        }}
                      >
                        <MenuItem value={true as any}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} />
                            <span>Active</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value={false as any}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.textLight }} />
                            <span>Inactive</span>
                          </Stack>
                        </MenuItem>
                      </Select>
                    </Box>
                  </Stack>
                </SectionCard>

                {/* ── Products table ─────────────────────────────────────── */}
                <SectionCard
                  icon={Layers}
                  title="Products in Group"
                  badge={selectedProducts.length}
                  topAction={
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus size={14} strokeWidth={2.5} />}
                      onClick={() => { setShowProductDialog(true); refetchProducts(); }}
                      sx={{
                        background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                        borderRadius: "9px", textTransform: "none",
                        fontWeight: 800, fontSize: "0.78rem",
                        height: 32, px: 1.75,
                        boxShadow: T.shadowBrand, border: "none",
                        "&:hover": { boxShadow: T.shadowBrandHover, transform: "translateY(-1px)" },
                        transition: "all 0.15s",
                      }}
                    >
                      Add Product
                    </Button>
                  }
                >
                  {/* Empty prompt */}
                  {selectedProducts.length === 0 ? (
                    <Box
                      onClick={() => { setShowProductDialog(true); refetchProducts(); }}
                      sx={{
                        py: 5, textAlign: "center", cursor: "pointer",
                        border: `2px dashed ${T.border}`,
                        borderRadius: "14px",
                        background: T.subtleBg,
                        transition: "all 0.18s",
                        "&:hover": {
                          borderColor: T.brandMid,
                          background: `linear-gradient(135deg, ${T.brandXSoft}, ${T.brandSoft})`,
                        },
                      }}
                    >
                      <Box sx={{
                        width: 48, height: 48, borderRadius: "14px", mx: "auto", mb: 1.5,
                        background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
                        border: `1.5px solid ${T.brandMid}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Plus size={20} color={T.brand} strokeWidth={2.5} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: T.textMid, fontSize: "0.875rem", mb: 0.5 }}>
                        Add products to this group
                      </Typography>
                      <Typography sx={{ color: T.textLight, fontSize: "0.78rem" }}>
                        Click here or use the button above to browse products
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Products table */}
                      <Box sx={{
                        borderRadius: "14px", overflow: "hidden",
                        border: `1.5px solid ${T.border}`,
                        "& .MuiTableCell-root": { borderBottom: `1px solid ${T.border}`, py: 1.5, px: 2 },
                        "& .MuiTableCell-head": {
                          background: `linear-gradient(180deg, #F8F9FF, ${T.subtleBg})`,
                          color: T.textLight, fontSize: "0.65rem", fontWeight: 800,
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          borderBottom: `2px solid ${T.border}`,
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
                              <TableCell>Variant</TableCell>
                              <TableCell align="center">Qty</TableCell>
                              <TableCell align="right">Cost</TableCell>
                              <TableCell align="right">Selling</TableCell>
                              <TableCell align="center">Remove</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProducts.map((product, index) => {
                              const productData = availableProducts.find((p) => p.id === product.product_id);
                              const hasVariants = product.variants && product.variants.length > 0;
                              const { bg, fg, border } = colorFromString(product.product_name);
                              const initials = product.product_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                              return (
                                <TableRow key={index}>
                                  {/* Position */}
                                  <TableCell><PosBadge n={product.position} /></TableCell>

                                  {/* Product */}
                                  <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1.25}>
                                      <Box sx={{
                                        width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
                                        background: `linear-gradient(135deg, ${bg}, ${bg}CC)`,
                                        border: `1.5px solid ${border}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                      }}>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: "0.62rem", color: fg }}>
                                          {initials}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.82rem", lineHeight: 1.3 }}>
                                          {productData?.name}
                                        </Typography>
                                        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.67rem", color: T.textLight }}>
                                          {productData?.sku}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </TableCell>

                                  {/* Variant select */}
                                  <TableCell>
                                    {hasVariants ? (
                                      <Select
                                        size="small"
                                        value={product.variant_sku || ""}
                                        onChange={(e) => handleVariantChange(index, e.target.value)}
                                        sx={{
                                          minWidth: 140, borderRadius: "9px", fontSize: "0.8rem",
                                          backgroundColor: T.subtleBg,
                                          "& .MuiOutlinedInput-notchedOutline": { borderColor: T.border, borderWidth: "1.5px" },
                                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.brandMid },
                                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.brand },
                                        }}
                                      >
                                        <MenuItem value=""><em style={{ color: T.textLight, fontSize: "0.8rem" }}>Select variant</em></MenuItem>
                                        {product.variants?.map((v) => (
                                          <MenuItem key={v.sku} value={v.sku} sx={{ fontSize: "0.82rem" }}>
                                            {v.variant_name}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    ) : (
                                      <Typography sx={{ color: T.textXLight, fontSize: "0.75rem", fontStyle: "italic" }}>
                                        No variants
                                      </Typography>
                                    )}
                                  </TableCell>

                                  {/* Qty */}
                                  <TableCell align="center">
                                    <TextField
                                      type="number" size="small"
                                      value={product.quantity}
                                      onChange={(e) => handleQtyChange(index, e.target.value)}
                                      inputProps={{ min: "1" }}
                                      sx={{
                                        width: 72,
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "9px", backgroundColor: T.subtleBg,
                                          fontSize: "0.82rem", fontWeight: 700,
                                          fontFamily: "'DM Mono', monospace",
                                          "& fieldset": { borderColor: T.border, borderWidth: "1.5px" },
                                          "&:hover fieldset": { borderColor: T.brandMid },
                                          "&.Mui-focused fieldset": { borderColor: T.brand },
                                        },
                                      }}
                                    />
                                  </TableCell>

                                  {/* Cost */}
                                  <TableCell align="right">
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.82rem", color: T.textMid }}>
                                      ₹{((productData?.cost_price || 0) * product.quantity).toFixed(2)}
                                    </Typography>
                                  </TableCell>

                                  {/* Selling */}
                                  <TableCell align="right">
                                    <Typography sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: "0.82rem", color: T.text }}>
                                      ₹{((productData?.selling_price || 0) * product.quantity).toFixed(2)}
                                    </Typography>
                                  </TableCell>

                                  {/* Remove */}
                                  <TableCell align="center">
                                    <Tooltip title="Remove" placement="top">
                                      <IconButton
                                        size="small" onClick={() => handleRemoveProduct(index)}
                                        sx={{
                                          color: T.danger,
                                          background: `linear-gradient(135deg, ${T.dangerSoft}, #FEE2E2)`,
                                          border: `1.5px solid ${T.dangerMid}`,
                                          borderRadius: "8px", width: 30, height: 30,
                                          "&:hover": { background: `linear-gradient(135deg, #FEE2E2, ${T.dangerMid}80)`, transform: "scale(1.08)" },
                                          transition: "all 0.15s",
                                        }}
                                      >
                                        <Trash2 size={13} />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>

                      {/* Summary pills */}
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2.5} flexWrap="wrap" useFlexGap>
                        <SummaryPill
                          label="Total Cost" icon={DollarSign}
                          value={`₹${totalCost.toFixed(2)}`}
                          accent={T.warning} bg={T.warningSoft}
                        />
                        <SummaryPill
                          label="Total Selling" icon={ShoppingBag}
                          value={`₹${totalSelling.toFixed(2)}`}
                          accent={T.brand} bg={T.brandXSoft}
                        />
                        <SummaryPill
                          label="Total Profit" icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
                          value={`₹${totalProfit.toFixed(2)}`}
                          accent={totalProfit >= 0 ? T.success : T.danger}
                          bg={totalProfit >= 0 ? T.successSoft : T.dangerSoft}
                        />
                      </Stack>
                    </>
                  )}
                </SectionCard>

                {/* ── Footer actions ─────────────────────────────────────── */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    onClick={() => router.back()} disabled={isLoading}
                    sx={{
                      borderRadius: "11px", textTransform: "none",
                      fontWeight: 700, color: T.textMid,
                      border: `1.5px solid ${T.border}`,
                      px: 2.5, height: 42, background: T.cardBg,
                      "&:hover": { background: T.subtleBg, borderColor: T.borderMid },
                      transition: "all 0.15s",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit" variant="contained"
                    disabled={isLoading || selectedProducts.length === 0}
                    sx={{
                      background: isLoading || selectedProducts.length === 0
                        ? T.textXLight
                        : `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                      borderRadius: "11px", textTransform: "none",
                      fontWeight: 800, fontSize: "0.875rem",
                      height: 42, px: 3,
                      boxShadow: selectedProducts.length > 0 ? T.shadowBrand : "none",
                      border: "none",
                      "&:hover": selectedProducts.length > 0 ? {
                        boxShadow: T.shadowBrandHover, transform: "translateY(-1.5px)",
                      } : {},
                      transition: "all 0.18s",
                    }}
                  >
                    {isLoading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={14} sx={{ color: "#fff" }} />
                        <span>Creating…</span>
                      </Stack>
                    ) : "Create Product Group"}
                  </Button>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>

      {/* ── Product picker dialog ──────────────────────────────────────────── */}
      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowLg,
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog header */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1.5px solid ${T.border}`,
          background: `linear-gradient(180deg, #F8F9FF, ${T.cardBg})`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              p: 0.75, borderRadius: "9px",
              background: `linear-gradient(135deg, ${T.brandSoft}, #E0E7FF)`,
              border: `1px solid ${T.brandMid}`,
            }}>
              <ShoppingBag size={15} color={T.brand} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "0.92rem", letterSpacing: "-0.02em" }}>
              Select Products
            </Typography>
            {availableProducts.length > 0 && (
              <Box sx={{
                px: 0.9, py: 0.25, borderRadius: "6px",
                background: T.brandSoft, border: `1px solid ${T.brandMid}`,
              }}>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: T.brand, fontFamily: "'DM Mono', monospace" }}>
                  {availableProducts.length}
                </Typography>
              </Box>
            )}
          </Stack>
          <IconButton
            size="small" onClick={() => setShowProductDialog(false)}
            sx={{ color: T.textLight, borderRadius: "8px", "&:hover": { background: T.subtleBg } }}
          >
            <X size={16} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* Search */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
            <Box sx={{ position: "relative" }}>
              <Search
                size={14} color={T.textLight}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <TextField
                fullWidth placeholder="Search by name or SKU…"
                size="small" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    pl: "38px", borderRadius: "11px",
                    backgroundColor: T.subtleBg, fontSize: "0.875rem",
                    "& fieldset": { borderColor: T.border, borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: T.brandMid },
                    "&.Mui-focused": { backgroundColor: T.cardBg, boxShadow: `0 0 0 3px ${T.brandGlow}` },
                    "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: "1.5px" },
                  },
                }}
              />
              {searchTerm && (
                <IconButton
                  size="small" onClick={() => setSearchTerm("")}
                  sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: T.textLight, p: 0.25 }}
                >
                  <X size={12} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Product list */}
          <Box sx={{ maxHeight: 420, overflowY: "auto", px: 2.5, py: 2 }}>
            {productsLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5 }}>
                <CircularProgress size={22} sx={{ color: T.brand }} />
                <Typography sx={{ color: T.textLight, fontSize: "0.82rem", fontWeight: 600 }}>
                  Loading products…
                </Typography>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography sx={{ color: T.textLight, fontSize: "0.85rem", fontWeight: 600 }}>
                  No products found
                </Typography>
                <Typography sx={{ color: T.textXLight, fontSize: "0.78rem", mt: 0.5 }}>
                  Try a different search term
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {filteredProducts.map((product: ProductItem) => (
                  <DialogProductRow
                    key={product.id}
                    product={product}
                    added={selectedProducts.some((p) => p.product_id === product.id)}
                    onAdd={() => {
                      handleAddProduct(product);
                      setShowProductDialog(false);
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${T.border}`, pt: 1.5 }}>
          <Button
            onClick={() => setShowProductDialog(false)}
            sx={{
              borderRadius: "10px", textTransform: "none", fontWeight: 700,
              color: T.textMid, border: `1.5px solid ${T.border}`, px: 2.5,
              "&:hover": { background: T.subtleBg },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}