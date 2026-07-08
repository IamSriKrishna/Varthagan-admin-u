"use client";
import { BBButton, BBDialog, BBInputBase } from "@/lib";
import { apiService } from "@/lib/api/api.service";
import { rawMaterialService } from "@/lib/api/rawMaterialService";
import { ReceiveRawMaterialInput } from "@/models/rawMaterial.model";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface BagInput {
  bag_number: number;
  actual_kg: number;
}

interface LineItem {
  id: number;
  product_id: string;
  product_name: string;
  is_raw_material: boolean;
  raw_material_unit?: string;
  quantity_per_pack: number;
  number_of_packs: number;
}

interface PurchaseOrder {
  id: string;
  purchase_order_no: string;
  line_items: LineItem[];
}

interface RawMaterialDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function RawMaterialDialog({ open, onClose }: RawMaterialDialogProps) {
  const [loading, setLoading] = useState(false);
  const [poLoading, setPOLoading] = useState(false);
  const [formData, setFormData] = useState({
    purchase_order_id: "",
    product_id: "",
    expected_kg_per_bag: 0,
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [usedPurchaseOrderIds, setUsedPurchaseOrderIds] = useState<Set<string>>(new Set());
  const [rawMaterials, setRawMaterials] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LineItem | null>(null);
  const [bags, setBags] = useState<BagInput[]>([
    { bag_number: 1, actual_kg: 0 },
  ]);
  // For multi-product POs: bags per product and include flags
  const [bagsPerProduct, setBagsPerProduct] = useState<Record<string, BagInput[]>>({});
  const [includeProduct, setIncludeProduct] = useState<Record<string, boolean>>({});
  const [applyToAllMap, setApplyToAllMap] = useState<Record<string, number>>({});

  // Fetch purchase orders on dialog open
  useEffect(() => {
    if (open) {
      fetchPurchaseOrders();
      fetchUsedPurchaseOrders();
    }
  }, [open]);

  const fetchUsedPurchaseOrders = async () => {
    try {
      let offset = 0;
      const limit = 100;
      let allBags: any[] = [];

      while (true) {
        const response: any = await rawMaterialService.getBags(limit, offset);
        if (!response.success) break;
        const fetched = response.data?.bags || [];
        allBags = [...allBags, ...fetched];
        const total = response.data?.total || 0;
        if (allBags.length >= total || fetched.length < limit) break;
        offset += limit;
      }

      const usedIds = new Set<string>();
      allBags.forEach((b: any) => {
        if (b.purchase_order_id) usedIds.add(b.purchase_order_id);
      });

      setUsedPurchaseOrderIds(usedIds);
    } catch (err) {
      // silent fail: not critical for dialog; page will still work
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setPOLoading(true);
      const data = await apiService.get("/purchase-orders?page=1&limit=100");
      if (data.success && data.data?.purchase_orders) {
        // Keep only purchase orders that have at least one raw material line item
        const rawPo = data.data.purchase_orders.filter((po: PurchaseOrder) =>
          Array.isArray(po.line_items) && po.line_items.some((li: LineItem) => li.is_raw_material === true)
        );

        setPurchaseOrders(rawPo);
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch purchase orders", "error");
    } finally {
      setPOLoading(false);
    }
  };

  const handlePOSelect = (po: PurchaseOrder | null) => {
    // Prevent selecting a PO that's already used
    if (po && usedPurchaseOrderIds.has(po.id)) {
      showToastMessage("This Purchase Order has already been used to receive materials", "error");
      return;
    }

    setSelectedPO(po);
    setFormData((prev) => ({
      ...prev,
      purchase_order_id: po?.id || "",
    }));

    if (po) {
      // Filter only raw materials from line items
      const rawMaterialItems = po.line_items.filter((item) => item.is_raw_material === true);
      setRawMaterials(rawMaterialItems);

      // Initialize bags per product and include flags
      const initialBags: Record<string, BagInput[]> = {};
      const initialInclude: Record<string, boolean> = {};
      const initialApply: Record<string, number> = {};

      rawMaterialItems.forEach((product) => {
        const generated = Array.from({ length: product.number_of_packs }, (_, index) => ({
          bag_number: index + 1,
          actual_kg: 0,
        }));
        initialBags[product.product_id] = generated;
        initialInclude[product.product_id] = true;
        initialApply[product.product_id] = 0;
      });

      setBagsPerProduct(initialBags);
      setIncludeProduct(initialInclude);
      setApplyToAllMap(initialApply);
    } else {
      setRawMaterials([]);
      setBagsPerProduct({});
      setIncludeProduct({});
      setApplyToAllMap({});
    }

    // Reset product selection (single-product fallback)
    setSelectedProduct(null);
    setFormData((prev) => ({
      ...prev,
      product_id: "",
      expected_kg_per_bag: 0,
    }));
    setBags([{ bag_number: 1, actual_kg: 0 }]);
  };

  const handleProductSelect = (product: LineItem | null) => {
    setSelectedProduct(product);

    if (product) {
      setFormData((prev) => ({
        ...prev,
        product_id: product.product_id,
        expected_kg_per_bag: product.quantity_per_pack,
      }));

      // Auto-generate bags based on number_of_packs
      const generatedBags: BagInput[] = Array.from(
        { length: product.number_of_packs },
        (_, index) => ({
          bag_number: index + 1,
          actual_kg: 0,
        })
      );
      setBags(generatedBags);
    } else {
      setFormData((prev) => ({
        ...prev,
        product_id: "",
        expected_kg_per_bag: 0,
      }));
      setBags([{ bag_number: 1, actual_kg: 0 }]);
    }
  };

  const handleAddBag = () => {
    const nextBagNumber = Math.max(...bags.map((b) => b.bag_number), 0) + 1;
    setBags([...bags, { bag_number: nextBagNumber, actual_kg: 0 }]);
  };

  const handleRemoveBag = (index: number) => {
    setBags(bags.filter((_, i) => i !== index));
  };

  const handleBagChange = (index: number, field: keyof BagInput, value: any) => {
    const newBags = [...bags];
    newBags[index] = { ...newBags[index], [field]: value };
    setBags(newBags);
  };

  const handleBagChangeForProduct = (productId: string, index: number, field: keyof BagInput, value: any) => {
    const productBags = [...(bagsPerProduct[productId] || [])];
    productBags[index] = { ...productBags[index], [field]: value };
    setBagsPerProduct((prev) => ({ ...prev, [productId]: productBags }));
  };

  const handleApplyToAllForProduct = (productId: string) => {
    const value = applyToAllMap[productId] || 0;
    if (value <= 0) {
      showToastMessage("Please enter a value greater than 0", "error");
      return;
    }
    const updated = (bagsPerProduct[productId] || []).map((b) => ({ ...b, actual_kg: value }));
    setBagsPerProduct((prev) => ({ ...prev, [productId]: updated }));
    showToastMessage("Applied to all bags for product", "success");
  };

  const handleToggleIncludeProduct = (productId: string) => {
    setIncludeProduct((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.purchase_order_id.trim()) {
        showToastMessage("Purchase Order is required", "error");
        return;
      }

      // For multi-product POs: collect selected products and submit sequentially
      const productsToSubmit = rawMaterials.filter((p) => includeProduct[p.product_id]);
      if (productsToSubmit.length === 0) {
        showToastMessage("Select at least one product to receive", "error");
        return;
      }

      setLoading(true);

      for (const product of productsToSubmit) {
        const productBags = bagsPerProduct[product.product_id] || [];

        if (product.quantity_per_pack <= 0) {
          showToastMessage(`Expected KG per bag invalid for ${product.product_name}`, "error");
          setLoading(false);
          return;
        }

        if (productBags.length === 0) {
          showToastMessage(`At least one bag is required for ${product.product_name}`, "error");
          setLoading(false);
          return;
        }

        if (productBags.some((b) => b.actual_kg <= 0)) {
          showToastMessage(`All bags must have actual KG values greater than 0 for ${product.product_name}`, "error");
          setLoading(false);
          return;
        }

        const payload: ReceiveRawMaterialInput = {
          purchase_order_id: formData.purchase_order_id,
          product_id: product.product_id,
          expected_kg_per_bag: product.quantity_per_pack,
          bags: productBags,
        };

        // Submit per-product
        // eslint-disable-next-line no-await-in-loop
        const response = await rawMaterialService.receiveBags(payload);
        if (!response.success) {
          showToastMessage(response.message || `Failed to receive ${product.product_name}`, "error");
          setLoading(false);
          return;
        }
      }

      showToastMessage("Raw materials received successfully", "success");
      handleClose();
    } catch (error: any) {
      showToastMessage(error.message || "Failed to receive raw materials", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setFormData({
      purchase_order_id: "",
      product_id: "",
      expected_kg_per_bag: 0,
    });
    setSelectedPO(null);
    setSelectedProduct(null);
    setRawMaterials([]);
    setBags([{ bag_number: 1, actual_kg: 0 }]);
    setBagsPerProduct({});
    setIncludeProduct({});
    setApplyToAllMap({});
    onClose();
  };

  const totalExpectedKg = 0; // Multi-product: calculated per-product
  const totalActualKg = 0;   // Multi-product: calculated per-product
  const shortage = 0;        // Multi-product: calculated per-product

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
          Receive Raw Materials
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Basic Info Section */}
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1.5, color: "#374151" }}>
              Select Purchase Order & Product
            </Typography>
            <Stack spacing={2}>
              <Autocomplete
                options={purchaseOrders}
                getOptionLabel={(option) => `${option.purchase_order_no}`}
                value={selectedPO}
                onChange={(_, value) => handlePOSelect(value)}
                loading={poLoading}
                disabled={poLoading}
                getOptionDisabled={(option) => usedPurchaseOrderIds.has(option.id)}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{option.purchase_order_no}</span>
                      {usedPurchaseOrderIds.has(option.id) && (
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          (Already used)
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Purchase Order"
                    placeholder="Select a purchase order"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {poLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
                filterOptions={(options, state) =>
                  options.filter((option) =>
                    option.purchase_order_no
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
              />

            </Stack>
          </Box>

          {/* Multi-Product Section */}
          {selectedPO && rawMaterials.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 2, color: "#374151" }}>
                Select Products to Receive
              </Typography>
              <Stack spacing={3}>
                {rawMaterials.map((product) => (
                  <Paper
                    key={product.product_id}
                    sx={{
                      p: 2,
                      border: includeProduct[product.product_id] ? "2px solid #4f63d2" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      bgcolor: includeProduct[product.product_id] ? "#f0f4ff" : "#ffffff",
                    }}
                  >
                    {/* Product Header with Checkbox */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <input
                        type="checkbox"
                        checked={includeProduct[product.product_id] || false}
                        onChange={() => handleToggleIncludeProduct(product.product_id)}
                        style={{ cursor: "pointer", width: 18, height: 18 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a1d2e" }}>
                          {product.product_name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          {product.quantity_per_pack}kg per bag × {product.number_of_packs} bags
                        </Typography>
                      </Box>
                    </Box>

                    {/* Apply to All Section */}
                    {includeProduct[product.product_id] && (
                      <Box sx={{ mb: 2 }}>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: "#ffffff",
                            border: "1px solid #c7d2fe",
                            borderRadius: "6px",
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-end",
                          }}
                        >
                          <TextField
                            label="Apply to All"
                            type="number"
                            value={applyToAllMap[product.product_id] || 0}
                            onChange={(e) =>
                              setApplyToAllMap((prev) => ({
                                ...prev,
                                [product.product_id]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="Enter KG value"
                            size="small"
                            inputProps={{ step: "0.01" }}
                            sx={{
                              flex: 1,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                              },
                            }}
                          />
                          <Button
                            onClick={() => handleApplyToAllForProduct(product.product_id)}
                            variant="contained"
                            size="small"
                            sx={{
                              textTransform: "none",
                              borderRadius: "6px",
                              backgroundColor: "#4f63d2",
                              whiteSpace: "nowrap",
                              "&:hover": { backgroundColor: "#3d4fb8" },
                            }}
                          >
                            Apply
                          </Button>
                        </Paper>
                      </Box>
                    )}

                    {/* Bags Table */}
                    {includeProduct[product.product_id] && (
                      <TableContainer
                        component={Paper}
                        sx={{
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Bag #</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Actual KG</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(bagsPerProduct[product.product_id] || []).map((bag, index) => (
                              <TableRow key={index} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                                <TableCell sx={{ fontSize: "0.75rem", py: 1 }}>
                                  <TextField
                                    type="number"
                                    value={bag.bag_number}
                                    onChange={(e) =>
                                      handleBagChangeForProduct(
                                        product.product_id,
                                        index,
                                        "bag_number",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      width: 60,
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontSize: "0.75rem", py: 1 }}>
                                  <TextField
                                    type="number"
                                    value={bag.actual_kg}
                                    onChange={(e) =>
                                      handleBagChangeForProduct(
                                        product.product_id,
                                        index,
                                        "actual_kg",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0.00"
                                    size="small"
                                    inputProps={{ step: "0.01" }}
                                    sx={{
                                      width: 90,
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center" sx={{ py: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const updated = (bagsPerProduct[product.product_id] || []).filter(
                                        (_, i) => i !== index
                                      );
                                      setBagsPerProduct((prev) => ({
                                        ...prev,
                                        [product.product_id]: updated,
                                      }));
                                    }}
                                    disabled={(bagsPerProduct[product.product_id] || []).length === 1}
                                    sx={{
                                      color: "#ef4444",
                                      opacity:
                                        (bagsPerProduct[product.product_id] || []).length === 1 ? 0.5 : 1,
                                      "&:hover": { bgcolor: "#fee2e2" },
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            color: "#374151",
            border: "1px solid #d1d5db",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Cancel
        </Button>
        <BBButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!selectedPO || rawMaterials.length === 0 || Object.values(includeProduct).every((v) => !v)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
          }}
        >
          Receive Materials
        </BBButton>
      </Box>
    </Dialog>
  );
}
