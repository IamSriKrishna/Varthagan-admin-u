"use client";

import ImageCard from "@/components/imageCard/ImageCard";
import { categoryimage } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { BBDialog } from "@/lib";
import { ICategoryImage } from "@/models/ICategory";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
export interface UploadSuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
export interface ApiResponse {
  success: boolean;
  message?: string;
}
const ViewCategoryImages: React.FC<{
  categoryImages: ICategoryImage[];
  refetch?: () => void;
  type: "image" | "icon";
}> = ({ categoryImages, refetch, type }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { mutateApi: deleteProductImage, loading: deleteloading } = useApi<ApiResponse>("", "DELETE");
  const [imageList, setImageList] = useState<ICategoryImage[]>([]);

  useEffect(() => {
    if (categoryImages) {
      const filtered = categoryImages.filter((img) => img.image_type == type);
      setImageList(filtered);
    }
  }, [categoryImages, type]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${categoryimage.postCategoryimage}/${selectedId}`;
      const response = await deleteProductImage(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Image deleted successfully", "success");
        refetch?.();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {imageList.map((img, index) => (
          <ImageCard
            key={img.id}
            img={img}
            index={index}
            onDelete={(id) => {
              setSelectedId(id);
              setOpen(true);
            }}
          />
        ))}
      </Grid>
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Category Image"
        maxWidth="sm"
        content="Are you sure you want to delete this category image? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteloading}
        confirmColor="error"
      />
    </Box>
  );
};

export default ViewCategoryImages;
