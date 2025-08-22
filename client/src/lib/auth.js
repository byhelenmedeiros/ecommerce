export function getAuthToken() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
export const isLoggedIn = () => !!getAuthToken();
