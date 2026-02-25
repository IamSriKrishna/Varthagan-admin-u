"use client";

import { config } from "@/config";
import { usermangement } from "@/constants/apiConstants";
import { activeTypes } from "@/constants/commonConstans";
import useUserManagement, { IUserForm } from "@/hooks/services/useAddManagement";
import useFetch from "@/hooks/useFetch";
import { BBDialog, BBDropdown, BBInput, BBLoader } from "@/lib";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, Grid, Stack } from "@mui/material";
import { Form, Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
const userTypes = [
  { label: "Admin", value: "admin" },
  { label: "Partner", value: "partner" },
  { label: "Mobile User", value: "mobile_user" },
];

export interface Response {
  email: string;
  username: string;
  password: string;
  phone: number;
  user_type: string;
  role: string;
  status: string;
}
type UserManagementFormProps = {
  open: boolean;
  userId: number | null;
  setOpen: (open: boolean) => void;
  refetch: () => void;
};
const validationSchema = Yup.object().shape({
  password: Yup.string().when("isEdit", {
    is: false,
    then: (schema) => schema.required("Password is required"),
  }),
  email: Yup.string()
    .required("Email is required")
    .min(3, "Must be at least 3 characters")
    .email("Enter a valid email address"),
  phone: Yup.string()
    .trim()
    .required("Phone is required")
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  username: Yup.string().required("UserName is required"),
  user_type: Yup.string().required("User Type is required"),
  role_name: Yup.string().required("Role is required"),
});

export default function UserManagementForm({ open, setOpen, userId, refetch }: UserManagementFormProps) {
  const isEdit = userId != null;

  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);

  const {
    formattedData: userData,
    loading: userLoading,
    error: userError,
  } = useFetch<Response, IUserForm>({
    url: isEdit ? `${usermangement.getUsers}/${userId}` : "",
    formatter: (res) => {
      let phone = res?.phone ? String(res.phone) : "";
      if (phone.startsWith("+91")) {
        phone = phone.slice(3);
      }
      return {
        email: res?.email ?? "",
        username: res?.username ?? "",
        password: "",
        phone,
        user_type: res?.user_type ?? "",
        role_name: res?.role ?? "",
        status: res?.status ?? "",
      };
    },
    options: { skip: !isEdit },
    baseUrl: config.loginDomain,
  });

  const { submitUser, loading: loadinguser } = useUserManagement();

  const userMangementSubmit = async (
    values: IUserForm,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    },
  ) => {
    const payload = {
      ...values,
      phone: `+91${values?.phone}`,
    };
    try {
      const response = await submitUser(payload, isEdit ? String(userId) : undefined);
      if (response) {
        refetch();
        showToastMessage(isEdit ? "User updated successfully" : "User created successfully", "success");
        if (!isEdit) resetForm();
        setOpen(false);
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <BBLoader enabled={authLoading || userLoading} />

      <Formik
        initialValues={
          isEdit && userData
            ? userData
            : {
                email: "",
                username: "",
                password: "",
                user_type: "",
                phone: "",
                role_name: "",
                status: isEdit ? "" : null,
              }
        }
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={userMangementSubmit}
      >
        {({ handleSubmit, isSubmitting, dirty }) => (
          <BBDialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => handleSubmit()}
            confirmText={isEdit ? "Update" : "Create"}
            loading={isSubmitting || loadinguser}
            title={isEdit ? "Edit User" : "Add New User"}
            subtitle={`Fill in the details below to ${isEdit ? "edit" : "create"} a user.`}
            maxWidth="md"
            disabled={isSubmitting || loadinguser || (isEdit && !dirty)}
            content={
              <Form onSubmit={handleSubmit}>
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: "8px",
                    p: 2,
                  }}
                >
                  <Stack spacing={3}>
                    {authError || (userError && <Alert severity="error">{authError}</Alert>)}

                    <Grid container spacing={3} component="div">
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <BBInput name="email" label="Email" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <BBInput name="username" label="UserName" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <BBInput name="phone" label="Phone" />
                      </Grid>
                      {!isEdit && (
                        <>
                          <Grid size={{ xs: 12, md: 6 }} component="div">
                            <BBInput name="password" label="Password" type="password" />
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }} component="div">
                            <BBDropdown name="user_type" label="Type" options={userTypes || []} />
                          </Grid>
                        </>
                      )}
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <BBDropdown name="role_name" label="Role" options={userTypes || []} />
                      </Grid>
                      {isEdit && (
                        <Grid size={{ xs: 12, md: 6 }} component="div">
                          <BBDropdown name="status" label="Status" options={activeTypes || []} />
                        </Grid>
                      )}
                    </Grid>
                  </Stack>
                </Card>
              </Form>
            }
          />
        )}
      </Formik>
    </Box>
  );
}
