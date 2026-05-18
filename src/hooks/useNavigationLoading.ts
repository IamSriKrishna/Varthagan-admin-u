"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useCallback } from "react";

export const useNavigationLoading = () => {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const navigateTo = useCallback(
    (path: string) => {
      setIsLoading(true);
      router.push(path);
    },
    [router, setIsLoading]
  );

  const goBack = useCallback(() => {
    setIsLoading(true);
    router.back();
  }, [router, setIsLoading]);

  const goForward = useCallback(() => {
    setIsLoading(true);
    router.forward();
  }, [router, setIsLoading]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    router.refresh();
  }, [router, setIsLoading]);

  return { navigateTo, goBack, goForward, refresh };
};
