import { RequireAccess } from "@/components/common/RequireAccess";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="vendors">{children}</RequireAccess>;
}
