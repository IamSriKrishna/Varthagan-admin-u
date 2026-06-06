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
  const [rawMaterials, setRawMaterials] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LineItem | null>(null);
  const [bags, setBags] = useState<BagInput[]>([
    { bag_number: 1, actual_kg: 0 },
  ]);

  // Fetch purchase orders on dialog open
  useEffect(() => {
    if (open) {
      fetchPurchaseOrders();
    }
  }, [open]);

  const fetchPurchaseOrders = async () => {
    try {
      setPOLoading(true);
      const data = await apiService.get("/purchase-orders?page=1&limit=100");
      if (data.success && data.data?.purchase_orders) {
        setPurchaseOrders(data.data.purchase_orders);
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch purchase orders", "error");
    } finally {
      setPOLoading(false);
    }
  };

  const handlePOSelect = (po: PurchaseOrder | null) => {
    setSelectedPO(po);
    setFormData((prev) => ({
      ...prev,
      purchase_order_id: po?.id || "",
    }));

    if (po) {
      // Filter only raw materials from line items
      const rawMaterialItems = po.line_items.filter((item) => item.is_raw_material === true);
      setRawMaterials(rawMaterialItems);
    } else {
      setRawMaterials([]);
    }

    // Reset product selection
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

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.purchase_order_id.trim()) {
        showToastMessage("Purchase Order is required", "error");
        return;
      }
      if (!formData.product_id.trim()) {
        showToastMessage("Product is required", "error");
        return;
      }
      if (formData.expected_kg_per_bag <= 0) {
        showToastMessage("Expected KG per bag must be greater than 0", "error");
        return;
      }
      if (bags.length === 0) {
        showToastMessage("At least one bag is required", "error");
        return;
      }

      // Validate all bags have actual_kg values
      if (bags.some((b) => b.actual_kg <= 0)) {
        showToastMessage("All bags must have actual KG values greater than 0", "error");
        return;
      }

      setLoading(true);

      const payload: ReceiveRawMaterialInput = {
        purchase_order_id: formData.purchase_order_id,
        product_id: formData.product_id,
        expected_kg_per_bag: formData.expected_kg_per_bag,
        bags: bags,
      };

      const response = await rawMaterialService.receiveBags(payload);

      if (response.success) {
        showToastMessage("Raw materials received successfully", "success");
        handleClose();
      } else {
        showToastMessage(response.message || "Failed to receive raw materials", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to receive raw materials", "error");
    } finally {
      setLoading(false);
    }
  };

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
    onClose();
  };

  const totalExpectedKg = formData.expected_kg_per_bag * bags.length;
  const totalActualKg = bags.reduce((sum, b) => sum + b.actual_kg, 0);
  const shortage = totalExpectedKg - totalActualKg;

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

              <Autocomplete
                options={rawMaterials}
                getOptionLabel={(option) =>
                  `${option.product_name} (${option.quantity_per_pack}kg per bag x ${option.number_of_packs})`
                }
                value={selectedProduct}
                onChange={(_, value) => handleProductSelect(value)}
                disabled={!selectedPO || rawMaterials.length === 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Raw Material Product"
                    placeholder={
                      !selectedPO
                        ? "Select a purchase order first"
                        : rawMaterials.length === 0
                        ? "No raw materials in this PO"
                        : "Select a product"
                    }
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />

              <TextField
                label="Expected KG per Bag"
                type="number"
                value={formData.expected_kg_per_bag}
                disabled
                placeholder="Auto-populated from product"
                size="small"
                fullWidth
                inputProps={{ step: "0.01" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Bags Section */}
          {selectedProduct && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  Bags ({bags.length})
                </Typography>
                <Button
                  size="small"
                  onClick={handleAddBag}
                  startIcon={<Plus size={16} />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    color: "#4f63d2",
                    "&:hover": { bgcolor: "#f0f4ff" },
                  }}
                >
                  Add Bag
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>Bag #</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        Actual KG
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bags.map((bag, index) => (
                      <TableRow key={index} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          <TextField
                            type="number"
                            value={bag.bag_number}
                            onChange={(e) =>
                              handleBagChange(index, "bag_number", parseInt(e.target.value) || 0)
                            }
                            size="small"
                            sx={{
                              width: 80,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          <TextField
                            type="number"
                            value={bag.actual_kg}
                            onChange={(e) =>
                              handleBagChange(index, "actual_kg", parseFloat(e.target.value) || 0)
                            }
                            placeholder="e.g., 19.89"
                            size="small"
                            inputProps={{ step: "0.01" }}
                            sx={{
                              width: 120,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveBag(index)}
                            disabled={bags.length === 1}
                            sx={{
                              color: "#ef4444",
                              opacity: bags.length === 1 ? 0.5 : 1,
                              "&:hover": { bgcolor: "#fee2e2" },
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Summary */}
          <Paper
            sx={{
              p: 2,
              bgcolor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Total Expected KG:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {totalExpectedKg.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Total Actual KG:
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {totalActualKg.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 1,
                  borderTop: "1px solid #d1d5db",
                }}
              >
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Shortage:</Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: shortage > 0 ? "#ef4444" : "#10b981",
                  }}
                >
                  {shortage.toFixed(2)} KG ({(shortage * 1000).toFixed(0)}g)
                </Typography>
              </Box>
            </Stack>
          </Paper>
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
          disabled={!selectedProduct}
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
