"use client";

import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { X, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ItemGroup, ItemGroupComponent, ItemGroupComponentInput } from "@/models/item-group.model";
import { useItemGroups } from "@/hooks/useItemGroups";
import { Item } from "@/models/item.model";
import { itemService } from "@/services/itemService";

interface ItemGroupDrawerProps {
  open: boolean;
  onClose: () => void;
  itemGroup?: ItemGroup;
  onSave: (itemGroup: any) => Promise<void>;
}

const emptyComponent: ItemGroupComponentInput = {
  item_id: "",
  variant_sku: "",
  quantity: 1,
  description: "",
  variant_details: {},
};

interface StockIssue {
  item: string;
  required: number;
  available: number;
  message: string;
}

// Parse insufficient inventory error and extract stock issues
const parseInsufficientInventoryError = (errorMessage: string): StockIssue[] => {
  const issues: StockIssue[] = [];
  
  // Match pattern: "Insufficient stock: ItemName (required: X, available: Y)"
  const pattern = /Insufficient stock:\s*(.+?)\s*\(required:\s*(\d+),\s*available:\s*(\d+)\)/g;
  let match;
  
  while ((match = pattern.exec(errorMessage)) !== null) {
    issues.push({
      item: match[1].trim(),
      required: parseInt(match[2]),
      available: parseInt(match[3]),
      message: `Required: ${match[2]}, Available: ${match[3]}`,
    });
  }
  
  return issues;
};

export default function ItemGroupDrawer({ open, onClose, itemGroup, onSave }: ItemGroupDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemDetails, setSelectedItemDetails] = useState<Item | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    account: "",
    is_active: true,
  });

  const [components, setComponents] = useState<ItemGroupComponentInput[]>([]);
  const [editingComponentIndex, setEditingComponentIndex] = useState<number | null>(null);
  const [tempComponent, setTempComponent] = useState<ItemGroupComponentInput>(emptyComponent);
  const [tempSelectedVariant, setTempSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  useEffect(() => {
    if (itemGroup) {
      setFormData({
        name: itemGroup.name,
        description: itemGroup.description || "",
        account: itemGroup.account || "",
        is_active: itemGroup.is_active,
      });
      setComponents(itemGroup.components);
      setError(null);
      setSuccess(false);
    } else {
      setFormData({
        name: "",
        description: "",
        account: "",
        is_active: true,
      });
      setComponents([]);
      setError(null);
      setSuccess(false);
    }
    setEditingComponentIndex(null);
    setTempComponent(emptyComponent);
    setTempSelectedVariant(null);
    setSelectedItemDetails(null);
  }, [itemGroup, open]);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const response = await itemService.getItems(1, 1000);
      setItems(response.items || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please check your authorization.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenComponentForm = (index?: number) => {
    if (index !== undefined) {
      const component = components[index];
      setEditingComponentIndex(index);
      setTempComponent(component);
      
      // Fetch full item details
      const item = items.find((i) => i.id === component.item_id);
      if (item) {
        itemService
          .getItem(component.item_id)
          .then((response) => {
            const fullItemDetails = response.data || response;
            setSelectedItemDetails(fullItemDetails);
            
            // Find the variant if available (variant_sku is SKU)
            if (
              fullItemDetails.item_details?.structure === "variants" &&
              component.variant_sku
            ) {
              const variant = fullItemDetails.item_details.variants?.find(
                (v) => v.sku === component.variant_sku
              );
              setTempSelectedVariant(variant || null);
            }
          })
          .catch((error) => console.error("Error fetching item details:", error));
      }
    } else {
      setEditingComponentIndex(null);
      setTempComponent({ ...emptyComponent });
      setTempSelectedVariant(null);
      setSelectedItemDetails(null);
    }
  };

  const handleSaveComponent = () => {
    if (!tempComponent.item_id || tempComponent.quantity <= 0) {
      setError("Item and quantity are required");
      return;
    }

    // If selected item has variants, variant_sku should be set
    if (
      selectedItemDetails?.item_details?.structure === "variants" &&
      !tempComponent.variant_sku
    ) {
      setError("Please select a variant for this item");
      return;
    }

    const componentToSave = {
      ...tempComponent,
    };

    const updated = [...components];
    if (editingComponentIndex !== null) {
      updated[editingComponentIndex] = componentToSave;
    } else {
      updated.push(componentToSave);
    }
    setComponents(updated);
    setEditingComponentIndex(null);
    setTempComponent(emptyComponent);
    setTempSelectedVariant(null);
    setSelectedItemDetails(null);
    setError(null);
  };

  const handleRemoveComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index);
    setComponents(updated);
    // Reset form if editing was on this component
    if (editingComponentIndex === index) {
      setEditingComponentIndex(null);
      setTempComponent({ ...emptyComponent });
      setSelectedItemDetails(null);
      setTempSelectedVariant(null);
      setError(null);
    }
  };

  const handleItemSelect = async (item: Item | null) => {
    if (item) {
      try {
        // Fetch full item details to get variants
        const response = await itemService.getItem(item.id);
        const fullItemDetails = response.data || response;
        setSelectedItemDetails(fullItemDetails);
        setTempComponent({
          ...tempComponent,
          item_id: item.id,
          variant_details: {},
        });
        setTempSelectedVariant(null);

        // Auto-select single variant if exists
        if (
          fullItemDetails.item_details?.structure === "variants" &&
          fullItemDetails.item_details?.variants?.length === 1
        ) {
          const variant = fullItemDetails.item_details.variants[0];
          setTempSelectedVariant(variant);
          setTempComponent((prev) => ({
            ...prev,
            variant_sku: variant.sku,
            variant_details: variant.attribute_map || {},
          }));
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError("Failed to load item details");
      }
    } else {
      setSelectedItemDetails(null);
      setTempComponent({ ...emptyComponent });
      setTempSelectedVariant(null);
    }
  };

  const handleVariantSelect = (variantSku: string) => {
    if (!selectedItemDetails) return;

    const variant = selectedItemDetails.item_details.variants?.find(
      (v) => v.sku === variantSku
    );

    if (variant) {
      setTempSelectedVariant(variant);
      setTempComponent((prev) => ({
        ...prev,
        variant_sku: variant.sku, // Use variant SKU as identifier
        variant_details: variant.attribute_map || {}, // Include all variant attributes
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.name.trim()) {
        setError("Item Group name is required");
        return;
      }

      if (components.length === 0) {
        setError("At least one component is required");
        return;
      }

      const validComponents = components.every(
        (c) => c.item_id && c.quantity > 0
      );

      if (!validComponents) {
        setError("All components must have an item and positive quantity");
        return;
      }

      const payload = {
        ...formData,
        components,
      };

      await onSave(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ p: 3, width: 700, maxHeight: "100vh", overflowY: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            {itemGroup ? "Edit Item Group" : "Create Item Group"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        {/* Messages */}
        {error && (
          <Box sx={{ mb: 2 }}>
            {error.toLowerCase().includes("insufficient stock") ? (
              <Paper sx={{ p: 2, bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <AlertCircle size={20} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="error">
                      Insufficient Inventory
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Cannot save item group due to stock availability issues. Please set opening stock first.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, bgcolor: "white", borderRadius: 1, p: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 1.5 }}>
                    Stock Issues:
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {parseInsufficientInventoryError(error).map((issue, index) => (
                      <ListItem key={index} sx={{ py: 0.75, px: 0, flexDirection: "column", alignItems: "flex-start" }}>
                        <Typography variant="body2" fontWeight={500}>
                          {issue.item}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Required:</strong> {issue.required}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Available:</strong> {issue.available}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 500 }}>
                            Shortage: {issue.required - issue.available}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, pt: 1.5, borderTop: "1px solid #fecaca" }}>
                  Use the API endpoints <code>PUT /items/{'{id}'}/opening-stock</code> or <code>PUT /items/{'{id}'}/variants/opening-stock</code> to set opening stock.
                </Typography>
              </Paper>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
          </Box>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {itemGroup ? "Item Group updated successfully" : "Item Group created successfully"}
          </Alert>
        )}

        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Basic Information
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Group Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., 500ml Water Bottle Assembly Kit - Plain Flavor - Batch 100"
              disabled={loading}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of what the group contains and its purpose"
              disabled={loading}
            />
            <TextField
              label="Account (GL Account/Code)"
              fullWidth
              value={formData.account}
              onChange={(e) => handleInputChange("account", e.target.value)}
              placeholder="e.g., WIP - Assembly Bundles, Inventory - Kits"
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange("is_active", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Active"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Components */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            BOM Components ({components.length})
          </Typography>

          {/* Component Form */}
          {editingComponentIndex !== null || true ? (
            <Paper sx={{ p: 2, mb: 2, bgcolor: "#f9fafb" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {editingComponentIndex !== null ? "Edit Component" : "Add New Component"}
                </Typography>
                {editingComponentIndex !== null && (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingComponentIndex(null);
                      setTempComponent({ ...emptyComponent });
                      setSelectedItemDetails(null);
                      setTempSelectedVariant(null);
                      setError(null);
                    }}
                    color="inherit"
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              <Stack spacing={2}>
                {/* Item Autocomplete */}
                <Autocomplete
                  options={items}
                  getOptionLabel={(option) => `${option.name} (${option.id})`}
                  loading={loadingItems}
                  value={selectedItemDetails}
                  onChange={(_, value) => handleItemSelect(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Item *"
                      placeholder="Select an item"
                      disabled={loadingItems}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingItems ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                {/* Variant Selector */}
                {selectedItemDetails && 
                 selectedItemDetails.item_details?.structure === "variants" && 
                 selectedItemDetails.item_details?.variants && 
                 selectedItemDetails.item_details.variants.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel>Select Variant *</InputLabel>
                    <Select
                      value={tempSelectedVariant?.sku || ""}
                      onChange={(e) => handleVariantSelect(e.target.value)}
                      label="Select Variant *"
                    >
                      <MenuItem value="">
                        <em>Select variant</em>
                      </MenuItem>
                      {selectedItemDetails.item_details.variants.map((variant) => {
                        const attrStr = Object.entries(variant.attribute_map || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ");
                        return (
                          <MenuItem key={variant.sku} value={variant.sku}>
                            {variant.sku} - {attrStr}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}

                {/* Quantity */}
                <TextField
                  label="Quantity *"
                  fullWidth
                  type="number"
                  inputProps={{ step: "1", min: "1" }}
                  value={tempComponent.quantity}
                  onChange={(e) => {
                    const quantity = parseInt(e.target.value) || 0;
                    setTempComponent({
                      ...tempComponent,
                      quantity,
                    });
                  }}
                  disabled={loading}
                />

                {/* Description */}
                <TextField
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={tempComponent.description || ""}
                  onChange={(e) =>
                    setTempComponent({
                      ...tempComponent,
                      description: e.target.value,
                    })
                  }
                  placeholder="E.g., Component-specific notes, quality specs, source location, or handling instructions"
                  disabled={loading}
                />

                {/* Variant Details Editor */}
                {tempSelectedVariant || tempComponent.variant_sku ? (
                  <Box sx={{ p: 1.5, bgcolor: "#f0f4ff", borderRadius: 1, border: "1px solid #e0e8ff" }}>
                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 2 }}>
                      Variant Details
                    </Typography>

                    {/* Display variant attributes from variant */}
                    {tempSelectedVariant && Object.entries(tempSelectedVariant.attribute_map || {}).map(([key, value]) => (
                      <TextField
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        fullWidth
                        size="small"
                        value={tempComponent.variant_details?.[key] || value}
                        onChange={(e) =>
                          setTempComponent((prev) => ({
                            ...prev,
                            variant_details: {
                              ...prev.variant_details,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        sx={{ mb: 1 }}
                      />
                    ))}

                    {/* Summary */}
                    {Object.keys(tempComponent.variant_details || {}).length > 0 && (
                      <Box sx={{ pt: 1, borderTop: "1px solid #e0e8ff" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Variant Details Summary:
                        </Typography>
                        {Object.entries(tempComponent.variant_details || {}).map(([key, value]) => (
                          <Typography key={key} variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>{key}:</strong> {String(value)}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : null}

                {/* Save/Cancel Buttons */}
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingComponentIndex(null);
                      setTempComponent({ ...emptyComponent });
                      setSelectedItemDetails(null);
                      setTempSelectedVariant(null);
                      setError(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveComponent}
                    disabled={!tempComponent.item_id || tempComponent.quantity <= 0}
                  >
                    {editingComponentIndex !== null ? "Update" : "Add"} Component
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ) : null}

          {/* Components List */}
          {components.length === 0 ? (
            <Alert severity="info">No components added yet. Add one above.</Alert>
          ) : (
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Item & Variant</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {components.map((component, index) => {
                    const item = items.find((i) => i.id === component.item_id);
                    return (
                      <TableRow key={`${index}-${component.item_id}-${component.variant_sku || ''}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight={500}>
                              {item?.name || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {component.item_id}
                            </Typography>
                            {component.variant_sku && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                SKU: {component.variant_sku}
                                {component.variant_details && Object.keys(component.variant_details).length > 0 && (
                                  <>
                                    {", "}
                                    {Object.entries(component.variant_details)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')}
                                  </>
                                )}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600}>{component.quantity}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {component.description || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Button
                              size="small"
                              onClick={() => handleOpenComponentForm(index)}
                            >
                              Edit
                            </Button>
                            {components.length > 1 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveComponent(index)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} /> : <Save size={18} />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Item Group"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
