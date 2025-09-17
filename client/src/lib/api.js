// src/lib/api.js
export const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function jfetch(url, init = {}) {
  const res = await fetch(url, { cache: 'no-store', credentials: 'include', ...init });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg += ` - ${j.error}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/* =========================
 * AUTH
 * =======================*/
export const auth = {
  me: () => jfetch(`${API}/auth/me`),
  login: (email, password) =>
    jfetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  register: (email, password, name) =>
    jfetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }),
  logout: () => jfetch(`${API}/auth/logout`, { method: 'POST' }),
  forgot: (email) =>
    jfetch(`${API}/auth/password/forgot`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  reset: (email, token, newPassword) =>
    jfetch(`${API}/auth/password/reset`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword }),
    }),
};

/* =========================
 * CATALOGO
 * =======================*/
export function getCategories() {
  return jfetch(`${API}/categories`);
}

export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return jfetch(`${API}/products${query ? `?${query}` : ''}`);
}

export function getProduct(slug) {
  return jfetch(`${API}/products/${encodeURIComponent(slug)}`);
}

/* =========================
 * WISHLIST
 * =======================*/
export function getWishlistIds() {
  return jfetch(`${API}/me/wishlist/ids`);
}
export function addWishlist(productId) {
  return jfetch(`${API}/me/wishlist`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
}
export function removeWishlist(productId) {
  return fetch(`${API}/me/wishlist/${productId}`, {
    method: 'DELETE', credentials: 'include',
  }).then((r) => (r.ok || r.status === 204 ? true : Promise.reject()));
}
export function migrateWishlist(productIds = []) {
  return jfetch(`${API}/me/wishlist/migrate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });
}

/* =========================
 * CARRINHO
 * =======================*/
export function getCart(sessionId) {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return jfetch(`${API}/cart${qs}`);
}

 export async function getCartCount(sessionId) {
  try {
    const summary = await jfetch(
      `${API}/cart/summary${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`
    );
    if (typeof summary?.itemCount === 'number') return summary.itemCount;
  } catch {
   }
  const cart = await getCart(sessionId);
  if (typeof cart?.itemCount === 'number') return cart.itemCount;
  const sum = Array.isArray(cart?.items) ? cart.items.reduce((a, i) => a + (i.qty || 0), 0) : 0;
  return sum;
}

 export async function addToCart({ sessionId, variantId, qty }) {
  const res = await jfetch(`${API}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, variantId, qty }),
  });
  if (typeof res?.itemCount === 'number') return res;
  const itemCount = await getCartCount(sessionId);
  return { ...res, itemCount };
}

export async function updateCartItem({ itemId, qty, sessionId }) {
  const res = await jfetch(`${API}/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qty }),
  });
  if (typeof res?.itemCount === 'number') return res;
  const itemCount = await getCartCount(sessionId);
  return { ...res, itemCount };
}

export async function removeCartItem({ itemId, sessionId }) {
  const res = await jfetch(`${API}/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
  if (typeof res?.itemCount === 'number') return res;
  const itemCount = await getCartCount(sessionId);
  return { ...res, itemCount };
}
