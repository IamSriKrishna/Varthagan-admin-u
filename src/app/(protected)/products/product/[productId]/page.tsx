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
  AlertTitle,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import {
  AlertCircle,
  ArrowLeft,
  BarChart2,
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

const TABS = [
  { label: "Basic Info", index: 0 },
  { label: "Pricing", index: 1 },
  { label: "Inventory", index: 2 },
  { label: "Descriptions", index: 3 },
  { label: "Variants", index: 4 },
];

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

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2.25,
        borderBottom: "1px solid #f0f0f5",
        bgcolor: "#fafbff",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: "#eef2ff",
          color: "#4f63d2",
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
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "#1a1d2e",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.2px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "#9ca3af",
              fontFamily: "'DM Sans', sans-serif",
              mt: 0.25,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #eeeff5",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}

function SectionLabel({ children, color = "#9ca3af" }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography
      sx={{
        fontSize: "0.7rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color,
        mb: 1.5,
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      {children}
    </Typography>
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
        borderRadius: "12px",
        border: "1.5px solid",
        borderColor: active ? `${accentColor}60` : "#eeeff5",
        bgcolor: active ? accentBg : "#ffffff",
        transition: "all 0.2s ease",
        boxShadow: active ? `0 0 0 3px ${accentColor}18` : "none",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor: active ? `${accentColor}20` : "#f8f9fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#9ca3af", mt: 0.125, lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif" }}>
            {description}
          </Typography>
        </Box>
      </Stack>
      <BBSwitch name={name} label="" />
    </Box>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
      <Typography sx={{ fontSize: "0.76rem", color: "#9ca3af", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.76rem",
          color: "#374151",
          fontWeight: 700,
          textAlign: "right",
          wordBreak: "break-word",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const AddProduct = () => {
  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state?.auth);
  const [initialVariantData, setInitialVariantData] = useState<{ variants: IVariant[] } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleVariantSave = (data: { variants: IVariant[] }) => {
    setInitialVariantData({ variants: data.variants });
    showToastMessage("Variants saved!", "success");
  };

  if (isEdit && productLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", bgcolor: "#f8f9fc", flexDirection: "column", gap: 2 }}>
        <CircularProgress size={28} thickness={3.5} sx={{ color: "#4f63d2" }} />
        <Typography sx={{ fontSize: "0.875rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
          Loading product…
        </Typography>
      </Box>
    );
  }

  const formInitialValues = isEdit && productData ? productData : initialValues;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
      <BBLoader enabled={authLoading || loading} />

      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleProductSubmit}
        validateOnChange
        validateOnBlur
      >
        {({ handleSubmit, values, errors, touched, isSubmitting, dirty }) => {
          const isResource = values.is_resource === true;
          const meta = (values as any)._meta;
          const inventory = (values as any)._inventory;
          const margin = (values.sales_info?.selling_price || 0) - (values.purchase_info?.cost_price || 0);
          const marginPct = values.sales_info?.selling_price ? ((margin / values.sales_info.selling_price) * 100).toFixed(1) : null;
          const visibleTabs = TABS.filter((tab) => {
            if (isResource) return tab.index === 0;
            if (tab.index === 4) return !!values.has_style;
            return true;
          });

          return (
            <Form onSubmit={handleSubmit} noValidate>
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  px: 3,
                  pt: 2.5,
                  pb: 2,
                  bgcolor: "#ffffff",
                  borderBottom: "1px solid #f0f0f5",
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
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
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
                        color: "#1a1d2e",
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "-0.3px",
                        lineHeight: 1.2,
                      }}
                    >
                      {isEdit ? "Edit Product" : "New Product"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        color: "#9ca3af",
                        fontFamily: "'DM Sans', sans-serif",
                        mt: 0.2,
                      }}
                    >
                      {isEdit ? "Update product information" : "Add a new product to your system"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <BBButton
                    variant="outlined"
                    onClick={() => router.back()}
                    startIcon={<ArrowLeft size={16} />}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      borderColor: "#e5e7eb",
                      "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                    }}
                  >
                    Cancel
                  </BBButton>
                  <BBButton
                    type="submit"
                    variant="contained"
                    disabled={loading || isSubmitting || (isEdit && !dirty)}
                    loading={loading || isSubmitting}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      px: 2.5,
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                        boxShadow: "0 6px 20px rgba(14,165,233,0.45)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": { opacity: 0.65 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isEdit ? "Update Product" : `Create ${isResource ? "Resource" : "Product"}`}
                  </BBButton>
                </Box>
              </Box>

              <Box sx={{ px: 3, pt: 2.5 }}>
                <Collapse in={!!productError}>
                  <Alert
                    severity="error"
                    icon={<AlertCircle size={18} />}
                    sx={{ mb: 2, borderRadius: "12px", border: "1px solid #fee2e2", bgcolor: "#fff5f5", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Error</AlertTitle>
                    Failed to load product. Please refresh.
                  </Alert>
                </Collapse>

                <Collapse in={!!authError}>
                  <Alert
                    severity="error"
                    icon={<AlertCircle size={18} />}
                    sx={{ mb: 2, borderRadius: "12px", border: "1px solid #fee2e2", bgcolor: "#fff5f5", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Error</AlertTitle>
                    {authError}
                  </Alert>
                </Collapse>

                <Collapse in={Object.keys(errors).length > 0 && Object.keys(touched).length > 0}>
                  <Alert
                    severity="warning"
                    sx={{ mb: 2, borderRadius: "12px", border: "1px solid #fef3c7", bgcolor: "#fffbeb", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <AlertTitle sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Validation Errors</AlertTitle>
                    Please check and fix the errors in the form before submitting.
                  </Alert>
                </Collapse>
              </Box>

              <Box sx={{ px: 3, pb: 4 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 280px" },
                    gap: 3,
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <SectionCard>
                      <SectionTitle
                        icon={<Package size={18} />}
                        title="Basic Information"
                        subtitle="Core product identity and configuration"
                      />
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={2.5} component="div">
                          <Grid size={{ xs: 12 }} component="div">
                            <BBInput name="name" label="Product Name" placeholder="e.g., 500ml PET Cap" disabled={authLoading} />
                          </Grid>
                          {!isResource && (
                            <>
                              <Grid size={{ xs: 12, sm: 6 }} component="div">
                                <BBInput name="product_details.base_sku" label="Base SKU" placeholder="e.g., CP-500" />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }} component="div">
                                <BBInput name="product_details.unit" label="Unit" placeholder="pieces, kg, liter…" />
                              </Grid>
                            </>
                          )}
                        </Grid>

                        <Divider sx={{ my: 3, borderColor: "#f0f0f5" }} />

                        <Stack spacing={1.5}>
                          <ToggleCard
                            icon={<Zap size={15} color={isResource ? "#7c3aed" : "#9ca3af"} />}
                            label="Resource Product"
                            description="Consumption-based item like water, electricity, or gas."
                            active={isResource}
                            accentColor="#7c3aed"
                            accentBg="#f5f3ff"
                            name="is_resource"
                          />
                          {!isResource && (
                            <ToggleCard
                              icon={<Layers size={15} color={values.has_style ? "#12b76a" : "#9ca3af"} />}
                              label="Has Style Variants"
                              description="Manage size, colour, or other variant combinations."
                              active={!!values.has_style}
                              accentColor="#12b76a"
                              accentBg="#ecfdf3"
                              name="has_style"
                            />
                          )}
                        </Stack>
                      </Box>
                    </SectionCard>

                    <Box
                      sx={{
                        bgcolor: "#ffffff",
                        borderRadius: "16px",
                        border: "1px solid #eeeff5",
                        overflow: "hidden",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          borderBottom: "1px solid #f0f0f5",
                          bgcolor: "#fafbff",
                          px: 1,
                          pt: 1,
                          gap: 0.5,
                          overflowX: "auto",
                        }}
                      >
                        {visibleTabs.map((tab) => {
                          const active = activeTab === tab.index;
                          return (
                            <Box
                              key={tab.label}
                              onClick={() => setActiveTab(tab.index)}
                              sx={{
                                px: 2.5,
                                py: 1.25,
                                cursor: "pointer",
                                borderRadius: "10px 10px 0 0",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: active ? 700 : 500,
                                color: active ? "#4f63d2" : "#9ca3af",
                                bgcolor: active ? "#ffffff" : "transparent",
                                borderBottom: active ? "2px solid #4f63d2" : "2px solid transparent",
                                boxShadow: active ? "0 -2px 8px rgba(79,99,210,0.08)" : "none",
                                transition: "all 0.15s ease",
                                "&:hover": { color: active ? "#4f63d2" : "#6b7280", bgcolor: active ? "#ffffff" : "#f0f4ff" },
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              {tab.label}
                              {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4f63d2", flexShrink: 0 }} />}
                            </Box>
                          );
                        })}
                      </Box>

                      <Box sx={{ p: 3 }}>
                        {activeTab === 0 && isResource && (
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, borderRadius: "12px", bgcolor: "#eff8ff", border: "1px solid #b2ddff", mb: 3 }}>
                              <Zap size={15} color="#0077b6" style={{ marginTop: 2, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: "0.8rem", color: "#0077b6", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                                Resource products track consumption and do not support inventory or variants.
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
                        )}

                        {activeTab === 0 && !isResource && (
                          <Box sx={{ py: 2, textAlign: "center", border: "2px dashed #eeeff5", borderRadius: "12px" }}>
                            <Package size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                            <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                              Basic information is shown above. Use other tabs for pricing, inventory, descriptions, and variants.
                            </Typography>
                          </Box>
                        )}

                        {activeTab === 1 && !isResource && (
                          <Box>
                            <SectionLabel color="#12b76a">
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#12b76a", display: "inline-block" }} />
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

                            <Divider sx={{ borderColor: "#f0f0f5", mb: 3 }} />

                            <SectionLabel color="#f59e0b">
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f59e0b", display: "inline-block" }} />
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

                            {margin !== 0 && marginPct !== null && (
                              <Box sx={{ mt: 3, p: 2, borderRadius: "12px", bgcolor: margin >= 0 ? "#ecfdf3" : "#fff1f0", border: `1px solid ${margin >= 0 ? "#a9efc5" : "#fecaca"}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <TrendingUp size={16} color={margin >= 0 ? "#12b76a" : "#ef4444"} style={{ flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "0.78rem", color: margin >= 0 ? "#027a48" : "#9b1c1c", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                                  Gross Margin: ₹{Math.abs(margin).toFixed(2)} ({marginPct}%)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {activeTab === 2 && !isResource && (
                          <Box>
                            {inventory ? (
                              <Grid container spacing={2} component="div">
                                <Grid size={{ xs: 12, sm: 4 }} component="div">
                                  <Box sx={{ p: 2, borderRadius: "12px", bgcolor: inventory.track_inventory ? "#ecfdf3" : "#f8f9fc", border: `1px solid ${inventory.track_inventory ? "#a9efc5" : "#eeeff5"}` }}>
                                    <SectionLabel color={inventory.track_inventory ? "#027a48" : "#9ca3af"}>Tracking</SectionLabel>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: inventory.track_inventory ? "#12b76a" : "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                                      {inventory.track_inventory ? "Enabled" : "Disabled"}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }} component="div">
                                  <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f8f9fc", border: "1px solid #eeeff5" }}>
                                    <SectionLabel>Inventory Account</SectionLabel>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif" }}>
                                      {inventory.inventory_account || "—"}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }} component="div">
                                  <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f8f9fc", border: "1px solid #eeeff5" }}>
                                    <SectionLabel>Valuation Method</SectionLabel>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1d2e", fontFamily: "'DM Sans', sans-serif" }}>
                                      {inventory.inventory_valuation_method || "—"}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            ) : (
                              <Box sx={{ py: 4, borderRadius: "12px", border: "2px dashed #eeeff5", textAlign: "center" }}>
                                <BarChart2 size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                                <Typography sx={{ fontSize: "0.82rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                                  Inventory settings appear after the product is created.
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {activeTab === 3 && !isResource && (
                          <Stack spacing={3}>
                            <Box>
                              <SectionLabel color="#12b76a">Sales Description</SectionLabel>
                              <BBRichTextEditor name="sales_info.description" label="" placeholder="Describe this product to buyers…" />
                            </Box>
                            <Divider sx={{ borderColor: "#f0f0f5" }} />
                            <Box>
                              <SectionLabel color="#f59e0b">Purchase Description</SectionLabel>
                              <BBRichTextEditor name="purchase_info.description" label="" placeholder="Notes for purchasing this product…" />
                            </Box>
                            <Divider sx={{ borderColor: "#f0f0f5" }} />
                            <Box>
                              <SectionLabel>Product Description</SectionLabel>
                              <BBRichTextEditor name="product_details.description" label="" placeholder="Full product details…" />
                            </Box>
                          </Stack>
                        )}

                        {activeTab === 4 && !isResource && values.has_style && (
                          <VariantBuilder initialData={initialVariantData || undefined} onSave={handleVariantSave} />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, pt: 1 }}>
                      <BBButton
                        variant="outlined"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          color: "#6b7280",
                          borderColor: "#e5e7eb",
                          "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
                        }}
                      >
                        Cancel
                      </BBButton>
                      <BBButton
                        type="submit"
                        variant="contained"
                        disabled={loading || isSubmitting || (isEdit && !dirty)}
                        loading={loading || isSubmitting}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          px: 3,
                          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                          boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                          "&:hover": { background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", transform: "translateY(-1px)" },
                          "&:disabled": { opacity: 0.65 },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isEdit ? "Update Product" : `Create ${isResource ? "Resource" : "Product"}`}
                      </BBButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 92 }}>
                    <SectionCard>
                      <SectionTitle icon={<CreditCard size={18} />} title="Summary" />
                      <Box sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          {values.name && (
                            <Box>
                              <SectionLabel>Name</SectionLabel>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#1a1d2e", lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif" }}>
                                {values.name}
                              </Typography>
                            </Box>
                          )}

                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={isResource ? "Resource" : "Product"}
                              sx={{ fontSize: "0.68rem", height: 22, bgcolor: isResource ? "#f5f3ff" : "#eef2ff", color: isResource ? "#7c3aed" : "#4f63d2", fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}
                            />
                            {!isResource && values.has_style && (
                              <Chip
                                size="small"
                                label="Has Variants"
                                sx={{ fontSize: "0.68rem", height: 22, bgcolor: "#ecfdf3", color: "#12b76a", fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}
                              />
                            )}
                          </Stack>

                          {!isResource && values.product_details?.base_sku && <MetaRow label="SKU" value={values.product_details.base_sku} />}
                          {!isResource && values.product_details?.unit && <MetaRow label="Unit" value={values.product_details.unit} />}

                          {!isResource && (values.sales_info?.selling_price || values.purchase_info?.cost_price) && (
                            <Box>
                              <Divider sx={{ borderColor: "#f0f0f5", mb: 2 }} />
                              <Stack spacing={1.25}>
                                <MetaRow label="Selling" value={`₹${(values.sales_info?.selling_price || 0).toFixed(2)}`} />
                                <MetaRow label="Cost" value={`₹${(values.purchase_info?.cost_price || 0).toFixed(2)}`} />
                                <Divider sx={{ borderColor: "#f0f0f5" }} />
                                <MetaRow label="Margin" value={`₹${margin.toFixed(2)}${marginPct ? ` (${marginPct}%)` : ""}`} />
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </SectionCard>

                    {isEdit && meta && (
                      <SectionCard>
                        <SectionTitle icon={<BarChart2 size={18} />} title="Record Info" />
                        <Box sx={{ p: 2.5 }}>
                          <Stack spacing={1.75}>
                            <MetaRow label="Product ID" value={meta.id} />
                            {meta.company_name && <MetaRow label="Company" value={meta.company_name} />}
                            {meta.user_name && <MetaRow label="Created by" value={meta.user_name} />}
                            {meta.created_at && (
                              <MetaRow
                                label="Created"
                                value={new Date(meta.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              />
                            )}
                            {meta.updated_at && (
                              <MetaRow
                                label="Last updated"
                                value={new Date(meta.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              />
                            )}
                          </Stack>
                        </Box>
                      </SectionCard>
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
