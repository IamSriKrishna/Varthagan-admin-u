"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Forbidden from "@/components/common/Forbidden";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const accessMap = useSelector((state: RootState) => state.auth.accessMap);
  const userType = useSelector((state: RootState) => state.auth.user?.user_type || "");

  // Allow access if user has "products" in accessMap OR if user is admin
  const hasAccess =
    Boolean((accessMap?.nav as Record<string, boolean | undefined>)?.["products"]) ||
    userType === "admin";

  if (!hasAccess) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
