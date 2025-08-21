import { getProduct } from '@/lib/api';
import ProductView from './ProductView';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductView product={product} />;
}
