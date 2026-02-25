"use client";

import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";
import * as classes from "./BBTitle.styles";
interface BBTitleProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  rightContent?: ReactNode;
}

const BBTitle = ({ title, subtitle, rightContent }: BBTitleProps) => {
  return (
    <Grid container justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }} direction="row">
      <Grid size={{ xs: 12, sm: 6 }} component="div">
        <Grid container alignItems="center" justifyContent="flex-start" spacing={1}>
          <Grid component="div">
            <Typography variant="h5" sx={classes.titleTextSx}>
              {title || ""}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            )}
          </Grid>
        </Grid>
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
