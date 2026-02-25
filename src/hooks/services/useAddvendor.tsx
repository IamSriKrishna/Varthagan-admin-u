import { vendors } from "@/constants/apiConstants";
import { IVendor, IVendorsResponse } from "@/models/IVendor";
import useApi from "../useApi";
import { config } from "@/config";
import dayjs from "dayjs";

const useAddVendor = (): {
  addOrUpdateVendor: (vendorData: IVendor, vendorId?: string) => Promise<IVendorsResponse>;
  loading: boolean;
} => {
  const { mutateApi: createVendor, loading: createLoading } = useApi(
    vendors.postVendor,
    "POST",
    undefined,
    config.vendorDomain,
  );
  const updateApiPath = (id: string) => `${vendors.updateVendor(id)}`;
  const { mutateApi: updateVendor, loading: updateLoading } = useApi("", "PUT", undefined, config.vendorDomain);

  const addOrUpdateVendor = async (vendorData: IVendor, vendorId?: string): Promise<IVendorsResponse> => {
    const { opening_time, closing_time, ...rest } = vendorData;

    const payload: IVendor = {
      ...rest,
      opening_hours: JSON.stringify({
        open: opening_time ? dayjs(opening_time).format("hh:mm A") : null,
        close: closing_time ? dayjs(closing_time).format("hh:mm A") : null,
      }),
    };

    const response = vendorId ? await updateVendor(payload, updateApiPath(vendorId)) : await createVendor(payload);

    return response as IVendorsResponse;
  };

  return {
    addOrUpdateVendor: addOrUpdateVendor,
    loading: createLoading || updateLoading,
  };
};

export default useAddVendor;
