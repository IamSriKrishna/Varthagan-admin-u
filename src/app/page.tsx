"use client";

import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
import WelcomePage from "@/components/login/WelcomePage";
import MainLayout from "@/components/layout/MainLayout";
import DashboardWithMetrics from "@/app/(protected)/DashboardWithMetrics";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import Dashboard from "./(protected)/page";

export default function Home() {
  const token = useSelector((state: RootState) => state.auth.access_token);

  // If authenticated, show the main dashboard layout
  if (token) {
    return (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    );
  }

  // Otherwise show the welcome page for unauthenticated users
  return (
    <>
      <WelcomePage />
    </>
  );
}
