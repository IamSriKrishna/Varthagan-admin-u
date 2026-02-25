import { RequireAccess } from "@/components/common/RequireAccess";

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="coupons">{children}</RequireAccess>;
}
