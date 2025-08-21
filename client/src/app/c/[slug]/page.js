import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default async function CategoryPage({ params }) {
  const { slug } = params;
  const { items } = await getProducts({ category: slug, take: 12 });
  return (
    <>
      <h1 className="text-xl font-semibold mb-4">Categoria: {slug}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </>
  );
}
