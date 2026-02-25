// IHomeScreen.ts

export interface IHomeScreenResponse {
  success: boolean;
  message: string;
  data: IHomeScreenData;
}

export interface IHomeScreenData {
  home_carousel: IWidget;
  refer_a_friend: IWidget;
  special_offer: IWidget;
}

export interface IWidget {
  id: string;
  widget_type: string;
  campaign_id: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  campaign: ICampaign;
}

export interface ICampaign {
  id: string;
  name: string;
  title: string;
  description: string;
  content: string;
  type: string;
  status: string;
  target_type: string;
  start_date: string | null;
  end_date: string | null;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  next_occurrence: string | null;
  is_perpetual: boolean;
  perpetual_type: string;
  media_url: string;
  thumbnail_url: string;
  action_url: string;
  carousel_enabled: boolean;
  carousel_order: number;
  carousel_title: string;
  carousel_description: string;
  carousel_start_date: string | null;
  carousel_end_date: string | null;
  carousel_position_preference: string;
  show_urgency_indicator: boolean;
  show_participant_count: boolean;
  participation_limit: number;
  total_budget: number;
  current_spend: number;
  reward_type: string;
  reward_value: number;
  reward_currency: string;
  priority: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
