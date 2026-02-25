import { BBButton, BBInputBase } from "@/lib";
import { gradients } from "@/styles/gradients";
import {
  Alert,
  Box,
  Card,
  Checkbox,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CheckCircle, Circle, Download, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AttributeRow {
  id: string;
  name: string;
  values: string[];
}

interface Variant {
  sku: string;
  price: number;
  default?: boolean;
  attributes: Record<string, string>;
}

interface VariantBuilderProps {
  initialData?: { variants: Variant[] };
  onSave: (data: { variants: Variant[] }) => void;
  readOnly?: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const VariantBuilder: React.FC<VariantBuilderProps> = ({ initialData, onSave, readOnly = false }) => {
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([
    { id: `row-${Date.now()}`, name: "", values: [] },
    { id: `row-${Date.now() + 1}`, name: "", values: [] },
  ]);
  const [currentValues, setCurrentValues] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showJSON, setShowJSON] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (initialData && initialData.variants && initialData.variants.length > 0 && !isInitialized) {
      setVariants(initialData.variants);
      const attributeMap = new Map<string, Set<string>>();

      initialData.variants.forEach((variant) => {
        Object.entries(variant.attributes).forEach(([attrName, attrValue]) => {
          if (!attributeMap.has(attrName)) {
            attributeMap.set(attrName, new Set());
          }
          attributeMap.get(attrName)?.add(attrValue);
        });
      });
      const reconstructedRows: AttributeRow[] = Array.from(attributeMap.entries()).map(([name, valuesSet], index) => ({
        id: `row-${Date.now()}-${index}`,
        name,
        values: Array.from(valuesSet),
      }));

      if (reconstructedRows.length > 0) {
        setAttributeRows(reconstructedRows);
      }

      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const validateAttributeName = (id: string, name: string): string => {
    if (!name.trim()) {
      return "Attribute name is required";
    }
    if (name.trim().length < 2) {
      return "Attribute name must be at least 2 characters";
    }
    const duplicates = attributeRows.filter(
      (row) => row.id !== id && row.name.toLowerCase().trim() === name.toLowerCase().trim(),
    );
    if (duplicates.length > 0) {
      return "Attribute name already exists";
    }
    return "";
  };

  const validateAttributeValue = (id: string, value: string): string => {
    if (!value.trim()) {
      return "Value is required";
    }
    if (value.trim().length < 1) {
      return "Value must be at least 1 character";
    }
    const row = attributeRows.find((r) => r.id === id);
    if (row && row.values.some((v) => v.toLowerCase() === value.toLowerCase().trim())) {
      return "This value already exists for this attribute";
    }
    return "";
  };

  const validateVariantPrice = (price: number): string => {
    if (price < 0) {
      return "Price cannot be negative";
    }
    if (price === 0) {
      return "Price must be greater than 0";
    }
    return "";
  };

  const validateVariantSKU = (sku: string): string => {
    if (!sku.trim()) {
      return "SKU is required";
    }
    if (sku.trim().length < 2) {
      return "SKU must be at least 2 characters";
    }
    return "";
  };

  const addAttributeRow = () => {
    setAttributeRows([...attributeRows, { id: `row-${Date.now()}`, name: "", values: [] }]);
  };

  const removeAttributeRow = (id: string) => {
    if (attributeRows.length <= 1) return;
    const rowToRemove = attributeRows.find((row) => row.id === id);

    if (rowToRemove && rowToRemove.name.trim()) {
      const updatedVariants = variants.filter((variant) => {
        return !variant.attributes.hasOwnProperty(rowToRemove.name);
      });
      setVariants(updatedVariants);
    }

    setAttributeRows(attributeRows.filter((row) => row.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`name-${id}`];
    delete newErrors[`value-${id}`];
    setErrors(newErrors);
  };

  const updateAttributeName = (id: string, name: string) => {
    setAttributeRows(attributeRows.map((row) => (row.id === id ? { ...row, name } : row)));

    const error = validateAttributeName(id, name);
    setErrors((prev) => ({
      ...prev,
      [`name-${id}`]: error,
    }));
  };

  const addValueToAttribute = (id: string) => {
    const value = currentValues[id]?.trim();

    setTouched((prev) => ({ ...prev, [`value-${id}`]: true }));

    const error = validateAttributeValue(id, value || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [`value-${id}`]: error }));
      return;
    }

    const row = attributeRows.find((r) => r.id === id);
    if (!row?.name.trim()) {
      setErrors((prev) => ({ ...prev, [`name-${id}`]: "Please enter attribute name first" }));
      setTouched((prev) => ({ ...prev, [`name-${id}`]: true }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`value-${id}`];
      return newErrors;
    });

    setAttributeRows(attributeRows.map((r) => (r.id === id ? { ...r, values: [...r.values, value] } : r)));
    setCurrentValues({ ...currentValues, [id]: "" });
  };

  const removeValue = (rowId: string, valueIndex: number) => {
    const row = attributeRows.find((r) => r.id === rowId);
    if (!row) return;

    const valueToRemove = row.values[valueIndex];
    const updatedVariants = variants.filter((variant) => {
      return variant.attributes[row.name] !== valueToRemove;
    });

    setVariants(updatedVariants);
    setAttributeRows(
      attributeRows.map((r) =>
        r.id === rowId ? { ...r, values: r.values.filter((_, idx) => idx !== valueIndex) } : r,
      ),
    );
  };

  const handleValueKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValueToAttribute(id);
    }
  };
  const attributesMatch = (attrs1: Record<string, string>, attrs2: Record<string, string>): boolean => {
    const keys1 = Object.keys(attrs1).sort();
    const keys2 = Object.keys(attrs2).sort();

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key, index) => {
      return key === keys2[index] && attrs1[key] === attrs2[key];
    });
  };

  const generateVariants = () => {
    const validRows = attributeRows.filter((row) => row.name.trim() && row.values.length > 0);

    let hasErrors = false;
    const newErrors: ValidationErrors = {};
    const newTouched: Record<string, boolean> = {};

    attributeRows.forEach((row) => {
      const nameError = validateAttributeName(row.id, row.name);
      if (nameError) {
        newErrors[`name-${row.id}`] = nameError;
        newTouched[`name-${row.id}`] = true;
        hasErrors = true;
      }
      if (row.name.trim() && row.values.length === 0) {
        newErrors[`value-${row.id}`] = "Please add at least one value";
        newTouched[`value-${row.id}`] = true;
        hasErrors = true;
      }
    });

    if (validRows.length === 0) {
      alert("Please add at least one complete attribute with name and values!");
      setErrors(newErrors);
      setTouched(newTouched);
      return;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setTouched(newTouched);
      return;
    }

    const combinations: {
      attrs: Record<string, string>;
      skuParts: string[];
    }[] = [];

    const generate = (index: number, currentAttrs: Record<string, string>, currentSkuParts: string[]) => {
      if (index === validRows.length) {
        combinations.push({
          attrs: currentAttrs,
          skuParts: currentSkuParts,
        });
        return;
      }

      const row = validRows[index];
      row.values.forEach((val) => {
        const newAttrs = { ...currentAttrs, [row.name]: val };
        const skuPart = `${row.name.toUpperCase().replace(/\s/g, "_")}_${val.toUpperCase().replace(/\s/g, "_")}`;
        generate(index + 1, newAttrs, [...currentSkuParts, skuPart]);
      });
    };

    generate(0, {}, []);

    const newVariants: Variant[] = combinations.map((combo, idx) => {
      const existingVariant = variants.find((v) => attributesMatch(v.attributes, combo.attrs));

      if (existingVariant) {
        return {
          ...existingVariant,
          attributes: combo.attrs,
        };
      } else {
        return {
          sku: combo.skuParts.join("-"),
          price: 0,
          default: variants.length === 0 && idx === 0,
          attributes: combo.attrs,
        };
      }
    });

    setVariants(newVariants);
  };

  const updateVariantPrice = (index: number, price: string) => {
    const numPrice = Number(price) || 0;
    const error = validateVariantPrice(numPrice);

    if (error) {
      setErrors((prev) => ({ ...prev, [`variant-price-${index}`]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`variant-price-${index}`];
        return newErrors;
      });
    }

    const updated = [...variants];
    updated[index].price = numPrice;
    setVariants(updated);
  };

  const updateVariantSKU = (index: number, sku: string) => {
    const error = validateVariantSKU(sku);

    if (error) {
      setErrors((prev) => ({ ...prev, [`variant-sku-${index}`]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`variant-sku-${index}`];
        return newErrors;
      });
    }

    const updated = [...variants];
    updated[index].sku = sku;
    setVariants(updated);
  };

  const toggleDefault = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      default: i === index,
    }));
    setVariants(updated);
  };

  const handleSave = () => {
    let hasErrors = false;
    const newErrors: ValidationErrors = {};

    variants.forEach((variant, idx) => {
      const skuError = validateVariantSKU(variant.sku);
      if (skuError) {
        newErrors[`variant-sku-${idx}`] = skuError;
        hasErrors = true;
      }

      const priceError = validateVariantPrice(variant.price);
      if (priceError) {
        newErrors[`variant-price-${idx}`] = priceError;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const output = { variants };
    if (onSave) {
      onSave(output);
    }
  };

  const handleExportJSON = () => {
    const output = { variants };
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-variants.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetBuilder = () => {
    setAttributeRows([
      { id: `row-${Date.now()}`, name: "", values: [] },
      { id: `row-${Date.now() + 1}`, name: "", values: [] },
    ]);
    setCurrentValues({});
    setVariants([]);
    setErrors({});
    setTouched({});
    setIsInitialized(false);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Please save after adding attributes. Any unsaved changes will be discarded.
            </Typography>
          </Alert>

          <Box display="flex" justifyContent="space-between" alignItems="center" my={3}>
            <Typography variant="h6" fontWeight={600}>
              Product Attributes
            </Typography>
            {!readOnly && attributeRows.length > 0 && (
              <BBButton variant="outlined" color="error" onClick={resetBuilder}>
                Reset All
              </BBButton>
            )}
          </Box>

          <Stack spacing={2}>
            {attributeRows.map((row, index) => (
              <Box key={row.id}>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, md: 4 }} component="div">
                    <BBInputBase
                      name={`name-${row.id}`}
                      label={index === 0 ? "Attribute Name" : ""}
                      placeholder="e.g., Size, Color"
                      value={row.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        updateAttributeName(row.id, e.target.value)
                      }
                      disabled={readOnly}
                      isError={touched[`name-${row.id}`] && !!errors[`name-${row.id}`]}
                      errorMessage={touched[`name-${row.id}`] ? errors[`name-${row.id}`] : ""}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }} component="div">
                    <BBInputBase
                      name={`value-${row.id}`}
                      label={index === 0 ? "Options" : ""}
                      placeholder="e.g., Small (press Enter to add)"
                      value={currentValues[row.id] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        setCurrentValues({ ...currentValues, [row.id]: e.target.value });
                        if (errors[`value-${row.id}`]) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors[`value-${row.id}`];
                            return newErrors;
                          });
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleValueKeyPress(e, row.id)
                      }
                      disabled={readOnly}
                      isError={touched[`value-${row.id}`] && !!errors[`value-${row.id}`]}
                      errorMessage={
                        touched[`value-${row.id}`] && errors[`value-${row.id}`]
                          ? errors[`value-${row.id}`]
                          : index === 0
                            ? "Enter value and press Enter or click Add"
                            : ""
                      }
                    />

                    {row.values.length > 0 && (
                      <Box display="flex" gap={1} flexWrap="wrap" mt={2} ml={1}>
                        {row.values.map((val, valIdx) => (
                          <Chip
                            key={valIdx}
                            label={val}
                            onDelete={!readOnly ? () => removeValue(row.id, valIdx) : undefined}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 1 }} component="div" display="flex" alignItems="flex-end" gap={1}>
                    {attributeRows.length > 1 && !readOnly && (
                      <BBButton
                        variant="outlined"
                        color="error"
                        onClick={() => removeAttributeRow(row.id)}
                        sx={{ mt: index === 0 ? 3.5 : 0 }}
                      >
                        Remove
                      </BBButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>

          {!readOnly && (
            <Box mt={3} display="flex" gap={2}>
              <BBButton variant="outlined" onClick={addAttributeRow} sx={{ minWidth: 150 }}>
                <Plus size={18} style={{ marginRight: 4 }} /> Add More
              </BBButton>
              <BBButton
                variant="contained"
                onClick={generateVariants}
                fullWidth
                disabled={!attributeRows.some((row) => row.name && row.values.length > 0)}
              >
                Create SKU
              </BBButton>
            </Box>
          )}
        </Card>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
          {variants.length > 0 && (
            <>
              <Card elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <TableContainer>
                  <Table sx={{ minWidth: { xs: 600, sm: "100%" } }}>
                    <TableHead>
                      <TableRow sx={{ background: gradients.primary }}>
                        <TableCell sx={{ fontWeight: 700, color: "white", width: "40%" }}>Attributes</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "white", width: "40%" }}>SKU Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "white", width: "10%" }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "white", width: "10%" }}>Default</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {variants.map((variant, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:hover": { bgcolor: "grey.50" },
                            bgcolor: variant.default ? "primary.50" : "inherit",
                          }}
                        >
                          <TableCell sx={{ width: "40%" }}>
                            <Typography variant="body2">
                              {Object.entries(variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ width: "40%" }}>
                            <BBInputBase
                              name={`sku-${idx}`}
                              label=""
                              rows={2}
                              value={variant.sku}
                              onInputChange={(e, name, value) => updateVariantSKU(idx, String(value))}
                              disabled={readOnly}
                              isError={!!errors[`variant-sku-${idx}`]}
                              errorMessage={errors[`variant-sku-${idx}`]}
                              sx={{
                                "& input": {
                                  fontFamily: "monospace",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ width: "10%" }}>
                            <BBInputBase
                              name={`price-${idx}`}
                              label=""
                              value={variant.price}
                              onInputChange={(e, name, value) => updateVariantPrice(idx, String(value))}
                              disabled={readOnly}
                              isError={!!errors[`variant-price-${idx}`]}
                              errorMessage={errors[`variant-price-${idx}`]}
                              sx={{ width: "100px" }}
                            />
                          </TableCell>

                          <TableCell sx={{ width: "10%", textAlign: "center" }}>
                            <Checkbox
                              checked={variant.default || false}
                              onChange={() => toggleDefault(idx)}
                              disabled={readOnly}
                              icon={<Circle size={20} />}
                              checkedIcon={<CheckCircle size={20} />}
                              sx={{
                                p: 0.5,
                                "& .MuiSvgIcon-root": {
                                  borderRadius: "50%",
                                },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                {" "}
                <BBButton variant="contained" onClick={handleSave} disabled={readOnly} fullWidth>
                  Save Variants
                </BBButton>
                <BBButton variant="outlined" onClick={handleExportJSON} fullWidth>
                  <Download size={20} style={{ marginRight: 4 }} /> Export
                </BBButton>
                <BBButton variant="outlined" onClick={() => setShowJSON(!showJSON)} sx={{ minWidth: 150 }}>
                  {showJSON ? "Hide" : "Show"} Preview
                </BBButton>
              </Stack>

              {showJSON && (
                <Card elevation={1} sx={{ p: 0, borderRadius: 2, overflow: "hidden", mt: 2 }}>
                  <Box sx={{ p: 2, bgcolor: "grey.900", color: "success.light" }}>
                    <Typography variant="subtitle2" fontWeight={600} color="white" mb={1}>
                      Preview
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        overflowX: "auto",
                        maxHeight: 400,
                        m: 0,
                        color: "#4ade80",
                      }}
                    >
                      {JSON.stringify({ variants }, null, 2)}
                    </Box>
                  </Box>
                </Card>
              )}
            </>
          )}
        </Box>{" "}
        {variants.length === 0 && attributeRows.every((row) => !row.name && row.values.length === 0) && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Start by entering an <strong>Attribute Name</strong> (e.g., Size) and add <strong>Options</strong> (e.g.,
              Small, Medium, Large) by pressing Enter or clicking Add.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default VariantBuilder;
