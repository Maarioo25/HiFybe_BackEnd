# HiFybe – BackEnd 🎧🛠️

Este repositorio contiene el **BackEnd** de **HiFybe**, una red social musical que conecta a usuarios por su ubicación y gustos musicales mediante integración con Spotify. Implementa autenticación segura, gestión de usuarios, amigos, chats, playlists y ubicación.

- 🔗 Repositorio: [HiFybe\_BackEnd](https://github.com/Maarioo25/HiFybe_BackEnd)
- 🚀 Web desplegada: [https://mariobueno.info](https://mariobueno.info)
- 🚀 Backend desplegado: [https://api.mariobueno.info](https://api.mariobueno.info)
- 📽️ Presentación: [Ver en Canva](https://www.canva.com/design/DAGqML3KOHU/Gmd0HagvLIDl1Kx24MKn_w/view?utm_content=DAGqML3KOHU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=haca5c05453)

---

## 🚀 Tecnologías principales

| Tecnología        | Descripción                                                      |
| ----------------- | ---------------------------------------------------------------- |
| **Node.js**       | Entorno de ejecución JavaScript para el servidor.                |
| **Express.js**    | Framework web minimalista y flexible para construir APIs.        |
| **MongoDB**       | Base de datos NoSQL para almacenar usuarios, amigos, chats, etc. |
| **Mongoose**      | ODM para MongoDB, permite definir esquemas y modelos.            |
| **JWT**           | Autenticación segura mediante tokens.                            |
| **Passport.js**   | Middleware de autenticación (Spotify, Google, local).            |
| **Cookie-parser** | Manejo de cookies para sesiones web seguras.                     |
| **CORS**          | Configuración de permisos entre frontend y backend.              |
| **dotenv**        | Gestión de variables de entorno.                                 |
| **Swagger**       | Documentación interactiva de la API.                             |

---

## 📁 Estructura del proyecto

```
src/
├── controllers/        # Lógica de negocio (usuarios, chats, mensajes, etc.)
├── middleware/         # Autenticación y protección de rutas
├── models/             # Esquemas de Mongoose (Usuario, Amistad, Mensaje...)
├── routes/             # Endpoints agrupados por recurso

server.js               # Punto de entrada del servidor Express
.gitignore              # Archivos ignorados por Git
package.json            # Dependencias y scripts
package-lock.json       # Versionado exacto de dependencias
```

---

## 🔐 Autenticación

* **Local (email/contraseña)** con tokens JWT.
* **OAuth con Spotify y Google** mediante Passport.js.
* Tokens JWT enviados en:

  * **Web**: en cookies seguras (`HttpOnly`, `SameSite=None`, `Secure`).
  * **Móvil**: en cabecera `Authorization: Bearer <token>`.

---

## 🌍 Funcionalidades clave

* 🔑 Registro / login / logout
* 🧑‍🤝‍🧑 Gestión de amigos y solicitudes
* 💬 Sistema de mensajes y conversaciones entre amigos
* 📍 Ubicación y descubrimiento de usuarios cercanos
* 🎧 Integración con Spotify (perfil, playlists, canción actual)
* 📁 Carga y actualización de foto de perfil
* 🔔 Notificaciones personalizadas

---

## 🧪 Ejecución local

```bash
# Clonar el repositorio
git clone https://github.com/Maarioo25/HiFybe_BackEnd.git
cd HiFybe_BackEnd

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev
```

> La API estará disponible por defecto en: `http://localhost:3000`

---

## 📄 Documentación Swagger

Una vez en ejecución, puedes acceder a la documentación de la API en:

```
http://localhost:3000/api-docs
```

---

## 📜 Licencia

Este proyecto ha sido desarrollado como parte de un **proyecto de final de grado**. Su uso, distribución y modificación están prohibidos sin autorización expresa del autor.

---

## 🤝 Contacto

**Mario Bueno López**
- 📧 [mariobueno060@gmail.com](mailto:mariobueno060@gmail.com)
- 🔗 [LinkedIn](https://www.linkedin.com/in/mario-bueno-l%C3%B3pez-a35181250/)
- 💻 [HiFybe\ Web](https://github.com/Maarioo25/HiFybe_FrontEnd)
- 📱 [HiFybe\ Movil](https://github.com/Maarioo25/HiFybe_Movil)
