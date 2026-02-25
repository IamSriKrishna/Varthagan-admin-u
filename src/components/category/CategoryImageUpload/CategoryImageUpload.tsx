"use client";

import { categoryimage } from "@/constants/apiConstants";
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
type CategoryImage = {
  id: string;
  category_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type CategoryImageUploadProps = {
  category_id: string;
  accept?: string;
  type?: string;
  refetch?: () => void;
};
const CategoryImageUpload = ({ category_id, accept, type, refetch }: CategoryImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { mutateApi: createCategoryImage } = useApi<ApiResponse<CategoryImage>>(
    categoryimage.postCategoryimage,
    "POST",
  );

  const onFileUploadSuccess = async (imageUploadData: PresignedUrlResponse) => {
    try {
      setLoading(true);

      const { public_url } = imageUploadData;
      const imagePayload = {
        category_id: category_id,
        image_url: public_url,
        image_type: type,
        sort_order: 1,
      };

      const categoryimagedata = await createCategoryImage(imagePayload);
      refetch?.();
      showToastMessage(categoryimagedata?.message ?? "Image uploaded and record saved successfully!", "success");
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
      <Box>
        <BBFileUploadCloud
          handleFileUpload={(data) => onFileUploadSuccess(data)}
          foldername="categories"
          loading={loading}
          setLoading={setLoading}
          multiple={false}
          // type="file"
          accept={accept}
        />
      </Box>
    </>
  );
};

export default CategoryImageUpload;
