"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Save, Info, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { shipmentService } from "@/services/shipmentService";
import { showToastMessage } from "@/utils/toastUtil";
import { apiService } from "@/lib/api/api.service";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Package {
  id: string;
  package_slip_no: string;
  sales_order_id: string;
  customer_id: number;
  sales_order?: { id: string; sales_order_no: string };
  customer?: { id: number; display_name: string };
}

interface Customer {
  id: number;
  display_name: string;
  email_address: string;
  mobile: string;
}

interface Carrier {
  id: string;
  name: string;
  icon: string;
}

interface SalesOrderLineItem {
  id: number;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  delivered_quantity: number;
  rate: number;
  amount: number;
  variant_sku: string;
  variant_details?: Record<string, any>;
}

interface SalesOrder {
  id: string;
  sales_order_no: string;
  customer_id: number;
  reference_no?: string;
  status: string;
  date: string;
  expected_shipment_date?: string;
  delivery_method?: string;
  payment_terms?: string;
  line_items: SalesOrderLineItem[];
  sub_total: number;
  shipping_charges: number;
  adjustment: number;
  tax_rate: number;
  tax_total: number;
  total: number;
  created_at: string;
  updated_at: string;
}

interface ShipmentLineItemData {
  sales_order_line_id: string;
  product_id: string;
  variant_sku: string;
  quantity: number;
  notes: string;
}

const CARRIERS: Carrier[] = [
  { id: "1", name: "FedEx",     icon: "✈" },
  { id: "2", name: "UPS",       icon: "📦" },
  { id: "3", name: "DHL",       icon: "🌍" },
  { id: "4", name: "Amazon",    icon: "⚡" },
  { id: "5", name: "India Post",icon: "📮" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function generateTrackingNumber(packageSlipNo: string, carrierName: string): string {
  const date  = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const carr  = carrierName.substring(0, 3).toUpperCase();
  const rand  = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRK-${carr}-${packageSlipNo}-${date}-${rand}`;
}

function formatDateShort(iso: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      fontSize: 12,
      fontWeight: 600,
      color: "#374151",
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {required && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0ea5e9", display: "inline-block" }} />
      )}
      {children}
    </label>
  );
}

function AutoBadge() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      background: "#f0f4ff",
      color: "#6b7280",
      fontSize: 10,
      fontWeight: 600,
      padding: "2px 7px",
      borderRadius: 5,
      fontFamily: "'DM Mono', monospace",
      textTransform: "uppercase" as const,
      letterSpacing: "0.04em",
    }}>auto</span>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: "#ecfdf5",
      color: "#047857",
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 9px",
      borderRadius: 6,
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 11.5, color: "#dc2626" }}>
      <AlertCircle size={12} /> {message}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 11.5, color: "#9ca3af" }}>
      <Info size={11} /> {children}
    </div>
  );
}

const inputStyle = (error?: boolean, disabled?: boolean): React.CSSProperties => ({
  height: 44,
  width: "100%",
  border: `1.5px solid ${error ? "#ef4444" : "#eeeff5"}`,
  borderRadius: 10,
  padding: "0 14px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  color: disabled ? "#9ca3af" : "#1a1d2e",
  background: disabled ? "#f8f9ff" : error ? "#fff5f5" : "#fafbff",
  outline: "none",
  boxSizing: "border-box" as const,
  cursor: disabled ? "not-allowed" : "text",
  appearance: "none" as const,
});

const selectWrapStyle: React.CSSProperties = { position: "relative" };

function SelectArrow() {
  return (
    <span style={{
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "#6b7280",
      fontSize: 10,
    }}>▼</span>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function CreateShipmentPage() {
  const router = useRouter();
  const [loading,          setLoading]          = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingSalesOrder, setLoadingSalesOrder] = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  const [packages,  setPackages]  = useState<Package[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [selectedLineItems, setSelectedLineItems] = useState<Record<number, ShipmentLineItemData>>({});

  const [formData, setFormData] = useState({
    package_id:       "",
    sales_order_id:   "",
    customer_id:      "",
    ship_date:        new Date().toISOString().split("T")[0],
    carrier_id:       "",
    tracking_no:      "",
    tracking_url:     "",
    shipping_charges: "",
    notes:            "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchDropdownData(); }, []);

  // Fetch sales order when sales_order_id changes
  useEffect(() => {
    if (formData.sales_order_id) {
      fetchSalesOrder(formData.sales_order_id);
    } else {
      setSalesOrder(null);
      setSelectedLineItems({});
    }
  }, [formData.sales_order_id]);

  const normalizeDropdownItems = (response: unknown): any[] => {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === "object") {
      const asAny = response as Record<string, unknown>;

      if (Array.isArray(asAny.data)) {
        return asAny.data;
      }

      if (
        asAny.data &&
        typeof asAny.data === "object" &&
        Array.isArray((asAny.data as Record<string, unknown>).data)
      ) {
        return (asAny.data as Record<string, unknown>).data as any[];
      }

      if (Array.isArray(asAny.packages)) {
        return asAny.packages as any[];
      }

      if (Array.isArray(asAny.customers)) {
        return asAny.customers as any[];
      }
    }

    return [];
  };

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);

    const failures: string[] = [];

    try {
      const pkgRes = await apiService.get("/packages");
      setPackages(normalizeDropdownItems(pkgRes));
    } catch (err) {
      console.error("Error fetching packages:", err);
      failures.push("packages");
    }

    try {
      const custRes = await apiService.get("/customers");
      setCustomers(normalizeDropdownItems(custRes));
    } catch (err) {
      console.error("Error fetching customers:", err);
      failures.push("customers");
    }

    if (failures.length > 0) {
      showToastMessage(
        `Failed to load dropdown data for: ${failures.join(", ")}`,
        "error",
      );
    }

    setLoadingDropdowns(false);
  };

  const fetchSalesOrder = async (salesOrderId: string) => {
    setLoadingSalesOrder(true);
    try {
      const response = await apiService.get(`/sales-orders/${salesOrderId}`);
      if (response.data) {
        setSalesOrder(response.data);
        // Auto-populate line items with pending quantities
        const autoSelectedItems: typeof selectedLineItems = {};
        response.data.line_items?.forEach((item: SalesOrderLineItem) => {
          const pendingQty = item.quantity - (item.delivered_quantity || 0);
          if (pendingQty > 0) {
            autoSelectedItems[item.id] = {
              sales_order_line_id: item.id.toString(),
              product_id: item.product_id,
              variant_sku: item.variant_sku,
              quantity: pendingQty,
              notes: "",
            };
          }
        });
        setSelectedLineItems(autoSelectedItems);
      }
    } catch (err) {
      console.error("Error fetching sales order:", err);
      showToastMessage("Failed to load sales order details", "error");
    } finally {
      setLoadingSalesOrder(false);
    }
  };

  /* ── Derived ── */
  const selectedPackage  = packages.find(p => p.id === formData.package_id);
  const selectedCarrier  = CARRIERS.find(c => c.id === formData.carrier_id);
  const selectedCustomer = customers.find(c => c.id.toString() === formData.customer_id);

  const hasSummary = formData.package_id || formData.customer_id || formData.carrier_id;

  /* ── Handlers ── */
  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    setFormData(prev => ({
      ...prev,
      package_id:     packageId,
      sales_order_id: pkg?.sales_order_id ?? "",
      customer_id:    pkg ? pkg.customer_id.toString() : prev.customer_id,
      tracking_no:    "",
    }));
    clearError("package_id");
  };

  const handleCarrierSelect = (carrierId: string) => {
    const carrier = CARRIERS.find(c => c.id === carrierId);
    const pkg     = packages.find(p => p.id === formData.package_id);
    const tracking = (carrier && pkg)
      ? generateTrackingNumber(pkg.package_slip_no, carrier.name)
      : "";
    setFormData(prev => ({ ...prev, carrier_id: carrierId, tracking_no: tracking }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const clearError = (field: string) => {
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.package_id)   errors.package_id   = "Package is required";
    if (!formData.sales_order_id) errors.sales_order_id = "Sales order is required";
    if (!formData.customer_id)  errors.customer_id  = "Customer is required";
    if (!formData.ship_date)    errors.ship_date     = "Ship date is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToastMessage("Please fill in all required fields", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const payload: any = {
        package_id:     formData.package_id,
        sales_order_id: formData.sales_order_id,
        customer_id:    parseInt(formData.customer_id),
        ship_date:      new Date(formData.ship_date).toISOString(),
        ...(formData.carrier_id       && { carrier: selectedCarrier?.name }),
        ...(formData.tracking_no      && { tracking_no: formData.tracking_no }),
        ...(formData.tracking_url     && { tracking_url: formData.tracking_url }),
        ...(formData.shipping_charges && { shipping_charges: parseFloat(formData.shipping_charges) }),
        ...(formData.notes            && { notes: formData.notes }),
      };
      
      // Add selected line items
      if (Object.keys(selectedLineItems).length > 0) {
        payload.line_items = Object.values(selectedLineItems);
      }
      
      await shipmentService.createShipment(payload);
      showToastMessage("Shipment created successfully", "success");
      router.push("/shipments");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create shipment";
      setError(msg);
      showToastMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Styles ── */
  const sectionCard: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #eeeff5",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
  };

  const sectionHead: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 24px",
    borderBottom: "1px solid #f0f0f5",
    background: "#fafbff",
  };

  const sectionBody: React.CSSProperties = { padding: 24 };

  const formGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .shp-input:focus {
          border-color: #4f63d2 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(79,99,210,0.10);
          outline: none;
        }

        .shp-select {
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        .shp-select:focus {
          border-color: #4f63d2 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(79,99,210,0.10);
          outline: none;
        }

        .carrier-btn { transition: all 0.15s ease; }
        .carrier-btn:hover {
          border-color: #4f63d2 !important;
          background: #f8f9fc !important;
          color: #1a1d2e !important;
        }

        .btn-cancel:hover {
          border-color: #c7d2fe !important;
          color: #1a1d2e !important;
          background: #f8f9fc !important;
        }

        .btn-submit:hover {
          background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%) !important;
          transform: translateY(-1px);
        }

        .btn-submit:active { transform: translateY(0); }

        .back-btn:hover {
          background: #f8f9ff !important;
          color: #1a1d2e !important;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'DM Sans', sans-serif", paddingBottom: 48 }}>

        {/* ── Customer-style sticky header ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "20px 24px 16px",
            background: "#ffffff",
            borderBottom: "1px solid #f0f0f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                flexShrink: 0,
              }}
            >
              <Truck size={20} color="#ffffff" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                Create Shipment
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                Add a new shipment record to track package delivery
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#6b7280",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <ArrowLeft size={16} /> Cancel
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                (document.getElementById("shipment-form") as HTMLFormElement | null)?.requestSubmit()
              }
              disabled={loading}
              style={{
                height: 38,
                padding: "0 20px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.65 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {loading ? (
                  <><Loader2 size={15} style={{ animation: "spin 0.6s linear infinite" }} /> Creating...</>
                ) : (
                  <><Save size={15} /> Create Shipment</>
                )}
              </span>
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 32px 40px", width: "100%", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── Step indicator ── */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            {[
              { n: 1, label: "Package Details",    active: true  },
              { n: 2, label: "Carrier & Tracking", active: false },
              { n: 3, label: "Notes & Charges",    active: false },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600,
                    background: step.active ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" : "#fff",
                    color: step.active ? "#ffffff" : "#9ca3af",
                    border: step.active ? "none" : "1.5px solid #eeeff5",
                    flexShrink: 0,
                  }}>{step.n}</div>
                  <span style={{
                    fontSize: 12, fontWeight: step.active ? 600 : 500,
                    color: step.active ? "#4f63d2" : "#9ca3af",
                  }}>{step.label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: "#eeeff5", margin: "0 12px" }} />}
              </div>
            ))}
          </div>

          {/* ── Error alert ── */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff5f5", border: "1px solid #fee2e2",
              borderRadius: 12, padding: "12px 18px", marginBottom: 16,
              fontSize: 14, color: "#dc2626",
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* ── Live summary strip ── */}
          {hasSummary && (
            <div style={{
              background: "#f0f4ff",
              border: "1px solid #dbe4ff",
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 16,
              flexWrap: "wrap" as const,
            }}>
              {[
                { label: "Package",   value: selectedPackage?.package_slip_no || "—" },
                { label: "Customer",  value: selectedCustomer?.display_name   || "—" },
                { label: "Ship Date", value: formatDateShort(formData.ship_date)     },
                { label: "Carrier",   value: selectedCarrier?.name            || "—" },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d2e", fontFamily: "'DM Mono', monospace" }}>{item.value}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 1, height: 32, background: "#dbe4ff" }} />}
                </div>
              ))}
            </div>
          )}

          {/* ══ SECTION 1 — Required Info ══ */}
          <form id="shipment-form" onSubmit={handleSave}>
            <div style={sectionCard}>
              <div style={sectionHead}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0,
                }}>01</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d2e", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Required Information
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#0ea5e9" }}>●</span> Required fields
                </span>
              </div>
              <div style={sectionBody}>
                <div style={formGrid}>

                  {/* Package */}
                  <div>
                    <FieldLabel required>Package <InfoChip>auto-fills order</InfoChip></FieldLabel>
                    <div style={selectWrapStyle}>
                      <select
                        className="shp-select"
                        value={formData.package_id}
                        onChange={e => handlePackageChange(e.target.value)}
                        disabled={loadingDropdowns}
                        style={{ ...inputStyle(!!validationErrors.package_id), appearance: "none", paddingRight: 32 }}
                      >
                        <option value="">Select a package...</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.package_slip_no} ({pkg.id.substring(0, 8)}...)
                          </option>
                        ))}
                      </select>
                      <SelectArrow />
                    </div>
                    <FieldError message={validationErrors.package_id} />
                  </div>

                  {/* Sales Order (auto) */}
                  <div>
                    <FieldLabel>Sales Order <AutoBadge /></FieldLabel>
                    <input
                      className="shp-input"
                      type="text"
                      value={formData.sales_order_id}
                      placeholder="Auto-populated from package"
                      disabled
                      readOnly
                      style={inputStyle(false, true)}
                    />
                    <FieldHint>Linked when a package is selected</FieldHint>
                  </div>

                  {/* Customer */}
                  <div>
                    <FieldLabel required>Customer</FieldLabel>
                    <div style={selectWrapStyle}>
                      <select
                        className="shp-select"
                        value={formData.customer_id}
                        onChange={e => handleChange("customer_id", e.target.value)}
                        disabled={loadingDropdowns}
                        style={{ ...inputStyle(!!validationErrors.customer_id), appearance: "none", paddingRight: 32 }}
                      >
                        <option value="">Select a customer...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id.toString()}>{c.display_name}</option>
                        ))}
                      </select>
                      <SelectArrow />
                    </div>
                    <FieldError message={validationErrors.customer_id} />
                  </div>

                  {/* Ship Date */}
                  <div>
                    <FieldLabel required>Ship Date</FieldLabel>
                    <input
                      className="shp-input"
                      type="date"
                      value={formData.ship_date}
                      onChange={e => handleChange("ship_date", e.target.value)}
                      style={inputStyle(!!validationErrors.ship_date)}
                    />
                    <FieldError message={validationErrors.ship_date} />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ SECTION 1.5 — Sales Order Line Items ══ */}
            {salesOrder && (
              <div style={sectionCard}>
                <div style={sectionHead}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", color: "#ffffff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0,
                  }}>📦</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d2e", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                    Line Items from {salesOrder.sales_order_no}
                  </div>
                </div>
                <div style={sectionBody}>
                  {loadingSalesOrder ? (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0" }}>
                      <Loader2 size={18} style={{ margin: "0 auto", animation: "spin 0.6s linear infinite" }} />
                      <div style={{ marginTop: 8 }}>Loading line items...</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #eeeff5" }}>
                            <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Select</th>
                            <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Product</th>
                            <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>SKU</th>
                            <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Qty</th>
                            <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivered</th>
                            <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ship Now</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesOrder.line_items?.map((item) => {
                            const pendingQty = item.quantity - (item.delivered_quantity || 0);
                            const selected = selectedLineItems[item.id];
                            const isChecked = !!selected;
                            const shipQty = selected?.quantity || pendingQty;
                            
                            return (
                              <tr key={item.id} style={{
                                borderBottom: "1px solid #f0f4ff",
                                background: isChecked ? "#f0f4ff" : "#fafbff",
                                transition: "background 0.13s",
                              }}>
                                <td style={{ padding: "12px 0" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedLineItems(prev => ({
                                          ...prev,
                                          [item.id]: {
                                            sales_order_line_id: item.id.toString(),
                                            product_id: item.product_id,
                                            variant_sku: item.variant_sku,
                                            quantity: pendingQty,
                                            notes: "",
                                          },
                                        }));
                                      } else {
                                        setSelectedLineItems(prev => {
                                          const next = { ...prev };
                                          delete next[item.id];
                                          return next;
                                        });
                                      }
                                    }}
                                    style={{
                                      width: 18, height: 18, cursor: "pointer",
                                      accentColor: "#1a1d2e",
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "12px", color: "#1a1d2e", fontWeight: 500 }}>
                                  <div>{item.product_name}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                    {item.variant_details && Object.entries(item.variant_details).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                  </div>
                                </td>
                                <td style={{ padding: "12px", color: "#6b7280", fontSize: 12, fontFamily: "'DM Mono', monospace", textAlign: "center", fontWeight: 500 }}>
                                  {item.variant_sku}
                                </td>
                                <td style={{ padding: "12px", color: "#374151", textAlign: "right", fontWeight: 600 }}>
                                  {item.quantity.toLocaleString()}
                                </td>
                                <td style={{ padding: "12px", color: "#9ca3af", textAlign: "right" }}>
                                  {item.delivered_quantity || 0}
                                </td>
                                <td style={{ padding: "12px", textAlign: "right" }}>
                                  {isChecked && pendingQty > 0 ? (
                                    <input
                                      type="number"
                                      min="1"
                                      max={pendingQty}
                                      value={shipQty}
                                      onChange={(e) => {
                                        const newQty = Math.max(1, Math.min(pendingQty, parseFloat(e.target.value) || 0));
                                        setSelectedLineItems(prev => ({
                                          ...prev,
                                          [item.id]: { ...prev[item.id]!, quantity: newQty },
                                        }));
                                      }}
                                      style={{
                                        width: 60,
                                        ...inputStyle(),
                                        textAlign: "right",
                                      }}
                                    />
                                  ) : pendingQty > 0 ? (
                                    <span style={{ color: "#c7d2fe" }}>—</span>
                                  ) : (
                                    <span style={{ color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                                      <CheckCircle2 size={14} /> Shipped
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ SECTION 2 — Carrier & Tracking ══ */}
            <div style={sectionCard}>
              <div style={sectionHead}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "#f0f4ff", color: "#4f63d2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0,
                }}>02</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d2e", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Carrier & Tracking{" "}
                  <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 11, textTransform: "none", letterSpacing: 0 }}>Optional</span>
                </div>
              </div>
              <div style={sectionBody}>

                {/* Carrier grid */}
                <div style={{ marginBottom: 20 }}>
                  <FieldLabel>Select Carrier</FieldLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {CARRIERS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="carrier-btn"
                        onClick={() => handleCarrierSelect(c.id)}
                        style={{
                          border: `1.5px solid ${formData.carrier_id === c.id ? "#4f63d2" : "#eeeff5"}`,
                          borderRadius: 10,
                          padding: "10px 8px",
                          background: formData.carrier_id === c.id ? "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" : "#fafbff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          color: formData.carrier_id === c.id ? "#ffffff" : "#6b7280",
                          fontFamily: "'DM Sans', sans-serif",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{c.icon}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={formGrid}>
                  {/* Tracking Number (generated) */}
                  <div>
                    <FieldLabel>Tracking Number <AutoBadge /></FieldLabel>
                    <div style={{
                      background: "#f0f4ff",
                      borderRadius: 8,
                      padding: "0 14px",
                      border: "1px dashed #dbe4ff",
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      color: formData.tracking_no ? "#374151" : "#c7d2fe",
                      letterSpacing: "0.04em",
                      fontStyle: formData.tracking_no ? "normal" : "italic",
                    }}>
                      {formData.tracking_no || "Select package + carrier to generate"}
                    </div>
                    <FieldHint>Auto-generated when both are selected</FieldHint>
                  </div>

                  {/* Tracking URL */}
                  <div>
                    <FieldLabel>Tracking URL</FieldLabel>
                    <input
                      className="shp-input"
                      type="url"
                      value={formData.tracking_url}
                      onChange={e => handleChange("tracking_url", e.target.value)}
                      placeholder="https://tracking.fedex.com/..."
                      style={inputStyle()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ SECTION 3 — Charges & Notes ══ */}
            <div style={sectionCard}>
              <div style={sectionHead}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "#f0f4ff", color: "#4f63d2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0,
                }}>03</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d2e", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  Charges & Notes{" "}
                  <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 11, textTransform: "none", letterSpacing: 0 }}>Optional</span>
                </div>
              </div>
              <div style={sectionBody}>
                <div style={formGrid}>
                  {/* Shipping charges */}
                  <div>
                    <FieldLabel>Shipping Charges</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 14, top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13, color: "#6b7280", fontWeight: 500, pointerEvents: "none",
                      }}>₹</span>
                      <input
                        className="shp-input"
                        type="number"
                        value={formData.shipping_charges}
                        onChange={e => handleChange("shipping_charges", e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{ ...inputStyle(), paddingLeft: 26 }}
                      />
                    </div>
                  </div>
                  <div /> {/* spacer */}

                  {/* Notes */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      className="shp-input"
                      value={formData.notes}
                      onChange={e => handleChange("notes", e.target.value)}
                      placeholder="Add any additional notes about this shipment — fragile items, special handling instructions, delivery preferences..."
                      rows={3}
                      style={{
                        ...inputStyle(),
                        height: "auto",
                        padding: "12px 14px",
                        resize: "vertical",
                        minHeight: 90,
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                background: "#fafbff",
                borderTop: "1px solid #f0f4ff",
              }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => router.back()}
                  style={{
                    height: 44,
                    padding: "0 20px",
                    border: "1.5px solid #eeeff5",
                    borderRadius: 10,
                    background: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#6b7280",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {Object.keys(validationErrors).length > 0 && (
                    <span style={{ fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertCircle size={13} /> Fill in all required fields
                    </span>
                  )}
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                    style={{
                      height: 44,
                      padding: "0 28px",
                      border: "none",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={15} style={{ animation: "spin 0.6s linear infinite" }} /> Creating...</>
                    ) : (
                      <><Save size={15} /> Create Shipment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}