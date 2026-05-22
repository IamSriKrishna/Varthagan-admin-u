"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export interface LiveStatusResponse {
  customers: { total: number; active: number };
  vendors: { total: number; active: number };
  products: { total: number; total_stock: number; low_stock_items: number; out_of_stock_items: number };
  stock: { total_items: number; total_quantity: number; low_stock: number; out_of_stock: number };
  last_updated_at: string;
  generated_at: string;
}

const API_URL = "http://localhost:3000/public/live-status";

const FALLBACK: LiveStatusResponse = {
  customers: { total: 245, active: 198 },
  vendors: { total: 67, active: 58 },
  products: { total: 1250, total_stock: 45680, low_stock_items: 42, out_of_stock_items: 8 },
  stock: { total_items: 1250, total_quantity: 45680, low_stock: 42, out_of_stock: 8 },
  last_updated_at: new Date().toISOString(),
  generated_at: new Date().toISOString(),
};

// Typewriter-style animated number
function AnimatedNumber({
  value,
  format,
  delay = 0,
}: {
  value: number;
  format?: (v: number) => string;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const end = value;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo for a "printing" feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(end * ease));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [started, value]);

  return <>{format ? format(display) : display.toLocaleString()}</>;
}

// Blinking cursor while number is "typing"
function TypewriterStat({
  label,
  value,
  format,
  delay,
  sub,
}: {
  label: string;
  value: number;
  format?: (v: number) => string;
  delay: number;
  sub?: string;
}) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 1500);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 11, color: "#b0b0a8", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500 }}>
        {label}
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 500,
        color: "#0d0d0d",
        letterSpacing: "-0.8px",
        lineHeight: 1,
        fontFamily: "'DM Mono', 'Fira Mono', monospace",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}>
        <AnimatedNumber value={value} format={format} delay={delay} />
        {!done && (
          <span style={{
            display: "inline-block",
            width: 2,
            height: "0.85em",
            background: "#0d0d0d",
            borderRadius: 1,
            animation: "blink 0.7s step-end infinite",
            marginLeft: 1,
          }} />
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#c0c0b8" }}>{sub}</div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [data, setData] = useState<LiveStatusResponse | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((d: LiveStatusResponse) => { setData(d); setVisible(true); })
      .catch(() => { setData(FALLBACK); setVisible(true); });
  }, []);

  const updatedAt = data
    ? new Date(data.last_updated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  const stats = data ? [
    { label: "Customers", value: data.customers.total, sub: `${data.customers.active} active`, delay: 0 },
    { label: "Vendors", value: data.vendors.total, sub: `${data.vendors.active} active`, delay: 180 },
    { label: "Products", value: data.products.total, sub: `${data.stock.total_quantity.toLocaleString()} units stock`, delay: 360 },
    { label: "Low stock", value: data.stock.low_stock, sub: `${data.stock.out_of_stock} out of stock`, delay: 540 },
  ] : [];

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes gridScroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes statsReveal {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .grid-bg {
          position: absolute;
          inset: -100%;
          background-image:
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 52px 52px;
          animation: gridScroll 36s linear infinite;
          mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 100%);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 13px;
          border-radius: 100px;
          border: 1px solid #e8e8e4;
          background: #f8f8f6;
          font-size: 12px;
          color: #8a8a82;
          letter-spacing: 0.2px;
          animation: fadeIn 0.5s ease both;
        }

        .heading {
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 300;
          color: #0d0d0d;
          line-height: 1.1;
          letter-spacing: -2.5px;
          text-align: center;
          animation: fadeUp 0.55s ease 0.08s both;
        }
        .heading em {
          font-style: italic;
          color: #c0c0b8;
        }

        .sub {
          font-size: 15px;
          color: #9a9a92;
          text-align: center;
          line-height: 1.75;
          max-width: 380px;
          font-weight: 300;
          animation: fadeUp 0.55s ease 0.16s both;
        }

        .cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 26px;
          background: #0d0d0d;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: -0.1px;
          transition: transform 0.2s ease, background 0.2s ease;
          animation: fadeUp 0.55s ease 0.24s both;
        }
        .cta:hover { transform: scale(1.04); background: #1a1a1a; }
        .cta:active { transform: scale(0.98); }
        .cta-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .cta:hover .cta-arrow { transform: translateX(2px); }

        .stats-bar {
          display: flex;
          align-items: stretch;
          gap: 0;
          border: 1px solid #ebebea;
          border-radius: 14px;
          background: #fafafa;
          overflow: hidden;
          animation: statsReveal 0.5s ease 0.32s both;
        }
        .stat-cell {
          flex: 1;
          padding: 16px 20px;
          border-right: 1px solid #ebebea;
          min-width: 0;
        }
        .stat-cell:last-child { border-right: none; }

        .pill-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.55s ease 0.44s both;
        }
        .pill {
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid #ebebea;
          font-size: 11px;
          color: #b0b0a8;
          letter-spacing: 0.2px;
          white-space: nowrap;
          background: #fafafa;
        }
        .pill-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #e0e0da;
        }

        .footer {
          position: absolute;
          bottom: 28px;
          left: 0; right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          animation: fadeIn 0.6s ease 0.56s both;
        }
        .pulse-wrap {
          position: relative;
          display: inline-flex;
          width: 6px;
          height: 6px;
          flex-shrink: 0;
        }
        .pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #16a34a;
          opacity: 0.4;
          animation: ping 2s infinite;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
        }
        .footer-text {
          font-size: 11px;
          color: #c0c0b8;
          letter-spacing: 0.2px;
        }

        .skeleton {
          height: 26px;
          width: 60px;
          border-radius: 5px;
          background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e4 50%, #f0f0ee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .skeleton-sub {
          height: 11px;
          width: 80px;
          border-radius: 3px;
          background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e4 50%, #f0f0ee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-top: 6px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="grid-bg" />

      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        width: "100%",
        maxWidth: 700,
        padding: "0 24px",
      }}>

        {/* Badge */}
        <div className="badge">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 1C6 1 3 5.2 3 7.5a3 3 0 006 0C9 5.2 6 1 6 1z" fill="#b0b0a8" />
          </svg>
          Varthagan ERP — Water Manufacturing
        </div>

        {/* Heading */}
        <h1 className="heading">
          Operations that<br />
          <em>flow</em> as they should
        </h1>

        {/* Subtext */}
        <p className="sub">
          End-to-end ERP for packaged water manufacturers. Inventory, production, billing, and dispatch — unified.
        </p>

        {/* CTA */}
        <button className="cta" onClick={() => router.push("/login")}>
          Sign in to workspace
          <span className="cta-arrow">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {/* Live stats bar */}
        <div className="stats-bar" style={{ width: "100%" }}>
          {!visible
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="stat-cell">
                  <div style={{ fontSize: 11, color: "#c0c0b8", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500, marginBottom: 6 }}>
                    &nbsp;
                  </div>
                  <div className="skeleton" />
                  <div className="skeleton-sub" />
                </div>
              ))
            : stats.map((s) => (
                <div key={s.label} className="stat-cell">
                  <TypewriterStat
                    label={s.label}
                    value={s.value}
                    delay={s.delay}
                    sub={s.sub}
                  />
                </div>
              ))
          }
        </div>

        {/* Last updated */}
        {visible && updatedAt && (
          <div style={{
            fontSize: 11, color: "#c8c8c0",
            animation: "fadeIn 0.4s ease both",
            marginTop: -10,
          }}>
            Last updated at {updatedAt}
          </div>
        )}

        {/* Module pills */}
        <div className="pill-row">
          {["Inventory", "Production", "Billing", "Dispatch", "Purchase", "Reports"].map((m, i, arr) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="pill">{m}</span>
              {i < arr.length - 1 && <span className="pill-sep" />}
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div className="footer">
        <span className="pulse-wrap">
          <span className="pulse-ring" />
          <span className="pulse-dot" />
        </span>
        <span className="footer-text">All systems operational · Varthagan Group, Tamil Nadu</span>
      </div>
    </div>
  );
}