"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  useMemo,
  Suspense,
} from "react";
import { flushSync } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

function NavigationWatcher({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    onNavigate();
  }, [pathname, searchParams, onNavigate]);

  return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setLoading] = useState(false);

  const safetyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const minDisplayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadingRef = useRef(false);

  const show = useCallback(() => {
    clearTimeout(safetyTimer.current);
    clearTimeout(minDisplayTimer.current);

    flushSync(() => setLoading(true));
    loadingRef.current = true;

    safetyTimer.current = setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
    }, 3000);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(safetyTimer.current);
    clearTimeout(minDisplayTimer.current);

    minDisplayTimer.current = setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href") ?? "";
        if (!/^(https?:|mailto:|tel:|javascript:|#)/.test(href)) {
          show();
        }
        return;
      }

      const button = target.closest("button");
      if (button && !button.disabled && !button.hasAttribute("data-no-loading")) {
        show();
        return;
      }

      const customClickable = target.closest("[data-loading]");
      if (customClickable) {
        show();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [show]);

  const handleNavigate = useCallback(() => {
    if (loadingRef.current) {
      hide();
    }
  }, [hide]);

  const setIsLoading = useCallback(
    (v: boolean) => {
      if (v) show();
      else hide();
    },
    [show, hide]
  );

  const value = useMemo(
    () => ({ isLoading, setIsLoading }),
    [isLoading, setIsLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      <Suspense fallback={null}>
        <NavigationWatcher onNavigate={handleNavigate} />
      </Suspense>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

export function useIsLoading() {
  return useLoading().isLoading;
}