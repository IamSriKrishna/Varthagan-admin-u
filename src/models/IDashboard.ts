export interface IStatsResponse {
  active_users: string | number;
  inactive_users?: string | number;
  new_users_in_period?: string | number;
  total_users: string | number;
  membership_users: string | number;
}
