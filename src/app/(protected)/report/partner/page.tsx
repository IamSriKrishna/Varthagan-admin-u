"use client";

import { config } from "@/config";
import { partners } from "@/constants/apiConstants";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDatePicker, BBLoader, BBTitle } from "@/lib";
import BBPrint from "@/lib/BBPrint/BBPrint";
import { IPartnersResponse } from "@/models/IPartners";
import { RootState } from "@/store";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Form, Formik } from "formik";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import * as classes from "../partner/PartnerReport.styles";

const validationSchema = Yup.object({
  fromDate: Yup.mixed<Dayjs>().nullable().required("From date is required"),
  toDate: Yup.mixed<Dayjs>().nullable().required("To date is required"),
});

export default function Page() {
  const componentRef = useRef<HTMLDivElement>(null);
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const limit = 100;
  const [filters, setFilters] = useState<{ fromDate: Dayjs | null; toDate: Dayjs | null }>({
    fromDate: null,
    toDate: null,
  });

  const queryParams = new URLSearchParams();
  if (selectedVendorId) queryParams.append("vendor_id", String(selectedVendorId));
  queryParams.append("limit", String(limit));

  if (filters.fromDate) {
    queryParams.append("from_date", dayjs(filters.fromDate).format("YYYY-MM-DD"));
  }
  if (filters.toDate) {
    queryParams.append("to_date", dayjs(filters.toDate).format("YYYY-MM-DD"));
  }

  const { data: results, loading } = useFetch<IPartnersResponse>({
    url: `${partners.getPartners}?${queryParams.toString()}`,
    baseUrl: config.partnerDomain,
  });

  return (
    <Box>
      <BBLoader enabled={loading} />
      <BBTitle
        title="Partner Report"
        rightContent={
          <Box sx={{ display: "flex", gap: 2 }}>
            <BBButton type="submit" form="report-partner" variant="contained">
              Submit
            </BBButton>
            <BBPrint componentRef={componentRef} documentTitle="Order Report">
              Print Report
            </BBPrint>
          </Box>
        }
      />
      <Formik
        initialValues={{ fromDate: null, toDate: null }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setFilters(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, values }) => {
          return (
            <Form id="report-partner">
              <Box component={Paper} sx={{ borderRadius: "10px 10px 0 0", boxShadow: "none", py: 2, px: 7 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDatePicker
                      name="fromDate"
                      label="Start Date"
                      loading={loading}
                      onChange={(date) => {
                        setFieldValue("fromDate", date);
                      }}
                      maxDate={values.toDate}
                      disableFuture
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDatePicker
                      name="toDate"
                      label="To Date"
                      loading={loading}
                      onChange={(date) => {
                        setFieldValue("toDate", date);
                      }}
                      disableFuture
                      minDate={values.fromDate ? dayjs(values.fromDate) : null}
                    />{" "}
                  </Grid>
                </Grid>
              </Box>
            </Form>
          );
        }}
      </Formik>
      <Box ref={componentRef}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center", display: "none" }} className="print-only">
          Partner Report
        </Typography>
        {results?.data?.partners && results.data.partners.length > 0 ? (
          <Box component={Paper} sx={{ borderRadius: "0 0 10px 10px", boxShadow: "none" }}>
            <TableContainer sx={{ width: "90%", maxWidth: "1200px", mx: "auto", py: 2 }}>
              <Table sx={{ minWidth: 650 }} aria-label="partner report table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ ...classes.thStyle, width: "80px", minWidth: "80px", maxWidth: "80px" }}>
                      Partner ID
                    </TableCell>
                    <TableCell sx={{ ...classes.thStyle, width: "80px", minWidth: "80px", maxWidth: "80px" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ ...classes.thStyle, width: "280px", minWidth: "280px", maxWidth: "280px" }}>
                      Email
                    </TableCell>
                    <TableCell sx={classes.thStyle}>Phone</TableCell>
                    <TableCell sx={classes.thStyle}>Specialization</TableCell>
                    <TableCell sx={classes.thStyle}>Joined Date</TableCell>
                    <TableCell sx={classes.thStyle}>Status</TableCell>{" "}
                  </TableRow>{" "}
                </TableHead>
                <TableBody>
                  {results?.data?.partners?.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={classes.tdStyle}>{order.id}</TableCell>
                      <TableCell sx={classes.tdStyle}>{order.name}</TableCell>
                      <TableCell sx={classes.tdStyle}>{order.email}</TableCell>
                      <TableCell sx={classes.tdStyle}>
                        {order.phone}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {order.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={classes.tdStyle}>{order.specialization}</TableCell>
                      <TableCell sx={classes.tdStyle}> {dayjs(order.created_at).format("DD-MM-YYYY")}</TableCell>
                      <TableCell sx={classes.tdStyle}>{order.is_active ? "Active" : "Inactive"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box component={Paper} sx={{ borderRadius: "0 0 10px 10px", boxShadow: "none", textAlign: "center", p: 2 }}>
            <Search size={60} style={{ color: "gray", marginBottom: "16px" }} />
            <Typography variant="h6" color="text.secondary">
              Search to get your Partner report
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
