import Link from 'next/link';

export default function ProductCard({ p }) {
  const img = p.images?.[0]?.url || 'https://via.placeholder.com/600x600?text=Produto';
  const price = (p.minPriceCents ?? p.variants?.[0]?.priceCents ?? 0) / 100;

  return (
    <Link href={`/p/${p.slug}`} className="border rounded-lg overflow-hidden hover:shadow-sm transition">
      <div className="aspect-square bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={p.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-500">{p.category?.name}</div>
        <div className="font-medium">{p.name}</div>
        <div className="text-sm text-gray-700">€ {price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
