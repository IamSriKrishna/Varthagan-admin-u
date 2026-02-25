"use client";

import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Warehouse,
  ShoppingCart,
  FileText,
  Clock,
  Tag,
  Activity,
} from "lucide-react";
import { useItem } from "@/hooks/useItems";
import { useState, useEffect } from "react";
import ItemEditDrawer from "@/components/items/item_drawer";

// Type definitions for opening stock
interface OpeningStockData {
  opening_stock: number;
  opening_stock_rate_per_unit: number;
  updated_at: string;
}

interface VariantOpeningStock {
  variant_id: number;
  variant_sku: string;
  opening_stock: number;
  opening_stock_rate_per_unit: number;
  updated_at: string;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [openingStockData, setOpeningStockData] = useState<OpeningStockData | null>(null);
  const [variantOpeningStocks, setVariantOpeningStocks] = useState<VariantOpeningStock[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [openStockDialogOpen, setOpenStockDialogOpen] = useState(false);
  const [openStockLoading, setOpenStockLoading] = useState(false);
  const [openStockError, setOpenStockError] = useState<string | null>(null);
  const [openingStockForm, setOpeningStockForm] = useState({
    opening_stock: 0,
    opening_stock_rate_per_unit: 0,
  });
  const [variantOpenStockDialogOpen, setVariantOpenStockDialogOpen] = useState(false);
  const [variantOpenStockLoading, setVariantOpenStockLoading] = useState(false);
  const [variantOpenStockError, setVariantOpenStockError] = useState<string | null>(null);
  const [variantOpeningStockForm, setVariantOpeningStockForm] = useState({
    opening_stock: 0,
    opening_stock_rate_per_unit: 0,
  });

  const { data: itemData, isLoading, error, refetch } = useItem(itemId);

  const isSingleStructure = itemData?.item_details.structure === "single";

  // Helper to get display name for manufacturer/brand
  const getDisplayName = (value: any): string => {
    if (!value) return "";
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return "";
  };

  // Fetch opening stock data
  useEffect(() => {
    if (!itemData) return;

    const fetchOpeningStock = async () => {
      setLoadingStock(true);
      try {
        if (isSingleStructure) {
          // Fetch single item opening stock
          const response = await fetch(`/api/items/${itemId}/opening-stock`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            setOpeningStockData(result.data);
          } else {
            console.error("Failed to fetch opening stock:", response.statusText);
          }
        } else {
          // Fetch variant opening stocks
          const response = await fetch(`/api/items/${itemId}/variants/opening-stock`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            setVariantOpeningStocks(result.data || []);
          } else {
            console.error("Failed to fetch variant opening stocks:", response.statusText);
          }
        }
      } catch (err) {
        console.error("Failed to fetch opening stock:", err);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchOpeningStock();
  }, [itemData, itemId, isSingleStructure]);

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    try {
      const persistedRoot = localStorage.getItem('persist:root');
      if (!persistedRoot) return '';
      const rootData = JSON.parse(persistedRoot);
      if (!rootData.auth) return '';
      const authData = JSON.parse(rootData.auth);
      return authData.access_token || '';
    } catch (e) {
      console.error('Failed to get token:', e);
      return '';
    }
  };

  // Get opening stock for selected variant
  const getSelectedVariantStock = () => {
    if (!selectedVariant) return null;
    return variantOpeningStocks.find(
      (stock) => stock.variant_sku === selectedVariant.sku
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={52} thickness={4} sx={{ color: "#6366f1" }} />
          <Typography variant="body1" sx={{ mt: 3, color: "#64748b", fontWeight: 500 }}>
            Loading item details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !itemData) {
    return (
      <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
        <Alert
          severity="error"
          sx={{
            maxWidth: 680,
            mx: "auto",
            mt: 6,
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(239, 68, 68, 0.12)",
            border: "1px solid #fecaca",
            py: 2,
          }}
        >
          <Typography variant="body1" fontWeight={600}>
            Failed to load item details. Please try again.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const item = itemData;
  const selectedVariantStock = getSelectedVariantStock();

  // Format number for display
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0.00";
    return num.toFixed(2);
  };

  // Handle item update
  const handleUpdateItem = async (updatedData: any) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update item');
    }

    // Refetch item data after successful update
    await refetch();
  };

  // Handle opening stock edit
  const handleOpenStockEdit = () => {
    setOpeningStockForm({
      opening_stock: openingStockData?.opening_stock || 0,
      opening_stock_rate_per_unit: openingStockData?.opening_stock_rate_per_unit || 0,
    });
    setOpenStockError(null);
    setOpenStockDialogOpen(true);
  };

  const handleCloseOpenStockDialog = () => {
    setOpenStockDialogOpen(false);
    setOpenStockError(null);
  };

  const handleSaveOpeningStock = async () => {
    try {
      setOpenStockLoading(true);
      setOpenStockError(null);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
      const response = await fetch(`/api/items/${itemId}/opening-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          opening_stock: parseInt(openingStockForm.opening_stock as any),
          opening_stock_rate_per_unit: parseFloat(openingStockForm.opening_stock_rate_per_unit as any),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update opening stock');
      }

      // Refetch opening stock data
      const result = await response.json();
      setOpeningStockData(result.data);
      setOpenStockDialogOpen(false);
    } catch (err) {
      setOpenStockError(err instanceof Error ? err.message : 'Failed to update opening stock');
    } finally {
      setOpenStockLoading(false);
    }
  };

  // Handle variant opening stock edit
  const handleVariantOpenStockEdit = () => {
    if (!selectedVariant) return;
    const variantStock = variantOpeningStocks.find(
      (stock) => stock.variant_sku === selectedVariant.sku
    );
    
    setVariantOpeningStockForm({
      opening_stock: variantStock?.opening_stock || 0,
      opening_stock_rate_per_unit: variantStock?.opening_stock_rate_per_unit || 0,
    });
    setVariantOpenStockError(null);
    setVariantOpenStockDialogOpen(true);
  };

  const handleCloseVariantOpenStockDialog = () => {
    setVariantOpenStockDialogOpen(false);
    setVariantOpenStockError(null);
  };

  const handleSaveVariantOpeningStock = async () => {
    try {
      setVariantOpenStockLoading(true);
      setVariantOpenStockError(null);

      if (!selectedVariant) return;

      const response = await fetch(`/api/items/${itemId}/variants/opening-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          variants: [
            {
              variant_sku: selectedVariant.sku,
              opening_stock: parseInt(variantOpeningStockForm.opening_stock as any),
              opening_stock_rate_per_unit: parseFloat(variantOpeningStockForm.opening_stock_rate_per_unit as any),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update variant opening stock');
      }

      // Refetch variant opening stocks
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setVariantOpeningStocks((prev) => [
          ...prev.filter((s) => s.variant_sku !== selectedVariant.sku),
          ...result.data,
        ]);
      }
      setVariantOpenStockDialogOpen(false);
    } catch (err) {
      setVariantOpenStockError(err instanceof Error ? err.message : 'Failed to update variant opening stock');
    } finally {
      setVariantOpenStockLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 8 }}>
      {/* Premium Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0",
          px: { xs: 3, md: 5 },
          py: 3.5,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box sx={{ maxWidth: 1480, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            {/* Left Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{
                  bgcolor: "#f1f5f9",
                  width: 42,
                  height: 42,
                  "&:hover": {
                    bgcolor: "#e2e8f0",
                    transform: "translateX(-3px)",
                  },
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </IconButton>
              
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.75 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: "#0f172a",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.name}
                  </Typography>
                  
                  {item.return_policy?.returnable && (
                    <Chip
                      label="Returnable"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#166534",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: 26,
                        border: "1px solid #bbf7d0",
                        "& .MuiChip-label": { px: 1.5 },
                      }}
                    />
                  )}
                  
                  <Chip
                    label={item.type === "goods" ? "Inventory Item" : "Service"}
                    size="small"
                    sx={{
                      bgcolor: "#e0e7ff",
                      color: "#4338ca",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      height: 26,
                      border: "1px solid #c7d2fe",
                      "& .MuiChip-label": { px: 1.5 },
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#64748b", 
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#94a3b8" }} />
                    SKU: {item.item_details.sku || "N/A"}
                  </Box>
                  <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#94a3b8" }} />
                    Unit: {item.item_details.unit}
                  </Box>
                </Typography>
              </Box>
            </Box>

            {/* Right Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Tooltip title="Edit Item" arrow placement="bottom">
                <IconButton
                  onClick={() => setEditDrawerOpen(true)}
                  sx={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 2.5,
                    width: 44,
                    height: 44,
                    "&:hover": {
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      bgcolor: "#f5f3ff",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <Edit size={20} strokeWidth={2} />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                startIcon={<Package size={20} strokeWidth={2.5} />}
                sx={{
                  bgcolor: "#6366f1",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                  "&:hover": {
                    bgcolor: "#4f46e5",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Adjust Stock
              </Button>
              
              <Tooltip title="More Options" arrow placement="bottom">
                <IconButton
                  sx={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 2.5,
                    width: 44,
                    height: 44,
                    "&:hover": {
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      bgcolor: "#f5f3ff",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <MoreVertical size={20} strokeWidth={2} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modern Navigation Tabs */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0",
          px: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ maxWidth: 1480, mx: "auto" }}>
          <Box sx={{ display: "flex", gap: 8 }}>
            {["Overview", "Transactions", "History"].map((tab, index) => (
              <Box
                key={tab}
                sx={{
                  py: 3,
                  borderBottom: "3px solid",
                  borderColor: index === 0 ? "#6366f1" : "transparent",
                  color: index === 0 ? "#6366f1" : "#64748b",
                  fontWeight: index === 0 ? 700 : 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    color: "#6366f1",
                    "&::after": {
                      width: "100%",
                      opacity: 1,
                    },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -3,
                    left: 0,
                    width: index === 0 ? "100%" : "0%",
                    height: 3,
                    bgcolor: "#c7d2fe",
                    opacity: index === 0 ? 0 : 0.5,
                    transition: "all 0.3s",
                  },
                }}
              >
                {tab}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, maxWidth: 1480, mx: "auto" }}>
        <Box 
          sx={{ 
            display: "grid", 
            gridTemplateColumns: { xs: "1fr", lg: "1fr 460px" }, 
            gap: 5,
          }}
        >
          {/* Left Column - Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Primary Details Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  borderColor: "#cbd5e1",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#ede9fe",
                      color: "#7c3aed",
                      width: 54,
                      height: 54,
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                    }}
                  >
                    <FileText size={26} strokeWidth={2} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                      Primary Details
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Core item information
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 4, rowGap: 3.5 }}>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Item Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#6366f1", fontWeight: 700 }}>
                    {item.name}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Item Type
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: "#f1f5f9",
                        display: "flex",
                      }}
                    >
                      <Package size={18} color="#475569" strokeWidth={2.5} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {item.type === "goods" ? "Inventory Items" : "Service"}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Unit
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.item_details.unit}
                  </Typography>

                  {item.manufacturer && (
                    <>
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Manufacturer
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {getDisplayName(item.manufacturer)}
                      </Typography>
                    </>
                  )}

                  {item.brand && (
                    <>
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Brand
                      </Typography>
                      <Chip
                        label={getDisplayName(item.brand)}
                        size="medium"
                        sx={{
                          bgcolor: "#f1f5f9",
                          color: "#1e293b",
                          fontWeight: 700,
                          border: "1px solid #e2e8f0",
                          height: 32,
                        }}
                      />
                    </>
                  )}

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Created Source
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    User
                  </Typography>

                  {item.inventory?.inventory_account && (
                    <>
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Inventory Account
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {item.inventory.inventory_account}
                      </Typography>
                    </>
                  )}

                  {item.inventory?.inventory_valuation_method && (
                    <>
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Valuation Method
                      </Typography>
                      <Chip
                        label={item.inventory.inventory_valuation_method}
                        size="medium"
                        sx={{
                          bgcolor: "#dbeafe",
                          color: "#1e40af",
                          fontWeight: 700,
                          border: "1px solid #bfdbfe",
                          height: 32,
                        }}
                      />
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Purchase Information Card */}
            {item.purchase_info?.account && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    borderColor: "#cbd5e1",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#fef3c7",
                        color: "#b45309",
                        width: 54,
                        height: 54,
                        boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)",
                      }}
                    >
                      <ShoppingCart size={26} strokeWidth={2} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                        Purchase Information
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                        Vendor and cost details
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 4, rowGap: 3.5 }}>
                    {item.purchase_info.cost_price && (
                      <>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Cost Price
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: "#b45309", 
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {item.purchase_info.currency} {item.purchase_info.cost_price}
                        </Typography>
                      </>
                    )}

                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                      Purchase Account
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {item.purchase_info.account}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Sales Information Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  borderColor: "#cbd5e1",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#d1fae5",
                      color: "#065f46",
                      width: 54,
                      height: 54,
                      boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
                    }}
                  >
                    <TrendingUp size={26} strokeWidth={2} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                      Sales Information
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Pricing and revenue details
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 4, rowGap: 3.5 }}>
                  {item.sales_info.selling_price && (
                    <>
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Selling Price
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: "#065f46", 
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.sales_info.currency} {item.sales_info.selling_price}
                      </Typography>
                    </>
                  )}

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Sales Account
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.sales_info.account}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Reporting Tags Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                bgcolor: "#fafbfc",
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#e0e7ff",
                      color: "#6366f1",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Tag size={22} strokeWidth={2} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Reporting Tags
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    p: 4,
                    bgcolor: "white",
                    borderRadius: 3,
                    border: "2px dashed #cbd5e1",
                  }}
                >
                  <AlertCircle size={22} color="#94a3b8" strokeWidth={2} />
                  <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
                    No reporting tag has been associated with this item.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Stock/Variants */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Stock Information Card - Single Structure */}
            {isSingleStructure && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "sticky",
                  top: 140,
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: "#fce7f3",
                          color: "#be185d",
                          width: 54,
                          height: 54,
                          boxShadow: "0 4px 12px rgba(190, 24, 93, 0.15)",
                        }}
                      >
                        <Warehouse size={26} strokeWidth={2} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                          Stock Overview
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                          {loadingStock ? "Loading..." : `Opening Stock: ${formatNumber(openingStockData?.opening_stock)}`}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit size={16} strokeWidth={2.5} />}
                      onClick={handleOpenStockEdit}
                      sx={{
                        borderColor: "#cbd5e1",
                        color: "#475569",
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        "&:hover": {
                          borderColor: "#6366f1",
                          color: "#6366f1",
                          bgcolor: "#f5f3ff",
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </Box>

                  {/* Accounting Stock */}
                  <Box
                    sx={{
                      mb: 4,
                      p: 4,
                      bgcolor: "#f0fdf4",
                      borderRadius: 3,
                      border: "1.5px solid #bbf7d0",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: "#15803d",
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle size={20} strokeWidth={2.5} />
                      Accounting Stock
                    </Typography>
                    <Stack spacing={2.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Stock on Hand
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 700 }}>
                          {loadingStock ? "..." : formatNumber(openingStockData?.opening_stock)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Committed Stock
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#b45309", fontWeight: 700 }}>
                          0.00
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Available for Sale
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#065f46", fontWeight: 700 }}>
                          {loadingStock ? "..." : formatNumber(openingStockData?.opening_stock)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Physical Stock */}
                  <Box
                    sx={{
                      mb: 4,
                      p: 4,
                      bgcolor: "#eff6ff",
                      borderRadius: 3,
                      border: "1.5px solid #bfdbfe",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: "#1e40af",
                        fontWeight: 700,
                      }}
                    >
                      <Package size={20} strokeWidth={2.5} />
                      Physical Stock
                    </Typography>
                    <Stack spacing={2.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Stock on Hand
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 700 }}>
                          {loadingStock ? "..." : formatNumber(openingStockData?.opening_stock)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Committed Stock
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#b45309", fontWeight: 700 }}>
                          0.00
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Available for Sale
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#065f46", fontWeight: 700 }}>
                          {loadingStock ? "..." : formatNumber(openingStockData?.opening_stock)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Stock Metrics Grid */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3, mb: 4 }}>
                    {[
                      { label: "To be Shipped", value: 0, icon: TrendingUp, color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
                      { label: "To be Received", value: 0, icon: TrendingDown, color: "#0891b2", bg: "#cffafe", border: "#a5f3fc" },
                      { label: "To be Invoiced", value: 0, icon: FileText, color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
                      { label: "To be Billed", value: 0, icon: Clock, color: "#dc2626", bg: "#fee2e2", border: "#fecaca" },
                    ].map((metric, idx) => (
                      <Card
                        key={idx}
                        elevation={0}
                        sx={{
                          textAlign: "center",
                          p: 3,
                          border: "2px solid",
                          borderColor: metric.border,
                          borderRadius: 3,
                          bgcolor: metric.bg,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                            transform: "translateY(-6px) scale(1.02)",
                            borderColor: metric.color,
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "white",
                              display: "inline-flex",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                          >
                            <metric.icon size={24} color={metric.color} strokeWidth={2.5} />
                          </Box>
                        </Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: metric.color, 
                            fontWeight: 700, 
                            mb: 1,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {metric.value}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "#64748b", 
                            fontWeight: 600,
                            display: "block",
                            lineHeight: 1.4,
                          }}
                        >
                          {metric.label}
                        </Typography>
                      </Card>
                    ))}
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Reorder Point */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 700, color: "#0f172a" }}>
                      Reorder Point
                    </Typography>
                    <Alert
                      severity="warning"
                      icon={<AlertCircle size={22} strokeWidth={2} />}
                      sx={{
                        borderRadius: 3,
                        bgcolor: "#fffbeb",
                        border: "1.5px solid #fde68a",
                        py: 2,
                        "& .MuiAlert-message": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "#78350f",
                        },
                      }}
                    >
                      Enable reorder notification before setting reorder point for items.
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Variants Card - Multi Structure */}
            {!isSingleStructure && item.item_details.variants && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "sticky",
                  top: 140,
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#f3e8ff",
                        color: "#7c3aed",
                        width: 54,
                        height: 54,
                        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                      }}
                    >
                      <Activity size={26} strokeWidth={2} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                        Product Variants
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                        {item.item_details.variants.length} variants available
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    {item.item_details.variants.map((variant, index) => {
                      const variantStock = variantOpeningStocks.find(s => s.variant_sku === variant.sku);
                      
                      return (
                        <Card
                          key={index}
                          elevation={0}
                          onClick={() => setSelectedVariant(selectedVariant?.sku === variant.sku ? null : variant)}
                          sx={{
                            p: 4,
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 3,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            borderColor: selectedVariant?.sku === variant.sku ? "#6366f1" : "#e2e8f0",
                            bgcolor: selectedVariant?.sku === variant.sku ? "#f5f3ff" : "white",
                            "&:hover": {
                              borderColor: "#6366f1",
                              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.15)",
                              transform: "translateX(6px)",
                              bgcolor: "#f5f3ff",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  mb: 1.5, 
                                  fontWeight: 700, 
                                  color: "#0f172a",
                                  fontSize: "1rem",
                                }}
                              >
                                {variant.sku}
                              </Typography>
                              
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                                {Object.entries(variant.attribute_map).map(([key, value], i) => (
                                  <Chip
                                    key={i}
                                    label={`${key}: ${value}`}
                                    size="small"
                                    sx={{
                                      fontSize: "0.75rem",
                                      height: 28,
                                      bgcolor: "#f1f5f9",
                                      color: "#1e293b",
                                      fontWeight: 700,
                                      border: "1px solid #e2e8f0",
                                      "& .MuiChip-label": { px: 1.5 },
                                    }}
                                  />
                                ))}
                              </Box>
                              
                              <Chip
                                label={`Stock: ${variantStock?.opening_stock ?? variant.stock_quantity}`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  height: 28,
                                  bgcolor: (variantStock?.opening_stock ?? variant.stock_quantity) > 0 ? "#dcfce7" : "#fee2e2",
                                  color: (variantStock?.opening_stock ?? variant.stock_quantity) > 0 ? "#166534" : "#991b1b",
                                  border: "1px solid",
                                  borderColor: (variantStock?.opening_stock ?? variant.stock_quantity) > 0 ? "#bbf7d0" : "#fecaca",
                                  "& .MuiChip-label": { px: 1.5 },
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ textAlign: "right", ml: 4 }}>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  color: "#065f46", 
                                  fontWeight: 700,
                                  letterSpacing: "-0.02em",
                                }}
                              >
                                {item.sales_info.currency} {variant.selling_price}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>

                  {/* Stock Overview for Selected Variant */}
                  {selectedVariant && (
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 4 }} />
                      
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            Stock Details - {selectedVariant.sku}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit size={16} strokeWidth={2.5} />}
                            onClick={handleVariantOpenStockEdit}
                            sx={{
                              borderColor: "#cbd5e1",
                              color: "#475569",
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 2,
                              px: 2.5,
                              py: 1,
                              "&:hover": {
                                borderColor: "#6366f1",
                                color: "#6366f1",
                                bgcolor: "#f5f3ff",
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Box>

                        {/* Accounting Stock */}
                        <Box
                          sx={{
                            mb: 3,
                            p: 4,
                            bgcolor: "#f0fdf4",
                            borderRadius: 3,
                            border: "1.5px solid #bbf7d0",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              color: "#15803d",
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle size={18} strokeWidth={2.5} />
                            Accounting Stock
                          </Typography>
                          <Stack spacing={2.5}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Stock on Hand
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 700 }}>
                                {loadingStock ? "..." : formatNumber(selectedVariantStock?.opening_stock ?? selectedVariant.stock_quantity)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Committed Stock
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#b45309", fontWeight: 700 }}>
                                0.00
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Available for Sale
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#065f46", fontWeight: 700 }}>
                                {loadingStock ? "..." : formatNumber(selectedVariantStock?.opening_stock ?? selectedVariant.stock_quantity)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Physical Stock */}
                        <Box
                          sx={{
                            mb: 3,
                            p: 4,
                            bgcolor: "#eff6ff",
                            borderRadius: 3,
                            border: "1.5px solid #bfdbfe",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              color: "#1e40af",
                              fontWeight: 700,
                            }}
                          >
                            <Package size={18} strokeWidth={2.5} />
                            Physical Stock
                          </Typography>
                          <Stack spacing={2.5}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Stock on Hand
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 700 }}>
                                {loadingStock ? "..." : formatNumber(selectedVariantStock?.opening_stock ?? selectedVariant.stock_quantity)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Committed Stock
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#b45309", fontWeight: 700 }}>
                                0.00
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                                Available for Sale
                              </Typography>
                              <Typography variant="h6" sx={{ color: "#065f46", fontWeight: 700 }}>
                                {loadingStock ? "..." : formatNumber(selectedVariantStock?.opening_stock ?? selectedVariant.stock_quantity)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Variant Price Info */}
                        <Box
                          sx={{
                            p: 4,
                            bgcolor: "#fefce8",
                            borderRadius: 3,
                            border: "1.5px solid #fde68a",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              color: "#854d0e",
                              fontWeight: 700,
                            }}
                          >
                            <TrendingUp size={18} strokeWidth={2.5} />
                            Pricing Information
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                              Selling Price
                            </Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: "#065f46", 
                                fontWeight: 700,
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {item.sales_info.currency} {selectedVariant.selling_price}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Drawer */}
      <ItemEditDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        item={item}
        onSave={handleUpdateItem}
      />

      {/* Opening Stock Dialog */}
      <Dialog open={openStockDialogOpen} onClose={handleCloseOpenStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>Edit Opening Stock</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {openStockError && (
            <Alert severity="error" sx={{ mb: 2 }}>{openStockError}</Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Opening Stock Quantity"
              type="number"
              fullWidth
              inputProps={{ step: "1", min: "0" }}
              value={openingStockForm.opening_stock}
              onChange={(e) => setOpeningStockForm({ ...openingStockForm, opening_stock: parseInt(e.target.value) || 0 })}
              disabled={openStockLoading}
            />
            <TextField
              label="Opening Stock Rate (per unit)"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
              value={openingStockForm.opening_stock_rate_per_unit}
              onChange={(e) => setOpeningStockForm({ ...openingStockForm, opening_stock_rate_per_unit: parseFloat(e.target.value) || 0 })}
              disabled={openStockLoading}
              helperText={`Total Value: ₹${((openingStockForm.opening_stock || 0) * (openingStockForm.opening_stock_rate_per_unit || 0)).toFixed(2)}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOpenStockDialog} disabled={openStockLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOpeningStock}
            disabled={openStockLoading}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {openStockLoading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variant Opening Stock Dialog */}
      <Dialog
        open={variantOpenStockDialogOpen}
        onClose={handleCloseVariantOpenStockDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>
          Edit Opening Stock - {selectedVariant?.sku}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {variantOpenStockError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {variantOpenStockError}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Opening Stock Quantity"
              type="number"
              fullWidth
              inputProps={{ step: "1", min: "0" }}
              value={variantOpeningStockForm.opening_stock}
              onChange={(e) => setVariantOpeningStockForm({ ...variantOpeningStockForm, opening_stock: parseInt(e.target.value) || 0 })}
              disabled={variantOpenStockLoading}
            />
            <TextField
              label="Opening Stock Rate (per unit)"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
              value={variantOpeningStockForm.opening_stock_rate_per_unit}
              onChange={(e) => setVariantOpeningStockForm({ ...variantOpeningStockForm, opening_stock_rate_per_unit: parseFloat(e.target.value) || 0 })}
              disabled={variantOpenStockLoading}
              helperText={`Total Value: ₹${((variantOpeningStockForm.opening_stock || 0) * (variantOpeningStockForm.opening_stock_rate_per_unit || 0)).toFixed(2)}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariantOpenStockDialog} disabled={variantOpenStockLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveVariantOpeningStock}
            disabled={variantOpenStockLoading}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {variantOpenStockLoading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}