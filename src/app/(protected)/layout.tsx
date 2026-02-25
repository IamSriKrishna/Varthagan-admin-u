"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store";
import { BBLoader } from "@/lib";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.access_token && auth.isStorageDataLoaded) {
      router.replace("/login");
    } else if (auth.access_token && auth.isStorageDataLoaded) {
    }
  }, [auth.isStorageDataLoaded, auth.access_token, router]);

  if (!auth.isStorageDataLoaded) {
    return <BBLoader enabled={true} />;
  }

  if (auth.isStorageDataLoaded && !auth.access_token) return null;

  return <MainLayout>{children}</MainLayout>;
}
