'use client';

import React from 'react';
import CustomerPricingScreen from '@/components/customer/CustomerPricingScreen';


const css = `
  :root {
    --bg:        #ffffff;
    --fg:        #000000;
    --fg-muted:  #595959;
    --fg-faint:  #8a8a8a;
    --border:    #e0e0e0;
    --border-2:  #cccccc;
    --surface:   #fafafa;
    --focus:     #000000;
  }

  /* ── Card ── */
  .card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
  }
  .card-body { padding: 1.5rem; }

`;

export default function CustomerPricingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <main className="page">
        <header className="page-header">
          <div>
            <div className="page-eyebrow">Admin · Pricing</div>
            <h1 className="page-title">Customer Pricing</h1>
            <p className="page-subtitle">
              Set per-customer rates. Rates apply automatically when a new sales order is created for that customer.
            </p>
          </div>
        </header>

        {/*
          Removed the redundant "Pricing rules" card-header block that used
          to sit here — it just repeated the page subtitle in different
          words and added an extra empty band before any real content.
          CustomerPricingScreen now owns its own compact toolbar.
        */}
        <div className="card">
          <div className="card-body">
            <CustomerPricingScreen />
          </div>
        </div>

        <p className="footer-note">
          <span className="dot" aria-hidden="true" />
          Changes take effect immediately on new sales orders. Existing orders keep their original rate.
        </p>
      </main>
    </>
  );
}