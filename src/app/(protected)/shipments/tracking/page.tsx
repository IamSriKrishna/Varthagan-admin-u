"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowLeft, Truck, ExternalLink, Edit2, Eye } from "lucide-react";
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

interface TrackingDialogData {
  open: boolean;
  shipment: Shipment | null;
}

export default function ShipmentTrackingPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("created");
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState<TrackingDialogData>({
    open: false,
    shipment: null,
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentService.getShipments(1, 100);
      if (response.data) {
        setShipments(response.data);
      }
    } catch (err) {
      console.error("Error fetching shipments:", err);
      showToastMessage("Failed to load shipments", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipment_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.tracking_no && shipment.tracking_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.carrier && shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenUpdateDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setUpdateDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedShipment) return;

    try {
      setIsUpdating(true);
      await shipmentService.updateShipmentStatus(selectedShipment.id, { status: newStatus });

      setShipments((prev) =>
        prev.map((s) => (s.id === selectedShipment.id ? { ...s, status: newStatus } : s))
      );

      showToastMessage("Shipment status updated successfully", "success");
      setUpdateDialogOpen(false);
      setSelectedShipment(null);
    } catch (err) {
      console.error("Error updating shipment status:", err);
      showToastMessage("Failed to update shipment status", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenTrackingDialog = (shipment: Shipment) => {
    setTrackingDialog({ open: true, shipment });
  };

  const handleCloseTrackingDialog = () => {
    setTrackingDialog({ open: false, shipment: null });
  };

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
              Shipment Tracking
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                fontFamily: "'DM Sans', sans-serif",
                mt: 0.25,
              }}
            >
              Track shipments, view tracking details and update shipment status
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #eeeff5",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            p: 3,
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
            Search & Filter
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              fullWidth
              label="Search by Shipment #, Tracking #, or Carrier"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., SHIP-001 or FedEx"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                },
              }}
            />

            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "all")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                },
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_COLORS[status].label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eeeff5" }}>
            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
              Total Results: {filteredShipments.length} shipments
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Shipments Table */}
      <Box sx={{ px: 3, py: 2 }}>
        {loading ? (
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid #eeeff5",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </Card>
        ) : filteredShipments.length === 0 ? (
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid #eeeff5",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              No shipments found matching your criteria
            </Typography>
          </Card>
        ) : (
          <TableContainer
            component={Card}
            sx={{
              borderRadius: "16px",
              border: "1px solid #eeeff5",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Shipment #
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Carrier
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Tracking #
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Ship Date
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredShipments.map((shipment) => {
                  const statusConfig = STATUS_COLORS[shipment.status];
                  return (
                    <TableRow
                      key={shipment.id}
                      sx={{
                        "&:hover": { bgcolor: "#f9fafb" },
                        borderBottom: "1px solid #eeeff5",
                      }}
                    >
                      <TableCell sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem" }}>
                        {shipment.shipment_no}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {shipment.carrier || "-"}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem" }}>
                        {shipment.tracking_no ? (
                          <Tooltip title="Click to open tracking URL">
                            <Button
                              size="small"
                              variant="text"
                              onClick={() =>
                                shipment.tracking_url
                                  ? window.open(shipment.tracking_url, "_blank")
                                  : showToastMessage("No tracking URL available", "info")
                              }
                              sx={{
                                textTransform: "none",
                                color: "#4f63d2",
                                p: 0,
                                "&:hover": { textDecoration: "underline" },
                              }}
                            >
                              {shipment.tracking_no}
                            </Button>
                          </Tooltip>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        {dayjs(shipment.ship_date).format("DD MMM YYYY")}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" gap={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenTrackingDialog(shipment)}
                              sx={{
                                color: "#4f63d2",
                                "&:hover": { bgcolor: "#eeeff5" },
                              }}
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenUpdateDialog(shipment)}
                              sx={{
                                color: "#7c3aed",
                                "&:hover": { bgcolor: "#eeeff5" },
                              }}
                            >
                              <Edit2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Tracking Details Dialog */}
      <Dialog
        open={trackingDialog.open}
        onClose={handleCloseTrackingDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tracking Details</DialogTitle>
        <DialogContent>
          {trackingDialog.shipment && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                  SHIPMENT NUMBER
                </Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#1a1d2e" }}>
                  {trackingDialog.shipment.shipment_no}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                  CURRENT STATUS
                </Typography>
                <Chip
                  label={STATUS_COLORS[trackingDialog.shipment.status].label}
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    height: 28,
                    borderRadius: "8px",
                    bgcolor: STATUS_COLORS[trackingDialog.shipment.status].bg,
                    color: STATUS_COLORS[trackingDialog.shipment.status].color,
                    border: `1px solid ${STATUS_COLORS[trackingDialog.shipment.status].color}33`,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {trackingDialog.shipment.carrier && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                    CARRIER
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1d2e" }}>
                    {trackingDialog.shipment.carrier}
                  </Typography>
                </Box>
              )}

              {trackingDialog.shipment.tracking_no && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                    TRACKING NUMBER
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1d2e", fontFamily: "'DM Mono', monospace" }}>
                    {trackingDialog.shipment.tracking_no}
                  </Typography>
                </Box>
              )}

              {trackingDialog.shipment.tracking_url && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                    TRACKING URL
                  </Typography>
                  <Button
                    endIcon={<ExternalLink size={16} />}
                    variant="text"
                    onClick={() => window.open(trackingDialog.shipment?.tracking_url, "_blank")}
                    sx={{
                      textTransform: "none",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.9rem",
                      color: "#4f63d2",
                      p: 0,
                      justifyContent: "flex-start",
                      textDecoration: "underline",
                      "&:hover": { textDecoration: "none" },
                    }}
                  >
                    Track on Carrier Website
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                  SHIP DATE
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#6b7280" }}>
                  {dayjs(trackingDialog.shipment.ship_date).format("DD MMM YYYY, HH:mm")}
                </Typography>
              </Box>

              {trackingDialog.shipment.shipping_charges && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                    SHIPPING CHARGES
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1d2e", fontFamily: "'DM Mono', monospace" }}>
                    ₹{trackingDialog.shipment.shipping_charges.toFixed(2)}
                  </Typography>
                </Box>
              )}

              {trackingDialog.shipment.notes && (
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", mb: 0.5 }}>
                    NOTES
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
                    {trackingDialog.shipment.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseTrackingDialog}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1a1d2e", mb: 1 }}>
                  Shipment: {selectedShipment.shipment_no}
                </Typography>
                <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: "8px", mb: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mb: 0.25 }}>
                    CURRENT STATUS
                  </Typography>
                  <Chip
                    label={STATUS_COLORS[selectedShipment.status].label}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      bgcolor: STATUS_COLORS[selectedShipment.status].bg,
                      color: STATUS_COLORS[selectedShipment.status].color,
                    }}
                  />
                </Box>
              </Box>

              <TextField
                select
                fullWidth
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontFamily: "'DM Sans', sans-serif",
                  },
                }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_COLORS[status].label}
                  </MenuItem>
                ))}
              </TextField>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  mt: 2,
                }}
              >
                <Typography sx={{ fontSize: "0.8rem", color: "#0369a1", fontFamily: "'DM Sans', sans-serif" }}>
                  Status will be updated to: <strong>{STATUS_COLORS[newStatus].label}</strong>
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setUpdateDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={isUpdating || newStatus === selectedShipment?.status}
            variant="contained"
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
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
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
