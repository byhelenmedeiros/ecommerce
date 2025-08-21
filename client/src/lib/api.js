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
