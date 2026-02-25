"use client";

import { usermangement } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { BBDialog, BBInput } from "@/lib";
import { showToastMessage } from "@/utils/toastUtil";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { FormikHelpers } from "formik";
import { config } from "@/config";

interface ResetUserManagementPasswordProps {
  userId: string | number | null;
  open: boolean;
  setOpen: (val: boolean) => void;
}
interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}
const ResetUserManagementPassword = ({ userId, open, setOpen }: ResetUserManagementPasswordProps) => {
  const [loading, setLoading] = useState(false);
  const { mutateApi: resetPassword } = useApi<ResetPasswordResponse>(
    usermangement.resetUser,
    "POST",
    undefined,
    config.loginDomain,
  );
  if (!userId) return null;

  const handleRestPassword = async (
    values: { new_password: string },
    formikHelpers: FormikHelpers<{ new_password: string }>,
  ) => {
    const { resetForm } = formikHelpers;
    if (!userId) {
      showToastMessage("User ID is required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        user_id: userId,
        new_password: values.new_password,
      });

      if (res?.success) {
        showToastMessage(res.message || "Password reset successfully", "success");
        setOpen(false);
        resetForm();
      } else {
        showToastMessage(res?.message || "Failed to reset password", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e == "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{ new_password: "" }}
        validationSchema={Yup.object({
          new_password: Yup.string().min(8, "Minimum 8 characters").required("New password is required"),
        })}
        onSubmit={handleRestPassword}
      >
        {({ handleSubmit }) => (
          <BBDialog
            open={open}
            onClose={() => setOpen(false)}
            title="Reset Password"
            content={
              <Form onSubmit={handleSubmit}>
                <BBInput name="new_password" label="New Password" type="password" fullWidth />
              </Form>
            }
            onConfirm={handleSubmit}
            confirmText="Reset Password"
            cancelText="Cancel"
            loading={loading}
          />
        )}
      </Formik>
    </>
  );
};

export default ResetUserManagementPassword;
