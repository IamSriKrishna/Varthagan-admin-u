"use client";

import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
import { BBButton, BBInput } from "@/lib";
import BBLoginImage from "@/lib/BBLoginImage/BBLoginImage";
import { RootState } from "@/store";
import { setError, setLoading } from "@/store/auth/authSlice";
import * as classes from "@/styles/login.styles";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { Formik, FormikHelpers } from "formik";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

interface ForgotPasswordFormValues {
  email: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Email is required").email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    formikHelpers: FormikHelpers<ForgotPasswordFormValues>,
  ) => {
    try {
      dispatch(setLoading(true));
      // const success = await sendOtp(values.email);
      // if (success) {
      //   // dispatch(sendOtpSuccess());
      // }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      dispatch(setError(errorMessage));
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <Box>
      <BrandLogo />

      <Box sx={classes.loginContainer}>
        <Box sx={classes.loginFormContainerBox}>
          <Box sx={classes.loginFormBox}>
            <Typography sx={classes.textTypography} fontWeight={600} gutterBottom>
              Forgot Password
            </Typography>
            <Typography sx={classes.textParagraph}>
              Enter your email and we’ll send you instructions to reset your password
            </Typography>

            <Formik initialValues={{ email: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ handleSubmit: formikHandleSubmit, isSubmitting }) => (
                <form onSubmit={formikHandleSubmit}>
                  <Stack spacing={2}>
                    <BBInput name="email" label="Email" loading={loading} placeholder="Example@email.com" />

                    {error && <Alert severity="error">{error}</Alert>}

                    <BBButton type="submit" variant="contained" fullWidth loading={isSubmitting || loading}>
                      Send Resend Link
                    </BBButton>

                    <BBButton
                      type="submit"
                      fullWidth
                      startIcon={<ChevronLeft size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/login");
                      }}
                    >
                      Back
                    </BBButton>
                  </Stack>
                </form>
              )}
            </Formik>
          </Box>
        </Box>
        <Box sx={classes.loginImageBox}>
          <BBLoginImage />
        </Box>{" "}
      </Box>
    </Box>
  );
}
