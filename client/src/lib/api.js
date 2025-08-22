export const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function jfetch(url, init) {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getCategories() {
  return jfetch(`${API}/catalog/categories`);
}

export function getProducts(params = {}) {
  const qs = new URLSearchParams(params);
  return jfetch(`${API}/catalog/products?${qs.toString()}`);
}

export function getProduct(slug) {
  return jfetch(`${API}/catalog/products/${slug}`);
}
export function getCart(sessionId) { return jfetch(`${API}/cart?sessionId=${encodeURIComponent(sessionId)}`); }
export function addToCart(body) {
  return jfetch(`${API}/cart/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}


function authHeaders() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// --- wishlist ---
export function getWishlistIds() {
  return jfetch(`${API}/me/wishlist/ids`, { headers: { ...authHeaders() } });
}
export function addWishlist(productId) {
  return jfetch(`${API}/me/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ productId }),
  });
}
export function removeWishlist(productId) {
  return fetch(`${API}/me/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
    return true;
  });
}
export function migrateWishlist(items) {
  return jfetch(`${API}/me/wishlist/migrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ items }),
  });
}

// Auth
export const auth = {
  me: () => jfetch(`${API}/auth/me`),
  login: (email, password) => jfetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }),
  register: (email, password, name) => jfetch(`${API}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  }),
  logout: () => jfetch(`${API}/auth/logout`, { method: 'POST' }),
  forgot: (email) => jfetch(`${API}/auth/password/forgot`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  }),
  reset: (email, token, newPassword) => jfetch(`${API}/auth/password/reset`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, newPassword })
  }),

  
};