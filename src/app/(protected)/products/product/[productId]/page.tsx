"use client";

import VariantBuilder from "@/components/products/styleData/StyleData";
import ViewProductImagesPage from "@/components/products/viewproductimages/ViewProductImages";
import { category, products, tags } from "@/constants/apiConstants";
import { discountTypeOptions } from "@/constants/commonConstans";
import { productTypes } from "@/constants/productConstans";
import useAddProduct from "@/hooks/services/useAddProduct";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDropdown, BBInput, BBLoader, BBRichTextEditor, BBTitle } from "@/lib";
import BBMultiSelect from "@/lib/BBMultiSelect/BBMultiSelect";
import BBSwitch from "@/lib/BBSwitch/BBSwitch";
import { ICategories } from "@/models/ICategory";
import { IProduct, IProductImage } from "@/models/IProduct";
import { IProductForm } from "@/models/IProductForm";
import { ITag, ITags } from "@/models/ITags";
import { RootState } from "@/store";
import { getTabSx, tabsContainerSx } from "@/styles/tab.styles";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { headerBox } from "./AddProductForm.styles";

const validationSchema = Yup.object().shape({
  productName: Yup.string().required("Product Name is required"),
  description: Yup.string().required("Description is required"),
  subtitle: Yup.string(),
  deal_amount: Yup.number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0, "Amount must be at least 0"),
  product_discount: Yup.number().typeError("Discount must be a number").min(0, "Discount must be at least 0"),
  gst_percentage: Yup.number()
    .typeError("Gst must be a number")
    .min(0, "Gst must be at least 0")
    .max(99, "Gst cannot be more than 99"),
  type: Yup.string().oneOf(["service", "product"]).required("Type is required"),
  discount_type: Yup.string().oneOf(["percentage", "fixed"]).required("Dscount Type is required"),
  categoryId: Yup.string().required("Category is required"),
});
interface IVariant {
  sku: string;
  price: number;
  default?: boolean;
  attributes: Record<string, string>;
}

const initialValues: IProductForm = {
  productName: "",
  description: "",
  deal_amount: "",
  gst_percentage: "",
  product_discount: "",
  discount_type: "",
  max_bb_coins: "",
  type: "",
  categoryId: "",
  tagIds: [],
  images: [],
  is_combo: false,
  is_popular: false,
  list_price: "",
  has_style: false,
  is_deliverable: false,
  style_data: "",
};
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const AddProduct = () => {
  const [localTags, setLocalTags] = useState<{ label: string; value: string }[]>([]);
  const { loading: authLoading, error: authError } = useSelector((state: RootState) => state?.auth);
  const [initialVariantData, setInitialVariantData] = useState<{ variants: IVariant[] } | null>(null);
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState(0);
  const productIdRaw = params?.productId;
  const productId = Array.isArray(productIdRaw) ? productIdRaw[0] : productIdRaw;
  const isEdit = !!productId && productId !== "new";
  const { addOrUpdateProduct, loading } = useAddProduct();
  const { loading: tagLoading, formattedData: tagsData } = useFetch<ITag, { label: string; value: string }[]>({
    url: tags.getTags,
    formatter: (res) =>
      res.data.tags.map((tag) => ({
        label: tag.tag_name,
        value: tag.id,
      })),
  });

  const { loading: categoriesLoading, formattedData: categoriesData } = useFetch<
    ICategories,
    { label: string; value: string }[]
  >({
    url: category.getCategory,
    formatter: (res) =>
      res.data.categories.map((cat) => ({
        label: cat.category_name,
        value: cat.id,
      })),
  });

  const {
    formattedData: productData,
    loading: productLoading,
    error: productError,
    refetch,
  } = useFetch<{ data: IProduct }, IProductForm>({
    url: isEdit ? `${products.getProducts}/${productId}` : "",
    formatter: (res) => {
      let meta = { is_combo: false, is_popular: false };

      if (res.data.metadata) {
        try {
          meta = JSON.parse(res.data.metadata);
        } catch (err) {
          console.warn("Invalid metadata JSON:", res.data.metadata, err);
        }
      }

      return {
        productName: res.data.product_name ?? "",
        description: res.data.description ?? "",
        discount_type: res.data.discount_type ?? "",
        product_discount: res.data.product_discount ?? "",
        max_bb_coins: res.data.max_bb_coins ?? "",
        list_price: res.data.list_price ?? "",
        deal_amount: res.data.deal_amount ?? "",
        gst_percentage: res.data.gst_percentage ?? "",
        has_style: res.data.has_style ?? false,
        style_data: res.data.style_data ?? "",
        type: res.data.type ?? "",
        categoryId: res.data.category_id ?? "",
        tagIds: Array.isArray(res.data.tag_ids)
          ? res.data.tag_ids
          : typeof res.data.tag_ids === "string" && res.data.tag_ids.length > 0
            ? JSON.parse(res.data.tag_ids as string)
            : [],
        images: res.data.images ?? [],
        is_combo: meta.is_combo ?? false,
        is_popular: meta.is_popular ?? false,
        is_active: res.data.is_active ?? false,
        is_dynamic: res.data.is_dynamic ?? false,
        is_deliverable: res.data.is_deliverable ?? false,
      };
    },
    options: {
      skip: !isEdit,
    },
  });
  useEffect(() => {
    if (productData) {
      try {
        let parsedStyleData = null;
        if (typeof productData.style_data == "string" && productData.style_data.trim()) {
          parsedStyleData = JSON.parse(productData.style_data);
        } else if (typeof productData.style_data == "object" && productData.style_data !== null) {
          parsedStyleData = productData.style_data;
        }

        if (parsedStyleData && parsedStyleData.variants && Array.isArray(parsedStyleData.variants)) {
          setInitialVariantData(parsedStyleData);
        }
      } catch (err) {
        console.error("❌ Error parsing style_data:", err);
      }
    }
  }, [productData]);

  const { mutateApi: createTagApi } = useApi<ApiResponse<ITags>>(tags.postTags, "POST", undefined);

  const handleCreateTag = async (label: string, formValues?: IProductForm) => {
    const categoryId = formValues?.categoryId;

    if (!categoryId) {
      showToastMessage("Please fill the category before creating a tag.", "error");
      return Promise.reject();
    }
    try {
      const response = await createTagApi({
        tag_name: label,
        category_id: categoryId,
        description: label,
        is_active: true,
      });

      const data = response?.data;
      const newTag = {
        label: data?.tag_name ?? label,
        value: data?.id ?? `temp-${label}`,
      };

      setLocalTags((prev) => [...prev, newTag]);
      showToastMessage(response?.message || "Tag Created", "success");

      return newTag;
    } catch {
      showToastMessage("Failed to create tag", "error");
      return Promise.reject();
    }
  };

  const handleProductSubmit = async (values: IProductForm) => {
    const submitValues = {
      ...values,
      style_data: initialVariantData ? JSON.stringify(initialVariantData) : "",
    };
    try {
      const response = await addOrUpdateProduct(submitValues, isEdit ? productId : undefined);
      if (response.success) {
        showToastMessage(response.message || (isEdit ? "Product updated!" : "Product added!"), "success");
        setTimeout(() => router.push("/products"), 100);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };
  const handleBack = () => {
    router.back();
  };
  const handleVariantSave = (data: { variants: IVariant[] }) => {
    setInitialVariantData({ variants: data.variants });
    showToastMessage("Variant data saved successfully!", "success");
  };

  return (
    <Box>
      <BBLoader enabled={authLoading || categoriesLoading || productLoading} />
      {productError && <Alert severity="error">Failed to load product details.</Alert>}
      <Formik
        initialValues={isEdit && productData ? productData : initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleProductSubmit}
      >
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <BBTitle
                title={
                  tab == 0 ? (isEdit ? "Edit Product" : "Add a New Product") : tab == 1 ? "Product Media" : "Style Data"
                }
                subtitle="Orders placed across your store"
                rightContent={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                      Cancel
                    </BBButton>
                    <BBButton
                      type="submit"
                      variant="contained"
                      // disabled={loading || (isEdit && !dirty)}
                      disabled={loading}
                      loading={loading}
                    >
                      {isEdit ? "Update Product" : "Create Product"}
                    </BBButton>
                  </Box>
                }
              />

              <Tabs
                value={tab}
                onChange={(e, newVal) => setTab(newVal)}
                sx={tabsContainerSx}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <Tab label={isEdit ? "Edit Product" : "Add Product"} sx={getTabSx(tab === 0, 0)} />

                {isEdit && <Tab label="Product Images" sx={getTabSx(tab === 1, 1)} />}
                {values.has_style && <Tab label="Style Data" sx={getTabSx(tab === (isEdit ? 2 : 1), isEdit ? 2 : 1)} />}
              </Tabs>
            </Box>
            {tab == 0 && (
              <Card
                elevation={1}
                sx={{
                  borderRadius: "8px",
                  p: 2,
                }}
              >
                <Stack spacing={3}>
                  <Box sx={headerBox}>
                    <Typography fontWeight={500}>Product Information</Typography>
                  </Box>
                  {authError && <Alert severity="error">{authError}</Alert>}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Enable <strong>Has Style</strong> to manage style variants.
                  </Alert>
                  <Grid container spacing={3} component="div">
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="productName" label="Product Name" disabled={authLoading} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBDropdown name="categoryId" label="Category" options={categoriesData || []} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="list_price" label="List Amount" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="deal_amount" label="Deal Amount" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="gst_percentage" label="GST" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_discount" label="Discount" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBDropdown name="discount_type" label="Discount Type" options={discountTypeOptions || []} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBMultiSelect
                        name="tagIds"
                        label="Tags"
                        options={[...(tagsData || []), ...localTags]}
                        loading={tagLoading}
                        onCreate={(label) => handleCreateTag(label, values)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBDropdown name="type" label="Type" options={productTypes} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="max_bb_coins" label="BB Coins" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_combo" label="Combo" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_popular" label="Popular" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_active" label="Status" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="has_style" label="Has Style" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_dynamic" label="Is Dynamic" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="is_deliverable" label="Is Deliverable" />
                    </Grid>

                    <Grid size={{ xs: 12 }} component="div">
                      <BBRichTextEditor
                        name="description"
                        label="Description"
                        placeholder="Enter detailed description..."
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            )}
            {tab == 1 && isEdit && (
              <ViewProductImagesPage
                productId={productId}
                productImages={(productData?.images as IProductImage[]) ?? []}
                refetch={refetch}
              />
            )}

            {tab === (isEdit ? 2 : 1) && values.has_style && (
              <VariantBuilder initialData={initialVariantData || undefined} onSave={handleVariantSave} />
            )}
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProduct;
