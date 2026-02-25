import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface OrderFilters {
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  partner_id: string | number | null;
  payment_type: string | number | null;
}

export function useOrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters = useMemo<OrderFilters>(
    () => ({
      fromDate: searchParams.get("from_date") ? dayjs(searchParams.get("from_date")) : dayjs(),
      toDate: searchParams.get("to_date") ? dayjs(searchParams.get("to_date")) : dayjs(),
      partner_id: searchParams.get("partner_id"),
      payment_type: searchParams.get("payment_type"),
    }),
    [searchParams],
  );

  const [filters, setFilters] = useState<OrderFilters>(initialFilters);

  const updateUrl = (values: OrderFilters) => {
    const params = new URLSearchParams();

    if (values.fromDate) params.set("from_date", dayjs(values.fromDate).format("YYYY-MM-DD"));
    if (values.toDate) params.set("to_date", dayjs(values.toDate).format("YYYY-MM-DD"));
    if (values.partner_id) params.set("partner_id", String(values.partner_id));
    if (values.payment_type) params.set("payment_type", String(values.payment_type));

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return { filters, setFilters, updateUrl };
}
