import { RequireAccess } from "@/components/common/RequireAccess";

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="usermanagement">{children}</RequireAccess>;
}
