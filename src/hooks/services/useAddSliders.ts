import { config } from "@/config";
import { slider } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { ISliderFormSubmit } from "@/models/ISliderForm";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type CampaignSlider = {
  id: string;
  slider_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const useSliderMutation = (
  campaignId: string,
): ((payload: ISliderFormSubmit, sliderId?: string) => Promise<ApiResponse<CampaignSlider>>) => {
  const postUrl = slider.postSlider(campaignId);
  const putUrl = (id: string) => slider.putSlider(campaignId, id);

  const { mutateApi: createSlider } = useApi<ApiResponse<CampaignSlider>>(
    postUrl,
    "POST",
    undefined,
    config.campaginDomain,
  );

  const { mutateApi: updateSlider } = useApi<ApiResponse<CampaignSlider>>("", "PUT", undefined, config.campaginDomain);

  const submitSlider = async (payload: ISliderFormSubmit, sliderId?: string): Promise<ApiResponse<CampaignSlider>> => {
    if (sliderId) {
      const response = await updateSlider(payload, putUrl(sliderId));
      return response as ApiResponse<CampaignSlider>;
    } else {
      const response = await createSlider(payload);
      return response as ApiResponse<CampaignSlider>;
    }
  };

  return submitSlider;
};

export default useSliderMutation;
