import { RequireAccess } from "@/components/common/RequireAccess";

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccess pageKey="partners">{children}</RequireAccess>;
}
