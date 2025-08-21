import { getProduct } from '@/lib/api';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  const mainImg = product.images?.[0]?.url;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainImg} alt={product.name} className="w-full rounded-lg border" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {product.images?.map(img => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={img.url} alt={img.alt || ''} className="w-20 h-20 object-cover rounded border" />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-gray-600 mt-1">{product.category?.name}</p>

        <div className="mt-4 space-y-2">
          {product.variants?.map(v => (
            <div key={v.id} className="flex items-center justify-between border rounded p-2">
              <span className="text-sm text-gray-700">{v.attrs?.color} {v.attrs?.size}</span>
              <span className="font-medium">€ {(v.priceCents/100).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900">
          Adicionar ao carrinho (demo)
        </button>
      </div>
    </div>
  );
}
