"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Formik, FormikHelpers, FormikErrors } from "formik";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Chip, Collapse, Grid, MenuItem, TextField, Typography } from "@mui/material";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PackageSearch,
  Scale,
  Store,
  Truck,
} from "lucide-react";

import { BBButton, BBInput, BBLoader } from "@/lib";
import { showToastMessage } from "@/utils/toastUtil";
import { PurchaseOrder } from "@/models/purchaseOrder.model";
import { PurchaseClaim, PurchaseClaimItem } from "@/models/purchaseClaim.model";
import { PurchaseDispenseFormValues } from "@/models/purchaseDispense.model";
import { purchaseDispenseService } from "@/lib/api/purchaseDispenseService";
import {
  convertDispenseToBaseQuantity,
  getDispenseDefaultUnit,
  initialPurchaseDispenseValues,
  mapPurchaseDispenseToFormValues,
  transformPurchaseDispenseToPayload,
} from "./purchaseDispenseForm.utils";
import { purchaseDispenseValidationSchema } from "./purchaseDispenseForm.validation";

const RAW_UNIT_OPTIONS = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Gram", value: "gram" },
  { label: "Milligram (mg)", value: "mg" },
  { label: "Tonne", value: "tonne" },
];

export default function PurchaseDispenseForm() {
  const router = useRouter();
  const params = useParams<{ dispenseId?: string }>();

  const dispenseId = params?.dispenseId;
  const isViewMode = Boolean(dispenseId && dispenseId !== "new");

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [claims, setClaims] = useState<PurchaseClaim[]>([]);

  const [selectedClaim, setSelectedClaim] = useState<PurchaseClaim | null>(null);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<PurchaseDispenseFormValues>(initialPurchaseDispenseValues);

  useEffect(() => {
    void loadPurchaseOrders();
  }, []);

  useEffect(() => {
    if (!dispenseId || dispenseId === "new") {
      setFormValues(initialPurchaseDispenseValues);
      setSelectedClaim(null);
      setClaims([]);
      return;
    }

    void loadExistingDispense(dispenseId);
  }, [dispenseId]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      setPageError(null);

      const result = await purchaseDispenseService.getPurchaseOrders();

      setPurchaseOrders(result);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load purchase orders");

      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async (
    purchaseOrderId: string,
    setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => Promise<void | FormikErrors<PurchaseDispenseFormValues>> | void,
  ) => {
    if (!purchaseOrderId) {
      setClaims([]);
      setSelectedClaim(null);
      return;
    }

    try {
      setLoading(true);
      setPageError(null);

      const response = await purchaseDispenseService.getClaimsByPurchaseOrder(purchaseOrderId);

      const replacementClaims = (response.data ?? []).filter((claim) =>
        claim.items.some((item) => item.action === "replacement" && Number(item.replacement_pending_base) > 0),
      );

      setClaims(replacementClaims);
      setSelectedClaim(null);

      await setFieldValue("purchase_claim_id", "");
      await setFieldValue("purchase_claim_item_id", "");
      await setFieldValue("quantity", "");
      await setFieldValue("unit", "");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load purchase claims");

      setClaims([]);
      setSelectedClaim(null);
      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClaim = async (
    claimId: string,
    setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => Promise<void | FormikErrors<PurchaseDispenseFormValues>> | void,
  ) => {
    if (!claimId) {
      setSelectedClaim(null);
      return;
    }

    try {
      setLoading(true);
      setPageError(null);

      const response = await purchaseDispenseService.getClaimById(claimId);

      setSelectedClaim(response.data);

      await setFieldValue("purchase_claim_item_id", "");
      await setFieldValue("quantity", "");
      await setFieldValue("unit", "");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load claim details");

      setSelectedClaim(null);
      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingDispense = async (id: string) => {
    try {
      setLoading(true);
      setPageError(null);

      const response = await purchaseDispenseService.getDispenseById(id);
      const dispense = response.data;

      setFormValues(mapPurchaseDispenseToFormValues(dispense));
      setSelectedClaim(null);

      const claimResponse = await purchaseDispenseService.getClaimsByPurchaseOrder(dispense.purchase_order_id);
      const replacementClaims = (claimResponse.data ?? []).filter((claim) =>
        claim.items.some((item) => item.action === "replacement" && Number(item.replacement_pending_base) > 0),
      );

      setClaims(replacementClaims);

      if (dispense.purchase_claim_id) {
        const selectedClaimResponse = await purchaseDispenseService.getClaimById(dispense.purchase_claim_id);
        setSelectedClaim(selectedClaimResponse.data);
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load purchase dispense details");

      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values: PurchaseDispenseFormValues,
    helpers: FormikHelpers<PurchaseDispenseFormValues>,
  ) => {
    if (isViewMode) {
      return;
    }

    try {
      setSubmitting(true);
      setPageError(null);

      const payload = transformPurchaseDispenseToPayload(values);

      const response = await purchaseDispenseService.createDispense(values.purchase_claim_id, payload);

      showToastMessage(response.message || "Vendor replacement received and added to stock", "success");

      router.push("/purchase-dispenses");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to create purchase dispense");

      setPageError(message);
      showToastMessage(message, "error");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
      helpers.setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      <BBLoader enabled={loading || submitting} />

      <Formik<PurchaseDispenseFormValues>
        key={dispenseId || "new"}
        initialValues={formValues}
        enableReinitialize
        validationSchema={purchaseDispenseValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const selectedItem = selectedClaim?.items.find((item) => item.id === Number(values.purchase_claim_item_id));

          const enteredBase = selectedItem
            ? convertDispenseToBaseQuantity(Number(values.quantity || 0), values.unit, selectedItem.is_raw_material)
            : 0;

          const exceedsPending =
            Boolean(selectedItem) && enteredBase > Number(selectedItem?.replacement_pending_base || 0) + 0.000001;

          return (
            <Form noValidate>
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 20,
                  px: 3,
                  py: 2.25,
                  bgcolor: "#ffffff",
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
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "13px",
                      background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 5px 18px rgba(14,165,233,0.24)",
                    }}
                  >
                    <PackageCheck size={21} color="white" />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "#1a1d2e",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {isViewMode ? "Purchase Dispense Details" : "New Purchase Dispense"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        color: "#9ca3af",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {isViewMode ? "Review the recorded replacement receipt" : "Receive vendor replacement stock against a claim"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                  }}
                >
                  <BBButton
                    type="button"
                    variant="outlined"
                    startIcon={<ArrowLeft size={16} />}
                    onClick={() => router.back()}
                    sx={secondaryButtonSx}
                  >
                    Cancel
                  </BBButton>

                  {!isViewMode && (
                    <BBButton
                      type="submit"
                      variant="contained"
                      startIcon={<ClipboardCheck size={16} />}
                      loading={submitting || isSubmitting}
                      disabled={submitting || isSubmitting || !selectedItem || exceedsPending}
                      sx={primaryButtonSx}
                    >
                      Receive Stock
                    </BBButton>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  px: 3,
                  pt: 2.5,
                }}
              >
                <Collapse in={Boolean(pageError)}>
                  <Alert
                    severity="error"
                    onClose={() => setPageError(null)}
                    sx={{
                      mb: 2,
                      borderRadius: "12px",
                    }}
                  >
                    {pageError}
                  </Alert>
                </Collapse>
              </Box>

              <Box
                sx={{
                  px: 3,
                  pb: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #eeeff5",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: "#fafbff",
                      borderBottom: "1px solid #f0f0f5",
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
                        background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Truck size={16} color="white" />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                          color: "#1a1d2e",
                        }}
                      >
                        Replacement Information
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        Select the claim and item being replaced
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} component="div">
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
                          required
                          label="Purchase Order"
                          value={values.purchase_order_id}
                          error={Boolean(touched.purchase_order_id && errors.purchase_order_id)}
                          helperText={touched.purchase_order_id ? errors.purchase_order_id : undefined}
                          disabled={isViewMode}
                          onChange={(event) => {
                            const id = event.target.value;

                            void setFieldValue("purchase_order_id", id);

                            void loadClaims(id, setFieldValue);
                          }}
                          sx={fieldSx}
                        >
                          {purchaseOrders.map((po) => (
                            <MenuItem key={po.id} value={po.id}>
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {po.purchase_order_no}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: "#9ca3af",
                                  }}
                                >
                                  {po.vendor?.display_name || po.vendor?.company_name || `Vendor #${po.vendor_id}`}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

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
                          required
                          label="Purchase Claim"
                          value={values.purchase_claim_id}
                          disabled={isViewMode || !values.purchase_order_id}
                          error={Boolean(touched.purchase_claim_id && errors.purchase_claim_id)}
                          helperText={touched.purchase_claim_id ? errors.purchase_claim_id : undefined}
                          onChange={(event) => {
                            const id = event.target.value;

                            void setFieldValue("purchase_claim_id", id);

                            void loadClaim(id, setFieldValue);
                          }}
                          sx={fieldSx}
                        >
                          {claims.map((claim) => (
                            <MenuItem key={claim.id} value={claim.id}>
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {claim.claim_number}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: "#9ca3af",
                                  }}
                                >
                                  {claim.status} · {claim.items.length} item(s)
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 7,
                        }}
                        component="div"
                      >
                        <TextField
                          select
                          fullWidth
                          required
                          label="Claim Item"
                          value={values.purchase_claim_item_id}
                          disabled={isViewMode || !selectedClaim}
                          error={Boolean(touched.purchase_claim_item_id && errors.purchase_claim_item_id)}
                          helperText={touched.purchase_claim_item_id ? errors.purchase_claim_item_id : undefined}
                          onChange={(event) => {
                            const itemId = Number(event.target.value);

                            const item = selectedClaim?.items.find((claimItem) => claimItem.id === itemId);

                            void setFieldValue("purchase_claim_item_id", itemId);

                            void setFieldValue("quantity", "");

                            void setFieldValue(
                              "unit",
                              getDispenseDefaultUnit(item?.base_unit || "", Boolean(item?.is_raw_material)),
                            );
                          }}
                          sx={fieldSx}
                        >
                          {selectedClaim?.items
                            .filter(
                              (item) => item.action === "replacement" && Number(item.replacement_pending_base) > 0,
                            )
                            .map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2,
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {item.product_name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#9ca3af",
                                      }}
                                    >
                                      {item.type} · {item.is_raw_material ? "Raw material" : "Variant product"}
                                    </Typography>
                                  </Box>

                                  <Chip
                                    label={`Pending ${Number(item.replacement_pending_base).toLocaleString()} ${
                                      item.base_unit
                                    }`}
                                    size="small"
                                    sx={{
                                      bgcolor: "#eff6ff",
                                      color: "#1d4ed8",
                                      border: "1px solid #bfdbfe",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                        </TextField>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 5,
                        }}
                        component="div"
                      >
                        <BBInput name="dispense_date" label="Dispense Date" type="date" required fullWidth disabled={isViewMode} />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #eeeff5",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: "#fafbff",
                      borderBottom: "1px solid #f0f0f5",
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
                        bgcolor: "#ecfdf5",
                        color: "#047857",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedItem?.is_raw_material ? <Scale size={16} /> : <Boxes size={16} />}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#1a1d2e",
                      }}
                    >
                      Quantity Received
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} component="div">
                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                        component="div"
                      >
                        <BBInput name="quantity" label="Received Quantity" type="number" required fullWidth disabled={isViewMode} />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                        component="div"
                      >
                        {selectedItem?.is_raw_material ? (
                          <TextField
                            select
                            fullWidth
                            label="Unit"
                            value={values.unit}
                            disabled={isViewMode}
                            onChange={(event) => void setFieldValue("unit", event.target.value)}
                            sx={fieldSx}
                          >
                            {RAW_UNIT_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <BBInput name="unit" label="Unit" disabled fullWidth />
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
                            border: "1px solid #bbf7d0",
                            borderRadius: "10px",
                            bgcolor: "#f0fdf4",
                            px: 2,
                            py: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              color: "#6b7280",
                              fontWeight: 800,
                            }}
                          >
                            Base stock quantity
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              color: "#047857",
                              fontWeight: 800,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {enteredBase.toLocaleString()} {selectedItem?.base_unit || "—"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12 }} component="div">
                        <BBInput name="notes" label="Notes" multiline rows={3} fullWidth disabled={isViewMode} />
                      </Grid>
                    </Grid>

                    {selectedItem && (
                      <Box
                        sx={{
                          mt: 2.5,
                          p: 2,
                          border: "1px solid #dbeafe",
                          borderRadius: "12px",
                          bgcolor: "#f8fbff",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2.5,
                        }}
                      >
                        <InfoBlock
                          icon={<PackageSearch size={14} />}
                          label="Product"
                          value={selectedItem.product_name}
                        />

                        <InfoBlock icon={<Store size={14} />} label="Claim Type" value={selectedItem.type} />

                        <InfoBlock
                          icon={<CheckCircle2 size={14} />}
                          label="Pending"
                          value={`${Number(selectedItem.replacement_pending_base).toLocaleString()} ${
                            selectedItem.base_unit
                          }`}
                        />
                      </Box>
                    )}

                    {exceedsPending && (
                      <Alert
                        severity="error"
                        sx={{
                          mt: 2,
                          borderRadius: "10px",
                        }}
                      >
                        Received quantity exceeds the pending vendor replacement quantity.
                      </Alert>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                  }}
                >
                  <BBButton type="button" variant="outlined" onClick={() => router.back()} sx={secondaryButtonSx}>
                    Cancel
                  </BBButton>

                  {!isViewMode && (
                    <BBButton
                      type="submit"
                      variant="contained"
                      loading={submitting || isSubmitting}
                      disabled={submitting || isSubmitting || !selectedItem || exceedsPending}
                      sx={primaryButtonSx}
                    >
                      Receive Replacement
                    </BBButton>
                  )}
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          bgcolor: "#e0f2fe",
          color: "#0369a1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 800,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "#374151",
            fontWeight: 700,
            textTransform: label === "Claim Type" ? "capitalize" : "none",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
  },
};

const secondaryButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  color: "#6b7280",
  borderColor: "#e5e7eb",
};

const primaryButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700,
  background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
  boxShadow: "0 4px 14px rgba(14,165,233,0.25)",
};
