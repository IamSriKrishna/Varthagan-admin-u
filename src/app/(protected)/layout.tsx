"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "@/store";
import { userApi } from "@/lib/api/userApi";

/* ─────────────────────────────────────────────
   LIGHT-THEME TRANSITIONS & LOADER ANIMATIONS
───────────────────────────────────────────── */
const pageTransitionStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');

  /* ── Keyframes ── */
  @keyframes pageSlideOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(28px) scale(0.99); }
  }

  @keyframes pageSlideIn {
    from { opacity: 0; transform: translateX(-28px) scale(0.99); }
    to   { opacity: 1; transform: translateX(0)   scale(1); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Rotating arc */
  @keyframes arcSpin {
    to { transform: rotate(360deg); }
  }

  /* Soft pulse for the inner dot */
  @keyframes pulseScale {
    0%, 100% { transform: scale(1);    opacity: 1;    }
    50%       { transform: scale(0.7); opacity: 0.45; }
  }

  /* Staggered dots */
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0);   opacity: 0.35; }
    40%           { transform: translateY(-7px); opacity: 1;    }
  }

  /* Subtle shimmer bar */
  @keyframes shimmerSlide {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  /* Card float-in */
  @keyframes cardFloat {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* ── Utility classes ── */
  .page-transition-in  { animation: pageSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .page-transition-out { animation: pageSlideOut 0.3s ease-in forwards; }

  /* ── Loader card ── */
  .loader-card {
    animation: cardFloat 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    background: #ffffff;
    border-radius: 20px;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.05),
      0 8px 32px rgba(0,0,0,0.08),
      0 32px 64px rgba(0,0,0,0.06);
    padding: 40px 48px 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    min-width: 260px;
  }

  /* ── Spinner ring ── */
  .spinner-wrap {
    position: relative;
    width: 56px;
    height: 56px;
  }

  .spinner-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2.5px solid #e8e8f0;
    border-top-color: #6366f1;
    animation: arcSpin 0.85s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .spinner-ring-secondary {
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-bottom-color: #a5b4fc;
    animation: arcSpin 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse;
  }

  .spinner-dot {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner-dot::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6366f1;
    animation: pulseScale 1.4s ease-in-out infinite;
  }

  /* ── Label ── */
  .loader-label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.01em;
    animation: fadeInUp 0.5s 0.15s both;
  }

  /* ── Three bouncing dots ── */
  .loader-dots {
    display: flex;
    gap: 6px;
    animation: fadeInUp 0.5s 0.2s both;
  }

  .loader-dots span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c7d2fe;
    animation: dotBounce 1.2s ease-in-out infinite;
  }

  .loader-dots span:nth-child(1) { animation-delay: 0s;    }
  .loader-dots span:nth-child(2) { animation-delay: 0.18s; }
  .loader-dots span:nth-child(3) { animation-delay: 0.36s; }

  /* ── Shimmer progress bar ── */
  .loader-progress {
    width: 100%;
    height: 3px;
    border-radius: 999px;
    background: #f1f5f9;
    overflow: hidden;
    animation: fadeInUp 0.5s 0.25s both;
  }

  .loader-progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      #f1f5f9 0%,
      #c7d2fe 30%,
      #6366f1 50%,
      #c7d2fe 70%,
      #f1f5f9 100%
    );
    background-size: 400px 100%;
    animation: shimmerSlide 1.6s linear infinite;
  }

  /* ── Background mesh ── */
  .loader-bg {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 20% 20%, rgba(199,210,254,0.35) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(196,181,253,0.25) 0%, transparent 70%),
      radial-gradient(ellipse 80% 80% at 50% 50%, rgba(241,245,249,1) 0%, #f8fafc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.35s ease-out both;
  }

  .loader-bg.fade-out {
    animation: fadeOut 0.45s ease-out forwards;
  }

  /* ── Wordmark ── */
  .loader-wordmark {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 17px;
    font-weight: 500;
    color: #1e1b4b;
    letter-spacing: 0.02em;
    animation: fadeInUp 0.5s 0.05s both;
    user-select: none;
  }

  .loader-wordmark span {
    color: #6366f1;
  }
`;

/* ─────────────────────────────────────────────
   LOADER COMPONENT
───────────────────────────────────────────── */
function LoaderOverlay({
  isNavigating,
  isCheckingUsers,
}: {
  isNavigating: boolean;
  isCheckingUsers: boolean;
}) {
  const label = isCheckingUsers ? "Checking setup" : "Loading";

  return (
    <div className={`loader-bg${isNavigating ? " fade-out" : ""}`}>
      <div className="loader-card">
        {/* Brand mark */}
        <div className="loader-wordmark">
          Vartha<span>gan</span>
        </div>

        {/* Spinner */}
        <div className="spinner-wrap">
          <div className="spinner-ring" />
          <div className="spinner-ring-secondary" />
          <div className="spinner-dot" />
        </div>

        {/* Status label + animated dots */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="loader-label">{label}</div>
            <div className="loader-dots">
              <span /><span /><span />
            </div>
          </div>

          {/* Shimmer progress bar */}
          <div className="loader-progress">
            <div className="loader-progress-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLE TAG — defined outside component so it
   never re-mounts and re-triggers animations
───────────────────────────────────────────── */
function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: pageTransitionStyles }} />;
}

/* ─────────────────────────────────────────────
   DASHBOARD ROOT LAYOUT
───────────────────────────────────────────── */
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [isCheckingUsers, setIsCheckingUsers] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(false);

  /* Always show loader for at least 2 seconds */
  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!auth.access_token && auth.isStorageDataLoaded) {
      router.replace("/login");
    } else if (auth.access_token && auth.isStorageDataLoaded) {
      if (auth.user?.role === "superadmin") {
        checkSuperadminSetup();
      }
    }
  }, [auth.isStorageDataLoaded, auth.access_token, auth.user?.role]);

  const checkSuperadminSetup = async () => {
    setIsCheckingUsers(true);
    try {
      const response = await userApi.listUsers({ role: "admin" });

      if (!response.success || !response.data || response.data.length === 0) {
        navigateWithAnimation("/company-settings");
        return;
      }

      const hasCompanyId = response.data.some(
        (user) => user.company_id && user.company_id > 0
      );

      if (!hasCompanyId) {
        navigateWithAnimation("/company-settings");
      }
    } catch (error) {
      console.error("Error checking superadmin setup:", error);
    } finally {
      setIsCheckingUsers(false);
    }
  };

  const navigateWithAnimation = (path: string) => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      router.push(path);
      setTimeout(() => setIsNavigating(false), 600);
    }, 420);
    return () => clearTimeout(timer);
  };

  if (!minDelayDone || !auth.isStorageDataLoaded || isCheckingUsers || isNavigating) {
    return (
      <>
        <StyleTag />
        <LoaderOverlay
          isNavigating={isNavigating}
          isCheckingUsers={isCheckingUsers}
        />
      </>
    );
  }

  if (auth.isStorageDataLoaded && !auth.access_token) return null;

  return (
    <>
      <StyleTag />
      <div className="page-transition-in">
        <MainLayout>{children}</MainLayout>
      </div>
    </>
  );
}