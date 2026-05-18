"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Package2, PackageIcon, DollarSign, TrendingUp } from "lucide-react";
import ProductGroupSelect from "@/components/productGroups/ProductGroupSelect";
import ProductGroupAutocomplete from "@/components/productGroups/ProductGroupAutocomplete";
import { useProductGroups } from "@/hooks/useProductGroups";
import { ProductGroupListOutput, ProductGroupDetailsOutput } from "@/models/product-group.model";
import { showToastMessage } from "@/utils/toastUtil";

/**
 * Complete example of using Product Group dropdown components
 * Shows three different approaches:
 * 1. Simple Select (ProductGroupSelect)
 * 2. Searchable Autocomplete (ProductGroupAutocomplete)
 * 3. Custom Hook (useProductGroups)
 */
export default function ProductGroupSelectionExample() {
  // ─── State ─────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<ProductGroupListOutput | null>(null);
  const [detailedGroup, setDetailedGroup] = useState<ProductGroupDetailsOutput | null>(null);

  // ─── Hook usage ────────────────────────────────────────────────────────
  const {
    productGroups,
    selectedGroup: hookSelectedGroup,
    loading: hookLoading,
    error: hookError,
    fetchProductGroupById,
    clearSelectedGroup,
  } = useProductGroups();

  // ─── Event Handlers ────────────────────────────────────────────────────
  const handleSelectChange = (value: string | undefined) => {
    setSelectedId(value || "");
    showToastMessage(`Selected product group: ${value}`, "success");
  };

  const handleProductGroupSelect = (productGroup: ProductGroupListOutput) => {
    setDetailedGroup(null);
    console.log("Selected from Select component:", productGroup);
    showToastMessage(
      `Selected: ${productGroup.name} (${productGroup.components?.length || 0} components)`,
      "info"
    );
  };

  const handleAutocompleteChange = async (value: ProductGroupListOutput | null) => {
    setSelectedGroup(value);
    if (value) {
      console.log("Selected from Autocomplete component:", value);
      await fetchProductGroupById(value.id);
      showToastMessage(`Fetching details for: ${value.name}`, "info");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3, maxWidth: 1400 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>
        Product Group Selection Components
      </Typography>

      {/* ── Approach 1: Simple Select ────────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<Package2 size={24} />}
          title="Approach 1: Simple Select Dropdown"
          subheader="Best for basic dropdown selection with minimal space"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <ProductGroupSelect
              value={selectedId}
              onChange={handleSelectChange}
              label="Choose Product Group"
              required={true}
              onProductGroupSelect={handleProductGroupSelect}
              fullWidth
            />

            {selectedId && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Selected ID:</strong> {selectedId}
                </Typography>
                {detailedGroup && (
                  <>
                    <Typography variant="body2">
                      <strong>Name:</strong> {detailedGroup.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Components:</strong> {detailedGroup.components?.length}
                    </Typography>
                  </>
                )}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Approach 2: Searchable Autocomplete ─────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<PackageIcon size={24} />}
          title="Approach 2: Searchable Autocomplete"
          subheader="Best for large lists with search and filtering"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <ProductGroupAutocomplete
              value={selectedGroup}
              onChange={handleAutocompleteChange}
              label="Search Product Groups"
              filterActive={false}
              fullWidth
            />

            {selectedGroup && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Selected:</strong> {selectedGroup.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedGroup.is_active ? "Active" : "Inactive"}
                </Typography>
                <Typography variant="body2">
                  <strong>Components:</strong> {selectedGroup.components?.length || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Selling Price:</strong> ₹{selectedGroup.selling_price}
                </Typography>
              </Alert>
            )}

            {hookLoading && (
              <Alert severity="info">Loading product group details...</Alert>
            )}

            {hookError && <Alert severity="error">Error: {hookError}</Alert>}

            {hookSelectedGroup && (
              <Box>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Full Product Group Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Package2 size={18} />
                          <Typography variant="body2">
                            <strong>Name:</strong> {hookSelectedGroup.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DollarSign size={18} />
                          <Typography variant="body2">
                            <strong>Selling Price:</strong> ₹{hookSelectedGroup.selling_price}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TrendingUp size={18} />
                          <Typography variant="body2">
                            <strong>Profit:</strong> ₹{hookSelectedGroup.profit}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Components:</strong> {hookSelectedGroup.components?.length}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Description:</strong>{" "}
                          {hookSelectedGroup.description || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Created:</strong>{" "}
                          {new Date(hookSelectedGroup.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Components Table */}
                {hookSelectedGroup.components && hookSelectedGroup.components.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Components in This Group
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>
                              <strong>Product Name</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Quantity</strong>
                            </TableCell>
                            <TableCell>
                              <strong>SKU</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Type</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {hookSelectedGroup.components.map((component, index) => (
                            <TableRow key={index}>
                              <TableCell>{component.product?.name || "N/A"}</TableCell>
                              <TableCell align="right">{component.quantity}</TableCell>
                              <TableCell>{component.variant_sku || "N/A"}</TableCell>
                              <TableCell>
                                {component.product?.is_resource ? "Resource" : "Product"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Approach 3: Custom Hook ────────────────────────────────────── */}
      <Card>
        <CardHeader
          avatar={<TrendingUp size={24} />}
          title="Approach 3: Custom Hook for Advanced Control"
          subheader="Best for complex components needing full control"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                The useProductGroups hook provides:
              </Typography>
              <ul style={{ margin: "8px 0 0 0" }}>
                <li>Complete control over data fetching</li>
                <li>Fetch all product groups</li>
                <li>Fetch specific product group by ID</li>
                <li>Full loading and error states</li>
                <li>Automatic error notifications</li>
              </ul>
            </Alert>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Hook State:</strong>
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                <Typography variant="caption" component="div">
                  {`productGroups: ${productGroups.length} items`}
                </Typography>
                <Typography variant="caption" component="div">
                  {`selectedGroup: ${hookSelectedGroup ? hookSelectedGroup.name : "None"}`}
                </Typography>
                <Typography variant="caption" component="div">
                  {`loading: ${hookLoading}`}
                </Typography>
                <Typography variant="caption" component="div">
                  {`error: ${hookError || "None"}`}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Available Methods:</strong>
              </Typography>
              <Stack spacing={1} sx={{ ml: 2 }}>
                <Typography variant="caption">
                  • fetchProductGroups() - Fetch all product groups
                </Typography>
                <Typography variant="caption">
                  • fetchProductGroupById(id) - Fetch specific product group
                </Typography>
                <Typography variant="caption">
                  • clearSelectedGroup() - Clear current selection
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Code Examples ──────────────────────────────────────────────── */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Code Examples" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: "monospace" }}>
                Example 1: Using ProductGroupSelect
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", overflow: "auto" }}>
                <code style={{ fontSize: "0.75rem" }}>
                  {`const [selectedId, setSelectedId] = useState<string>("");

<ProductGroupSelect
  value={selectedId}
  onChange={setSelectedId}
  label="Choose Product Group"
  onProductGroupSelect={(pg) => console.log(pg)}
/>`}
                </code>
              </Paper>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: "monospace" }}>
                Example 2: Using ProductGroupAutocomplete
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", overflow: "auto" }}>
                <code style={{ fontSize: "0.75rem" }}>
                  {`const [selected, setSelected] = useState<ProductGroupListOutput | null>(null);

<ProductGroupAutocomplete
  value={selected}
  onChange={setSelected}
  filterActive={true}
/>`}
                </code>
              </Paper>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: "monospace" }}>
                Example 3: Using useProductGroups Hook
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", overflow: "auto" }}>
                <code style={{ fontSize: "0.75rem" }}>
                  {`const { selectedGroup, loading, fetchProductGroupById } = useProductGroups();

useEffect(() => {
  fetchProductGroupById("pg_123");
}, []);`}
                </code>
              </Paper>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
