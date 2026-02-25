import { Dayjs } from "dayjs";

export interface IPartner {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  specialization?: string;
  rating?: number;
  is_active: boolean;
  vendor_id?: string;
  vendor_name?: string;
  customer_name?: string;
  product_name?: string;
  order_status?: string;
  total_amount?: string;
  created_at: string;
  updated_at: string;
}
export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
  PreferNotToSay = "prefer_not_to_say",
}
export enum RevenueSharePercent {
  Zero = 0,
  Five = 5,
  Eight = 8,
  Ten = 10,
  Twelve = 12,
  Fifteen = 15,
}
export const sharePercentageOptions = [
  { label: "0%", value: RevenueSharePercent.Zero.toString() },
  { label: "5%", value: RevenueSharePercent.Five.toString() },
  { label: "8%", value: RevenueSharePercent.Eight.toString() },
  { label: "10%", value: RevenueSharePercent.Ten.toString() },
  { label: "12%", value: RevenueSharePercent.Twelve.toString() },
  { label: "15%", value: RevenueSharePercent.Fifteen.toString() },
];

export interface IPartnerForm {
  email?: string;
  vendor_id?: string;
  id?: string;
  password?: string;
  user_id?: number | string;
  first_name?: string;
  last_name: string;
  date_of_birth?: string | Dayjs;
  gender?: Gender;
  revenue_share_percent?: RevenueSharePercent;
  phone?: string;
  address?: string;
  rating?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  salary?: number | string;
}

export interface IPartnersResponse {
  success: boolean;
  message: string;
  data: {
    partners: IPartner[];
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface IPartnerProfile {
  id: number;
  user_id: number;
  vendor_id: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  profile_image_url: string | null;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  preferred_store_location: string;
  preferred_language: string;
  preferred_currency: string;
  salary: string;
  time_zone: string;
  created_at: string;
  updated_at: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_count: number;
  referral_code: string | null;
  referred_by_user_id: number | null;
  referral_code_used_at: string | null;
  region: string;
  revenue_share_percent: number;
}

export interface IPartnerData {
  id: number;
  email: string;
  phone: string;
  username: string;
  user_type: string;
  email_verified: boolean;
  phone_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  vendor_id: string;
  profile: IPartnerProfile;
}

export interface IPartnerResponseView {
  success: boolean;
  message: string;
  data: IPartnerData[];
}
