"use client";

import React, { useState, useEffect } from "react";
import { FormikProps } from "formik";
import {
  Grid,
  TextField,
  Button,
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
  Box,
  Autocomplete,
  CircularProgress,
  Tooltip,
  Fade,
  Typography,
  Select,
  MenuItem,
  Alert,
  alpha,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { PurchaseOrder, PurchaseOrderLineItemInput } from "@/models/purchaseOrder.model";
import { Product } from "@/models/product";
import { calculateLineItemAmount } from "./purchaseOrderForm.utils";
import { productService } from "@/lib/api/productService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand: "#2563EB",
  brandLight: "#EFF6FF",
  brandBorder: "#BFDBFE",
  bg: "#FFFFFF",
  bgMuted: "#F8FAFC",
  bgHover: "#F1F5F9",
  border: "#E2E8F0",
  borderMd: "#CBD5E1",
  text: "#0F172A",
  textSub: "#475569",
  textMuted: "#64748B",
  textHint: "#94A3B8",
  textMd: "#1F2937",
  success: "#15803D",
  successBg: "#F0FDF4",
  successBdr: "#86EFAC",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  errorBdr: "#FCA5A5",
  radius: "10px",
  radiusSm: "7px",
  shadow: "0 1px 2px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.04)",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: T.radiusSm,
    fontSize: "0.875rem",
    background: T.bg,
    "& fieldset": { borderColor: T.border, borderWidth: "0.5px" },
    "&:hover fieldset": { borderColor: T.borderMd },
    "&.Mui-focused fieldset": { borderColor: "#93C5FD", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontSize: "0.8rem", color: T.textMuted },
  "& .MuiInputLabel-root.Mui-focused": { color: T.brand },
};

const selectSx = {
  borderRadius: T.radiusSm,
  fontSize: "0.875rem",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: T.border, borderWidth: "0.5px", borderRadius: T.radiusSm },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.borderMd },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#93C5FD", borderWidth: "1.5px" },
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: T.textSub, letterSpacing: "0.2px" }}>
        {label}
        {required && (
          <Box component="span" sx={{ color: T.error, ml: "2px" }}>
            *
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItemFormData extends PurchaseOrderLineItemInput {}
interface ProductOption {
  id: string;
  name: string;
}
interface PurchaseOrderLineItemsProps {
  formik: FormikProps<PurchaseOrder>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PurchaseOrderLineItems: React.FC<PurchaseOrderLineItemsProps> = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LineItemFormData>({
    product_id: "",
    product_name: "",
    sku: "",
    account: "Cost of Goods Sold",
    quantity: 1,
    purchase_unit: "",
    rate: 0,
    is_raw_material: false,
    raw_material_unit: "",
    number_of_packs: 0,
    quantity_per_pack: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    setLoadingProducts(true);
    productService
      .getProducts(1, 100)
      .then((r) => {
        if (r.products) setProducts(r.products as any);
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleOpen = (index?: number) => {
    if (index !== undefined) {
      const item = formik.values.line_items[index] as any;
      setFormData(item);
      setEditingIndex(index);
      if (item.product_id) {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          setSelectedProduct(product);
          if (item.variant_sku || item.sku) {
            setSelectedVariant(
              product.product_details?.variants?.find((v: any) => v.sku === (item.variant_sku || item.sku)) || null,
            );
          }
        }
      }
    } else {
      setFormData({
        product_id: "",
        product_name: "",
        sku: "",
        account: "Cost of Goods Sold",
        quantity: 1,
        purchase_unit: "",
        rate: 0,
        is_raw_material: false,
        raw_material_unit: "",
        number_of_packs: 0,
        quantity_per_pack: 0,
      });
      setEditingIndex(null);
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  const handleSave = () => {
    if (!formData.product_id || formData.rate < 0) {
      alert("Please fill all required fields correctly");
      return;
    }
    if (!formData.account) {
      alert("Please select an account");
      return;
    }

    // Validate raw material fields
    if ((formData as any).is_raw_material) {
      if (
        !(
          (formData as any).raw_material_unit &&
          (formData as any).number_of_packs > 0 &&
          (formData as any).quantity_per_pack > 0
        )
      ) {
        alert("Please fill all raw material fields");
        return;
      }
    } else {
      if (!formData.quantity || formData.quantity <= 0) {
        alert("Please fill all required fields correctly");
        return;
      }
    }

    const items_ = [...formik.values.line_items];

    // Calculate quantity for raw materials
    let calculatedQty = formData.quantity || 0;

    if ((formData as any).is_raw_material) {
      calculatedQty = ((formData as any).number_of_packs || 0) * ((formData as any).quantity_per_pack || 0);
    }

    const amount = calculatedQty * formData.rate;

    const lineItem: any = {
      ...formData,
      quantity: 0,
      purchase_unit: (formData as any).raw_material_unit || "kg",
      raw_material_unit: (formData as any).raw_material_unit || "kg",
      amount,
    };

    if (editingIndex !== null) {
      items_[editingIndex] = lineItem;
    } else {
      items_.push(lineItem);
    }
    formik.setFieldValue("line_items", items_);
    handleClose();
  };

  const handleDelete = (index: number) => {
    formik.setFieldValue(
      "line_items",
      formik.values.line_items.filter((_, i) => i !== index),
    );
  };

  const selectedProductOption = products.find((p) => p.id === formData.product_id);
  const total = formik.values.line_items.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Header row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: T.text }}>
            Line items
            {formik.values.line_items.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: "1px",
                  borderRadius: "99px",
                  background: T.brandLight,
                  color: T.brand,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  border: `0.5px solid ${T.brandBorder}`,
                }}
              >
                {formik.values.line_items.length}
              </Box>
            )}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: T.textMuted, mt: "2px" }}>
            Add products or services to this order
          </Typography>
        </Box>
        <Box
          onClick={() => handleOpen()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 2,
            py: 0.875,
            borderRadius: T.radiusSm,
            cursor: "pointer",
            background: T.brand,
            color: "#FFF",
            fontSize: "0.8rem",
            fontWeight: 600,
            boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
            transition: "all 0.15s",
            "&:hover": {
              background: "#1D4ED8",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            },
            "&:active": { transform: "none" },
          }}
        >
          <AddIcon sx={{ fontSize: 15 }} />
          Line Items
        </Box>
      </Box>

      {/* Error */}
      {formik.touched.line_items && typeof formik.errors.line_items === "string" && (
        <Alert
          severity="error"
          sx={{
            borderRadius: T.radiusSm,
            border: `0.5px solid ${T.errorBdr}`,
            background: T.errorBg,
            "& .MuiAlert-icon": { color: T.error },
          }}
        >
          <Typography sx={{ fontSize: "0.8rem" }}>{formik.errors.line_items}</Typography>
        </Alert>
      )}

      {/* Table */}
      {formik.values.line_items.length > 0 ? (
        <Fade in timeout={250}>
          <Box
            sx={{
              background: T.bg,
              border: `0.5px solid ${T.border}`,
              borderRadius: T.radius,
              overflow: "hidden",
              boxShadow: T.shadow,
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: T.bgMuted }}>
                    {["Item", "Account", "Qty", "Unit", "Rate (₹)", "Amount (₹)", ""].map((h) => (
                      <TableCell
                        key={h}
                        align={
                          ["Qty", "Unit", "Rate (₹)", "Amount (₹)"].includes(h) ? "right" : h === "" ? "center" : "left"
                        }
                        sx={{
                          fontSize: "0.67rem",
                          fontWeight: 700,
                          color: T.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.6px",
                          py: 1.25,
                          borderBottom: `0.5px solid ${T.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values.line_items.map((item, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:hover": { background: T.bgMuted },
                        transition: "background 0.15s",
                        borderBottom: idx < formik.values.line_items.length - 1 ? `0.5px solid ${T.border}` : "none",
                      }}
                    >
                      {/* Item */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "7px",
                              flexShrink: 0,
                              background: T.brandLight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: T.brand,
                            }}
                          >
                            <InventoryIcon sx={{ fontSize: 13 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: T.text }}>
                              {(item as any).product_name || (item as any).product_id || "—"}
                            </Typography>
                            {/* Show SKU if available */}
                            {(item as any).sku && (
                              <Typography sx={{ fontSize: "0.68rem", color: T.textMuted, mt: "1px" }}>
                                SKU: {(item as any).sku}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Account */}
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            px: 1.25,
                            py: "3px",
                            borderRadius: "99px",
                            background: "#F5F3FF",
                            border: "0.5px solid #DDD6FE",
                            color: "#7C3AED",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.account}
                        </Box>
                      </TableCell>

                      {/* Qty */}
                      <TableCell align="right">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                          {(item as any).is_raw_material ? (
                            <>
                              {(() => {
                                return (
                                  <>
                                    <Box
                                      sx={{
                                        display: "inline-flex",
                                        px: 1.25,
                                        py: "2px",
                                        borderRadius: "99px",
                                        background: "#FEF3C7",
                                        border: "0.5px solid #FCD34D",
                                        color: "#92400E",
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {(item as any).number_of_packs || 0} × {(item as any).quantity_per_pack || 0}
                                    </Box>
                                    <Typography sx={{ fontSize: "0.65rem", color: T.textMuted }}>
                                      {item.quantity} {(item as any).raw_material_unit || ""}
                                    </Typography>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <Box
                              sx={{
                                display: "inline-flex",
                                px: 1.25,
                                py: "2px",
                                borderRadius: "99px",
                                background: T.bgMuted,
                                border: `0.5px solid ${T.border}`,
                                color: T.textMd,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                minWidth: 36,
                                justifyContent: "center",
                              }}
                            >
                              {item.quantity}
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      {/* Unit */}
                      <TableCell align="right">
                        {(item as any).purchase_unit ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 1.25,
                              py: "2px",
                              borderRadius: "99px",
                              background: "#E0E7FF",
                              border: "0.5px solid #C7D2FE",
                              color: "#3730A3",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {(item as any).purchase_unit}
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: "0.75rem", color: T.textMuted }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Rate */}
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            color: T.textMd,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Amount */}
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: T.success,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpen(idx)}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                color: T.textMuted,
                                "&:hover": { background: T.brandLight, color: T.brand },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(idx)}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                color: T.textMuted,
                                "&:hover": { background: T.errorBg, color: T.error },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Subtotal footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                background: T.bgMuted,
                borderTop: `0.5px solid ${T.border}`,
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: T.textMuted, fontWeight: 500 }}>Subtotal</Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: T.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={250}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              background: T.bg,
              border: `1px dashed ${T.borderMd}`,
              borderRadius: T.radius,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                background: T.bgMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                border: `0.5px solid ${T.border}`,
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 22, color: T.textHint }} />
            </Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.textMd, mb: "4px" }}>
              No items yet
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: T.textMuted, mb: 2 }}>
              Add products or services to get started
            </Typography>
            <Box
              onClick={() => handleOpen()}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 2,
                py: 0.875,
                borderRadius: T.radiusSm,
                cursor: "pointer",
                background: T.brandLight,
                color: T.brand,
                border: `0.5px solid ${T.brandBorder}`,
                fontSize: "0.78rem",
                fontWeight: 600,
                transition: "all 0.15s",
                "&:hover": { background: "#DBEAFE" },
              }}
            >
              <AddIcon sx={{ fontSize: 14 }} />
              Add first item
            </Box>
          </Box>
        </Fade>
      )}

      {/* ── Dialog ────────────────────────────────────────────────────────── */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "14px",
            boxShadow: "0 8px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)",
            border: `0.5px solid ${T.border}`,
          },
        }}
      >
        {/* Dialog header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
            background: T.bgMuted,
            borderBottom: `0.5px solid ${T.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: T.brandLight,
                color: T.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {editingIndex !== null ? <EditOutlinedIcon sx={{ fontSize: 15 }} /> : <AddIcon sx={{ fontSize: 15 }} />}
            </Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: T.text }}>
              {editingIndex !== null ? "Edit line item" : "Add line item"}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: T.textMuted, "&:hover": { background: T.bgHover } }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Dialog body */}
        <DialogContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} sx={{ color: T.brand }} />
            </Box>
          ) : (
            <>
              <Field label="Product" required>
                <Autocomplete
                  size="small"
                  options={products}
                  getOptionLabel={(o) => `${o.name || ""}`}
                  value={selectedProductOption || null}
                  onChange={async (_, val) => {
                    const isRaw = (val as any)?.is_raw || false;
                    const isResource = (val as any)?.is_resource || false;
                    const isRawMaterial = isRaw || isResource;

                    setFormData({
                      ...formData,
                      product_id: val?.id || "",
                      product_name: val?.name || "",
                      is_raw_material: isRawMaterial,
                      raw_material_unit: isRawMaterial ? (isResource ? (val as any)?.resource_unit : "kg") : "",
                    });
                    if (val) {
                      setSelectedProduct(val);
                      setSelectedVariant(null);

                      // Set rate based on product type
                      let rateValue = 0;
                      if (isRaw) {
                        rateValue = (val as any)?.raw_cost_per_unit || 0;
                      } else if (isResource) {
                        rateValue = (val as any)?.resource_cost_per_unit || 0;
                      } else if (val.product_details?.variants?.length === 1) {
                        const v = val.product_details.variants[0];
                        setSelectedVariant(v);
                        rateValue = v.cost_price || 0;
                        setFormData((prev) => ({
                          ...prev,
                          rate: rateValue,
                          sku: v.sku,
                          is_raw_material: isRawMaterial,
                        }));
                      } else if (val.purchase_info?.cost_price) {
                        rateValue = val.purchase_info.cost_price;
                      }

                      if (isRaw || isResource) {
                        setFormData((prev) => ({ ...prev, rate: rateValue, is_raw_material: isRawMaterial }));
                      }
                    } else {
                      setSelectedProduct(null);
                      setSelectedVariant(null);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Search products…" sx={inputSx} />}
                  noOptionsText="No products found"
                />
              </Field>

              {/* Variant Selection - Only show for non-raw-material products */}
              {!(formData as any).is_raw_material &&
                selectedProduct?.product_details?.variants &&
                selectedProduct.product_details.variants.length > 0 && (
                  <Field
                    label={selectedProduct.product_details.variants.length > 1 ? "Variant" : "Product Variant"}
                    required={selectedProduct.product_details.variants.length > 1}
                  >
                    <Select
                      size="small"
                      fullWidth
                      value={(formData as any).sku || ""}
                      displayEmpty
                      onChange={(e) => {
                        const v = selectedProduct.product_details?.variants?.find((x: any) => x.sku === e.target.value);
                        if (v) {
                          setSelectedVariant(v);
                          setFormData((prev) => ({
                            ...prev,
                            rate: v.cost_price || 0,
                            sku: v.sku,
                          }));
                        }
                      }}
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled>
                        <em style={{ color: T.textHint, fontStyle: "normal" }}>Select variant…</em>
                      </MenuItem>
                      {selectedProduct.product_details?.variants?.map((v: any, i: number) => {
                        const attrs = Object.entries(v.attribute_map || {})
                          .map(([k, val]) => `${k}: ${val}`)
                          .join(", ");
                        return (
                          <MenuItem key={i} value={v.sku} sx={{ fontSize: "0.875rem" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography component="span" sx={{ fontWeight: 600 }}>
                                  {v.sku}
                                </Typography>
                                {attrs && (
                                  <Typography component="span" sx={{ fontSize: "0.8rem", color: T.textMuted }}>
                                    — {attrs}
                                  </Typography>
                                )}
                              </Box>
                              <Typography component="span" sx={{ fontSize: "0.75rem", color: T.textMuted }}>
                                ₹{v.cost_price?.toFixed(2) || "0.00"} (cost)
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Field>
                )}

              {/* Raw Material / Resource Info Display */}
              {(selectedProduct as any)?.is_raw || (selectedProduct as any)?.is_resource ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Specification Info */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      background: "#FEF3C7",
                      borderRadius: T.radiusSm,
                      border: "0.5px solid #FCD34D",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400E" }}>
                        {(selectedProduct as any)?.is_raw ? "Raw Material Details" : "Resource Details"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {(selectedProduct as any)?.is_raw && (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                              Specification:
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>
                              {(selectedProduct as any)?.raw_specification || "—"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                              Cost per unit:
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>
                              ₹{((selectedProduct as any)?.raw_cost_per_unit || 0).toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                              Weight per unit:
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>
                              {((selectedProduct as any)?.required_gram_per_unit || 0).toFixed(2)}g
                            </Typography>
                          </Box>
                        </>
                      )}
                      {(selectedProduct as any)?.is_resource && (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                              Resource Unit:
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>
                              {(selectedProduct as any)?.resource_unit || "—"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 500 }}>
                              Cost per unit:
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E" }}>
                              ₹{((selectedProduct as any)?.resource_cost_per_unit || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : null}

              {/* SKU Display - Only for non-raw materials or after variant selection */}
              {!(formData as any).is_raw_material && (formData as any).sku && (
                <Field label="SKU">
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      background: T.bgMuted,
                      borderRadius: T.radiusSm,
                      border: `0.5px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.text, fontFamily: "monospace" }}>
                      {(formData as any).sku}
                    </Typography>
                  </Box>
                </Field>
              )}

              <Field label="Account" required>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  sx={inputSx}
                  placeholder="e.g., Cost of Goods Sold"
                />
              </Field>

              {/* Raw Material Fields - Auto-show if product is raw */}
              {(formData as any).is_raw_material ? (
                <Grid container spacing={1.5}>
                  {/* Check if this is actually a raw product with weight-based calculation */}
                  {(selectedProduct as any)?.is_raw && ((selectedProduct as any)?.required_gram_per_unit || 0) > 0 ? (
                    <>
                      <Grid size={{ xs: 6 }} component="div">
                        <Field label="Number of Packs" required>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={(formData as any).number_of_packs || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, number_of_packs: parseFloat(e.target.value) || 0 })
                            }
                            sx={inputSx}
                            inputProps={{ step: "0.01", min: "0" }}
                            placeholder="e.g., 10"
                          />
                        </Field>
                      </Grid>
                      <Grid size={{ xs: 6 }} component="div">
                        <Field label="Quantity Per Pack" required>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={(formData as any).quantity_per_pack || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, quantity_per_pack: parseFloat(e.target.value) || 0 })
                            }
                            sx={inputSx}
                            inputProps={{ step: "0.01", min: "0" }}
                            placeholder="e.g., 20"
                          />
                        </Field>
                      </Grid>
                      <Grid size={{ xs: 12 }} component="div">
                        <Field label="Unit" required>
                          <TextField
                            fullWidth
                            size="small"
                            value={(formData as any).raw_material_unit || "kg"}
                            onChange={(e) => setFormData({ ...formData, raw_material_unit: e.target.value })}
                            sx={inputSx}
                            placeholder="e.g., kg"
                          />
                        </Field>
                      </Grid>
                      {/* Calculate and display total */}
                      {((formData as any).number_of_packs || 0) > 0 &&
                        ((formData as any).quantity_per_pack || 0) > 0 && (
                          <Grid size={{ xs: 12 }} component="div">
                            <Box
                              sx={{
                                px: 2,
                                py: 1.25,
                                background: "#D1FAE5",
                                borderRadius: T.radiusSm,
                                border: "0.5px solid #6EE7B7",
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.75,
                              }}
                            >
                              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#047857" }}>
                                📦 Total Calculation
                              </Typography>
                              {(() => {
                                const totalWeightKg =
                                  ((formData as any).number_of_packs || 0) * ((formData as any).quantity_per_pack || 0);
                                const totalUnits = (() => {
                                  if (
                                    (selectedProduct as any)?.required_gram_per_unit &&
                                    (selectedProduct as any)?.required_gram_per_unit > 0
                                  ) {
                                    const totalWeightGrams = totalWeightKg * 1000;
                                    return totalWeightGrams / (selectedProduct as any).required_gram_per_unit;
                                  }
                                  return totalWeightKg;
                                })();

                                return (
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    <Box
                                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                    >
                                      <Typography sx={{ fontSize: "0.75rem", color: "#047857" }}>
                                        Total Material: {(formData as any).number_of_packs || 0} ×{" "}
                                        {(formData as any).quantity_per_pack || 0}{" "}
                                        {(formData as any).raw_material_unit || "kg"}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 600,
                                          color: "#047857",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        = {totalWeightKg.toLocaleString("en-IN", { maximumFractionDigits: 2 })}{" "}
                                        {(formData as any).raw_material_unit || "kg"}
                                      </Typography>
                                    </Box>
                                    {(selectedProduct as any)?.required_gram_per_unit &&
                                      (selectedProduct as any)?.required_gram_per_unit > 0 && (
                                        <>
                                          <Box
                                            sx={{
                                              height: "1px",
                                              background: "rgba(4, 120, 87, 0.2)",
                                              my: 0.25,
                                            }}
                                          />
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Typography sx={{ fontSize: "0.75rem", color: "#047857", fontWeight: 500 }}>
                                              📊 Products you can make:
                                            </Typography>
                                            <Typography
                                              sx={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                color: "#047857",
                                                fontFamily: "monospace",
                                                background: "rgba(4, 120, 87, 0.1)",
                                                px: 1.25,
                                                py: 0.5,
                                                borderRadius: "4px",
                                              }}
                                            >
                                              {totalUnits.toLocaleString("en-IN", { maximumFractionDigits: 0 })} units
                                            </Typography>
                                          </Box>
                                          <Typography
                                            sx={{
                                              fontSize: "0.7rem",
                                              color: "#047857",
                                              fontStyle: "italic",
                                              opacity: 0.8,
                                            }}
                                          >
                                            ({totalWeightKg * 1000} g ÷{" "}
                                            {(selectedProduct as any)?.required_gram_per_unit}g per unit)
                                          </Typography>
                                        </>
                                      )}
                                  </Box>
                                );
                              })()}
                            </Box>
                          </Grid>
                        )}
                      <Grid size={{ xs: 12 }} component="div">
                        <Field label="Rate (₹) - Per Unit" required>
                          <Box
                            sx={{
                              px: 2,
                              py: 1.25,
                              background: T.bgMuted,
                              borderRadius: T.radiusSm,
                              border: `0.5px solid ${T.border}`,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.text, fontFamily: "monospace" }}
                            >
                              ₹{formData.rate.toFixed(2)}
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: T.textMuted, fontStyle: "italic" }}>
                              ({(selectedProduct as any)?.raw_specification || "—"})
                            </Typography>
                          </Box>
                        </Field>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid size={{ xs: 6 }} component="div">
                        <Field label="Number of Packs" required>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={(formData as any).number_of_packs || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, number_of_packs: parseFloat(e.target.value) || 0 })
                            }
                            sx={inputSx}
                            inputProps={{ step: "0.01", min: "0" }}
                            placeholder="e.g., 10"
                          />
                        </Field>
                      </Grid>
                      <Grid size={{ xs: 6 }} component="div">
                        <Field label="Quantity Per Pack" required>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={(formData as any).quantity_per_pack || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, quantity_per_pack: parseFloat(e.target.value) || 0 })
                            }
                            sx={inputSx}
                            inputProps={{ step: "0.01", min: "0" }}
                            placeholder="e.g., 20"
                          />
                        </Field>
                      </Grid>
                      <Grid size={{ xs: 12 }} component="div">
                        <Field label="Material Unit" required>
                          <TextField
                            fullWidth
                            size="small"
                            value={(formData as any).raw_material_unit || ""}
                            onChange={(e) => setFormData({ ...formData, raw_material_unit: e.target.value })}
                            sx={inputSx}
                            placeholder="e.g., kg, liter, pieces"
                          />
                        </Field>
                      </Grid>
                      <Grid size={{ xs: 12 }} component="div">
                        <Field label="Rate (₹)" required>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ step: "0.01", min: "0" }}
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                            sx={inputSx}
                          />
                        </Field>
                      </Grid>
                    </>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 4 }} component="div">
                    <Field label="Quantity" required>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        sx={inputSx}
                        inputProps={{ step: "0.01", min: "0" }}
                      />
                    </Field>
                  </Grid>
                  <Grid size={{ xs: 4 }} component="div">
                    <Field label="Unit">
                      <TextField
                        fullWidth
                        size="small"
                        value={(formData as any).purchase_unit || ""}
                        onChange={(e) => setFormData({ ...formData, purchase_unit: e.target.value })}
                        sx={inputSx}
                        placeholder="e.g., kg, pcs"
                      />
                    </Field>
                  </Grid>
                  <Grid size={{ xs: 4 }} component="div">
                    <Field label="Rate (₹)" required>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                        sx={inputSx}
                      />
                    </Field>
                  </Grid>
                </Grid>
              )}

              {/* Auto calculated amount */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.25,
                  background: T.successBg,
                  borderRadius: T.radiusSm,
                  border: `0.5px solid ${T.successBdr}`,
                }}
              >
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: T.success }}>
                  Calculated amount
                </Typography>
                <Typography
                  sx={{ fontSize: "0.95rem", fontWeight: 700, color: T.success, fontVariantNumeric: "tabular-nums" }}
                >
                  ₹{" "}
                  {(() => {
                    let qty = formData.quantity || 0;

                    if ((formData as any).is_raw_material) {
                      qty = ((formData as any).number_of_packs || 0) * ((formData as any).quantity_per_pack || 0);
                    }

                    return (qty * formData.rate).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    });
                  })()}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        {/* Dialog footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            px: 2.5,
            py: 1.75,
            background: T.bgMuted,
            borderTop: `0.5px solid ${T.border}`,
          }}
        >
          <Box
            onClick={handleClose}
            sx={{
              px: 2.25,
              py: 0.875,
              borderRadius: T.radiusSm,
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: T.textMuted,
              border: `0.5px solid ${T.border}`,
              background: T.bg,
              transition: "all 0.15s",
              "&:hover": { background: T.bgHover, borderColor: T.borderMd },
            }}
          >
            Cancel
          </Box>
          <Box
            onClick={handleSave}
            sx={{
              px: 2.5,
              py: 0.875,
              borderRadius: T.radiusSm,
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#FFF",
              background: T.brand,
              boxShadow: "0 1px 3px rgba(37,99,235,0.25)",
              transition: "all 0.15s",
              "&:hover": {
                background: "#1D4ED8",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              },
              "&:active": { transform: "none" },
            }}
          >
            {editingIndex !== null ? "Update item" : "Add item"}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderLineItems;
