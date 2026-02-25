"use client";

import { config } from "@/config";
import { campagin, campaignmanagement, slider } from "@/constants/apiConstants";
import { campaginsection } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDropdown, BBTitle } from "@/lib";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { ICampaign } from "@/models/ICampaign";
import { IHomeScreenResponse } from "@/models/IHomeScreen";
import { ISliderForm } from "@/models/ISliderForm";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Card, Grid, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import * as classes from "./Campaginmanagement.styles";
import { ImageCarouselCard } from "./ImageCarouselCard";
import { appFetch } from "@/utils/fetchInterceptor";

interface CampaginMangementResponse {
  home_carousel: { campaign_id: string; is_active: boolean };
  refer_a_friend: { campaign_id: string; is_active: boolean };
  special_offer: { campaign_id: string; is_active: boolean };
}
type SectionKey = keyof CampaginMangementResponse;

const initialValues: CampaginMangementResponse = {
  home_carousel: { campaign_id: "", is_active: true },
  refer_a_friend: { campaign_id: "", is_active: true },
  special_offer: { campaign_id: "", is_active: true },
};

const validationSchema = Yup.object().shape({
  home_carousel: Yup.object({ campaign_id: Yup.string().required("Required") }),
  refer_a_friend: Yup.object({ campaign_id: Yup.string().required("Required") }),
  special_offer: Yup.object({ campaign_id: Yup.string().required("Required") }),
});

const Campaignmanagement = () => {
  const [formValues, setFormValues] = useState(initialValues);
  const { data: results } = useFetch<{ campaigns: ICampaign[] }>({
    url: campagin.getCampagin,
    baseUrl: config.campaginDomain,
  });

  const { data: homeConfigResponse } = useFetch<IHomeScreenResponse>({
    url: campaignmanagement.getCampaignManagement,
    baseUrl: config.campaginDomain,
  });

  const homeConfigData = homeConfigResponse?.data;

  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [slidersData, setSlidersData] = useState<Record<string, ISliderForm[]>>({
    home_carousel: [],
    refer_a_friend: [],
    special_offer: [],
  });

  useEffect(() => {
    if (homeConfigData) {
      setFormInitialValues({
        home_carousel: {
          campaign_id: homeConfigData.home_carousel?.campaign_id ?? "",
          is_active: homeConfigData.home_carousel?.is_active ?? true,
        },
        refer_a_friend: {
          campaign_id: homeConfigData.refer_a_friend?.campaign_id ?? "",
          is_active: homeConfigData.refer_a_friend?.is_active ?? true,
        },
        special_offer: {
          campaign_id: homeConfigData.special_offer?.campaign_id ?? "",
          is_active: homeConfigData.special_offer?.is_active ?? true,
        },
      });
    }
  }, [homeConfigData]);

  useEffect(() => {
    (campaginsection as SectionKey[]).forEach((sectionKey) => {
      const campaignId = formValues[sectionKey]?.campaign_id;
      fetchSliders(sectionKey, campaignId);
    });
  }, [formValues]);

  const fetchSliders = async (sectionKey: string, campaignId: string) => {
    if (!campaignId) {
      setSlidersData((prev) => ({ ...prev, [sectionKey]: [] }));
      return;
    }
    try {
      const res = await appFetch(`${config.campaginDomain}${slider.getSlider(campaignId)}`);
      const json = await res.json();
      setSlidersData((prev) => ({ ...prev, [sectionKey]: json.data || [] }));
    } catch (err) {
      console.error(`Failed to fetch sliders for ${sectionKey}`, err);
      setSlidersData((prev) => ({ ...prev, [sectionKey]: [] }));
    }
  };

  const { mutateApi: submitCampaginManagement, loading: loadingcampaginmangemnt } = useApi<CampaginMangementResponse>(
    campaignmanagement.postCampaignManagement,
    "POST",
    undefined,
    config.campaginDomain,
  );

  const campaignOptions =
    results?.campaigns?.map((c) => ({
      label: c.name,
      value: c.id,
    })) || [];

  const handleCategorySubmit = async (values: CampaginMangementResponse) => {
    try {
      const res = await submitCampaginManagement(values);
      showToastMessage(res ? "Category saved successfully" : "Failed to save category", res ? "success" : "error");
    } catch (e) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  return (
    <>
      <BBTitle
        title=""
        rightContent={
          <Box sx={{ display: "flex", gap: 1 }}>
            <BBButton
              type="submit"
              variant="contained"
              form="campaign-management-form"
              loading={loadingcampaginmangemnt}
            >
              Save
            </BBButton>
          </Box>
        }
      />
      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleCategorySubmit}
        enableReinitialize
      >
        {({ handleSubmit, values }) => {
          setFormValues(values);
          return (
            <Form onSubmit={handleSubmit} id="campaign-management-form">
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Grid container spacing={3}>
                  {campaginsection.map((sectionKey) => {
                    const sectionLabel = sectionKey.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

                    return (
                      <>
                        <Grid size={{ xs: 12, md: 4 }} component="div" key={sectionKey}>
                          <Box sx={classes.mainContainerBox}>
                            <Box sx={{ ...classes.TitleBox, justifyContent: "space-between" }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {sectionLabel}
                              </Typography>
                              <Box sx={{ ...classes.TitleBox, justifyContent: "end" }}>
                                <BBSwitch name={`${sectionKey}.is_active`} label="" />
                              </Box>
                            </Box>

                            <BBDropdown name={`${sectionKey}.campaign_id`} label="" options={campaignOptions} />
                          </Box>{" "}
                        </Grid>
                      </>
                    );
                  })}
                  {campaginsection.map((sectionKey) => {
                    const sliders = slidersData[sectionKey] || [];

                    return (
                      <>
                        <Grid size={{ xs: 12, md: 4 }} component="div" key={sectionKey}>
                          {sliders.length > 0 && (
                            <Card>
                              <ImageCarouselCard
                                images={sliders.map((slide) => ({
                                  image_url: slide.public_url,
                                  name: slide.name,
                                  call_back_link: slide.call_back_link,
                                  html_text: slide.html_text,
                                }))}
                                width="100%"
                              />
                            </Card>
                          )}
                        </Grid>
                      </>
                    );
                  })}
                </Grid>
              </Card>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default Campaignmanagement;
