import { localStorageAuthKey } from '@/constants/localStorageConstant';
import { LoginResponse } from '@/models/IUser';

const API_BASE_URL = 'http://127.0.0.1:8080';

// Helper to get token from Redux persisted state
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

// Helper to get headers with auth
const getHeaders = (contentType: string = 'application/json') => ({
  'Content-Type': contentType,
  'Authorization': `Bearer ${getToken()}`,
});

// Bottle Size API calls
export const bottleSizeService = {
  async createBottleSize(data: {
    size_ml: number;
    size_label: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/bottle-sizes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        let errorMessage = errorData.error || errorData.message || 'Failed to create bottle size';
        
        // Check for duplicate entry error
        if (errorMessage.includes('Error 1062') || errorMessage.includes('Duplicate entry')) {
          throw new Error(`Bottle size ${data.size_ml} ML already exists`);
        }
        
        throw new Error(errorMessage);
      } catch (e: any) {
        throw new Error(e.message || 'Failed to create bottle size');
      }
    }
    return response.json();
  },

  async getBottleSizes(page: number = 1, pageSize: number = 10) {
    const response = await fetch(
      `${API_BASE_URL}/bottle-sizes?page=${page}&pageSize=${pageSize}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch bottle sizes');
    return response.json();
  },

  async getBottleSize(id: number) {
    const response = await fetch(`${API_BASE_URL}/bottle-sizes/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch bottle size');
    return response.json();
  },

  async updateBottleSize(
    id: number,
    data: { size_ml?: number; size_label?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/bottle-sizes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update bottle size');
    return response.json();
  },

  async deleteBottleSize(id: number) {
    const response = await fetch(`${API_BASE_URL}/bottle-sizes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.error && error.error.includes('foreign key constraint')) {
        throw new Error('Failed to delete bottle size: This bottle size is in use by existing bottles. Please remove or update all bottles using this size first.');
      }
      throw new Error('Failed to delete bottle size');
    }
    if (response.status === 204) return { success: true };
    return response.json();
  },
};

// Bottle API calls
export const bottleService = {
  async createBottle(data: {
    size_id: number;
    bottle_type: string;
    neck_size_mm: number;
    thread_type: string;
    stock: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/bottles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        let errorMessage = errorData.error || errorData.message || 'Failed to create bottle';
        
        // Check for duplicate entry error
        if (errorMessage.includes('Error 1062') || errorMessage.includes('Duplicate entry')) {
          throw new Error('Bottle with these specifications already exists');
        }
        
        throw new Error(errorMessage);
      } catch (e: any) {
        throw new Error(e.message || 'Failed to create bottle');
      }
    }
    return response.json();
  },

  async getBottles(page: number = 1, pageSize: number = 10) {
    const response = await fetch(
      `${API_BASE_URL}/bottles?page=${page}&pageSize=${pageSize}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch bottles');
    return response.json();
  },

  async getBottle(id: number) {
    const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch bottle');
    return response.json();
  },

  async updateBottle(
    id: number,
    data: {
      size_id?: number;
      bottle_type?: string;
      neck_size_mm?: number;
      thread_type?: string;
      stock?: number;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update bottle');
    return response.json();
  },

  async deleteBottle(id: number) {
    const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.error && error.error.includes('foreign key constraint')) {
        throw new Error('Failed to delete bottle: This bottle is in use by existing products. Please remove or update all products using this bottle first.');
      }
      throw new Error('Failed to delete bottle');
    }
    if (response.status === 204) return { success: true };
    return response.json();
  },

  async getCompatibleCaps(bottleId: number) {
    const response = await fetch(`${API_BASE_URL}/bottles/${bottleId}/compatible-caps`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch compatible caps');
    return response.json();
  },
};

// Cap API calls
export const capService = {
  async createCap(data: {
    neck_size_mm: number;
    thread_type: string;
    cap_type: string;
    color?: string;
    material: string;
    stock: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/caps`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        let errorMessage = errorData.error || errorData.message || 'Failed to create cap';
        
        // Check for duplicate entry error
        if (errorMessage.includes('Error 1062') || errorMessage.includes('Duplicate entry')) {
          throw new Error('Cap with these specifications already exists');
        }
        
        throw new Error(errorMessage);
      } catch (e: any) {
        throw new Error(e.message || 'Failed to create cap');
      }
    }
    return response.json();
  },

  async getCaps(page: number = 1, pageSize: number = 10) {
    const response = await fetch(
      `${API_BASE_URL}/caps?page=${page}&pageSize=${pageSize}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch caps');
    return response.json();
  },

  async getCap(id: number) {
    const response = await fetch(`${API_BASE_URL}/caps/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cap');
    return response.json();
  },

  async updateCap(
    id: number,
    data: {
      neck_size_mm?: number;
      thread_type?: string;
      cap_type?: string;
      color?: string;
      material?: string;
      stock?: number;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/caps/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update cap');
    return response.json();
  },

  async deleteCap(id: number) {
    const response = await fetch(`${API_BASE_URL}/caps/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.error && error.error.includes('foreign key constraint')) {
        throw new Error('Failed to delete cap: This cap is in use by existing products. Please remove or update all products using this cap first.');
      }
      throw new Error('Failed to delete cap');
    }
    if (response.status === 204) return { success: true };
    return response.json();
  },
};

// Product API calls
export const productService = {
  async createProduct(data: {
    product_name: string;
    bottle_id: number;
    cap_id: number;
    quantity: number;
    mrp: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        let errorMessage = errorData.error || errorData.message || 'Failed to create product';
        
        // Check for duplicate entry error
        if (errorMessage.includes('Error 1062') || errorMessage.includes('Duplicate entry')) {
          throw new Error('Product already exists');
        }
        
        throw new Error(errorMessage);
      } catch (e: any) {
        throw new Error(e.message || 'Failed to create product');
      }
    }
    return response.json();
  },

  async getProducts(page: number = 1, pageSize: number = 10) {
    const response = await fetch(
      `${API_BASE_URL}/products?page=${page}&pageSize=${pageSize}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProduct(id: number) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async updateProduct(
    id: number,
    data: {
      product_name?: string;
      bottle_id?: number;
      cap_id?: number;
      quantity?: number;
      mrp?: number;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        let errorMessage = errorData.error || errorData.message || 'Failed to update product';
        throw new Error(errorMessage);
      } catch (e: any) {
        throw new Error(e.message || 'Failed to update product');
      }
    }
    return response.json();
  },

  async deleteProduct(id: number) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
    if (response.status === 204) return { success: true };
    return response.json();
  },

  async checkCompatibility(bottleId: number, capId: number) {
    const response = await fetch(`${API_BASE_URL}/products/check-compatibility`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bottle_id: bottleId, cap_id: capId }),
    });
    if (!response.ok) throw new Error('Failed to check compatibility');
    return response.json();
  },
};
