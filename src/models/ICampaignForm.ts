export interface ICampaignForm {
  name: string;
  title: string;
  description: string;
  content: string;
  type: string;
  status: string;
  target_type: string;
  is_perpetual: boolean | string;
  perpetual_type: string;
  action_url: string;
  reward_type: string;
  reward_value: number | string;
  reward_currency: string;
  priority: number | string;
  slides?: { public_url: string }[];
}
