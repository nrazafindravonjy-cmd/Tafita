import { createClient } from '@neondatabase/neon-js';

const authUrl = process.env.EXPO_PUBLIC_NEON_AUTH_URL ?? '';
const dataApiUrl = process.env.EXPO_PUBLIC_NEON_DATA_API_URL ?? '';

// Visitors browse places without an account, so the Data API falls back to an
// anonymous token that row-level security restricts to public rows.
export const neon = createClient({
  auth: { url: authUrl, allowAnonymous: true },
  dataApi: { url: dataApiUrl },
});
