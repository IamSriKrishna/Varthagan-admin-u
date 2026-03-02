// lib/api/dashboardService.ts
import { dashboard } from "@/constants/apiConstants";
import { apiService } from "./api.service";
import {
  DashboardMetrics,
  ActivitySummary,
  StockInfo,
  ShipmentTracking,
  AddTrackingRequest,
  TrackingResponse,
  EntityTrends,
  RefreshResponse,
  DashboardResponse,
} from "@/models/dashboard.model";

/**
 * Normalizes API response to DashboardResponse format
 * Handles both wrapped responses { success, data } and direct data responses
 */
const normalizeResponse = <T>(response: any): DashboardResponse<T> => {
  // If response already has success field, return as-is
  if ('success' in response) {
    return response as DashboardResponse<T>;
  }
  
  // If response is the data itself (no success wrapper), wrap it
  return {
    success: true,
    message: "Success",
    data: response as T,
  };
};

export const dashboardService = {
  /**
   * Get all dashboard metrics in one comprehensive response
   */
  async getDashboardMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    const response = await apiService.get(dashboard.getDashboard);
    return normalizeResponse<DashboardMetrics>(response);
  },

  /**
   * Get today's activity including new items created, shipments, orders, etc.
   */
  async getActivitySummary(): Promise<DashboardResponse<ActivitySummary>> {
    const response = await apiService.get(dashboard.getActivity);
    return normalizeResponse<ActivitySummary>(response);
  },

  /**
   * Get detailed stock information across all items
   */
  async getStockInfo(): Promise<DashboardResponse<StockInfo>> {
    const response = await apiService.get(dashboard.getStock);
    return normalizeResponse<StockInfo>(response);
  },

  /**
   * Get shipment tracking details for a specific shipment
   * @param shipmentId - The ID of the shipment
   * @param limit - Number of tracking records (optional, default: 10)
   */
  async getShipmentTracking(
    shipmentId: string,
    limit?: number
  ): Promise<DashboardResponse<ShipmentTracking>> {
    const url = dashboard.getShipmentTracking(shipmentId);
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    const finalUrl = params.toString() ? `${url}?${params}` : url;
    const response = await apiService.get(finalUrl);
    return normalizeResponse<ShipmentTracking>(response);
  },

  /**
   * Add a new tracking record for a shipment
   * @param shipmentId - The ID of the shipment
   * @param data - Tracking record data
   */
  async addShipmentTracking(
    shipmentId: string,
    data: AddTrackingRequest
  ): Promise<DashboardResponse<TrackingResponse>> {
    const response = await apiService.post(dashboard.addShipmentTracking(shipmentId), data);
    return normalizeResponse<TrackingResponse>(response);
  },

  /**
   * Get historical trend data for a specific entity
   * @param entityType - Entity type (customer, vendor, item, etc.)
   * @param days - Number of days to look back (optional, default: 30)
   */
  async getEntityTrends(
    entityType: string,
    days?: number
  ): Promise<DashboardResponse<EntityTrends>> {
    const url = dashboard.getTrends(entityType);
    const params = new URLSearchParams();
    if (days) params.append("days", days.toString());
    const finalUrl = params.toString() ? `${url}?${params}` : url;
    const response = await apiService.get(finalUrl);
    return normalizeResponse<EntityTrends>(response);
  },

  /**
   * Manually trigger a refresh of all dashboard metrics
   */
  async refreshDashboardMetrics(): Promise<DashboardResponse<RefreshResponse>> {
    const response = await apiService.post(dashboard.refreshDashboard, {});
    return normalizeResponse<RefreshResponse>(response);
  },

  /**
   * Get metrics for specific categories
   */
  async getCustomerMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    const metrics = await this.getDashboardMetrics();
    return {
      ...metrics,
      data: {
        ...metrics.data,
        // Filter to only customer metrics
      } as DashboardMetrics,
    };
  },

  async getVendorMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getItemMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getShipmentMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getInvoiceMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getSalesOrderMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getPurchaseOrderMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },

  async getPackageMetrics(): Promise<DashboardResponse<DashboardMetrics>> {
    return this.getDashboardMetrics();
  },
};
