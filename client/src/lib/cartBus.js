export const CART_COUNT_EVENT = 'cart:count';

export function broadcastCartCount(count) {
  try {
    window.dispatchEvent(new CustomEvent(CART_COUNT_EVENT, { detail: count }));
    localStorage.setItem('cartCount', String(count));
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('cart');
      bc.postMessage({ type: 'count', count });
      bc.close();
    }
  } catch {}
}

export function subscribeCartCount(handler) {
  const eventHandler = (e) => handler(Number(e.detail || 0));
  const storageHandler = (e) => {
    if (e.key === 'cartCount') handler(Number(e.newValue || '0'));
  };
  window.addEventListener(CART_COUNT_EVENT, eventHandler);
  window.addEventListener('storage', storageHandler);

  let bc;
  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel('cart');
    bc.onmessage = (e) => {
      if (e?.data?.type === 'count') handler(Number(e.data.count || 0));
    };
  }
  return () => {
    window.removeEventListener(CART_COUNT_EVENT, eventHandler);
    window.removeEventListener('storage', storageHandler);
    if (bc) bc.close();
  };
}

export function getCachedCartCount() {
  const v = localStorage.getItem('cartCount');
  return v ? Number(v) : 0;
}
