"use client";
import Campaignmanagement from "@/components/Campaignmanagement/Campaignmanagement";
import { getTabSx, tabsContainerSx } from "@/styles/tab.styles";
import { Tab, Tabs, Box } from "@mui/material";
import { useState } from "react";

const Page = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(e, newVal) => setTab(newVal)}
        sx={tabsContainerSx}
        slotProps={{
          indicator: { style: { display: "none" } },
        }}
      >
        <Tab label="Home screen" sx={getTabSx(tab === 0, 0)} />
        <Tab label="Category screen" sx={getTabSx(tab === 1, 1)} />
      </Tabs>

      <Box sx={{ mt: 2 }}>{tab == 0 && <Campaignmanagement />}</Box>
      <Box sx={{ mt: 2 }}>{tab == 1 && <Campaignmanagement />}</Box>
    </Box>
  );
};

export default Page;
