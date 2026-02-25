export interface IProductImages {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type IProductImage = {
  data: {
    images: IProductImages[];
    total: number;
  };
};
