"use client";

import LoginForm from "@/components/login/LoginForm/LoginForm";
import { RootState } from "@/store";
import { userApi } from "@/lib/api/userApi";
import { shouldRedirectSuperadminToCompanySettings } from "@/utils/superadminSetup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function LoginPage() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isStorageDataLoaded) {
      return;
    }

    if (!auth.access_token) {
      return;
    }

    const redirectAfterLogin = async () => {
      if (auth.user?.role === "superadmin") {
        try {
          const response = await userApi.listUsers({ role: "admin" });
          const users = Array.isArray(response?.data) ? response.data : [];

          if (shouldRedirectSuperadminToCompanySettings(auth.user?.role, users)) {
            router.replace("/company-settings");
            return;
          }
        } catch (error) {
          console.error("Error checking superadmin setup on login:", error);
        }
      }

      router.replace("/");
    };

    redirectAfterLogin();
  }, [auth.access_token, auth.isStorageDataLoaded, auth.user?.role, router]);

  if (auth.access_token) return null;

  return (
    <>
      <LoginForm />
    </>
  );
}
