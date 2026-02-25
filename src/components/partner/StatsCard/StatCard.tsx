import React from "react";
import { Paper, Box, Typography, Chip } from "@mui/material";
import { TrendingUp } from "lucide-react";
import * as classes from "./statCardStyles";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgGradient: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bgGradient, trend }) => (
  <Paper elevation={0} sx={classes.statCardRoot(color, bgGradient)}>
    {/* Top Row: Icon & Trend */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Box sx={classes.statCardIconBox(color)}>
        <Icon size={28} style={{ color }} strokeWidth={2.5} />
      </Box>
      {trend && <Chip icon={<TrendingUp size={14} />} label={trend} size="small" sx={classes.statCardTrend} />}
    </Box>

    {/* Bottom Row: Label & Value */}
    <Box>
      <Typography variant="body2" sx={classes.statCardLabel}>
        {label}
      </Typography>
      <Typography variant="h4" sx={classes.statCardValue(color)}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

export default StatCard;
