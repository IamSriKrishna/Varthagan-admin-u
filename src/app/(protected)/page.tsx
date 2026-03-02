'use client';

import { config } from "@/config";
import { orders, dashboard } from "@/constants/apiConstants";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { useDashboard } from "@/hooks/useDashboard";
import { BBDropdownBase, BBLoader } from "@/lib";
import { IStatsResponse } from "@/models/IDashboard";
import { IOrdersResponse } from "@/models/IOrders";
import { EntityTrends } from "@/models/dashboard.model";
import { RootState } from "@/store";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { PieChart, SparkLineChart } from "@mui/x-charts";
import {
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  TrendingUp,
  XCircle,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as classes from "./Dashboard.styles";

type CardData = {
  title: string;
  value: string | number;
  sparkData: number[];
  plotType?: "line" | "bar";
  icon?: React.ElementType;
};

type TrendDataMap = {
  [key: string]: EntityTrends | null;
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle color="#4CAF50" size={18} />;
    case "processing":
      return <Clock color="#FF9800" size={18} />;
    case "pending":
      return <Clock color="#9E9E9E" size={18} />;
    case "cancelled":
      return <XCircle color="#F44336" size={18} />;
    default:
      return <Clock color="#2196F3" size={18} />;
  }
};

const Dashboard = () => {
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const userType = useSelector((state: RootState) => state.auth.user?.user_type || "");
  const { innerRadius, outerRadius } = classes.usePieChartRadii();
  const [selectedCustomerType, setSelectedCustomerType] = useState("mobile_user");
  const [allExpanded, setAllExpanded] = useState(false);
  const [trendDataMap, setTrendDataMap] = useState<TrendDataMap>({});

  // New dashboard hook - all API endpoints
  const {
    dashboardMetrics,
    loadingMetrics,
    activitySummary,
    loadingActivity,
    stockInfo,
    loadingStock,
    entityTrends,
    loadingTrends,
    fetchDashboardMetrics,
    fetchActivitySummary,
    fetchStockInfo,
    fetchEntityTrends,
    refreshDashboard,
    refreshing,
  } = useDashboard();

  // Helper function to get sparkline data from trends
  const getSparklineDataFromTrends = (entityType: string): number[] => {
    const trends = trendDataMap[entityType];
    if (trends && trends.data && trends.data.length > 0) {
      return trends.data.map((d) => d.count || 0);
    }
    return [];
  };

  // Existing hooks
  const toggleAllCards = () => {
    setAllExpanded((prev) => !prev);
  };

  const handleTypeChange = (value: string) => {
    setSelectedCustomerType(value);
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedVendorId) {
      params.append("vendor_id", String(selectedVendorId));
    }
    return params.toString();
  }, [selectedVendorId]);

  const statsqueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("customer_type", selectedCustomerType);
    return params.toString();
  }, [selectedCustomerType]);

  const {
    source,
    data: statsresults,
    loading: statsloading,
  } = useSmartFetch<IStatsResponse>({
    url: `${orders.getDashboardStats}?${statsqueryParams}`,
    baseUrl: config.loginDomain,
    isCaching: true,
  });

  const {
    data: results,
    loading,
    refetch,
  } = useSmartFetch<IOrdersResponse>({
    url:
      userType === "admin"
        ? `${orders.getDashboardById(String(selectedVendorId ?? ""))}`
        : `${orders.getDashboard}?${queryParams}`,
    baseUrl: config.orderDomain,
  });

  // Fetch all dashboard data on mount
  useEffect(() => {
    const loadTrends = async () => {
      const customerTrends = await fetchEntityTrends("customer", 30);
      if (customerTrends) setTrendDataMap((prev) => ({ ...prev, customer: customerTrends }));

      const vendorTrends = await fetchEntityTrends("vendor", 30);
      if (vendorTrends) setTrendDataMap((prev) => ({ ...prev, vendor: vendorTrends }));

      const itemTrends = await fetchEntityTrends("item", 30);
      if (itemTrends) setTrendDataMap((prev) => ({ ...prev, item: itemTrends }));

      const shipmentTrends = await fetchEntityTrends("shipment", 30);
      if (shipmentTrends) setTrendDataMap((prev) => ({ ...prev, shipment: shipmentTrends }));

      // Fetch trends for invoices, sales orders, and purchase orders
      const invoiceTrends = await fetchEntityTrends("invoice", 30);
      if (invoiceTrends) setTrendDataMap((prev) => ({ ...prev, invoice: invoiceTrends }));

      const salesOrderTrends = await fetchEntityTrends("sales_order", 30);
      if (salesOrderTrends) setTrendDataMap((prev) => ({ ...prev, sales_order: salesOrderTrends }));

      const purchaseOrderTrends = await fetchEntityTrends("purchase_order", 30);
      if (purchaseOrderTrends) setTrendDataMap((prev) => ({ ...prev, purchase_order: purchaseOrderTrends }));
    };

    fetchDashboardMetrics();
    fetchActivitySummary();
    fetchStockInfo();
    loadTrends();
  }, [fetchDashboardMetrics, fetchActivitySummary, fetchStockInfo, fetchEntityTrends]);

  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });

  const ordersList = results?.data?.orders || [];
  const orderPending = ordersList.filter(o => o.order_status === "pending").length;

  const businessMetricsCards: CardData[] = dashboardMetrics ? [
    {
      title: "Total Customers",
      value: dashboardMetrics.customer_metrics.total,
      sparkData: getSparklineDataFromTrends("customer"),
      icon: Bell,
    },
    {
      title: "Active Customers",
      value: dashboardMetrics.customer_metrics.active,
      sparkData: getSparklineDataFromTrends("customer"),
      icon: CheckCircle,
    },
    {
      title: "Total Vendors",
      value: dashboardMetrics.vendor_metrics.total,
      sparkData: getSparklineDataFromTrends("vendor"),
      icon: ShoppingCart,
      plotType: "bar" as const,
    },
    {
      title: "Total Items",
      value: dashboardMetrics.item_metrics.total,
      sparkData: getSparklineDataFromTrends("item"),
      icon: Package,
      plotType: "bar" as const,
    },
    {
      title: "Total Shipments",
      value: dashboardMetrics.shipment_metrics.total,
      sparkData: getSparklineDataFromTrends("shipment"),
      icon: Truck,
    },
    {
      title: "Total Invoices",
      value: dashboardMetrics.invoice_metrics.total,
      sparkData: getSparklineDataFromTrends("invoice"),
      icon: FileText,
    },
    {
      title: "Sales Orders",
      value: dashboardMetrics.sales_order_metrics.total,
      sparkData: getSparklineDataFromTrends("sales_order"),
      icon: BarChart3,
    },
    {
      title: "Purchase Orders",
      value: dashboardMetrics.purchase_order_metrics.total,
      sparkData: getSparklineDataFromTrends("purchase_order"),
      icon: ShoppingCart,
    },
  ] : [];

  const lowStockCount = stockInfo?.low_stock_count ?? 0;
  const outOfStockCount = stockInfo?.out_of_stock_count ?? 0;

  return (
    <Box>
      <BBLoader enabled={loading || statsloading || loadingMetrics || loadingActivity || loadingStock || loadingTrends} />

      {/* Page Header */}
      <Box sx={classes.headerCard}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent={{ xs: "flex-start", sm: "space-between" }}
          alignItems="center"
          spacing={{ xs: 2, md: 0 }}
        >
          <Typography variant="h4" sx={classes.headerTitle}>
            Dashboard Overview
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ mr: 2 }}>
              <BBDropdownBase
                name="customer_type"
                label=""
                value={selectedCustomerType}
                options={[
                  { value: "mobile_user", label: "Mobile User" },
                  { value: "partner", label: "Partner" },
                  { value: "vendor", label: "Vendor" },
                ]}
                onDropdownChange={(e, _name, val) => handleTypeChange(val as string)}
                sx={classes.dropdownFilter}
              />
            </Box>
            <Tooltip title="Refresh dashboard metrics">
              <Button
                onClick={refreshDashboard}
                disabled={refreshing}
                sx={{
                  ...classes.toggleButtton,
                  minWidth: "auto",
                  px: 2,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: { xs: "none", md: "inline" },
                  }}
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Box>
              </Button>
            </Tooltip>
            <Button
              onClick={toggleAllCards}
              startIcon={allExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              sx={classes.toggleButtton}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: "none", md: "inline" },
                  mx: 0,
                }}
              >
                {allExpanded ? "Hide Graphs" : "Show Graphs"}
              </Box>
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card elevation={0} sx={{ mb: 3, bgcolor: "#FFF3E0", border: "1px solid #FFB74D" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AlertCircle size={24} color="#FF9800" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Inventory Alert
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lowStockCount} items low on stock, {outOfStockCount} out of stock
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary Section */}
      {activitySummary && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
            Today's Activity
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[
              { label: "Customers Created", value: activitySummary.created_customers_today, icon: Bell },
              { label: "Vendors Created", value: activitySummary.created_vendors_today, icon: ShoppingCart },
              { label: "Items Created", value: activitySummary.created_items_today, icon: Package },
              { label: "Sales Orders", value: activitySummary.created_sales_orders_today, icon: BarChart3 },
              { label: "Purchase Orders", value: activitySummary.created_purchase_orders_today, icon: FileText },
              { label: "Shipped Today", value: activitySummary.shipped_today, icon: Truck },
              { label: "Delivered Today", value: activitySummary.delivered_today, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: "auto" }}>
                <Card elevation={0} sx={classes.statsCard}>
                  <CardContent sx={classes.statsCardContent}>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Icon size={20} color="primary.main" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {label}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {value}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Detailed Stock Information */}
      {stockInfo && (
        <>
          {/* Stock Overview Summary */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
            Inventory Overview
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                label: "Total Items", 
                value: stockInfo.total_items, 
                icon: Package,
                color: "#667eea",
                bgColor: "#EEF2FF"
              },
              { 
                label: "In Stock", 
                value: stockInfo.in_stock_count, 
                icon: CheckCircle,
                color: "#4CAF50",
                bgColor: "#E8F5E9"
              },
              { 
                label: "Low Stock", 
                value: stockInfo.low_stock_count, 
                icon: Clock,
                color: "#FF9800",
                bgColor: "#FFF3E0"
              },
              { 
                label: "Out of Stock", 
                value: stockInfo.out_of_stock_count, 
                icon: AlertCircle,
                color: "#F44336",
                bgColor: "#FFEBEE"
              },
              { 
                label: "Total Quantity", 
                value: stockInfo.total_quantity, 
                icon: BarChart3,
                color: "#764ba2",
                bgColor: "#F3E5F5"
              },
            ].map(({ label, value, icon: Icon, color, bgColor }, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: "auto" }}>
                <Card elevation={0} sx={{ 
                  bgcolor: bgColor,
                  border: `1px solid ${color}30`,
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={20} color={color} strokeWidth={2} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {label}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                        {value}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Inventory Items Details */}
          {stockInfo.data && stockInfo.data.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                Inventory Details ({stockInfo.data.length} Items)
              </Typography>

              <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #E0E0E0", backgroundColor: "#F5F5F5" }}>
                          <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Item Name
                          </th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Current
                          </th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Available
                          </th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Reserved
                          </th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            In Transit
                          </th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockInfo.data.map((item, index) => {
                          const statusColor =
                            item.status === "in_stock"
                              ? "#4CAF50"
                              : item.status === "low_stock"
                              ? "#FF9800"
                              : "#F44336";
                          const statusBgColor =
                            item.status === "in_stock"
                              ? "#E8F5E9"
                              : item.status === "low_stock"
                              ? "#FFF3E0"
                              : "#FFEBEE";

                          return (
                            <tr key={index} style={{ borderBottom: "1px solid #F0F0F0" }}>
                              <td style={{ padding: "12px" }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.item_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.item_id}
                                </Typography>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item.current_quantity}
                                </Typography>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <Typography variant="body2">
                                  {item.available_quantity}
                                </Typography>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <Chip
                                  label={item.reserved_quantity}
                                  size="small"
                                  variant="outlined"
                                  color={item.reserved_quantity > 0 ? "warning" : "default"}
                                />
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <Typography variant="body2">
                                  {item.in_transit_quantity}
                                </Typography>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <Chip
                                  label={item.status.replace("_", " ").toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: statusColor,
                                    color: "white",
                                    fontWeight: 600,
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>

              {/* Alternative Card View */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                Stock Items (Card View)
              </Typography>

              <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    {stockInfo.data.map((item, index) => {
                      const statusColor =
                        item.status === "in_stock"
                          ? "#4CAF50"
                          : item.status === "low_stock"
                          ? "#FF9800"
                          : "#F44336";
                      const statusBgColor =
                        item.status === "in_stock"
                          ? "#E8F5E9"
                          : item.status === "low_stock"
                          ? "#FFF3E0"
                          : "#FFEBEE";

                      return (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Box sx={{ 
                            p: 2, 
                            border: "1px solid #E0E0E0", 
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              borderColor: statusColor,
                            }
                          }}>
                            <Stack spacing={1}>
                              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {item.item_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.item_id}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={item.status.replace("_", " ").toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: statusColor,
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.7rem"
                                  }}
                                />
                              </Box>

                              <Divider sx={{ my: 0.5 }} />

                              <Grid container spacing={1}>
                                <Grid size={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Current
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
                                      {item.current_quantity}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Available
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#4CAF50" }}>
                                      {item.available_quantity}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Reserved
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.reserved_quantity > 0 ? "#FF9800" : "#999" }}>
                                      {item.reserved_quantity}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      In Transit
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#2196F3" }}>
                                      {item.in_transit_quantity}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>

                              {/* Progress Bar */}
                              <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Utilization
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {item.current_quantity > 0 
                                      ? Math.round((item.reserved_quantity / item.current_quantity) * 100) 
                                      : 0}%
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: "100%",
                                  height: 6,
                                  bgcolor: "#E0E0E0",
                                  borderRadius: 3,
                                  overflow: "hidden"
                                }}>
                                  <Box sx={{
                                    width: `${item.current_quantity > 0 ? (item.reserved_quantity / item.current_quantity) * 100 : 0}%`,
                                    height: "100%",
                                    bgcolor: statusColor,
                                    transition: "width 0.3s ease"
                                  }} />
                                </Box>
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}

          <Divider sx={{ my: 3 }} />
        </>
      )}


      {/* Business Metrics Section */}
      {dashboardMetrics && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
            Business Metrics
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {businessMetricsCards.slice(0, 4).map(({ title, value, sparkData, plotType, icon: Icon }, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card elevation={0} sx={classes.statsCard}>
                  <CardContent sx={classes.statsCardContent}>
                    <Box sx={classes.statsTopSection}>
                      <Box sx={classes.statsTextBox}>
                        <Typography variant="subtitle2" sx={classes.statsLabel}>
                          {title}
                        </Typography>
                        <Typography variant="h4" sx={classes.statsValue}>
                          {value}
                        </Typography>
                      </Box>
                      <Box sx={classes.statsIconBox}>
                        {Icon ? <Icon size={24} color="white" strokeWidth={2.5} /> : <TrendingUp size={24} color="white" strokeWidth={2.5} />}
                      </Box>
                    </Box>

                    <Collapse in={allExpanded} timeout="auto" unmountOnExit>
                      <Box sx={classes.CollapseIconBox}>
                        <SparkLineChart
                          showHighlight
                          showTooltip
                          height={80}
                          data={sparkData}
                          plotType={plotType}
                          color="#667eea"
                        />
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Extended Business Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {businessMetricsCards.slice(4).map(({ title, value, sparkData, plotType, icon: Icon }, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card elevation={0} sx={classes.statsCard}>
                  <CardContent sx={classes.statsCardContent}>
                    <Box sx={classes.statsTopSection}>
                      <Box sx={classes.statsTextBox}>
                        <Typography variant="subtitle2" sx={classes.statsLabel}>
                          {title}
                        </Typography>
                        <Typography variant="h4" sx={classes.statsValue}>
                          {value}
                        </Typography>
                      </Box>
                      <Box sx={classes.statsIconBox}>
                        {Icon ? <Icon size={24} color="white" strokeWidth={2.5} /> : <TrendingUp size={24} color="white" strokeWidth={2.5} />}
                      </Box>
                    </Box>

                    <Collapse in={allExpanded} timeout="auto" unmountOnExit>
                      <Box sx={classes.CollapseIconBox}>
                        <SparkLineChart
                          showHighlight
                          showTooltip
                          height={80}
                          data={sparkData}
                          plotType={plotType}
                          color="#667eea"
                        />
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Detailed Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Shipment Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={classes.statsCard}>
                <CardContent sx={classes.statsCardContent}>
                  <Typography variant="subtitle2" sx={classes.statsLabel}>
                    Delivered
                  </Typography>
                  <Typography variant="h5">{dashboardMetrics.shipment_metrics.delivered}</Typography>
                  <Chip
                    label={`${dashboardMetrics.shipment_metrics.pending} Pending`}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Invoice Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={classes.statsCard}>
                <CardContent sx={classes.statsCardContent}>
                  <Typography variant="subtitle2" sx={classes.statsLabel}>
                    Invoice Revenue
                  </Typography>
                  <Typography variant="h5">
                    ₹{(dashboardMetrics.invoice_metrics.total_amount / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Outstanding: ₹{(dashboardMetrics.invoice_metrics.outstanding_amount / 1000).toFixed(0)}K
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Sales Order Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={classes.statsCard}>
                <CardContent sx={classes.statsCardContent}>
                  <Typography variant="subtitle2" sx={classes.statsLabel}>
                    Sales Orders
                  </Typography>
                  <Typography variant="h5">{dashboardMetrics.sales_order_metrics.completed_count}</Typography>
                  <Chip
                    label={`${dashboardMetrics.sales_order_metrics.pending_count} Pending`}
                    size="small"
                    variant="outlined"
                    color="info"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Package Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={classes.statsCard}>
                <CardContent sx={classes.statsCardContent}>
                  <Typography variant="subtitle2" sx={classes.statsLabel}>
                    Packages
                  </Typography>
                  <Typography variant="h5">{dashboardMetrics.package_metrics.delivered_count}</Typography>
                  <Chip
                    label={`${dashboardMetrics.package_metrics.in_transit_count} In Transit`}
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Entity Trends Sections */}
      {Object.entries(trendDataMap).map(([entityType, trends]) => {
        if (!trends || !trends.data || trends.data.length === 0) return null;

        return (
          <Box key={entityType} sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Trends (Last 30 Days)
            </Typography>

            <Card elevation={0}>
              <CardContent>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #E0E0E0" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                          Date
                        </th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                          Total Count
                        </th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                          Active Count
                        </th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                          Created Today
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.data.slice(0, 10).map((trend, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #F0F0F0" }}>
                          <td style={{ padding: "12px" }}>
                            <Typography variant="body2">{new Date(trend.date).toLocaleDateString()}</Typography>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Chip label={trend.count} size="small" variant="outlined" />
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Chip label={trend.active_count} size="small" color="primary" />
                          </td>
                          <td style={{ padding: "12px" }}>
                            <Chip label={trend.created_today} size="small" color="success" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />
          </Box>
        );
      })}
    </Box>
  );
};

export default Dashboard;
