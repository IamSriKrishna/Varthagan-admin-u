import { RequireAccess } from "@/components/common/RequireAccess";

export default function OrderReportLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="partnerreport">{children}</RequireAccess>;
}
