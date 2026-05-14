"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Button, Stack, Typography, Card, TextField,
  Alert, CircularProgress, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton,
} from "@mui/material";
import { BBTitle, BBButton } from "@/lib";
import { ArrowLeft, RotateCcw } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import useApi from "@/hooks/useApi";
import { showToastMessage } from "@/utils/toastUtil";
import { ProductGroupResponse } from "@/models/product-group.model";
import { ReorderProductGroupInput, ReorderResponse } from "@/models/purchase-order.model";

// ─── Component State ────────────────────────────────────────────────────────
interface ReorderComponent {
  product_id: string;
  product_name: string;
  variant_sku?: string | null;
  original_quantity: number;
  new_quantity: number;
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ReorderProductGroupPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { mutateApi: submitReorder } = useApi<ReorderResponse>(
    `/product-groups/${params.id}/reorder`,
    "POST"
  );

  // ─── State ────────────────────────────────────────────────────────────────
  const [components, setComponents] = useState<ReorderComponent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Fetch Product Group Data ─────────────────────────────────────────────
  const { data: productGroupData, loading: groupLoading } =
    useFetch<ProductGroupResponse>({
      url: `/product-groups/${params.id}`,
    });

  // ─── Initialize Components ────────────────────────────────────────────────
  useEffect(() => {
    if (productGroupData?.data?.components) {
      const initialComponents: ReorderComponent[] = productGroupData.data.components.map((comp) => ({
        product_id: comp.product_id,
        product_name: comp.product?.name || "Unknown Product",
        variant_sku: comp.variant_sku || null,
        original_quantity: comp.quantity,
        new_quantity: comp.quantity,
      }));
      setComponents(initialComponents);
    }
  }, [productGroupData]);

  // ─── Handle Quantity Change ───────────────────────────────────────────────
  const handleQuantityChange = (index: number, quantity: number) => {
    const newComponents = [...components];
    newComponents[index].new_quantity = Math.max(0, quantity);
    setComponents(newComponents);
  };

  // ─── Reset to Original ────────────────────────────────────────────────────
  const handleReset = (index: number) => {
    const newComponents = [...components];
    newComponents[index].new_quantity = newComponents[index].original_quantity;
    setComponents(newComponents);
  };

  // ─── Handle Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (components.length === 0) {
      showToastMessage("No components to reorder", "error");
      return;
    }

    // Validate all quantities are positive
    const hasInvalidQuantity = components.some((c) => c.new_quantity <= 0);
    if (hasInvalidQuantity) {
      showToastMessage("All quantities must be greater than 0", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: ReorderProductGroupInput = {
        products: components.map((c) => ({
          product_id: c.product_id,
          variant_sku: c.variant_sku || undefined,
          quantity: c.new_quantity,
        })),
      };

      const response = await submitReorder(payload);

      if (response?.status === "success") {
        showToastMessage(
          response.message || "Product group reordered successfully",
          "success"
        );
        setTimeout(() => {
          router.push("/products/product-groups");
        }, 800);
      } else {
        // Handle specific error codes from spec
        const errorCode = response?.error;
        let errorMessage = response?.message || "Failed to reorder";
        
        if (errorCode === "PRODUCT_NOT_FOUND_IN_GROUP") {
          errorMessage = "One or more products not found in this product group";
        } else if (errorCode === "INSUFFICIENT_STOCK") {
          errorMessage = response?.message || "Insufficient stock for quantity increase";
        } else if (errorCode === "MISSING_EXISTING_PRODUCTS") {
          errorMessage = "All existing products must be included in reorder";
        } else if (errorCode === "VARIANT_SKU_MISMATCH") {
          errorMessage = "Variant SKU doesn't match stored value";
        } else if (errorCode === "INVALID_QUANTITY") {
          errorMessage = "Quantity must be positive";
        } else if (errorCode === "PRODUCT_GROUP_NOT_FOUND") {
          errorMessage = "Product group not found";
        }
        
        showToastMessage(errorMessage, "error");
      }
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error.message as string)
          : "Failed to reorder product group";
      showToastMessage(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (groupLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 20,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography sx={{ color: "#64748b" }}>
            Loading product group...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!productGroupData?.data) {
    return (
      <Box sx={{ py: 10 }}>
        <Alert severity="error">Product group not found</Alert>
      </Box>
    );
  }

  const group = productGroupData.data;

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
        <BBTitle title={`Reorder: ${group.name}`} />
      </Stack>

      <Stack spacing={3}>
        {/* ── Group Info Card ────────────────────────────────────────────── */}
        <Card sx={{ p: 3, borderRadius: 2, backgroundColor: "#f0fdf4" }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#15803d" }}>
                PRODUCT GROUP
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {group.name}
              </Typography>
            </Box>
            {group.description && (
              <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                {group.description}
              </Typography>
            )}
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#15803d" }}>
                  COMPONENTS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {components.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#15803d" }}>
                  CURRENT TOTAL QTY
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {components.reduce((sum, c) => sum + c.original_quantity, 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#d97706" }}>
                  NEW TOTAL QTY
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#d97706" }}>
                  {components.reduce((sum, c) => sum + c.new_quantity, 0)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* ── Components Table ──────────────────────────────────────────────── */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Update Quantities
          </Typography>

          {components.length === 0 ? (
            <Alert severity="info">No components in this product group</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Variant SKU</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Current Qty
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      New Qty
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Change
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {components.map((comp, idx) => {
                    const change = comp.new_quantity - comp.original_quantity;
                    const isChanged = change !== 0;

                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {comp.product_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">
                            {comp.variant_sku || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {comp.original_quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={comp.new_quantity}
                            onChange={(e) =>
                              handleQuantityChange(idx, parseInt(e.target.value) || 0)
                            }
                            inputProps={{ min: "0", step: "1" }}
                            sx={{
                              width: "80px",
                              "& input": {
                                textAlign: "center",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: change > 0 ? "#15803d" : change < 0 ? "#dc2626" : "#64748b",
                            }}
                          >
                            {change > 0 ? "+" : ""}{change}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {isChanged && (
                            <IconButton
                              size="small"
                              onClick={() => handleReset(idx)}
                              sx={{
                                color: "#64748b",
                                "&:hover": { backgroundColor: "#f1f5f9" },
                              }}
                              title="Reset to original quantity"
                            >
                              <RotateCcw size={16} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* ─── Action Buttons ───────────────────────────────────────────── */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <BBButton
            onClick={handleSubmit}
            disabled={isSubmitting || components.length === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? "Reordering..." : `Reorder Product Group`}
          </BBButton>
        </Stack>
      </Stack>
    </Box>
  );
}
