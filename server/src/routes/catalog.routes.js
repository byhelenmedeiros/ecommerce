import { Router } from 'express';
import { prisma } from '../libs/prisma.js';

const r = Router();

/**
 * GET /catalog/categories
 * Lista categorias 
 */
r.get('/categories', async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(cats);
  } catch (e) { next(e); }
});

/**
 * GET /catalog/products
 * Filtros: ?q=texto&category=slug&page=1&take=12
 * 
 */
r.get('/products', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const take = Math.min(Math.max(parseInt(req.query.take ?? '12', 10), 1), 60);
    const skip = (page - 1) * take;
    const { q, category } = req.query;

    const where = {
      active: true,
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(category ? { category: { slug: category } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take,
        include: {
          images: { orderBy: { sort: 'asc' }, take: 1 },
          variants: { select: { priceCents: true }, orderBy: { priceCents: 'asc' } }
        }
      }),
      prisma.product.count({ where })
    ]);

    const mapped = items.map(p => ({
      ...p,
      minPriceCents: p.variants.length ? p.variants[0].priceCents : null
    }));

    res.json({ items: mapped, total, page, take });
  } catch (e) { next(e); }
});

/**
 * GET /catalog/products/:slug
 * Detalhe do produto, com imagens, variantes e categoria
 */
r.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sort: 'asc' } },
        variants: true,
        category: true
      }
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (e) { next(e); }
});

export default r;
