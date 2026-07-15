import { RequireAccess } from "@/components/common/RequireAccess";

export default function PurchaseClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAccess
      pageKey="purchase_claims"
      fallbackPageKey="purchases"
    >
      {children}
    </RequireAccess>
  );
}