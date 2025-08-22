import Link from 'next/link';

const PLACEHOLDER = 'https://via.placeholder.com/600x600?text=Produto';

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

function getPrices(p) {
  // 1) Preferir agregados da API (se vierem)
  const min = isNum(p?.minPriceCents) ? p.minPriceCents : null;
  const minPromo = isNum(p?.minPromoPriceCents) ? p.minPromoPriceCents : null;

  if (min !== null && minPromo !== null && minPromo < min) {
    return { priceCents: min, promoCents: minPromo };
  }
  if (min !== null && minPromo === null) {
    return { priceCents: min, promoCents: null };
  }

  // 2) Fallback via variants (se a listagem trouxe variantes)
  if (Array.isArray(p?.variants) && p.variants.length) {
    const rows = p.variants
      .map((v) => ({
        price: v?.priceCents,
        promo: isNum(v?.promoPriceCents)
          ? v.promoPriceCents
          : (isNum(v?.attrs?.promoPriceCents) ? v.attrs.promoPriceCents : null),
      }))
      .filter((r) => isNum(r.price));

    if (rows.length) {
      const minPrice = rows.reduce((acc, r) => Math.min(acc, r.price), rows[0].price);
      const promosValidas = rows.filter((r) => isNum(r.promo) && r.promo < r.price).map((r) => r.promo);
      const minPromoCalc = promosValidas.length ? promosValidas.reduce((a, b) => Math.min(a, b)) : null;
      return { priceCents: minPrice, promoCents: minPromoCalc };
    }
  }

  // 3) Último recurso
  return { priceCents: null, promoCents: null };
}

const fmt = (cents) =>
  isNum(cents)
    ? (cents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
    : '—';

export default function ProductCard({ p }) {
  const img = p?.images?.[0]?.url || PLACEHOLDER;
  const { priceCents, promoCents } = getPrices(p);
  const hasPromo = isNum(promoCents) && isNum(priceCents) && promoCents < priceCents;

  return (
    <Link
      href={`/p/${p?.slug ?? ''}`}
      className="group block border rounded-lg overflow-hidden hover:shadow-sm transition"
    >
      <div className="relative aspect-square bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={p?.name || 'Produto'} className="w-full h-full object-cover" />
        {hasPromo && (
          <span className="absolute top-2 left-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
            Promo
          </span>
        )}
      </div>

      <div className="p-3">
        {p?.category?.name && (
          <div className="text-xs text-gray-500 mb-0.5">{p.category.name}</div>
        )}

        <div className="font-medium line-clamp-2">{p?.name || 'Produto'}</div>

        {/* Preços */}
        {hasPromo ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold text-red-600">{fmt(promoCents)}</span>
            <span className="text-sm line-through text-gray-500">{fmt(priceCents)}</span>
          </div>
        ) : (
          <div className="mt-1 font-semibold">{fmt(priceCents)}</div>
        )}
      </div>
    </Link>
  );
}
