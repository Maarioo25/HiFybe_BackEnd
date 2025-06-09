// middleware/auth.js
const jwt     = require('jsonwebtoken')
const Usuario = require('../models/usuario')

module.exports = async (req, res, next) => {
  // 1) Veamos qué recibimos
  console.log('––––––––––––––––––––––––')
  console.log('[auth] cookies:', req.cookies)
  console.log('[auth] authorization header:', req.headers.authorization)

  // 2) Extraemos el token de la cookie o del header
  let token = req.cookies?.token
  if (!token && req.headers.authorization) {
    const [scheme, value] = req.headers.authorization.split(' ')
    if (scheme === 'Bearer' && value) {
      token = value
      console.log('[auth] usando Bearer token del header')
    }
  }

  if (!token) {
    console.warn('[auth] ❌ No hay token en cookie ni en header')
    return res.status(401).json({ mensaje: 'No autenticado. Token no encontrado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.findById(decoded.id)
    if (!usuario) {
      console.warn('[auth] ❌ Usuario del token no existe:', decoded.id)
      return res.status(401).json({ mensaje: 'Usuario no encontrado.' })
    }
    req.user = usuario
    console.log('[auth] ✅ Usuario autenticado:', usuario._id)
    next()
  } catch (err) {
    console.error('[auth] ❌ Error al verificar token:', err)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' })
    }
    return res.status(401).json({ mensaje: 'Token inválido. Acceso denegado.' })
  }
}
