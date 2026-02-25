import { RequireAccess } from "@/components/common/RequireAccess";

export default function PartnerReportLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="partnerreport">{children}</RequireAccess>;
}
