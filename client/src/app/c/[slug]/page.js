// src/app/c/[slug]/page.js
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = params;
  const { color, size, target, kind, page = '1' } = searchParams || {};
  const { items, total, take } = await getProducts({
    category: slug,
    color,
    size,
    target,
    kind,
    page,
    take: 12,
  });

  return (
    <>
      <h1 className="text-xl font-semibold mb-2">Categoria: {slug}</h1>
      <p className="text-sm text-gray-600 mb-4">
        {total} resultado{total === 1 ? '' : 's'}
        {color ? ` • cor: ${color}` : ''}
        {size ? ` • tamanho: ${size}` : ''}
        {target ? ` • público: ${target}` : ''}
        {kind ? ` • tipo: ${kind}` : ''}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}
