"use client";

import userlogo from "@/assets/images/user-logo.png";
import { config } from "@/config";
import { usermangement } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { BBButton, BBInput, BBTitle } from "@/lib";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import { Avatar, Box, Card, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { Form, Formik, FormikHelpers } from "formik";
import { BadgeCheck, Lock, Mail, Shield, User, UserCog } from "lucide-react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import * as classes from "./ProfilePage.styles";

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordChangeResponse {
  success: boolean;
  message?: string;
}

const passwordValidationSchema = Yup.object({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
    .required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const { mutateApi: changePassword } = useApi<PasswordChangeResponse>(
    usermangement.changePassword,
    "POST",
    undefined,
    config.loginDomain,
  );

  const handlePasswordChange = async (values: PasswordFormValues, formikHelpers: FormikHelpers<PasswordFormValues>) => {
    const { resetForm } = formikHelpers;
    try {
      const res = await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });

      if (res?.success) {
        showToastMessage(res.message || "Password changed successfully", "success");
        resetForm();
      } else {
        showToastMessage(res?.message || "Failed to change password", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "default" as const };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: "Weak", color: "error" as const },
      { strength: 2, label: "Fair", color: "warning" as const },
      { strength: 3, label: "Good", color: "info" as const },
      { strength: 4, label: "Strong", color: "success" as const },
    ];

    return levels[strength - 1] || { strength: 0, label: "", color: "default" as const };
  };

  const profileInfoItems = [
    {
      icon: <User size={20} />,
      label: "USERNAME",
      value: user?.username || "Not provided",
    },
    {
      icon: <Mail size={20} />,
      label: "EMAIL ADDRESS",
      value: user?.email || "Not provided",
    },
    {
      icon: <UserCog size={20} />,
      label: "ROLE",
      value: user?.role || "Not provided",
    },
    {
      icon: <BadgeCheck size={20} />,
      label: "STATUS",
      value: user?.status === "active" ? "Active" : "Inactive",
    },
  ];

  const passwordRequirements = (password: string) => [
    { test: password.length >= 8, label: "At least 8 characters" },
    {
      test: /[A-Z]/.test(password) && /[a-z]/.test(password),
      label: "Upper and lowercase letters",
    },
    { test: /\d/.test(password), label: "At least one number" },
    { test: /[@$!%*?&#]/.test(password), label: "At least one special character" },
  ];

  return (
    <Box>
      <BBTitle title="Account Settings" />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card elevation={3} sx={classes.profileCard}>
            <Stack direction="column" alignItems="center" spacing={2} sx={classes.profileHeaderStack}>
              <Box sx={classes.avatarContainer}>
                <Avatar src={userlogo.src} alt="Profile" sx={classes.profileAvatar} />
                <Box sx={classes.onlineStatusBadge} />
              </Box>

              <Box sx={classes.profileTextCenter}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {user?.username || "User Name"}
                </Typography>
                <Chip icon={<Shield size={16} />} label={user?.role || "Admin"} color="primary" sx={classes.roleChip} />
              </Box>
            </Stack>

            <Stack spacing={2.5}>
              {profileInfoItems.map((item, idx) => (
                <Paper key={idx} elevation={0} sx={classes.profileInfoPaper}>
                  <Box sx={classes.profileInfoBox}>
                    <Box sx={classes.profileIconBox}>{item.icon}</Box>
                    <Box sx={classes.profileInfoTextBox}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={classes.profileInfoLabel}
                      >
                        {item.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600} noWrap sx={classes.profileInfoValue}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card elevation={3} sx={classes.passwordCard}>
            <Box sx={classes.passwordHeaderBox}>
              <Box sx={classes.passwordHeaderInner}>
                <Box sx={classes.passwordIconBox}>
                  <Lock size={24} />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  Change Password
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={classes.passwordHeaderDescription}>
                Ensure your account is using a strong password to stay secure
              </Typography>
            </Box>

            <Formik
              initialValues={{
                current_password: "",
                new_password: "",
                confirm_password: "",
              }}
              validationSchema={passwordValidationSchema}
              onSubmit={handlePasswordChange}
            >
              {({ values, handleSubmit, isSubmitting }) => {
                const strength = getPasswordStrength(values.new_password);

                return (
                  <Form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <BBInput name="current_password" label="Current Password" type="password" fullWidth />

                      <Box>
                        <BBInput name="new_password" label="New Password" type="password" fullWidth />

                        {values.new_password && (
                          <Box sx={classes.strengthIndicatorBox}>
                            <Box sx={classes.strengthBarsBox}>
                              {[1, 2, 3, 4].map((level) => (
                                <Box key={level} sx={classes.strengthBar(level, strength.strength, strength.color)} />
                              ))}
                            </Box>
                            <Typography variant="caption" fontWeight={600} color={`${strength.color}.main`}>
                              Password strength: {strength.label}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <BBInput name="confirm_password" label="Confirm New Password" type="password" fullWidth />

                      <Paper elevation={0} sx={classes.requirementsPaper}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                          sx={classes.requirementsTitle}
                        >
                          Password must contain:
                        </Typography>
                        <Stack spacing={0.75}>
                          {passwordRequirements(values.new_password).map((req, idx) => (
                            <Box key={idx} sx={classes.requirementBox}>
                              <Box sx={classes.requirementCheckbox(req.test)}>
                                {req.test && <Box sx={classes.requirementCheckboxInner} />}
                              </Box>
                              <Typography variant="caption" fontWeight={500} sx={classes.requirementText(req.test)}>
                                {req.label}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>

                      <BBButton type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Password"}
                      </BBButton>
                    </Stack>
                  </Form>
                );
              }}
            </Formik>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
