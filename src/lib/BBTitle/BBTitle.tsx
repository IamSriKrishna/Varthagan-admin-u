"use client";

import { Box, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

interface BBTitleProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  rightContent?: ReactNode;
}

const BBTitle = ({ title, subtitle, rightContent }: BBTitleProps) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ mb: 3 }}
      direction="row"
    >
      <Grid size={{ xs: 12, sm: 6 }} component="div">
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Decorative accent bar */}
          <Box
            sx={{
              width: 4,
              minHeight: subtitle ? 44 : 32,
              borderRadius: "4px",
              background: "linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)",
              flexShrink: 0,
              mt: 0.3,
            }}
          />
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {title || ""}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.4,
                  fontWeight: 400,
                  fontSize: "0.8rem",
                  letterSpacing: "0.01em",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Grid>

      {rightContent && (
        <Grid size={{ xs: 12, sm: 6 }} component="div">
          <Grid container justifyContent="flex-end">
            {rightContent}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default BBTitle;