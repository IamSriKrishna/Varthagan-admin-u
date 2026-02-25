"use client";

import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Trash2, Plus, Save } from "lucide-react";
import { Item, ItemType, ItemStructure } from "@/models/item.model";
import { Vendor } from "@/models/vendor.model";
import { vendorService } from "@/services/vendorService";

interface ItemFormProps {
  item?: Item;
  onSave?: (data: any) => Promise<void>;
  loading?: boolean;
}

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

export default function ItemForm({ item, onSave, loading = false }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    type: (item?.type || "goods") as ItemType,
    item_details: {
      structure: (item?.item_details?.structure || "single") as ItemStructure,
      unit: item?.item_details?.unit || "piece",
      sku: item?.item_details?.sku || "",
      upc: item?.item_details?.upc || "",
      ean: item?.item_details?.ean || "",
      description: item?.item_details?.description || "",
      attribute_definitions: item?.item_details?.attribute_definitions || [],
      variants: item?.item_details?.variants || [],
    },
    sales_info: {
      account: item?.sales_info?.account || "",
      selling_price: item?.sales_info?.selling_price || 0,
      currency: item?.sales_info?.currency || "INR",
      description: item?.sales_info?.description || "",
    },
    purchase_info: {
      account: item?.purchase_info?.account || "",
      cost_price: item?.purchase_info?.cost_price || 0,
      currency: item?.purchase_info?.currency || "INR",
      preferred_vendor_id: item?.purchase_info?.preferred_vendor_id || null,
      description: item?.purchase_info?.description || "",
    },
    inventory: {
      track_inventory: item?.inventory?.track_inventory ?? true,
      inventory_account: item?.inventory?.inventory_account || "",
      inventory_valuation_method: item?.inventory?.inventory_valuation_method || "FIFO",
      reorder_point: item?.inventory?.reorder_point || 0,
    },
    return_policy: {
      returnable: item?.return_policy?.returnable ?? true,
    },
  });

  const [attributes, setAttributes] = useState<AttributeDefinition[]>(formData.item_details.attribute_definitions);
  const [variants, setVariants] = useState<Variant[]>(formData.item_details.variants);
  const [variantForm, setVariantForm] = useState<Partial<Variant>>({});
  const [attrForm, setAttrForm] = useState({key: "", options: ""});
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const handleInputChange = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".");
      let obj = { ...prev };
      let current: any = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Sync attributes when structure changes
  useEffect(() => {
    if (formData.item_details.structure === "single") {
      console.log("Structure changed to single - clearing attributes and variants");
      setAttributes([]);
      setVariants([]);
    } else {
      console.log("Structure changed to variants - attributes state:", attributes);
    }
  }, [formData.item_details.structure]);

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorService.getVendors(1, 100);
      setVendors(response.data || []);
    } catch (err) {
      console.error("Failed to load vendors:", err);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleAddAttribute = () => {
    if (!attrForm.key.trim()) {
      setError("Attribute key is required");
      return;
    }
    if (!attrForm.options.trim()) {
      setError("Attribute options are required");
      return;
    }

    const newAttr: AttributeDefinition = {
      key: attrForm.key,
      options: attrForm.options.split(",").map((o) => o.trim()),
    };

    setAttributes([...attributes, newAttr]);
    setAttrForm({ key: "", options: "" });
    setError(null);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!variantForm.sku?.trim()) {
      setError("Variant SKU is required");
      return;
    }
    if (!variantForm.selling_price || variantForm.selling_price <= 0) {
      setError("Valid selling price is required");
      return;
    }
    if (!variantForm.cost_price || variantForm.cost_price <= 0) {
      setError("Valid cost price is required");
      return;
    }
    if (!variantForm.stock_quantity || variantForm.stock_quantity < 0) {
      setError("Valid stock quantity is required");
      return;
    }

    // Validate that all attributes are mapped for variant items
    if (attributes.length > 0) {
      for (const attr of attributes) {
        if (!variantForm.attribute_map?.[attr.key]) {
          setError(`${attr.key} is required for variant`);
          return;
        }
      }
    }

    if (editingVariantIndex !== null) {
      const updated = [...variants];
      updated[editingVariantIndex] = variantForm as Variant;
      setVariants(updated);
      setEditingVariantIndex(null);
    } else {
      setVariants([...variants, variantForm as Variant]);
    }

    setVariantForm({});
    setError(null);
  };

  const handleEditVariant = (index: number) => {
    setVariantForm(variants[index]);
    setEditingVariantIndex(index);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (editingVariantIndex === index) {
      setEditingVariantIndex(null);
      setVariantForm({});
    }
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Item name is required");
        return;
      }

      if (!formData.item_details.sku.trim()) {
        setError("Item SKU is required");
        return;
      }

      console.log("=== FORM VALIDATION START ===");
      console.log("Structure:", formData.item_details.structure);
      console.log("Attributes state length:", attributes.length);
      console.log("Attributes data:", JSON.stringify(attributes));
      console.log("Variants state length:", variants.length);

      if (formData.item_details.structure === "variants") {
        if (attributes.length === 0) {
          setError("At least one attribute is required for variant items");
          console.error("Validation failed: No attributes found");
          return;
        }
        if (variants.length === 0) {
          setError("At least one variant is required");
          console.error("Validation failed: No variants found");
          return;
        }
        
        // Validate that all variants have all attributes mapped
        for (const variant of variants) {
          for (const attr of attributes) {
            if (!variant.attribute_map?.[attr.key]) {
              setError(`Variant ${variant.sku} missing attribute: ${attr.key}`);
              console.error(`Validation failed: Variant ${variant.sku} missing ${attr.key}`);
              return;
            }
          }
        }
      }

      const payload = {
        ...formData,
        item_details: {
          ...formData.item_details,
          ...(formData.item_details.structure === "variants" && {
            attribute_definitions: attributes || [],
            variants: variants.map(v => ({
              sku: v.sku,
              attribute_map: v.attribute_map || {},
              selling_price: v.selling_price,
              cost_price: v.cost_price,
              stock_quantity: v.stock_quantity,
            })) || [],
          }),
          ...(formData.item_details.structure !== "variants" && {
            attribute_definitions: [],
            variants: undefined,
          }),
        },
      };

      console.log("=== PAYLOAD DETAILS ===");
      console.log("Structure:", payload.item_details.structure);
      console.log("Attributes in payload:", JSON.stringify(payload.item_details.attribute_definitions));
      console.log("Attributes count:", payload.item_details.attribute_definitions.length);
      console.log("Variants count:", payload.item_details.variants?.length || 0);
      console.log("Full Payload:", JSON.stringify(payload, null, 2));
      console.log("=====================");

      await onSave?.(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
      console.error("Error in handleSave:", err);
    }
  };

  const isVariantStructure = formData.item_details.structure === "variants";

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Basic Information */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Basic Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Item Name"
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={loading}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <FormControl fullWidth disabled={loading}>
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

            <FormControl fullWidth disabled={loading}>
              <InputLabel>Structure</InputLabel>
              <Select
                value={formData.item_details.structure}
                label="Structure"
                onChange={(e) => handleInputChange("item_details.structure", e.target.value)}
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="variants">Variants</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Unit"
              fullWidth
              value={formData.item_details.unit}
              onChange={(e) => handleInputChange("item_details.unit", e.target.value)}
              disabled={loading}
            />
            <TextField
              label="SKU (Base)"
              fullWidth
              value={formData.item_details.sku}
              onChange={(e) => handleInputChange("item_details.sku", e.target.value)}
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="UPC"
              fullWidth
              value={formData.item_details.upc}
              onChange={(e) => handleInputChange("item_details.upc", e.target.value)}
              disabled={loading}
            />
            <TextField
              label="EAN"
              fullWidth
              value={formData.item_details.ean}
              onChange={(e) => handleInputChange("item_details.ean", e.target.value)}
              disabled={loading}
            />
          </Box>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.item_details.description}
            onChange={(e) => handleInputChange("item_details.description", e.target.value)}
            disabled={loading}
          />
        </Stack>
      </Card>

      {/* Attributes (for variant items) */}
      {isVariantStructure && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Variant Attributes
          </Typography>

          <Paper sx={{ p: 2, mb: 2, bgcolor: "#f9fafb" }}>
            <Stack spacing={2}>
              <TextField
                label="Attribute Name"
                fullWidth
                placeholder="e.g., Cap Type, Color, Size"
                value={attrForm.key}
                onChange={(e) => setAttrForm({ ...attrForm, key: e.target.value })}
                disabled={loading}
              />
              <TextField
                label="Options (comma-separated)"
                fullWidth
                placeholder="e.g., Red, Blue, Green"
                value={attrForm.options}
                onChange={(e) => setAttrForm({ ...attrForm, options: e.target.value })}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={handleAddAttribute}
                disabled={loading}
                startIcon={<Plus size={18} />}
              >
                Add Attribute
              </Button>
            </Stack>
          </Paper>

          {attributes.length > 0 && (
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Attribute</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Options</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attributes.map((attr, index) => (
                    <TableRow key={index}>
                      <TableCell>{attr.key}</TableCell>
                      <TableCell>{attr.options.join(", ")}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAttribute(index)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Card>
      )}

      {/* Variants */}
      {isVariantStructure && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Variants
          </Typography>

          <Paper sx={{ p: 2, mb: 2, bgcolor: "#f9fafb" }}>
            <Stack spacing={2}>
              <TextField
                label="Variant SKU"
                fullWidth
                value={variantForm.sku || ""}
                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                disabled={loading}
              />

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                  label="Selling Price"
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01" }}
                  value={variantForm.selling_price || ""}
                  onChange={(e) => setVariantForm({ ...variantForm, selling_price: parseFloat(e.target.value) })}
                  disabled={loading}
                />
                <TextField
                  label="Cost Price"
                  type="number"
                  fullWidth
                  inputProps={{ step: "0.01" }}
                  value={variantForm.cost_price || ""}
                  onChange={(e) => setVariantForm({ ...variantForm, cost_price: parseFloat(e.target.value) })}
                  disabled={loading}
                />
              </Box>

              <TextField
                label="Stock Quantity"
                type="number"
                fullWidth
                value={variantForm.stock_quantity || ""}
                onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) })}
                disabled={loading}
              />

              {/* Attribute Mapping */}
              {attributes.map((attr) => (
                <FormControl key={attr.key} fullWidth disabled={loading}>
                  <InputLabel>{attr.key}</InputLabel>
                  <Select
                    label={attr.key}
                    value={variantForm.attribute_map?.[attr.key] || ""}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        attribute_map: {
                          ...(variantForm.attribute_map || {}),
                          [attr.key]: e.target.value,
                        },
                      })
                    }
                  >
                    {attr.options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleAddVariant}
                  disabled={loading}
                  startIcon={<Plus size={18} />}
                >
                  {editingVariantIndex !== null ? "Update" : "Add"} Variant
                </Button>
                {editingVariantIndex !== null && (
                  <Button
                    onClick={() => {
                      setEditingVariantIndex(null);
                      setVariantForm({});
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>

          {variants.length > 0 && (
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Attributes</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Selling Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Cost Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant, index) => (
                    <TableRow key={index} sx={{ bgcolor: editingVariantIndex === index ? "#f0f4ff" : undefined }}>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell>
                        {Object.entries(variant.attribute_map)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </TableCell>
                      <TableCell align="right">{variant.selling_price}</TableCell>
                      <TableCell align="right">{variant.cost_price}</TableCell>
                      <TableCell align="right">{variant.stock_quantity}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button size="small" onClick={() => handleEditVariant(index)}>
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveVariant(index)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Sales Information */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Sales Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Sales Account"
            fullWidth
            value={formData.sales_info.account}
            onChange={(e) => handleInputChange("sales_info.account", e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Selling Price"
            type="number"
            fullWidth
            inputProps={{ step: "0.01" }}
            value={formData.sales_info.selling_price}
            onChange={(e) => handleInputChange("sales_info.selling_price", parseFloat(e.target.value))}
            disabled={loading}
          />
          <TextField
            label="Currency"
            fullWidth
            value={formData.sales_info.currency}
            onChange={(e) => handleInputChange("sales_info.currency", e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.sales_info.description}
            onChange={(e) => handleInputChange("sales_info.description", e.target.value)}
            disabled={loading}
          />
        </Stack>
      </Card>

      {/* Purchase Information */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Purchase Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Purchase Account"
            fullWidth
            value={formData.purchase_info.account}
            onChange={(e) => handleInputChange("purchase_info.account", e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Cost Price"
            type="number"
            fullWidth
            inputProps={{ step: "0.01" }}
            value={formData.purchase_info.cost_price}
            onChange={(e) => handleInputChange("purchase_info.cost_price", parseFloat(e.target.value))}
            disabled={loading}
          />
          <TextField
            label="Currency"
            fullWidth
            value={formData.purchase_info.currency}
            onChange={(e) => handleInputChange("purchase_info.currency", e.target.value)}
            disabled={loading}
          />
          <FormControl fullWidth disabled={loading || loadingVendors}>
            <InputLabel>Preferred Vendor</InputLabel>
            <Select
              value={formData.purchase_info.preferred_vendor_id ? String(formData.purchase_info.preferred_vendor_id) : ""}
              onChange={(e) => handleInputChange("purchase_info.preferred_vendor_id", e.target.value ? parseInt(e.target.value, 10) : null)}
              label="Preferred Vendor"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={String(vendor.id)}>
                  {vendor.display_name || vendor.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.purchase_info.description}
            onChange={(e) => handleInputChange("purchase_info.description", e.target.value)}
            disabled={loading}
          />
        </Stack>
      </Card>

      {/* Inventory */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Inventory Management
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.inventory.track_inventory}
                onChange={(e) => handleInputChange("inventory.track_inventory", e.target.checked)}
                disabled={loading}
              />
            }
            label="Track Inventory"
          />
          <TextField
            label="Inventory Account"
            fullWidth
            placeholder="e.g., Inventory - Water Bottles"
            helperText="Example: Inventory - {Product Type}"
            value={formData.inventory.inventory_account}
            onChange={(e) => handleInputChange("inventory.inventory_account", e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Inventory Valuation Method"
            fullWidth
            value={formData.inventory.inventory_valuation_method}
            onChange={(e) => handleInputChange("inventory.inventory_valuation_method", e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Reorder Point"
            type="number"
            fullWidth
            value={formData.inventory.reorder_point}
            onChange={(e) => handleInputChange("inventory.reorder_point", parseInt(e.target.value))}
            disabled={loading}
          />
        </Stack>
      </Card>

      {/* Return Policy */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Return Policy
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={formData.return_policy.returnable}
              onChange={(e) => handleInputChange("return_policy.returnable", e.target.checked)}
              disabled={loading}
            />
          }
          label="Item is Returnable"
        />
      </Card>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button size="large">Cancel</Button>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <Save size={20} />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Item"}
        </Button>
      </Box>
    </Box>
  );
}
