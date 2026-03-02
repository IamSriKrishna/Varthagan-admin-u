// hooks/useDashboard.ts
import { useState, useCallback } from "react";
import { dashboardService } from "@/lib/api/dashboardService";
import {
  DashboardMetrics,
  ActivitySummary,
  StockInfo,
  ShipmentTracking,
  AddTrackingRequest,
  EntityTrends,
} from "@/models/dashboard.model";

interface UseDashboardReturn {
  // Dashboard metrics
  dashboardMetrics: DashboardMetrics | null;
  loadingMetrics: boolean;
  errorMetrics: string | null;
  fetchDashboardMetrics: () => Promise<void>;

  // Activity summary
  activitySummary: ActivitySummary | null;
  loadingActivity: boolean;
  errorActivity: string | null;
  fetchActivitySummary: () => Promise<void>;

  // Stock information
  stockInfo: StockInfo | null;
  loadingStock: boolean;
  errorStock: string | null;
  fetchStockInfo: () => Promise<void>;

  // Shipment tracking
  shipmentTracking: ShipmentTracking | null;
  loadingTracking: boolean;
  errorTracking: string | null;
  fetchShipmentTracking: (shipmentId: string, limit?: number) => Promise<void>;
  addShipmentTracking: (shipmentId: string, data: AddTrackingRequest) => Promise<void>;

  // Entity trends
  entityTrends: EntityTrends | null;
  loadingTrends: boolean;
  errorTrends: string | null;
  fetchEntityTrends: (entityType: string, days?: number) => Promise<EntityTrends | null>;

  // Refresh
  refreshing: boolean;
  refreshDashboard: () => Promise<void>;

  // General loading state
  isLoading: boolean;
}

export const useDashboard = (): UseDashboardReturn => {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null);

  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);

  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [errorStock, setErrorStock] = useState<string | null>(null);

  const [shipmentTracking, setShipmentTracking] = useState<ShipmentTracking | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [errorTracking, setErrorTracking] = useState<string | null>(null);

  const [entityTrends, setEntityTrends] = useState<EntityTrends | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [errorTrends, setErrorTrends] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setErrorMetrics(null);
    try {
      const response = await dashboardService.getDashboardMetrics();
      if (response.success) {
        setDashboardMetrics(response.data);
      } else {
        setErrorMetrics(response.message || "Failed to fetch dashboard metrics");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch dashboard metrics";
      setErrorMetrics(errorMessage);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Fetch activity summary
  const fetchActivitySummary = useCallback(async () => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const response = await dashboardService.getActivitySummary();
      if (response.success) {
        setActivitySummary(response.data);
      } else {
        setErrorActivity(response.message || "Failed to fetch activity summary");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch activity summary";
      setErrorActivity(errorMessage);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  // Fetch stock information
  const fetchStockInfo = useCallback(async () => {
    setLoadingStock(true);
    setErrorStock(null);
    try {
      const response = await dashboardService.getStockInfo();
      if (response.success) {
        setStockInfo(response.data);
      } else {
        setErrorStock(response.message || "Failed to fetch stock information");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch stock information";
      setErrorStock(errorMessage);
    } finally {
      setLoadingStock(false);
    }
  }, []);

  // Fetch shipment tracking
  const fetchShipmentTracking = useCallback(async (shipmentId: string, limit?: number) => {
    setLoadingTracking(true);
    setErrorTracking(null);
    try {
      const response = await dashboardService.getShipmentTracking(shipmentId, limit);
      if (response.success) {
        setShipmentTracking(response.data);
      } else {
        setErrorTracking(response.message || "Failed to fetch shipment tracking");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch shipment tracking";
      setErrorTracking(errorMessage);
    } finally {
      setLoadingTracking(false);
    }
  }, []);

  // Add shipment tracking
  const addShipmentTracking = useCallback(async (shipmentId: string, data: AddTrackingRequest) => {
    setLoadingTracking(true);
    setErrorTracking(null);
    try {
      const response = await dashboardService.addShipmentTracking(shipmentId, data);
      if (response.success) {
        // Refresh tracking data after adding
        await fetchShipmentTracking(shipmentId);
      } else {
        setErrorTracking(response.message || "Failed to add shipment tracking");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add shipment tracking";
      setErrorTracking(errorMessage);
    } finally {
      setLoadingTracking(false);
    }
  }, [fetchShipmentTracking]);

  // Fetch entity trends - returns data for external state management
  const fetchEntityTrends = useCallback(async (entityType: string, days?: number): Promise<EntityTrends | null> => {
    setLoadingTrends(true);
    setErrorTrends(null);
    try {
      const response = await dashboardService.getEntityTrends(entityType, days);
      if (response.success) {
        setEntityTrends(response.data);
        return response.data;
      } else {
        setErrorTrends(response.message || "Failed to fetch entity trends");
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch entity trends";
      setErrorTrends(errorMessage);
      return null;
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      await dashboardService.refreshDashboardMetrics();
      // Refetch all metrics after refresh
      await Promise.all([
        fetchDashboardMetrics(),
        fetchActivitySummary(),
        fetchStockInfo(),
      ]);
    } catch (err: any) {
      console.error("Failed to refresh dashboard:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardMetrics, fetchActivitySummary, fetchStockInfo]);

  const isLoading = loadingMetrics || loadingActivity || loadingStock || loadingTracking || loadingTrends;

  return {
    // Metrics
    dashboardMetrics,
    loadingMetrics,
    errorMetrics,
    fetchDashboardMetrics,

    // Activity
    activitySummary,
    loadingActivity,
    errorActivity,
    fetchActivitySummary,

    // Stock
    stockInfo,
    loadingStock,
    errorStock,
    fetchStockInfo,

    // Tracking
    shipmentTracking,
    loadingTracking,
    errorTracking,
    fetchShipmentTracking,
    addShipmentTracking,

    // Trends
    entityTrends,
    loadingTrends,
    errorTrends,
    fetchEntityTrends,

    // Refresh
    refreshing,
    refreshDashboard,

    // General
    isLoading,
  };
};
