'use client';

import React, { useState } from 'react';
import ManufacturerForm from '@/components/manufacturing/ManufacturerForm';
import ManufacturersTable from '@/components/manufacturing/ManufacturersTable';
import CustomerPricingScreen from '@/components/customer/CustomerPricingScreen';
import { Manufacturer } from '@/models/manufacturer.model';

/**
 * Manufacturing & Pricing Management Page
 * URL: /admin/manufacturing-pricing
 *
 * Changes from original:
 * - Fixed MUI Grid v2 breaking change: replaced <Grid item xs={...}> with
 *   <Grid size={...}> (Grid v2 API — no `item` prop needed).
 * - Replaced MUI Tabs with a lightweight custom tab bar to remove the
 *   dependency on the deprecated `aria-controls` pattern and to give full
 *   design control.
 * - Re-styled with a crisp editorial light theme: Geist Mono display font,
 *   warm-white surfaces, slate accents, thin hairline borders.
 * - Stat cards use a CSS grid that never overflows the container.
 * - All colours are CSS custom properties so a dark-mode swap is trivial.
 */

/* ─── Design tokens ──────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --bg:          #fafaf8;
    --surface:     #ffffff;
    --surface-2:   #f4f3f0;
    --border:      #e4e2dc;
    --border-strong: #c8c5bc;
    --text:        #1a1916;
    --text-2:      #6b6860;
    --text-3:      #9b9890;
    --accent:      #1d4ed8;
    --accent-bg:   #eff4ff;
    --accent-text: #1e3a8a;
    --success:     #15803d;
    --success-bg:  #f0fdf4;
    --warning:     #b45309;
    --warning-bg:  #fffbeb;
    --danger:      #b91c1c;
    --danger-bg:   #fef2f2;
    --radius-sm:   6px;
    --radius:      10px;
    --radius-lg:   14px;
    --shadow-card: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-sm:   0 1px 2px rgba(0,0,0,.05);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }

  /* ── Page shell ── */
  .page { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }

  /* ── Header ── */
  .page-header { margin-bottom: 2.5rem; }
  .page-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Geist Mono', monospace;
    font-size: 11px; font-weight: 500; letter-spacing: .08em;
    color: var(--accent); text-transform: uppercase;
    background: var(--accent-bg);
    border: 1px solid #c7d7fd;
    padding: 3px 10px; border-radius: 100px;
    margin-bottom: 12px;
  }
  .page-title {
    font-family: 'Geist Mono', monospace;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 600; letter-spacing: -.02em;
    color: var(--text); line-height: 1.2;
  }
  .page-subtitle { color: var(--text-2); margin-top: 6px; font-size: 14px; }

  /* ── Alert ── */
  .alert-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-bg); color: var(--danger);
    border: 1px solid #fecaca; border-radius: var(--radius);
    padding: 12px 16px; margin-bottom: 1.5rem;
    font-size: 13px;
  }

  /* ── Two-column grid (FIXED: no overflow) ── */
  .layout-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .layout-grid { grid-template-columns: 1fr; }
  }

  /* ── Card shell ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }
  .card-body { padding: 1.25rem 1.5rem 1.5rem; }

  /* ── Custom tabs ── */
  .tab-bar {
    display: flex; align-items: stretch;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
    padding: 0 1rem;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--text-2);
    background: none; border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color .15s, border-color .15s;
    white-space: nowrap;
    margin-bottom: -1px;
  }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  .tab-btn .tab-badge {
    font-family: 'Geist Mono', monospace;
    font-size: 10px; font-weight: 600;
    background: var(--accent-bg); color: var(--accent-text);
    border-radius: 100px; padding: 1px 7px;
  }

  /* ── Section heading inside card ── */
  .section-title {
    font-family: 'Geist Mono', monospace;
    font-size: 13px; font-weight: 600;
    color: var(--text); letter-spacing: .02em;
    margin-bottom: 4px;
  }
  .section-sub { font-size: 13px; color: var(--text-2); margin-bottom: 1.25rem; }

  /* ── Stat cards grid ── */
  .stats-card { padding: 1.5rem; }
  .stats-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .stats-label {
    font-family: 'Geist Mono', monospace;
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: .08em; color: var(--text);
  }
  .stats-live {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: var(--success);
  }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--success);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 10px;
  }
  .stat-item {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
  }
  .stat-caption {
    font-size: 11px; color: var(--text-3);
    text-transform: uppercase; letter-spacing: .06em;
    font-weight: 500; margin-bottom: 6px;
  }
  .stat-value {
    font-family: 'Geist Mono', monospace;
    font-size: 1.75rem; font-weight: 600;
    color: var(--text); line-height: 1;
  }
  .stat-item.accent {
    background: var(--accent-bg);
    border-color: #c7d7fd;
  }
  .stat-item.accent .stat-value { color: var(--accent); }
  .stat-item.accent .stat-caption { color: var(--accent-text); }

  /* ── Tip box ── */
  .tip-box {
    margin-top: 1.25rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius);
    padding: 12px 14px;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .tip-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
  .tip-text { font-size: 12px; color: var(--warning); line-height: 1.5; }
  .tip-text strong { font-weight: 600; display: block; margin-bottom: 2px; }

  /* ── Divider ── */
  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2.5rem 0;
  }

  /* ── Pricing section header ── */
  .section-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }
  .section-header-text {}
  .section-header-title {
    font-family: 'Geist Mono', monospace;
    font-size: 1.1rem; font-weight: 600;
    color: var(--text);
  }
  .section-header-sub { font-size: 13px; color: var(--text-2); margin-top: 3px; }

  /* ── Integration guide ── */
  .guide-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  .guide-title {
    font-family: 'Geist Mono', monospace;
    font-size: 13px; font-weight: 600; color: var(--text);
    text-transform: uppercase; letter-spacing: .06em;
    margin-bottom: 1rem;
  }
  .guide-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  .guide-item {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
  }
  .guide-item-label {
    font-size: 12px; font-weight: 600; color: var(--text);
    margin-bottom: 3px;
  }
  .guide-item-desc { font-size: 12px; color: var(--text-2); }
`;

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_MANUFACTURERS: Manufacturer[] = [
  {
    id: 'mfg-001',
    name: 'Manufacturing Batch A',
    product_group_id: 'pg-001',
    quantity: 100,
    status: 'in_progress',
    description: 'First manufacturing batch',
    employees: [],
    created_at: '2024-05-15T10:30:00Z',
    updated_at: '2024-05-15T10:30:00Z',
  },
  {
    id: 'mfg-002',
    name: 'Manufacturing Batch B',
    product_group_id: 'pg-002',
    quantity: 150,
    status: 'in_progress',
    description: 'Second manufacturing batch',
    employees: [],
    created_at: '2024-05-15T10:30:00Z',
    updated_at: '2024-05-15T10:30:00Z',
  },
  {
    id: 'mfg-003',
    name: 'Manufacturing Batch C',
    product_group_id: 'pg-003',
    quantity: 200,
    status: 'pending',
    description: 'Third manufacturing batch',
    employees: [],
    created_at: '2024-05-15T10:30:00Z',
    updated_at: '2024-05-15T10:30:00Z',
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function ManufacturingAndPricingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(MOCK_MANUFACTURERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Handlers ── */
  const handleEdit = (manufacturer: Manufacturer) =>
    console.log('Edit manufacturer:', manufacturer);

  const handleDelete = async (id: string) => {
    setManufacturers(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setManufacturers(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, status: status as 'pending' | 'in_progress' | 'completed' }
          : m
      )
    );
  };

  const handleView = (manufacturer: Manufacturer) =>
    console.log('View manufacturer:', manufacturer);

  const handleCreate = async (data: any) => {
    const newItem: Manufacturer = {
      id: `mfg-${Date.now()}`,
      name: data.name,
      product_group_id: data.product_group_id,
      quantity: data.quantity,
      status: 'pending',
      description: data.description,
      employees: data.employees ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setManufacturers(prev => [...prev, newItem]);
    setActiveTab(0);
  };

  /* ── Derived stats ── */
  const totalEmployees = manufacturers.reduce((n, m) => n + (m.employees?.length ?? 0), 0);
  const totalQty       = manufacturers.reduce((n, m) => n + (m.quantity ?? 0), 0);
  const activeCount    = manufacturers.filter(m => m.status === 'in_progress').length;

  return (
    <>
      {/* Inject scoped styles */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <main className="page">
        {/* ── Header ── */}
        <header className="page-header">
          <div className="page-eyebrow">Admin · Manufacturing</div>
          <h1 className="page-title">Manufacturing &amp; Customer Pricing</h1>
          <p className="page-subtitle">
            Manage production batches and configure customer-specific pricing for sales orders.
          </p>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="alert-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Two-column layout (Grid v2 / CSS grid — no overflow) ── */}
        <div className="layout-grid">

          {/* Left: Manufacturers card */}
          <div className="card">
            <div className="tab-bar" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 0}
                aria-controls="panel-list"
                className={`tab-btn${activeTab === 0 ? ' active' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                Manufacturers
                <span className="tab-badge">{manufacturers.length}</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 1}
                aria-controls="panel-create"
                className={`tab-btn${activeTab === 1 ? ' active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                + New Batch
              </button>
            </div>

            {/* Panel: list */}
            {activeTab === 0 && (
              <div id="panel-list" role="tabpanel" className="card-body">
                <p className="section-title">Manufacturers Database</p>
                <p className="section-sub">All active production batches and their current status.</p>
                <ManufacturersTable
                  manufacturers={manufacturers}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  onView={handleView}
                />
              </div>
            )}

            {/* Panel: create */}
            {activeTab === 1 && (
              <div id="panel-create" role="tabpanel" className="card-body">
                <p className="section-title">Add New Manufacturer</p>
                <p className="section-sub">Create a production batch and assign employees.</p>
                <ManufacturerForm
                  open={true}
                  onClose={() => setActiveTab(0)}
                  onSubmit={handleCreate}
                />
              </div>
            )}
          </div>

          {/* Right: Stats card */}
          <div className="card stats-card">
            <div className="stats-header">
              <span className="stats-label">Quick Stats</span>
              <span className="stats-live">
                <span className="live-dot" aria-hidden="true" />
                Live
              </span>
            </div>

            <div className="stat-grid">
              <div className="stat-item accent">
                <div className="stat-caption">Active Batches</div>
                <div className="stat-value">{activeCount}</div>
              </div>
              <div className="stat-item">
                <div className="stat-caption">Total Batches</div>
                <div className="stat-value">{manufacturers.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-caption">Employees</div>
                <div className="stat-value">{totalEmployees}</div>
              </div>
              <div className="stat-item">
                <div className="stat-caption">Units Qty</div>
                <div className="stat-value">{totalQty.toLocaleString()}</div>
              </div>
            </div>

            <div className="tip-box" role="note">
              <span className="tip-icon">💡</span>
              <p className="tip-text">
                <strong>Tip</strong>
                Use the Customer Pricing section below to set manufacturer rates per customer.
              </p>
            </div>
          </div>

        </div>{/* /layout-grid */}

        <hr className="divider" />

        {/* ── Customer Pricing Section ── */}
        <section aria-labelledby="pricing-heading">
          <div className="section-header">
            <div className="section-header-text">
              <h2 id="pricing-heading" className="section-header-title">Customer Pricing</h2>
              <p className="section-header-sub">
                Set per-customer manufacturer rates — automatically applied on new sales orders.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <CustomerPricingScreen />
            </div>
          </div>
        </section>

        {/* ── Integration guide ── */}
        <div className="guide-card" aria-label="Integration guide">
          <p className="guide-title">Integration Guide</p>
          <ul className="guide-list">
            {[
              { label: 'Create Pricing',      desc: 'Set manufacturer rates for specific customers.' },
              { label: 'View Pricing',         desc: 'See all pricing configs at a glance.' },
              { label: 'Edit Pricing',         desc: 'Update rates or add new manufacturers.' },
              { label: 'Sales Order Integration', desc: 'Rates auto-apply when creating sales orders.' },
            ].map(({ label, desc }) => (
              <li key={label} className="guide-item">
                <div className="guide-item-label">{label}</div>
                <div className="guide-item-desc">{desc}</div>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </>
  );
}