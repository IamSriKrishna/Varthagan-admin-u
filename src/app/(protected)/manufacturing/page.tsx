'use client';

import { Plus, RefreshCw, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ManufacturerForm from '@/components/manufacturing/ManufacturerForm';
import ManufacturersTable from '@/components/manufacturing/ManufacturersTable';
import { manufacturerService } from '@/lib/api/manufacturerService';
import { Manufacturer, CreateManufacturerRequest } from '@/models/manufacturer.model';

/**
 * ManufacturingPage
 *
 * Redesigned to match the shared light-theme design system:
 * - Geist Mono + DM Sans typography
 * - Warm-white surfaces, hairline borders, blue accent
 * - Zero MUI dependency — native HTML + scoped CSS
 * - Client-side search + status filter (server pagination preserved)
 */

/* ─── Scoped styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');

  .mp {
    --bg:          #fafaf8;
    --surface:     #ffffff;
    --surface-2:   #f4f3f0;
    --border:      #e4e2dc;
    --text:        #1a1916;
    --text-2:      #6b6860;
    --text-3:      #9b9890;
    --accent:      #1d4ed8;
    --accent-bg:   #eff4ff;
    --accent-text: #1e3a8a;
    --danger:      #b91c1c;
    --danger-bg:   #fef2f2;
    --danger-border:#fecaca;
    --success:     #15803d;
    --success-bg:  #f0fdf4;
    --warning:     #b45309;
    --warning-bg:  #fffbeb;
    --r:           8px;
    --rlg:         12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg);
  }

  /* ── Page shell ── */
  .mp-page { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

  /* ── Header ── */
  .mp-header { margin-bottom: 2rem; }
  .mp-eyebrow {
    display: inline-flex; align-items: center;
    font-family: 'Geist Mono', monospace;
    font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
    color: var(--accent-text); background: var(--accent-bg);
    border: 1px solid #c7d7fd; border-radius: 100px;
    padding: 2px 10px; margin-bottom: 10px;
  }
  .mp-title {
    font-family: 'Geist Mono', monospace;
    font-size: clamp(1.4rem, 3vw, 1.8rem);
    font-weight: 600; letter-spacing: -.02em; line-height: 1.2;
  }
  .mp-subtitle { font-size: 13px; color: var(--text-2); margin-top: 4px; }

  /* ── Alert ── */
  .mp-alert {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
    background: var(--danger-bg); color: var(--danger);
    border: 1px solid var(--danger-border);
    border-radius: var(--r); padding: 10px 14px;
    font-size: 13px; margin-bottom: 1.25rem;
  }
  .mp-alert-close {
    background: none; border: none; color: var(--danger);
    cursor: pointer; font-size: 16px; line-height: 1; flex-shrink: 0;
    padding: 0 2px;
  }

  /* ── Toolbar ── */
  .mp-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem;
  }
  .mp-toolbar-right { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }

  /* ── Filter bar ── */
  .mp-filters {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rlg);
    padding: 1rem 1.25rem;
    display: grid;
    grid-template-columns: minmax(0,2fr) minmax(0,1fr) auto;
    gap: .75rem;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  @media (max-width: 640px) {
    .mp-filters { grid-template-columns: 1fr; }
  }

  /* ── Input / select base ── */
  .mp-input, .mp-select {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 8px 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text);
    outline: none; appearance: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .mp-input:focus, .mp-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(29,78,216,.1);
  }
  .mp-input-wrap { position: relative; }
  .mp-input-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--text-3); pointer-events: none;
    display: flex; align-items: center;
  }
  .mp-input-wrap .mp-input { padding-left: 32px; }

  /* ── Select wrap (arrow) ── */
  .mp-select-wrap { position: relative; }
  .mp-select-arrow {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    color: var(--text-3); pointer-events: none;
    display: flex; align-items: center;
  }

  /* ── Buttons ── */
  .mp-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid transparent;
    white-space: nowrap;
    transition: background .15s, border-color .15s, opacity .15s;
  }
  .mp-btn:disabled { opacity: .45; cursor: not-allowed; }
  .mp-btn-primary { background: var(--accent); color: #fff; }
  .mp-btn-primary:hover:not(:disabled) { background: #1a44c2; }
  .mp-btn-ghost {
    background: var(--surface); color: var(--text-2);
    border-color: var(--border);
  }
  .mp-btn-ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
  .mp-btn-icon {
    width: 34px; height: 34px; padding: 0;
    background: var(--surface); color: var(--text-2);
    border: 1px solid var(--border); border-radius: var(--r);
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, color .15s;
  }
  .mp-btn-icon:hover { background: var(--surface-2); color: var(--text); }
  .mp-btn-icon:disabled { opacity: .45; cursor: not-allowed; }

  /* ── Spin animation for refresh icon ── */
  .mp-spin { animation: mp-spin .7s linear infinite; }
  @keyframes mp-spin { to { transform: rotate(360deg); } }

  /* ── Stat chips ── */
  .mp-stats { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .mp-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 4px 12px;
    font-size: 12px; color: var(--text-2);
  }
  .mp-chip strong { font-family: 'Geist Mono', monospace; font-weight: 600; color: var(--text); }
  .mp-chip-dot { width: 6px; height: 6px; border-radius: 50%; }
  .mp-chip-dot.active  { background: var(--accent); }
  .mp-chip-dot.pending { background: var(--warning); }
  .mp-chip-dot.done    { background: var(--success); }

  /* ── Card wrapping the table ── */
  .mp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rlg);
    overflow: hidden;
  }

  /* ── Pagination footer ── */
  .mp-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: .875rem 1.25rem;
    border-top: 1px solid var(--border);
    background: var(--surface-2);
    gap: .5rem; flex-wrap: wrap;
  }
  .mp-page-info {
    font-family: 'Geist Mono', monospace;
    font-size: 11px; color: var(--text-3);
  }
  .mp-page-btns { display: flex; align-items: center; gap: 4px; }
  .mp-page-num {
    font-family: 'Geist Mono', monospace; font-size: 11px;
    padding: 4px 10px; color: var(--text-2);
  }
`;

/* ─── Status chip colours ── */
const STATUS_OPTS = [
  { value: 'all',         label: 'All Status' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function ManufacturingPage() {
  const [manufacturers, setManufacturers]             = useState<Manufacturer[]>([]);
  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState('');
  const [formOpen, setFormOpen]                       = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | undefined>();
  const [searchTerm, setSearchTerm]                   = useState('');
  const [statusFilter, setStatusFilter]               = useState('all');
  const [currentPage, setCurrentPage]                 = useState(1);
  const [totalCount, setTotalCount]                   = useState(0);
  const itemsPerPage = 10;

  /* ── Fetch ── */
  const fetchManufacturers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await manufacturerService.getManufacturers(page, itemsPerPage);

      if (response.success && response.data.manufacturers) {
        let data: Manufacturer[] = response.data.manufacturers;

        if (statusFilter !== 'all') {
          data = data.filter(m => m.status === statusFilter);
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          data = data.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.product_group_id.toLowerCase().includes(q)
          );
        }

        setManufacturers(data);
        setTotalCount(response.data.total_count ?? 0);
        setCurrentPage(page);
      } else {
        setError('Failed to fetch manufacturers');
        setManufacturers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => { fetchManufacturers(1); }, [fetchManufacturers]);

  /* ── CRUD handlers ── */
  const handleEdit = (m: Manufacturer) => { setSelectedManufacturer(m); setFormOpen(true); };

  const handleFormClose = () => { setFormOpen(false); setSelectedManufacturer(undefined); };

  const handleFormSubmit = async (data: CreateManufacturerRequest | Manufacturer) => {
    try {
      setLoading(true);
      setError('');
      if (selectedManufacturer) {
        await manufacturerService.updateManufacturer(selectedManufacturer.id, data);
      } else {
        await manufacturerService.createManufacturer(data as CreateManufacturerRequest);
      }
      handleFormClose();
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true); setError('');
      await manufacturerService.deleteManufacturer(id);
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setLoading(true); setError('');
      await manufacturerService.updateManufacturer(id, { status: status as any });
      await fetchManufacturers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setLoading(false); }
  };

  /* ── Derived stats ── */
  const activeCount  = manufacturers.filter(m => m.status === 'in_progress').length;
  const pendingCount = manufacturers.filter(m => m.status === 'pending').length;
  const doneCount    = manufacturers.filter(m => m.status === 'completed').length;
  const totalPages   = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className="mp">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <main className="mp-page">

        {/* ── Header ── */}
        <header className="mp-header">
          <div className="mp-eyebrow">Admin · Manufacturing</div>
          <h1 className="mp-title">Manufacturing</h1>
          <p className="mp-subtitle">
            Manage production batches, track status, and assign employees.
          </p>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="mp-alert" role="alert">
            <span>⚠ {error}</span>
            <button className="mp-alert-close" onClick={() => setError('')} aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* ── Stat chips ── */}
        <div className="mp-stats" aria-label="Summary statistics">
          <span className="mp-chip">
            Total <strong>{totalCount}</strong>
          </span>
          <span className="mp-chip">
            <span className="mp-chip-dot active" aria-hidden="true" />
            Active <strong>{activeCount}</strong>
          </span>
          <span className="mp-chip">
            <span className="mp-chip-dot pending" aria-hidden="true" />
            Pending <strong>{pendingCount}</strong>
          </span>
          <span className="mp-chip">
            <span className="mp-chip-dot done" aria-hidden="true" />
            Completed <strong>{doneCount}</strong>
          </span>
        </div>

        {/* ── Toolbar ── */}
        <div className="mp-toolbar">
          <button
            className="mp-btn mp-btn-primary"
            onClick={() => { setSelectedManufacturer(undefined); setFormOpen(true); }}
            disabled={loading}
          >
            <Plus size={15} aria-hidden="true" />
            Create Manufacturer
          </button>

          <div className="mp-toolbar-right">
            <button
              className="mp-btn-icon"
              onClick={() => fetchManufacturers(currentPage)}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'mp-spin' : ''} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="mp-filters">
          {/* Search */}
          <div className="mp-input-wrap">
            <span className="mp-input-icon" aria-hidden="true">
              <Search size={14} />
            </span>
            <input
              className="mp-input"
              placeholder="Search by name or product group ID…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              aria-label="Search manufacturers"
            />
          </div>

          {/* Status filter */}
          <div className="mp-select-wrap">
            <select
              className="mp-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by status"
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="mp-select-arrow" aria-hidden="true">
              <Filter size={12} />
            </span>
          </div>

          {/* Clear filters */}
          {(searchTerm || statusFilter !== 'all') && (
            <button
              className="mp-btn mp-btn-ghost"
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCurrentPage(1); }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table card ── */}
        <div className="mp-card">
          <ManufacturersTable
            manufacturers={manufacturers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Pagination footer */}
          <div className="mp-pagination">
            <span className="mp-page-info">
              {totalCount} manufacturer{totalCount !== 1 ? 's' : ''} · page {currentPage} of {totalPages}
            </span>

            <div className="mp-page-btns">
              <button
                className="mp-btn-icon"
                onClick={() => fetchManufacturers(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <span className="mp-page-num">{currentPage} / {totalPages}</span>
              <button
                className="mp-btn-icon"
                onClick={() => fetchManufacturers(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                aria-label="Next page"
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ── Form Dialog ── */}
      <ManufacturerForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedManufacturer}
        isLoading={loading}
        error={error}
      />
    </div>
  );
}