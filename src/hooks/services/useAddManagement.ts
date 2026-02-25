import { usermangement } from "@/constants/apiConstants";
import useApi from "../useApi";
import { config } from "@/config";

export interface IUserForm {
  email?: string;
  phone?: string | number;
  username?: string;
  password?: string;
  user_type?: string;
  role_name?: string;
}

export interface IUserResponse {
  id?: string | number;
  email?: string;
  username: string;
  user_type: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string;
}

const useUserManagement = (): {
  submitUser: (userData: IUserForm, userId?: string) => Promise<IUserResponse>;
  loading: boolean;
} => {
  const { mutateApi: createUser, loading: createLoading } = useApi(
    usermangement.postUsers,
    "POST",
    undefined,
    config.loginDomain,
  );

  const updateApiPath = (id: string) => `${usermangement.getUsers}/${id}`;
  const { mutateApi: updateUser, loading: updateLoading } = useApi("", "PUT", undefined, config.loginDomain);

  const submitUser = async (userData: IUserForm, userId?: string): Promise<IUserResponse> => {
    if (userId) {
      const response = await updateUser(userData, updateApiPath(userId));
      return response as IUserResponse;
    } else {
      const response = await createUser(userData);
      return response as IUserResponse;
    }
  };

  return {
    submitUser,
    loading: createLoading || updateLoading,
  };
};

export default useUserManagement;
