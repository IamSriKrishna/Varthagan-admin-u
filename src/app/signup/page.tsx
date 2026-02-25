"use client";

import facebook from "@/assets/icons/facebook.svg";
import google from "@/assets/icons/google.svg";
import BrandLogo from "@/components/layout/BrandLogo/BrandLogo";
import { BBButton, BBInput } from "@/lib";
import BBLoginImage from "@/lib/BBLoginImage/BBLoginImage";
import { RootState } from "@/store";
import { setError, setLoading } from "@/store/auth/authSlice";
import {
  loginContainer,
  loginFormBox,
  loginFormContainerBox,
  loginImageBox,
  textForgotPassword,
  textParagraph,
  textTypography,
} from "@/styles/login.styles";
// import { sendOtp } from "@/utils/otpApi";
import { Alert, Box, Checkbox, Divider, FormControlLabel, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Formik } from "formik";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { formControlLabelCheckBox, formControlLabelCheckBoxStyle } from "./page.styles";
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  username: Yup.string().min(8, "Minimum 8 characters").required("UserName is required"),
  password: Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
  acceptTerms: Yup.boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("You must accept the terms and conditions"),
});

export default function Signup() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (
    values: { identifier: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      dispatch(setLoading(true));
      // const success = await sendOtp(values.identifier);
      // if (success) {
      //   // dispatch(sendOtpSuccess());
      // }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      dispatch(setError(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <BrandLogo />
      <Box sx={loginContainer}>
        <Box sx={loginFormContainerBox}>
          <Box sx={loginFormBox}>
            <Typography sx={textTypography} fontWeight={600} gutterBottom>
              Adventre starts here{" "}
            </Typography>
            <Typography sx={textParagraph}>Make your app managementb easy and fun! </Typography>

            <Formik
              initialValues={{ identifier: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleSubmit: formikSubmit, isSubmitting }) => (
                <form onSubmit={formikSubmit}>
                  <Stack spacing={2}>
                    <BBInput name="username" label="UserName" loading={loading} placeholder="At Least 8 character" />
                    <BBInput name="email" label="Email" loading={loading} placeholder="Example@email.com" />
                    <BBInput name="password" label="Password" type="password" placeholder="At least 8 characters" />

                    <FormControlLabel
                      name="acceptTerms"
                      control={
                        <Checkbox
                          name="acceptTerms"
                          color="primary"
                          icon={<Box sx={formControlLabelCheckBoxStyle} />}
                          checkedIcon={
                            <Box sx={formControlLabelCheckBox}>
                              <Check size={16} strokeWidth={3} />
                            </Box>
                          }
                          sx={{ p: 0.5 }}
                        />
                      }
                      label={
                        <Typography variant="body1" sx={{ color: "text.secondary", fontSize: 15 }}>
                          I agree to
                          <MuiLink
                            href="/terms"
                            component={Link}
                            underline="hover"
                            target="_blank"
                            sx={{ ml: 0.5, fontWeight: 500 }}
                          >
                            privacy policy & terms
                          </MuiLink>
                        </Typography>
                      }
                    />
                    {error && <Alert severity="error">{error}</Alert>}

                    <BBButton type="submit" variant="contained" fullWidth loading={isSubmitting || loading}>
                      Sign in
                    </BBButton>

                    <Typography textAlign="center" sx={textForgotPassword}>
                      Already have an account?
                      <MuiLink href="/login" component={Link} underline="hover" color="#634CDA">
                        Sign in instead
                      </MuiLink>
                    </Typography>

                    <Divider>Or</Divider>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      <Box
                        component="button"
                        sx={{
                          border: "none",
                          background: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <Image src={google} alt="Google" width={20} height={20} />
                      </Box>

                      <Box
                        component="button"
                        sx={{
                          border: "none",
                          background: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <Image src={facebook} alt="Facebook" width={20} height={20} />
                      </Box>
                    </Box>
                  </Stack>
                </form>
              )}
            </Formik>
          </Box>
        </Box>
        <Box sx={loginImageBox}>
          <BBLoginImage />
        </Box>
      </Box>
    </Box>
  );
}
