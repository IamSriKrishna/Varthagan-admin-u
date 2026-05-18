'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CustomerPricing,
  CustomerPricingLineItem,
  CreateCustomerPricingRequest,
} from '@/models/customerPricing.model';
import { Manufacturer } from '@/models/manufacturer.model';
import { apiService } from '@/lib/api/api.service';
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

/**
 * CustomerPricingForm
 *
 * Redesigned to match the ManufacturingAndPricingPage light theme:
 * - Geist Mono + DM Sans typography
 * - Warm-white surfaces, hairline borders, slate accents
 * - Zero MUI dependency — native HTML form elements + scoped CSS
 * - Accessible: keyboard-navigable, aria labels, focus rings
 * - Renders as a DialogContent/Actions fragment (parent supplies the Dialog shell)
 */

/* ─── Design tokens (scoped with a .cpf prefix class) ──────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');

  .cpf {
    --bg:           #fafaf8;
    --surface:      #ffffff;
    --surface-2:    #f4f3f0;
    --border:       #e4e2dc;
    --text:         #1a1916;
    --text-2:       #6b6860;
    --text-3:       #9b9890;
    --accent:       #1d4ed8;
    --accent-bg:    #eff4ff;
    --accent-text:  #1e3a8a;
    --danger:       #b91c1c;
    --danger-bg:    #fef2f2;
    --danger-border:#fecaca;
    --success:      #15803d;
    --success-bg:   #f0fdf4;
    --warning-bg:   #fffbeb;
    --warning:      #b45309;
    --r:            8px;
    --rlg:          12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
  }

  /* ── Dialog header ── */
  .cpf-header {
    padding: 1.25rem 1.5rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .cpf-mode-tag {
    display: inline-flex; align-items: center;
    font-family: 'Geist Mono', monospace;
    font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em;
    color: var(--accent-text); background: var(--accent-bg);
    border: 1px solid #c7d7fd; border-radius: 100px;
    padding: 2px 9px; margin-bottom: 6px;
  }
  .cpf-title {
    font-family: 'Geist Mono', monospace;
    font-size: 1.05rem; font-weight: 600; letter-spacing: -.02em;
  }

  /* ── Scrollable body ── */
  .cpf-body {
    padding: 1.25rem 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
    overflow-y: auto; max-height: 65vh;
  }

  /* ── Alert ── */
  .cpf-alert {
    display: flex; align-items: flex-start; gap: 8px;
    background: var(--danger-bg); color: var(--danger);
    border: 1px solid var(--danger-border);
    border-radius: var(--r); padding: 10px 14px; font-size: 13px;
  }

  /* ── Section label ── */
  .cpf-section-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em;
    color: var(--text-3); margin-bottom: .5rem;
  }

  /* ── Form field ── */
  .cpf-field { display: flex; flex-direction: column; gap: 5px; }
  .cpf-label { font-size: 12px; font-weight: 500; color: var(--text); }
  .cpf-hint  { font-size: 11px; color: var(--text-3); }

  .cpf-input, .cpf-select, .cpf-textarea {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
    appearance: none;
  }
  .cpf-input:focus, .cpf-select:focus, .cpf-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(29,78,216,.1);
  }
  .cpf-input:disabled, .cpf-select:disabled, .cpf-textarea:disabled {
    background: var(--surface-2); color: var(--text-3); cursor: not-allowed;
  }
  .cpf-input-prefix {
    position: relative;
  }
  .cpf-input-prefix .cpf-prefix {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    font-family: 'Geist Mono', monospace; font-size: 12px; color: var(--text-3);
    pointer-events: none;
  }
  .cpf-input-prefix .cpf-input { padding-left: 26px; }
  .cpf-textarea { resize: vertical; min-height: 70px; }
  .cpf-select { cursor: pointer; }

  /* ── Combobox / autocomplete ── */
  .cpf-combo { position: relative; }
  .cpf-combo-list {
    position: absolute; z-index: 50; top: calc(100% + 4px); left: 0; right: 0;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); box-shadow: 0 4px 12px rgba(0,0,0,.08);
    max-height: 220px; overflow-y: auto;
  }
  .cpf-combo-item {
    padding: 9px 12px; cursor: pointer; display: flex;
    justify-content: space-between; align-items: flex-start; gap: 8px;
    border-bottom: 1px solid var(--border);
    transition: background .1s;
  }
  .cpf-combo-item:last-child { border-bottom: none; }
  .cpf-combo-item:hover, .cpf-combo-item.focused { background: var(--accent-bg); }
  .cpf-combo-item-name { font-size: 13px; font-weight: 500; }
  .cpf-combo-item-sub  { font-size: 11px; color: var(--text-2); margin-top: 1px; }
  .cpf-combo-item-id   {
    font-family: 'Geist Mono', monospace; font-size: 10px; color: var(--text-3);
    flex-shrink: 0; margin-top: 2px;
  }
  .cpf-combo-empty { padding: 12px; font-size: 12px; color: var(--text-3); text-align: center; }

  /* ── Add-item panel ── */
  .cpf-add-panel {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--rlg);
    padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: .875rem;
  }
  .cpf-add-title {
    font-family: 'Geist Mono', monospace;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
    color: var(--text-2);
  }
  .cpf-form-row { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,1fr); gap: 10px; }

  /* ── Primary button ── */
  .cpf-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 18px; border-radius: var(--r);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid transparent;
    transition: background .15s, opacity .15s;
  }
  .cpf-btn:disabled { opacity: .45; cursor: not-allowed; }
  .cpf-btn-primary { background: var(--accent); color: #fff; }
  .cpf-btn-primary:hover:not(:disabled) { background: #1a44c2; }
  .cpf-btn-ghost {
    background: transparent; color: var(--text-2);
    border-color: var(--border);
  }
  .cpf-btn-ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
  .cpf-btn-add {
    background: var(--accent-bg); color: var(--accent-text);
    border-color: #c7d7fd; align-self: flex-start;
  }
  .cpf-btn-add:hover:not(:disabled) { background: #dbeafe; }

  /* ── Items table ── */
  .cpf-table-wrap {
    border: 1px solid var(--border); border-radius: var(--rlg); overflow: hidden;
  }
  .cpf-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .cpf-table th {
    background: var(--surface-2); padding: 9px 12px;
    font-family: 'Geist Mono', monospace; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .06em; color: var(--text-3);
    text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .cpf-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .cpf-table tr:last-child td { border-bottom: none; }
  .cpf-table tr:hover td { background: #fafaf8; }

  /* ── Status pill ── */
  .cpf-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 500;
  }
  .cpf-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .cpf-pill.completed { background: var(--success-bg); color: var(--success); }
  .cpf-pill.in_progress { background: var(--warning-bg); color: var(--warning); }
  .cpf-pill.pending { background: var(--surface-2); color: var(--text-2); }

  /* ── Rate cell ── */
  .cpf-rate { font-family: 'Geist Mono', monospace; font-weight: 600; font-size: 12px; }

  /* ── Delete button ── */
  .cpf-del-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    background: transparent; border: 1px solid var(--border);
    color: var(--text-3); cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }
  .cpf-del-btn:hover { background: var(--danger-bg); color: var(--danger); border-color: var(--danger-border); }

  /* ── Empty state ── */
  .cpf-empty {
    text-align: center; padding: 2rem 1rem;
    color: var(--text-3); font-size: 13px;
    border: 1px dashed var(--border); border-radius: var(--rlg);
  }
  .cpf-empty-icon { font-size: 1.5rem; margin-bottom: 6px; }

  /* ── Summary bar ── */
  .cpf-summary {
    display: flex; gap: 1.5rem; flex-wrap: wrap;
    background: var(--surface-2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px 16px;
  }
  .cpf-sum-item {}
  .cpf-sum-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); font-weight: 500; }
  .cpf-sum-value {
    font-family: 'Geist Mono', monospace; font-size: 1.1rem; font-weight: 600; color: var(--text);
  }

  /* ── Divider ── */
  .cpf-divider { border: none; border-top: 1px solid var(--border); }

  /* ── Footer ── */
  .cpf-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border); background: var(--surface-2);
  }

  /* ── Spinner ── */
  .cpf-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    border-radius: 50%; animation: cpf-spin .6s linear infinite;
  }
  @keyframes cpf-spin { to { transform: rotate(360deg); } }
`;

/* ─── Helpers ─────────────────────────────────────────────── */
const SALES_ACCOUNTS = ['SALES_REVENUE', 'SALES_RETURN', 'SALES_DISCOUNT'] as const;

const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const root = localStorage.getItem(localStorageAuthKey);
    if (!root) return '';
    const auth = JSON.parse(JSON.parse(root).auth) as LoginResponse;
    return auth.access_token || '';
  } catch {
    return '';
  }
};

/* ─── Tiny Combobox component ─────────────────────────────── */
interface ComboProps<T> {
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getLabel: (o: T) => string;
  renderOption?: (o: T) => React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

function Combo<T>({ options, value, onChange, getLabel, renderOption, placeholder, disabled, id }: ComboProps<T>) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const [focused, setFocused] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    getLabel(o).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayValue = value ? getLabel(value) : '';

  return (
    <div className="cpf-combo" ref={ref}>
      <input
        id={id}
        className="cpf-input"
        value={open ? query : displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => { setQuery(e.target.value); setOpen(true); setFocused(0); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, filtered.length - 1)); }
          if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
          if (e.key === 'Enter' && filtered[focused]) { onChange(filtered[focused]); setOpen(false); }
          if (e.key === 'Escape') setOpen(false);
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && !disabled && (
        <div className="cpf-combo-list" role="listbox">
          {filtered.length === 0
            ? <div className="cpf-combo-empty">No results</div>
            : filtered.map((opt, i) => (
                <div
                  key={i}
                  role="option"
                  aria-selected={i === focused}
                  className={`cpf-combo-item${i === focused ? ' focused' : ''}`}
                  onMouseDown={() => { onChange(opt); setOpen(false); }}
                  onMouseEnter={() => setFocused(i)}
                >
                  {renderOption ? renderOption(opt) : <span className="cpf-combo-item-name">{getLabel(opt)}</span>}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────── */
interface LineItemFormData extends Omit<CustomerPricingLineItem, 'id' | 'created_at' | 'updated_at'> {}

interface CustomerOption {
  id: number;
  display_name: string;
  email_address: string;
  work_phone?: string;
  mobile?: string;
}

interface CustomerPricingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerPricingRequest) => Promise<void>;
  initialData?: CustomerPricing;
  isViewMode?: boolean;
}

const BLANK_LINE: LineItemFormData = {
  manufacturer_id: '',
  manufacturer_name: '',
  rate: 0,
  account: 'SALES_REVENUE',
  description: '',
};

/* ─── Main component ─────────────────────────────────────── */
export default function CustomerPricingForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isViewMode = false,
}: CustomerPricingFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [customers, setCustomers]               = useState<CustomerOption[]>([]);
  const [customerId, setCustomerId]             = useState<number | null>(initialData?.customer_id ?? null);
  const [lineItems, setLineItems]               = useState<LineItemFormData[]>(initialData?.line_items ?? []);
  const [newItem, setNewItem]                   = useState<LineItemFormData>(BLANK_LINE);
  const [manufacturers, setManufacturers]       = useState<Manufacturer[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<string | null>(null);

  useEffect(() => {
    fetchManufacturers();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchManufacturers() {
    try {
      const res = await apiService.get('/manufacturers?limit=100&offset=0');
      setManufacturers(res?.data?.manufacturers ?? []);
    } catch { setManufacturers([]); }
  }

  async function fetchCustomers() {
    try {
      const res = await apiService.get('/auth/manage/customers?page=1&limit=100');
      const list: CustomerOption[] = Array.isArray(res?.data) ? res.data : [];
      setCustomers(list);
      if (initialData?.customer_id) {
        const found = list.find(c => c.id === initialData.customer_id) ?? null;
        setSelectedCustomer(found);
        setCustomerId(found?.id ?? null);
      }
    } catch (err) {
      setError(`Failed to load customers: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  /* ── Line item actions ── */
  const handleAddLineItem = () => {
    if (!newItem.manufacturer_id) { setError('Please select a manufacturer'); return; }
    if (newItem.rate <= 0)        { setError('Rate must be greater than 0');   return; }
    setLineItems(prev => [...prev, { ...newItem }]);
    setNewItem(BLANK_LINE);
    setError(null);
  };

  const handleDeleteLineItem = (idx: number) =>
    setLineItems(prev => prev.filter((_, i) => i !== idx));

  const handleManufacturerSelect = (m: Manufacturer | null) => {
    setNewItem(prev => ({
      ...prev,
      manufacturer_id:   m?.id   ?? '',
      manufacturer_name: m?.name ?? '',
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError(null);
    if (!customerId)          { setError('Please select a customer');           return; }
    if (lineItems.length === 0) { setError('Please add at least one line item'); return; }
    try {
      setLoading(true);
      await onSubmit({ customer_id: customerId, line_items: lineItems });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pricing');
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived ── */
  const selectedMfg   = manufacturers.find(m => m.id === newItem.manufacturer_id) ?? null;
  const totalValue    = lineItems.reduce((s, i) => s + (i.rate || 0), 0);
  const avgRate       = lineItems.length ? totalValue / lineItems.length : 0;
  const modeLabel     = isViewMode ? 'View' : initialData ? 'Edit' : 'Create';

  const statusClass = (s?: string) =>
    s === 'completed' ? 'completed' : s === 'in_progress' ? 'in_progress' : 'pending';

  if (!open) return null;

  return (
    <div className="cpf">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Header ── */}
      <div className="cpf-header">
        <div className="cpf-mode-tag">{modeLabel} Mode</div>
        <h2 className="cpf-title">
          {isViewMode ? 'View Customer Pricing' : initialData ? 'Edit Customer Pricing' : 'Create Customer Pricing'}
        </h2>
      </div>

      {/* ── Body ── */}
      <div className="cpf-body">
        {error && (
          <div className="cpf-alert" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Customer */}
        <div>
          <p className="cpf-section-label">Customer</p>
          <div className="cpf-field">
            <label className="cpf-label" htmlFor="cpf-customer">Select Customer</label>
            <Combo<CustomerOption>
              id="cpf-customer"
              options={customers}
              value={selectedCustomer}
              onChange={c => { setSelectedCustomer(c); setCustomerId(c?.id ?? null); }}
              getLabel={c => `${c.display_name} (ID: ${c.id})`}
              placeholder="Search by name or email…"
              disabled={isViewMode || !!initialData}
              renderOption={c => (
                <>
                  <div>
                    <div className="cpf-combo-item-name">{c.display_name}</div>
                    <div className="cpf-combo-item-sub">{c.email_address}</div>
                  </div>
                  <div className="cpf-combo-item-id">ID: {c.id}</div>
                </>
              )}
            />
            <span className="cpf-hint">Search by name, email, or ID</span>
          </div>
        </div>

        <hr className="cpf-divider" />

        {/* Line items */}
        <div>
          <p className="cpf-section-label">Manufacturer Pricing</p>

          {/* Add-item panel */}
          {!isViewMode && (
            <div className="cpf-add-panel">
              <p className="cpf-add-title">Add New Pricing</p>

              {/* Manufacturer + Rate on one row */}
              <div className="cpf-form-row">
                <div className="cpf-field">
                  <label className="cpf-label">Manufacturer</label>
                  <Combo<Manufacturer>
                    options={manufacturers}
                    value={selectedMfg}
                    onChange={handleManufacturerSelect}
                    getLabel={m => m.name}
                    placeholder="Select manufacturer…"
                    disabled={loading}
                    renderOption={m => (
                      <>
                        <div>
                          <div className="cpf-combo-item-name">{m.name}</div>
                          <div className="cpf-combo-item-sub">Qty: {m.quantity} · {m.status}</div>
                        </div>
                      </>
                    )}
                  />
                </div>

                <div className="cpf-field">
                  <label className="cpf-label" htmlFor="cpf-rate">Rate</label>
                  <div className="cpf-input-prefix">
                    <span className="cpf-prefix">₹</span>
                    <input
                      id="cpf-rate"
                      className="cpf-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.rate || ''}
                      onChange={e => setNewItem(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Account */}
              <div className="cpf-field">
                <label className="cpf-label" htmlFor="cpf-account">Account</label>
                <select
                  id="cpf-account"
                  className="cpf-select"
                  value={newItem.account}
                  onChange={e => setNewItem(prev => ({ ...prev, account: e.target.value }))}
                  disabled={loading}
                >
                  {SALES_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Description */}
              <div className="cpf-field">
                <label className="cpf-label" htmlFor="cpf-desc">Description <span style={{ color: 'var(--text-3)' }}>(optional)</span></label>
                <textarea
                  id="cpf-desc"
                  className="cpf-textarea"
                  rows={2}
                  value={newItem.description}
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add any notes about this pricing…"
                  disabled={loading}
                />
              </div>

              <button className="cpf-btn cpf-btn-add" onClick={handleAddLineItem} disabled={loading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Pricing
              </button>
            </div>
          )}

          {/* Table */}
          <div style={{ marginTop: '1rem' }}>
            {lineItems.length === 0 ? (
              <div className="cpf-empty">
                <div className="cpf-empty-icon">📋</div>
                No pricing items added yet
              </div>
            ) : (
              <div className="cpf-table-wrap">
                <table className="cpf-table">
                  <thead>
                    <tr>
                      <th>Manufacturer</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Rate</th>
                      <th>Account</th>
                      {!isViewMode && <th style={{ width: 48 }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const mfg = manufacturers.find(m => m.id === item.manufacturer_id);
                      return (
                        <tr key={idx}>
                          <td>{item.manufacturer_name}</td>
                          <td>{mfg?.quantity ?? '—'}</td>
                          <td>
                            <span className={`cpf-pill ${statusClass(mfg?.status)}`}>
                              <span className="cpf-pill-dot" aria-hidden="true" />
                              {mfg?.status ?? '—'}
                            </span>
                          </td>
                          <td><span className="cpf-rate">₹ {(item.rate || 0).toFixed(2)}</span></td>
                          <td style={{ color: 'var(--text-2)' }}>{item.account}</td>
                          {!isViewMode && (
                            <td>
                              <button
                                className="cpf-del-btn"
                                aria-label="Remove pricing item"
                                onClick={() => handleDeleteLineItem(idx)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary */}
            {lineItems.length > 0 && (
              <div className="cpf-summary" style={{ marginTop: '10px' }}>
                <div className="cpf-sum-item">
                  <div className="cpf-sum-label">Total Items</div>
                  <div className="cpf-sum-value">{lineItems.length}</div>
                </div>
                <div className="cpf-sum-item">
                  <div className="cpf-sum-label">Average Rate</div>
                  <div className="cpf-sum-value">₹ {(isNaN(avgRate) ? 0 : avgRate).toFixed(2)}</div>
                </div>
                <div className="cpf-sum-item">
                  <div className="cpf-sum-label">Total Value</div>
                  <div className="cpf-sum-value">₹ {(isNaN(totalValue) ? 0 : totalValue).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="cpf-footer">
        <button className="cpf-btn cpf-btn-ghost" onClick={onClose} disabled={loading}>
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            className="cpf-btn cpf-btn-primary"
            onClick={handleSubmit}
            disabled={loading || lineItems.length === 0}
          >
            {loading
              ? <><div className="cpf-spinner" aria-hidden="true" /> Saving…</>
              : initialData ? 'Update Pricing' : 'Create Pricing'
            }
          </button>
        )}
      </div>
    </div>
  );
}