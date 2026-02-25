import { config } from "@/config";
import { partners } from "@/constants/apiConstants";
import { IPartnerForm, IPartnersResponse, RevenueSharePercent } from "@/models/IPartners";
import dayjs from "dayjs";
import useApi from "../useApi";

const useAddPartner = (): {
  addOrUpdatePartner: (partnerData: IPartnerForm, partnerId?: string) => Promise<IPartnersResponse>;
  loading: boolean;
} => {
  const { mutateApi: createProduct, loading: createLoading } = useApi(
    partners.postPartner,
    "POST",
    undefined,
    config.partnerDomain,
  );
  const { mutateApi: updatePartner, loading: updateLoading } = useApi("", "PUT", undefined, config.partnerDomain);

  const addOrUpdatePartner = async (partnerData: IPartnerForm, partnerId?: string): Promise<IPartnersResponse> => {
    const payload = {
      user_id: partnerData.user_id,
      first_name: partnerData.first_name,
      // phone: partnerData.phone,
      vendor_id: partnerData.vendor_id,
      last_name: partnerData.last_name,
      date_of_birth: partnerData.date_of_birth ? dayjs(partnerData.date_of_birth).format("YYYY-MM-DD") : "",
      gender: partnerData.gender,
      address: partnerData.address,
      city: partnerData.city,
      state: partnerData.state,
      revenue_share_percent: partnerData.revenue_share_percent
        ? (Number(partnerData.revenue_share_percent) as RevenueSharePercent)
        : undefined,
      country: "India",
      salary: Number(partnerData.salary),
      postal_code: partnerData.postal_code,
      // preferred_store_location: partnerData.preferred_store_location,
      preferred_language: "en",
      rating: 5,
      time_zone: "Asia/Kolkata",
    };

    const response = partnerId
      ? await updatePartner(payload, partners.updatePartner(partnerId))
      : await createProduct(payload);

    return response as IPartnersResponse;
  };

  return {
    addOrUpdatePartner: addOrUpdatePartner,
    loading: createLoading || updateLoading,
  };
};

export default useAddPartner;
