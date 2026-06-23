"use client";

import VariantBuilder from "@/components/products/styleData/StyleData";
import { products } from "@/constants/apiConstants";
import useAddProduct from "@/hooks/services/useAddProduct";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBInput, BBLoader, BBRichTextEditor } from "@/lib";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { IProductForm } from "@/models/IProductForm";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import {
  ArrowLeft,
  BarChart2,
  ChevronRight,
  CreditCard,
  Layers,
  Package,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg: "#ffffff",
  surface: "#ffffff",
  surfaceAlt: "#f9fafb",
  border: "#eaecf0",
  borderFocus: "#6366f1",

  // Text
  textPrimary: "#101828",
  textSecondary: "#344054",
  textMuted: "#667085",
  textXMuted: "#98a2b3",

  // Brand
  indigo: "#6366f1",
  indigoLight: "#eef2ff",
  indigoDark: "#4f46e5",

  // Semantic
  green: "#12b76a",
  greenBg: "#ecfdf3",
  amber: "#f59e0b",
  amberBg: "#fffbeb",
  red: "#ef4444",
  redBg: "#fff1f0",
  violet: "#7c3aed",
  violetBg: "#f5f3ff",

  // Radius
  r1: "6px",
  r2: "10px",
  r3: "14px",
  r4: "20px",

  // Shadow
  shadowXs: "0 1px 2px rgba(16,24,40,0.05)",
  shadowSm: "0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)",
  shadowMd: "0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06)",
  shadowInner: "inset 0 2px 4px rgba(16,24,40,0.04)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  is_resource: Yup.boolean(),
  resource_name: Yup.string().when("is_resource", {
    is: true,
    then: (s) => s.required("Resource Name is required"),
    otherwise: (s) => s.notRequired(),
  }),
  resource_unit: Yup.string().when("is_resource", {
    is: true,
    then: (s) => s.required("Resource Unit is required"),
    otherwise: (s) => s.notRequired(),
  }),
  resource_cost_per_unit: Yup.number().when("is_resource", {
    is: true,
    then: (s) =>
      s.typeError("Must be a number").required("Required").min(0, "Must be ≥ 0"),
    otherwise: (s) => s.notRequired(),
  }),
  product_details: Yup.object().when("is_resource", {
    is: false,
    then: (s) =>
      s.shape({
        unit: Yup.string().required("Unit is required"),
        base_sku: Yup.string(),
      }),
    otherwise: (s) => s.notRequired(),
  }),
  sales_info: Yup.object().when("is_resource", {
    is: false,
    then: (s) =>
      s.shape({
        selling_price: Yup.number()
          .typeError("Must be a number")
          .required("Selling price is required")
          .min(0, "Must be ≥ 0"),
        currency: Yup.string(),
        account: Yup.string(),
      }),
    otherwise: (s) => s.notRequired(),
  }),
  purchase_info: Yup.object().when("is_resource", {
    is: false,
    then: (s) =>
      s.shape({
        cost_price: Yup.number().typeError("Must be a number").min(0, "Must be ≥ 0"),
      }),
    otherwise: (s) => s.notRequired(),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface IVariant {
  sku: string;
  price: number;
  default?: boolean;
  attributes: Record<string, string>;
}

const convertProductVariantToUIVariant = (pv: any): IVariant => ({
  sku: pv.sku || "",
  price: pv.selling_price || 0,
  default: false,
  attributes: pv.attribute_map || {},
});

const convertUIVariantToProductVariant = (v: IVariant): any => ({
  sku: v.sku,
  variant_name: v.sku,
  selling_price: v.price,
  cost_price: v.price * 0.5,
  stock_quantity: 0,
  attribute_map: v.attributes,
  is_active: true,
});

const initialValues: IProductForm = {
  name: "",
  is_resource: false,
  resource_name: "",
  resource_unit: "",
  resource_cost_per_unit: 0,
  product_details: {
    unit: "",
    description: "",
    base_sku: "",
    variants: [],
    attribute_definitions: [],
  },
  sales_info: { selling_price: 0, currency: "INR", account: "", description: "" },
  purchase_info: { cost_price: 0, currency: "INR", account: "", description: "" },
  has_style: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// UI Atoms
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: T.r2,
        cursor: "pointer",
        background: active ? T.indigoLight : "transparent",
        color: active ? T.indigo : T.textMuted,
        transition: "all 0.15s ease",
        userSelect: "none",
        position: "relative",
        "&:hover": {
          background: active ? T.indigoLight : T.surfaceAlt,
          color: active ? T.indigo : T.textSecondary,
        },
        // Left accent bar
        "&::before": active
          ? {
              content: '""',
              position: "absolute",
              left: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderRadius: "0 3px 3px 0",
              background: T.indigo,
            }
          : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: active ? 600 : 500,
          flex: 1,
          fontSize: "0.815rem",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </Typography>
      {badge && (
        <Box
          sx={{
            background: T.indigo,
            color: "#fff",
            borderRadius: 99,
            fontSize: "0.6rem",
            fontWeight: 700,
            px: 0.75,
            py: 0.125,
            lineHeight: 1.5,
          }}
        >
          {badge}
        </Box>
      )}
      {active && !badge && (
        <ChevronRight size={13} style={{ opacity: 0.6 }} />
      )}
    </Box>
  );
}

function Card({ children, sx = {} }: { children: React.ReactNode; sx?: any }) {
  return (
    <Box
      sx={{
        background: T.surface,
        borderRadius: T.r3,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowXs,
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderBottom: `1px solid ${T.border}`,
        background: T.surfaceAlt,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: T.textPrimary,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: "0.78rem", color: T.textMuted, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function SectionLabel({ children, color = T.textXMuted }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography
      sx={{
        fontSize: "0.68rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color,
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
      <Typography sx={{ fontSize: "0.76rem", color: T.textMuted, fontWeight: 500, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.76rem",
          color: T.textSecondary,
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ToggleCard({
  icon,
  label,
  description,
  active,
  accentColor,
  accentBg,
  name,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  accentColor: string;
  accentBg: string;
  name: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: T.r2,
        border: `1.5px solid`,
        borderColor: active ? accentColor + "60" : T.border,
        background: active ? accentBg : T.surface,
        transition: "all 0.2s ease",
        boxShadow: active ? `0 0 0 3px ${accentColor}18` : "none",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: T.r2,
            background: active ? accentColor + "20" : T.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "0.775rem", color: T.textMuted, mt: 0.125, lineHeight: 1.4 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
      <BBSwitch name={name} label="" />
    </Box>
  );
}

// Section nav config
const REGULAR_SECTIONS = [
  { id: "sec-basics", label: "Basics", icon: <Package size={14} /> },
  { id: "sec-pricing", label: "Pricing", icon: <CreditCard size={14} /> },
  { id: "sec-inventory", label: "Inventory", icon: <BarChart2 size={14} /> },
  { id: "sec-desc", label: "Descriptions", icon: <Layers size={14} /> },
];

const RESOURCE_SECTIONS = [
  { id: "sec-basics", label: "Basics", icon: <Package size={14} /> },
  { id: "sec-resource", label: "Resource Config", icon: <Zap size={14} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const AddProduct = () => {
  const { loading: authLoading, error: authError } = useSelector(
    (state: RootState) => state?.auth
  );
  const [initialVariantData, setInitialVariantData] = useState<{ variants: IVariant[] } | null>(null);
  const [activeSection, setActiveSection] = useState("sec-basics");
  const [showVariantBuilder, setShowVariantBuilder] = useState(false);

  const router = useRouter();
  const params = useParams();

  const productIdRaw = params?.productId;
  const productId = Array.isArray(productIdRaw) ? productIdRaw[0] : productIdRaw;
  const isEdit = !!productId && productId !== "new";

  const { addOrUpdateProduct, loading } = useAddProduct();

  const {
    formattedData: productData,
    loading: productLoading,
    error: productError,
  } = useFetch<{ data: any }, IProductForm>({
    url: isEdit ? `${products.getProducts}/${productId}` : "",
    formatter: (res) => {
      const product = (res as any)?.data ?? res;
      if (!product) return initialValues;

      if (product.is_resource) {
        return {
          name: product.name ?? "",
          is_resource: true,
          resource_name: product.resource_name ?? "",
          resource_unit: product.resource_unit ?? "",
          resource_cost_per_unit: product.resource_cost_per_unit ?? 0,
          has_style: false,
        } as IProductForm;
      }

      const hasVariants =
        Array.isArray(product.product_details?.variants) &&
        product.product_details.variants.length > 0;

      return {
        name: product.name ?? "",
        is_resource: false,
        product_details: {
          unit: product.product_details?.unit ?? "",
          base_sku: product.product_details?.base_sku ?? "",
          description: product.product_details?.description ?? "",
          variants: product.product_details?.variants ?? [],
          attribute_definitions: product.product_details?.attribute_definitions ?? [],
        },
        sales_info: {
          account: product.sales_info?.account ?? "",
          selling_price: product.sales_info?.selling_price ?? 0,
          currency: product.sales_info?.currency ?? "INR",
          description: product.sales_info?.description ?? "",
        },
        purchase_info: {
          account: product.purchase_info?.account ?? "",
          cost_price: product.purchase_info?.cost_price ?? 0,
          currency: product.purchase_info?.currency ?? "INR",
          description: product.purchase_info?.description ?? "",
        },
        ...(product.inventory ? { _inventory: product.inventory } : {}),
        has_style: hasVariants,
        _meta: {
          id: product.id,
          created_at: product.created_at,
          updated_at: product.updated_at,
          user_name: product.user_name,
          company_name: product.company_name,
        },
      } as IProductForm & { _meta?: any; _inventory?: any };
    },
    options: { skip: !isEdit },
  });

  useEffect(() => {
    if (productData?.product_details?.variants && Array.isArray(productData.product_details.variants)) {
      setInitialVariantData({
        variants: productData.product_details.variants.map(convertProductVariantToUIVariant),
      });
    }
  }, [productData]);

  const handleProductSubmit = async (values: IProductForm) => {
    try {
      let submitValues = values;

      if (!values.is_resource && initialVariantData?.variants?.length) {
        submitValues = {
          ...values,
          product_details: {
            ...(values.product_details || {}),
            variants: initialVariantData.variants.map(convertUIVariantToProductVariant),
          },
        };
      }

      if (values.is_resource) {
        submitValues = {
          name: values.name,
          is_resource: true,
          resource_name: values.resource_name || "",
          resource_unit: values.resource_unit || "",
          resource_cost_per_unit: values.resource_cost_per_unit || 0,
          product_details: { unit: values.resource_unit || "" },
        } as IProductForm;
      }

      const response = await addOrUpdateProduct(submitValues, isEdit ? productId : undefined);
      if (response.success) {
        showToastMessage(response.message || (isEdit ? "Product updated!" : "Product created!"), "success");
        setTimeout(() => router.push("/products"), 100);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };

  const handleVariantSave = (data: { variants: IVariant[] }) => {
    setInitialVariantData({ variants: data.variants });
    showToastMessage("Variants saved!", "success");
  };

  if (isEdit && productLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: T.bg,
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={28} thickness={3.5} sx={{ color: T.indigo }} />
        <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
          Loading product…
        </Typography>
      </Box>
    );
  }

  const formInitialValues = isEdit && productData ? productData : initialValues;

  return (
    <Box sx={{ background: T.bg, minHeight: "100vh" }}>
      <BBLoader enabled={authLoading} />

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: { xs: 2, md: 4 }, minHeight: 60 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              component="button"
              type="button"
              onClick={() => router.back()}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                background: "none",
                border: `1px solid ${T.border}`,
                cursor: "pointer",
                color: T.textMuted,
                fontWeight: 500,
                fontSize: "0.8rem",
                px: 1.25,
                py: 0.6,
                borderRadius: T.r1,
                fontFamily: "inherit",
                transition: "all 0.15s",
                "&:hover": { background: T.surfaceAlt, color: T.textPrimary, borderColor: "#d0d5dd" },
              }}
            >
              <ArrowLeft size={13} />
              Back
            </Box>

            <Box sx={{ width: 1, height: 20, background: T.border }} />

            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {isEdit ? "Edit Product" : "New Product"}
              </Typography>
              {isEdit && productId && (
                <Typography sx={{ fontSize: "0.7rem", color: T.textXMuted, fontFamily: "monospace", mt: 0.25 }}>
                  #{productId}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Breadcrumb hint */}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            <Typography sx={{ fontSize: "0.78rem", color: T.textXMuted }}>Products</Typography>
            <ChevronRight size={12} color={T.textXMuted} />
            <Typography sx={{ fontSize: "0.78rem", color: T.textSecondary, fontWeight: 500 }}>
              {isEdit ? "Edit" : "New"}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* ── Formik ──────────────────────────────────────────────────────────── */}
      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleProductSubmit}
      >
        {({ handleSubmit, values }) => {
          const isResource = values.is_resource === true;
          const sections = isResource ? RESOURCE_SECTIONS : REGULAR_SECTIONS;
          const meta = (values as any)._meta;
          const inventory = (values as any)._inventory;
          const margin =
            (values.sales_info?.selling_price || 0) - (values.purchase_info?.cost_price || 0);
          const marginPct =
            values.sales_info?.selling_price
              ? ((margin / values.sales_info.selling_price) * 100).toFixed(1)
              : null;

          return (
            <Form onSubmit={handleSubmit}>
              {/* Floating action buttons */}
              <Box
                sx={{
                  position: "fixed",
                  top: 12,
                  right: 20,
                  zIndex: 200,
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => router.back()}
                  sx={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    cursor: "pointer",
                    color: T.textSecondary,
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    px: 1.75,
                    py: 0.7,
                    borderRadius: T.r2,
                    fontFamily: "inherit",
                    boxShadow: T.shadowXs,
                    transition: "all 0.15s",
                    "&:hover": { background: T.surfaceAlt, borderColor: "#d0d5dd" },
                  }}
                >
                  Cancel
                </Box>
                <BBButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  loading={loading}
                  sx={{
                    borderRadius: T.r2,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`,
                    fontSize: "0.8rem",
                    px: 2.25,
                    height: 36,
                    boxShadow: `0 1px 2px rgba(99,102,241,0.3), 0 0 0 0 ${T.indigo}`,
                    letterSpacing: "-0.01em",
                    transition: "all 0.15s",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${T.indigoDark} 0%, #4338ca 100%)`,
                      boxShadow: `0 4px 12px rgba(99,102,241,0.4)`,
                      transform: "translateY(-1px)",
                    },
                    "&:active": { transform: "translateY(0)" },
                  }}
                >
                  {loading ? "Saving…" : isEdit ? "Save Changes" : `Create ${isResource ? "Resource" : "Product"}`}
                </BBButton>
              </Box>

              {/* ── Three-column layout ──────────────────────────────────────── */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "200px 1fr 248px" },
                  maxWidth: 1320,
                  mx: "auto",
                  px: { xs: 2, md: 3 },
                  pt: 4,
                  pb: 12,
                  gap: 3,
                }}
              >
                {/* ── LEFT: Section nav ──────────────────────────────────────── */}
                <Box sx={{ display: { xs: "none", lg: "block" } }}>
                  <Box sx={{ position: "sticky", top: 76 }}>
                    <Card sx={{ p: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: T.textXMuted,
                          px: 1.5,
                          pt: 1,
                          pb: 0.75,
                          display: "block",
                        }}
                      >
                        Sections
                      </Typography>
                      <Stack spacing={0.25}>
                        {sections.map((s) => (
                          <NavItem
                            key={s.id}
                            icon={s.icon}
                            label={s.label}
                            active={activeSection === s.id}
                            onClick={() => {
                              setActiveSection(s.id);
                              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                          />
                        ))}
                        {!isResource && values.has_style && (
                          <NavItem
                            icon={<Layers size={14} />}
                            label="Variants"
                            active={activeSection === "sec-variants"}
                            badge={initialVariantData?.variants?.length ? String(initialVariantData.variants.length) : undefined}
                            onClick={() => {
                              setActiveSection("sec-variants");
                              setShowVariantBuilder(true);
                              document.getElementById("sec-variants")?.scrollIntoView({ behavior: "smooth" });
                            }}
                          />
                        )}
                      </Stack>
                    </Card>
                  </Box>
                </Box>

                {/* ── CENTER: Form ───────────────────────────────────────────── */}
                <Box sx={{ minWidth: 0 }}>
                  {productError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: T.r2 }}>
                      Failed to load product. Please refresh.
                    </Alert>
                  )}
                  {authError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: T.r2 }}>
                      {authError}
                    </Alert>
                  )}

                  {/* ── BASICS ─────────────────────────────────────────────── */}
                  <Box id="sec-basics" component="section" sx={{ mb: 3 }}>
                    <Card>
                      <CardHeader
                        title="Basic Information"
                        subtitle="Core product identity and configuration"
                      />
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={2.5} component="div">
                          <Grid size={{ xs: 12 }} component="div">
                            <BBInput
                              name="name"
                              label="Product Name"
                              placeholder="e.g., 500ml PET Cap"
                              disabled={authLoading}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }} component="div">
                            <BBInput
                              name="product_details.base_sku"
                              label="Base SKU"
                              placeholder="e.g., CP-500"
                              disabled={isResource}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }} component="div">
                            <BBInput
                              name="product_details.unit"
                              label="Unit"
                              placeholder="pieces, kg, liter…"
                              disabled={isResource}
                            />
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 3, borderColor: T.border }} />

                        <Stack spacing={1.5}>
                          <ToggleCard
                            icon={<Zap size={15} color={isResource ? T.violet : T.textXMuted} />}
                            label="Resource Product"
                            description="Consumption-based item (water, electricity). No inventory tracking."
                            active={isResource}
                            accentColor={T.violet}
                            accentBg={T.violetBg}
                            name="is_resource"
                          />
                          {!isResource && (
                            <ToggleCard
                              icon={<Layers size={15} color={values.has_style ? T.green : T.textXMuted} />}
                              label="Has Style Variants"
                              description="Manage size, colour, or other variant combinations."
                              active={!!values.has_style}
                              accentColor={T.green}
                              accentBg={T.greenBg}
                              name="has_style"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Card>
                  </Box>

                  {/* ── RESOURCE CONFIG ────────────────────────────────────── */}
                  {isResource && (
                    <Box id="sec-resource" component="section" sx={{ mb: 3 }}>
                      <Card>
                        <CardHeader
                          title="Resource Configuration"
                          subtitle="Unit and cost settings for this consumption-based resource"
                        />
                        <Box sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              p: 2,
                              borderRadius: T.r2,
                              background: "#eff8ff",
                              border: "1px solid #b2ddff",
                              mb: 3,
                            }}
                          >
                            <Zap size={15} color="#0077b6" style={{ marginTop: 2, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "0.8rem", color: "#0077b6", lineHeight: 1.5 }}>
                              Resource products track consumption (Water, Electricity, Gas) and don't support inventory or variants.
                            </Typography>
                          </Box>
                          <Grid container spacing={2.5} component="div">
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="resource_name" label="Resource Name" placeholder="e.g., Electricity" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="resource_unit" label="Unit of Measurement" placeholder="kWh, liter…" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="resource_cost_per_unit" label="Cost Per Unit" type="number" />
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </Box>
                  )}

                  {/* ── PRICING ────────────────────────────────────────────── */}
                  {!isResource && (
                    <Box id="sec-pricing" component="section" sx={{ mb: 3 }}>
                      <Card>
                        <CardHeader
                          title="Pricing"
                          subtitle="Selling price, cost, and account assignments"
                        />
                        <Box sx={{ p: 3 }}>
                          {/* Sales */}
                          <SectionLabel color={T.green}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: T.green,
                                display: "inline-block",
                              }}
                            />
                            Sales
                          </SectionLabel>
                          <Grid container spacing={2.5} component="div" sx={{ mb: 3.5 }}>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="sales_info.selling_price" label="Selling Price (₹)" type="number" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="sales_info.currency" label="Currency" placeholder="INR" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="sales_info.account" label="Sales Account" />
                            </Grid>
                          </Grid>

                          {/* Divider with label */}
                          <Box sx={{ position: "relative", mb: 3 }}>
                            <Divider sx={{ borderColor: T.border }} />
                          </Box>

                          {/* Purchase */}
                          <SectionLabel color={T.amber}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: T.amber,
                                display: "inline-block",
                              }}
                            />
                            Purchase
                          </SectionLabel>
                          <Grid container spacing={2.5} component="div">
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="purchase_info.cost_price" label="Cost Price (₹)" type="number" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="purchase_info.currency" label="Currency" placeholder="INR" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} component="div">
                              <BBInput name="purchase_info.account" label="Purchase Account" />
                            </Grid>
                          </Grid>

                          {/* Margin bar */}
                          {margin !== 0 && marginPct !== null && (
                            <Box
                              sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: T.r2,
                                background: margin >= 0 ? T.greenBg : T.redBg,
                                border: `1px solid ${margin >= 0 ? "#a9efc5" : "#fecaca"}`,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <TrendingUp
                                size={16}
                                color={margin >= 0 ? T.green : T.red}
                                style={{ flexShrink: 0 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontSize: "0.78rem",
                                    color: margin >= 0 ? "#027a48" : "#9b1c1c",
                                    fontWeight: 600,
                                  }}
                                >
                                  Gross Margin: ₹{Math.abs(margin).toFixed(2)} ({marginPct}%)
                                </Typography>
                                <Box
                                  sx={{
                                    mt: 0.75,
                                    height: 4,
                                    borderRadius: 2,
                                    background: margin >= 0 ? "#d1fadf" : "#fee2e2",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: "100%",
                                      width: `${Math.min(100, Math.abs(parseFloat(marginPct)))}%`,
                                      background: margin >= 0 ? T.green : T.red,
                                      borderRadius: 2,
                                      transition: "width 0.4s ease",
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    </Box>
                  )}

                  {/* ── INVENTORY ──────────────────────────────────────────── */}
                  {!isResource && (
                    <Box id="sec-inventory" component="section" sx={{ mb: 3 }}>
                      <Card>
                        <CardHeader
                          title="Inventory"
                          subtitle="Tracking method and storage account"
                        />
                        <Box sx={{ p: 3 }}>
                          {inventory ? (
                            <Grid container spacing={2} component="div">
                              <Grid size={{ xs: 12, sm: 4 }} component="div">
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: T.r2,
                                    background: inventory.track_inventory ? T.greenBg : T.surfaceAlt,
                                    border: `1px solid ${inventory.track_inventory ? "#a9efc5" : T.border}`,
                                  }}
                                >
                                  <SectionLabel color={inventory.track_inventory ? "#027a48" : T.textXMuted}>
                                    Tracking
                                  </SectionLabel>
                                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: inventory.track_inventory ? T.green : T.textXMuted }}>
                                    {inventory.track_inventory ? "Enabled" : "Disabled"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }} component="div">
                                <Box sx={{ p: 2, borderRadius: T.r2, background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                  <SectionLabel>Inventory Account</SectionLabel>
                                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary }}>
                                    {inventory.inventory_account || "—"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }} component="div">
                                <Box sx={{ p: 2, borderRadius: T.r2, background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                  <SectionLabel>Valuation Method</SectionLabel>
                                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary }}>
                                    {inventory.inventory_valuation_method || "—"}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          ) : (
                            <Box
                              sx={{
                                py: 4,
                                borderRadius: T.r2,
                                border: `2px dashed ${T.border}`,
                                textAlign: "center",
                              }}
                            >
                              <BarChart2 size={24} color={T.textXMuted} style={{ marginBottom: 8 }} />
                              <Typography sx={{ fontSize: "0.82rem", color: T.textMuted }}>
                                Inventory settings appear after the product is created.
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    </Box>
                  )}

                  {/* ── DESCRIPTIONS ───────────────────────────────────────── */}
                  {!isResource && (
                    <Box id="sec-desc" component="section" sx={{ mb: 3 }}>
                      <Card>
                        <CardHeader
                          title="Descriptions"
                          subtitle="Optional notes for sales, purchasing, and product details"
                        />
                        <Box sx={{ p: 3 }}>
                          <Stack spacing={3}>
                            <Box>
                              <SectionLabel color={T.green}>Sales Description</SectionLabel>
                              <BBRichTextEditor
                                name="sales_info.description"
                                label=""
                                placeholder="Describe this product to buyers…"
                              />
                            </Box>
                            <Divider sx={{ borderColor: T.border }} />
                            <Box>
                              <SectionLabel color={T.amber}>Purchase Description</SectionLabel>
                              <BBRichTextEditor
                                name="purchase_info.description"
                                label=""
                                placeholder="Notes for purchasing this product…"
                              />
                            </Box>
                            <Divider sx={{ borderColor: T.border }} />
                            <Box>
                              <SectionLabel>Product Description</SectionLabel>
                              <BBRichTextEditor
                                name="product_details.description"
                                label=""
                                placeholder="Full product details…"
                              />
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    </Box>
                  )}

                  {/* ── VARIANTS ───────────────────────────────────────────── */}
                  {!isResource && values.has_style && (
                    <Box id="sec-variants" component="section" sx={{ mb: 3 }}>
                      <Card>
                        <CardHeader
                          title="Style Variants"
                          subtitle="Define size, colour, or custom attribute combinations"
                        />
                        <Box sx={{ p: 3 }}>
                          <VariantBuilder
                            initialData={initialVariantData || undefined}
                            onSave={handleVariantSave}
                          />
                        </Box>
                      </Card>
                    </Box>
                  )}
                </Box>

                {/* ── RIGHT: Sidebar ─────────────────────────────────────────── */}
                <Box sx={{ display: { xs: "none", lg: "block" } }}>
                  <Box sx={{ position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 2 }}>

                    {/* Summary card */}
                    <Card>
                      <CardHeader title="Summary" />
                      <Box sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          {values.name && (
                            <Box>
                              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.textXMuted, mb: 0.5 }}>
                                Name
                              </Typography>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.3 }}>
                                {values.name}
                              </Typography>
                            </Box>
                          )}

                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={isResource ? "Resource" : "Product"}
                              sx={{
                                fontSize: "0.68rem",
                                height: 20,
                                background: isResource ? T.violetBg : T.indigoLight,
                                color: isResource ? T.violet : T.indigo,
                                fontWeight: 700,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                            {!isResource && values.has_style && (
                              <Chip
                                size="small"
                                label="Has Variants"
                                sx={{
                                  fontSize: "0.68rem",
                                  height: 20,
                                  background: T.greenBg,
                                  color: T.green,
                                  fontWeight: 700,
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            )}
                          </Stack>

                          {!isResource && values.product_details?.base_sku && (
                            <MetaRow label="SKU" value={values.product_details.base_sku} />
                          )}
                          {!isResource && values.product_details?.unit && (
                            <MetaRow label="Unit" value={values.product_details.unit} />
                          )}

                          {/* Pricing breakdown */}
                          {!isResource && (values.sales_info?.selling_price || values.purchase_info?.cost_price) && (
                            <Box>
                              <Divider sx={{ borderColor: T.border, mb: 2 }} />
                              <Stack spacing={1.25}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: T.green }} />
                                    <Typography sx={{ fontSize: "0.78rem", color: T.textMuted }}>Selling</Typography>
                                  </Box>
                                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: T.green }}>
                                    ₹{(values.sales_info?.selling_price || 0).toFixed(2)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: T.amber }} />
                                    <Typography sx={{ fontSize: "0.78rem", color: T.textMuted }}>Cost</Typography>
                                  </Box>
                                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: T.amber }}>
                                    ₹{(values.purchase_info?.cost_price || 0).toFixed(2)}
                                  </Typography>
                                </Stack>
                                <Divider sx={{ borderColor: T.border }} />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography sx={{ fontSize: "0.78rem", color: T.textMuted, fontWeight: 600 }}>
                                    Margin
                                  </Typography>
                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.9rem",
                                        fontWeight: 800,
                                        color: margin >= 0 ? T.indigo : T.red,
                                        lineHeight: 1,
                                      }}
                                    >
                                      ₹{margin.toFixed(2)}
                                    </Typography>
                                    {marginPct && (
                                      <Typography sx={{ fontSize: "0.68rem", color: margin >= 0 ? T.indigo : T.red, fontWeight: 600, mt: 0.25 }}>
                                        {marginPct}%
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Card>

                    {/* Record info — edit mode only */}
                    {isEdit && meta && (
                      <Card>
                        <CardHeader title="Record Info" />
                        <Box sx={{ p: 2.5 }}>
                          <Stack spacing={1.75}>
                            <MetaRow label="Product ID" value={meta.id} />
                            {meta.company_name && <MetaRow label="Company" value={meta.company_name} />}
                            {meta.user_name && <MetaRow label="Created by" value={meta.user_name} />}
                            {meta.created_at && (
                              <MetaRow
                                label="Created"
                                value={new Date(meta.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              />
                            )}
                            {meta.updated_at && (
                              <MetaRow
                                label="Last updated"
                                value={new Date(meta.updated_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Card>
                    )}
                  </Box>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default AddProduct;