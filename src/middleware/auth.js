const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  console.log('[Auth] Token recibido en headers:', req.headers.authorization);
  console.log('[Auth] Token final extraído:', token);

  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    console.log('[Auth] ID decodificado del token:', decoded.id);
    next();
  } catch (err) {
    console.error('[Auth] Token inválido:', err.message);
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}


module.exports = requireAuth;
