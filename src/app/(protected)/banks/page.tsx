import React from "react";
import { Metadata } from "next";
import BanksContainer from "@/components/banks/BanksContainer";

export const metadata: Metadata = {
  title: "Bank Management",
  description: "Manage your bank accounts and banking details",
};

export default function BanksPage() {
  return <BanksContainer />;
}
