import { apiService } from '@/lib/api/api.service';
import { Shipment, ShipmentListResponse, ShipmentResponse, ShipmentCreateResponse, ShipmentUpdateResponse, ShipmentCreateRequest, ShipmentUpdateRequest, ShipmentStatusUpdate } from '@/models/shipment.model';

export const shipmentService = {
  async getShipments(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiService.get(`/shipments?${params.toString()}`) as Promise<ShipmentListResponse>;
  },

  async getShipment(id: string) {
    return apiService.get(`/shipments/${id}`) as Promise<ShipmentResponse>;
  },

  async getShipmentsByCustomer(customerId: number, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return apiService.get(`/shipments/customer/${customerId}?${params.toString()}`) as Promise<ShipmentListResponse>;
  },

  async getShipmentsByPackage(packageId: string, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return apiService.get(`/shipments/package/${packageId}?${params.toString()}`) as Promise<ShipmentListResponse>;
  },

  async getShipmentsBySalesOrder(salesOrderId: string, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return apiService.get(`/shipments/sales-order/${salesOrderId}?${params.toString()}`) as Promise<ShipmentListResponse>;
  },

  async getShipmentsByStatus(status: string, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return apiService.get(`/shipments/status/${status}?${params.toString()}`) as Promise<ShipmentListResponse>;
  },

  async createShipment(data: ShipmentCreateRequest) {
    return apiService.post('/shipments', data) as Promise<ShipmentCreateResponse>;
  },

  async updateShipment(id: string, data: ShipmentUpdateRequest) {
    return apiService.put(`/shipments/${id}`, data) as Promise<ShipmentUpdateResponse>;
  },

  async updateShipmentStatus(id: string, data: ShipmentStatusUpdate) {
    return apiService.put(`/shipments/${id}`, data) as Promise<ShipmentUpdateResponse>;
  },

  async deleteShipment(id: string) {
    return apiService.delete(`/shipments/${id}`);
  },
};
