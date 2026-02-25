import { config } from "@/config";
import { customers } from "@/constants/apiConstants";
import { ICustomer, ICustomerDetailResponse } from "@/models/ICustomer";
import useApi from "../useApi";

const useAddCustomer = (): {
  addOrUpdateCustomer: (customerData: ICustomer, customerId?: string) => Promise<ICustomerDetailResponse>;
  loading: boolean;
} => {
  const { mutateApi: createCustomer, loading: createLoading } = useApi(
    customers.postCustomer,
    "POST",
    undefined,
    config.customerDomain,
  );

  const { mutateApi: updateCustomer, loading: updateLoading } = useApi("", "PUT", undefined, config.customerDomain);

  const addOrUpdateCustomer = async (
    customerData: Partial<ICustomer>,
    customerId?: string,
  ): Promise<ICustomerDetailResponse> => {
    // const payload = {
    //   first_name: customerData.first_name ?? "",
    //   last_name: customerData.last_name ?? "",
    //   gender: customerData.gender ?? "prefer_not_to_say",
    //   status: customerData.status ?? "active",
    // };

    const response = customerId
      ? await updateCustomer(customerData, customers.updateCustomer(customerId))
      : await createCustomer(customerData);

    return response as ICustomerDetailResponse;
  };

  return {
    addOrUpdateCustomer,
    loading: createLoading || updateLoading,
  };
};

export default useAddCustomer;
