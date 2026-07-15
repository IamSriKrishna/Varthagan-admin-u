
export const PURCHASE_CLAIM_ENDPOINTS = {
  GET_PURCHASE_ORDERS: (limit: number = 100, offset: number = 0) =>
    `/purchase-orders?limit=${limit}&offset=${offset}`,

  GET_PO_ITEMS: (purchaseOrderId: string) =>
    `/purchase-claims/purchase-orders/${purchaseOrderId}/items`,

  GET_BY_PURCHASE_ORDER: (purchaseOrderId: string) =>
    `/purchase-claims/purchase-orders/${purchaseOrderId}`,

  GET_BY_ID: (id: string) => `/purchase-claims/${id}`,

  CREATE: "/purchase-claims",
} as const;

export const PURCHASE_CLAIM_TYPE_OPTIONS = [
  { label: "Missing", value: "missing" },
  { label: "Damaged", value: "damaged" },
];

export const PURCHASE_CLAIM_ACTION_OPTIONS = [
  { label: "Vendor Replacement", value: "replacement" },
  { label: "Credit Note", value: "credit_note" },
  { label: "Return to Vendor", value: "return_to_vendor" },
  { label: "Scrap", value: "scrap" },
  { label: "Adjustment Only", value: "adjustment_only" },
];

export const RAW_MATERIAL_UNIT_OPTIONS = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Gram (gram)", value: "gram" },
  { label: "Milligram (mg)", value: "mg" },
  { label: "Tonne", value: "tonne" },
];

export const PURCHASE_CLAIM_STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Partial", value: "partial" },
  { label: "Resolved", value: "resolved" },
  { label: "Cancelled", value: "cancelled" },
];
