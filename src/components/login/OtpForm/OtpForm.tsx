// "use client";

// import { BBButton, BBOTPInput } from "@/lib";
// import BBLoginImage from "@/lib/BBLoginImage/BBLoginImage";
// import { RootState } from "@/store";
// import { setError, setLoading, setUser } from "@/store/auth/authSlice";
// import {
//   loginContainer,
//   loginFormBox,
//   loginFormContainerBox,
//   loginImageBox,
//   textForgotPassword,
//   textParagraph,
//   textTypography,
// } from "@/styles/login.styles";
// import { verifyOtp } from "@/utils/otpApi";
// import { Alert, Box, Link, Stack, Typography } from "@mui/material";
// import { Formik } from "formik";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import * as Yup from "yup";

// const validationSchema = Yup.object().shape({
//   otp: Yup.string()
//     .required("OTP is required")
//     .matches(/^\d+$/, "OTP must be numeric")
//     .length(6, "OTP must be exactly 6 digits"),
// });

// export default function OtpForm() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { loading, error } = useSelector((state: RootState) => state.auth);
//   {
//   }

//   const handleOtpSubmit = async (
//     values: { otp: string },
//     { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
//   ) => {
//     console.log(values.otp);

//     try {
//       dispatch(setLoading(true));
//       const { token, user } = await verifyOtp(values.otp);
//       dispatch(setUser({ ...user, token }));
//       router.replace("/");
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Invalid OTP. Please try again.";
//       dispatch(setError(errorMessage));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Box sx={loginContainer}>
//       <Box sx={loginFormContainerBox}>
//         <Box sx={loginFormBox}>
//           <Typography sx={textTypography} fontWeight={600} gutterBottom>
//             Two Step Verification
//           </Typography>
//           <Typography sx={textParagraph}>
//             {" "}
//             We sent a verification code to your mobile. Enter the code from the mobile in the field below. *****1234
//           </Typography>
//           <Formik initialValues={{ otp: "" }} validationSchema={validationSchema} onSubmit={handleOtpSubmit}>
//             {({ values, errors, touched, handleChange, handleSubmit: onSubmit, isSubmitting }) => (
//               <form onSubmit={onSubmit}>
//                 <Stack spacing={2}>
//                   <Typography sx={textForgotPassword}>Type your 6 digit security code</Typography>
//                   <BBOTPInput
//                     value={values.otp}
//                     onChange={(val) => {
//                       if (/^\d{0,6}$/.test(val)) {
//                         handleChange({ target: { name: "otp", value: val } });
//                       }
//                     }}
//                     disabled={loading}
//                     error={touched.otp && Boolean(errors.otp)}
//                     helperText={touched.otp ? errors.otp : ""}
//                   />
//                   {error && <Alert severity="error">{error}</Alert>}

//                   <Stack direction="column" alignItems="center" spacing={2}>
//                     <BBButton fullWidth type="submit" variant="contained" loading={isSubmitting || loading}>
//                       Verify My Account
//                     </BBButton>

//                     <Typography textAlign="center" sx={textForgotPassword}>
//                       Didn&apos;t get the mail?{" "}
//                       <Link component={Link} underline="hover" color="#634CDA">
//                         Resend
//                       </Link>
//                     </Typography>
//                   </Stack>
//                 </Stack>
//               </form>
//             )}
//           </Formik>
//         </Box>
//       </Box>
//       <Box sx={loginImageBox}>
//         <BBLoginImage />
//       </Box>
//     </Box>
//   );
// }
