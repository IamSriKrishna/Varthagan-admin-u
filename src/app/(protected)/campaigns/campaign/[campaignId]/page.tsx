"use client";

import { Alert, Box, Card, Grid, Stack, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import { headerBox } from "@/app/(protected)/products/product/[productId]/AddProductForm.styles";
import SliderCard from "@/components/sliders/SliderCard/SliderCard";
import SlidersForm from "@/components/sliders/SlidersForm/SlidersForm";
import { config } from "@/config";
import { campagin, slider } from "@/constants/apiConstants";
import { activeTypes, activeTypescategories } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDropdown, BBInput, BBLoader, BBTitle } from "@/lib";
import { ICampaignForm } from "@/models/ICampaignForm";
import { ISliderForm } from "@/models/ISliderForm";
import { RootState } from "@/store";
import { showToastMessage } from "@/utils/toastUtil";
import { useState } from "react";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  content: Yup.string().required("Content is required"),
  type: Yup.string().required("Type is required"),
  status: Yup.string().required("Status is required"),
  target_type: Yup.string().required("Target Type is required"),
  is_perpetual: Yup.boolean().required("Is Perpetual is required"),
  perpetual_type: Yup.string().required("Perpetual Type is required"),
  action_url: Yup.string().required("Action URL is required"),
  reward_type: Yup.string().required("Reward Type is required"),
  reward_value: Yup.number().required("Reward Value is required"),
  reward_currency: Yup.string().required("Reward Currency is required"),
  priority: Yup.number().required("Priority is required"),
});

const initialValues: ICampaignForm = {
  name: "",
  title: "",
  description: "",
  content: "",
  type: "",
  status: "",
  target_type: "",
  is_perpetual: false,
  perpetual_type: "",
  action_url: "",
  reward_type: "",
  reward_value: "",
  reward_currency: "",
  priority: "",
};
interface CampaignApiResponse {
  data: ICampaignForm;
  message: string;
}

const AddCampaign = () => {
  const router = useRouter();
  const params = useParams();
  const [openSlider, setOpenSlider] = useState<{
    open: boolean;
    type: "create" | "edit";
    data?: ISliderForm;
  }>({
    open: false,
    type: "create",
    data: undefined,
  });
  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const campaignIdRaw = params?.campaignId;

  const campaignId = Array.isArray(campaignIdRaw) ? campaignIdRaw[0] : campaignIdRaw;
  const isEdit = !!campaignId && campaignId !== "new";

  const { mutateApi: submitCampaign, loading: campaignloading } = useApi<CampaignApiResponse>(
    isEdit ? campagin.updateCampaginDetails(campaignId) : campagin.postCampaign,
    isEdit ? "PUT" : "POST",
    undefined,
    config.campaginDomain,
  );

  const {
    formattedData: campaignData,
    loading: campaignLoading,
    error: campaignError,
  } = useFetch<{ data: ICampaignForm }, ICampaignForm>({
    url: isEdit ? campagin.getCampaginDetails(campaignId) : "",
    formatter: (res) => res.data,
    options: { skip: !isEdit },
    baseUrl: config.campaginDomain,
  });

  const {
    data: results,
    loading,
    refetch,
  } = useFetch<{ data: ISliderForm[] }>({
    url: slider.getSlider(campaignId),
    baseUrl: config.campaginDomain,
  });
  const handleCampaginSubmit = async (values: ICampaignForm) => {
    const payload = {
      ...values,
      reward_value: Number(values.reward_value),
      priority: Number(values.priority),
    };
    try {
      const response = await submitCampaign(payload);
      if (response) {
        showToastMessage(response?.message || (isEdit ? "Campaign updated!" : "Campaign created!"), "success");
        setTimeout(() => router.push("/campaigns"), 100);
      } else {
        showToastMessage("Failed to save category", "error");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };

  const handleBack = () => router.back();

  return (
    <Box>
      <BBLoader enabled={authLoading || campaignLoading || loading} />
      {campaignError && <Alert severity="error">Failed to load campaign details.</Alert>}

      <Box sx={{ mb: 2 }}>
        <BBTitle
          title={isEdit ? "Edit Campaign" : "Add a New Campaign"}
          subtitle="Campaign placed across your store"
          rightContent={
            <Box sx={{ display: "flex", gap: 1 }}>
              <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                Cancel
              </BBButton>
              {isEdit && (
                <BBButton
                  type="submit"
                  variant="contained"
                  onClick={() => setOpenSlider({ open: true, type: "create" })}
                >
                  Add Slider
                </BBButton>
              )}
              <BBButton type="submit" variant="contained" form="campaign-form" loading={campaignloading}>
                {isEdit ? "Update Campaign" : "Create Campaign"}
              </BBButton>
            </Box>
          }
        />
      </Box>

      <Formik
        initialValues={isEdit && campaignData ? campaignData : initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleCampaginSubmit}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} id="campaign-form">
            <Card elevation={1} sx={{ borderRadius: "12px", p: 2 }}>
              <Stack spacing={3}>
                <Box sx={headerBox}>
                  <Typography fontWeight={500}>Campaign Information</Typography>
                </Box>
                {authError && <Alert severity="error">{authError}</Alert>}

                <Grid container spacing={3} component="div">
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="name" label="Campaign Name" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="title" label="Campaign Title" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="type"
                      label="Campaign Type"
                      options={[
                        { label: "Perpetual", value: "perpetual" },
                        { label: "Category Based", value: "category" },
                      ]}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="status" label="Status" options={activeTypes} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="target_type"
                      label="Target Type"
                      options={[
                        { label: "All", value: "all" },
                        { label: "First Time User", value: "first_time_user" },
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="is_perpetual" label="Perpetual" options={activeTypescategories} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="perpetual_type"
                      label="Perpetual Type"
                      options={[
                        { label: "First-Time User", value: "first_time_user" },
                        { label: "Category Based", value: "category" },
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="action_url" label="Action URL" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="reward_type"
                      label="Reward Type"
                      options={[
                        { label: "Coins", value: "coins" },
                        { label: "Discount", value: "discount" },
                      ]}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="reward_value" label="Reward Value" type="number" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown
                      name="reward_currency"
                      label="Reward Unit"
                      options={[
                        { label: "Coins", value: "coins" },
                        { label: "INR", value: "inr" },
                        { label: "Percent", value: "percent" },
                      ]}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="priority" label="Priority" type="number" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="description" label="Description" placeholder="Short description..." rows={4} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="content" label="Content" placeholder="Full content shown in the app..." rows={4} />
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Form>
        )}
      </Formik>
      <SliderCard
        campaignId={campaignId}
        results={{ data: results?.data ?? [] }}
        refetch={refetch}
        setOpenSlider={setOpenSlider}
      />
      {openSlider.open && (
        <SlidersForm
          campaignId={campaignId}
          openSlider={openSlider.open}
          type={openSlider.type}
          setOpenSlider={(value) => setOpenSlider({ ...openSlider, open: value })}
          initialData={openSlider.data}
          refetch={refetch}
        />
      )}
    </Box>
  );
};

export default AddCampaign;
