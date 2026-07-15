export const PURCHASE_DISPENSE_ENDPOINTS = {
  GET_CLAIMS_BY_PURCHASE_ORDER: (purchaseOrderId: string) => `/purchase-claims/purchase-orders/${purchaseOrderId}`,

  GET_CLAIM_BY_ID: (claimId: string) => `/purchase-claims/${claimId}`,

  CREATE: (claimId: string) => `/purchase-dispenses/claims/${claimId}`,

  GET_BY_CLAIM: (claimId: string) => `/purchase-dispenses/claims/${claimId}`,

  GET_BY_CLAIM_ITEM: (claimItemId: number) => `/purchase-dispenses/claim-items/${claimItemId}`,

  GET_BY_ID: (id: string) => `/purchase-dispenses/${id}`,

  GET_PURCHASE_ORDERS: (limit: number = 100, offset: number = 0) => `/purchase-orders?limit=${limit}&offset=${offset}`,
} as const;

export const PURCHASE_DISPENSE_STATUS_OPTIONS = [
  { label: "All Claims", value: "all" },
  { label: "Open", value: "open" },
  { label: "Partial", value: "partial" },
  { label: "Resolved", value: "resolved" },
] as const;
