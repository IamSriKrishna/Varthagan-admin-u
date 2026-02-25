"use client";

import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
import LoginForm from "@/components/login/LoginForm/LoginForm";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function LoginPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.access_token);
  useEffect(() => {
    if (token) {
      router.replace("/");
    }
  }, [token, router]);

  if (token) return null;

  return (
    <>
      <BrandLogo />
      <LoginForm />
    </>
  );
}
