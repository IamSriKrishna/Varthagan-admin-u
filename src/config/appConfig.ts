export const appConfig = {
  REFRESH_INTERVAL_MS: 15000,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.guruaqua.com',
  MANUFACTURING_API_URL: process.env.NEXT_PUBLIC_MANUFACTURING_API_URL || 'http://127.0.0.1:8088',
};
