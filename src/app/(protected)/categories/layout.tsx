import { RequireAccess } from "@/components/common/RequireAccess";

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="categories">{children}</RequireAccess>;
}
