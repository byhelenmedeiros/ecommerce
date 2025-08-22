import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.token || null);
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.id || payload.userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    req.user = { id: userId };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.token || null);
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.sub || payload.id || payload.userId;
      if (userId) req.user = { id: userId };
    }
  } catch {
    
  }
  next();
}
