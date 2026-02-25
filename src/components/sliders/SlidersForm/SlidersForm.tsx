"use client";

import useSliderMutation from "@/hooks/services/useAddSliders";
import { BBDialog, BBInput } from "@/lib";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { ISliderForm } from "@/models/ISliderForm";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Grid } from "@mui/material";
import { Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import * as Yup from "yup";
import SlidersImageUpload from "../SlidersImageUpload/SlidersImageUpload";

const initialValues: ISliderForm = {
  id: "",
  name: "",
  public_url: "",
  html_text: "",
  call_back_link: "",
  order: "",
  active: "true",
};
interface SlidersFormProps {
  campaignId: string;
  openSlider: boolean;
  type: "create" | "edit";
  refetch?: () => void;
  setOpenSlider: (value: boolean) => void;
  initialData?: ISliderForm;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Campaign name is required"),
  html_text: Yup.string(),
  order: Yup.number()
    .typeError("Sort order must be a number")
    .positive("Sort order must be positive")
    .required("Sort order is required"),
  active: Yup.string().oneOf(["true", "false"]),
});
const SlidersForm: React.FC<SlidersFormProps> = ({
  campaignId,
  openSlider,
  setOpenSlider,
  type,
  initialData,
  refetch,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isEditMode = type == "edit";
  const submitSlider = useSliderMutation(campaignId);

  const handleSliderSubmit = async (values: ISliderForm) => {
    if (!isEditMode && !imageUrl) {
      showToastMessage("Please upload an image before submitting.", "error");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...values,
        order: Number(values.order),
        active: Boolean(values.active),
        public_url: imageUrl ? (imageUrl ?? "") : initialData?.public_url,
      };
      const response = await submitSlider(payload, isEditMode ? initialData?.id : undefined);

      if (response?.success) {
        showToastMessage(response.message ?? "Slider saved successfully!", "success");
        setOpenSlider(false);
        refetch?.();
      } else {
        showToastMessage(response?.message ?? "Something went wrong.", "error");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Failed to submit.", "error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={initialData || initialValues}
      enableReinitialize
      onSubmit={handleSliderSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <BBDialog
          open={openSlider}
          onClose={() => setOpenSlider(false)}
          title={isEditMode ? "Edit Slider" : "Add New Slider"}
          maxWidth="md"
          confirmText="Save"
          onConfirm={() => handleSubmit()}
          content={
            <Box>
              <Form onSubmit={handleSubmit} id="slider-form">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="name" label="Campaign Name" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6, lg: 6 }} component="div">
                    <BBInput name="call_back_link" label="Callback Link" />
                  </Grid>
                  <Grid size={{ xs: 12 }} component="div">
                    <BBInput name="html_text" label="HTML Text" rows={4} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <SlidersImageUpload
                      slider_id={campaignId}
                      loading={loading}
                      setLoading={setLoading}
                      onUploadSuccess={(data) => {
                        setImageUrl(data.public_url);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6, lg: 4 }} component="div">
                    <BBInput name="order" label="Sort Order" type="number" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }} component="div">
                    <BBSwitch name="active" label="Status" />
                  </Grid>
                </Grid>
              </Form>
            </Box>
          }
        />
      )}
    </Formik>
  );
};

export default SlidersForm;
