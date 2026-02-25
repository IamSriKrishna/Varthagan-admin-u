import { RequireAccess } from "@/components/common/RequireAccess";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="orders">{children}</RequireAccess>;
}
