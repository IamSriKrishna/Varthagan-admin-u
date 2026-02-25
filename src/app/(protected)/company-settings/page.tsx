import React from "react";
import { Metadata } from "next";
import CompanySettingsContainer from "@/components/companySettings/CompanySettingsContainer";

export const metadata: Metadata = {
  title: "Company Settings",
  description: "Manage your company setup and settings",
};

export default function CompanySettingsPage() {
  return <CompanySettingsContainer />;
}

