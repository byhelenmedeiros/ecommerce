import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const { items } = await getProducts({ page: 1, take: 12 });
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(p => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
