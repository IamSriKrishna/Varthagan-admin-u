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
import { IProducts } from "@/models/IProduct";
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
  name: Yup.string().required("Product Name is required"),
  product_details: Yup.object().shape({
    description: Yup.string().required("Description is required"),
    unit: Yup.string().required("Unit is required"),
    base_sku: Yup.string(),
    upc: Yup.string(),
    ean: Yup.string(),
    mpn: Yup.string(),
    isbn: Yup.string(),
  }),
  sales_info: Yup.object().shape({
    selling_price: Yup.number()
      .typeError("Selling Price must be a number")
      .required("Selling Price is required")
      .min(0, "Price must be at least 0"),
    currency: Yup.string(),
    account: Yup.string(),
  }),
  purchase_info: Yup.object().shape({
    cost_price: Yup.number()
      .typeError("Cost Price must be a number")
      .min(0, "Cost Price must be at least 0"),
  }),
  inventory: Yup.object().shape({
    track_inventory: Yup.boolean(),
    reorder_point: Yup.number().min(0),
  }),
});
interface IVariant {
  sku: string;
  price: number;
  default?: boolean;
  attributes: Record<string, string>;
}

// Helper function to convert IProductVariant to IVariant for the UI
const convertProductVariantToUIVariant = (pv: any): IVariant => ({
  sku: pv.sku || "",
  price: pv.selling_price || 0,
  default: false,
  attributes: pv.attribute_map || {},
});

// Helper function to convert IVariant from UI to IProductVariant for API
const convertUIVariantToProductVariant = (v: IVariant): any => ({
  sku: v.sku,
  variant_name: v.sku,
  selling_price: v.price,
  cost_price: v.price * 0.5, // Default cost at 50% of selling price
  stock_quantity: 0,
  attribute_map: v.attributes,
  is_active: true,
});

const initialValues: IProductForm = {
  name: "",
  product_details: {
    unit: "",
    description: "",
    base_sku: "",
    upc: "",
    ean: "",
    mpn: "",
    isbn: "",
    variants: [],
    attribute_definitions: [],
  },
  sales_info: {
    selling_price: 0,
    currency: "INR",
    account: "",
    description: "",
  },
  purchase_info: {
    cost_price: 0,
    currency: "INR",
    account: "",
    description: "",
  },
  inventory: {
    track_inventory: false,
    inventory_account: "",
    reorder_point: 0,
  },
  return_policy: {
    returnable: false,
  },
  has_style: false,
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
    formatter: (res) => {
      // Handle both response structures
      const data = res?.data || (res as any);
      
      if (!data || !Array.isArray(data.categories)) {
        return [];
      }
      return data.categories.map((cat) => ({
        label: cat.category_name,
        value: cat.id,
      }));
    },
  });

  const {
    formattedData: productData,
    loading: productLoading,
    error: productError,
    refetch,
  } = useFetch<{ data: any }, IProductForm>({
    url: isEdit ? `${products.getProducts}/${productId}` : "",
    formatter: (res) => {
      // Handle both response structures: { data: IProduct } or IProduct directly
      const product = res?.data || (res as any);

      if (!product) {
        return initialValues;
      }

      // Map old API structure to new form structure
      return {
        name: product.product_name ?? product.name ?? "",
        product_details: {
          unit: product.unit ?? product.type ?? "piece",
          description: product.description ?? "",
          base_sku: product.base_sku ?? product.sku ?? product.id ?? "",
          upc: product.upc ?? "",
          ean: product.ean ?? "",
          mpn: product.mpn ?? "",
          isbn: product.isbn ?? "",
          manufacturer_id: product.manufacturer_id,
          variants: product.variants ?? product.product_details?.variants ?? [],
          attribute_definitions: product.attribute_definitions ?? product.product_details?.attribute_definitions ?? [],
        },
        sales_info: {
          account: product.sales_info?.account ?? product.account ?? "",
          // Use the new structure first, fall back to old fields
          selling_price: product.sales_info?.selling_price ?? product.list_price ?? product.deal_amount ?? 0,
          currency: product.sales_info?.currency ?? product.currency ?? "INR",
          description: product.sales_info?.description ?? product.description ?? "",
        },
        purchase_info: {
          account: product.purchase_info?.account ?? "",
          // Try new structure first, then old fields
          cost_price: product.purchase_info?.cost_price ?? product.cost_price ?? 0,
          currency: product.purchase_info?.currency ?? product.currency ?? "INR",
          preferred_vendor_id: product.purchase_info?.preferred_vendor_id ?? product.preferred_vendor_id,
          description: product.purchase_info?.description ?? "",
        },
        inventory: {
          track_inventory: product.inventory?.track_inventory ?? product.track_inventory ?? false,
          inventory_account: product.inventory?.inventory_account ?? product.inventory_account ?? "",
          inventory_valuation_method: product.inventory?.inventory_valuation_method ?? product.inventory_valuation_method ?? "",
          reorder_point: product.inventory?.reorder_point ?? product.reorder_point ?? 0,
        },
        return_policy: {
          returnable: product.return_policy?.returnable ?? product.returnable ?? false,
        },
        has_style: (product.has_style ?? false) || (Array.isArray(product.product_details?.variants) && product.product_details.variants.length > 0) || (Array.isArray(product.variants) && product.variants.length > 0),
      } as IProductForm;
    },
    options: {
      skip: !isEdit,
    },
  });
  useEffect(() => {
    if (productData?.product_details?.variants && Array.isArray(productData.product_details.variants)) {
      const convertedVariants = productData.product_details.variants.map(convertProductVariantToUIVariant);
      setInitialVariantData({
        variants: convertedVariants,
      });
    }
  }, [productData]);

  const { mutateApi: createTagApi } = useApi<ApiResponse<ITags>>(tags.postTags, "POST", undefined);

  const handleCreateTag = async (label: string, formValues?: IProductForm) => {
    // CategoryId is no longer in the new structure
    // For now, skip tag creation or implement category-less tag creation
    showToastMessage("Tag creation workflow needs to be updated for new structure", "info");
    return Promise.reject();
  };

  const handleProductSubmit = async (values: IProductForm) => {
    try {
      // If we have variant data from the VariantBuilder, convert and include it
      let submitValues = values;
      if (initialVariantData?.variants && initialVariantData.variants.length > 0) {
        submitValues = {
          ...values,
          product_details: {
            ...values.product_details,
            variants: initialVariantData.variants.map(convertUIVariantToProductVariant),
          },
        };
      }

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
      <BBLoader enabled={authLoading || categoriesLoading || (isEdit && productLoading)} />
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
                subtitle={isEdit ? `Editing product ${productId}` : "Create a new product"}
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
                      <BBInput name="name" label="Product Name" disabled={authLoading} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.unit" label="Unit" placeholder="e.g., piece, kg, liter" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.base_sku" label="Base SKU" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="sales_info.selling_price" label="Selling Price" type="number" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="purchase_info.cost_price" label="Cost Price" type="number" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.upc" label="UPC" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.ean" label="EAN" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.mpn" label="MPN" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="product_details.isbn" label="ISBN" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="sales_info.currency" label="Currency" placeholder="INR" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="sales_info.account" label="Sales Account" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="purchase_info.currency" label="Purchase Currency" placeholder="INR" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="purchase_info.account" label="Purchase Account" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="inventory.inventory_account" label="Inventory Account" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="inventory.inventory_valuation_method" label="Valuation Method" placeholder="e.g., FIFO, LIFO, Weighted Average" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} component="div">
                      <BBInput name="inventory.reorder_point" label="Reorder Point" type="number" />
                    </Grid>

                    <Grid size={{ xs: 12 }} component="div">
                      <BBRichTextEditor
                        name="sales_info.description"
                        label="Sales Description"
                        placeholder="Enter sales related description..."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }} component="div">
                      <BBRichTextEditor
                        name="purchase_info.description"
                        label="Purchase Description"
                        placeholder="Enter purchase related description..."
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="inventory.track_inventory" label="Track Inventory" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }} component="div" display="flex" alignItems="center">
                      <BBSwitch name="return_policy.returnable" label="Returnable" />
                    </Grid>

                    <Grid size={{ xs: 12 }} component="div">
                      <BBRichTextEditor
                        name="product_details.description"
                        label="Product Description"
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
                productImages={[]}
                refetch={refetch}
              />
            )}

            {tab === (isEdit ? 2 : 1) && (
              <VariantBuilder initialData={initialVariantData || undefined} onSave={handleVariantSave} />
            )}
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProduct;
