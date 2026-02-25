"use client";
import { config } from "@/config";
import { orders, partners, vendors } from "@/constants/apiConstants";
import minSelectableDate from "@/constants/orderReportConstants";
import { paymentOptions } from "@/constants/payment";
import { useSmartFetch } from "@/hooks/services/useSmartFetch";
import { BBButton, BBDatePicker, BBDropdownBase, BBLoader, BBTitle } from "@/lib";
import BBPrint from "@/lib/BBPrint/BBPrint";
import { IOrderApiResponse } from "@/models/IOrders";
import { IPartner, IPartnersResponse } from "@/models/IPartners";
import { RootState } from "@/store";
import { FileDropStyle } from "@/styles/listtable.styles";
import {
  Alert,
  Box,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { Form, Formik } from "formik";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import * as classes from "../partner/PartnerReport.styles";
import { useOrderFilters } from "./hooks/useOrderFilters";
import { buildOrderQuery } from "./utils/orderQuery";
dayjs.extend(utc);

const validationSchema = Yup.object({
  fromDate: Yup.mixed<Dayjs>().nullable().required("From date is required"),
  toDate: Yup.mixed<Dayjs>().nullable().required("To date is required"),
});

export default function Page() {
  const componentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const limit = 100;
  const [filteropen, setFilterOpen] = useState<boolean>(true);
  const userType = useSelector((state: RootState) => state?.auth.user?.user_type || "");
  const { filters, setFilters, updateUrl } = useOrderFilters();

  const queryParams = useMemo(
    () => buildOrderQuery(filters, limit, selectedVendorId ? String(selectedVendorId) : "", userType),
    [filters, selectedVendorId, userType],
  );

  const { data: results, loading } = useSmartFetch<IOrderApiResponse>({
    url:
      userType == "admin"
        ? `${vendors.getVendorOrderReport(String(selectedVendorId ?? ""))}?${queryParams.toString()}`
        : `${orders.getOrderReport}?${queryParams.toString()}`,
    baseUrl: config.orderDomain,
    isCaching: true,
  });
  const { data: partnerdata, loading: partnerloading } = useSmartFetch<IPartnersResponse>({
    url: `${partners.getPartners}?vendor_id=${selectedVendorId}&limit=100`,
    baseUrl: config.partnerDomain,
    isCaching: true,
  });
  const partnerOptions = Array.isArray(partnerdata?.data?.partners)
    ? partnerdata.data.partners.map((p: IPartner) => ({
        label: p.name ?? "",
        value: p.id,
      }))
    : [];
  const reportdata = results?.data?.report;
  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/order/${orderId}`);
  };
  const handleNavigate = (event: React.MouseEvent<HTMLTableCellElement>, partner_id: string | number) => {
    event.stopPropagation();
    router.push(`/partners/partner/${partner_id}/view`);
  };
  const handleCustomerNavigate = (event: React.MouseEvent<HTMLTableCellElement>, customer_id: string | number) => {
    event.stopPropagation();
    router.push(`/customers/customer/${customer_id}/view`);
  };

  return (
    <Box>
      <BBLoader enabled={loading || partnerloading} />
      <BBTitle
        title="Order Report"
        rightContent={
          <BBButton variant="outlined" startIcon={<Filter size={18} />} onClick={() => setFilterOpen(!filteropen)}>
            {filteropen ? "Hide Filters" : "Show Filters"}
          </BBButton>
        }
      />
      <Box
        sx={{
          borderRadius: "10px 10px 0 0",
          boxShadow: "none",
        }}
        component={Paper}
      >
        <Collapse in={filteropen} timeout="auto" unmountOnExit>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            sx={{ p: 2 }}
          >
            <Typography variant="h6" sx={FileDropStyle}>
              Filter
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              {filteropen && (
                <>
                  <BBButton
                    variant="outlined"
                    onClick={() => {
                      const reset = {
                        fromDate: dayjs(),
                        toDate: dayjs(),
                        partner_id: null,
                        payment_type: null,
                      };

                      setFilters(reset);
                      router.replace("?", { scroll: false });
                    }}
                  >
                    Clear Filters
                  </BBButton>
                  <BBButton type="submit" form="report-order" variant="contained">
                    Submit
                  </BBButton>
                </>
              )}
              <BBPrint componentRef={componentRef} documentTitle="Order Report">
                Print Report
              </BBPrint>
            </Box>
          </Stack>
          <Box sx={{ mb: 2, p: 2 }}>
            <Formik
              initialValues={{
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                partner_id: filters.partner_id,
                payment_type: filters.payment_type,
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                setFilters(values);
                updateUrl(values);
                setSubmitting(false);
              }}
            >
              {({ setFieldValue, values }) => (
                <Form id="report-order">
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <BBDropdownBase
                        name="payment_type"
                        label="Payment Method"
                        value={values.payment_type ?? ""}
                        onDropdownChange={(e, _name, val) => setFieldValue("payment_type", val)}
                        options={[{ label: "All", value: "" }, ...paymentOptions]}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <BBDatePicker
                        name="fromDate"
                        label="Start Date"
                        loading={loading}
                        onChange={(date) => setFieldValue("fromDate", date)}
                        minDate={minSelectableDate}
                        maxDate={values.toDate ?? dayjs()}
                        disableFuture
                      />
                    </Grid>

                    {/* TO DATE */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <BBDatePicker
                        name="toDate"
                        label="To Date"
                        loading={loading}
                        onChange={(date) => setFieldValue("toDate", date)}
                        minDate={values.fromDate ?? minSelectableDate}
                        maxDate={dayjs()}
                        disableFuture
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <BBDropdownBase
                        name="partner_id"
                        label="Partner"
                        value={values.partner_id ?? ""}
                        onDropdownChange={(e, _name, val) => setFieldValue("partner_id", val)}
                        options={[{ label: "All", value: "" }, ...partnerOptions]}
                      />
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Box>

          <Divider />
        </Collapse>

        <Box sx={{ p: 1 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              All orders in this report have been <strong>successfully delivered</strong>.
            </Typography>
          </Alert>
        </Box>
      </Box>

      <Box ref={componentRef}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center", display: "none" }} className="print-only">
          Order Report
        </Typography>
        {reportdata?.orders && reportdata?.orders.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <Table
                sx={{ minWidth: { xs: 0, md: 650 }, tableLayout: "auto", width: "100%", ...classes.tableStyle }}
                aria-label="partner report table"
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={classes.thStyle}>Date</TableCell>
                    <TableCell sx={classes.thStyle}>Customer</TableCell>
                    <TableCell sx={classes.thStyle}>Partner</TableCell>
                    <TableCell sx={classes.thStyle}>Total Amount</TableCell>
                    <TableCell sx={classes.thStyle}>Commission</TableCell>
                    <TableCell sx={classes.thStyle}>After Commision</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={classes.footStyle} colSpan={3}>
                      Total Order :{reportdata?.summary?.total_orders ?? 0}
                    </TableCell>

                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_gross_revenue ?? 0}</TableCell>
                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_partner_commission ?? 0}</TableCell>
                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_revenue ?? 0}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportdata?.orders.map((order) => (
                    <TableRow
                      key={order.order_id}
                      sx={classes.rowStyle}
                      hover
                      onClick={() => handleOrderClick(order.order_id)}
                    >
                      <TableCell sx={classes.tdStyle}>
                        {order.created_at ? dayjs.utc(order.created_at).format("MMM D, YYYY") : "-"}{" "}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...classes.tdStyle,
                          cursor: "pointer",
                          color: "#1976d2",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            color: "#1565c0",
                            textDecoration: "underline",
                          },
                        }}
                        onClick={(e) => handleCustomerNavigate(e, order.customer_id)}
                      >
                        {order?.customer_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...classes.tdStyle,
                          cursor: "pointer",
                          color: "#1976d2",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            color: "#1565c0",
                            textDecoration: "underline",
                          },
                        }}
                        onClick={(e) => handleNavigate(e, order.partner_id)}
                      >
                        {order.partner_name}
                      </TableCell>
                      <TableCell sx={{ ...classes.tdStyle, fontWeight: 600, color: "#2e7d32" }}>
                        {" "}
                        {order.total_amount}
                      </TableCell>
                      <TableCell sx={{ ...classes.tdStyle, fontWeight: 600, color: "#d32f2f" }}>
                        {order.partner_commission}
                      </TableCell>
                      <TableCell sx={{ ...classes.tdStyle, fontWeight: 600, color: "#2e7d32" }}>
                        {order.cost_after_commission}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell sx={classes.footStyle} colSpan={3}>
                      Total Order :{reportdata?.summary?.total_orders ?? 0}
                    </TableCell>

                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_gross_revenue ?? 0}</TableCell>
                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_partner_commission ?? 0}</TableCell>
                    <TableCell sx={classes.footStyle}>{reportdata?.summary?.total_revenue ?? 0}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box
            component={Paper}
            sx={{
              borderRadius: "0 0 10px 10px",
              boxShadow: "none",
              textAlign: "center",
              p: 4,
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              No Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search again
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
