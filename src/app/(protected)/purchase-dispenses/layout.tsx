import { RequireAccess } from "@/components/common/RequireAccess";

export default function PurchaseDispensesLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="purchase_dispenses">{children}</RequireAccess>;
}
