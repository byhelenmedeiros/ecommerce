'use client';
import { useMemo } from 'react';

export default function VariantSelector({ product, selected, onChange }) {
  const byColor = useMemo(() => {
    const map = {};
    for (const v of product.variants || []) {
      const color = v.color || 'Único';
      map[color] ||= { sizes: [], images: v.images?.length ? v.images : [] };
      map[color].sizes.push({
        size: v.size || 'Único',
        id: v.id,
        stock: v.stock,
        sizeSystem: v.sizeSystem,
      });
      if (v.images?.length) map[color].images = v.images;
    }
    return map;
  }, [product.variants]);

  const colors = Object.keys(byColor);

  return (
    <div className="space-y-4">
      {/* COR */}
      {colors.length > 1 && (
        <div>
          <div className="text-sm mb-2">Cor</div>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => {
              const available = byColor[c].sizes.some((s) => s.stock > 0);
              const active = selected.color === c;
              return (
                <button
                  key={c}
                  onClick={() => onChange({ ...selected, color: c, variantId: null, size: null })}
                  disabled={!available}
                  className={`px-3 py-2 rounded border ${
                    active ? 'border-black' : 'border-gray-300'
                  } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={!available ? 'Sem stock nesta cor' : ''}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAMANHO */}
      {selected.color && byColor[selected.color] && byColor[selected.color].sizes.some((s) => s.size !== 'Único') && (
        <div>
          <div className="text-sm mb-2">Tamanho</div>
          <div className="flex gap-2 flex-wrap">
            {byColor[selected.color].sizes
              .reduce((acc, s) => (acc.some((x) => x.size === s.size) ? acc : acc.concat(s)), [])
              .map((s) => {
                const inStock = byColor[selected.color].sizes.find((x) => x.size === s.size)?.stock > 0;
                const active = selected.size === s.size;
                return (
                  <button
                    key={s.size}
                    onClick={() => {
                      const v = byColor[selected.color].sizes.find((x) => x.size === s.size);
                      onChange({ ...selected, size: s.size, variantId: v?.id || null });
                    }}
                    disabled={!inStock}
                    className={`px-3 py-2 rounded border ${
                      active ? 'border-black' : 'border-gray-300'
                    } ${!inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={!inStock ? 'Sem stock neste tamanho' : ''}
                  >
                    {s.size}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
