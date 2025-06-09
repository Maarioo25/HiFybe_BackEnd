// middleware/auth.js
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/usuario');

module.exports = async (req, res, next) => {
  console.log('––––––––––––––––––––––––');
  console.log('[auth] cookies:', req.cookies);
  console.log('[auth] authorization header:', req.headers.authorization);

  // 1) Extraer token de cookie o de header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization) {
    const [scheme, value] = req.headers.authorization.split(' ');
    if (/^Bearer$/i.test(scheme) && value) {
      token = value;
      console.log('[auth] usando Bearer token del header');
    }
  }

  if (!token) {
    console.warn('[auth] ❌ No hay token en cookie ni en header');
    return res.status(401).json({ mensaje: 'No autenticado. Token no encontrado.' });
  }

  try {
    // 2) Verificar y decodificar
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Cargar usuario sin contraseña
    const usuario = await Usuario.findById(id).select('-password');
    if (!usuario) {
      console.warn('[auth] ❌ Usuario del token no existe:', id);
      return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
    }

    // 4) Adjuntar y continuar
    req.user = usuario;
    console.log('[auth] ✅ Usuario autenticado:', usuario._id);
    next();

  } catch (err) {
    console.error('[auth] ❌ Error al verificar token:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' });
    }
    return res.status(401).json({ mensaje: 'Token inválido. Acceso denegado.' });
  }
};
