"use client";

import { BBButton } from "@/lib";
import { Box, Card, Typography } from "@mui/material";
import { TriangleAlert } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        bgcolor: "grey.100",
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: { xs: 3, sm: 4 },
          bgcolor: "white",
          borderRight: {
            xs: "none",
            md: "1px solid #e0e0e0",
          },
          borderBottom: {
            xs: "1px solid #e0e0e0",
            md: "none",
          },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box sx={{ color: "error.main", mb: 2 }}>
          <TriangleAlert size={48} />
        </Box>

        <Typography variant="h5" fontWeight={600} mb={1}>
          Something Went Wrong
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "warning.main",
            mb: 2,
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          Route: {pathname}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 3,
            maxWidth: 360,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            whiteSpace: "normal",
            textAlign: "center",
          }}
        >
          {error?.message || "An unexpected error occurred."}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <BBButton variant="contained" color="primary" fullWidth onClick={() => reset()}>
            Try Again
          </BBButton>

          <BBButton variant="outlined" color="inherit" fullWidth onClick={() => window.location.reload()}>
            Reload
          </BBButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          bgcolor: "grey.900",
          color: "success.light",
          overflowY: "auto",
          maxHeight: { xs: "40vh", md: "100vh" },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="white" mb={2}>
          Error Stack (Development)
        </Typography>

        <Card
          elevation={2}
          sx={{
            bgcolor: "grey.950",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box
            component="pre"
            sx={{
              fontFamily: "Consolas, monospace",
              fontSize: "0.85rem",
              m: 0,
              whiteSpace: "pre-wrap",
              color: "#4ade80",
              maxHeight: "100%",
              overflowX: "auto",
            }}
          >
            {error?.stack || "No stack trace available."}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
