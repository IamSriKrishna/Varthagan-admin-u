import axios from "axios";
import { localStorageAuthKey } from "@/constants/localStorageConstant";
import { LoginResponse } from "@/models/IUser";
import { config } from "@/config";

const API_BASE_URL = config.apiDomain || "http://127.0.0.1:8088";

// Helper to get token from Redux persisted state
const getToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return "";

    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return "";

    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || "";
  } catch (e) {
    console.error("Failed to get token from persisted auth:", e);
    return "";
  }
};

// Helper to get headers with auth
const getHeaders = (contentType: string = "application/json") => ({
  "Content-Type": contentType,
  Authorization: `Bearer ${getToken()}`,
});

// Types
export interface CreateUserInput {
  name: string;
  number: string;
  email: string;
  company_id: number;
  password: string;
  user_type: string;
  role_name: string;
}

export interface UpdateUserInput {
  username?: string;
  phone?: string;
  email?: string;
}

export interface UpdateUserStatusInput {
  status: "active" | "inactive";
}

export interface UpdateUserRoleInput {
  role_name: string;
}

export interface User {
  id: number;
  email?: string;
  phone?: string;
  username: string;
  user_type: string;
  role: string;
  status: "active" | "inactive";
  company_id?: number;
  company_name?: string;
  company?: {
    id: number;
    company_name: string;
    business_type_id: number;
    gst_number?: string;
    pan_number?: string;
    created_at?: string;
    updated_at?: string;
  };
  created_at: string;
  updated_at?: string;
  created_by?: number;
  last_login_at?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
}

export interface CreateUserResponse {
  success: boolean;
  data: User;
}

export interface UpdateUserResponse {
  success: boolean;
  data: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

// API Functions
export const userApi = {
  // Get all users
  listUsers: async (params?: ListUsersParams): Promise<UsersListResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const url = queryParams.toString()
      ? `${API_BASE_URL}/auth/admin/users?${queryParams.toString()}`
      : `${API_BASE_URL}/auth/admin/users`;

    const response = await axios.get<UsersListResponse>(url, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Get single user
  getUserById: async (id: number): Promise<UserDetailResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.get<UserDetailResponse>(
      `${API_BASE_URL}/auth/admin/users/${id}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },

  // Create user
  createUser: async (input: CreateUserInput): Promise<CreateUserResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.post<CreateUserResponse>(
      `${API_BASE_URL}/auth/admin/create-user`,
      input,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },

  // Update user
  updateUser: async (id: number, input: UpdateUserInput): Promise<UpdateUserResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.put<UpdateUserResponse>(
      `${API_BASE_URL}/auth/admin/users/${id}`,
      input,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<DeleteUserResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.delete<DeleteUserResponse>(
      `${API_BASE_URL}/auth/admin/users/${id}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },

  // Update user status
  updateUserStatus: async (
    id: number,
    input: UpdateUserStatusInput
  ): Promise<UpdateUserResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.put<UpdateUserResponse>(
      `${API_BASE_URL}/auth/admin/users/${id}/status`,
      input,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },

  // Update user role
  updateUserRole: async (
    id: number,
    input: UpdateUserRoleInput
  ): Promise<UpdateUserResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in first.");
    }

    const response = await axios.put<UpdateUserResponse>(
      `${API_BASE_URL}/auth/admin/users/${id}/role`,
      input,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  },
};
