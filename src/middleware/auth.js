const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  // 1. Primero intentar obtener token del Authorization header (prioridad)
  let token = req.headers.authorization?.split(' ')[1];
  
  // 2. Si no está en headers, buscar en cookies (respaldo)
  if (!token) {
    token = req.cookies?.token;
  }

  console.log('[Auth] Token recibido en headers:', req.headers.authorization);
  console.log('[Auth] Token final extraído:', token ? 'Presente' : 'undefined');

  // Si no hay token, devolver error
  if (!token) {
    return res.status(401).json({ 
      mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar información del usuario en req
    req.user = { 
      id: decoded.id, 
      email: decoded.email 
    };
    req.userId = decoded.id; // Para compatibilidad con código legacy
    
    console.log('[Auth] ID decodificado del token:', decoded.id);
    next();
  } catch (err) {
    console.error('[Auth] Token inválido:', err.message);
    return res.status(401).json({ 
      mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
    });
  }
}

module.exports = requireAuth;
