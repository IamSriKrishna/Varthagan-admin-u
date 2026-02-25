// components/ItemEditDrawer.tsx
"use client";

import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { X, Plus, Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Item, ItemType, ItemStructure } from "@/models/item.model";

interface AttributeDefinition {
  key: string;
  options: string[];
}

interface Variant {
  sku: string;
  attribute_map: Record<string, string>;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
}

interface ItemEditDrawerProps {
  open: boolean;
  onClose: () => void;
  item: Item;
  onSave: (updatedItem: any) => Promise<void>;
}

export default function ItemEditDrawer({ open, onClose, item, onSave }: ItemEditDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    brand: item.brand || "",
    manufacturer: item.manufacturer || "",
    
    // Item Details
    structure: item.item_details.structure,
    unit: item.item_details.unit,
    sku: item.item_details.sku || "",
    upc: item.item_details.upc || "",
    ean: item.item_details.ean || "",
    mpn: item.item_details.mpn || "",
    isbn: item.item_details.isbn || "",
    description: item.item_details.description || "",
    
    // Sales Info
    salesAccount: item.sales_info.account,
    sellingPrice: item.sales_info.selling_price || 0,
    salesCurrency: item.sales_info.currency || "USD",
    salesDescription: item.sales_info.description || "",
    
    // Purchase Info
    purchaseAccount: item.purchase_info?.account || "",
    costPrice: item.purchase_info?.cost_price || 0,
    purchaseCurrency: item.purchase_info?.currency || "USD",
    preferredVendorId: item.purchase_info?.preferred_vendor_id || null,
    purchaseDescription: item.purchase_info?.description || "",
    
    // Inventory
    trackInventory: item.inventory?.track_inventory || false,
    inventoryAccount: item.inventory?.inventory_account || "",
    inventoryValuationMethod: item.inventory?.inventory_valuation_method || "FIFO",
    reorderPoint: item.inventory?.reorder_point || 0,
    
    // Return Policy
    returnable: item.return_policy?.returnable || false,
  });

  const [attributes, setAttributes] = useState<AttributeDefinition[]>(
    item.item_details.attribute_definitions || []
  );
  
  const [variants, setVariants] = useState<Variant[]>(
    item.item_details.variants || []
  );

  const isSingleStructure = formData.structure === "single";

  useEffect(() => {
    // Reset form when item changes
    setFormData({
      name: item.name,
      type: item.type,
      brand: item.brand || "",
      manufacturer: item.manufacturer || "",
      structure: item.item_details.structure,
      unit: item.item_details.unit,
      sku: item.item_details.sku || "",
      upc: item.item_details.upc || "",
      ean: item.item_details.ean || "",
      mpn: item.item_details.mpn || "",
      isbn: item.item_details.isbn || "",
      description: item.item_details.description || "",
      salesAccount: item.sales_info.account,
      sellingPrice: item.sales_info.selling_price || 0,
      salesCurrency: item.sales_info.currency || "USD",
      salesDescription: item.sales_info.description || "",
      purchaseAccount: item.purchase_info?.account || "",
      costPrice: item.purchase_info?.cost_price || 0,
      purchaseCurrency: item.purchase_info?.currency || "USD",
      preferredVendorId: item.purchase_info?.preferred_vendor_id || null,
      purchaseDescription: item.purchase_info?.description || "",
      trackInventory: item.inventory?.track_inventory || false,
      inventoryAccount: item.inventory?.inventory_account || "",
      inventoryValuationMethod: item.inventory?.inventory_valuation_method || "FIFO",
      reorderPoint: item.inventory?.reorder_point || 0,
      returnable: item.return_policy?.returnable || false,
    });
    setAttributes(item.item_details.attribute_definitions || []);
    setVariants(item.item_details.variants || []);
    setError(null);
    setSuccess(false);
  }, [item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: "", options: [] }]);
  };

  const handleUpdateAttribute = (index: number, field: "key" | "options", value: any) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        attribute_map: {},
        selling_price: 0,
        cost_price: 0,
        stock_quantity: 0,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatePayload: any = {
        name: formData.name,
        type: formData.type,
        brand: formData.brand || undefined,
        manufacturer: formData.manufacturer || undefined,
        
        item_details: {
          structure: formData.structure,
          unit: formData.unit,
          description: formData.description || undefined,
        },
        
        sales_info: {
          account: formData.salesAccount,
          currency: formData.salesCurrency,
          description: formData.salesDescription || undefined,
        },
        
        purchase_info: {
          account: formData.purchaseAccount,
          currency: formData.purchaseCurrency,
          preferred_vendor_id: formData.preferredVendorId || undefined,
          description: formData.purchaseDescription || undefined,
        },
        
        inventory: {
          track_inventory: formData.trackInventory,
          inventory_account: formData.inventoryAccount || undefined,
          inventory_valuation_method: formData.inventoryValuationMethod,
          reorder_point: formData.reorderPoint,
        },
        
        return_policy: {
          returnable: formData.returnable,
        },
      };

      // Add structure-specific fields
      if (isSingleStructure) {
        updatePayload.item_details.sku = formData.sku;
        updatePayload.item_details.upc = formData.upc || undefined;
        updatePayload.item_details.ean = formData.ean || undefined;
        updatePayload.item_details.mpn = formData.mpn || undefined;
        updatePayload.item_details.isbn = formData.isbn || undefined;
        updatePayload.sales_info.selling_price = formData.sellingPrice;
        updatePayload.purchase_info.cost_price = formData.costPrice;
      } else {
        updatePayload.item_details.attributes = attributes;
        updatePayload.item_details.variants = variants;
      }

      await onSave(updatePayload);
      setSuccess(true);
      
      // Close drawer after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 600, md: 720 },
          bgcolor: "#f8fafc",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 4,
            bgcolor: "white",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
              Edit Item
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Update item details and configuration
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
            <X size={24} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 4 }}>
          <Stack spacing={4}>
            {/* Alerts */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success">Item updated successfully!</Alert>
            )}

            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Basic Information
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Item Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  required
                />
                
                <FormControl fullWidth>
                  <InputLabel>Item Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Item Type"
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  >
                    <MenuItem value="goods">Goods</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Item Details */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Item Details
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  fullWidth
                  required
                />

                {isSingleStructure ? (
                  <>
                    <TextField
                      label="SKU"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="UPC"
                      value={formData.upc}
                      onChange={(e) => handleInputChange("upc", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="EAN"
                      value={formData.ean}
                      onChange={(e) => handleInputChange("ean", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="MPN"
                      value={formData.mpn}
                      onChange={(e) => handleInputChange("mpn", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="ISBN"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange("isbn", e.target.value)}
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    {/* Attributes */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Attributes
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Plus size={16} />}
                          onClick={handleAddAttribute}
                          variant="outlined"
                        >
                          Add Attribute
                        </Button>
                      </Box>
                      <Stack spacing={2}>
                        {attributes.map((attr, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 3,
                              bgcolor: "white",
                              borderRadius: 2,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                              <TextField
                                label="Attribute Key"
                                value={attr.key}
                                onChange={(e) => handleUpdateAttribute(index, "key", e.target.value)}
                                size="small"
                                sx={{ flex: 1 }}
                              />
                              <IconButton
                                onClick={() => handleRemoveAttribute(index)}
                                color="error"
                                size="small"
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Box>
                            <TextField
                              label="Options (comma-separated)"
                              value={attr.options.join(", ")}
                              onChange={(e) =>
                                handleUpdateAttribute(
                                  index,
                                  "options",
                                  e.target.value.split(",").map((s) => s.trim())
                                )
                              }
                              size="small"
                              fullWidth
                              placeholder="e.g., Red, Blue, Green"
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Variants */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Variants
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Plus size={16} />}
                          onClick={handleAddVariant}
                          variant="outlined"
                        >
                          Add Variant
                        </Button>
                      </Box>
                      <Stack spacing={2}>
                        {variants.map((variant, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 3,
                              bgcolor: "white",
                              borderRadius: 2,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                              <TextField
                                label="SKU"
                                value={variant.sku}
                                onChange={(e) => handleUpdateVariant(index, "sku", e.target.value)}
                                size="small"
                                sx={{ flex: 1 }}
                              />
                              <IconButton
                                onClick={() => handleRemoveVariant(index)}
                                color="error"
                                size="small"
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Box>
                            <Stack spacing={2}>
                              <TextField
                                label="Selling Price"
                                type="number"
                                value={variant.selling_price}
                                onChange={(e) =>
                                  handleUpdateVariant(index, "selling_price", parseFloat(e.target.value))
                                }
                                size="small"
                                fullWidth
                              />
                              <TextField
                                label="Cost Price"
                                type="number"
                                value={variant.cost_price}
                                onChange={(e) =>
                                  handleUpdateVariant(index, "cost_price", parseFloat(e.target.value))
                                }
                                size="small"
                                fullWidth
                              />
                              <TextField
                                label="Stock Quantity"
                                type="number"
                                value={variant.stock_quantity}
                                onChange={(e) =>
                                  handleUpdateVariant(index, "stock_quantity", parseInt(e.target.value))
                                }
                                size="small"
                                fullWidth
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Sales Information */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Sales Information
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Sales Account"
                  value={formData.salesAccount}
                  onChange={(e) => handleInputChange("salesAccount", e.target.value)}
                  fullWidth
                  required
                />
                {isSingleStructure && (
                  <TextField
                    label="Selling Price"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value))}
                    fullWidth
                  />
                )}
                <TextField
                  label="Currency"
                  value={formData.salesCurrency}
                  onChange={(e) => handleInputChange("salesCurrency", e.target.value)}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Purchase Information */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Purchase Information
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Purchase Account"
                  value={formData.purchaseAccount}
                  onChange={(e) => handleInputChange("purchaseAccount", e.target.value)}
                  fullWidth
                />
                {isSingleStructure && (
                  <TextField
                    label="Cost Price"
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value))}
                    fullWidth
                  />
                )}
                <TextField
                  label="Currency"
                  value={formData.purchaseCurrency}
                  onChange={(e) => handleInputChange("purchaseCurrency", e.target.value)}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Inventory Settings */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Inventory Settings
              </Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.trackInventory}
                      onChange={(e) => handleInputChange("trackInventory", e.target.checked)}
                    />
                  }
                  label="Track Inventory"
                />
                <TextField
                  label="Inventory Account"
                  value={formData.inventoryAccount}
                  onChange={(e) => handleInputChange("inventoryAccount", e.target.value)}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Valuation Method</InputLabel>
                  <Select
                    value={formData.inventoryValuationMethod}
                    label="Valuation Method"
                    onChange={(e) => handleInputChange("inventoryValuationMethod", e.target.value)}
                  >
                    <MenuItem value="FIFO">FIFO</MenuItem>
                    <MenuItem value="LIFO">LIFO</MenuItem>
                    <MenuItem value="Weighted Average">Weighted Average</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Reorder Point"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => handleInputChange("reorderPoint", parseInt(e.target.value))}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Return Policy */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Return Policy
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.returnable}
                    onChange={(e) => handleInputChange("returnable", e.target.checked)}
                  />
                }
                label="Returnable"
              />
            </Box>
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            bgcolor: "white",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Save size={18} />}
            disabled={loading}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}