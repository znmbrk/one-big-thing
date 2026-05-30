export const REVENUECAT_APPLE_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? '';

if (__DEV__ && !REVENUECAT_APPLE_KEY) {
  console.warn('[env] EXPO_PUBLIC_REVENUECAT_APPLE_KEY is not set. Check your .env file.');
}
