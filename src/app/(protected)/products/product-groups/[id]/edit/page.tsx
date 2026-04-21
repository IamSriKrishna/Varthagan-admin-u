"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography, Card, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Chip } from "@mui/material";
import { BBTitle, BBButton } from "@/lib";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import useFetch from "@/hooks/useFetch";
import { showToastMessage } from "@/utils/toastUtil";
import { products } from "@/constants/apiConstants";
import { UpdateProductGroupInput, ProductGroupComponentInput, ProductGroupResponse } from "@/models/product-group.model";
import { UpdateProductGroupInput, ProductGroupComponentInput, ProductGroupResponse, ProductVariant } from "@/models/product-group.model";

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

export default function EditProductGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductComponent[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ProductGroupFormData | null>(null);

  const { data: productGroupData, loading: groupLoading } = useFetch<ProductGroupResponse>({
    url: `/product-groups/${params.id}`,
  });

  const { data: productsData, loading: productsLoading } = useFetch<{ products: any[]; total: number }>({
    url: products.postProduct,
  });

  useEffect(() => {
    if (productGroupData?.data) {
      setInitialValues({
        name: productGroupData.data.name,
        description: productGroupData.data.description,
        is_active: productGroupData.data.is_active,
      });
      const components = productGroupData.data.components.map(c => ({
        product_id: c.product_id,
        product_name: c.product_name,
        variant_sku: c.variant_sku,
        quantity: c.quantity,
        position: c.position,
        required: true,
      }));
      setSelectedProducts(components);
    }
  }, [productGroupData]);

  const availableProducts = productsData?.products?.map((p: any) => ({
    id: p.id,
    sku: p.product_details?.base_sku || p.sku,
    name: p.name,
    cost_price: p.purchase_info?.cost_price || 0,
    selling_price: p.sales_info?.selling_price || 0,
    variants: p.product_details?.variants || [],
  })) || [];

  const filteredProducts = searchTerm
    ? availableProducts.filter(
        (p: ProductItem) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableProducts;

  const handleAddProduct = (product: ProductItem) => {
    const exists = selectedProducts.some(p => p.product_id === product.id);
    
    if (exists) {
      showToastMessage("Product already added to group", "error");
      return;
    }

    const newProduct: SelectedProductComponent = {
      product_id: product.id,
      product_name: product.name,
      variant_sku: null,
      quantity: 1,
      position: selectedProducts.length + 1,
      variants: product.variants || [],
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setSearchTerm("");
    showToastMessage("Product added to group", "success");
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = selectedProducts.filter((_, i) => i !== index);
    newProducts.forEach((p, i) => (p.position = i + 1));
    setSelectedProducts(newProducts);
  };

  const handleVariantChange = (index: number, variantSku: string) => {
    const newProducts = [...selectedProducts];
    newProducts[index].variant_sku = variantSku || null;
    setSelectedProducts(newProducts);
  };

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
        components: selectedProducts,
      };

      const response = await productGroupService.updateProductGroup(params.id, payload);

      if (response?.data?.id) {
        showToastMessage(response.data.message || "Product group updated successfully", "success");
        router.push("/products/product-groups");
      } else {
        showToastMessage("Failed to update product group", "error");
      }
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error.message as string)
          : "Failed to update product group";
      showToastMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (groupLoading || !initialValues) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => router.back()}
          variant="text"
          sx={{ color: "#64748b" }}
        >
          Back
        </Button>
        <BBTitle title="Edit Product Group" />
      </Stack>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleUpdateProductGroup}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <Form>
            <Stack spacing={3}>
              {/* Basic Information Card */}
              <Card sx={{ p: 3, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Basic Information
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Product Group Name *
                    </Typography>
                    <TextField
                      fullWidth
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="e.g., Complete Water Bottle Package"
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Description
                    </Typography>
                    <TextField
                      fullWidth
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      placeholder="Full packaging solution including..."
                      multiline
                      rows={3}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Select
                      fullWidth
                      name="is_active"
                      value={values.is_active}
                      onChange={handleChange}
                      size="small"
                    >
                      <MenuItem value={true as any}>Active</MenuItem>
                      <MenuItem value={false as any}>Inactive</MenuItem>
                    </Select>
                  </Box>
                </Stack>
              </Card>

              {/* Products Selection Card */}
              <Card sx={{ p: 3, borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Products in Group ({selectedProducts.length})
                  </Typography>
                  <BBButton
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={() => {
                      setShowProductDialog(true);
                    }}
                  >
                    Add Product
                  </BBButton>
                </Stack>

                {selectedProducts.length === 0 ? (
                  <Alert severity="warning">
                    No products added yet. Click "Add Product" to get started.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Variant</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Cost</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Selling</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProducts.map((product, index) => {
                          const productData = availableProducts.find(
                            (p: ProductItem) => p.id === product.product_id
                          );
                          const hasVariants = product.variants && product.variants.length > 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>{product.position}</TableCell>
                              <TableCell>
                                <Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {product.product_name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {productData?.sku}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                {hasVariants ? (
                                  <Select
                                    size="small"
                                    value={product.variant_sku || ""}
                                    onChange={(e) => handleVariantChange(index, e.target.value)}
                                    sx={{ minWidth: 150 }}
                                  >
                                    <MenuItem value="">Select Variant</MenuItem>
                                    {product.variants?.map((variant) => (
                                      <MenuItem key={variant.sku} value={variant.sku}>
                                        {variant.variant_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    No variants
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={product.quantity}
                                  onChange={(e) => {
                                    const newProducts = [...selectedProducts];
                                    newProducts[index].quantity = parseInt(e.target.value) || 1;
                                    setSelectedProducts(newProducts);
                                  }}
                                  inputProps={{ min: "1" }}
                                  sx={{ width: "80px" }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                ₹{(productData?.cost_price || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                ₹{(productData?.selling_price || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Group Summary */}
                {selectedProducts.length > 0 && (
                  <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e2e8f0" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Box sx={{ flex: 1, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                          TOTAL COST
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          ₹{selectedProducts
                            .reduce((sum, p) => {
                              const prod = availableProducts.find(
                                (ap: ProductItem) => ap.id === p.product_id
                              );
                              return sum + (prod?.cost_price || 0) * p.quantity;
                            }, 0)
                            .toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                          TOTAL SELLING
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          ₹{selectedProducts
                            .reduce((sum, p) => {
                              const prod = availableProducts.find(
                                (ap: ProductItem) => ap.id === p.product_id
                              );
                              return sum + (prod?.selling_price || 0) * p.quantity;
                            }, 0)
                            .toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 2, backgroundColor: "#f0fdf4", borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                          TOTAL PROFIT
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#059669" }}>
                          ₹{selectedProducts
                            .reduce((sum, p) => {
                              const prod = availableProducts.find(
                                (ap: ProductItem) => ap.id === p.product_id
                              );
                              const cost = (prod?.cost_price || 0) * p.quantity;
                              const selling =
                                (prod?.selling_price || 0) * p.quantity;
                              return sum + (selling - cost);
                            }, 0)
                            .toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Card>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <BBButton
                  type="submit"
                  disabled={isLoading || selectedProducts.length === 0}
                  loading={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Product Group"}
                </BBButton>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>

      {/* Product Selection Dialog */}
      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Products</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: searchTerm ? <Search size={18} /> : null,
              }}
            />

            {productsLoading ? (
              <Typography color="textSecondary" align="center">
                Loading products...
              </Typography>
            ) : filteredProducts.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No products found
              </Typography>
            ) : (
              <Stack spacing={1} sx={{ maxHeight: "400px", overflow: "auto" }}>
                {filteredProducts.map((product: ProductItem) => (
                  <Card
                    key={product.id}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": { backgroundColor: "#f8fafc", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                    }}
                    onClick={() => {
                      handleAddProduct(product);
                      setShowProductDialog(false);
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {product.sku}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="flex-end">
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                            Cost: ₹{product.cost_price.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Sell: ₹{product.selling_price.toFixed(2)}
                          </Typography>
                        </Box>
                        {product.variants && product.variants.length > 0 && (
                          <Chip
                            label={`${product.variants.length} variants`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
