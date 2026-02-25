import dayjs from "dayjs";
import { OrderFilters } from "../hooks/useOrderFilters";

export function buildOrderQuery(filters: OrderFilters, limit: number, vendorId?: string | null, userType?: string) {
  const params = new URLSearchParams();

  params.append("limit", String(limit));

  if (vendorId && userType === "superadmin") {
    params.append("vendor_ids", vendorId);
  }

  if (filters.payment_type) params.append("payment_type", String(filters.payment_type));
  if (filters.fromDate) params.append("from_date", dayjs(filters.fromDate).format("YYYY-MM-DD"));
  if (filters.toDate) params.append("to_date", dayjs(filters.toDate).format("YYYY-MM-DD"));
  if (filters.partner_id) params.append("partner_ids", String(filters.partner_id));

  return params.toString();
}
