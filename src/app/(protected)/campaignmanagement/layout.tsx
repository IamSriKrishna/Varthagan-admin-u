import { RequireAccess } from "@/components/common/RequireAccess";

export default function CampaginManagementLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="campaignmanagement">{children}</RequireAccess>;
}
