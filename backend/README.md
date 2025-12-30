# Sistema de Gestión de Edificios – Backend

API desarrollada con **Node.js**, **Express** y **Sequelize**, con **MySQL** como base de datos.  
Este backend proporciona los endpoints necesarios para el funcionamiento completo de la aplicación frontend.

## ✨ Características
- Gestión de usuarios (CRUD)
- Gestión de residentes y personal (CRUD)
- Gestión de áreas comunes (CRUD)
- Reservas de áreas comunes con simulación de pagos
- Gestión de reservas (CRUD)
- Generación de facturas de mantenimiento en PDF
- Sistema de roles (un usuario puede tener uno o más roles)
- Gestión de anuncios diferenciados por rol
- Autenticación segura con **verificación en dos pasos (2FA)**
- Dashboard administrativo con métricas
- Todos los endpoints soportan filtros y búsquedas, retornando respuestas estructuradas (GET, POST, PUT, DELETE)

> ⚠️ Cada endpoint está diseñado para retornar respuestas claras, manejando errores y validaciones de forma consistente.

## 🛠️ Tecnologías
- Node.js
- JavaScript
- Express
- Sequelize
- MySQL
- Multer (subida de archivos)
- QR Code
- Nodemailer
- bcrypt
- jsonwebtoken

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/jhoyer123/GestionEdificio.git
```

### 2. Ingresar a la carpeta del backend

```bash
cd backend
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

JWT_SECRET=

NODE_ENV=

RECAPTCHA_SECRET_KEY=
SMTP_USER=
SMTP_PASS=
```

### 5. Migrar las tablas

```bash
npx sequelize-cli db:migrate
```

### 6. Opcional: ejecutar seeders
```bash
npx sequelize-cli db:seed:all
```

### 7. Ejecutar en modo desarrollo

```bash
npm run dev
```

## :card_index_dividers: Estructura del proyecto

```
backend/
├── asociaciones/
├── config/                  
├── controllers/
|             └── helpers/
├── middlewares/              
├── migrations/                 
├── models/
├── routes/
├── seeders/               
├── tasks/
├── uploads/
```

## :brain: Aprendizajes y Competencias Adquiridas
Durante el desarrollo de este backend se consolidaron habilidades en:
- Node.js y Express: Creación de APIs RESTful con buenas prácticas y seguridad.
- MySQL y Sequelize: Modelado de datos, relaciones y migraciones automáticas.
- Autenticación y seguridad: Implementación de JWT y verificación en dos pasos (2FA).
- Gestión de archivos y notificaciones: Uso de Multer para subida de archivos, generación de QR y envío de emails con Nodemailer.
- Estructura de proyectos escalable: Organización modular de rutas, controladores y middlewares.
- Manejo de endpoints REST: GET, POST, PUT, DELETE con filtros y respuestas consistentes, permitiendo integración eficiente con el frontend.
