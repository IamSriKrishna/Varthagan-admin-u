
import { apiService } from "@/lib/api/api.service";
import { PURCHASE_CLAIM_ENDPOINTS } from "@/constants/purchaseClaim.constants";
import {
  CreatePurchaseClaimRequest,
  PurchaseClaimResponse,
  PurchaseClaimsResponse,
  PurchaseOrderClaimSourceResponse,
} from "@/models/purchaseClaim.model";
import { PurchaseOrder } from "@/models/purchaseOrder.model";

function extractPurchaseOrders(response: unknown): PurchaseOrder[] {
  if (Array.isArray(response)) {
    return response as PurchaseOrder[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const value = response as {
    data?: unknown;
    purchase_orders?: unknown;
  };

  if (Array.isArray(value.data)) {
    return value.data as PurchaseOrder[];
  }

  if (
    value.data &&
    typeof value.data === "object" &&
    Array.isArray(
      (value.data as { purchase_orders?: unknown }).purchase_orders
    )
  ) {
    return (
      value.data as { purchase_orders: PurchaseOrder[] }
    ).purchase_orders;
  }

  if (Array.isArray(value.purchase_orders)) {
    return value.purchase_orders as PurchaseOrder[];
  }

  return [];
}

export const purchaseClaimService = {
  async getPurchaseOrders(
    limit: number = 100,
    offset: number = 0
  ): Promise<PurchaseOrder[]> {
    const response = await apiService.get(
      PURCHASE_CLAIM_ENDPOINTS.GET_PURCHASE_ORDERS(
        limit,
        offset
      )
    );

    return extractPurchaseOrders(response);
  },

  async getPurchaseOrderClaimSource(
    purchaseOrderId: string
  ): Promise<PurchaseOrderClaimSourceResponse> {
    return apiService.get(
      PURCHASE_CLAIM_ENDPOINTS.GET_PO_ITEMS(
        purchaseOrderId
      )
    );
  },

  async createClaim(
    data: CreatePurchaseClaimRequest
  ): Promise<PurchaseClaimResponse> {
    return apiService.post(
      PURCHASE_CLAIM_ENDPOINTS.CREATE,
      data
    );
  },

  async getClaimsByPurchaseOrder(
    purchaseOrderId: string
  ): Promise<PurchaseClaimsResponse> {
    return apiService.get(
      PURCHASE_CLAIM_ENDPOINTS.GET_BY_PURCHASE_ORDER(
        purchaseOrderId
      )
    );
  },

  async getClaimById(
    id: string
  ): Promise<PurchaseClaimResponse> {
    return apiService.get(
      PURCHASE_CLAIM_ENDPOINTS.GET_BY_ID(id)
    );
  },
};