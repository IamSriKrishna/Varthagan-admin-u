import { config } from "@/config";
import { slider } from "@/constants/apiConstants";
import useSliderMutation from "@/hooks/services/useAddSliders";
import useApi from "@/hooks/useApi";
import { BBDialog } from "@/lib";
import { BBDragAndDropList } from "@/lib/BBDragandDrop/BBDragandDrop";
import BBPopover from "@/lib/BBPopover/BBPopover";
import { ISliderForm } from "@/models/ISliderForm";
import { showToastMessage } from "@/utils/toastUtil";
import { Avatar, Box, Card, Chip, Grid, IconButton, Typography } from "@mui/material";
import { Edit, EyeOff, GripVertical, Trash2, View } from "lucide-react";
import { useEffect, useState } from "react";
import * as classes from "./SliderCard.styles";

interface SliderApiResponse {
  success: boolean;
  message: string;
}

interface SliderCardProps {
  campaignId: string;
  results: { data: ISliderForm[] };
  refetch?: () => void;
  setOpenSlider: (value: { open: boolean; type: "create" | "edit"; data?: ISliderForm }) => void;
}

export default function SliderCard({ campaignId, refetch, setOpenSlider, results }: SliderCardProps) {
  const [slides, setSlides] = useState<ISliderForm[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<ISliderForm | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (results?.data?.length) {
      setSlides(results.data);
    }
  }, [results]);

  const { mutateApi: deleteProduct } = useApi<SliderApiResponse>("", "DELETE", undefined, config.campaginDomain);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = slider.putSlider(campaignId, selectedId);
      const response = await deleteProduct(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Slide deleted successfully", "success");
        refetch?.();
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };

  const submitSlider = useSliderMutation(campaignId);
  const { mutateApi: reorderSlides } = useApi<SliderApiResponse>(
    slider.SliderReorder(campaignId),
    "POST",
    undefined,
    config.campaginDomain,
  );

  const handleChipClick = (event: React.MouseEvent<HTMLElement>, slide: ISliderForm) => {
    setAnchorEl(event.currentTarget);
    setSelectedSlide(slide);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleToggleActive = async () => {
    if (!selectedSlide) return;

    const updatedActive = !selectedSlide.active;
    const payload = {
      active: updatedActive,
    };

    try {
      const response = await submitSlider(payload, selectedSlide.id);

      if (response?.success) {
        showToastMessage(response.message || "Status updated", "success");
        refetch?.();
      } else {
        showToastMessage(response?.message || "Failed to update status", "error");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    } finally {
      handlePopoverClose();
    }
  };

  const handleOrderChange = async (newSlides: ISliderForm[]) => {
    setSlides(newSlides);

    const payload = {
      slide_orders: newSlides.map((slide, index) => ({
        slide_id: slide.id,
        order: index + 1,
      })),
    };

    try {
      const response = await reorderSlides(payload);

      if (response?.success) {
        refetch?.();
        showToastMessage(response.message || "Order updated successfully", "success");
      } else {
        showToastMessage(response?.message || "Failed to update order", "error");
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    }
  };
  return (
    <Box sx={classes.containerSx}>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12 }} component="div">
          <BBDragAndDropList
            items={slides}
            getItemId={(item) => item.id}
            onOrderChange={handleOrderChange}
            renderItem={(slide, listeners, ref) => (
              <Card ref={ref} key={slide.id} sx={classes.sliderCardStyles}>
                <Box sx={classes.dragIconSx} {...listeners}>
                  <GripVertical size={18} />
                </Box>

                <Avatar alt={slide.name} src={slide.public_url} variant="rounded" sx={{ width: 56, height: 56 }} />

                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {slide.name}
                </Typography>

                <Chip
                  icon={slide.active ? <View size={16} /> : <EyeOff size={16} />}
                  label={slide.active ? "Active" : "Inactive"}
                  color={slide.active ? "success" : "default"}
                  size="small"
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChipClick(e, slide);
                  }}
                />

                <IconButton
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSlider({ open: true, type: "edit", data: slide });
                  }}
                  aria-label="edit slider"
                >
                  <Edit size={18} />
                </IconButton>

                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(slide.id);
                    setOpenDeleteDialog(true);
                  }}
                  aria-label="delete slider"
                >
                  <Trash2 size={18} />
                </IconButton>
              </Card>
            )}
          />
        </Grid>
      </Grid>

      <BBPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        onConfirm={handleToggleActive}
        message={selectedSlide?.active ? "Make this slide inactive?" : "Make this slide active?"}
      />
      <BBDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title="Delete Slide"
        content="Are you sure you want to delete this slide? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}
