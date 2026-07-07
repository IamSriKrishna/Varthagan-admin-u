"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Card, Stack, Typography, Button,
  TextField, Select, MenuItem, Chip, LinearProgress,
  Tooltip, IconButton, Switch, InputAdornment, RadioGroup, FormControlLabel, Radio,
} from "@mui/material";
import { BBButton } from "@/lib";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft, Plus, Trash2, Package, Tag,
  DollarSign, Layers, ChevronRight, Check,
  TrendingUp, Wand2, RefreshCw, Copy, Settings,
} from "lucide-react";
import { showToastMessage } from "@/utils/toastUtil";
import { productService, CreateProductRequest } from "@/lib/api/productService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttributeDefinitionForm {
  key: string;
  options: string[];
}

interface VariantForm {
  sku: string;
  variant_name: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level?: number;
  is_active: boolean;
  /** internal: true when user has manually typed a SKU (stops auto-derive) */
  _skuManual?: boolean;
  /** internal: true when user has manually typed a variant name */
  _nameManual?: boolean;
}

interface ProductFormData {
  name: string;
  is_resource: boolean;
  is_raw: boolean;
  resource_name?: string;
  resource_unit?: string;
  resource_cost_per_unit?: number;
  raw_name?: string;
  raw_specification?: string;
  required_gram_per_unit?: number;
  raw_cost_per_unit?: number;
  unit: string;
  base_unit: string;
  purchase_unit: string;
  conversion_factor: number;
  base_sku: string;
  consumption_per_unit: number;
  upc?: string;
  ean?: string;
  mpn?: string;
  description: string;
  selling_account: string;
  selling_price: number;
  purchase_account: string;
  cost_price: number;
  track_inventory: boolean;
  inventory_account: string;
  inventory_valuation_method: string;
  reorder_point: number;
  attribute_definitions: AttributeDefinitionForm[];
  variants: VariantForm[];
}

// ─── SKU Generation Utilities ─────────────────────────────────────────────────

function toSkuToken(value: string): string {
  const abbrevMap: Record<string, string> = {
    "extra small": "XS",  "small": "SM",    "medium": "MD",
    "large": "LG",        "extra large": "XL", "xxl": "XXL",
    "red": "RED",   "blue": "BLU",  "green": "GRN",  "yellow": "YLW",
    "black": "BLK", "white": "WHT", "grey": "GRY",   "gray": "GRY",
    "orange": "ORG","purple": "PRP","pink": "PNK",   "brown": "BRN",
    "silver": "SLV","gold": "GLD",
  };

  const lower = value.toLowerCase().trim();
  if (abbrevMap[lower]) return abbrevMap[lower];

  const unitMatch = value.match(/^(\d+(?:\.\d+)?)\s*(ml|l|kg|g|cm|mm|m|oz|lb|in|ft)$/i);
  if (unitMatch) return `${unitMatch[1]}${unitMatch[2].toUpperCase()}`;

  const words = value.trim().split(/\s+/);
  if (words.length > 1) return words.map((w) => w[0]).join("").toUpperCase().slice(0, 4);

  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
}

export function buildSkuPrefix(name: string, baseSku: string): string {
  if (baseSku.trim()) return baseSku.trim().toUpperCase();
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "PRD";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.map((w) => w[0]).join("").toUpperCase();
}

function cartesian<T>(arrays: T[][]): T[][] {
  if (!arrays.length) return [[]];
  return arrays.reduce<T[][]>(
    (acc, cur) => acc.flatMap((row) => cur.map((val) => [...row, val])),
    [[]]
  );
}

function generateVariants(
  name: string,
  baseSku: string,
  attrDefs: AttributeDefinitionForm[],
  defaultCost: number,
  defaultSelling: number
): VariantForm[] {
  const prefix = buildSkuPrefix(name, baseSku);
  const usable = attrDefs.filter((a) => a.options.length > 0);
  if (!usable.length) return [];

  const combinations = cartesian(usable.map((a) => a.options));

  return combinations.map((combo) => {
    const attribute_map: Record<string, string> = {};
    usable.forEach((a, i) => { attribute_map[a.key] = combo[i]; });

    const sku = [prefix, ...combo.map(toSkuToken)].join("-");
    const variant_name = combo.join(" / ");

    return {
      sku,
      variant_name,
      attribute_map,
      cost_price: defaultCost,
      selling_price: defaultSelling,
      stock_quantity: 0,
      is_active: true,
    };
  });
}

// ─── Validation ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  is_resource: Yup.boolean(),
  is_raw: Yup.boolean(),
  resource_name: Yup.string().when("is_resource", {
    is: true,
    then: (schema) => schema.required("Resource Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  resource_unit: Yup.string().when("is_resource", {
    is: true,
    then: (schema) => schema.required("Resource Unit is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  resource_cost_per_unit: Yup.number().when("is_resource", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Cost must be a number")
        .required("Resource Cost Per Unit is required")
        .min(0, "Cost must be at least 0"),
    otherwise: (schema) => schema.notRequired(),
  }),
  raw_name: Yup.string().when("is_raw", {
    is: true,
    then: (schema) => schema.required("Raw Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  raw_specification: Yup.string().when("is_raw", {
    is: true,
    then: (schema) => schema.required("Raw Specification is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  required_gram_per_unit: Yup.number().when("is_raw", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Required gram per unit must be a number")
        .required("Required gram per unit is required")
        .min(0, "Must be at least 0"),
    otherwise: (schema) => schema.notRequired(),
  }),
  raw_cost_per_unit: Yup.number().when("is_raw", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Cost must be a number")
        .required("Raw Cost Per Unit is required")
        .min(0, "Cost must be at least 0"),
    otherwise: (schema) => schema.notRequired(),
  }),
  unit: Yup.string().when("is_resource", {
    is: false,
    then: (schema) => Yup.string().when("is_raw", {
      is: false,
      then: (s) => s.required("Unit is required"),
      otherwise: (s) => s.notRequired(),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
  base_sku: Yup.string().when("is_resource", {
    is: false,
    then: (schema) => Yup.string().when("is_raw", {
      is: false,
      then: (s) => s.required("Base SKU is required"),
      otherwise: (s) => s.notRequired(),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
  consumption_per_unit: Yup.number().when("is_resource", {
    is: false,
    then: (schema) => Yup.number().when("is_raw", {
      is: false,
      then: (s) => s.min(0, "Consumption per unit must be at least 0"),
      otherwise: (s) => s.notRequired(),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
  upc: Yup.string().optional(),
  ean: Yup.string().optional(),
  mpn: Yup.string().optional(),
  base_unit: Yup.string().optional(),
  purchase_unit: Yup.string().optional(),
  conversion_factor: Yup.number().optional(),
 
  selling_price: Yup.number().when("is_resource", {
    is: false,
    then: (schema) => Yup.number().when("is_raw", {
      is: false,
      then: (s) => s.required("Selling price is required").min(0),
      otherwise: (s) => s.notRequired(),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
  cost_price: Yup.number().when("is_resource", {
    is: false,
    then: (schema) => Yup.number().when("is_raw", {
      is: false,
      then: (s) => s.required("Cost price is required").min(0),
      otherwise: (s) => s.notRequired(),
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const initialValues: ProductFormData = {
  name: "",
  is_resource: false,
  is_raw: false,
  resource_name: "",
  resource_unit: "",
  resource_cost_per_unit: 0,
  raw_name: "",
  raw_specification: "",
  required_gram_per_unit: 0,
  raw_cost_per_unit: 0,
  unit: "pieces",
  base_unit: "gram",
  purchase_unit: "kg",
  conversion_factor: 1000,
  base_sku: "",
  consumption_per_unit: 1,
  upc: "",
  ean: "",
  mpn: "",
  description: "",
  selling_account: "SALES_REVENUE",
  selling_price: 0,
  purchase_account: "PURCHASE_EXPENSE",
  cost_price: 0,
  track_inventory: true,
  inventory_account: "Raw Materials",
  inventory_valuation_method: "FIFO",
  reorder_point: 0,
  attribute_definitions: [],
  variants: [],
};

const STEPS = [
  { label: "Product Info", icon: Package,    description: "Basic details & identifiers" },
  { label: "Pricing",      icon: DollarSign, description: "Accounts & price points"     },
  { label: "Inventory",    icon: Settings,   description: "Stock tracking & reorder"    },
  { label: "Variants",     icon: Layers,     description: "Attributes & SKU variants"   },
];

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  brand: "#4f63d2",
  brand2: "#0ea5e9",
  gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  gradientHover: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
  brandSoft: "#f0f4ff",
  brandMid: "#dbeafe",
  success: "#16A34A",
  successSoft: "#F0FDF4",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  text: "#1a1d2e",
  textMid: "#6b7280",
  textLight: "#9ca3af",
  border: "#eeeff5",
  border2: "#f0f0f5",
  bg: "#f8f9fc",
  white: "#ffffff",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: C.white,
    fontSize: "0.875rem",
    fontFamily: "'DM Sans', sans-serif",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#c7d2fe" },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { fontFamily: "'DM Sans', sans-serif" },
};

const selectSx = {
  borderRadius: "10px",
  fontSize: "0.875rem",
  fontFamily: "'DM Sans', sans-serif",
  backgroundColor: C.white,
  "& fieldset": { borderColor: C.border },
  "&:hover fieldset": { borderColor: "#c7d2fe" },
  "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
};

const cardSx = {
  borderRadius: "16px",
  border: `1px solid ${C.border}`,
  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
  overflow: "hidden",
  bgcolor: C.white,
};

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <Box sx={{ p: 3, borderBottom: `1px solid ${C.border2}`, bgcolor: "#fafbff", display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "9px", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color="white" />
      </Box>
      <Box>
        <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, color: C.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.75rem", color: C.textLight, fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>{subtitle}</Typography>}
      </Box>
    </Box>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700, fontSize: "0.78rem", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {children}
      {required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="caption" sx={{ color: C.textMid, display: "block", mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: color ?? C.text }}>{value}</Typography>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrOption, setNewAttrOption] = useState("");
  const [editingAttrIdx, setEditingAttrIdx] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<Partial<VariantForm>>({
    attribute_map: {}, stock_quantity: 0, is_active: true,
  });
  const [resourceNameEdited, setResourceNameEdited] = useState(false);
  const [rawNameEdited, setRawNameEdited] = useState(false);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (values: ProductFormData) => {
    try {
      setLoading(true);

      if (values.is_resource) {
        // Resource product payload
        const payload: any = {
          name: values.name,
          is_resource: true,
          resource_name: values.resource_name || "",
          resource_unit: values.resource_unit || "",
          resource_cost_per_unit: values.resource_cost_per_unit || 0,
          product_details: {
            unit: values.resource_unit || "",
          },
        };

        const response = await productService.createProduct(payload);
        if (response?.id) {
          showToastMessage("Resource created successfully!", "success");
          router.push("/products");
        } else {
          showToastMessage("Failed to create resource", "error");
        }
      } else if (values.is_raw) {
        // Raw product payload
        const payload: any = {
          name: values.name,
          is_raw: true,
          raw_name: values.raw_name || "",
          raw_specification: values.raw_specification || "",
          required_gram_per_unit: values.required_gram_per_unit || 0,
          raw_cost_per_unit: values.raw_cost_per_unit || 0,
        };

        const response = await productService.createProduct(payload);
        if (response?.id) {
          showToastMessage("Raw product created successfully!", "success");
          router.push("/products");
        } else {
          showToastMessage("Failed to create raw product", "error");
        }
      } else {
        // Regular product payload
        const markup = values.cost_price > 0
          ? ((values.selling_price - values.cost_price) / values.cost_price) * 100 : 0;

        // Auto-set consumption_per_unit based on unit
        const consumption = values.unit === "pieces" ? 1 : values.consumption_per_unit;

        const payload: CreateProductRequest = {
          name: values.name,
          is_resource: false,
          is_raw: false,
          consumption_per_unit: consumption,
          // Include unit conversion fields only for kg
          ...(values.unit === "kg" && {
            base_unit: values.base_unit || "gram",
            purchase_unit: values.purchase_unit || "kg",
            conversion_factor: values.conversion_factor || 1000,
          }),
          product_details: {
            unit: values.unit,
            base_sku: values.base_sku,
            variants: values.variants.map((v) => ({
              sku: v.sku,
              variant_name: v.variant_name,
              attribute_map: v.attribute_map,
              selling_price: v.selling_price,
              cost_price: v.cost_price,
              stock_quantity: v.stock_quantity,
              is_active: v.is_active,
            })),
          },
          sales_info: {
            account: values.selling_account,
            selling_price: values.selling_price,
            currency: "INR",
          },
          purchase_info: {
            account: values.purchase_account,
            cost_price: values.cost_price,
            currency: "INR",
          },
          inventory: {
            track_inventory: values.track_inventory,
            inventory_account: values.inventory_account,
            inventory_valuation_method: values.inventory_valuation_method,
            reorder_point: values.reorder_point,
          },
          return_policy: {
            returnable: false,
          },
        };

        const response = await productService.createProduct(payload);
        if (response?.id) {
          showToastMessage("Product created successfully!", "success");
          router.push("/products");
        } else {
          showToastMessage("Failed to create product", "error");
        }
      }
    } catch (err: any) {
      showToastMessage(err?.message ?? "Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sticky page header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          px: 3,
          pt: 2.5,
          pb: 2,
          bgcolor: C.white,
          borderBottom: `1px solid ${C.border2}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: C.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
              flexShrink: 0,
            }}
          >
            <Package size={20} color="white" />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: C.text,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.3px",
                lineHeight: 1.2,
              }}
            >
              New Product
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: C.textLight, fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>
              Create product details, pricing, inventory and variants
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <BBButton
            variant="outlined"
            onClick={() => router.back()}
            startIcon={<ArrowLeft size={16} />}
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: C.textMid,
              borderColor: "#e5e7eb",
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
            }}
          >
            Products
          </BBButton>

          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: C.brand, fontFamily: "'DM Sans', sans-serif", bgcolor: C.brandSoft, border: "1px solid #c7d2fe", px: 1.5, py: 0.75, borderRadius: "999px" }}>
            Step {step + 1} of {STEPS.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3, pt: 2.5, pb: 4 }}>

        {/* Step tracker */}
        <Card sx={{ ...cardSx, mb: 2.5 }}>
          <LinearProgress variant="determinate" value={((step + 1) / STEPS.length) * 100}
            sx={{ height: 3, backgroundColor: C.border2, "& .MuiLinearProgress-bar": { background: C.gradient } }} />
          <Stack direction="row">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <Box key={i} onClick={() => isDone && setStep(i)} sx={{
                  flex: 1, p: 2.5, cursor: isDone ? "pointer" : "default",
                  borderRight: i < STEPS.length - 1 ? `1px solid ${C.border2}` : "none",
                  backgroundColor: isActive ? C.brandSoft : C.white,
                  transition: "background 0.2s",
                  "&:hover": isDone ? { backgroundColor: C.brandMid } : {},
                }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? C.gradient : isActive ? C.brandMid : C.bg, flexShrink: 0 }}>
                      {isDone ? <Check size={14} color={C.white} /> : <Icon size={14} color={isActive ? C.brand : C.textLight} />}
                    </Box>
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? C.brand : isDone ? C.text : C.textMid, fontSize: "0.82rem", lineHeight: 1.2 }}>
                        {s.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.textLight, fontSize: "0.72rem" }}>{s.description}</Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Card>

        {/* Formik */}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, setFieldValue, validateForm }) => {

            // SKU generation handlers
            const handleGenerateAll = () => {
              if (!values.name && !values.base_sku) {
                showToastMessage("Enter a product name or base SKU first (Step 1)", "error"); return;
              }
              if (!values.attribute_definitions.some((a) => a.options.length > 0)) {
                showToastMessage("Add attribute options first", "error"); return;
              }
              const generated = generateVariants(values.name, values.base_sku, values.attribute_definitions, values.cost_price, values.selling_price);
              const existingKeys = new Set(values.variants.map((v) =>
                Object.entries(v.attribute_map).sort().map(([k, val]) => `${k}:${val}`).join("|")
              ));
              const fresh = generated.filter((g) => {
                const key = Object.entries(g.attribute_map).sort().map(([k, v]) => `${k}:${v}`).join("|");
                return !existingKeys.has(key);
              });
              if (!fresh.length) { showToastMessage("All combinations already exist", "info"); return; }
              setFieldValue("variants", [...values.variants, ...fresh]);
              showToastMessage(`Generated ${fresh.length} variant${fresh.length > 1 ? "s" : ""} with auto-SKUs`, "success");
            };

            const handleRegenSkus = () => {
              const updated = values.variants.map((v) => {
                const prefix = buildSkuPrefix(values.name, values.base_sku);
                const tokens = Object.values(v.attribute_map).map(toSkuToken);
                return { ...v, sku: tokens.length ? [prefix, ...tokens].join("-") : prefix };
              });
              setFieldValue("variants", updated);
              showToastMessage("All SKUs regenerated from product name & base SKU", "success");
            };

            const totalCombos = values.attribute_definitions
              .filter((a) => a.options.length > 0)
              .reduce((acc, a) => acc * a.options.length, 1);
            const attrHasOptions = values.attribute_definitions.some((a) => a.options.length > 0);
            const previewPrefix = buildSkuPrefix(values.name, values.base_sku) || "PREFIX";

            // Build the first example SKU from first combo of each attr
            const exampleTokens = values.attribute_definitions
              .filter((a) => a.options.length > 0)
              .map((a) => toSkuToken(a.options[0]));
            const exampleSku = exampleTokens.length
              ? [previewPrefix, ...exampleTokens].join("-")
              : `${previewPrefix}-TOKEN`;

            return (
              <Form>

                {/* ══ STEP 0: Product Info ═══════════════════════════════════════════ */}
                {step === 0 && (
                  <Card sx={cardSx}>
                    <SectionHeader icon={Package} title="Product Information" subtitle="Basic details, identifiers and description" />
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        {/* Product Name + Type Selection */}
                        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                          <Box sx={{ flex: 2 }}>
                            <Label required>Product Name</Label>
                            <TextField fullWidth name="name" value={values.name}
                              onChange={(e) => {
                                handleChange(e);
                                // Auto-fill resource_name if not manually edited
                                if (!resourceNameEdited) {
                                  setFieldValue("resource_name", e.target.value);
                                }
                                // Auto-fill raw_name if not manually edited
                                if (!rawNameEdited) {
                                  setFieldValue("raw_name", e.target.value);
                                }
                              }}
                              placeholder="e.g., Water Bottle" error={touched.name && !!errors.name} helperText={touched.name && errors.name}
                              size="small" sx={inputSx} />
                          </Box>
                        </Stack>

                        {/* Product Type Radio Group */}
                        <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, mb: 1.5 }}>Product Type</Typography>
                          <RadioGroup
                            row
                            value={values.is_resource ? "resource" : values.is_raw ? "raw" : "regular"}
                            onChange={(e) => {
                              const type = e.target.value;
                              setFieldValue("is_resource", type === "resource");
                              setFieldValue("is_raw", type === "raw");
                            }}
                          >
                            <FormControlLabel value="regular" control={<Radio size="small" />} label="Regular Product" />
                            <FormControlLabel value="resource" control={<Radio size="small" />} label="Resource" />
                            <FormControlLabel value="raw" control={<Radio size="small" />} label="Raw" />
                          </RadioGroup>
                        </Box>

                        {/* Resource Product Fields */}
                        {values.is_resource && (
                          <>
                            <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: C.brandSoft, border: `1px solid ${C.brandMid}` }}>
                              <Typography variant="body2" sx={{ fontSize: "0.85rem", color: C.text }}>
                                Resource products are consumption-based items like Water, Electricity, or Natural Gas. They don't have variants.
                              </Typography>
                            </Box>
                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Resource Name</Label>
                                <TextField fullWidth name="resource_name" value={values.resource_name}
                                  onChange={(e) => {
                                    handleChange(e);
                                    setResourceNameEdited(!!e.target.value);
                                  }}
                                  placeholder="e.g., Water" error={touched.resource_name && !!errors.resource_name} helperText={touched.resource_name && errors.resource_name}
                                  size="small" sx={inputSx} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Unit of Measurement</Label>
                                <TextField fullWidth name="resource_unit" value={values.resource_unit} onChange={handleChange}
                                  placeholder="e.g., liter" error={touched.resource_unit && !!errors.resource_unit} helperText={touched.resource_unit && errors.resource_unit}
                                  size="small" sx={inputSx} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Cost Per Unit (₹)</Label>
                                <TextField fullWidth name="resource_cost_per_unit" type="number" value={values.resource_cost_per_unit} onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                                  setFieldValue("resource_cost_per_unit", value);
                                }}
                                  placeholder="e.g., 25.50" error={touched.resource_cost_per_unit && !!errors.resource_cost_per_unit} helperText={touched.resource_cost_per_unit && errors.resource_cost_per_unit}
                                  inputProps={{ step: "0.01", min: "0" }} size="small" sx={inputSx} />
                              </Box>
                            </Stack>
                          </>
                        )}

                        {/* Raw Product Fields */}
                        {values.is_raw && (
                          <>
                            <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}>
                              <Typography variant="body2" sx={{ fontSize: "0.85rem", color: C.text }}>
                                Raw products are pre-forms or raw materials like water bottle preforms. They don't have variants or pricing.
                              </Typography>
                            </Box>
                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Raw Name</Label>
                                <TextField fullWidth name="raw_name" value={values.raw_name}
                                  onChange={(e) => {
                                    handleChange(e);
                                    setRawNameEdited(!!e.target.value);
                                  }}
                                  placeholder="e.g., Water Bottle Preform" error={touched.raw_name && !!errors.raw_name} helperText={touched.raw_name && errors.raw_name}
                                  size="small" sx={inputSx} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Specification</Label>
                                <TextField fullWidth name="raw_specification" value={values.raw_specification} onChange={handleChange}
                                  placeholder="e.g., 500 ml" error={touched.raw_specification && !!errors.raw_specification} helperText={touched.raw_specification && errors.raw_specification}
                                  size="small" sx={inputSx} />
                              </Box>
                            </Stack>
                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Required Gram Per Unit</Label>
                                <TextField fullWidth type="number" inputProps={{ step: "0.1" }} name="required_gram_per_unit" value={values.required_gram_per_unit} onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                                  setFieldValue("required_gram_per_unit", value);
                                }}
                                  placeholder="e.g., 25.5" error={touched.required_gram_per_unit && !!errors.required_gram_per_unit} helperText={touched.required_gram_per_unit && errors.required_gram_per_unit}
                                  size="small" sx={inputSx} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Cost Per Unit (₹)</Label>
                                <TextField fullWidth name="raw_cost_per_unit" type="number" value={values.raw_cost_per_unit} onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                                  setFieldValue("raw_cost_per_unit", value);
                                }}
                                  placeholder="e.g., 15.75" error={touched.raw_cost_per_unit && !!errors.raw_cost_per_unit} helperText={touched.raw_cost_per_unit && errors.raw_cost_per_unit}
                                  inputProps={{ step: "0.01", min: "0" }} size="small" sx={inputSx} />
                              </Box>
                            </Stack>
                          </>
                        )}

                        {/* Regular Product Fields */}
                        {!values.is_resource && !values.is_raw && (
                          <>
                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Unit</Label>
                                <Select fullWidth name="unit" value={values.unit} 
                                  onChange={(e) => {
                                    const selectedUnit = e.target.value;
                                    handleChange(e);
                                    // Auto-set consumption_per_unit = 1 when unit is "pieces"
                                    if (selectedUnit === "pieces") {
                                      setFieldValue("consumption_per_unit", 1);
                                    }
                                  }}
                                  size="small" sx={selectSx}>
                                  <MenuItem value="pieces">Pieces</MenuItem>
                                  <MenuItem value="kg">Kilogram (kg)</MenuItem>
                                </Select>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Base SKU</Label>
                                <Tooltip title="Used as prefix when auto-generating variant SKUs" placement="top">
                                  <TextField fullWidth name="base_sku" value={values.base_sku} onChange={handleChange}
                                    placeholder="e.g., WB-001" error={touched.base_sku && !!errors.base_sku} helperText={touched.base_sku && errors.base_sku}
                                    size="small" sx={inputSx} />
                                </Tooltip>
                              </Box>
                            </Stack>

                            {values.unit === "kg" && (
                              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Base Unit</Label>
                                  <Tooltip title="The fundamental unit of measurement (e.g., gram)" placement="top">
                                    <TextField fullWidth name="base_unit" value={values.base_unit} onChange={handleChange}
                                      placeholder="e.g., gram" size="small" sx={inputSx} />
                                  </Tooltip>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Purchase Unit</Label>
                                  <Tooltip title="The unit used for purchasing (e.g., kg)" placement="top">
                                    <TextField fullWidth name="purchase_unit" value={values.purchase_unit} onChange={handleChange}
                                      placeholder="e.g., kg" size="small" sx={inputSx} />
                                  </Tooltip>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Conversion Factor</Label>
                                  <Tooltip title="Factor to convert base_unit to purchase_unit (e.g., 1000 for gram to kg)" placement="top">
                                    <TextField fullWidth name="conversion_factor" type="number" value={values.conversion_factor}
                                      onChange={(e) => {
                                        const value = e.target.value ? parseFloat(e.target.value) : 1;
                                        setFieldValue("conversion_factor", value);
                                      }}
                                      placeholder="e.g., 1000" inputProps={{ step: "1", min: "1" }} size="small" sx={inputSx} />
                                  </Tooltip>
                                </Box>
                              </Stack>
                            )}

                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label required>Consumption Per Unit</Label>
                                <Tooltip 
                                  title={values.unit === "pieces" ? "Auto-set to 1 for pieces" : "Amount consumed per item (e.g., 0.3 gram per bottle)"}
                                  placement="top">
                                  <TextField fullWidth name="consumption_per_unit" type="number" value={values.consumption_per_unit}
                                    onChange={(e) => {
                                      const value = e.target.value ? parseFloat(e.target.value) : 0;
                                      setFieldValue("consumption_per_unit", value);
                                    }}
                                    placeholder={values.unit === "pieces" ? "1" : "e.g., 0.3"}
                                    disabled={values.unit === "pieces"}
                                    error={touched.consumption_per_unit && !!errors.consumption_per_unit}
                                    helperText={touched.consumption_per_unit && errors.consumption_per_unit}
                                    inputProps={{ step: "0.01", min: "0" }} size="small" 
                                    sx={{
                                      ...inputSx,
                                      "& .MuiOutlinedInput-root.Mui-disabled": {
                                        backgroundColor: C.bg,
                                        "& fieldset": { borderColor: C.border },
                                      },
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label>UPC Code</Label>
                                <TextField fullWidth name="upc" value={values.upc} onChange={handleChange}
                                  placeholder="e.g., 8904220300001" size="small" sx={inputSx} />
                              </Box>
                            </Stack>

                            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                              <Box sx={{ flex: 1 }}>
                                <Label>EAN Code</Label>
                                <TextField fullWidth name="ean" value={values.ean} onChange={handleChange}
                                  placeholder="e.g., 8904220300001" size="small" sx={inputSx} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Label>MPN (Manufacturer Part Number)</Label>
                                <TextField fullWidth name="mpn" value={values.mpn} onChange={handleChange}
                                  placeholder="e.g., WRAP-300-001" size="small" sx={inputSx} />
                              </Box>
                            </Stack>

                            <Box>
                              <Label>Description</Label>
                              <TextField fullWidth name="description" value={values.description} onChange={handleChange}
                                placeholder="Describe the product — materials, use cases, key features…" multiline rows={4}
                                error={touched.description && !!errors.description} helperText={touched.description && errors.description}
                                size="small" sx={inputSx} />
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Card>
                )}

                {/* ══ STEP 1: Pricing ═══════════════════════════════════════════════ */}
                {step === 1 && !values.is_resource && !values.is_raw && (
                  <Stack spacing={3}>
                    <Card sx={cardSx}>
                      <SectionHeader icon={DollarSign} title="Sales Information" />
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Sales Account</Label>
                            <Select fullWidth name="selling_account" value={values.selling_account} onChange={handleChange} size="small" sx={selectSx}>
                              <MenuItem value="SALES_REVENUE">Sales Revenue</MenuItem>
                              <MenuItem value="OTHER_INCOME">Other Income</MenuItem>
                            </Select>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Selling Price (₹)</Label>
                            <TextField fullWidth name="selling_price" type="number" value={values.selling_price} onChange={handleChange}
                              inputProps={{ step: "0.01", min: "0" }} error={touched.selling_price && !!errors.selling_price}
                              helperText={touched.selling_price && errors.selling_price} size="small" sx={inputSx} />
                          </Box>
                        </Stack>
                      </Box>
                    </Card>

                    <Card sx={cardSx}>
                      <SectionHeader icon={DollarSign} title="Purchase Information" />
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Purchase Account</Label>
                            <Select fullWidth name="purchase_account" value={values.purchase_account} onChange={handleChange} size="small" sx={selectSx}>
                              <MenuItem value="PURCHASE_EXPENSE">Purchase Expense</MenuItem>
                              <MenuItem value="COST_OF_GOODS">Cost of Goods</MenuItem>
                            </Select>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Cost Price (₹)</Label>
                            <TextField fullWidth name="cost_price" type="number" value={values.cost_price} onChange={handleChange}
                              inputProps={{ step: "0.01", min: "0" }} error={touched.cost_price && !!errors.cost_price}
                              helperText={touched.cost_price && errors.cost_price} size="small" sx={inputSx} />
                          </Box>
                        </Stack>
                      </Box>
                    </Card>

                    {values.cost_price > 0 && values.selling_price > 0 && (
                      <Card sx={{ borderRadius: "16px", border: `1px solid ${C.brandMid}`, backgroundColor: C.brandSoft, boxShadow: "none", p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                          <TrendingUp size={18} color={C.brand} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: C.brand }}>Profit Summary</Typography>
                        </Stack>
                        <Stack direction="row" spacing={4}>
                          <StatBadge label="Cost" value={`₹${values.cost_price.toFixed(2)}`} />
                          <StatBadge label="Selling" value={`₹${values.selling_price.toFixed(2)}`} color={C.brand} />
                          <StatBadge label="Gross Profit" value={`₹${(values.selling_price - values.cost_price).toFixed(2)}`}
                            color={values.selling_price >= values.cost_price ? C.success : C.danger} />
                          <StatBadge label="Markup"
                            value={`${(((values.selling_price - values.cost_price) / values.cost_price) * 100).toFixed(1)}%`}
                            color={values.selling_price >= values.cost_price ? C.success : C.danger} />
                        </Stack>
                      </Card>
                    )}
                  </Stack>
                )}

                {/* ══ STEP 2: Inventory ═════════════════════════════════════════════ */}
                {step === 2 && !values.is_resource && !values.is_raw && (
                  <Stack spacing={3}>
                    <Card sx={cardSx}>
                      <SectionHeader icon={Settings} title="Inventory Configuration" subtitle="Setup inventory tracking, valuation method, and reorder points" />
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                          {/* Inventory Tracking */}
                          <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, mb: 0.5 }}>Track Inventory</Typography>
                                <Typography variant="caption" sx={{ color: C.textMid }}>Enable inventory tracking for this product</Typography>
                              </Box>
                              <Switch checked={values.track_inventory} size="small"
                                onChange={(e) => setFieldValue("track_inventory", e.target.checked)}
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": { color: C.success },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: C.success },
                                }}
                              />
                            </Stack>
                          </Box>

                          {values.track_inventory && (
                            <>
                              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Inventory Account</Label>
                                  <Select fullWidth name="inventory_account" value={values.inventory_account} onChange={handleChange} size="small" sx={selectSx}>
                                    <MenuItem value="Raw Materials">Raw Materials</MenuItem>
                                    <MenuItem value="Finished Goods">Finished Goods</MenuItem>
                                    <MenuItem value="Work in Progress">Work in Progress</MenuItem>
                                    <MenuItem value="Inventory">Inventory</MenuItem>
                                  </Select>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Valuation Method</Label>
                                  <Select fullWidth name="inventory_valuation_method" value={values.inventory_valuation_method} onChange={handleChange} size="small" sx={selectSx}>
                                    <MenuItem value="FIFO">FIFO (First In, First Out)</MenuItem>
                                    <MenuItem value="LIFO">LIFO (Last In, First Out)</MenuItem>
                                    <MenuItem value="WEIGHTED_AVERAGE">Weighted Average</MenuItem>
                                  </Select>
                                </Box>
                              </Stack>

                              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Reorder Point</Label>
                                  <Tooltip title="Minimum stock level that triggers a reorder" placement="top">
                                    <TextField fullWidth name="reorder_point" type="number" value={values.reorder_point}
                                      onChange={(e) => {
                                        const value = e.target.value ? parseInt(e.target.value) : 0;
                                        setFieldValue("reorder_point", value);
                                      }}
                                      placeholder="e.g., 10" inputProps={{ min: "0" }} size="small" sx={inputSx} />
                                  </Tooltip>
                                </Box>
                                <Box sx={{ flex: 1 }} />
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Card>

                    <Card sx={{ borderRadius: "16px", border: `1px solid ${C.brandMid}`, backgroundColor: C.brandSoft, boxShadow: "none", p: 3 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={2}>
                        <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                          <Settings size={18} color={C.brand} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: C.brand, mb: 0.5 }}>Inventory Setup Complete</Typography>
                          <Typography variant="caption" sx={{ color: C.textMid }}>Reorder points will be applied per variant in the next step. The inventory account determines where stock is tracked in your books.</Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Stack>
                )}

                {/* ══ STEP 3: Variants ══════════════════════════════════════════════ */}
                {step === 3 && !values.is_resource && !values.is_raw && (
                  <Stack spacing={3}>

                    {/* Attribute definitions */}
                    <Card sx={cardSx}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}` }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, fontSize: "1rem" }}>Attribute Definitions</Typography>
                            <Typography variant="caption" sx={{ color: C.textMid }}>
                              Define dimensions (e.g., size, color) then add options. Options drive SKU tokens.
                            </Typography>
                          </Box>
                          <Chip label={`${values.attribute_definitions.length} defined`} size="small"
                            sx={{ backgroundColor: C.brandSoft, color: C.brand, fontWeight: 600 }} />
                        </Stack>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2} mb={2}>
                          {values.attribute_definitions.map((attr, idx) => (
                            <Box key={idx} sx={{
                              borderRadius: "10px",
                              border: `1px solid ${editingAttrIdx === idx ? C.brand : C.border}`,
                              p: 2, backgroundColor: editingAttrIdx === idx ? C.brandSoft : C.bg,
                            }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Tag size={14} color={C.brand} />
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: C.text }}>{attr.key}</Typography>
                                  <Chip label={`${attr.options.length} options`} size="small"
                                    sx={{ fontSize: "0.68rem", height: 18, backgroundColor: C.brandMid, color: C.brand }} />
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                  <Button size="small" variant="text"
                                    onClick={() => setEditingAttrIdx(editingAttrIdx === idx ? null : idx)}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", color: C.brand }}>
                                    {editingAttrIdx === idx ? "Done" : "Edit"}
                                  </Button>
                                  <Button size="small" variant="text"
                                    onClick={() => {
                                      setFieldValue("attribute_definitions", values.attribute_definitions.filter((_, i) => i !== idx));
                                      if (editingAttrIdx === idx) setEditingAttrIdx(null);
                                    }}
                                    sx={{ textTransform: "none", color: C.danger, minWidth: 0 }}>
                                    <Trash2 size={14} />
                                  </Button>
                                </Stack>
                              </Stack>

                              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                {attr.options.map((opt, oi) => (
                                  <Chip key={oi} label={opt} size="small"
                                    onDelete={editingAttrIdx === idx ? () => {
                                      const updated = [...values.attribute_definitions];
                                      updated[idx] = { ...attr, options: attr.options.filter((_, i) => i !== oi) };
                                      setFieldValue("attribute_definitions", updated);
                                    } : undefined}
                                    sx={{ backgroundColor: C.brandMid, color: C.brand, fontWeight: 600, fontSize: "0.72rem", "& .MuiChip-deleteIcon": { color: C.brand } }}
                                  />
                                ))}
                                {!attr.options.length && (
                                  <Typography variant="caption" sx={{ color: C.textLight, fontStyle: "italic" }}>
                                    No options yet — click Edit to add
                                  </Typography>
                                )}
                              </Stack>

                              {editingAttrIdx === idx && (
                                <Stack direction="row" spacing={1} mt={1.5}>
                                  <TextField size="small" value={newAttrOption}
                                    onChange={(e) => setNewAttrOption(e.target.value)}
                                    placeholder={`Add option (e.g., ${attr.key === "size" ? "500ml" : "Red"})`}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && newAttrOption.trim()) {
                                        const updated = [...values.attribute_definitions];
                                        updated[idx] = { ...attr, options: [...attr.options, newAttrOption.trim()] };
                                        setFieldValue("attribute_definitions", updated);
                                        setNewAttrOption("");
                                      }
                                    }}
                                    sx={{ ...inputSx, flex: 1 }} />
                                  <Button variant="contained" size="small"
                                    onClick={() => {
                                      if (!newAttrOption.trim()) return;
                                      const updated = [...values.attribute_definitions];
                                      updated[idx] = { ...attr, options: [...attr.options, newAttrOption.trim()] };
                                      setFieldValue("attribute_definitions", updated);
                                      setNewAttrOption("");
                                    }}
                                    sx={{ backgroundColor: C.brand, borderRadius: "8px", "&:hover": { backgroundColor: "#1D4ED8" } }}>
                                    <Plus size={16} />
                                  </Button>
                                </Stack>
                              )}
                            </Box>
                          ))}
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <TextField size="small" value={newAttrKey}
                            onChange={(e) => setNewAttrKey(e.target.value)}
                            placeholder="New attribute (e.g., size, color, material)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newAttrKey.trim()) {
                                const updated = [...values.attribute_definitions, { key: newAttrKey.trim(), options: [] }];
                                setFieldValue("attribute_definitions", updated);
                                setEditingAttrIdx(updated.length - 1);
                                setNewAttrKey("");
                              }
                            }}
                            sx={{ ...inputSx, flex: 1 }} />
                          <Button variant="contained"
                            onClick={() => {
                              if (!newAttrKey.trim()) return;
                              const updated = [...values.attribute_definitions, { key: newAttrKey.trim(), options: [] }];
                              setFieldValue("attribute_definitions", updated);
                              setEditingAttrIdx(updated.length - 1);
                              setNewAttrKey("");
                            }}
                            sx={{ backgroundColor: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2, "&:hover": { backgroundColor: "#1D4ED8" } }}>
                            <Plus size={16} style={{ marginRight: 4 }} /> Add
                          </Button>
                        </Stack>
                      </Box>
                    </Card>

                    {/* Auto-generate banner */}
                    {attrHasOptions && (
                      <Card sx={{ borderRadius: "14px", border: `1.5px solid ${C.brandMid}`, backgroundColor: C.brandSoft, boxShadow: "none", p: 2.5 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                              <Wand2 size={16} color={C.brand} />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: C.brand }}>
                                Auto-generate Variant SKUs
                              </Typography>
                              <Chip
                                label={`${totalCombos} combination${totalCombos !== 1 ? "s" : ""}`}
                                size="small"
                                sx={{ fontSize: "0.68rem", height: 18, backgroundColor: C.brandMid, color: C.brand, fontWeight: 700 }}
                              />
                            </Stack>

                            {/* ── SKU preview input ── */}
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ flex: 1, maxWidth: 340 }}>
                                <Typography variant="caption" sx={{ color: C.textMid, mb: 0.5, display: "block", fontWeight: 600 }}>
                                  SKU Format Preview
                                </Typography>
                                <TextField
                                  size="small"
                                  value={exampleSku}
                                  InputProps={{
                                    readOnly: true,
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Typography variant="caption" sx={{
                                          fontFamily: "monospace",
                                          fontWeight: 700,
                                          color: C.brand,
                                          backgroundColor: C.brandMid,
                                          px: 0.75,
                                          py: 0.25,
                                          borderRadius: "4px",
                                          fontSize: "0.7rem",
                                          whiteSpace: "nowrap",
                                        }}>
                                          {previewPrefix}
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Tooltip title="Copy example SKU">
                                          <IconButton
                                            size="small"
                                            onClick={() => navigator.clipboard.writeText(exampleSku)}
                                            sx={{ color: C.textLight, p: 0.5, "&:hover": { color: C.brand } }}
                                          >
                                            <Copy size={12} />
                                          </IconButton>
                                        </Tooltip>
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "8px",
                                      backgroundColor: C.white,
                                      fontFamily: "monospace",
                                      fontSize: "0.8rem",
                                      color: C.textMid,
                                      cursor: "default",
                                      "& fieldset": { borderColor: C.brandMid },
                                      "&:hover fieldset": { borderColor: C.brand },
                                      "& input": { py: "6px", cursor: "default" },
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Box>

                          <Stack direction="row" spacing={1} flexShrink={0} alignSelf={{ xs: "flex-start", sm: "flex-end" }}>
                            {values.variants.length > 0 && (
                              <Tooltip title="Rebuild all SKUs from current product name & base SKU without changing prices">
                                <Button variant="outlined" size="small" startIcon={<RefreshCw size={14} />}
                                  onClick={handleRegenSkus}
                                  sx={{ borderColor: C.brand, color: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.8rem", "&:hover": { backgroundColor: C.brandMid } }}>
                                  Regen SKUs
                                </Button>
                              </Tooltip>
                            )}
                            <Button variant="contained" size="small" startIcon={<Wand2 size={14} />}
                              onClick={handleGenerateAll}
                              sx={{ backgroundColor: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.85rem", px: 2.5, "&:hover": { backgroundColor: "#1D4ED8" } }}>
                              Generate All ({totalCombos})
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    )}

                    {/* Variant table */}
                    <Card sx={cardSx}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}` }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, fontSize: "1rem" }}>Product Variants</Typography>
                            <Typography variant="caption" sx={{ color: C.textMid }}>Edit SKU, cost and selling price inline. Hover selling price for margin info.</Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {values.variants.length > 0 && (
                              <Button size="small" variant="text" color="error"
                                onClick={() => { setFieldValue("variants", []); showToastMessage("Variants cleared", "info"); }}
                                sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                                Clear all
                              </Button>
                            )}
                            <Chip
                              label={`${values.variants.length} variant${values.variants.length !== 1 ? "s" : ""}`}
                              size="small"
                              sx={{ backgroundColor: values.variants.length > 0 ? C.successSoft : C.bg, color: values.variants.length > 0 ? C.success : C.textMid, fontWeight: 600 }}
                            />
                          </Stack>
                        </Stack>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        {values.variants.length === 0 ? (
                          <Box sx={{ borderRadius: "10px", border: `1.5px dashed ${C.border}`, p: 5, textAlign: "center" }}>
                            <Layers size={32} color={C.textLight} />
                            <Typography variant="body2" sx={{ color: C.textMid, mt: 1.5, fontWeight: 500 }}>No variants yet</Typography>
                            <Typography variant="caption" sx={{ color: C.textLight }}>
                              {attrHasOptions
                                ? `Click "Generate All (${totalCombos})" above to auto-create all SKU combinations`
                                : "Add attribute options above, then click Generate All"}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
                            {/* Header */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 110px 110px 56px 36px", gap: 1.5, px: 2, py: 1.25, backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                              {["Variant / SKU", "Attributes", "Cost (₹)", "Selling (₹)", "Active", ""].map((h) => (
                                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: C.textMid, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  {h}
                                </Typography>
                              ))}
                            </Box>

                            {/* Rows */}
                            {values.variants.map((variant, idx) => {
                              const profit = variant.selling_price - variant.cost_price;
                              const margin = variant.cost_price > 0 ? (profit / variant.cost_price) * 100 : 0;
                              const isProfit = profit >= 0;
                              return (
                                <Box key={idx} sx={{
                                  display: "grid",
                                  gridTemplateColumns: "1.6fr 1fr 110px 110px 56px 36px",
                                  gap: 1.5, px: 2, py: 1.5,
                                  borderBottom: idx < values.variants.length - 1 ? `1px solid ${C.border}` : "none",
                                  backgroundColor: variant.is_active ? C.white : "#FAFAFA",
                                  opacity: variant.is_active ? 1 : 0.6,
                                  alignItems: "center",
                                  "&:hover": { backgroundColor: C.brandSoft },
                                  transition: "background 0.15s",
                                }}>

                                  {/* Name + editable SKU */}
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: C.text, fontSize: "0.82rem", mb: 0.5 }}>
                                      {variant.variant_name}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.25}>
                                      <TextField
                                        size="small"
                                        value={variant.sku}
                                        onChange={(e) => {
                                          const updated = [...values.variants];
                                          updated[idx] = { ...variant, sku: e.target.value };
                                          setFieldValue("variants", updated);
                                        }}
                                        sx={{
                                          flex: 1,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: "6px", fontSize: "0.72rem",
                                            fontFamily: "monospace", color: C.textMid,
                                            backgroundColor: C.bg,
                                            "& fieldset": { borderColor: C.border },
                                            "&:hover fieldset": { borderColor: C.brand },
                                            "&.Mui-focused fieldset": { borderColor: C.brand },
                                            "& input": { py: 0.5, px: 1 },
                                          },
                                        }}
                                      />
                                      <Tooltip title="Copy SKU">
                                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(variant.sku)}
                                          sx={{ color: C.textLight, p: 0.5, "&:hover": { color: C.brand } }}>
                                          <Copy size={11} />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Box>

                                  {/* Attribute chips */}
                                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                    {Object.entries(variant.attribute_map).map(([k, v]) => (
                                      <Chip key={k} label={`${k}: ${v}`} size="small"
                                        sx={{ fontSize: "0.68rem", fontWeight: 600, height: 20, backgroundColor: C.brandSoft, color: C.brand }} />
                                    ))}
                                  </Stack>

                                  {/* Cost */}
                                  <TextField size="small" type="number" value={variant.cost_price}
                                    inputProps={{ step: "0.01", min: "0" }}
                                    onChange={(e) => {
                                      const updated = [...values.variants];
                                      updated[idx] = { ...variant, cost_price: parseFloat(e.target.value) || 0 };
                                      setFieldValue("variants", updated);
                                    }}
                                    sx={inputSx} />

                                  {/* Selling (colored border = profit indicator) */}
                                  <Tooltip title={`${isProfit ? "Profit" : "Loss"}: ₹${Math.abs(profit).toFixed(2)} · ${margin.toFixed(1)}% markup`} placement="top">
                                    <TextField size="small" type="number" value={variant.selling_price}
                                      inputProps={{ step: "0.01", min: "0" }}
                                      onChange={(e) => {
                                        const updated = [...values.variants];
                                        updated[idx] = { ...variant, selling_price: parseFloat(e.target.value) || 0 };
                                        setFieldValue("variants", updated);
                                      }}
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "8px", fontSize: "0.875rem", backgroundColor: C.white,
                                          "& fieldset": { borderColor: isProfit ? "#86EFAC" : "#FCA5A5" },
                                          "&:hover fieldset": { borderColor: isProfit ? C.success : C.danger },
                                          "&.Mui-focused fieldset": { borderColor: isProfit ? C.success : C.danger, borderWidth: 2 },
                                        },
                                      }}
                                    />
                                  </Tooltip>

                                  {/* Active toggle */}
                                  <Switch checked={variant.is_active} size="small"
                                    onChange={(e) => {
                                      const updated = [...values.variants];
                                      updated[idx] = { ...variant, is_active: e.target.checked };
                                      setFieldValue("variants", updated);
                                    }}
                                    sx={{
                                      "& .MuiSwitch-switchBase.Mui-checked": { color: C.success },
                                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: C.success },
                                    }}
                                  />

                                  {/* Delete */}
                                  <IconButton size="small"
                                    onClick={() => setFieldValue("variants", values.variants.filter((_, i) => i !== idx))}
                                    sx={{ color: C.textLight, "&:hover": { color: C.danger, backgroundColor: C.dangerSoft } }}>
                                    <Trash2 size={14} />
                                  </IconButton>
                                </Box>
                              );
                            })}
                          </Box>
                        )}

                        {/* Manual add */}
                        {values.attribute_definitions.length > 0 && (() => {
                          // Derive SKU + name live from attribute_map (unless user has manually overridden)
                          const attrMap = variantForm.attribute_map ?? {};
                          const attrValues = values.attribute_definitions
                            .map((a) => attrMap[a.key])
                            .filter(Boolean) as string[];
                          const derivedSku = attrValues.length
                            ? [buildSkuPrefix(values.name, values.base_sku), ...attrValues.map(toSkuToken)].join("-")
                            : "";
                          const derivedName = attrValues.join(" / ");
                          // Use manual override if set, else derived
                          const skuValue = variantForm._skuManual ? (variantForm.sku ?? "") : derivedSku;
                          const nameValue = variantForm._nameManual ? (variantForm.variant_name ?? "") : derivedName;

                          return (
                          <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${C.border}` }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: C.textMid, mb: 2, fontSize: "0.82rem" }}>
                              + Add single variant manually
                            </Typography>
                            <Stack spacing={2}>
                              {/* ── Attribute selects first so SKU/name derive from them ── */}
                              <Stack direction="row" spacing={2} flexWrap="wrap">
                                {values.attribute_definitions.map((attr) => (
                                  <Box key={attr.key} sx={{ minWidth: 130 }}>
                                    <Label>{attr.key}</Label>
                                    {attr.options.length > 0 ? (
                                      <Select fullWidth size="small" displayEmpty
                                        value={attrMap[attr.key] ?? ""}
                                        onChange={(e) => setVariantForm((f) => ({
                                          ...f,
                                          attribute_map: { ...f.attribute_map, [attr.key]: e.target.value },
                                          // Reset manual overrides when attrs change so derived values show
                                          _skuManual: false,
                                          _nameManual: false,
                                        }))}
                                        sx={selectSx}>
                                        <MenuItem value="" disabled><em style={{ color: C.textLight }}>Select…</em></MenuItem>
                                        {attr.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                      </Select>
                                    ) : (
                                      <TextField fullWidth size="small" placeholder={attr.key}
                                        value={attrMap[attr.key] ?? ""}
                                        onChange={(e) => setVariantForm((f) => ({
                                          ...f,
                                          attribute_map: { ...f.attribute_map, [attr.key]: e.target.value },
                                          _skuManual: false,
                                          _nameManual: false,
                                        }))}
                                        sx={inputSx} />
                                    )}
                                  </Box>
                                ))}
                              </Stack>

                              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                                    <Label required>SKU</Label>
                                    {variantForm._skuManual && (
                                      <Typography
                                        variant="caption"
                                        onClick={() => setVariantForm((f) => ({ ...f, _skuManual: false, sku: "" }))}
                                        sx={{ color: C.brand, cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                                      >
                                        ↺ Auto
                                      </Typography>
                                    )}
                                  </Stack>
                                  <TextField fullWidth size="small"
                                    value={skuValue}
                                    onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value, _skuManual: true }))}
                                    InputProps={{
                                      sx: { fontFamily: "monospace", fontSize: "0.82rem" },
                                      endAdornment: skuValue && !variantForm._skuManual ? (
                                        <InputAdornment position="end">
                                          <Tooltip title="Auto-generated — edit to override">
                                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.brand, flexShrink: 0 }} />
                                          </Tooltip>
                                        </InputAdornment>
                                      ) : undefined,
                                    }}
                                    sx={{
                                      ...inputSx,
                                      "& .MuiOutlinedInput-root": {
                                        ...inputSx["& .MuiOutlinedInput-root"],
                                        "& fieldset": {
                                          borderColor: !variantForm._skuManual && skuValue ? C.brandMid : C.border,
                                        },
                                      },
                                    }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                                    <Label required>Variant Name</Label>
                                    {variantForm._nameManual && (
                                      <Typography
                                        variant="caption"
                                        onClick={() => setVariantForm((f) => ({ ...f, _nameManual: false, variant_name: "" }))}
                                        sx={{ color: C.brand, cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                                      >
                                        ↺ Auto
                                      </Typography>
                                    )}
                                  </Stack>
                                  <TextField fullWidth size="small"
                                    value={nameValue}
                                    onChange={(e) => setVariantForm((f) => ({ ...f, variant_name: e.target.value, _nameManual: true }))}
                                    InputProps={{
                                      endAdornment: nameValue && !variantForm._nameManual ? (
                                        <InputAdornment position="end">
                                          <Tooltip title="Auto-generated — edit to override">
                                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.brand, flexShrink: 0 }} />
                                          </Tooltip>
                                        </InputAdornment>
                                      ) : undefined,
                                    }}
                                    sx={{
                                      ...inputSx,
                                      "& .MuiOutlinedInput-root": {
                                        ...inputSx["& .MuiOutlinedInput-root"],
                                        "& fieldset": {
                                          borderColor: !variantForm._nameManual && nameValue ? C.brandMid : C.border,
                                        },
                                      },
                                    }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Cost (₹)</Label>
                                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={variantForm.cost_price ?? ""}
                                    onChange={(e) => setVariantForm((f) => ({ ...f, cost_price: parseFloat(e.target.value) || 0 }))}
                                    sx={inputSx} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Label required>Selling (₹)</Label>
                                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={variantForm.selling_price ?? ""}
                                    onChange={(e) => setVariantForm((f) => ({ ...f, selling_price: parseFloat(e.target.value) || 0 }))}
                                    sx={inputSx} />
                                </Box>
                              </Stack>

                              <Button variant="outlined" size="small" startIcon={<Plus size={14} />}
                                onClick={() => {
                                  const { cost_price, selling_price, stock_quantity, attribute_map, is_active } = variantForm;
                                  const finalSku = skuValue.trim();
                                  const finalName = nameValue.trim();
                                  if (!finalSku || !finalName || !cost_price || !selling_price) {
                                    showToastMessage("Select attributes and fill cost & selling price", "error"); return;
                                  }
                                  setFieldValue("variants", [...values.variants, {
                                    sku: finalSku, variant_name: finalName,
                                    attribute_map: attribute_map ?? {}, selling_price, cost_price,
                                    stock_quantity: stock_quantity ?? 0, is_active: is_active ?? true,
                                  }]);
                                  setVariantForm({ attribute_map: {}, stock_quantity: 0, is_active: true, _skuManual: false, _nameManual: false } as any);
                                  showToastMessage("Variant added", "success");
                                }}
                                sx={{ alignSelf: "flex-start", borderColor: C.brand, color: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: C.brandSoft } }}>
                                Add Variant
                              </Button>
                            </Stack>
                          </Box>
                          );
                        })()}
                      </Box>
                    </Card>
                  </Stack>
                )}

                {/* Navigation */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}
                  sx={{ bgcolor: C.white, borderRadius: "16px", border: `1px solid ${C.border}`, p: 2.5, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                  <Button variant="outlined" onClick={() => step > 0 ? setStep(step - 1) : router.back()} disabled={loading}
                    sx={{ borderColor: "#e5e7eb", color: C.textMid, borderRadius: "10px", textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" } }}>
                    {step === 0 ? "Cancel" : "Back"}
                  </Button>

                  {step < STEPS.length - 1 && !values.is_resource && !values.is_raw ? (
                    <Button variant="contained" endIcon={<ChevronRight size={16} />}
                      onClick={async () => {
                        const errs = await validateForm();
                        const stepFields: Record<number, string[]> = {
                          0: ["name", "unit", "base_sku", "description"],
                          1: ["selling_price", "cost_price"],
                          2: [],
                        };
                        const relevant = stepFields[step] ?? [];
                        if (!relevant.some((f) => errs[f as keyof typeof errs])) {
                          setStep(step + 1);
                        } else {
                          relevant.forEach((f) => {
                            (document.querySelector(`[name="${f}"]`) as HTMLElement)?.dispatchEvent(new Event("blur", { bubbles: true }));
                          });
                        }
                      }}
                      sx={{ background: C.gradient, borderRadius: "10px", textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, px: 3, boxShadow: "0 4px 14px rgba(14,165,233,0.3)", "&:hover": { background: C.gradientHover, transform: "translateY(-1px)" } }}>
                      Next: {STEPS[step + 1].label}
                    </Button>
                  ) : (
                    <BBButton type="submit" disabled={loading} loading={loading}
                      sx={{ background: C.gradient, borderRadius: "10px", textTransform: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, px: 4, boxShadow: "0 4px 14px rgba(14,165,233,0.3)", "&:hover": { background: C.gradientHover, transform: "translateY(-1px)" } }}>
                      {loading ? "Creating…" : values.is_resource ? "Create Resource" : values.is_raw ? "Create Raw Product" : "Create Product"}
                    </BBButton>
                  )}
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Box>
  );
}