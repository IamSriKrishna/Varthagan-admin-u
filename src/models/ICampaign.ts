export interface ICampaign {
  id: string;
  name: string;
  title: string;
  description: string;
  content: string;
  type: string;
  status: "active" | "inactive" | string;
  target_type: "all" | "category" | "user" | string;
  start_date: string | null; // ISO date or null
  end_date: string | null; // ISO date or null
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern: "none" | "daily" | "weekly" | "monthly" | string;
  next_occurrence: string | null; // ISO date or null
  is_perpetual: boolean;
  perpetual_type: "category" | "user" | string;
  media_url: string;
  thumbnail_url: string;
  action_url: string;

  carousel_enabled: boolean;
  carousel_order: number;
  carousel_title: string;
  carousel_description: string;
  carousel_start_date: string | null;
  carousel_end_date: string | null;
  carousel_position_preference: "standard" | "top" | "bottom" | string;

  show_urgency_indicator: boolean;
  show_participant_count: boolean;
  participation_limit: number;

  total_budget: number;
  current_spend: number;

  reward_type: "discount" | "cashback" | string;
  reward_value: number;
  reward_currency: "percent" | "amount" | string;

  priority: number;

  created_by: string | null;
  updated_by: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
