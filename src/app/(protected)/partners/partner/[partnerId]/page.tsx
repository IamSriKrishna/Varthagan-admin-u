"use client";

import { config } from "@/config";
import { partners } from "@/constants/apiConstants";
import { genderOptions } from "@/constants/commonConstans";
import useUserManagement, { IUserForm } from "@/hooks/services/useAddManagement";
import useAddPartner from "@/hooks/services/useAddPartner";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDatePicker, BBDropdown, BBInput, BBLoader, BBTitle } from "@/lib";
import { Option } from "@/lib/BBAutoComplete/BBAutoCompleteBase";
import { IPartnerForm, IPartnerResponseView, sharePercentageOptions } from "@/models/IPartners";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, Grid, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// const getValidationSchema = (isEdit: boolean) =>
//   Yup.object()
//     .shape({
//       email: Yup.string().email("Invalid email"),
//       phone: Yup.string()
//         .trim()
//         .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
//         .nullable(),
//       password: isEdit ? Yup.string().notRequired() : Yup.string().required("Password is required"),
//     })
//     .test("email-or-phone-required", "Either email or phone number is required", function (value) {
//       const email = value?.email;
//       const phone = value?.phone;

//       if (!email && !phone) {
//         return this.createError({
//           path: "email",
//           message: "Either email or phone number is required",
//         });
//       }
//       return true;
//     });
const getValidationSchema = (isEdit: boolean) =>
  Yup.object().shape({
    first_name: Yup.string().required("First Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .trim()
      .required("Phone is required")
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    password: isEdit ? Yup.string().notRequired() : Yup.string().required("Password is required"),
    date_of_birth: Yup.string().required("DOB is required"),
    salary: Yup.number()
      .typeError("Partner Salary must be a number")
      .required("Partner Salary is required")
      .min(0, "Partner Salary cannot be negative"),
    gender: Yup.string().required("Gender is required"),
    vendor_id: Yup.string().required("Vendor is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postal_code: Yup.string().required("Postal Code is required"),
    revenue_share_percent: Yup.string().required("Share Percentage is required"),
  });

const initialValues: IPartnerForm = {
  user_id: "",
  first_name: "",
  email: "",
  password: "",
  last_name: "",
  phone: "",
  date_of_birth: "",
  gender: undefined,
  revenue_share_percent: undefined,
  vendor_id: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  salary: "",
};

const PartnerForm = () => {
  const router = useRouter();
  const params = useParams();
  const partnerIdRaw = params?.partnerId;
  const partnerId = Array.isArray(partnerIdRaw) ? partnerIdRaw[0] : partnerIdRaw;
  const isEdit = !!partnerId && partnerId !== "new";
  const { addOrUpdatePartner, loading } = useAddPartner();
  const { submitUser, loading: loadinguser } = useUserManagement();
  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const { vendors } = useSelector((s: RootState) => s.vendors);
  const options: Option[] = vendors
    ?.filter((v) => v.is_active)
    ?.map((v) => ({
      label: String(v.name),
      value: v.vendor_id,
    }));

  const {
    formattedData: partnerData,
    loading: partnerLoading,
    error: partnerError,
  } = useFetch<IPartnerResponseView, IPartnerForm>({
    url: isEdit ? partners.getPartnerById(partnerId) : "",
    formatter: (res) => {
      if (!res?.data) return initialValues;
      const partner = res?.data[0] ?? [];
      const profile = partner?.profile ?? {};

      return {
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        email: partner.email ?? "",
        phone: partner.phone?.replace(/^\+91/, "") ?? "",
        date_of_birth: profile.date_of_birth ? dayjs(profile.date_of_birth) : undefined,
        gender: profile.gender ?? "",
        revenue_share_percent: profile.revenue_share_percent ?? "",
        vendor_id: profile.vendor_id ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        salary: profile.salary ?? "",
        postal_code: profile.postal_code ?? "",
      } as IPartnerForm;
    },
    options: { skip: !isEdit },
    baseUrl: config.partnerDomain,
  });

  const handlePartnerSubmit = async (values: IPartnerForm) => {
    try {
      let createdId: number | string | undefined;

      const userPayload: IUserForm = {
        email: values.email,
        username: values.first_name ?? "",
        phone: values?.phone ? `+91${values?.phone}` : "",
        user_type: "partner",
        role_name: "partner",
        ...(!isEdit && { password: values.password || "" }),
      };

      let baseResponse;

      if (!isEdit) {
        baseResponse = await submitUser(userPayload);
        if (!baseResponse?.id) {
          throw new Error("Failed to create user or missing ID.");
        }
        createdId = baseResponse.id;
      } else {
        const hasUserChanges =
          values.email !== partnerData?.email ||
          values.first_name !== partnerData?.first_name ||
          values.phone !== partnerData?.phone;

        if (hasUserChanges) {
          baseResponse = await submitUser(userPayload, String(partnerId));
        }
        createdId = partnerData?.user_id ?? baseResponse?.id;
      }
      const partnerPayload: IPartnerForm = {
        ...values,
        user_id: createdId,
      };
      const partnerResponse = await addOrUpdatePartner(partnerPayload, isEdit ? String(partnerId) : undefined);
      if (partnerResponse.success) {
        showToastMessage(partnerResponse.message || (isEdit ? "Partner updated!" : "Partner added!"), "success");
        setTimeout(() => router.push("/partners"), 100);
      } else {
        throw new Error(partnerResponse.message || "Operation failed");
      }
    } catch (error) {
      showToastMessage((error as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };

  const handleBack = () => {
    router.back();
  };
  return (
    <Box>
      <BBLoader enabled={authLoading || partnerLoading} />

      <Formik
        initialValues={isEdit && partnerData ? partnerData : initialValues}
        enableReinitialize
        onSubmit={handlePartnerSubmit}
        validationSchema={getValidationSchema(isEdit)}
      >
        {({ handleSubmit, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <BBTitle
                title={isEdit ? "Edit Partner" : "Add a New Partner"}
                subtitle="add partner details to create a new partner"
                rightContent={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                      Cancel
                    </BBButton>
                    <BBButton
                      type="submit"
                      variant="contained"
                      disabled={loading || loadinguser || (isEdit && !dirty)}
                      loading={loading || loadinguser}
                    >
                      {isEdit ? "Update Partner" : "Create Partner"}
                    </BBButton>
                  </Box>
                }
              />
            </Box>
            <Card
              elevation={1}
              sx={{
                borderRadius: "8px",
                p: 2,
              }}
            >
              <Stack spacing={3}>
                {authError || (partnerError && <Alert severity="error">{authError || partnerError}</Alert>)}

                <Grid container spacing={3} component="div">
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="first_name" label="First Name" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="last_name" label="Last Name" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="email" label="Email" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="phone" label="Phone" />
                  </Grid>

                  {!isEdit && (
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="password" label="Password" />
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDatePicker name="date_of_birth" label="DOB" disableFuture />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="gender" label="Gender" options={genderOptions || []} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="vendor_id" label="Vendor" options={options || []} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="salary" label="Salary" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="city" label="City" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="state" label="State" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="postal_code" label="Postal Code" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="revenue_share_percent"
                      label="Share Percentage"
                      options={sharePercentageOptions || []}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }} component="div">
                    <BBInput name="address" label="Address" placeholder="Enter detailed address..." rows={4} />
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

export default PartnerForm;
