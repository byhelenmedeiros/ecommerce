'use client';

import { useMemo, useState } from 'react';
import AddToCart from '@/components/AddToCart';
import VariantSelector from '@/components/VariantSelector';

export default function ProductView({ product }) {
  const [sel, setSel] = useState({
    color: product?.variants?.[0]?.color || null,
    size: product?.variants?.[0]?.size || null,
    variantId: product?.variants?.[0]?.id || null,
  });

  const gallery = useMemo(() => {
    const groupImgs =
      product?.variants?.filter(v => v.color === sel.color)?.flatMap(v => v.images || []) || [];
    return groupImgs.length ? groupImgs : (product.images || []);
  }, [product, sel.color]);

  const cover = gallery[0]?.url || product.images?.[0]?.url;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={product.name} className="w-full rounded-lg border" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map(img => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={img.url} alt={img.alt || ''} className="w-20 h-20 object-cover rounded border" />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-gray-600 mt-1">{product.category?.name} • {product.target}</p>

        <div className="mt-4">
          <VariantSelector product={product} selected={sel} onChange={setSel} />
        </div>

        <div className="mt-4">
          <AddToCart product={product} selectedVariantId={sel.variantId} />
        </div>
      </div>
    </div>
  );
}
