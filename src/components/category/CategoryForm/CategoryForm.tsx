"use client";
import * as classes from "@/app/(protected)/categories/category/[categoryId]/CategoryForm.styles";
import { category } from "@/constants/apiConstants";
import { bbEnabled } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDropdown, BBInput, BBLoader, BBRichTextEditor, BBTitle } from "@/lib";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { ICategory, ICategoryImage } from "@/models/ICategory";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, Divider, FormLabel, Grid, Paper, Stack, Typography } from "@mui/material";
import { Form, Formik, FormikHelpers } from "formik";
import { ArrowLeft, ImageIcon, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import CategoryImageUpload from "../CategoryImageUpload/CategoryImageUpload";
import ViewCategoryImages from "../ViewCategoryImages/ViewCategoryImages";

interface ICategoryFormProps {
  onSuccess?: () => void;
  setOpen?: (val: boolean) => void;
}

type CategoryFormProps = ICategoryFormProps;
type ImageItem = {
  image_type: "image" | "icon";
};

interface CategoryResponse {
  category_name: string;
  description: string;
  is_active: boolean | string;
  is_bb_coins_enabled: boolean | string;
  images: unknown[];
}

const validationSchema = Yup.object().shape({
  category_name: Yup.string().required("Category name is required"),
  description: Yup.string().required("Description is required"),
  is_active: Yup.boolean().required("Status is required"),
  is_bb_coins_enabled: Yup.mixed()
    .oneOf(["true", "false"], "Coin Enabled is required")
    .required("Coin Enabled is required"),
});

const defaultValues: CategoryResponse = {
  category_name: "",
  description: "",
  is_active: false,
  is_bb_coins_enabled: "",
  images: [],
};

function CategoryForm(props: CategoryFormProps) {
  const router = useRouter();
  const params = useParams();
  const categoryIdRaw = params?.categoryId;
  const categoryId = Array.isArray(categoryIdRaw) ? categoryIdRaw[0] : categoryIdRaw;
  const isEdit = !!categoryId && categoryId !== "new";
  const { mutateApi: submitCategory, loading: loadingcategorry } = useApi<CategoryResponse>(
    categoryId ? `${category.postCategory}/${categoryId}` : category.postCategory,
    categoryId ? "PUT" : "POST",
  );
  const {
    formattedData: categoryData,
    loading: categoryLoading,
    error: categoryError,
    refetch,
  } = useFetch<{ data: ICategory }, CategoryResponse>({
    url: isEdit ? `${category.getCategory}/${categoryId}` : "",
    formatter: (res) => ({
      category_name: res.data.category_name ?? "",
      description: res.data.description ?? "",
      is_active: Boolean(res.data.is_active) ?? "",
      is_bb_coins_enabled: String(res.data.is_bb_coins_enabled) ?? "",
      images: res.data.images ?? [],
    }),
    options: {
      skip: !isEdit,
    },
  });

  const images = Array.isArray(categoryData?.images) ? (categoryData.images as ImageItem[]) : [];

  const hasPrimaryImage = images.some((img) => img.image_type === "image");
  const hasPrimaryIcon = images.some((img) => img.image_type === "icon");

  const handleCategorySubmit = async (values: CategoryResponse, formikHelpers: FormikHelpers<CategoryResponse>) => {
    try {
      const payload = {
        ...values,
        is_active: values.is_active == true || values.is_active == "true",
        is_bb_coins_enabled: values.is_bb_coins_enabled === true || values.is_bb_coins_enabled === "true",
      };
      const res = await submitCategory(payload);
      if (res) {
        showToastMessage("Category saved successfully", "success");
        if (props.onSuccess) {
          props.onSuccess();
        }
        formikHelpers.resetForm();
        if (isEdit) {
          router.push("/categories");
        } else if (props.setOpen) {
          props.setOpen(false);
        }
      } else {
        showToastMessage("Failed to save category", "error");
      }
    } catch (e) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    } finally {
    }
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <>
      <BBLoader enabled={categoryLoading} />
      {categoryError && <Alert severity="error">Failed to load category details.</Alert>}

      <Formik
        initialValues={isEdit && categoryData ? categoryData : defaultValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleCategorySubmit}
      >
        {({ handleSubmit, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              {isEdit && (
                <BBTitle
                  title="Edit Category"
                  subtitle="Update category details across your store"
                  rightContent={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                        Cancel
                      </BBButton>
                      <BBButton
                        type="submit"
                        variant="contained"
                        loading={loadingcategorry}
                        disabled={loadingcategorry || (isEdit && !dirty)}
                      >
                        Update Category
                      </BBButton>
                    </Box>
                  }
                />
              )}
            </Box>
            <Card elevation={0} sx={classes.mainCard}>
              <Box sx={classes.formSection}>
                <Typography sx={classes.sectionHeader}>
                  <Sparkles className="w-5 h-5" style={{ color: "#3b82f6" }} />
                  Basic Information
                </Typography>

                <Grid container spacing={3} component="div">
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBInput name="category_name" label="Category Name" fullWidth />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <BBDropdown name="is_bb_coins_enabled" label="Coin Enabled" options={bbEnabled || []} />
                  </Grid>
                </Grid>

                {isEdit && (
                  <>
                    <Divider sx={classes.divider} />
                    <Typography sx={{ ...classes.sectionHeader, mb: 3 }}>
                      <ImageIcon className="w-5 h-5" style={{ color: "#3b82f6" }} />
                      Media Assets
                    </Typography>

                    <Grid container spacing={3} component="div">
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <FormLabel sx={classes.uploadLabel}>Primary Image</FormLabel>
                        <Box sx={hasPrimaryImage ? classes.imageSectionFilled : classes.imageSection}>
                          {hasPrimaryImage ? (
                            <ViewCategoryImages
                              categoryImages={categoryData?.images as ICategoryImage[]}
                              refetch={refetch}
                              type="image"
                            />
                          ) : (
                            <>
                              <CategoryImageUpload category_id={categoryId} accept="image/*" type="image" />
                              <Typography sx={classes.helperText}>Upload a high-quality image (JPG, PNG)</Typography>
                            </>
                          )}
                        </Box>
                      </Grid>

                      {/* Primary Icon */}
                      <Grid size={{ xs: 12, md: 6 }} component="div">
                        <FormLabel sx={classes.uploadLabel}>Primary Icon</FormLabel>
                        <Box sx={hasPrimaryIcon ? classes.imageSectionFilled : classes.imageSection}>
                          {hasPrimaryIcon ? (
                            <ViewCategoryImages
                              categoryImages={categoryData?.images as ICategoryImage[]}
                              refetch={refetch}
                              type="icon"
                            />
                          ) : (
                            <>
                              <CategoryImageUpload category_id={categoryId} accept="image/svg+xml" type="icon" />
                              <Typography sx={classes.helperText}>Upload an icon (SVG format recommended)</Typography>
                            </>
                          )}
                        </Box>
                      </Grid>

                      {/* Status Switch */}
                      <Grid size={{ xs: 12 }} component="div">
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: "8px",
                            backgroundColor: "#f9fafb",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <BBSwitch name="is_active" label="Status" />
                          <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5, ml: 5 }}>
                            Enable or disable this category for customers
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                )}
                <Divider sx={classes.divider} />
                <Box sx={{ mt: 2 }}>
                  <BBRichTextEditor
                    name="description"
                    label="Description"
                    placeholder="Enter detailed description about this category..."
                  />
                </Box>
              </Box>

              {!isEdit && (
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    backgroundColor: "#f9fafb",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="end"
                    alignItems="center"
                    spacing={{ xs: 1, sm: 1.5 }}
                  >
                    <BBButton
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        if (props.setOpen) props.setOpen(false);
                      }}
                      sx={{
                        borderColor: "#e5e7eb",
                        color: "#374151",
                        "&:hover": {
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                        },
                      }}
                    >
                      Cancel
                    </BBButton>
                    <BBButton type="submit" variant="contained" loading={loadingcategorry}>
                      Create Category
                    </BBButton>
                  </Stack>
                </Box>
              )}
            </Card>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default CategoryForm;
