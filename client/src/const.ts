export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  // Handle missing env vars gracefully
  if (!oauthPortalUrl || !appId) {
    console.warn("OAuth not configured - VITE_OAUTH_PORTAL_URL or VITE_APP_ID missing");
    return "/"; // Return home page if OAuth not configured
  }

  // Use API URL for callback if available (for split frontend/backend deployments)
  // The callback URL should go to the backend which handles OAuth
  const callbackOrigin = apiUrl || window.location.origin;
  const redirectUri = `${callbackOrigin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
