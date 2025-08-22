import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

// IDs dos produtos do utilizador
router.get('/me/wishlist/ids', requireAuth, async (req, res) => {
  const rows = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    select: { productId: true },
  });
  res.json({ ids: rows.map(r => r.productId) });
});

// Lista completa (resumo do produto)
router.get('/me/wishlist', requireAuth, async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        select: {
          id: true, slug: true, name: true,
          images: { take: 1, orderBy: { sort: 'asc' } },
          variants: { select: { priceCents: true, promoPriceCents: true }, take: 1 },
          category: { select: { name: true } },
        }
      }
    }
  });
  res.json({ items });
});

// Adicionar (idempotente)
router.post('/me/wishlist', requireAuth, async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId required' });

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: {},
    create: { userId: req.user.id, productId },
  });
  res.status(201).json({ ok: true });
});

// Remover
router.delete('/me/wishlist/:productId', requireAuth, async (req, res) => {
  const productId = req.params.productId;
  await prisma.wishlist.delete({
    where: { userId_productId: { userId: req.user.id, productId } },
  }).catch(() => {});
  res.status(204).end();
});

// Migrar itens do visitante após login
router.post('/me/wishlist/migrate', requireAuth, async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.json({ ok: true, added: 0 });

  await prisma.wishlist.createMany({
    data: items.map(productId => ({ userId: req.user.id, productId })),
    skipDuplicates: true,
  });
  res.json({ ok: true, added: items.length });
});

export default router;
