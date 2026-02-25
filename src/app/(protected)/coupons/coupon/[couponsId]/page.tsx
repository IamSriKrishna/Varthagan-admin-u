"use client";

import { config } from "@/config";
import { category, coupon, customers } from "@/constants/apiConstants";
import { coupon_Type, couponScopeOptions } from "@/constants/couponsConstans";
import useAddCoupon from "@/hooks/services/useAddCoupons";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDatePicker, BBDropdown, BBInput, BBLoader, BBTextarea, BBTitle } from "@/lib";
import BBAutoComplete from "@/lib/BBAutoComplete/BBAutoComplete";
import { Option } from "@/lib/BBAutoComplete/BBAutoCompleteBase";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { ICategories } from "@/models/ICategory";
import { ICoupon } from "@/models/ICoupon";
import { ICustomers } from "@/models/ICustomer";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, Grid, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";

const getValidationSchema = () =>
  Yup.object().shape({
    title: Yup.string().required("Title is required"),
    code: Yup.string().required("Code is required"),

    coupon_type: Yup.string().oneOf(["flat", "percentage", "cashback"]).required("Coupon Type is required"),
    max_discount: Yup.string().when("coupon_type", {
      is: "percentage",
      then: (s) => s.required("Max Discount is required"),
      otherwise: (s) => s.notRequired(),
    }),
    discount_value: Yup.number().typeError("Discount value must be a number").required("Discount value is required"),

    min_order_value: Yup.number()
      .typeError("Minimum order must be a number")
      .required("Minimum order value is required"),

    max_usage_total: Yup.number().nullable(),
    max_usage_per_customer: Yup.number().nullable(),

    scope: Yup.string().oneOf(["public", "vendor", "category", "customer", "hidden"]).required("Scope is required"),

    vendor_id: Yup.string().when("scope", {
      is: "vendor",
      then: (s) => s.required("Vendor is required"),
      otherwise: (s) => s.notRequired(),
    }),

    category_id: Yup.string().when("scope", {
      is: "category",
      then: (s) => s.required("Category is required"),
      otherwise: (s) => s.notRequired(),
    }),

    customer_id: Yup.string().when("scope", {
      is: "customer",
      then: (s) => s.required("Customer is required"),
      otherwise: (s) => s.notRequired(),
    }),

    terms_and_conditions: Yup.string().required("Terms & conditions required"),
    description: Yup.string().required("Description is required"),
    expires_at: Yup.string().required("Expiration date required"),
  });

const couponInitialValues: ICoupon = {
  title: "",
  code: "",

  coupon_type: undefined,
  scope: undefined,

  description: "",
  terms_and_conditions: "",

  starts_at: null,
  expires_at: null,

  is_active: true,

  discount_value: "",
  min_order_value: "",
  max_discount: "",

  max_usage_total: "",
  max_usage_per_customer: "",

  vendor_id: "",
  category_id: "",
  customer_id: "",
};

const CouponForm = () => {
  const router = useRouter();
  const params = useParams();
  const couponId = Array.isArray(params?.couponsId) ? params.couponsId[0] : params?.couponsId;
  const isEdit = !!couponId && couponId !== "new";
  const [search, setSearch] = useState("");
  const [selectedScope, setSelectedScope] = useState<
    "hidden" | "public" | "vendor" | "category" | "customer" | undefined
  >();
  const { loading: authLoading, error: authError } = useSelector((s: RootState) => s.auth);
  const { vendors } = useSelector((s: RootState) => s.vendors);
  const { addOrUpdateCoupons, loading } = useAddCoupon();

  const vendorOptions: Option[] =
    vendors?.map((v) => ({
      label: v.name,
      value: v.vendor_id,
    })) || [];
  const { formattedData: categoriesData, loading: categoriesLoading } = useFetch<
    ICategories,
    { label: string; value: string }[]
  >({
    url: category.getCategory,
    formatter: (res) =>
      res.data.categories.map((cat) => ({
        label: cat.category_name,
        value: cat.id,
      })),
    options: {
      skip: selectedScope !== "category",
    },
  });
  const debouncedSearch = useDebounce(search, 500);

  const customerQueryParams = useMemo(() => {
    const qp = new URLSearchParams();
    if (debouncedSearch) qp.append("search", debouncedSearch);
    qp.append("page", "1");
    qp.append("limit", "10");
    return qp.toString();
  }, [debouncedSearch]);

  const { formattedData: customersData, loading: customerLoading } = useFetch<
    ICustomers,
    { label: string; value: string | number }[]
  >({
    url: `${customers.getCustomers}?${customerQueryParams}`,
    baseUrl: config.customerDomain,
    formatter: (res) =>
      res?.data?.customers?.map((cus) => ({
        label: `${cus.phone || cus.email ? `${cus.phone || cus.email} - ` : ""}${cus.first_name} ${cus.last_name}`,
        value: cus.id ?? "",
      })) ?? [],
    options: {
      skip: selectedScope !== "customer",
    },
  });

  const {
    formattedData: couponData,
    loading: couponLoading,
    error: couponError,
  } = useFetch<ICoupon>({
    url: isEdit ? coupon.getCouponById(couponId) : "",
    baseUrl: config.orderDomain,
    formatter: (res) => {
      return {
        code: res.code ?? "",
        title: res.title ?? "",
        description: res.description ?? "",
        terms_and_conditions: res.terms_and_conditions ?? "",
        expires_at: res.expires_at ? dayjs(res.expires_at) : null,
        starts_at: res.starts_at ? dayjs(res.starts_at) : null,
        coupon_type: res.coupon_type ?? undefined,
        scope: res.scope ?? undefined,
        discount_value: res.discount_value ? Number(res.discount_value) : undefined,
        min_order_value: res.min_order_value ? Number(res.min_order_value) : undefined,
        max_usage_total: res.max_usage_total ? Number(res.max_usage_total) : undefined,
        max_usage_per_customer: res.max_usage_per_customer ? Number(res.max_usage_per_customer) : undefined,
        max_discount: res.max_discount ?? "",
        vendor_id: res.vendor_id ?? "",
        category_id: res.category_id ?? "",
        customer_id: res.customer_id ?? "",
        is_active: res.is_active ?? false,
      };
    },
    options: {
      skip: !isEdit,
    },
  });
  const handleBack = () => router.back();
  const handleCouponsSubmit = async (values: ICoupon) => {
    try {
      const response = await addOrUpdateCoupons(values, isEdit ? couponId : undefined);
      if (response.success) {
        showToastMessage(response.message || (isEdit ? "Coupons updated!" : "Coupons added!"), "success");
        setTimeout(() => router.push("/coupons"), 100);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };
  return (
    <Box>
      <Formik
        initialValues={isEdit && couponData ? (couponData as ICoupon) : couponInitialValues}
        enableReinitialize
        onSubmit={handleCouponsSubmit}
        validationSchema={getValidationSchema()}
      >
        {({ handleSubmit, values, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <BBLoader enabled={authLoading || categoriesLoading || customerLoading || couponLoading} />

            <Box sx={{ mb: 2 }}>
              <BBTitle
                title={isEdit ? "Edit Coupon" : "Add New Coupon"}
                subtitle="Fill details to create a new coupon"
                rightContent={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                      Cancel
                    </BBButton>
                    <BBButton type="submit" variant="contained" disabled={isEdit && !dirty} loading={loading}>
                      {isEdit ? "Update Coupon" : "Create Coupon"}
                    </BBButton>
                  </Box>
                }
              />
            </Box>

            <Card elevation={1} sx={{ borderRadius: "8px", p: 2 }}>
              <Stack spacing={3}>
                {authError || (couponError && <Alert severity="error">{authError}</Alert>)}

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="title" label="Title" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="code" label="Code" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="coupon_type" label="Coupon Type" options={coupon_Type} />
                  </Grid>
                  {values.coupon_type == "percentage" && (
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="max_discount" label="Max Discount Value" />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="discount_value" label="Discount Value" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="min_order_value" label="Minimum Order Value" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="max_usage_total" label="Total Usage Limit" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="max_usage_per_customer" label="Limit Per Customer" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="terms_and_conditions" label="Terms & Conditions" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDatePicker name="starts_at" label="Start At" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDatePicker name="expires_at" label="Expires At" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="scope"
                      label="Scope"
                      options={couponScopeOptions}
                      onValueChange={(value) => {
                        setSelectedScope(value as ICoupon["scope"]);
                      }}
                    />
                  </Grid>

                  {values.scope === "vendor" && (
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBDropdown name="vendor_id" label="Vendor" options={vendorOptions} />
                    </Grid>
                  )}
                  <>
                    {values.scope == "category" && (
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <BBDropdown name="category_id" label="Category ID" options={categoriesData || []} />
                      </Grid>
                    )}
                  </>
                  {!isEdit && values.scope == "customer" && (
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBAutoComplete
                        name="customer_id"
                        label="Customer"
                        options={customersData ?? []}
                        loading={customerLoading}
                        onSearch={setSearch}
                        placeholder="Search customer..."
                        freeSolo={true}
                      />
                    </Grid>
                  )}
                  {isEdit && (
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_active" label="Status" />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }} component="div">
                    <BBTextarea name="description" label="Description" />
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CouponForm;
