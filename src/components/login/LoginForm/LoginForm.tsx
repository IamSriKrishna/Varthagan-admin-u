"use client";

import { config } from "@/config";
import { login } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { BBButton, BBInput, BBLoader } from "@/lib";
import BBLoginImage from "@/lib/BBLoginImage/BBLoginImage";
import { LoginResponse } from "@/models/IUser";
import { RootState } from "@/store";
import { setAuthData, setError, setLoading } from "@/store/auth/authSlice";
import * as classes from "@/styles/login.styles";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Stack, Typography } from "@mui/material";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { mutateApi: loginUser } = useApi<LoginResponse>(login.postLogin, "POST", undefined, config.loginDomain);
  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await loginUser({ email: values.email, password: values.password });
      if (response && response.access_token) {
        dispatch(setAuthData(response));
        showToastMessage("Login successful! Welcome to Varthagan Admin.", "success");
      } else {
        showToastMessage("Invalid credentials - no token received", "error");
      }
    } catch (e: unknown) {
      console.error("Login error:", e);
      let errorMessage = "Login failed. Please check your credentials.";

      if (typeof e == "object" && e !== null) {
        if ("fullError" in e && typeof e.fullError === "object" && e.fullError !== null) {
          if ("message" in e.fullError && typeof e.fullError.message === "string") {
            errorMessage = e.fullError.message;
          }
        } else if ("message" in e && typeof e.message == "string") {
          errorMessage = e.message;
        }
      }

      if (
        errorMessage.toLowerCase().includes("invalid credentials") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("401")
      ) {
        // errorMessage = errorMessage || "Invalid email or password. Please use the correct username or password.";
        errorMessage = "Invalid email or password. Please use the correct username or password.";
      }

      dispatch(setError(errorMessage));
      showToastMessage(errorMessage, "error");
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Box sx={classes.loginContainer}>
      <BBLoader enabled={loading} />
      <Box sx={classes.loginFormContainerBox}>
        <Box sx={classes.loginFormBox}>
          <Typography sx={classes.textTypography} fontWeight={600} gutterBottom>
            Welcome Varthagan Admin 👋
          </Typography>
          <Typography sx={classes.textParagraph}>
            Please sign in with your admin credentials to manage the platform. The email is pre-filled for convenience.
          </Typography>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit: formikSubmit, isSubmitting }) => (
              <form onSubmit={formikSubmit}>
                <Stack spacing={2}>
                  <BBInput name="email" label="Email" placeholder="Example@email.com" />
                  <BBInput name="password" label="Password" type="password" placeholder="At least 8 characters" />

                  <Box sx={{ py: 2 }}>
                    <BBButton
                      size="large"
                      type="submit"
                      variant="contained"
                      fullWidth
                      loading={isSubmitting || loading}
                    >
                      Sign in
                    </BBButton>
                  </Box>
                </Stack>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
      <Box sx={classes.loginImageBox}>
        <BBLoginImage />
      </Box>
    </Box>
  );
}
