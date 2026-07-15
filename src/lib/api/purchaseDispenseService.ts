
import { apiService } from "./api.service";

import { PURCHASE_DISPENSE_ENDPOINTS } from "@/constants/purchaseDispense.constants";

import {
  CreatePurchaseDispenseRequest,
  PurchaseClaimApiResponse,
  PurchaseClaimsApiResponse,
  PurchaseDispenseResponse,
  PurchaseDispensesResponse,
} from "@/models/purchaseDispense.model";

import { PurchaseOrder } from "@/models/purchaseOrder.model";

function extractPurchaseOrders(
  response: unknown
): PurchaseOrder[] {
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
      (
        value.data as {
          purchase_orders?: unknown;
        }
      ).purchase_orders
    )
  ) {
    return (
      value.data as {
        purchase_orders: PurchaseOrder[];
      }
    ).purchase_orders;
  }

  if (Array.isArray(value.purchase_orders)) {
    return value.purchase_orders as PurchaseOrder[];
  }

  return [];
}

export const purchaseDispenseService = {
  async getPurchaseOrders(
    limit: number = 100,
    offset: number = 0
  ): Promise<PurchaseOrder[]> {
    const response = await apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_PURCHASE_ORDERS(
        limit,
        offset
      )
    );

    return extractPurchaseOrders(response);
  },

  async getClaimsByPurchaseOrder(
    purchaseOrderId: string
  ): Promise<PurchaseClaimsApiResponse> {
    return apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_CLAIMS_BY_PURCHASE_ORDER(
        purchaseOrderId
      )
    );
  },

  async getClaimById(
    claimId: string
  ): Promise<PurchaseClaimApiResponse> {
    return apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_CLAIM_BY_ID(
        claimId
      )
    );
  },

  async createDispense(
    claimId: string,
    data: CreatePurchaseDispenseRequest
  ): Promise<PurchaseDispenseResponse> {
    return apiService.post(
      PURCHASE_DISPENSE_ENDPOINTS.CREATE(
        claimId
      ),
      data
    );
  },

  async getDispensesByClaim(
    claimId: string
  ): Promise<PurchaseDispensesResponse> {
    return apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_BY_CLAIM(
        claimId
      )
    );
  },

  async getDispensesByClaimItem(
    claimItemId: number
  ): Promise<PurchaseDispensesResponse> {
    return apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_BY_CLAIM_ITEM(
        claimItemId
      )
    );
  },

  async getDispenseById(
    id: string
  ): Promise<PurchaseDispenseResponse> {
    return apiService.get(
      PURCHASE_DISPENSE_ENDPOINTS.GET_BY_ID(id)
    );
  },
};