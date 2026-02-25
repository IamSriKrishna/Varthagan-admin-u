
import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8088';

const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const persistedRoot = localStorage.getItem(localStorageAuthKey);
    if (!persistedRoot) return '';
    
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return '';
    
    const authData = JSON.parse(rootData.auth) as LoginResponse;
    return authData.access_token || '';
  } catch (e) {
    console.error('Failed to get token from persisted auth:', e);
    return '';
  }
};

const getHeaders = (contentType: string = 'application/json') => ({
  'Content-Type': contentType,
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return { success: true, data: [] };
  }
  
  return response.json();
};

export const apiService = {
  async get(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async post(url: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async put(url: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async patch(url: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};