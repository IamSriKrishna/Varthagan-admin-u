export interface ICategoryImage {
  id: string;
  category_id: string;
  image_type: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface ICategory {
  id: string;
  category_name: string;
  description: string;
  is_active: boolean;
  images?: ICategoryImage[];
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  is_bb_coins_enabled: boolean;
}

export type ICategories = {
  data: {
    categories: ICategory[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

export interface ICategorys {
  categories: ICategory[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
