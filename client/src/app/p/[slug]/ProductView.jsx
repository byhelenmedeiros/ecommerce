'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import VariantSelector from '@/components/VariantSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { getWishlistIds, addWishlist, removeWishlist } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import { migrateWishlist } from '@/lib/api';



// util local p/ dinheiro
const formatEUR = (cents) =>
  (cents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

export default function ProductView({ product }) {
  const router = useRouter();

  // seleção inicial = 1ª variante
  const [sel, setSel] = useState({
    color: product?.variants?.[0]?.color || null,
    size: product?.variants?.[0]?.size || null,
    variantId: product?.variants?.[0]?.id || null,
  });

  // wishlist local (persistido em localStorage)
  const [wished, setWished] = useState(false);
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      if (isLoggedIn()) {
        const { ids } = await getWishlistIds();
        if (mounted) setWished(ids.includes(product.id));
      } else {
        const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (mounted) setWished(wl.includes(product.id));
      }
    } catch {}
  })();
  return () => { mounted = false; };
}, [product.id]);

async function toggleWish() {
  try {
    if (isLoggedIn()) {
      if (wished) {
        await removeWishlist(product.id);
        setWished(false);
      } else {
        await addWishlist(product.id);
        setWished(true);
      }
    } else {
      const set = new Set(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      if (set.has(product.id)) {
        set.delete(product.id);
        setWished(false);
      } else {
        set.add(product.id);
        setWished(true);
      }
      localStorage.setItem('wishlist', JSON.stringify([...set]));
    }
  } catch (e) {
    alert('Não foi possível atualizar favoritos.');
  }
}


async function onLoginSuccess() {
  const guest = JSON.parse(localStorage.getItem('wishlist') || '[]');
  if (guest.length) {
    await migrateWishlist(guest);
    localStorage.removeItem('wishlist');
  }
}

  // galeria por cor
  const gallery = useMemo(() => {
    const imgs =
      product?.variants
        ?.filter((v) => v.color === sel.color)
        ?.flatMap((v) => v.images || []) || [];
    return imgs.length ? imgs : product.images || [];
  }, [product, sel.color]);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => setActiveIdx(0), [gallery]);

  const cover = gallery[activeIdx]?.url || product.images?.[0]?.url;

  // variante atual
  const currentVariant = useMemo(
    () => product?.variants?.find((v) => v.id === sel.variantId) || null,
    [product, sel.variantId]
  );
  const inStock = (currentVariant?.stock ?? 0) > 0;

  // preços com regras
  const priceCents = Number.isFinite(currentVariant?.priceCents) ? currentVariant.priceCents : null;
  const rawPromo =
    Number.isFinite(currentVariant?.promoPriceCents)
      ? currentVariant.promoPriceCents
      : (Number.isFinite(currentVariant?.attrs?.promoPriceCents)
          ? currentVariant.attrs.promoPriceCents
          : null);

  const hasPromo = Number.isFinite(rawPromo) && Number.isFinite(priceCents) && rawPromo < priceCents;
  const promoCents = hasPromo ? rawPromo : null;
  const discountPct =
    hasPromo && priceCents > 0 ? Math.max(0, Math.round(((priceCents - promoCents) / priceCents) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* Top: voltar + breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-black underline underline-offset-4"
          aria-label="Voltar"
        >
          ← Voltar
        </button>

        <nav className="text-xs text-gray-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          {product.category?.slug ? (
            <Link href={`/c/${product.category.slug}`} className="hover:underline">
              {product.category?.name}
            </Link>
          ) : (
            <span>{product.category?.name}</span>
          )}
          <span className="mx-1">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galeria */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={product.name} className="w-full rounded-xl border" />
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {gallery.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id ?? i}
                src={img.url}
                alt={img.alt || ''}
                onClick={() => setActiveIdx(i)}
                className={`w-20 h-20 object-cover rounded border cursor-pointer ${
                  i === activeIdx ? 'ring-2 ring-black' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Painel de compra (sticky) */}
        <div className="md:sticky md:top-6 h-fit">
          {/* Título + coração */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {product.category?.name} • {product.target}
              </p>
            </div>
            <button
              aria-label={wished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              title={wished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={toggleWish}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FontAwesomeIcon
                icon={wished ? faHeartSolid : faHeartRegular}
                className={wished ? 'text-red-600' : 'text-gray-500'}
                size="lg"
              />
            </button>
          </div>

          {/* Preço / promo / stock */}
          <div className="mt-3 flex items-center gap-3">
            {hasPromo ? (
              <>
                {/* só promo + normal riscado */}
                <div className="text-2xl font-semibold text-red-600">
                  {formatEUR(promoCents)}
                </div>
                {Number.isFinite(priceCents) && (
                  <div className="text-sm line-through text-gray-500">
                    {formatEUR(priceCents)}
                  </div>
                )}
                {discountPct > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    -{discountPct}%
                  </span>
                )}
              </>
            ) : (
              // sem promo: apenas o preço normal
              Number.isFinite(priceCents) && (
                <div className="text-2xl font-semibold">{formatEUR(priceCents)}</div>
              )
            )}

            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                inStock ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'
              }`}
            >
              {inStock ? 'Em stock' : 'Esgotado'}
            </span>
          </div>

          {/* Seleção cor/tamanho */}
          <div className="mt-5">
            <VariantSelector product={product} selected={sel} onChange={setSel} />
          </div>

          {/* Comprar — dois botões */}
          <div className="mt-5">
            <AddToCart
              product={product}
              selectedVariantId={sel.variantId}
              inStock={inStock}
            />
          </div>

          {/* Descrição */}
          {product.description && (
            <div className="mt-6 prose prose-sm max-w-none">
              <h3 className="text-base font-semibold">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Guia de tamanhos (se houver) */}
          {product.sizeGuide && (
            <details className="mt-4 rounded-lg border p-3">
              <summary className="cursor-pointer select-none text-sm font-medium">
                Guia de tamanhos ({product.sizeGuide.system})
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      {Object.keys(product.sizeGuide.table?.[0] || {}).map((k) => (
                        <th key={k} className="py-1 pr-4 font-medium uppercase">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeGuide.table?.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="py-2 pr-4">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Meta simples */}
          <ul className="mt-4 text-xs text-gray-500 space-y-1">
            <li>Tipo: {product.kind}</li>
            {currentVariant?.sizeSystem && <li>Sistema de tamanho: {currentVariant.sizeSystem}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
