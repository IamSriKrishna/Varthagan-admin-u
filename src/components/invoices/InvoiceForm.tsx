"use client";

import { invoices, salespersons as salespersonsEndpoint } from "@/constants/apiConstants";
import { ICreateInvoicePayload, IInvoice, ILineItem } from "@/models/IInvoice";
import { BBDropdownBase, BBDatePickerBase, BBTextarea } from "@/lib";
import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { customerService } from "@/lib/api/customerService";
import { invoiceService } from "@/lib/api/invoiceService";
import { useTax } from "@/hooks/useTax";
import { itemService } from "@/lib/api/itemService";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControlLabel,
  Radio,
  InputAdornment,
  Autocomplete,
  Card,
  CardContent,
  TableContainer,
  Chip,
  Fade,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Plus, Trash2, UserPlus, ShoppingBasket, Inbox } from "lucide-react";

dayjs.extend(utc);
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { CreateSalespersonDialog } from "./CreateSalespersonDialog";

interface InvoiceFormProps {
  initialData?: IInvoice;
  onSuccess?: (invoice: IInvoice) => void;
}

interface CustomerOption {
  id: number;
  display_name: string;
  company_name: string;
  email: string;
  phone: string;
}

interface SalespersonOption {
  id: number;
  name: string;
  email: string;
}

interface ItemOption {
  id: string;
  name: string;
}

interface LineItemFormData extends ILineItem {
  id?: string | number;
}

interface TaxOption {
  id: number;
  name: string;
  rate: number;
  tax_type: string;
}

const validationSchema = Yup.object({
  customer_id: Yup.number().required("Customer is required"),
  invoice_date: Yup.string().required("Invoice date is required"),
  due_date: Yup.string().required("Due date is required"),
  terms: Yup.string().required("Terms is required"),
  subject: Yup.string().required("Subject is required"),
  shipping_charges: Yup.number().min(0),
  adjustment: Yup.number().min(0),
});

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSuccess }) => {
  const router = useRouter();
  const { taxes } = useTax();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [salespersons, setSalespersons] = useState<SalespersonOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [lineItems, setLineItems] = useState<ILineItem[]>(initialData?.line_items || []);
  const [taxType, setTaxType] = useState<"TDS" | "TCS">(
    initialData?.tax_type === "TDS" ? "TDS" : "TCS"
  );
  const [openSalespersonDialog, setOpenSalespersonDialog] = useState(false);
  const [openLineItemDialog, setOpenLineItemDialog] = useState(false);
  const [editingLineItemIndex, setEditingLineItemIndex] = useState<number | null>(null);
  const [lineItemFormData, setLineItemFormData] = useState<LineItemFormData>({
    item_id: "",
    description: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  });
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getCustomers(1, 1000);
        if (response.success && response.data) {
          setCustomers(response.data as any);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiDomain = config.apiDomain || "";
        const salespersonsRes = await appFetch(`${apiDomain}${salespersonsEndpoint.getSalespersons}`, { method: "GET" });

        if (salespersonsRes.ok) {
          const data = await salespersonsRes.json();
          if (Array.isArray(data.salespersons)) {
            setSalespersons(data.salespersons);
          }
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemService.getItems(1, 100);
        if (response.items) {
          setItems(response.items);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleOpenLineItemDialog = (index?: number) => {
    if (index !== undefined) {
      const item = lineItems[index];
      setLineItemFormData(item);
      setEditingLineItemIndex(index);
    } else {
      setLineItemFormData({
        item_id: "",
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      });
      setEditingLineItemIndex(null);
    }
    setOpenLineItemDialog(true);
  };

  const handleCloseLineItemDialog = () => {
    setOpenLineItemDialog(false);
    setEditingLineItemIndex(null);
    setSelectedItemDetails(null);
    setSelectedVariant(null);
  };

  const handleSaveLineItem = () => {
    if (!lineItemFormData.item_id || lineItemFormData.quantity <= 0 || lineItemFormData.rate < 0) {
      showToastMessage("Please fill all required fields", "error");
      return;
    }

    const amount = (lineItemFormData.quantity || 0) * (lineItemFormData.rate || 0);
    const items = [...lineItems];

    if (editingLineItemIndex !== null) {
      items[editingLineItemIndex] = {
        ...lineItemFormData,
        amount,
      };
    } else {
      items.push({
        ...lineItemFormData,
        id: Math.random(),
        amount,
      });
    }

    setLineItems(items);
    handleCloseLineItemDialog();
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateLineItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateTotals = (values: any) => {
    const subTotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const shippingCharges = values.shipping_charges || 0;
    const taxId = values.tax_id;
    const tax = taxes.find((t) => t.id === taxId);
    const taxRate = tax?.rate || 0;
    const adjustment = values.adjustment || 0;

    const taxableAmount = subTotal + shippingCharges + adjustment;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    return { subTotal, shippingCharges, taxAmount, total, taxRate };
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    if (lineItems.length === 0) {
      showToastMessage("Please add at least one line item", "error");
      setSubmitting(false);
      return;
    }

    try {
      setLoading(true);
      
      // Format line items - ensure proper data types
      const formattedLineItems = lineItems.map(item => ({
        item_id: item.item_id,
        description: item.description || "",
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
      }));

      // Convert dates to ISO 8601 format with UTC midnight (YYYY-MM-DDTHH:mm:ssZ)
      const parseDate = (dateInput: any) => {
        const parsed = dayjs(dateInput);
        const year = parsed.year();
        const month = String(parsed.month() + 1).padStart(2, '0');
        const day = String(parsed.date()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00Z`;
      };

      // Generate order number if empty
      const generateOrderNumber = () => {
        return `ORD-${Date.now().toString().slice(-8)}`;
      };

      // Construct payload with proper data types
      const payload = {
        customer_id: Number(values.customer_id),
        order_number: values.order_number || generateOrderNumber(),
        invoice_date: parseDate(values.invoice_date),
        terms: values.terms,
        due_date: parseDate(values.due_date),
        salesperson_id: Number(values.salesperson_id) || 0,
        subject: values.subject || "",
        line_items: formattedLineItems,
        shipping_charges: Number(values.shipping_charges) || 0,
        tax_type: taxType || "",
        tax_id: Number(values.tax_id) || 0,
        adjustment: Number(values.adjustment) || 0,
        customer_notes: values.customer_notes || "",
        terms_and_conditions: values.terms_and_conditions || "",
        attachments: [],
      };

      const apiDomain = config.apiDomain || config.customerDomain || "";
      const url = initialData?.id
        ? `${apiDomain}${invoices.updateInvoice(initialData.id)}`
        : `${apiDomain}${invoices.postInvoice}`;

      let result;
      
      try {
        if (initialData?.id) {
          result = await invoiceService.updateInvoice(initialData.id, payload);
        } else {
          result = await invoiceService.createInvoice(payload);
        }
      } catch (error: any) {
        showToastMessage(error?.message || "Failed to save invoice", "error");
        setLoading(false);
        setSubmitting(false);
        return;
      }

      // Check if result has data (which indicates success from 201/200 response)
      if (result && (result.data || result.invoice_id || result.id)) {
        showToastMessage(
          initialData?.id ? "Invoice updated successfully" : "Invoice created successfully",
          "success"
        );
        onSuccess?.(result.data || result);
        router.push("/invoices");
      } else {
        showToastMessage(result?.message || "Failed to save invoice", "error");
      }
    } catch (error: any) {
      showToastMessage(error?.message || "Failed to save invoice", "error");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSalespersonCreated = (newSalesperson: SalespersonOption) => {
    setSalespersons([...salespersons, newSalesperson]);
    setOpenSalespersonDialog(false);
  };

  const initialValues = {
    customer_id: initialData?.customer_id || 0,
    invoice_date: initialData?.invoice_date || dayjs().format("YYYY-MM-DD"),
    due_date: initialData?.due_date || dayjs().add(30, "days").format("YYYY-MM-DD"),
    terms: initialData?.terms || "net_30",
    subject: initialData?.subject || "",
    salesperson_id: initialData?.salesperson_id || 0,
    order_number: initialData?.order_number || "",
    shipping_charges: initialData?.shipping_charges || 0,
    tax_id: initialData?.tax_id || 0,
    adjustment: initialData?.adjustment || 0,
    customer_notes: initialData?.customer_notes || "",
    terms_and_conditions: initialData?.terms_and_conditions || "",
  };

  return (
    <>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ values, setFieldValue, isSubmitting, errors, touched }) => {
          const totals = calculateTotals(values);

          useEffect(() => {
            const daysMap: Record<string, number> = {
              due_on_receipt: 0,
              net_7: 7,
              net_15: 15,
              net_30: 30,
              net_45: 45,
              net_60: 60,
            };

            if (values.invoice_date && values.terms) {
              const days = daysMap[values.terms] || 0;
              const newDueDate = dayjs(values.invoice_date).add(days, "days").format("YYYY-MM-DD");
              setFieldValue("due_date", newDueDate);
            }
          }, [values.terms, values.invoice_date, setFieldValue]);

          return (
            <Form>
              <Stack spacing={3}>
                {/* Basic Information */}
                <Paper sx={{ p: 3, background: "linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)" }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#1a237e" }}>
                    Invoice Details
                  </Typography>

                  <Stack spacing={2.5}>
                    {/* Customer and Invoice# */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Customer Name *
                        </Typography>
                        <BBDropdownBase
                          name="customer_id"
                          label="Customer Name *"
                          value={values.customer_id || 0}
                          onDropdownChange={(e, _name, val) => setFieldValue("customer_id", Number(val))}
                          options={customers.map((c) => ({
                            value: c.id,
                            label: `${c.display_name || c.company_name} ${c.email ? `(${c.email})` : ""}`,
                          }))}
                          renderValue={(value: any) => {
                            const selected = customers.find((c) => c.id === value);
                            return selected 
                              ? `${selected.display_name || selected.company_name} ${selected.email ? `(${selected.email})` : ""}`
                              : "";
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                            },
                          }}
                        />
                        {errors.customer_id && touched.customer_id && (
                          <Typography sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                            {errors.customer_id}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Invoice #
                        </Typography>
                        <TextField
                          fullWidth
                          value={initialData?.invoice_number || `INV-${String(Date.now()).slice(-6)}`}
                          disabled
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f0f0f0",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Dates and Terms */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Invoice Date *
                        </Typography>
                        <BBDatePickerBase
                          name="invoice_date"
                          label="Invoice Date *"
                          value={dayjs(values.invoice_date)}
                          onDateChange={(name, value) => {
                            if (value) setFieldValue("invoice_date", value.format("YYYY-MM-DD"));
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Terms
                        </Typography>
                        <Select
                          size="small"
                          fullWidth
                          value={values.terms}
                          onChange={(e) => setFieldValue("terms", e.target.value)}
                          sx={{
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ddd",
                            },
                          }}
                        >
                          <MenuItem value="due_on_receipt">Due on Receipt</MenuItem>
                          <MenuItem value="net_7">Net 7</MenuItem>
                          <MenuItem value="net_15">Net 15</MenuItem>
                          <MenuItem value="net_30">Net 30</MenuItem>
                          <MenuItem value="net_45">Net 45</MenuItem>
                          <MenuItem value="net_60">Net 60</MenuItem>
                        </Select>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Due Date
                        </Typography>
                        <BBDatePickerBase
                          name="due_date"
                          label="Due Date"
                          value={dayjs(values.due_date)}
                          onDateChange={(name, value) => {
                            if (value) setFieldValue("due_date", value.format("YYYY-MM-DD"));
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Order Number
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Optional"
                          value={values.order_number}
                          onChange={(e) => setFieldValue("order_number", e.target.value)}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Salesperson and Subject */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Salesperson
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <BBDropdownBase
                              name="salesperson_id"
                              label="Salesperson"
                              value={values.salesperson_id || 0}
                              onDropdownChange={(e, _name, val) => setFieldValue("salesperson_id", Number(val))}
                              options={salespersons.map((s) => ({
                                value: s.id,
                                label: s.name,
                              }))}
                              renderValue={(value: any) => {
                                const selected = salespersons.find((s) => s.id === value);
                                return selected ? selected.name : "";
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#fff",
                                  borderRadius: "8px",
                                },
                              }}
                            />
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<UserPlus size={18} />}
                            onClick={() => setOpenSalespersonDialog(true)}
                            sx={{
                              mt: 0.5,
                              textTransform: "none",
                              borderRadius: "8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            New
                          </Button>
                        </Box>
                      </Box>
                    </Box>

                    {/* Subject */}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                        Subject *
                      </Typography>
                      <BBTextarea
                        name="subject"
                        label="Subject *"
                        placeholder="Let your customer know what this invoice is for"
                        value={values.subject}
                        onChange={(e) => setFieldValue("subject", e.target.value)}
                        rows={2}
                      />
                      {errors.subject && touched.subject && (
                        <Typography sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                          {errors.subject}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>

                {/* Line Items */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <ShoppingBasket size={20} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Line Items
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, ml: 5 }}>
                        Add products 0to your invoice
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenLineItemDialog()}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: 2,
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "&:hover": {
                          boxShadow: 4,
                          transform: "translateY(-2px)",
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      Add Item
                    </Button>
                  </Box>

                  {/* Table Card or Empty State */}
                  {lineItems.length > 0 ? (
                    <Fade in timeout={300}>
                      <Card
                        sx={{
                          boxShadow: 2,
                          borderRadius: 3,
                          border: `1px solid ${alpha("#667eea", 0.1)}`,
                        }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background: `linear-gradient(135deg, ${alpha("#f8f9fa", 1)} 0%, ${alpha("#e9ecef", 1)} 100%)`,
                                    borderBottom: `2px solid ${alpha("#667eea", 0.2)}`,
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 700, color: "#333", py: 2 }}>
                                    Item
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 700, color: "#333" }}>
                                    Quantity
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: "#333" }}>
                                    Rate
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: "#333" }}>
                                    Amount
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 700, color: "#333" }}>
                                    Actions
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {lineItems.map((item, index) => (
                                  <TableRow
                                    key={index}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: alpha("#667eea", 0.04),
                                      },
                                      transition: "background-color 0.2s ease",
                                      borderBottom: `1px solid ${alpha("#e0e0e0", 0.5)}`,
                                    }}
                                  >
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                            backgroundColor: alpha("#667eea", 0.1),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#667eea",
                                          }}
                                        >
                                          <InventoryIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {item.item_id}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={item.quantity}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          minWidth: 48,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        ₹ {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#22c55e" }}>
                                        ₹ {(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                                        <Tooltip title="Edit" arrow>
                                          <IconButton
                                            size="small"
                                            onClick={() => handleOpenLineItemDialog(index)}
                                            sx={{
                                              color: "primary.main",
                                              "&:hover": {
                                                backgroundColor: alpha("#667eea", 0.1),
                                                transform: "scale(1.1)",
                                              },
                                              transition: "all 0.2s ease",
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete" arrow>
                                          <IconButton
                                            size="small"
                                            onClick={() => removeLineItem(index)}
                                            sx={{
                                              color: "error.main",
                                              "&:hover": {
                                                backgroundColor: alpha("#d32f2f", 0.1),
                                                transform: "scale(1.1)",
                                              },
                                              transition: "all 0.2s ease",
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Fade>
                  ) : (
                    <Fade in timeout={300}>
                      <Card
                        sx={{
                          boxShadow: 1,
                          borderRadius: 3,
                          border: `2px dashed ${alpha("#667eea", 0.3)}`,
                          backgroundColor: alpha("#f8f9fa", 0.5),
                        }}
                      >
                        <CardContent sx={{ py: 8, textAlign: "center" }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: "50%",
                              backgroundColor: alpha("#667eea", 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto",
                              mb: 3,
                            }}
                          >
                            <ShoppingBasket
                              style={{
                                fontSize: 40,
                                color: "#667eea",
                                opacity: 0.6,
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                            No items added yet
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.disabled", mb: 3 }}>
                            Add line items to your invoice to get started
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenLineItemDialog()}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 3,
                              py: 1.2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                          >
                            Add Your First Item
                          </Button>
                        </CardContent>
                      </Card>
                    </Fade>
                  )}
                </Box>

                {/* Totals Section */}
                <Paper sx={{ p: 3, background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)" }}>
                  <Box sx={{ ml: "auto", maxWidth: 450 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 500 }}>Sub Total:</Typography>
                        <Typography sx={{ fontWeight: 700, color: "#1a237e" }}>
                          ₹{totals.subTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 500 }}>Shipping Charges:</Typography>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ step: "0.01" }}
                          variant="outlined"
                          sx={{ width: "140px" }}
                          value={values.shipping_charges}
                          onChange={(e) => setFieldValue("shipping_charges", parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </Box>

                      <Box sx={{ my: 2, p: 1.5, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: "8px" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#333" }}>
                          Tax Type
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <FormControlLabel
                            control={<Radio checked={taxType === "TDS"} onChange={() => setTaxType("TDS")} />}
                            label="TDS"
                            sx={{ "& .MuiTypography-root": { fontWeight: 500 } }}
                          />
                          <FormControlLabel
                            control={<Radio checked={taxType === "TCS"} onChange={() => setTaxType("TCS")} />}
                            label="TCS"
                            sx={{ "& .MuiTypography-root": { fontWeight: 500 } }}
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                          Select Tax
                        </Typography>
                        <Select
                          size="small"
                          value={values.tax_id || 0}
                          onChange={(e) => setFieldValue("tax_id", Number(e.target.value))}
                          displayEmpty
                          fullWidth
                          renderValue={(value: any) => {
                            const selected = taxes.find((t) => t.id === value);
                            return selected ? `${selected.name} (${selected.rate}%)` : "";
                          }}
                          sx={{
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ddd",
                            },
                          }}
                        >
                          <MenuItem value={0}>
                            <em>Select a Tax</em>
                          </MenuItem>
                          {taxes.map((tax) => (
                            <MenuItem key={tax.id} value={tax.id}>
                              {tax.name} ({tax.rate}%)
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 500 }}>Tax ({totals.taxRate}%):</Typography>
                        <Typography sx={{ fontWeight: 700, color: "#1a237e" }}>
                          ₹{totals.taxAmount.toFixed(2)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 500 }}>Adjustment:</Typography>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ step: "0.01", min: "0" }}
                          variant="outlined"
                          sx={{ width: "140px" }}
                          value={values.adjustment}
                          onChange={(e) => setFieldValue("adjustment", parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderTop: "3px solid #ff9800",
                          pt: 2,
                          mt: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a237e" }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#ff9800", fontSize: "1.5rem" }}>
                          ₹{totals.total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>

                {/* Notes & Terms */}
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                        Customer Notes
                      </Typography>
                      <BBTextarea
                        name="customer_notes"
                      label="Customer Notes"
                      placeholder="Thanks for your business"
                      value={values.customer_notes}
                      onChange={(e) => setFieldValue("customer_notes", e.target.value)}
                      rows={4}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: "#333" }}>
                      Terms & Conditions
                    </Typography>
                    <BBTextarea
                      name="terms_and_conditions"
                      label="Terms & Conditions"
                      placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                      value={values.terms_and_conditions}
                      onChange={(e) => setFieldValue("terms_and_conditions", e.target.value)}
                      rows={4}
                    />
                  </Box>
                </Box>
              </Paper>

                {/* Form Actions */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isSubmitting || loading}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting || loading}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                    }}
                  >
                    {initialData?.id ? "Update Invoice" : "Save as Draft"}
                  </Button>
                </Box>
              </Stack>
            </Form>
          );
        }}
      </Formik>

      {/* Line Item Dialog */}
      <Dialog
        open={openLineItemDialog}
        onClose={handleCloseLineItemDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${alpha("#f8f9fa", 1)} 0%, ${alpha("#e9ecef", 1)} 100%)`,
            borderBottom: `2px solid ${alpha("#667eea", 0.2)}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {editingLineItemIndex !== null ? (
                <EditIcon fontSize="small" />
              ) : (
                <AddIcon fontSize="small" />
              )}
            </Box>
            {editingLineItemIndex !== null ? "Edit Line Item" : "Add New Line Item"}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 4 }}>
          {loadingItems ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={items}
                getOptionLabel={(option) => `${option.name || ""} (${option.id})`}
                value={
                  items.find((i) => i.id === lineItemFormData.item_id) || null
                }
                onChange={async (_, value) => {
                  setLineItemFormData({ ...lineItemFormData, item_id: value?.id || "" });
                  if (value?.id) {
                    try {
                      const itemDetails = await itemService.getItem(value.id);
                      setSelectedItemDetails(itemDetails);
                      setSelectedVariant(null);
                      // If item has single variant, auto-select it
                      if (itemDetails.item_details?.structure === 'variants' && 
                          itemDetails.item_details?.variants?.length === 1) {
                        const variant = itemDetails.item_details.variants[0];
                        setSelectedVariant(variant);
                        setLineItemFormData(prev => ({
                          ...prev,
                          rate: variant.selling_price || 0,
                          description: variant.sku || value.name
                        }));
                      } else if (itemDetails.sales_info?.selling_price) {
                        setLineItemFormData(prev => ({
                          ...prev,
                          rate: itemDetails.sales_info.selling_price || 0,
                        }));
                      }
                    } catch (error) {
                      console.error("Error fetching item details:", error);
                    }
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Item *"
                    placeholder="Select an item"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
              {selectedItemDetails?.item_details?.structure === 'variants' && (
                <Select
                  fullWidth
                  value={selectedVariant?.sku || ''}
                  onChange={(e) => {
                    const variant = selectedItemDetails.item_details.variants.find(
                      (v: any) => v.sku === e.target.value
                    );
                    if (variant) {
                      setSelectedVariant(variant);
                      const attrStr = Object.entries(variant.attribute_map || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ");
                      setLineItemFormData(prev => ({
                        ...prev,
                        rate: variant.selling_price || 0,
                        description: `${selectedItemDetails.name} (${attrStr})`
                      }));
                    }
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <MenuItem value="">Select Variant *</MenuItem>
                  {selectedItemDetails.item_details.variants.map((variant: any, idx: number) => {
                    const attrStr = Object.entries(variant.attribute_map || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                    return (
                      <MenuItem key={idx} value={variant.sku}>
                        {variant.sku} - {attrStr} (₹{variant.selling_price})
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }} component="div">
                  <TextField
                    fullWidth
                    label="Quantity *"
                    type="number"
                    value={lineItemFormData.quantity}
                    onChange={(e) =>
                      setLineItemFormData({
                        ...lineItemFormData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <TextField
                    fullWidth
                    label="Rate *"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    value={lineItemFormData.rate}
                    onChange={(e) =>
                      setLineItemFormData({
                        ...lineItemFormData,
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Amount (Auto-calculated)"
                fullWidth
                disabled
                value={`₹ ${calculateLineItemAmount(
                  lineItemFormData.quantity,
                  lineItemFormData.rate
                ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: alpha("#22c55e", 0.05),
                    fontWeight: 700,
                    color: "#22c55e",
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            borderTop: `1px solid ${alpha("#667eea", 0.1)}`,
          }}
        >
          <Button
            onClick={handleCloseLineItemDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLineItem}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 3,
            }}
          >
            {editingLineItemIndex !== null ? "Update Item" : "Add Item"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Salesperson Dialog */}
      <CreateSalespersonDialog
        open={openSalespersonDialog}
        onClose={() => setOpenSalespersonDialog(false)}
        onSuccess={handleSalespersonCreated}
      />
    </>
  );
};

