"use client";

import { config } from "@/config";
import { login } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { BBButton, BBInput, BBLoader } from "@/lib";
import { LoginResponse } from "@/models/IUser";
import { RootState } from "@/store";
import {
  setAuthData,
  setError,
  setLoading,
} from "@/store/auth/authSlice";
import * as classes from "@/styles/login.styles";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),
});

export default function LoginForm() {
  const dispatch = useDispatch();

  const { loading } = useSelector(
    (state: RootState) => state.auth,
  );

  const { mutateApi: loginUser } = useApi<LoginResponse>(
    login.postLogin,
    "POST",
    undefined,
    config.loginDomain,
  );

  const handleSubmit = async (
    values: {
      email: string;
      password: string;
    },
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    },
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });

      if (response?.access_token) {
        dispatch(setAuthData(response));

        showToastMessage(
          "Login successful! Welcome to Varthagan Admin.",
          "success",
        );
      } else {
        showToastMessage(
          "Invalid credentials - no token received",
          "error",
        );
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      let errorMessage =
        "Login failed. Please check your credentials.";

      if (typeof error === "object" && error !== null) {
        if (
          "fullError" in error &&
          typeof error.fullError === "object" &&
          error.fullError !== null &&
          "message" in error.fullError &&
          typeof error.fullError.message === "string"
        ) {
          errorMessage = error.fullError.message;
        } else if (
          "message" in error &&
          typeof error.message === "string"
        ) {
          errorMessage = error.message;
        }
      }

      const normalizedMessage =
        errorMessage.toLowerCase();

      if (
        normalizedMessage.includes("invalid credentials") ||
        normalizedMessage.includes("unauthorized") ||
        normalizedMessage.includes("401")
      ) {
        errorMessage =
          "Invalid email or password. Please enter the correct credentials.";
      }

      dispatch(setError(errorMessage));
      showToastMessage(errorMessage, "error");
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Box sx={classes.loginPage}>
      <BBLoader enabled={loading} />

      <Box sx={classes.backgroundGrid} />
      <Box sx={classes.glowOne} />
      <Box sx={classes.glowTwo} />
      <Box sx={classes.glowThree} />

      <Box sx={classes.loginShell}>
        <Box sx={classes.formSection}>
          <Box sx={classes.topBrand}>
            <Box sx={classes.logoBox}>
              <Typography component="span">
                V
              </Typography>
            </Box>

            <Box>
              <Typography sx={classes.brandName}>
                Varthagan
              </Typography>

              <Typography sx={classes.brandSubtitle}>
                Admin Workspace
              </Typography>
            </Box>
          </Box>

          <Box sx={classes.formContent}>
            <Chip
              icon={<Sparkles size={15} />}
              label="Secure admin access"
              sx={classes.accessChip}
            />

            <Typography sx={classes.heading}>
              Welcome back to your
              <Box
                component="span"
                sx={classes.headingAccent}
              >
                {" "}
                workspace
              </Box>
            </Typography>

            <Typography sx={classes.description}>
              Sign in to manage vendors, customers,
              inventory and business operations from one
              powerful dashboard.
            </Typography>

            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleSubmit: formikSubmit,
                isSubmitting,
              }) => (
                <form
                  onSubmit={formikSubmit}
                  noValidate
                  autoComplete="on"
                >
                  <Stack
                    spacing={2.2}
                    sx={classes.inputStack}
                  >
                    <BBInput
                      name="email"
                      label="Email address"
                      type="email"
                      placeholder="admin@varthagan.com"
                      autoComplete="email"
                    />

                    <BBInput
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />

                    <Box sx={classes.formActions}>
                      <Box sx={classes.securityText}>
                        <LockKeyhole size={15} />
                        Protected login
                      </Box>

                      <Typography
                        component="button"
                        type="button"
                        sx={classes.forgotPassword}
                      >
                        Forgot password?
                      </Typography>
                    </Box>

                    <Box sx={classes.submitButton}>
                      <BBButton
                        type="submit"
                        size="large"
                        variant="contained"
                        fullWidth
                        loading={isSubmitting || loading}
                        disabled={isSubmitting || loading}
                      >
                        <Box sx={classes.buttonContent}>
                          Sign in to dashboard
                          <ArrowRight size={18} />
                        </Box>
                      </BBButton>
                    </Box>
                  </Stack>
                </form>
              )}
            </Formik>

            <Box sx={classes.trustRow}>
              <Box sx={classes.trustItem}>
                <ShieldCheck size={16} />
                Encrypted session
              </Box>

              <Box sx={classes.trustDot} />

              <Box sx={classes.trustItem}>
                <CheckCircle2 size={16} />
                Role-based access
              </Box>
            </Box>
          </Box>

          <Typography sx={classes.footerText}>
            © {new Date().getFullYear()} Varthagan.
            All rights reserved.
          </Typography>
        </Box>

        <Box sx={classes.mediaSection}>
          <Box sx={classes.videoCard}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              onCanPlay={(event) => {
                event.currentTarget.muted = true;

                event.currentTarget
                  .play()
                  .catch((error) => {
                    console.error(
                      "Unable to autoplay login video:",
                      error,
                    );
                  });
              }}
              onError={(event) => {
                console.error(
                  "Video failed to load:",
                  event.currentTarget.error,
                );
              }}
            >
              <source
                src="/login.mp4"
                type="video/mp4"
              />
            </video>

            <Box sx={classes.videoOverlay} />

            <Box sx={classes.videoTopContent}>
              <Chip
                icon={<Sparkles size={14} />}
                label="Business made simple"
                sx={classes.videoChip}
              />
            </Box>

            <Box sx={classes.videoBottomContent}>
              <Typography sx={classes.videoTitle}>
                One dashboard.
                <br />
                Complete control.
              </Typography>

              <Typography sx={classes.videoDescription}>
                Track operations, manage relationships and
                make faster decisions with Varthagan.
              </Typography>

              <Stack
                direction="row"
                spacing={1.2}
                flexWrap="wrap"
                useFlexGap
              >
                <Box sx={classes.featureBadge}>
                  <CheckCircle2 size={15} />
                  Real-time insights
                </Box>

                <Box sx={classes.featureBadge}>
                  <ShieldCheck size={15} />
                  Secure by design
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box sx={classes.floatingMetric}>
            <Box sx={classes.metricIcon}>
              <Sparkles size={18} />
            </Box>

            <Box>
              <Typography sx={classes.metricValue}>
                24/7
              </Typography>

              <Typography sx={classes.metricLabel}>
                Business visibility
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}