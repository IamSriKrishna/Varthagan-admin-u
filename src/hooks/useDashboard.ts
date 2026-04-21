// hooks/useDashboard.ts
import { useState, useCallback } from "react";
import { dashboardService } from "@/lib/api/dashboardService";
import { stockService } from "@/lib/api/stockService";
import {
  DashboardMetrics,
  ActivitySummary,
  StockInfo,
  ShipmentTracking,
  AddTrackingRequest,
  EntityTrends,
} from "@/models/dashboard.model";
import { StockItem } from "@/models/dashboard.model";

interface UseDashboardReturn {
  // Dashboard metrics
  dashboardMetrics: DashboardMetrics | null;
  loadingMetrics: boolean;
  errorMetrics: string | null;
  fetchDashboardMetrics: (viewUserId?: number) => Promise<void>;

  // Activity summary
  activitySummary: ActivitySummary | null;
  loadingActivity: boolean;
  errorActivity: string | null;
  fetchActivitySummary: (viewUserId?: number) => Promise<void>;

  // Stock information
  stockInfo: StockInfo | null;
  loadingStock: boolean;
  errorStock: string | null;
  fetchStockInfo: (viewUserId?: number) => Promise<void>;

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
  fetchEntityTrends: (entityType: string, days?: number, viewUserId?: number) => Promise<EntityTrends | null>;

  // Refresh
  refreshing: boolean;
  refreshDashboard: (viewUserId?: number) => Promise<void>;

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
  const fetchDashboardMetrics = useCallback(async (viewUserId?: number) => {
    setLoadingMetrics(true);
    setErrorMetrics(null);
    try {
      const response = await dashboardService.getDashboardMetrics(viewUserId);
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
  const fetchActivitySummary = useCallback(async (viewUserId?: number) => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const response = await dashboardService.getActivitySummary(viewUserId);
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
  const fetchStockInfo = useCallback(async (viewUserId?: number) => {
    setLoadingStock(true);
    setErrorStock(null);
    try {
      // Try primary endpoint first
      const response = await dashboardService.getStockInfo(viewUserId);
      console.log('Dashboard Stock API Response:', response);
      
      if (response.success && response.data?.data && response.data.data.length > 0) {
        console.log('Dashboard stock data received:', response.data);
        setStockInfo(response.data);
      } else {
        // Fallback to stock summary endpoint if dashboard endpoint returns empty
        console.warn('Dashboard stock endpoint returned empty data, trying fallback...');
        try {
          const fallbackResponse = await stockService.getStockSummary();
          console.log('Stock summary fallback response:', fallbackResponse);
          
          if (fallbackResponse.stocks && fallbackResponse.stocks.length > 0) {
            // Transform StockSummaryItem to StockItem format
            const transformedData: StockItem[] = fallbackResponse.stocks.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              current_stock: item.current_stock,
              available_stock: item.available_stock,
              reserved_stock: item.reserved_stock,
              purchased_stock: item.purchased_total,
              sold_stock: item.sold_total,
              average_cost: item.average_cost,
              revaluation_amount: 0,
              last_purchased_date: item.last_purchased || '',
              last_sold_date: item.last_sold || '',
              status: item.current_stock === 0 ? 'out_of_stock' : (item.available_stock === 0 ? 'low_stock' : 'in_stock'),
            }));
            
            // Calculate counts
            const outOfStockCount = transformedData.filter(item => item.current_stock === 0).length;
            const lowStockCount = transformedData.filter(item => item.available_stock === 0 && item.current_stock > 0).length;
            const inStockCount = transformedData.length - outOfStockCount - lowStockCount;
            const totalQuantity = transformedData.reduce((sum, item) => sum + item.current_stock, 0);
            
            const transformedStockInfo: StockInfo = {
              data: transformedData,
              total_products: transformedData.length,
              in_stock_count: inStockCount,
              low_stock_count: lowStockCount,
              out_of_stock_count: outOfStockCount,
              total_quantity: totalQuantity,
            };
            
            console.log('Using fallback stock data:', transformedStockInfo);
            setStockInfo(transformedStockInfo);
          } else {
            setErrorStock("No stock data available from either endpoint");
          }
        } catch (fallbackErr: any) {
          console.error('Fallback stock fetch error:', fallbackErr);
          setErrorStock("Failed to fetch stock information from both endpoints");
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch stock information";
      console.error('Stock fetch error (primary):', errorMessage, err);
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
  const fetchEntityTrends = useCallback(async (entityType: string, days?: number, viewUserId?: number): Promise<EntityTrends | null> => {
    setLoadingTrends(true);
    setErrorTrends(null);
    try {
      const response = await dashboardService.getEntityTrends(entityType, days, viewUserId);
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
  const refreshDashboard = useCallback(async (viewUserId?: number) => {
    setRefreshing(true);
    try {
      await dashboardService.refreshDashboardMetrics();
      // Refetch all metrics after refresh
      await Promise.all([
        fetchDashboardMetrics(viewUserId),
        fetchActivitySummary(viewUserId),
        fetchStockInfo(viewUserId),
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
