export interface ITags {
  id: string;
  tag_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ITag = {
  data: {
    tags: ITags[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};
