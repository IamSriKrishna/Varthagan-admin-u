'use client';

import { config } from "@/config";
import { orders, dashboard } from "@/constants/apiConstants";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { useDashboard } from "@/hooks/useDashboard";
import { BBDropdownBase, BBLoader } from "@/lib";
import { IStatsResponse } from "@/models/IDashboard";
import { IOrdersResponse } from "@/models/IOrders";
import { RootState } from "@/store";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  Stack,
  Typography,
  Chip,
  Divider,
  Tooltip,
  Alert,
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

const cityData = [
  { id: 0, value: 45, label: "Thirunelveli" },
  { id: 1, value: 30, label: "Marthandam" },
  { id: 2, value: 25, label: "Nagercoil" },
];

const colors = ["#667eea", "#764ba2", "#8B5CF6"];

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

  // New dashboard hook
  const {
    dashboardMetrics,
    loadingMetrics,
    activitySummary,
    stockInfo,
    errorStock,
    fetchDashboardMetrics,
    fetchActivitySummary,
    fetchStockInfo,
  } = useDashboard();

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

  // Fetch dashboard metrics on mount
  useEffect(() => {
    fetchDashboardMetrics();
    fetchActivitySummary();
    fetchStockInfo();
  }, [fetchDashboardMetrics, fetchActivitySummary, fetchStockInfo]);

  // Log when stockInfo changes
  useEffect(() => {
    console.log('StockInfo updated:', stockInfo);
    if (stockInfo?.data) {
      console.log('Stock items count:', stockInfo.data.length);
      console.log('Items with availability:', stockInfo.data.map(item => ({
        product: item.product_name,
        availability: ((item.available_stock / item.current_stock) * 100).toFixed(2) + '%'
      })));
    }
  }, [stockInfo]);

  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });

  const ordersList = results?.data?.orders || [];
  const orderPending = ordersList.filter((o) => o.order_status === "pending").length;

  // Business metrics cards
  const businessMetricsCards: CardData[] = dashboardMetrics
    ? [
        {
          title: "Total Customers",
          value: dashboardMetrics.customer_metrics.total,
          sparkData: [1, 4, 2, 5, 7, 2, 4, 6],
          icon: Bell,
        },
        {
          title: "Active Customers",
          value: dashboardMetrics.customer_metrics.active,
          sparkData: [1, 4, 2, 5, 7, 2, 4, 6],
          icon: CheckCircle,
        },
        {
          title: "Total Vendors",
          value: dashboardMetrics.vendor_metrics.total,
          sparkData: [1, 3, 2, 4, 6, 3, 5, 7],
          icon: ShoppingCart,
          plotType: "bar" as const,
        },
        {
          title: "Total Items",
          value: dashboardMetrics.item_metrics.total,
          sparkData: [1, 2, 1, 4, 3, 2, 3, 5],
          icon: Package,
          plotType: "bar" as const,
        },
        {
          title: "Total Shipments",
          value: dashboardMetrics.shipment_metrics.total,
          sparkData: [2, 3, 2, 5, 4, 3, 4, 6],
          icon: Truck,
        },
        {
          title: "Total Invoices",
          value: dashboardMetrics.invoice_metrics.total,
          sparkData: [1, 2, 3, 2, 4, 5, 3, 6],
          icon: FileText,
        },
        {
          title: "Sales Orders",
          value: dashboardMetrics.sales_order_metrics.total,
          sparkData: [2, 4, 3, 5, 6, 4, 3, 7],
          icon: BarChart3,
        },
        {
          title: "Purchase Orders",
          value: dashboardMetrics.purchase_order_metrics.total,
          sparkData: [1, 3, 2, 4, 5, 3, 4, 5],
          icon: ShoppingCart,
        },
      ]
    : [];

  // Legacy stats cards
  const legacyCards: CardData[] = [
    {
      title: "Total Users",
      value: statsresults?.total_users ?? "0",
      sparkData: [1, 4, 2, 5, 7, 2, 4, 6],
    },
    {
      title: "Active User",
      value: statsresults?.active_users ?? "0",
      sparkData: [1, 4, 2, 5, 7, 2, 4, 6],
    },
    {
      title: "Membership Users",
      value: statsresults?.membership_users ?? "0",
      sparkData: [1, 3, 2, 4, 6, 3, 5, 7],
      plotType: "bar" as const,
    },
    {
      title: "Total Orders",
      value: results?.data?.meta?.total ?? "0",
      sparkData: [1, 2, 1, 4, 3, 2, 3, 5],
      plotType: "bar" as const,
    },
  ];

  // Low stock alert
  const lowStockCount = stockInfo?.low_stock_count ?? 0;
  const outOfStockCount = stockInfo?.out_of_stock_count ?? 0;
  
  // Calculate items with less than 3% availability
  const criticalAvailabilityItems = useMemo(() => {
    if (!stockInfo?.data || !Array.isArray(stockInfo.data)) {
      console.log('StockInfo.data is invalid:', stockInfo?.data);
      return [];
    }

    return stockInfo.data.filter(item => {
      try {
        if (!item || item.current_stock === 0) return false; // Skip out of stock
        
        // Handle case where available_stock might be 0
        if (item.available_stock === 0 && item.current_stock > 0) {
          return false; // No available stock
        }
        
        const availabilityPercentage = (item.available_stock / item.current_stock) * 100;
        const isCritical = availabilityPercentage < 3 && item.available_stock > 0;
        
        // Debug log for critical items
        if (isCritical) {
          console.log(`✓ Critical availability detected: ${item.product_name} - ${availabilityPercentage.toFixed(2)}% (${item.available_stock}/${item.current_stock})`);
        }
        
        return isCritical;
      } catch (err) {
        console.error(`Error processing item:`, item, err);
        return false;
      }
    });
  }, [stockInfo]);

  return (
    <Box>
      <BBLoader enabled={loading || statsloading || loadingMetrics} />

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

          <Box sx={{ display: "flex" }}>
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
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: '#f5f5f5', 
        borderRadius: 1,
        border: '1px dashed #ccc'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          🔍 Debug Info:
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          StockInfo loaded: {stockInfo ? 'Yes' : 'No'} | Items: {stockInfo?.data?.length ?? 0} | Critical: {criticalAvailabilityItems.length}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Low Stock: {lowStockCount} | Out of Stock: {outOfStockCount}
        </Typography>
        {errorStock && (
          <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
            ⚠️ Stock Error: {errorStock}
          </Typography>
        )}
      </Box>

      {(lowStockCount > 0 || outOfStockCount > 0 || criticalAvailabilityItems.length > 0) && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Critical Availability Alert */}
          {criticalAvailabilityItems.length > 0 && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚠️ Critical Stock Availability
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {criticalAvailabilityItems.length} product(s) with less than 3% availability:
              </Typography>
              <Stack spacing={0.5}>
                {criticalAvailabilityItems.map((item) => {
                  const availabilityPercentage = (item.available_stock / item.current_stock) * 100;
                  return (
                    <Typography key={item.product_id} variant="body2" sx={{ ml: 2, fontFamily: 'monospace' }}>
                      • <strong>{item.product_name}</strong>: {availabilityPercentage.toFixed(1)}% available ({item.available_stock} of {item.current_stock} units)
                    </Typography>
                  );
                })}
              </Stack>
            </Alert>
          )}

          {/* Low Stock & Out of Stock Alert */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <Card elevation={0} sx={{ bgcolor: "#FFF3E0", border: "1px solid #FFB74D" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AlertCircle size={24} color="#FF9800" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Inventory Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lowStockCount} items low on stock, {outOfStockCount} out of stock
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
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

      {/* Legacy Stats Cards */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
        User & Order Stats
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {legacyCards.map(({ title, value, sparkData, plotType }, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={classes.statsCard}>
              <CardContent sx={classes.statsCardContent}>
                <Box sx={classes.statsTopSection}>
                  <Box sx={classes.statsTextBox}>
                    <Typography variant="subtitle2" sx={classes.statsLabel}>
                      {title}
                    </Typography>
                    <Typography variant="h4" sx={classes.statsValue}>
                      {title === "Revenue" ? `₹${value.toLocaleString()}` : value}
                    </Typography>
                  </Box>
                  <Box sx={classes.statsIconBox}>
                    <TrendingUp size={24} color="white" strokeWidth={2.5} />
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

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={classes.ordersCard}>
            <CardContent sx={classes.ordersHeader}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={classes.ordersHeaderStack}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={classes.ordersIconBox}>
                    <Bell size={20} color="white" strokeWidth={2.5} />
                  </Box>
                  <Box sx={classes.ordersTitleBox}>
                    <Typography variant="h6" sx={classes.ordersTitle}>
                      Recent Orders
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={classes.ordersSubtitle}>
                      Latest order updates and activities
                    </Typography>
                  </Box>
                </Stack>

                {orderPending > 0 && (
                  <Box sx={classes.ordersBadge}>
                    <Sparkles size={14} />
                    <span>{orderPending} New</span>
                  </Box>
                )}
              </Stack>
            </CardContent>

            {/* Orders List */}
            <CardContent sx={classes.ordersListContent}>
              {ordersList.length > 0
                ? ordersList.map((order, idx) => (
                    <Box key={order.id || idx} sx={classes.orderItem}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={classes.orderAvatar}>{order.customer_name?.charAt(0)?.toUpperCase() || "U"}</Avatar>
                        <Box sx={classes.orderDetailsBox}>
                          <Typography variant="subtitle2" sx={classes.orderCustomerName}>
                            {order.customer_name}
                          </Typography>
                          {order?.items?.map((item, itemIdx) => (
                            <Typography
                              key={itemIdx}
                              variant="body2"
                              color="text.secondary"
                              sx={classes.orderProductName}
                            >
                              {item.product_name}
                            </Typography>
                          ))}
                        </Box>
                      </Stack>

                      <Box sx={classes.orderStatusBox}>
                        {getStatusIcon(order.order_status)}
                        <Typography color="text.secondary" sx={classes.orderStatusText}>
                          {order.order_status_display}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                : !loading && (
                    <Box sx={classes.emptyStateBox}>
                      <Box sx={classes.emptyIconBox}>
                        <Bell size={36} color="#667eea" strokeWidth={1.5} />
                      </Box>
                      <Typography variant="body1" color="text.primary" sx={classes.emptyStateTitle}>
                        No recent orders available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={classes.emptyStateSubtitle}>
                        New orders will appear here as they come in
                      </Typography>
                    </Box>
                  )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={classes.pieChartCard}>
            <CardContent sx={classes.pieChartContent}>
              <Typography variant="h6" sx={classes.pieChartTitle}>
                Order Distribution by City
              </Typography>
              <Box sx={classes.pieChartBox}>
                <PieChart
                  series={[
                    {
                      data: cityData,
                      innerRadius: innerRadius,
                      outerRadius: outerRadius,
                      paddingAngle: 2,
                      cornerRadius: 5,
                      cx: 100,
                      cy: 100,
                    },
                  ]}
                  colors={colors}
                  width={300}
                  height={300}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
