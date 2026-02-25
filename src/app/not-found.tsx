"use client";

import { BBButton } from "@/lib";
import { Box, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { keyframes } from "@mui/system";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

// Fade in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
        px={2}
        position="relative"
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
            filter: "blur(40px)",
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(239, 68, 68, 0.1))",
            filter: "blur(40px)",
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: "1s",
          }}
        />

        {/* Main content */}
        <Box
          sx={{
            animation: `${fadeIn} 0.8s ease-out`,
            zIndex: 1,
          }}
        >
          {/* 404 Number with gradient */}
          <Typography
            sx={{
              fontSize: { xs: "6rem", sm: "8rem", md: "10rem" },
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              mb: 2,
              animation: `${float} 4s ease-in-out infinite`,
            }}
          >
            404
          </Typography>

          {/* Title */}
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
              animation: `${fadeIn} 0.8s ease-out 0.2s backwards`,
            }}
          >
            Oops! Page Not Found
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: "500px",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              lineHeight: 1.8,
              animation: `${fadeIn} 0.8s ease-out 0.4s backwards`,
            }}
          >
            Looks like you've ventured into uncharted territory. The page you're searching for seems to have wandered
            off into the digital wilderness.
          </Typography>

          {/* Action buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              animation: `${fadeIn} 0.8s ease-out 0.6s backwards`,
            }}
          >
            <BBButton
              variant="contained"
              onClick={() => router.push("/")}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px 0 rgba(99, 102, 241, 0.5)",
                },
              }}
            >
              Go to Dashboard
            </BBButton>
            <BBButton
              variant="outlined"
              onClick={() => router.back()}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                borderWidth: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderWidth: 2,
                  transform: "translateY(-2px)",
                },
              }}
            >
              Go Back
            </BBButton>
          </Box>
        </Box>

        {/* Bottom decorative text */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            position: "absolute",
            bottom: 20,
            animation: `${fadeIn} 0.8s ease-out 0.8s backwards`,
          }}
        >
          Error Code: 404
        </Typography>
      </Box>
    </Container>
  );
}
