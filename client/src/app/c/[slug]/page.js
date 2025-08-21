import { getProducts } from '@/lib/api';
import CategoryView from './CategoryView';

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = params;
  const { color = '', size = '', target = '', kind = '', page = '1' } = searchParams || {};

  const data = await getProducts({
    category: slug,
    color: color || undefined,
    size: size || undefined,
    target: target || undefined,
    kind: kind || undefined,
    page,
    take: 12,
  });

  return (
    <CategoryView
      slug={slug}
      initial={data} // { items, total, page, take }
      filters={{ color, size, target, kind, page: Number(page) || 1 }}
    />
  );
}
