"use client";
import { productsimage } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import BBFileUploadCloud from "@/lib/BBFileUploadCloud/BBFileUploadCloud";
import { showToastMessage } from "@/utils/toastUtil";
import { Box } from "@mui/material";
import React, { useRef } from "react";

type PresignedUrlResponse = {
  upload_url: string;
  object_name: string;
  public_url: string;
  expires_at: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
type ProductImage = {
  id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ProductImageUploadProps = {
  product_id: string;
  isEdit: boolean;
  refetch?: () => void;
};
const ProductImageUpload = ({ product_id, isEdit, refetch }: ProductImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { mutateApi: createProductImage } = useApi<ApiResponse<ProductImage>>(productsimage.postProductimage, "POST");

  const onFileUploadSuccess = async (imageUploadData: PresignedUrlResponse) => {
    try {
      setLoading(true);

      const { public_url } = imageUploadData;
      const imagePayload = {
        product_id: product_id,
        image_url: public_url,
        sort_order: 1,
      };

      const productimage = await createProductImage(imagePayload);
      refetch?.();
      showToastMessage(productimage?.message ?? "Image uploaded and record saved successfully!", "success");
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setLoading(false);
    }
  };

  return (
    <>
      {isEdit && (
        <Box>
          <BBFileUploadCloud
            handleFileUpload={(data) => onFileUploadSuccess(data)}
            foldername="products"
            loading={loading}
            setLoading={setLoading}
          />
        </Box>
      )}
    </>
  );
};

export default ProductImageUpload;
