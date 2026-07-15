
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FieldArray,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Collapse,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileWarning,
  PackageSearch,
  Store,
} from "lucide-react";

import {
  BBButton,
  BBInput,
  BBLoader,
} from "@/lib";
import { showToastMessage } from "@/utils/toastUtil";
import {
  PurchaseClaimFormValues,
  PurchaseOrderClaimSource,
} from "@/models/purchaseClaim.model";
import { PurchaseOrder } from "@/models/purchaseOrder.model";
import { purchaseClaimService } from "@/services/purchaseClaimService";
import PurchaseClaimItems from "./PurchaseClaimItems";
import {
  initialPurchaseClaimValues,
  mapPurchaseClaimToFormValues,
  transformPurchaseClaimToPayload,
} from "./purchaseClaimForm.utils";
import { purchaseClaimValidationSchema } from "./purchaseClaimForm.validation";

export default function PurchaseClaimForm() {
  const router = useRouter();
  const params = useParams<{ claimId?: string }>();

  const claimId = params?.claimId;
  const isViewMode = Boolean(claimId && claimId !== "new");

  const formikRef =
    useRef<FormikProps<PurchaseClaimFormValues> | null>(
      null
    );

  const [purchaseOrders, setPurchaseOrders] =
    useState<PurchaseOrder[]>([]);

  const [source, setSource] =
    useState<PurchaseOrderClaimSource | null>(
      null
    );

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [loadingSource, setLoadingSource] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [pageError, setPageError] =
    useState<string | null>(null);

  const [formValues, setFormValues] = useState<PurchaseClaimFormValues>(initialPurchaseClaimValues);

  useEffect(() => {
    void loadPurchaseOrders();
  }, []);

  useEffect(() => {
    if (!claimId || claimId === "new") {
      setFormValues(initialPurchaseClaimValues);
      setSource(null);
      return;
    }

    void loadExistingClaim(claimId);
  }, [claimId]);

  const loadPurchaseOrders = async () => {
    try {
      setLoadingOrders(true);
      setPageError(null);

      const result =
        await purchaseClaimService.getPurchaseOrders();

      setPurchaseOrders(result);
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Failed to load purchase orders"
      );

      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadPurchaseOrderItems = async (
    purchaseOrderId: string,
    setFieldValue: FormikProps<PurchaseClaimFormValues>["setFieldValue"]
  ) => {
    if (!purchaseOrderId) {
      setSource(null);
      return;
    }

    try {
      setLoadingSource(true);
      setPageError(null);

      const response =
        await purchaseClaimService.getPurchaseOrderClaimSource(
          purchaseOrderId
        );

      setSource(response.data);

      await setFieldValue("items", [
        {
          purchase_order_item_id: "",
          type: "missing",
          quantity: "",
          unit: "",
          reason: "",
          action: "replacement",
        },
      ]);
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Failed to load purchase order items"
      );

      setSource(null);
      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoadingSource(false);
    }
  };

  const loadExistingClaim = async (id: string) => {
    try {
      setLoadingOrders(true);
      setPageError(null);

      const response = await purchaseClaimService.getClaimById(id);
      const claim = response.data;

      setFormValues(mapPurchaseClaimToFormValues(claim));

      const sourceResponse = await purchaseClaimService.getPurchaseOrderClaimSource(claim.purchase_order_id);
      setSource(sourceResponse.data);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load purchase claim details");

      setPageError(message);
      showToastMessage(message, "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (
    values: PurchaseClaimFormValues,
    helpers: FormikHelpers<PurchaseClaimFormValues>
  ) => {
    if (isViewMode) {
      return;
    }

    try {
      setSubmitting(true);
      setPageError(null);

      const payload =
        transformPurchaseClaimToPayload(values);

      const response =
        await purchaseClaimService.createClaim(
          payload
        );

      showToastMessage(
        `Purchase claim ${response.data.claim_number} created successfully`,
        "success"
      );

      router.push("/purchase-claims");
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "Failed to create purchase claim"
      );

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
      <BBLoader
        enabled={
          loadingOrders ||
          loadingSource ||
          submitting
        }
      />

      <Formik<PurchaseClaimFormValues>
        key={claimId || "new"}
        innerRef={formikRef}
        initialValues={formValues}
        enableReinitialize
        validationSchema={
          purchaseClaimValidationSchema
        }
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnChange
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form noValidate>
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                px: 3,
                py: 2.25,
                bgcolor: "#ffffff",
                borderBottom:
                  "1px solid #f0f0f5",
                display: "flex",
                justifyContent:
                  "space-between",
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
                    background:
                      "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    boxShadow:
                      "0 5px 18px rgba(239,68,68,0.28)",
                  }}
                >
                  <FileWarning
                    size={21}
                    color="white"
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#1a1d2e",
                      fontFamily:
                        "'DM Sans', sans-serif",
                    }}
                  >
                    {isViewMode ? "Purchase Claim Details" : "New Purchase Claim"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#9ca3af",
                      fontFamily:
                        "'DM Sans', sans-serif",
                    }}
                  >
                    {isViewMode ? "Review the recorded claim details" : "Report missing or damaged purchase-order items"}
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
                  startIcon={
                    <ArrowLeft size={16} />
                  }
                  onClick={() =>
                    router.back()
                  }
                  disabled={isSubmitting}
                  sx={secondaryButtonSx}
                >
                  Cancel
                </BBButton>

                {!isViewMode && (
                  <BBButton
                    type="submit"
                    variant="contained"
                    startIcon={
                      <ClipboardCheck
                        size={16}
                      />
                    }
                    loading={
                      submitting ||
                      isSubmitting
                    }
                    disabled={
                      submitting ||
                      isSubmitting ||
                      !source ||
                      values.items.length === 0
                    }
                    sx={primaryButtonSx}
                  >
                    Create Claim
                  </BBButton>
                )}
              </Box>
            </Box>

            <Box sx={{ px: 3, pt: 2.5 }}>
              <Collapse in={Boolean(pageError)}>
                <Alert
                  severity="error"
                  icon={
                    <AlertCircle size={18} />
                  }
                  onClose={() =>
                    setPageError(null)
                  }
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                  }}
                >
                  <AlertTitle
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Unable to continue
                  </AlertTitle>

                  {pageError}
                </Alert>
              </Collapse>

              <Collapse
                in={
                  Object.keys(errors).length >
                    0 &&
                  Object.keys(touched).length >
                    0
                }
              >
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                  }}
                >
                  Please correct the
                  highlighted claim fields.
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
                  border:
                    "1px solid #eeeff5",
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
                    borderBottom:
                      "1px solid #f0f0f5",
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
                        "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <PackageSearch
                      size={16}
                      color="white"
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          "0.9375rem",
                        fontWeight: 700,
                        color:
                          "#1a1d2e",
                      }}
                    >
                      Claim Information
                    </Typography>

                    <Typography
                      sx={{
                        fontSize:
                          "0.75rem",
                        color:
                          "#9ca3af",
                      }}
                    >
                      Select the purchase
                      order and claim date
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Grid
                    container
                    spacing={2}
                    component="div"
                  >
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
                        label="Purchase Order"
                        value={
                          values.purchase_order_id
                        }
                        error={Boolean(
                          touched.purchase_order_id &&
                            errors.purchase_order_id
                        )}
                        helperText={
                          touched.purchase_order_id
                            ? errors.purchase_order_id
                            : undefined
                        }
                        onChange={(
                          event
                        ) => {
                          const purchaseOrderId =
                            event.target.value;

                          void setFieldValue(
                            "purchase_order_id",
                            purchaseOrderId
                          );

                          void loadPurchaseOrderItems(
                            purchaseOrderId,
                            setFieldValue
                          );
                        }}
                        sx={fieldSx}
                      >
                        {purchaseOrders.map(
                          (
                            purchaseOrder
                          ) => (
                            <MenuItem
                              key={
                                purchaseOrder.id
                              }
                              value={
                                purchaseOrder.id
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
                                  alignItems:
                                    "center",
                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize:
                                        "0.85rem",
                                    }}
                                  >
                                    {
                                      purchaseOrder.purchase_order_no
                                    }
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.72rem",
                                      color:
                                        "#9ca3af",
                                    }}
                                  >
                                    {purchaseOrder
                                      .vendor
                                      ?.display_name ||
                                      purchaseOrder
                                        .vendor
                                        ?.company_name ||
                                      `Vendor #${purchaseOrder.vendor_id}`}
                                  </Typography>
                                </Box>

                                <Chip
                                  label={
                                    purchaseOrder.status
                                  }
                                  size="small"
                                  sx={{
                                    height: 22,
                                    borderRadius:
                                      "6px",
                                    bgcolor:
                                      "#f0f4ff",
                                    color:
                                      "#4f63d2",
                                    fontSize:
                                      "0.68rem",
                                    fontWeight: 700,
                                    textTransform:
                                      "capitalize",
                                  }}
                                />
                              </Box>
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 5,
                      }}
                      component="div"
                    >
                      <BBInput
                        name="date"
                        label="Claim Date"
                        type="date"
                        required
                        fullWidth
                      />
                    </Grid>

                    <Grid
                      size={{ xs: 12 }}
                      component="div"
                    >
                      <BBInput
                        name="notes"
                        label="General Notes"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  {source && (
                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2,
                        border:
                          "1px solid #e0e7ff",
                        borderRadius:
                          "12px",
                        bgcolor:
                          "#f8f9ff",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2.5,
                        alignItems:
                          "center",
                      }}
                    >
                      <InfoBlock
                        icon={
                          <Store size={14} />
                        }
                        label="Vendor"
                        value={
                          source.vendor_name ||
                          `#${source.vendor_id}`
                        }
                      />

                      <InfoBlock
                        icon={
                          <PackageSearch
                            size={14}
                          />
                        }
                        label="Purchase Order"
                        value={
                          source.purchase_order_number
                        }
                      />

                      <InfoBlock
                        icon={
                          <CalendarDays
                            size={14}
                          />
                        }
                        label="Inventory"
                        value={
                          source.inventory_synced
                            ? "Received & synced"
                            : "Not yet synced"
                        }
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <FieldArray name="items">
                {({
                  push,
                  remove,
                }) => (
                  <PurchaseClaimItems
                    source={source}
                    push={push}
                    remove={remove}
                  />
                )}
              </FieldArray>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: 1.5,
                }}
              >
                <BBButton
                  type="button"
                  variant="outlined"
                  onClick={() =>
                    router.back()
                  }
                  sx={secondaryButtonSx}
                >
                  Cancel
                </BBButton>

                <BBButton
                  type="submit"
                  variant="contained"
                  loading={
                    submitting ||
                    isSubmitting
                  }
                  disabled={
                    submitting ||
                    isSubmitting ||
                    !source ||
                    values.items.length === 0
                  }
                  sx={primaryButtonSx}
                >
                  Create Purchase Claim
                </BBButton>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          bgcolor: "#e0e7ff",
          color: "#4f63d2",
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
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
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
  "& .MuiInputLabel-root": {
    fontFamily: "'DM Sans', sans-serif",
  },
};

const secondaryButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.875rem",
  color: "#6b7280",
  borderColor: "#e5e7eb",
};

const primaryButtonSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700,
  fontSize: "0.875rem",
  px: 2.75,
  background:
    "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  boxShadow:
    "0 4px 14px rgba(239,68,68,0.3)",
};
