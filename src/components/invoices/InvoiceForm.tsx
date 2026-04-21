"use client";

import { invoices, salespersons as salespersonsEndpoint } from "@/constants/apiConstants";
import { IInvoice, ILineItem } from "@/models/IInvoice";
import { CreateInvoiceRequest, InvoiceOutput, InvoiceLineItemInput } from "@/models/invoice.model";
import { BBDatePickerBase } from "@/lib";
import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { customerService } from "@/lib/api/customerService";
import { invoiceService } from "@/lib/api/invoiceService";
import { productService } from "@/lib/api/productService";
import { useTax } from "@/hooks/useTax";
import { itemService } from "@/lib/api/itemService";
import { salesOrderService } from "@/lib/api/salesOrderService";
import { purchaseOrderService } from "@/lib/api/purchaseOrderService";
import {
  Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, IconButton, MenuItem, Select, FormControlLabel,
  Radio, InputAdornment, Autocomplete, Card, CardContent, TableContainer,
  Tooltip, Dialog, DialogContent, CircularProgress, Divider, Avatar,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { CreateSalespersonDialog } from "./CreateSalespersonDialog";

/* ─── Types ─── */
interface InvoiceFormProps { initialData?: IInvoice; onSuccess?: (invoice: InvoiceOutput) => void }
interface CustomerOption { id: number; display_name: string; email: string; phone: string }
interface SalespersonOption { id: number; name: string; email: string }
interface ProductOption { id: string; name: string; sku?: string; selling_price?: number }
interface LineItemFormData extends ILineItem { id?: string | number; product_id?: string; product_name?: string; sku?: string }

/* ─── Shared Styles ─── */
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.9rem",
    bgcolor: "#fff",
    transition: "box-shadow 0.2s",
    "& fieldset": { borderColor: "#e2e8f0", transition: "border-color 0.2s" },
    "&:hover fieldset": { borderColor: "#94a3b8" },
    "&.Mui-focused fieldset": { borderColor: "#0f172a", borderWidth: 2 },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15,23,42,0.07)" },
  },
  "& .MuiInputLabel-root": { fontSize: "0.875rem", color: "#94a3b8" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0f172a" },
  "& .MuiFormHelperText-root": { fontSize: "0.72rem", mt: 0.5 },
  "& .MuiInputBase-input": { py: "10px", px: "14px" },
  "& .MuiInputBase-input::placeholder": { color: "#cbd5e1", opacity: 1 },
};

const selectSx = {
  borderRadius: "10px",
  fontSize: "0.9rem",
  bgcolor: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0f172a", borderWidth: 2 },
  "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15,23,42,0.07)" },
  "& .MuiSelect-select": { py: "10px", px: "14px" },
};

/* ─── Sub-components ─── */
function FieldLabel({ label, optional, hint }: { label: string; optional?: boolean; hint?: string }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.875}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Typography>
        {optional && <Typography sx={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 500, fontStyle: "italic" }}>optional</Typography>}
      </Stack>
      {hint && <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{hint}</Typography>}
    </Stack>
  );
}

function SectionCard({ icon, title, subtitle, children, accent }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; accent?: string;
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 24px rgba(15,23,42,0.06)" } }}>
      {accent && <Box sx={{ height: 3, bgcolor: accent }} />}
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.925rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</Typography>
            <Typography sx={{ fontSize: "0.775rem", color: "#94a3b8", mt: 0.15 }}>{subtitle}</Typography>
          </Box>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

/* ─── Constants ─── */
const TERMS_OPTIONS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt", days: 0 },
  { value: "NET_7", label: "Net 7", days: 7 },
  { value: "NET_15", label: "Net 15", days: 15 },
  { value: "NET_30", label: "Net 30", days: 30 },
  { value: "NET_45", label: "Net 45", days: 45 },
  { value: "NET_60", label: "Net 60", days: 60 },
];

const validationSchema = Yup.object({
  customer_id: Yup.number().min(1, "Customer is required").required("Customer is required"),
  invoice_date: Yup.string().required("Invoice date is required"),
  due_date: Yup.string().required("Due date is required"),
  terms: Yup.string().required("Terms is required"),
  subject: Yup.string().required("Subject is required"),
  shipping_charges: Yup.number().min(0),
  adjustment: Yup.number().min(0),
});

/* ═══════════════════════════ Component ════════════════════════════ */
export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSuccess }) => {
  const router = useRouter();
  const { taxes } = useTax();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [salespersons, setSalespersons] = useState<SalespersonOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [lineItems, setLineItems] = useState<ILineItem[]>(initialData?.line_items || []);
  const [taxType, setTaxType] = useState<"TDS" | "TCS">(initialData?.tax_type === "TDS" ? "TDS" : "TCS");
  const [openSalespersonDialog, setOpenSalespersonDialog] = useState(false);
  const [openLineItemDialog, setOpenLineItemDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [lineItemForm, setLineItemForm] = useState<LineItemFormData>({ product_id: "", product_name: "", sku: "", quantity: 1, rate: 0, amount: 0, item_id: "", description: "" });
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // SO/PO Reference tracking
  const [referenceType, setReferenceType] = useState<"SO" | "PO" | "manual">("manual");
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedReference, setSelectedReference] = useState<any>(null);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [loadingSOPODetails, setLoadingSOPODetails] = useState(false);

  // Track line items changes
  useEffect(() => {
    console.log('⬇️ Line items updated:', lineItems, 'Count:', lineItems.length);
  }, [lineItems]);

  useEffect(() => {
    customerService.getCustomers(1, 1000).then((r) => { if (r.success && r.data) setCustomers(r.data as any); });
    const base = config.apiDomain || "";
    appFetch(`${base}${salespersonsEndpoint.getSalespersons}`, { method: "GET" }).then(async (r) => {
      if (r.ok) { const d = await r.json(); setSalespersons(Array.isArray(d.salespersons) ? d.salespersons : []); }
    });
    productService.getProducts(1, 100).then((r) => { if (r && r.products) setProducts(r.products as any); });
  }, []);

  const openDialog = (index?: number) => {
    if (index !== undefined) { 
      const item = lineItems[index];
      setLineItemForm({ ...item, rate: (item.rate as number) || 0, amount: (item.amount as number) || 0 }); 
      setEditingIndex(index); 
    }
    else { setLineItemForm({ product_id: "", product_name: "", sku: "", quantity: 1, rate: 0, amount: 0, item_id: "", description: "" }); setEditingIndex(null); }
    setOpenLineItemDialog(true);
  };

  const closeDialog = () => { setOpenLineItemDialog(false); setEditingIndex(null); };

  const saveLineItem = () => {
    if (!lineItemForm.product_id || lineItemForm.quantity <= 0 || !lineItemForm.rate) { showToastMessage("Please fill required fields", "error"); return; }
    const amount = lineItemForm.quantity * lineItemForm.rate;
    const updated = [...lineItems];
    if (editingIndex !== null) updated[editingIndex] = { ...lineItemForm, amount } as ILineItem;
    else updated.push({ ...lineItemForm, id: Math.random(), amount } as ILineItem);
    setLineItems(updated);
    closeDialog();
  };

  const selectProduct = (product: any) => {
    if (!product?.id) return;
    setLineItemForm((p) => ({
      ...p,
      product_id: product.id,
      product_name: product.name || "",
      sku: product.sku || "",
      rate: product.selling_price || 0,
    }));
  };

  const populateLineItemsFromReference = async (soId: string | number, isPO: boolean = false) => {
    try {
      setLoadingSOPODetails(true);
      let result;
      if (isPO) {
        // Fetch PO details
        const poResponse = await purchaseOrderService.getPurchaseOrder(String(soId));
        result = poResponse.data || poResponse;
      } else {
        // Fetch SO details
        const soResponse = await salesOrderService.getSalesOrderById(String(soId));
        // Handle wrapped response
        result = soResponse && typeof soResponse === "object" && "data" in soResponse
          ? (soResponse as any).data
          : soResponse;
      }

      console.log('Fetched result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));

      // Handle different response formats
      let lineItemsData = result?.line_items || result?.data?.line_items || result?.lineItems || [];
      
      console.log('Line items data:', lineItemsData);
      console.log('Line items count:', lineItemsData.length);

      if (lineItemsData && Array.isArray(lineItemsData) && lineItemsData.length > 0) {
        // Extract line items from SO/PO and populate the invoice line items
        const populatedItems: ILineItem[] = lineItemsData.map((item: any, idx: number) => {
          console.log('Processing item:', item);
          return {
            id: idx,
            item_id: item.product_id || item.item_id || item.id || '',
            description: item.product_name || item.description || '',
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
            item: {
              id: item.product_id || item.item_id || item.id || '',
              name: item.product_name || item.description || '',
              sku: item.sku || '',
            }
          };
        });
        
        console.log('✅ Populated items to be set:', populatedItems);
        console.log('📝 Setting lineItems with', populatedItems.length, 'items');
        setLineItems(populatedItems);
        console.log('✅ setLineItems called');
        showToastMessage(`Loaded ${populatedItems.length} item(s) from order`, "success");
      } else {
        console.log('No line items found in response');
        showToastMessage('No items found in this order', 'info');
      }
    } catch (error: any) {
      console.error('Error loading SO/PO details:', error);
      console.error('Error stack:', error.stack);
      showToastMessage('Failed to load items from order: ' + (error?.message || 'Unknown error'), 'error');
    } finally {
      setLoadingSOPODetails(false);
    }
  };

  const calcTotals = (values: any) => {
    const sub = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
    const ship = Number(values.shipping_charges) || 0;
    const adj = Number(values.adjustment) || 0;
    const tax = taxes.find((t) => t.id === values.tax_id);
    const rate = tax?.rate || 0;
    const taxAmt = ((sub + ship + adj) * rate) / 100;
    return { sub, ship, adj, rate, taxAmt, total: sub + ship + adj + taxAmt };
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    if (!lineItems.length) { showToastMessage("Add at least one line item", "error"); setSubmitting(false); return; }
    try {
      setLoading(true);
      const fmt = (d: any) => { const p = dayjs(d); return `${p.year()}-${String(p.month()+1).padStart(2,"0")}-${String(p.date()).padStart(2,"0")}T00:00:00Z`; };
      
      const lineItemsData: InvoiceLineItemInput[] = lineItems.map((i) => ({
        product_id: i.item_id || i.item?.id,
        product_name: i.description || i.item?.name || "",
        sku: i.item?.sku,
        account: (i as any).account,
        quantity: Number(i.quantity),
        rate: Number(i.rate),
      }));
      
      const payload: CreateInvoiceRequest = {
        customer_id: Number(values.customer_id),
        sales_order_id: selectedReference?.id?.toString(),
        order_number: values.order_number,
        invoice_date: fmt(values.invoice_date),
        due_date: fmt(values.due_date),
        terms: values.terms,
        payment_terms: values.payment_terms,
        subject: values.subject,
        salesperson_id: values.salesperson_id ? Number(values.salesperson_id) : undefined,
        line_items: lineItemsData,
        shipping_charges: Number(values.shipping_charges) || 0,
        tax_id: values.tax_id ? Number(values.tax_id) : undefined,
        tax_type: taxType,
        adjustment: Number(values.adjustment) || 0,
        customer_notes: values.customer_notes,
        terms_and_conditions: values.terms_and_conditions,
        attachments: values.attachments,
      };
      
      const result: InvoiceOutput = initialData?.id ? await invoiceService.updateInvoice(initialData.id, payload as any) : await invoiceService.createInvoice(payload);
      if (result && result.id) {
        showToastMessage(initialData?.id ? "Invoice updated" : "Invoice created", "success");
        onSuccess?.(result);
        router.push("/invoices");
      } else { 
        showToastMessage("Failed to save invoice", "error"); 
      }
    } catch (e: any) { 
      showToastMessage(e?.message || "Failed to save", "error"); 
    }
    finally { setLoading(false); setSubmitting(false); }
  };

  const initialValues = {
    customer_id: initialData?.customer_id || 0,
    invoice_date: initialData?.invoice_date || dayjs().format("YYYY-MM-DD"),
    due_date: initialData?.due_date || dayjs().add(30, "days").format("YYYY-MM-DD"),
    terms: initialData?.terms || "NET_30",
    payment_terms: (initialData as any)?.payment_terms || "",
    subject: initialData?.subject || "",
    salesperson_id: initialData?.salesperson_id || 0,
    order_number: initialData?.order_number || "",
    shipping_charges: initialData?.shipping_charges || 0,
    tax_id: initialData?.tax_id || 0,
    adjustment: initialData?.adjustment || 0,
    customer_notes: initialData?.customer_notes || "",
    terms_and_conditions: initialData?.terms_and_conditions || "",
    attachments: (initialData as any)?.attachments || [],
  };

  const lineCount = lineItems.length;

  return (
    <>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ values, setFieldValue, isSubmitting, errors, touched }) => {
          const totals = calcTotals(values);
          const selectedCustomer = customers.find((c) => c.id === values.customer_id) || null;
          const selectedSalesperson = salespersons.find((s) => s.id === values.salesperson_id) || null;
          const selectedTax = taxes.find((t) => t.id === values.tax_id) || null;

          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            const daysMap: Record<string, number> = { DUE_ON_RECEIPT: 0, NET_7: 7, NET_15: 15, NET_30: 30, NET_45: 45, NET_60: 60 };
            if (values.invoice_date && values.terms)
              setFieldValue("due_date", dayjs(values.invoice_date).add(daysMap[values.terms] || 0, "days").format("YYYY-MM-DD"));
          }, [values.terms, values.invoice_date]);

          // Load SO/PO when customer changes
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (!values.customer_id) {
              setSalesOrders([]);
              setPurchaseOrders([]);
              setSelectedReference(null);
              return;
            }

            setLoadingReferences(true);
            Promise.all([
              salesOrderService.getSalesOrdersByCustomer(values.customer_id),
              purchaseOrderService.getPurchaseOrdersByCustomer(values.customer_id),
            ])
              .then(([soData, poData]) => {
                const soList = Array.isArray(soData) ? soData : soData?.data || [];
                const poList = Array.isArray(poData) ? poData : poData?.data || poData?.purchase_orders || [];
                setSalesOrders(soList);
                setPurchaseOrders(poList);
              })
              .catch((err) => {
                console.error('Error loading references:', err);
                setSalesOrders([]);
                setPurchaseOrders([]);
              })
              .finally(() => setLoadingReferences(false));
          }, [values.customer_id]);

          return (
            <Form>
              <Stack spacing={3}>

                {/* ── 1. Invoice Details ── */}
                <SectionCard accent="#6366f1" icon={<ReceiptOutlinedIcon sx={{ fontSize: 20 }} />} title="Invoice Details" subtitle="Customer, reference, and date information">
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

                    {/* Customer */}
                    <Box>
                      <FieldLabel label="Customer *" />
                      <Autocomplete
                        options={customers}
                        getOptionLabel={(o) => o.display_name || ""}
                        value={selectedCustomer}
                        onChange={(_, v) => setFieldValue("customer_id", v?.id ?? 0)}
                        isOptionEqualToValue={(o, v) => o.id === v?.id}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ gap: 1.5, py: "10px !important" }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: "0.72rem", fontWeight: 700, bgcolor: `hsl(${(option.display_name?.charCodeAt(0)||65)*5%360},55%,88%)`, color: `hsl(${(option.display_name?.charCodeAt(0)||65)*5%360},50%,35%)`, flexShrink: 0 }}>
                              {(option.display_name||"N")[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{option.display_name}</Typography>
                              {option.email && <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{option.email}</Typography>}
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params}
                            placeholder="Search and select customer…"
                            error={touched.customer_id && Boolean(errors.customer_id)}
                            helperText={touched.customer_id && (errors.customer_id as string)}
                            InputProps={{ ...params.InputProps, startAdornment: (<><InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>{params.InputProps.startAdornment}</>) }}
                            sx={fieldSx} />
                        )}
                      />
                    </Box>

                    {/* Invoice # */}
                    <Box>
                      <FieldLabel label="Invoice #" hint="Auto-generated" />
                      <TextField fullWidth value={initialData?.invoice_number || `INV-${String(Date.now()).slice(-6)}`} disabled
                        InputProps={{ startAdornment: <InputAdornment position="start"><TagOutlinedIcon sx={{ fontSize: 18, color: "#cbd5e1" }} /></InputAdornment> }}
                        sx={{ ...fieldSx, "& .MuiOutlinedInput-root": { ...fieldSx["& .MuiOutlinedInput-root"], bgcolor: "#f8fafc", "& fieldset": { borderColor: "#f1f5f9" }, "&:hover fieldset": { borderColor: "#f1f5f9" } }, "& input": { color: "#94a3b8", fontWeight: 600 } }} />
                    </Box>

                    {/* Invoice Date */}
                    <Box>
                      <FieldLabel label="Invoice Date *" />
                      <BBDatePickerBase name="invoice_date" label="Invoice Date *" value={dayjs(values.invoice_date)} onDateChange={(_, v) => { if (v) setFieldValue("invoice_date", v.format("YYYY-MM-DD")); }} />
                    </Box>

                    {/* Terms */}
                    <Box>
                      <FieldLabel label="Payment Terms *" />
                      <Select size="small" fullWidth value={values.terms} onChange={(e) => setFieldValue("terms", e.target.value)}
                        startAdornment={<InputAdornment position="start"><EventOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8", ml: 0.5 }} /></InputAdornment>} sx={selectSx}>
                        {TERMS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>{o.label}</MenuItem>)}
                      </Select>
                    </Box>

                    {/* Due Date */}
                    <Box>
                      <FieldLabel label="Due Date *" />
                      <BBDatePickerBase name="due_date" label="Due Date *" value={dayjs(values.due_date)} onDateChange={(_, v) => { if (v) setFieldValue("due_date", v.format("YYYY-MM-DD")); }} />
                    </Box>

                    {/* Payment Terms Description */}
                    <Box sx={{ gridColumn: { sm: "span 2" } }}>
                      <FieldLabel label="Payment Terms Description" optional hint="e.g., Due within 30 days" />
                      <TextField fullWidth placeholder="Enter payment terms details…"
                        value={values.payment_terms} onChange={(e) => setFieldValue("payment_terms", e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EventOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment> }}
                        sx={fieldSx} />
                    </Box>

                    {/* Order Number / SO-PO Reference */}
                    <Box sx={{ gridColumn: { sm: "span 2" } }}>
                      <FieldLabel label="Reference Number" optional />
                      <Stack spacing={1.5}>
                        {/* Reference Type Toggle */}
                        <Box sx={{ display: "flex", gap: 1, borderRadius: "10px", bgcolor: "#f8fafc", p: 0.6 }}>
                          {["SO", "PO", "Manual"].map((type) => (
                            <Button
                              key={type}
                              onClick={() => {
                                setReferenceType(type as "SO" | "PO" | "manual");
                                setSelectedReference(null);
                                setFieldValue("order_number", "");
                              }}
                              sx={{
                                flex: 1,
                                py: 0.6,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "8px",
                                transition: "all 0.2s",
                                bgcolor: referenceType === type ? "#0f172a" : "transparent",
                                color: referenceType === type ? "#fff" : "#64748b",
                                "&:hover": {
                                  bgcolor: referenceType === type ? "#1e293b" : "#f1f5f9",
                                },
                              }}
                            >
                              {type}
                            </Button>
                          ))}
                        </Box>

                        {/* SO/PO Dropdown or Manual Input */}
                        {referenceType === "SO" && (
                          <Box>
                            {loadingReferences ? (
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : (
                              <Select
                                fullWidth
                                value={selectedReference?.id || ""}
                                onChange={(e) => {
                                  const so = salesOrders.find((s) => s.id === e.target.value);
                                  setSelectedReference(so);
                                  setFieldValue("order_number", so?.sales_order_no || so?.reference_no || "");
                                  if (so?.id) {
                                    populateLineItemsFromReference(so.id, false);
                                  }
                                }}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled>
                                  <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                                    {salesOrders.length === 0 ? "No sales orders found" : "Select a sales order"}
                                  </Typography>
                                </MenuItem>
                                {salesOrders.map((so) => (
                                  <MenuItem key={so.id} value={so.id}>
                                    <Stack sx={{ width: "100%" }}>
                                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        {so.sales_order_no || so.reference_no}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                        Amount: ₹{(so.total || so.sub_total || 0).toLocaleString("en-IN")}
                                      </Typography>
                                    </Stack>
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          </Box>
                        )}

                        {referenceType === "PO" && (
                          <Box>
                            {loadingReferences ? (
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : (
                              <Select
                                fullWidth
                                value={selectedReference?.id || ""}
                                onChange={(e) => {
                                  const po = purchaseOrders.find((p) => p.id === e.target.value);
                                  setSelectedReference(po);
                                  setFieldValue("order_number", po?.purchase_order_no || po?.reference_no || "");
                                  if (po?.id) {
                                    populateLineItemsFromReference(po.id, true);
                                  }
                                }}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled>
                                  <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                                    {purchaseOrders.length === 0 ? "No purchase orders found" : "Select a purchase order"}
                                  </Typography>
                                </MenuItem>
                                {purchaseOrders.map((po) => (
                                  <MenuItem key={po.id} value={po.id}>
                                    <Stack sx={{ width: "100%" }}>
                                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        {po.purchase_order_no || po.reference_no}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                        Amount: ₹{(po.total || po.sub_total || 0).toLocaleString("en-IN")}
                                      </Typography>
                                    </Stack>
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          </Box>
                        )}

                        {referenceType === "manual" && (
                          <TextField
                            fullWidth
                            placeholder="e.g. PO-2024-001"
                            value={values.order_number}
                            onChange={(e) => setFieldValue("order_number", e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessCenterOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldSx}
                          />
                        )}
                      </Stack>
                    </Box>

                    {/* Salesperson */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.875}>
                        <FieldLabel label="Salesperson" optional />
                        <Button size="small" startIcon={<PersonAddOutlinedIcon sx={{ fontSize: "13px !important" }} />} onClick={() => setOpenSalespersonDialog(true)}
                          sx={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "none", color: "#0f172a", bgcolor: "#f1f5f9", borderRadius: "8px", px: 1.25, py: 0.4, minHeight: 0, "&:hover": { bgcolor: "#e2e8f0" } }}>
                          Add New
                        </Button>
                      </Stack>
                      <Autocomplete options={salespersons} getOptionLabel={(o) => o.name || ""} value={selectedSalesperson}
                        onChange={(_, v) => setFieldValue("salesperson_id", v?.id ?? 0)} isOptionEqualToValue={(o, v) => o.id === v?.id}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ gap: 1.5, py: "10px !important" }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#f1f5f9", color: "#64748b" }}>{option.name[0]?.toUpperCase()}</Avatar>
                            <Box>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{option.name}</Typography>
                              {option.email && <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{option.email}</Typography>}
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select salesperson…"
                            InputProps={{ ...params.InputProps, startAdornment: (<><InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>{params.InputProps.startAdornment}</>) }}
                            sx={fieldSx} />
                        )} />
                    </Box>

                    {/* Subject */}
                    <Box sx={{ gridColumn: { sm: "span 2" } }}>
                      <FieldLabel label="Subject *" hint="Shown on the invoice" />
                      <TextField fullWidth multiline rows={2} placeholder="Let your customer know what this invoice is for…"
                        value={values.subject} onChange={(e) => setFieldValue("subject", e.target.value)}
                        error={touched.subject && Boolean(errors.subject)} helperText={touched.subject && (errors.subject as string)}
                        sx={{ ...fieldSx, "& .MuiInputBase-input": { py: "10px", px: "14px" } }} />
                    </Box>
                  </Box>
                </SectionCard>

                {/* ── 2. Line Items ── */}
                <Card elevation={0} sx={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 24px rgba(15,23,42,0.06)" } }}>
                  <Box sx={{ height: 3, bgcolor: "#10b981" }} />
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                          <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontSize: "0.925rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>Line Items</Typography>
                            {lineCount > 0 && <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", bgcolor: "#0f172a", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>{lineCount}</Box>}
                          </Stack>
                          <Typography sx={{ fontSize: "0.775rem", color: "#94a3b8" }}>Products and services in this invoice</Typography>
                        </Box>
                      </Stack>
                      <Button startIcon={<AddIcon />} onClick={() => openDialog()}
                        sx={{ borderRadius: "10px", px: 2.25, py: 0.875, fontSize: "0.875rem", fontWeight: 600, textTransform: "none", color: "#fff", bgcolor: "#0f172a", boxShadow: "none", "&:hover": { bgcolor: "#1e293b" } }}>
                        Add Item
                      </Button>
                    </Stack>

                    {lineCount === 0 ? (
                      <Box sx={{ border: "2px dashed #e2e8f0", borderRadius: "12px", py: 7, textAlign: "center", bgcolor: "#fafbfc" }}>
                        <Box sx={{ width: 60, height: 60, borderRadius: "14px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5, color: "#94a3b8" }}>
                          <ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>No items yet</Typography>
                        <Typography sx={{ fontSize: "0.825rem", color: "#94a3b8", mb: 3 }}>Add products or services to get started</Typography>
                        <Button startIcon={<AddIcon />} onClick={() => openDialog()}
                          sx={{ borderRadius: "10px", px: 2.5, py: 0.875, fontSize: "0.875rem", fontWeight: 600, textTransform: "none", color: "#fff", bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}>
                          Add First Item
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <TableContainer sx={{ borderRadius: "10px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                {[{ l: "Item", a: "left" }, { l: "Qty", a: "right" }, { l: "Rate", a: "right" }, { l: "Amount", a: "right" }, { l: "", a: "center" }].map((h) => (
                                  <TableCell key={h.l} align={h.a as any} sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>{h.l}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {lineItems.map((item, idx) => (
                                <TableRow key={idx} sx={{ "&:last-child td": { border: 0 }, "& td": { borderBottom: "1px solid #f8fafc", py: 1.75 }, "&:hover": { bgcolor: "#fafbfe" }, "&:hover .la": { opacity: 1 }, transition: "background 0.1s" }}>
                                  <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                      <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}>
                                        <InventoryOutlinedIcon sx={{ fontSize: 16 }} />
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{item.description || item.item_id}</Typography>
                                        <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>ID: {item.item_id}</Typography>
                                      </Box>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, height: 28, px: 1, borderRadius: "8px", bgcolor: "#f1f5f9", fontSize: "0.825rem", fontWeight: 700, color: "#475569" }}>{item.quantity}</Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography sx={{ fontSize: "0.875rem", color: "#475569", fontVariantNumeric: "tabular-nums" }}>₹{item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography sx={{ fontSize: "0.925rem", fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>₹{(item.amount||0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Stack className="la" direction="row" spacing={0.25} justifyContent="center" sx={{ opacity: 0.3, transition: "opacity 0.15s" }}>
                                      <Tooltip title="Edit" arrow><IconButton size="small" onClick={() => openDialog(idx)} sx={{ borderRadius: "8px", color: "#475569", "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" } }}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                      <Tooltip title="Remove" arrow><IconButton size="small" onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} sx={{ borderRadius: "8px", color: "#475569", "&:hover": { bgcolor: "#fef2f2", color: "#dc2626" } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={3} sx={{ mt: 2, px: 3, py: 2, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                          <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 500 }}>Subtotal · {lineCount} item{lineCount !== 1 ? "s" : ""}</Typography>
                          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.025em" }}>₹{totals.sub.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* ── 3. Billing & Charges ── */}
                <SectionCard accent="#f59e0b" icon={<PaymentOutlinedIcon sx={{ fontSize: 20 }} />} title="Billing & Charges" subtitle="Tax configuration, shipping, and adjustments">
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>

                    {/* Tax Type */}
                    <Box>
                      <FieldLabel label="Tax Type" />
                      <Stack direction="row" spacing={1} sx={{ p: 1, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9", width: "fit-content" }}>
                        {["TDS", "TCS"].map((t) => (
                          <Button key={t} size="small" onClick={() => setTaxType(t as any)}
                            sx={{ borderRadius: "8px", px: 2.5, py: 0.6, fontSize: "0.8rem", fontWeight: 700, textTransform: "none", color: taxType === t ? "#fff" : "#64748b", bgcolor: taxType === t ? "#0f172a" : "transparent", boxShadow: taxType === t ? "0 2px 8px rgba(15,23,42,0.2)" : "none", "&:hover": { bgcolor: taxType === t ? "#1e293b" : "#f1f5f9" }, transition: "all 0.15s" }}>
                            {t}
                          </Button>
                        ))}
                      </Stack>
                    </Box>

                    {/* Tax Rate */}
                    <Box>
                      <FieldLabel label="Tax Rate" optional />
                      <Autocomplete options={taxes} getOptionLabel={(o) => `${o.name} (${o.rate}%)`} value={selectedTax}
                        onChange={(_, v) => setFieldValue("tax_id", v?.id ?? 0)} isOptionEqualToValue={(o, v) => o.id === v?.id}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ gap: 1.5, py: "10px !important" }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", flexShrink: 0 }}><PercentOutlinedIcon sx={{ fontSize: 15 }} /></Box>
                            <Box>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{option.name}</Typography>
                              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{option.rate}% · {option.tax_type}</Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select tax rate…"
                            InputProps={{ ...params.InputProps, startAdornment: (<><InputAdornment position="start"><PercentOutlinedIcon sx={{ fontSize: 17, color: "#94a3b8" }} /></InputAdornment>{params.InputProps.startAdornment}</>) }}
                            sx={fieldSx} />
                        )} />
                    </Box>

                    {/* Shipping */}
                    <Box>
                      <FieldLabel label="Shipping Charges" optional />
                      <TextField fullWidth type="number" inputProps={{ step: "0.01", min: 0 }} value={values.shipping_charges} placeholder="0.00"
                        onChange={(e) => setFieldValue("shipping_charges", parseFloat(e.target.value) || 0)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><LocalShippingOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>₹</Typography></InputAdornment> }}
                        sx={fieldSx} />
                    </Box>

                    {/* Adjustment */}
                    <Box>
                      <FieldLabel label="Adjustment" optional hint="Add or subtract from total" />
                      <TextField fullWidth type="number" inputProps={{ step: "0.01" }} value={values.adjustment} placeholder="0.00"
                        onChange={(e) => setFieldValue("adjustment", parseFloat(e.target.value) || 0)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><TuneOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>₹</Typography></InputAdornment> }}
                        sx={fieldSx} />
                    </Box>
                  </Box>
                </SectionCard>

                {/* ── 4. Summary ── */}
                <Card elevation={0} sx={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden" }}>
                  <Box sx={{ height: 3, bgcolor: "#0f172a" }} />
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ md: "flex-start" }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.925rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>Summary</Typography>
                          <Typography sx={{ fontSize: "0.775rem", color: "#94a3b8" }}>{lineCount} item{lineCount !== 1 ? "s" : ""} · INR</Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ flex: 1, maxWidth: 440, ml: { md: "auto !important" } }}>
                        <Stack spacing={1.25}>
                          {[
                            { label: "Subtotal", val: totals.sub },
                            { label: `Tax — ${taxType} (${totals.rate}%)`, val: totals.taxAmt },
                            { label: "Shipping", val: totals.ship },
                            ...(totals.adj !== 0 ? [{ label: "Adjustment", val: totals.adj }] : []),
                          ].map((r) => (
                            <Stack key={r.label} direction="row" justifyContent="space-between">
                              <Typography sx={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>{r.label}</Typography>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: r.val === 0 ? "#cbd5e1" : "#1e293b", fontVariantNumeric: "tabular-nums" }}>₹{r.val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                            </Stack>
                          ))}
                          <Divider sx={{ borderColor: "#f1f5f9", my: 0.5 }} />
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 2, bgcolor: "#0f172a", borderRadius: "12px" }}>
                            <Stack>
                              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Amount</Typography>
                              <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", mt: 0.2 }}>All taxes & charges included</Typography>
                            </Stack>
                            <Typography sx={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.035em", lineHeight: 1 }}>
                              ₹{totals.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* ── 5. Notes & Terms ── */}
                <SectionCard accent="#8b5cf6" icon={<NotesOutlinedIcon sx={{ fontSize: 20 }} />} title="Notes & Terms" subtitle="Customer-facing notes and legal terms">
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                    <Box>
                      <FieldLabel label="Customer Notes" optional hint="Visible on invoice" />
                      <TextField fullWidth multiline rows={4} placeholder="Thanks for your business! We appreciate your trust…"
                        value={values.customer_notes} onChange={(e) => setFieldValue("customer_notes", e.target.value)}
                        sx={{ ...fieldSx, "& .MuiInputBase-input": { py: "10px", px: "14px", lineHeight: 1.6 } }} />
                    </Box>
                    <Box>
                      <FieldLabel label="Terms & Conditions" optional hint="Visible on invoice" />
                      <TextField fullWidth multiline rows={4} placeholder="Enter the terms and conditions of your business…"
                        value={values.terms_and_conditions} onChange={(e) => setFieldValue("terms_and_conditions", e.target.value)}
                        sx={{ ...fieldSx, "& .MuiInputBase-input": { py: "10px", px: "14px", lineHeight: 1.6 } }} />
                    </Box>
                  </Box>
                </SectionCard>

                {/* ── Actions ── */}
                <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pb: 2 }}>
                  <Button onClick={() => router.back()} disabled={isSubmitting || loading}
                    sx={{ borderRadius: "10px", px: 3, py: 1, fontSize: "0.875rem", fontWeight: 600, textTransform: "none", color: "#64748b", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || loading}
                    startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: "17px !important" }} />}
                    sx={{ borderRadius: "10px", px: 3.5, py: 1, fontSize: "0.875rem", fontWeight: 700, textTransform: "none", color: "#fff", bgcolor: "#0f172a", boxShadow: "0 4px 14px rgba(15,23,42,0.25)", "&:hover": { bgcolor: "#1e293b", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(15,23,42,0.35)" }, "&:disabled": { bgcolor: "#cbd5e1", boxShadow: "none" }, transition: "all 0.2s ease" }}>
                    {initialData?.id ? "Update Invoice" : "Save as Draft"}
                  </Button>
                </Stack>
              </Stack>
            </Form>
          );
        }}
      </Formik>

      {/* ── Line Item Dialog ── */}
      <Dialog open={openLineItemDialog} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ elevation: 0, sx: { border: "1px solid #f1f5f9", borderRadius: "16px", boxShadow: "0 32px 80px rgba(15,23,42,0.16)" } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
              {editingIndex !== null ? <EditOutlinedIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.925rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{editingIndex !== null ? "Edit Line Item" : "Add Line Item"}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{editingIndex !== null ? "Update product details" : "Select a product and configure it"}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={closeDialog} sx={{ borderRadius: "8px", color: "#94a3b8", "&:hover": { bgcolor: "#f1f5f9", color: "#475569" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={32} sx={{ color: "#0f172a" }} /></Box>
          ) : (
            <Stack spacing={2.75}>
              <Box>
                <FieldLabel label="Product *" />
                <Autocomplete
                  options={products}
                  getOptionLabel={(o) => o.name || ""}
                  value={products.find((p) => p.id === lineItemForm.product_id) || null}
                  onChange={(_, v) => selectProduct(v)}
                  loading={loadingProducts}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ py: "10px !important", gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}><InventoryOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{option.name}</Typography>
                        {option.sku && <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>SKU: {option.sku}</Typography>}
                      </Box>
                      {option.selling_price && <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 600 }}>₹{option.selling_price}</Typography>}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search and select product…"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start"><InventoryOutlinedIcon sx={{ fontSize: 17, color: "#94a3b8" }} /></InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  )}
                />
              </Box>

              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <FieldLabel label="Quantity *" />
                  <TextField type="number" fullWidth value={lineItemForm.quantity} inputProps={{ min: 1, step: 1 }}
                    onChange={(e) => setLineItemForm((p) => ({ ...p, quantity: (parseInt(e.target.value) || 1) as number }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700 }}>Qty</Typography></InputAdornment> }}
                    sx={fieldSx} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FieldLabel label="Unit Rate *" />
                  <TextField type="number" fullWidth value={lineItemForm.rate} inputProps={{ step: "0.01", min: 0 }}
                    onChange={(e) => setLineItemForm((p) => ({ ...p, rate: (parseFloat(e.target.value) || 0) as number }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 700 }}>₹</Typography></InputAdornment> }}
                    sx={fieldSx} />
                </Box>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                <Stack>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Line Total</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#cbd5e1", mt: 0.2 }}>Qty × Rate</Typography>
                </Stack>
                <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.025em" }}>
                  ₹{(lineItemForm.quantity * lineItemForm.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 1.25, bgcolor: "#fafbfc" }}>
          <Button onClick={closeDialog} sx={{ borderRadius: "10px", px: 2.5, py: 0.875, fontSize: "0.875rem", fontWeight: 600, textTransform: "none", color: "#64748b", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>Cancel</Button>
          <Button onClick={saveLineItem} disabled={!lineItemForm.product_id || !lineItemForm.quantity || !lineItemForm.rate}
            sx={{ borderRadius: "10px", px: 2.75, py: 0.875, fontSize: "0.875rem", fontWeight: 700, textTransform: "none", color: "#fff", bgcolor: "#0f172a", boxShadow: "none", "&:hover": { bgcolor: "#1e293b" }, "&:disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" } }}>
            {editingIndex !== null ? "Update Item" : "Add Item"}
          </Button>
        </Box>
      </Dialog>

      {/* Salesperson dialog — shared component from CreateSalespersonDialog.tsx */}
      <CreateSalespersonDialog
        open={openSalespersonDialog}
        onClose={() => setOpenSalespersonDialog(false)}
        onSuccess={(sp) => { setSalespersons((p) => [...p, sp]); setOpenSalespersonDialog(false); }}
      />
    </>
  );
};