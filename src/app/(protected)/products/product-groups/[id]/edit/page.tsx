"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  Divider,
  Badge,
} from "@mui/material";
import { BBTitle, BBButton } from "@/lib";
import { ArrowLeft, Plus, Trash2, Search, Package, Tag, TrendingUp, ShoppingCart } from "lucide-react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import useFetch from "@/hooks/useFetch";
import { showToastMessage } from "@/utils/toastUtil";
import { products } from "@/constants/apiConstants";
import {
  UpdateProductGroupInput,
  ProductGroupResponse,
  ProductVariant,
} from "@/models/product-group.model";
import { productGroupService } from "@/services/productGroupService";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  cost_price: number;
  selling_price: number;
  variants?: ProductVariant[];
}

interface SelectedProductComponent {
  product_id: string;
  product_name: string;
  variant_sku: string | null;
  quantity: number;
  position: number;
  variants?: ProductVariant[];
}

interface ProductGroupFormData {
  name: string;
  description: string;
  is_active: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Product group name is required"),
  description: Yup.string(),
  is_active: Yup.boolean().required("Status is required"),
});

// ── Stat card for the summary strip ──────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 2,
        background: "#fff",
        border: "1px solid #e8edf3",
        display: "flex",
        alignItems: "center",
        gap: 2,
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1.5,
          background: accent,
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
          variant="caption"
          sx={{ color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2, mt: 0.25 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Section wrapper card ──────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2.5,
        border: "1px solid #e8edf3",
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
        background: "#fff",
      }}
    >
      {children}
    </Card>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography
      variant="body2"
      sx={{ mb: 0.75, fontWeight: 600, color: "#374151", display: "flex", gap: 0.25 }}
    >
      {children}
      {required && <span style={{ color: "#ef4444" }}>*</span>}
    </Typography>
  );
}

export default function EditProductGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductComponent[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ProductGroupFormData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { data: productGroupData, loading: groupLoading, error: groupError } = useFetch<ProductGroupResponse>({
    url: `/product-groups/${params.id}`,
    options: { skip: !params.id },
  });

  const { data: productsData, loading: productsLoading } = useFetch<{ products: any[]; total: number }>({
    url: products.postProduct,
  });

  useEffect(() => {
    if (groupError) {
      setFetchError(groupError);
      showToastMessage(groupError, "error");
      return;
    }
    if (productGroupData && !productGroupData.success) {
      const msg = productGroupData.message || "Failed to load product group";
      setFetchError(msg);
      showToastMessage(msg, "error");
      return;
    }
    if (productGroupData?.data) {
      setFetchError(null);
      setInitialValues({
        name: productGroupData.data.name,
        description: productGroupData.data.description,
        is_active: productGroupData.data.is_active,
      });
      setSelectedProducts(
        productGroupData.data.components.map((c) => ({
          product_id: c.product_id,
          product_name: c.product?.name || "",
          variant_sku: c.variant_sku || null,
          quantity: c.quantity,
          position: c.position || 0,
          variants: [],
        }))
      );
    }
  }, [productGroupData, groupError]);

  const availableProducts: ProductItem[] =
    productsData?.products?.map((p: any) => ({
      id: p.id,
      sku: p.product_details?.base_sku || p.sku,
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
        product_id: product.id,
        product_name: product.name,
        variant_sku: null,
        quantity: 1,
        position: prev.length + 1,
        variants: product.variants || [],
      },
    ]);
    setSearchTerm("");
    showToastMessage("Product added to group", "success");
  };

  const handleRemoveProduct = (index: number) => {
    const next = selectedProducts.filter((_, i) => i !== index);
    next.forEach((p, i) => (p.position = i + 1));
    setSelectedProducts(next);
  };

  const handleVariantChange = (index: number, sku: string) => {
    const next = [...selectedProducts];
    next[index].variant_sku = sku || null;
    setSelectedProducts(next);
  };

  const handleQtyChange = (index: number, val: string) => {
    const next = [...selectedProducts];
    next[index].quantity = parseInt(val) || 1;
    setSelectedProducts(next);
  };

  const totalCost = selectedProducts.reduce((s, p) => {
    const prod = availableProducts.find((ap) => ap.id === p.product_id);
    return s + (prod?.cost_price || 0) * p.quantity;
  }, 0);

  const totalSelling = selectedProducts.reduce((s, p) => {
    const prod = availableProducts.find((ap) => ap.id === p.product_id);
    return s + (prod?.selling_price || 0) * p.quantity;
  }, 0);

  const totalProfit = totalSelling - totalCost;

  const handleUpdateProductGroup = async (values: ProductGroupFormData) => {
    if (selectedProducts.length === 0) {
      showToastMessage("Please add at least one product to the group", "error");
      return;
    }
    try {
      setIsLoading(true);
      const payload: UpdateProductGroupInput = {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
        products: selectedProducts.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          variant_sku: p.variant_sku || undefined,
          position: p.position,
        })),
      };
      const response = await productGroupService.updateProductGroup(params.id, payload);
      if (response?.data?.id) {
        showToastMessage(response.data.message || "Product group updated successfully", "success");
        router.push("/products/product-groups");
      } else {
        showToastMessage("Failed to update product group", "error");
      }
    } catch (error) {
      const msg =
        typeof error === "object" && error !== null && "message" in error
          ? (error as any).message
          : "Failed to update product group";
      showToastMessage(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (groupLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={36} thickness={4} sx={{ color: "#6366f1" }} />
          <Typography variant="body2" color="textSecondary">
            Loading product group…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!initialValues && fetchError) {
    return (
      <Box sx={{ px: 4, py: 8, maxWidth: 520 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {fetchError}
        </Alert>
        <Button variant="contained" onClick={() => router.back()}>
          Go back
        </Button>
      </Box>
    );
  }

  if (!initialValues) {
    return (
      <Box sx={{ px: 4, py: 8, maxWidth: 520 }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Unable to load product group data. Please refresh the page.
        </Alert>
        <Button variant="contained" onClick={() => router.back()}>
          Go back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#f8fafc", minHeight: "100vh", pb: 6 }}>
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "#fff",
          borderBottom: "1px solid #e8edf3",
          px: { xs: 2, md: 4 },
          py: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.back()}
            variant="text"
            sx={{ color: "#64748b", fontWeight: 500, "&:hover": { background: "#f1f5f9" } }}
          >
            Back
          </Button>
          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
              Edit Product Group
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Update group details and manage included products
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUpdateProductGroup}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Stack spacing={3}>
                {/* ── Basic Information ───────────────────────────────────── */}
                <SectionCard>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        background: "#ede9fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Tag size={16} color="#7c3aed" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      Basic Information
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <Box>
                      <FieldLabel required>Group Name</FieldLabel>
                      <TextField
                        fullWidth
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="e.g., Complete Water Bottle Package"
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                      />
                    </Box>

                    <Box>
                      <FieldLabel>Description</FieldLabel>
                      <TextField
                        fullWidth
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Describe what this product group contains…"
                        multiline
                        rows={3}
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                      />
                    </Box>

                    <Box sx={{ maxWidth: 240 }}>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        fullWidth
                        name="is_active"
                        value={values.is_active}
                        onChange={handleChange}
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                        renderValue={(val) => (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: val ? "#22c55e" : "#94a3b8",
                              }}
                            />
                            <span>{val ? "Active" : "Inactive"}</span>
                          </Stack>
                        )}
                      >
                        <MenuItem value={true as any}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                            <span>Active</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value={false as any}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
                            <span>Inactive</span>
                          </Stack>
                        </MenuItem>
                      </Select>
                    </Box>
                  </Stack>
                </SectionCard>

                {/* ── Products ────────────────────────────────────────────── */}
                <SectionCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.25,
                          background: "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Package size={16} color="#2563eb" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          Products in Group
                        </Typography>
                        {selectedProducts.length > 0 && (
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} added
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Button
                      variant="contained"
                      startIcon={<Plus size={15} />}
                      size="small"
                      onClick={() => setShowProductDialog(true)}
                      sx={{
                        borderRadius: 1.5,
                        background: "#6366f1",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        px: 2,
                        boxShadow: "0 1px 3px rgba(99,102,241,0.35)",
                        "&:hover": { background: "#4f46e5" },
                      }}
                    >
                      Add Product
                    </Button>
                  </Stack>

                  {selectedProducts.length === 0 ? (
                    <Box
                      sx={{
                        border: "2px dashed #e2e8f0",
                        borderRadius: 2,
                        py: 5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                        background: "#fafbfc",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ShoppingCart size={22} color="#94a3b8" />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                        No products yet
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Click "Add Product" to include items in this group
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e8edf3",
                          overflow: "hidden",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ background: "#f8fafc" }}>
                              {["#", "Product", "Variant", "Qty", "Cost", "Selling", ""].map((h) => (
                                <TableCell
                                  key={h}
                                  align={["Cost", "Selling"].includes(h) ? "right" : "left"}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.72rem",
                                    color: "#64748b",
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                    py: 1.25,
                                    borderBottom: "1px solid #e8edf3",
                                  }}
                                >
                                  {h}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProducts.map((product, index) => {
                              const productData = availableProducts.find(
                                (p) => p.id === product.product_id
                              );
                              const hasVariants = product.variants && product.variants.length > 0;

                              return (
                                <TableRow
                                  key={index}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "&:hover": { background: "#fafbff" },
                                    transition: "background 0.15s",
                                  }}
                                >
                                  {/* Position */}
                                  <TableCell sx={{ width: 40 }}>
                                    <Box
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 1,
                                        background: "#f1f5f9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "0.72rem",
                                        color: "#64748b",
                                      }}
                                    >
                                      {product.position}
                                    </Box>
                                  </TableCell>

                                  {/* Product name + SKU */}
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                      {product.product_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                                      {productData?.sku}
                                    </Typography>
                                  </TableCell>

                                  {/* Variant */}
                                  <TableCell sx={{ minWidth: 160 }}>
                                    {hasVariants ? (
                                      <Select
                                        size="small"
                                        value={product.variant_sku || ""}
                                        onChange={(e) => handleVariantChange(index, e.target.value)}
                                        sx={{ minWidth: 150, borderRadius: 1.25, fontSize: "0.82rem" }}
                                        displayEmpty
                                      >
                                        <MenuItem value="">
                                          <em style={{ color: "#94a3b8" }}>Select variant</em>
                                        </MenuItem>
                                        {product.variants?.map((v) => (
                                          <MenuItem key={v.sku} value={v.sku}>
                                            {v.variant_name}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    ) : (
                                      <Chip
                                        label="No variants"
                                        size="small"
                                        sx={{
                                          fontSize: "0.7rem",
                                          height: 22,
                                          background: "#f1f5f9",
                                          color: "#94a3b8",
                                        }}
                                      />
                                    )}
                                  </TableCell>

                                  {/* Quantity */}
                                  <TableCell sx={{ width: 90 }}>
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={product.quantity}
                                      onChange={(e) => handleQtyChange(index, e.target.value)}
                                      inputProps={{ min: "1" }}
                                      sx={{
                                        width: 76,
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 1.25,
                                          fontSize: "0.85rem",
                                        },
                                      }}
                                    />
                                  </TableCell>

                                  {/* Cost */}
                                  <TableCell align="right">
                                    <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                                      ₹{(productData?.cost_price || 0).toFixed(2)}
                                    </Typography>
                                  </TableCell>

                                  {/* Selling */}
                                  <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                      ₹{(productData?.selling_price || 0).toFixed(2)}
                                    </Typography>
                                  </TableCell>

                                  {/* Remove */}
                                  <TableCell align="center" sx={{ width: 48 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveProduct(index)}
                                      sx={{
                                        color: "#cbd5e1",
                                        "&:hover": { color: "#ef4444", background: "#fff1f2" },
                                        transition: "color 0.15s, background 0.15s",
                                      }}
                                    >
                                      <Trash2 size={15} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* ── Summary strip ──────────────────────────────────── */}
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        mt={2.5}
                      >
                        <SummaryCard
                          label="Total Cost"
                          value={`₹${totalCost.toFixed(2)}`}
                          icon={<Tag size={18} color="#7c3aed" />}
                          accent="#ede9fe"
                        />
                        <SummaryCard
                          label="Total Selling"
                          value={`₹${totalSelling.toFixed(2)}`}
                          icon={<ShoppingCart size={18} color="#2563eb" />}
                          accent="#dbeafe"
                        />
                        <SummaryCard
                          label="Total Profit"
                          value={`₹${totalProfit.toFixed(2)}`}
                          icon={<TrendingUp size={18} color="#059669" />}
                          accent="#d1fae5"
                        />
                      </Stack>
                    </>
                  )}
                </SectionCard>

                {/* ── Actions ─────────────────────────────────────────────── */}
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    sx={{
                      borderRadius: 1.5,
                      borderColor: "#e2e8f0",
                      color: "#475569",
                      fontWeight: 600,
                      "&:hover": { borderColor: "#cbd5e1", background: "#f8fafc" },
                    }}
                  >
                    Cancel
                  </Button>
                  <BBButton
                    type="submit"
                    disabled={isLoading || selectedProducts.length === 0}
                    loading={isLoading}
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 600,
                      background: "#6366f1",
                      px: 3,
                      "&:hover": { background: "#4f46e5" },
                    }}
                  >
                    {isLoading ? "Updating…" : "Save Changes"}
                  </BBButton>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>

      {/* ── Product selection dialog ─────────────────────────────────────── */}
      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, border: "1px solid #e8edf3" },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Add Products
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Search and select products to add to this group
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or SKU…"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
          />

          {productsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#6366f1" }} />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                No products match your search
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1} sx={{ maxHeight: 380, overflow: "auto", pr: 0.5 }}>
              {filteredProducts.map((product: ProductItem) => {
                const alreadyAdded = selectedProducts.some((p) => p.product_id === product.id);
                return (
                  <Box
                    key={product.id}
                    onClick={() => {
                      if (!alreadyAdded) {
                        handleAddProduct(product);
                        setShowProductDialog(false);
                      }
                    }}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alreadyAdded ? "#e2e8f0" : "#e8edf3",
                      cursor: alreadyAdded ? "not-allowed" : "pointer",
                      opacity: alreadyAdded ? 0.5 : 1,
                      background: alreadyAdded ? "#f8fafc" : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": alreadyAdded
                        ? {}
                        : {
                            borderColor: "#a5b4fc",
                            background: "#fafbff",
                            boxShadow: "0 2px 8px rgba(99,102,241,0.1)",
                          },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8", fontFamily: "monospace" }}
                        >
                          {product.sku}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Stack alignItems="flex-end" spacing={0.25}>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Cost{" "}
                            <strong style={{ color: "#1e293b" }}>₹{product.cost_price.toFixed(2)}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Sell{" "}
                            <strong style={{ color: "#059669" }}>₹{product.selling_price.toFixed(2)}</strong>
                          </Typography>
                        </Stack>
                        {product.variants && product.variants.length > 0 && (
                          <Chip
                            label={`${product.variants.length}v`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              background: "#ede9fe",
                              color: "#7c3aed",
                              fontWeight: 700,
                            }}
                          />
                        )}
                        {alreadyAdded && (
                          <Chip
                            label="Added"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              background: "#d1fae5",
                              color: "#059669",
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setShowProductDialog(false)}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 1.5,
              borderColor: "#e2e8f0",
              color: "#475569",
              "&:hover": { borderColor: "#cbd5e1" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}