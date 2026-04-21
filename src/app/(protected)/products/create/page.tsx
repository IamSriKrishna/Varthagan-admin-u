"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Card, Stack, Typography, Button,
  TextField, Select, MenuItem, Chip, LinearProgress,
  Tooltip, IconButton, Switch, InputAdornment,
} from "@mui/material";
import { BBButton } from "@/lib";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft, Plus, Trash2, Package, Tag,
  DollarSign, Layers, ChevronRight, Check,
  TrendingUp, Wand2, RefreshCw, Copy,
} from "lucide-react";
import { showToastMessage } from "@/utils/toastUtil";
import { productService, CreateProductRequest } from "@/lib/api/productService";
import { CreateManufacturerDialog } from "@/components/products/CreateManufacturerDialog";
import AddIcon from "@mui/icons-material/Add";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Manufacturer {
  id: string | number;
  name: string;
}

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
  manufacturer_id: string;
  unit: string;
  base_sku: string;
  upc: string;
  description: string;
  selling_account: string;
  selling_price: number;
  purchase_account: string;
  cost_price: number;
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
  manufacturer_id: Yup.string().required("Manufacturer is required"),
  unit: Yup.string().required("Unit is required"),
  base_sku: Yup.string().required("Base SKU is required"),
  description: Yup.string().required("Description is required"),
  selling_price: Yup.number().required("Selling price is required").min(0),
  cost_price: Yup.number().required("Cost price is required").min(0),
});

const initialValues: ProductFormData = {
  name: "",
  manufacturer_id: "",
  unit: "pieces",
  base_sku: "",
  upc: "",
  description: "",
  selling_account: "SALES_REVENUE",
  selling_price: 0,
  purchase_account: "PURCHASE_EXPENSE",
  cost_price: 0,
  attribute_definitions: [],
  variants: [],
};

const STEPS = [
  { label: "Product Info", icon: Package,    description: "Basic details & identifiers" },
  { label: "Pricing",      icon: DollarSign, description: "Accounts & price points"     },
  { label: "Variants",     icon: Layers,     description: "Attributes & SKU variants"   },
];

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  brand:      "#2563EB",
  brandSoft:  "#EFF6FF",
  brandMid:   "#DBEAFE",
  success:    "#16A34A",
  successSoft:"#F0FDF4",
  danger:     "#DC2626",
  dangerSoft: "#FEF2F2",
  text:       "#0F172A",
  textMid:    "#475569",
  textLight:  "#94A3B8",
  border:     "#E2E8F0",
  bg:         "#F8FAFC",
  white:      "#FFFFFF",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: C.white,
    fontSize: "0.875rem",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#93C5FD" },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 2 },
  },
};

const selectSx = {
  borderRadius: "8px",
  fontSize: "0.875rem",
  backgroundColor: C.white,
  "& fieldset": { borderColor: C.border },
  "&:hover fieldset": { borderColor: "#93C5FD" },
  "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 2 },
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: C.text }}>
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
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [createManufacturerOpen, setCreateManufacturerOpen] = useState(false);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [variantForm, setVariantForm] = useState<Partial<VariantForm>>({
    attribute_map: {}, stock_quantity: 0, is_active: true,
  });

  // ── Fetch Manufacturers ───────────────────────────────────────────────────

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoadingManufacturers(true);
        const response = await productService.getManufacturers();
        const manufacturers = 'data' in response ? response.data : response.manufacturers;
        setManufacturers(manufacturers || []);
      } catch (err) {
        console.error('Failed to fetch manufacturers:', err);
        showToastMessage('Failed to load manufacturers', 'error');
      } finally {
        setLoadingManufacturers(false);
      }
    };
    fetchManufacturers();
  }, []);

  const handleAddManufacturer = (manufacturer: Manufacturer) => {
    setManufacturers((prev) => [...prev, manufacturer]);
    setCreateManufacturerOpen(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (values: ProductFormData) => {
    try {
      setLoading(true);
      const markup = values.cost_price > 0
        ? ((values.selling_price - values.cost_price) / values.cost_price) * 100 : 0;

      const payload: CreateProductRequest = {
        name: values.name,
        product_details: {
          unit: values.unit,
          base_sku: values.base_sku,
          upc: values.upc || undefined,
          description: values.description,
          attribute_definitions: values.attribute_definitions,
          manufacturer_id: parseInt(values.manufacturer_id),
          variants: values.variants.map((v) => ({
            ...v,
            reorder_level: v.reorder_level ?? 0,
          })),
        },
        sales_info: {
          account: values.selling_account,
          selling_price: values.selling_price,
          markup_percent: parseFloat(markup.toFixed(2)),
        },
        purchase_info: {
          account: values.purchase_account,
          cost_price: values.cost_price,
        },
      };

      const response = await productService.createProduct(payload);
      if (response?.id) {
        showToastMessage("Product created successfully!", "success");
        router.push("/products");
      } else {
        showToastMessage("Failed to create product", "error");
      }
    } catch (err: any) {
      showToastMessage(err?.message ?? "Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: C.bg, pb: 6 }}>

      {/* Top bar */}
      <Box sx={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, px: 4, py: 2, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button startIcon={<ArrowLeft size={16} />} onClick={() => router.back()}
              sx={{ color: C.textMid, textTransform: "none", fontSize: "0.85rem", fontWeight: 500 }}>
              Products
            </Button>
            <Box sx={{ width: 1, height: 20, backgroundColor: C.border }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: C.brandSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={16} color={C.brand} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: C.text }}>New Product</Typography>
            </Stack>
          </Stack>
          <Typography variant="caption" sx={{ color: C.textLight }}>Step {step + 1} of {STEPS.length}</Typography>
        </Stack>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", px: 3, pt: 4 }}>

        {/* Step tracker */}
        <Card sx={{ mb: 4, borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
          <LinearProgress variant="determinate" value={((step + 1) / STEPS.length) * 100}
            sx={{ height: 3, backgroundColor: C.border, "& .MuiLinearProgress-bar": { backgroundColor: C.brand } }} />
          <Stack direction="row">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <Box key={i} onClick={() => isDone && setStep(i)} sx={{
                  flex: 1, p: 2.5, cursor: isDone ? "pointer" : "default",
                  borderRight: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none",
                  backgroundColor: isActive ? C.brandSoft : C.white,
                  transition: "background 0.2s",
                  "&:hover": isDone ? { backgroundColor: C.brandMid } : {},
                }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: isDone ? C.brand : isActive ? C.brandMid : C.bg, flexShrink: 0 }}>
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
                  <Card sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}` }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, fontSize: "1rem" }}>Product Information</Typography>
                      <Typography variant="caption" sx={{ color: C.textMid }}>Basic details, identifiers and description.</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                          <Box sx={{ flex: 2 }}>
                            <Label required>Product Name</Label>
                            <TextField fullWidth name="name" value={values.name} onChange={handleChange}
                              placeholder="e.g., Water Bottle" error={touched.name && !!errors.name} helperText={touched.name && errors.name}
                              size="small" sx={inputSx} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                              <Label required>Manufacturer</Label>
                              {manufacturers.length === 0 && !loadingManufacturers && (
                                <Button
                                  size="small"
                                  startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
                                  onClick={() => setCreateManufacturerOpen(true)}
                                  sx={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    color: "#0f172a",
                                    bgcolor: "#f1f5f9",
                                    borderRadius: 1.5,
                                    px: 1.25,
                                    py: 0.4,
                                    minHeight: 0,
                                    "&:hover": { bgcolor: "#e2e8f0" },
                                  }}
                                >
                                  Add New
                                </Button>
                              )}
                            </Stack>
                            <Select
                              fullWidth
                              name="manufacturer_id"
                              value={values.manufacturer_id}
                              onChange={handleChange}
                              size="small"
                              displayEmpty
                              disabled={loadingManufacturers}
                              sx={selectSx}
                            >
                              <MenuItem value="" disabled>
                                <em style={{ color: C.textLight }}>
                                  {loadingManufacturers ? "Loading..." : "Select…"}
                                </em>
                              </MenuItem>
                              {manufacturers.map((manufacturer) => (
                                <MenuItem key={manufacturer.id} value={manufacturer.id}>
                                  {manufacturer.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </Box>
                        </Stack>

                        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Unit</Label>
                            <TextField fullWidth name="unit" value={values.unit} onChange={handleChange}
                              placeholder="e.g., pieces" size="small" sx={inputSx} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Label required>Base SKU</Label>
                            <Tooltip title="Used as prefix when auto-generating variant SKUs" placement="top">
                              <TextField fullWidth name="base_sku" value={values.base_sku} onChange={handleChange}
                                placeholder="e.g., WB-001" error={touched.base_sku && !!errors.base_sku} helperText={touched.base_sku && errors.base_sku}
                                size="small" sx={inputSx} />
                            </Tooltip>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Label>UPC</Label>
                            <TextField fullWidth name="upc" value={values.upc} onChange={handleChange}
                              placeholder="e.g., 123456789012" size="small" sx={inputSx} />
                          </Box>
                        </Stack>

                        <Box>
                          <Label required>Description</Label>
                          <TextField fullWidth name="description" value={values.description} onChange={handleChange}
                            placeholder="Describe the product — materials, use cases, key features…" multiline rows={4}
                            error={touched.description && !!errors.description} helperText={touched.description && errors.description}
                            size="small" sx={inputSx} />
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                )}

                {/* ══ STEP 1: Pricing ═══════════════════════════════════════════════ */}
                {step === 1 && (
                  <Stack spacing={3}>
                    <Card sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, fontSize: "1rem" }}>Sales Information</Typography>
                      </Box>
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

                    <Card sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${C.border}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: C.text, fontSize: "1rem" }}>Purchase Information</Typography>
                      </Box>
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

                {/* ══ STEP 2: Variants ══════════════════════════════════════════════ */}
                {step === 2 && (
                  <Stack spacing={3}>

                    {/* Attribute definitions */}
                    <Card sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
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
                    <Card sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "none", overflow: "hidden" }}>
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
                  sx={{ backgroundColor: C.white, borderRadius: "12px", border: `1px solid ${C.border}`, p: 2.5 }}>
                  <Button variant="outlined" onClick={() => step > 0 ? setStep(step - 1) : router.back()} disabled={loading}
                    sx={{ borderColor: C.border, color: C.textMid, borderRadius: "8px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: C.textMid, backgroundColor: C.bg } }}>
                    {step === 0 ? "Cancel" : "Back"}
                  </Button>

                  {step < STEPS.length - 1 ? (
                    <Button variant="contained" endIcon={<ChevronRight size={16} />}
                      onClick={async () => {
                        const errs = await validateForm();
                        const stepFields: Record<number, string[]> = {
                          0: ["name", "manufacturer_id", "unit", "base_sku", "description"],
                          1: ["selling_price", "cost_price"],
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
                      sx={{ backgroundColor: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { backgroundColor: "#1D4ED8" } }}>
                      Next: {STEPS[step + 1].label}
                    </Button>
                  ) : (
                    <BBButton type="submit" disabled={loading} loading={loading}
                      sx={{ backgroundColor: C.brand, borderRadius: "8px", textTransform: "none", fontWeight: 700, px: 4, "&:hover": { backgroundColor: "#1D4ED8" } }}>
                      {loading ? "Creating…" : "Create Product"}
                    </BBButton>
                  )}
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Box>

      <CreateManufacturerDialog
        open={createManufacturerOpen}
        onClose={() => setCreateManufacturerOpen(false)}
        onSuccess={handleAddManufacturer}
      />
    </Box>
  );
}