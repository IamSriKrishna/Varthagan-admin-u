import React from "react";
import { Card, Box, Typography, CardContent } from "@mui/material";
import * as classes from "./sectionCardStyles";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  gradient: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon: Icon, title, gradient, children }) => (
  <Card sx={classes.sectionCardRoot}>
    <Box sx={classes.sectionCardHeader(gradient)}>
      <Box sx={classes.sectionCardIconBox}>
        <Icon size={24} style={{ color: "#6366f1" }} strokeWidth={2.5} />
      </Box>
      <Typography variant="h6" sx={classes.sectionCardTitle}>
        {title}
      </Typography>
    </Box>
    <CardContent sx={classes.sectionCardContent}>{children}</CardContent>
  </Card>
);

export default SectionCard;
