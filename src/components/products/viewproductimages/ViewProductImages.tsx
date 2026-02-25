"use client";

import ImageCard from "@/components/imageCard/ImageCard";
import ProductImageUpload from "@/components/products/ProductImageUpload/ProductImageUpload";
import { productsimage } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import useFileUpload from "@/hooks/useFileUpload";
import { BBDialog, BBLoader } from "@/lib";
import { IProductImage } from "@/models/IProduct";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Card, Grid } from "@mui/material";
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
const ViewProductImagesPage: React.FC<{
  productId: string;
  productImages: IProductImage[];
  refetch?: () => void;
}> = ({ productId, productImages, refetch }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { mutateApi: deleteProductImage, loading: deleteloading } = useApi<ApiResponse>("", "DELETE");
  const [imageList, setImageList] = useState<IProductImage[]>([]);
  const { uploadFile, loading: uploading } = useFileUpload();

  useEffect(() => {
    if (productImages) {
      setImageList(productImages);
    }
  }, [productImages]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${productsimage.postProductimage}/${selectedId}`;
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

  const handleImageDrop = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex === null) return;

    const updatedList = [...imageList];
    const [draggedItem] = updatedList.splice(fromIndex, 1);
    updatedList.splice(toIndex, 0, draggedItem);
    setImageList(updatedList);

    try {
      await Promise.all(
        updatedList.map((img, idx) => {
          const putUrl = `${productsimage.postProductimage}/${img.id}`;
          const payload = {
            sort_order: idx + 1,
            image_url: img.image_url,
          };
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });

          return uploadFile(blob, putUrl, "application/json");
        }),
      );

      showToastMessage("Sort order updated successfully", "success");
      refetch?.();
    } catch (e: unknown) {
      const errorMessage =
        typeof e == "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  return (
    <Box>
      <BBLoader enabled={uploading} />
      <Card
        elevation={1}
        sx={{
          borderRadius: "8px",
          p: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }} component="div">
            <ProductImageUpload product_id={productId} isEdit={true} refetch={refetch} />
          </Grid>

          {imageList.map((img, index) => (
            <ImageCard
              key={img.id}
              img={img}
              index={index}
              onDelete={(id) => {
                setSelectedId(id);
                setOpen(true);
              }}
              onDragStart={(i) => setDraggedIndex(i)}
              onDrop={(i) => {
                if (draggedIndex !== null) handleImageDrop(draggedIndex, i);
              }}
            />
          ))}
        </Grid>
      </Card>
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Product Image"
        maxWidth="sm"
        content="Are you sure you want to delete this product image? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteloading}
        confirmColor="error"
      />
    </Box>
  );
};

export default ViewProductImagesPage;
