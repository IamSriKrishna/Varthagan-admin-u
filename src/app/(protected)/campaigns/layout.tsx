import { RequireAccess } from "@/components/common/RequireAccess";

export default function CampaginLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="campaigns">{children}</RequireAccess>;
}
