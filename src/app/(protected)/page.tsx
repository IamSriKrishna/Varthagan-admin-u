"use client";
import { config } from "@/config";
import { orders } from "@/constants/apiConstants";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { BBDropdownBase, BBLoader } from "@/lib";
import { IStatsResponse } from "@/models/IDashboard";
import { IOrdersResponse } from "@/models/IOrders";
import { RootState } from "@/store";
import { Avatar, Box, Button, Card, CardContent, Collapse, Grid, Stack, Typography } from "@mui/material";
import { PieChart, SparkLineChart } from "@mui/x-charts";
import { Bell, CheckCircle, ChevronDown, ChevronUp, Clock, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as classes from "./Dashboard.styles";

type CardData = {
  title: string;
  value: string | number;
  sparkData: number[];
  plotType?: "line" | "bar";
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
  console.log(source);
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

  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });
  const ordersList = results?.data?.orders || [];
  const orderPending = ordersList.filter((o) => o.order_status === "pending").length;
  const cards: CardData[] = [
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
      plotType: "bar",
    },

    {
      title: "Total Orders",
      value: results?.data?.meta?.total ?? "0",
      sparkData: [1, 2, 1, 4, 3, 2, 3, 5],
      plotType: "bar",
    },
  ];

  return (
    <Box>
      <BBLoader enabled={loading || statsloading} />

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

      {/* Stats Cards with Accordion */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map(({ title, value, sparkData, plotType }, index) => (
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
                      data: cityData.map((c, idx) => ({ ...c, color: colors[idx] })),
                      innerRadius,
                      outerRadius,
                      paddingAngle: 4,
                      cornerRadius: 4,
                      highlightScope: { fade: "global", highlight: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                    },
                  ]}
                  width={undefined}
                  height={undefined}
                  margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
