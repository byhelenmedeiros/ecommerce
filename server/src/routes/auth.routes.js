import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

function sign(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Cookies padrão (httpOnly em produção)
function setAuthCookies(res, token, role) {
  const opts = {
    httpOnly: true,        
    sameSite: 'lax',
    secure: false,           // apenas true em produção (https)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('token', token, opts);
  res.cookie('role', role, { ...opts, httpOnly: false });
}

// POST /auth/register
router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'email já registado' });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name, role: 'customer' }
  });

  const token = sign(user);
  setAuthCookies(res, token, user.role);

  res.status(201).json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// POST /auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email e password obrigatórios' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.password).catch(() => false);
  if (!ok) return res.status(401).json({ error: 'credenciais inválidas' });

  const token = sign(user);
  setAuthCookies(res, token, user.role);

  res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

router.post('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('role');
  res.json({ ok: true });
});

router.get('/auth/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(200).json({ user: null });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, name: true } });
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

router.post('/auth/change-password', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ error: 'nova password obrigatória' });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    const ok = await bcrypt.compare(currentPassword || '', user.password).catch(() => false);
    if (!ok) return res.status(400).json({ error: 'password atual incorreta' });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
});

router.post('/auth/password/forgot', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email obrigatório' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ ok: true }); // não revela

  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiresAt: expires } });

  console.log(`[reset-link] http://localhost:3000/reset?token=${token}&email=${encodeURIComponent(email)}`);

  res.json({ ok: true });
});

// POST /auth/password/reset
router.post('/auth/password/reset', async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  if (!email || !token || !newPassword) return res.status(400).json({ error: 'dados incompletos' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetToken || !user.resetTokenExpiresAt) return res.status(400).json({ error: 'token inválido' });
  if (user.resetToken !== token || user.resetTokenExpiresAt < new Date()) {
    return res.status(400).json({ error: 'token inválido' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, resetToken: null, resetTokenExpiresAt: null }
  });
  res.json({ ok: true });
});

export default router;
