"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Alert,
  TextField,
  Card,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowLeft, Truck, Save, Edit, Trash2 } from "lucide-react";
import { shipmentService } from "@/services/shipmentService";
import { Shipment, ShipmentStatus } from "@/models/shipment.model";
import { showToastMessage } from "@/utils/toastUtil";
import dayjs from "dayjs";

const STATUS_COLORS: Record<ShipmentStatus, { bg: string; color: string; label: string }> = {
  created: { bg: "#f3f4f6", color: "#6b7280", label: "Created" },
  shipped: { bg: "#dbeafe", color: "#0369a1", label: "Shipped" },
  in_transit: { bg: "#fef3c7", color: "#92400e", label: "In Transit" },
  delivered: { bg: "#d1fae5", color: "#065f46", label: "Delivered" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
};

const STATUS_OPTIONS: ShipmentStatus[] = ["created", "shipped", "in_transit", "delivered", "cancelled"];

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    ship_date: "",
    carrier: "",
    tracking_no: "",
    tracking_url: "",
    shipping_charges: "",
    notes: "",
    status: "created" as ShipmentStatus,
  });

  useEffect(() => {
    fetchShipment();
  }, [shipmentId]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getShipment(shipmentId);
      setShipment(response.data);
      // Initialize form with shipment data
      setFormData({
        ship_date: response.data.ship_date.split("T")[0],
        carrier: response.data.carrier || "",
        tracking_no: response.data.tracking_no || "",
        tracking_url: response.data.tracking_url || "",
        shipping_charges: response.data.shipping_charges?.toString() || "",
        notes: response.data.notes || "",
        status: response.data.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipment");
      console.error("Error fetching shipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.ship_date.trim()) {
      errors.ship_date = "Ship Date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToastMessage("Please fill in all required fields", "error");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ship_date: new Date(formData.ship_date).toISOString(),
        ...(formData.carrier && { carrier: formData.carrier }),
        ...(formData.tracking_no && { tracking_no: formData.tracking_no }),
        ...(formData.tracking_url && { tracking_url: formData.tracking_url }),
        ...(formData.shipping_charges && { shipping_charges: parseFloat(formData.shipping_charges) }),
        ...(formData.notes && { notes: formData.notes }),
        ...(shipment?.status !== formData.status && { status: formData.status }),
      };

      await shipmentService.updateShipment(shipmentId, payload);
      showToastMessage("Shipment updated successfully", "success");
      fetchShipment();
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update shipment";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await shipmentService.deleteShipment(shipmentId);
      showToastMessage("Shipment deleted successfully", "success");
      router.push("/shipments");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete shipment";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f8f9fc" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!shipment) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", p: 3 }}>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => router.back()}>
          Back
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          Shipment not found
        </Alert>
      </Box>
    );
  }

  const statusConfig = STATUS_COLORS[shipment.status];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", pb: 4 }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, bgcolor: "#ffffff", borderBottom: "1px solid #f0f0f5" }}>
        <Stack direction="row" alignItems="center" gap={2} mb={2}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.back()}
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: "#6b7280",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Back
          </Button>
        </Stack>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(79,99,210,0.3)",
                flexShrink: 0,
              }}
            >
              <Truck size={22} color="white" />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.4px",
                }}
              >
                {shipment.shipment_no}
              </Typography>
              <Stack direction="row" gap={1} mt={0.5}>
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    height: 22,
                    borderRadius: "6px",
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                    border: `1px solid ${statusConfig.color}33`,
                  }}
                />
                {shipment.tracking_no && (
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontFamily: "'DM Mono', monospace",
                      color: "#6b7280",
                      bgcolor: "#f3f4f6",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px",
                    }}
                  >
                    {shipment.tracking_no}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
          {!isEditing && (
            <Stack direction="row" gap={1}>
              <Button
                startIcon={<Edit size={16} />}
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  borderRadius: "10px",
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  "&:hover": { toolbar: "#f9fafb", borderColor: "#9ca3af" },
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<Trash2 size={16} />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  borderRadius: "10px",
                }}
              >
                Delete
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ px: 3, pt: 2.5 }}>
          <Alert
            severity="error"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "12px",
              border: "1px solid #fee2e2",
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
          {/* Main Details */}
          <Box>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #eeeff5",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {isEditing ? (
                /* Edit Mode */
                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: "'DM Sans', sans-serif",
                      mb: 2,
                    }}
                  >
                    Shipment Details
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Ship Date"
                        name="ship_date"
                        type="date"
                        value={formData.ship_date}
                        onChange={handleChange}
                        error={!!validationErrors.ship_date}
                        helperText={validationErrors.ship_date}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        SelectProps={{
                          native: true,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_COLORS[status].label}
                          </option>
                        ))}
                      </TextField>
                    </Box>

                    <Box>
                      <TextField
                        fullWidth
                        label="Carrier"
                        name="carrier"
                        value={formData.carrier}
                        onChange={handleChange}
                        placeholder="e.g., FedEx, UPS, DHL"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <TextField
                        fullWidth
                        label="Tracking Number"
                        name="tracking_no"
                        value={formData.tracking_no}
                        onChange={handleChange}
                        placeholder="e.g., 794644147629"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
                      <TextField
                        fullWidth
                        label="Tracking URL"
                        name="tracking_url"
                        value={formData.tracking_url}
                        onChange={handleChange}
                        placeholder="e.g., https://tracking.fedex.com/794644147629"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <TextField
                        fullWidth
                        label="Shipping Charges"
                        name="shipping_charges"
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        value={formData.shipping_charges}
                        onChange={handleChange}
                        placeholder="150.50"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "'DM Sans', sans-serif",
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes about this shipment..."
                    multiline
                    rows={3}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        fontFamily: "'DM Sans', sans-serif",
                      },
                    }}
                  />

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 3 }}>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outlined"
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        px: 3,
                        borderColor: "#d1d5db",
                        color: "#6b7280",
                        "&:hover": { bgcolor: "#f9fafb", borderColor: "#9ca3af" },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      variant="contained"
                      startIcon={isSaving ? <CircularProgress size={16} /> : <Save size={16} />}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        px: 3,
                        background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                        boxShadow: "0 4px 14px rgba(79,99,210,0.35)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #3d52c7 0%, #6d28d9 100%)",
                          boxShadow: "0 6px 20px rgba(79,99,210,0.45)",
                        },
                        "&:disabled": {
                          background: "linear-gradient(135deg, #4f63d2 0%, #7c3aed 100%)",
                          opacity: 0.6,
                        },
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                /* View Mode */
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                    <Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Package ID
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {shipment.package_id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Sales Order ID
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {shipment.sales_order_id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Customer ID
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                          }}
                        >
                          {shipment.customer_id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Ship Date
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                          }}
                        >
                          {dayjs(shipment.ship_date).format("DD MMM YYYY, HH:mm")}
                        </Typography>
                      </Box>
                    </Box>

                    {shipment.carrier && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Carrier
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                          }}
                        >
                          {shipment.carrier}
                        </Typography>
                      </Box>
                    )}

                    {shipment.tracking_no && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Tracking Number
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {shipment.tracking_no}
                        </Typography>
                      </Box>
                    )}

                    {shipment.tracking_url && (
                      <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Tracking URL
                        </Typography>
                        <Button
                          variant="text"
                          onClick={() => window.open(shipment.tracking_url, "_blank")}
                          sx={{
                            textTransform: "none",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.9rem",
                            color: "#4f63d2",
                            p: 0,
                            textDecoration: "underline",
                            "&:hover": { textDecoration: "none" },
                          }}
                        >
                          {shipment.tracking_url}
                        </Button>
                      </Box>
                    )}

                    {shipment.shipping_charges && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Shipping Charges
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1a1d2e",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          ₹{shipment.shipping_charges.toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    {shipment.notes && (
                      <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Notes
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.9rem",
                            color: "#6b7280",
                            lineHeight: 1.6,
                          }}
                        >
                          {shipment.notes}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Card>
          </Box>

          {/* Metadata */}
          <Box>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #eeeff5",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                p: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 2,
                }}
              >
                Status
              </Typography>
              <Chip
                label={statusConfig.label}
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  height: 28,
                  borderRadius: "8px",
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.color}33`,
                  mb: 3,
                }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 1,
                  }}
                >
                  Created
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {dayjs(shipment.created_at).format("DD MMM YYYY, HH:mm")}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 1,
                  }}
                >
                  Last Updated
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {dayjs(shipment.updated_at).format("DD MMM YYYY, HH:mm")}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 1,
                  }}
                >
                  Created By
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {shipment.created_by}
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Shipment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                bgcolor: "#fff5f5",
                border: "1px solid #fee2e2",
                borderRadius: "10px",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#991b1b",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.5,
                  }}
                >
                  This action cannot be undone
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: "#b91c1c",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  The shipment and all its tracking information will be permanently removed.
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              Are you sure you want to delete this shipment?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            Keep Shipment
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Trash2 size={16} />}
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Shipment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
