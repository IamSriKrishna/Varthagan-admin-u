import { RequireAccess } from "@/components/common/RequireAccess";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="customers">{children}</RequireAccess>;
}
