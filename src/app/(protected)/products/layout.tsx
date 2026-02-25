import { RequireAccess } from "@/components/common/RequireAccess";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="products">{children}</RequireAccess>;
}
