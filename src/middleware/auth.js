// middleware/auth.js
const jwt     = require('jsonwebtoken')
const Usuario = require('../models/usuario')

module.exports = async (req, res, next) => {
  // 1) intentamos extraer de la cookie
  let token = req.cookies?.token

  // 2) si no hay cookie, miramos en el header Authorization
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1]
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No autenticado. Token no encontrado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.findById(decoded.id)
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado.' })
    }
    req.user = usuario
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' })
    }
    return res.status(401).json({ mensaje: 'Token inválido. Acceso denegado.' })
  }
}
