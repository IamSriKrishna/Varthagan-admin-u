import { appConfig } from "@/config/appConfig";
import { useEffect, useRef } from "react";

interface UseOrderPollingProps {
  refetch: () => void;
  selectedVendorId?: string | number | null;
  idleTimeoutMs?: number;
  isEnabled?: boolean;
}

export const useOrderPolling = ({
  refetch,
  selectedVendorId,
  idleTimeoutMs = 2 * 60 * 1000,
  isEnabled,
}: UseOrderPollingProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const isTabActive = useRef(true);
  const isUserActive = useRef(true);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!isEnabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const startPolling = () => {
      if (intervalRef.current) return;
      if (!isTabActive.current || !isUserActive.current) return;

      intervalRef.current = setInterval(() => {
        // const now = new Date().toLocaleTimeString();
        // console.log(`🔁 Fetching latest orders... ${now}`);
        refetchRef.current();
      }, appConfig.REFRESH_INTERVAL_MS);

      // const now = new Date().toLocaleTimeString();
      // console.log(`✅ Order polling started ${now}`);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        // const now = new Date().toLocaleTimeString();
        // console.log(`🛑 Order polling stopped ${now}`);
      }
    };
    // ---------------------------------------------------
    ///For Countdown only not for pooling code
    const startCountdown = () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        // const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
        // const remainingTime = idleTimeoutMs - timeSinceLastActivity;
        // const remainingSeconds = Math.ceil(remainingTime / 1000);
        // if (remainingSeconds > 0) {
        //   console.log(`⏳ Checking user activity... ${remainingSeconds}s until idle`);
        // }
      }, 1000);
    };

    const stopCountdown = () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
    // ---------------------------------------------------
    const resetIdleTimer = () => {
      lastActivityTimeRef.current = Date.now();

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      if (!isUserActive.current) {
        isUserActive.current = true;
        // const now = new Date().toLocaleTimeString();
        // console.log(`🖱️ User active again — polling resumed at ${now}`);
        startPolling();
      }

      stopCountdown();
      startCountdown();

      idleTimerRef.current = setTimeout(() => {
        isUserActive.current = false;
        stopPolling();
        stopCountdown();
        // const now = new Date().toLocaleTimeString();
        // console.log(`😴 User idle (no mouse movement for ${idleTimeoutMs / 1000}s) — polling paused at ${now}`);
      }, idleTimeoutMs);
    };

    const handleVisibilityChange = () => {
      // const now = new Date().toLocaleTimeString();
      if (document.hidden) {
        isTabActive.current = false;
        stopPolling();
        stopCountdown();
        // console.log(`📴 Tab hidden — polling paused at ${now}`);
      } else {
        isTabActive.current = true;
        lastActivityTimeRef.current = Date.now();
        if (isUserActive.current) {
          startPolling();
          // console.log(`📲 Tab active — polling resumed at ${now}`);
          resetIdleTimer();
        }
      }
    };

    const handleUserActivity = () => {
      if (throttleTimerRef.current) {
        return;
      }

      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
      }, 1000);

      resetIdleTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", handleUserActivity, { passive: true });
    document.addEventListener("click", handleUserActivity);
    document.addEventListener("keypress", handleUserActivity);
    document.addEventListener("scroll", handleUserActivity, { passive: true });
    document.addEventListener("touchstart", handleUserActivity, { passive: true });

    // Initialize
    lastActivityTimeRef.current = Date.now();
    resetIdleTimer();
    startPolling();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("click", handleUserActivity);
      document.removeEventListener("keypress", handleUserActivity);
      document.removeEventListener("scroll", handleUserActivity);
      document.removeEventListener("touchstart", handleUserActivity);

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      stopCountdown();
      stopPolling();
    };
  }, [isEnabled, idleTimeoutMs, selectedVendorId]);
};
