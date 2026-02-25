import { Role } from "@/constants/authroizationConstants";

export interface IUser {
  id: number;
  name: string;
  email: string;
  username: string;
  usertype: string;
  role: Role;
  user_type: string;
  status: string;
  created_at: string;
  last_login_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: IUser;
}
