'use client';
import { useState } from 'react';
import { addToCart, getCart } from '@/lib/api';
import { getSessionId } from '@/lib/session';

export default function AddToCart({ product, selectedVariantId }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  async function handleAdd() {
    const sessionId = getSessionId();
    if (!selectedVariantId) return alert('Seleciona cor/tamanho');
    setLoading(true);
    try {
      await addToCart({ sessionId, variantId: selectedVariantId, qty });
      setOk('Adicionado!');
      const cart = await getCart(sessionId);
      window.dispatchEvent(new CustomEvent('cart:count', { detail: cart.itemCount || 0 }));
    } catch (e) {
      alert('Erro ao adicionar: ' + e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setOk(null), 1500);
    }
  }

  // mostra preço da variante selecionada (se existir)
  const v = product.variants.find((x) => x.id === selectedVariantId);
  const price = v ? (v.priceCents / 100).toFixed(2) : null;

  return (
    <div className="mt-4 space-y-3">
      <div className="text-lg font-medium">{price ? `€ ${price}` : ''}</div>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          className="w-24 border rounded p-2"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !selectedVariantId}
          className="flex-1 bg-black text-white py-3 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </button>
      </div>
      {ok && <div className="text-green-600 text-sm">{ok}</div>}
    </div>
  );
}
