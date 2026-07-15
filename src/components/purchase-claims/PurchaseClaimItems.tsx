
"use client";

import {
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AlertTriangle,
  Boxes,
  PackageMinus,
  Plus,
  Scale,
  Trash2,
} from "lucide-react";
import {
  ArrayHelpers,
  useFormikContext,
} from "formik";

import {
  BBButton,
  BBDropdown,
  BBInput,
} from "@/lib";
import {
  PURCHASE_CLAIM_ACTION_OPTIONS,
  PURCHASE_CLAIM_TYPE_OPTIONS,
  RAW_MATERIAL_UNIT_OPTIONS,
} from "@/constants/purchaseClaim.constants";
import {
  PurchaseClaimFormValues,
  PurchaseOrderClaimSource,
} from "@/models/purchaseClaim.model";
import {
  convertClaimToBaseQuantity,
  createEmptyPurchaseClaimItem,
  getDefaultClaimUnit,
  getMaximumClaimQuantity,
} from "./purchaseClaimForm.utils";

interface PurchaseClaimItemsProps {
  source: PurchaseOrderClaimSource | null;
  push: ArrayHelpers["push"];
  remove: ArrayHelpers["remove"];
}

export default function PurchaseClaimItems({
  source,
  push,
  remove,
}: PurchaseClaimItemsProps) {
  const { values, setFieldValue } =
    useFormikContext<PurchaseClaimFormValues>();

  const items = values.items ?? [];

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #eeeff5",
        overflow: "hidden",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#fafbff",
          borderBottom: "1px solid #f0f0f5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              background:
                "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PackageMinus
              size={16}
              color="white"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "#1a1d2e",
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              Claim Items
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              Add missing or damaged items
              from the selected purchase order
            </Typography>
          </Box>
        </Box>

        <BBButton
          type="button"
          variant="outlined"
          startIcon={<Plus size={15} />}
          onClick={() =>
            push(createEmptyPurchaseClaimItem())
          }
          disabled={!source}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontFamily:
              "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.8125rem",
            color: "#4f63d2",
            borderColor: "#c7d2fe",
            bgcolor: "#f0f4ff",
            "&:hover": {
              bgcolor: "#e0e7ff",
              borderColor: "#a5b4fc",
            },
          }}
        >
          Add Item
        </BBButton>
      </Box>

      <Box sx={{ p: 3 }}>
        {!source && (
          <Alert
            severity="info"
            sx={{
              borderRadius: "12px",
              border: "1px solid #bae6fd",
              bgcolor: "#f0f9ff",
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            Select a purchase order to load
            its products and raw materials.
          </Alert>
        )}

        {source &&
          source.items.length === 0 && (
            <Alert
              severity="warning"
              sx={{ borderRadius: "12px" }}
            >
              The selected purchase order has
              no valid line items.
            </Alert>
          )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {source &&
            items.map(
              (claimItem, index) => {
                const selectedItem =
                  source.items.find(
                    (item) =>
                      item.purchase_order_item_id ===
                      Number(
                        claimItem.purchase_order_item_id
                      )
                  );

                const enteredQuantity =
                  Number(
                    claimItem.quantity || 0
                  );

                const enteredBase =
                  selectedItem
                    ? convertClaimToBaseQuantity(
                        enteredQuantity,
                        claimItem.unit,
                        selectedItem.is_raw_material
                      )
                    : 0;

                const maxBase =
                  selectedItem
                    ? getMaximumClaimQuantity(
                        selectedItem,
                        claimItem.type
                      )
                    : 0;

                const exceedsMaximum =
                  Boolean(selectedItem) &&
                  enteredBase >
                    maxBase + 0.000001;

                return (
                  <Box
                    key={index}
                    sx={{
                      border: "1px solid",
                      borderColor:
                        exceedsMaximum
                          ? "#fecaca"
                          : "#eeeff5",
                      borderRadius: "14px",
                      overflow: "hidden",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.6,
                        bgcolor:
                          exceedsMaximum
                            ? "#fff7f7"
                            : "#fafbff",
                        borderBottom:
                          "1px solid",
                        borderColor:
                          exceedsMaximum
                            ? "#fee2e2"
                            : "#f0f0f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: "8px",
                            bgcolor:
                              selectedItem?.is_raw_material
                                ? "#ecfeff"
                                : "#f0f4ff",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          {selectedItem?.is_raw_material ? (
                            <Scale
                              size={15}
                              color="#0891b2"
                            />
                          ) : (
                            <Boxes
                              size={15}
                              color="#4f63d2"
                            />
                          )}
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize:
                                "0.825rem",
                              color: "#1a1d2e",
                              fontFamily:
                                "'DM Sans', sans-serif",
                            }}
                          >
                            {selectedItem?.product_name ||
                              `Claim Item ${
                                index + 1
                              }`}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize:
                                "0.7rem",
                              color: "#9ca3af",
                              fontFamily:
                                "'DM Sans', sans-serif",
                            }}
                          >
                            {selectedItem
                              ? selectedItem.is_raw_material
                                ? `Raw material · ${
                                    selectedItem.sku ||
                                    "No SKU"
                                  }`
                                : `Finished product · ${
                                    selectedItem.sku ||
                                    "No SKU"
                                  }`
                              : "Select a purchase order item"}
                          </Typography>
                        </Box>
                      </Box>

                      {items.length > 1 && (
                        <Tooltip
                          title="Remove item"
                          arrow
                        >
                          <IconButton
                            type="button"
                            size="small"
                            onClick={() =>
                              remove(index)
                            }
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius:
                                "8px",
                              color: "#ef4444",
                              bgcolor:
                                "#fef2f2",
                            }}
                          >
                            <Trash2
                              size={14}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ p: 2.5 }}>
                      <Grid
                        container
                        spacing={2}
                        component="div"
                      >
                        <Grid
                          size={{
                            xs: 12,
                            md: 6,
                          }}
                          component="div"
                        >
                          <TextField
                            select
                            fullWidth
                            label="Purchase Order Item"
                            value={
                              claimItem.purchase_order_item_id
                            }
                            onChange={(
                              event
                            ) => {
                              const itemId =
                                Number(
                                  event
                                    .target
                                    .value
                                );

                              const poItem =
                                source.items.find(
                                  (
                                    item
                                  ) =>
                                    item.purchase_order_item_id ===
                                    itemId
                                );

                              setFieldValue(
                                `items[${index}].purchase_order_item_id`,
                                itemId
                              );

                              setFieldValue(
                                `items[${index}].unit`,
                                getDefaultClaimUnit(
                                  poItem
                                )
                              );

                              setFieldValue(
                                `items[${index}].quantity`,
                                ""
                              );
                            }}
                            sx={fieldSx}
                          >
                            {source.items.map(
                              (item) => (
                                <MenuItem
                                  key={
                                    item.purchase_order_item_id
                                  }
                                  value={
                                    item.purchase_order_item_id
                                  }
                                >
                                  <Box
                                    sx={{
                                      width:
                                        "100%",
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      gap: 2,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        sx={{
                                          fontSize:
                                            "0.85rem",
                                          fontWeight: 600,
                                          fontFamily:
                                            "'DM Sans', sans-serif",
                                        }}
                                      >
                                        {
                                          item.product_name
                                        }
                                      </Typography>

                                      <Typography
                                        sx={{
                                          fontSize:
                                            "0.7rem",
                                          color:
                                            "#9ca3af",
                                          fontFamily:
                                            "'DM Sans', sans-serif",
                                        }}
                                      >
                                        {item.is_raw_material
                                          ? "Raw material"
                                          : "Finished product"}
                                      </Typography>
                                    </Box>

                                    <Typography
                                      sx={{
                                        fontSize:
                                          "0.75rem",
                                        color:
                                          "#6b7280",
                                        fontFamily:
                                          "'DM Mono', monospace",
                                      }}
                                    >
                                      {
                                        item.ordered_quantity
                                      }{" "}
                                      {
                                        item.ordered_unit
                                      }
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              )
                            )}
                          </TextField>
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 3,
                          }}
                          component="div"
                        >
                          <BBDropdown
                            name={`items[${index}].type`}
                            label="Claim Type"
                            required
                            options={
                              PURCHASE_CLAIM_TYPE_OPTIONS
                            }
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 3,
                          }}
                          component="div"
                        >
                          <BBDropdown
                            name={`items[${index}].action`}
                            label="Resolution"
                            required
                            options={
                              PURCHASE_CLAIM_ACTION_OPTIONS
                            }
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                          }}
                          component="div"
                        >
                          <BBInput
                            name={`items[${index}].quantity`}
                            label="Claim Quantity"
                            type="number"
                            required
                            fullWidth
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                          }}
                          component="div"
                        >
                          {selectedItem?.is_raw_material ? (
                            <BBDropdown
                              name={`items[${index}].unit`}
                              label="Unit"
                              required
                              options={
                                RAW_MATERIAL_UNIT_OPTIONS
                              }
                            />
                          ) : (
                            <BBInput
                              name={`items[${index}].unit`}
                              label="Unit"
                              required
                              fullWidth
                              disabled
                            />
                          )}
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            md: 4,
                          }}
                          component="div"
                        >
                          <Box
                            sx={{
                              minHeight: 56,
                              height:
                                "100%",
                              border:
                                "1px solid #e0e7ff",
                              borderRadius:
                                "10px",
                              bgcolor:
                                "#f8f9ff",
                              px: 2,
                              py: 1,
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              justifyContent:
                                "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize:
                                  "0.65rem",
                                textTransform:
                                  "uppercase",
                                letterSpacing:
                                  "0.06em",
                                color:
                                  "#9ca3af",
                                fontWeight: 800,
                                fontFamily:
                                  "'DM Sans', sans-serif",
                              }}
                            >
                              Normalized quantity
                            </Typography>

                            <Typography
                              sx={{
                                fontSize:
                                  "0.9rem",
                                color:
                                  "#4f63d2",
                                fontWeight: 800,
                                fontFamily:
                                  "'DM Mono', monospace",
                              }}
                            >
                              {enteredBase.toLocaleString()}{" "}
                              {selectedItem?.base_unit ||
                                "—"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid
                          size={{ xs: 12 }}
                          component="div"
                        >
                          <BBInput
                            name={`items[${index}].reason`}
                            label="Reason"
                            required
                            fullWidth
                            multiline
                            rows={3}
                          />
                        </Grid>
                      </Grid>

                      {selectedItem && (
                        <>
                          <Divider
                            sx={{
                              my: 2.25,
                              borderColor:
                                "#f0f0f5",
                            }}
                          />

                          <Box
                            sx={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={`Ordered: ${selectedItem.ordered_base_quantity.toLocaleString()} ${selectedItem.base_unit}`}
                              size="small"
                              sx={
                                summaryChipSx
                              }
                            />

                            <Chip
                              label={`Received: ${selectedItem.received_base_quantity.toLocaleString()} ${selectedItem.base_unit}`}
                              size="small"
                              sx={
                                summaryChipSx
                              }
                            />

                            <Chip
                              label={`Missing available: ${selectedItem.missing_remaining_base.toLocaleString()} ${selectedItem.base_unit}`}
                              size="small"
                              sx={{
                                ...summaryChipSx,
                                bgcolor:
                                  "#fff7ed",
                                color:
                                  "#c2410c",
                                borderColor:
                                  "#fed7aa",
                              }}
                            />

                            <Chip
                              label={`Damage available: ${selectedItem.damaged_remaining_base.toLocaleString()} ${selectedItem.base_unit}`}
                              size="small"
                              sx={{
                                ...summaryChipSx,
                                bgcolor:
                                  "#fef2f2",
                                color:
                                  "#b91c1c",
                                borderColor:
                                  "#fecaca",
                              }}
                            />
                          </Box>

                          {claimItem.type ===
                            "damaged" &&
                            !source.inventory_synced && (
                              <Alert
                                severity="warning"
                                icon={
                                  <AlertTriangle
                                    size={
                                      17
                                    }
                                  />
                                }
                                sx={{
                                  mt: 2,
                                  borderRadius:
                                    "10px",
                                }}
                              >
                                Damaged stock
                                can only be
                                claimed after
                                this purchase
                                order is
                                received and
                                synced.
                              </Alert>
                            )}

                          {exceedsMaximum && (
                            <Alert
                              severity="error"
                              sx={{
                                mt: 2,
                                borderRadius:
                                  "10px",
                              }}
                            >
                              Entered
                              quantity
                              exceeds the
                              remaining
                              quantity
                              allowed.
                            </Alert>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                );
              }
            )}
        </Box>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
  },
};

const summaryChipSx = {
  height: 25,
  borderRadius: "7px",
  bgcolor: "#f8fafc",
  color: "#475569",
  border: "1px solid #e2e8f0",
  fontSize: "0.7rem",
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
};
