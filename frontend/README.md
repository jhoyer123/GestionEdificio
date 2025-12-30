# Sistema de Gestión de Edificios – Frontend

Aplicación web desarrollada con **React** orientada a la gestión integral de edificios, residentes, personal y áreas comunes.  
Este frontend es la interfaz principal del sistema y se comunica con un backend mediante una API.

## :sparkles: Características
- Gestión de usuarios
- Gestión de residentes y personal
- Gestión de áreas comunes
- Reservas de áreas comunes con simulación de pagos
- Gestión de reservas
- Generación de facturas de mantenimiento
- Sistema de roles (un usuario puede tener uno o más roles)
- Gestión de anuncios diferenciados por rol
- Autenticación con verificación en dos pasos (2FA)
- Dashboard administrativo con métricas

## 🛠️ Tecnologías
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- HTML
- CSS
- TanStack (según uso en el proyecto)
- @react-pdf/renderer (generación de documentos PDF)

## ⚙️ Instalación y ejecución

### Prerrequisitos
- Cuenta de Google reCAPTCHA (para obtener las claves)

### 1. Clonar el repositorio

```bash
git clone https://github.com/jhoyer123/GestionEdificio.git
```

### 2. Ingresar a la carpeta del frontend

```bash
cd frontend
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_API_URL=tu_url_del_backend
VITE_RECAPTCHA_SITE_KEY=tu_clave_de_sitio_recaptcha
```

### 5. Ejecutar en modo desarrollo

```bash
npm run dev
```

## :card_index_dividers: Estructura del proyecto

```
src/
├── app/
├── assets/                  
│   └── dashboard/
|               └── agenten8n/
|               └── anuncios/
|               └── areasComunes/
|               └── departamento/
|               └── facturas/
|               └── funcionesPersonal/
|               └── maindashboard/
|               └── pagos/
|               └── reservas/
|               └── residentes/
|               └── personal/
├── pages/              
├── assets/                 
├── components/  
|            └── shared/
|            └── ui/
├── lib/
├── services/               
├── types/
```

##:brain: Aprendizajes y Competencias Adquiridas
Durante el desarrollo de este frontend se fortalecieron varias habilidades técnicas y de gestión de proyectos:
- React y TypeScript: Desarrollo de interfaces dinámicas y tipadas, con manejo eficiente del estado y componentes reutilizables.
- Tailwind CSS y shadcn/ui: Creación de interfaces modernas, consistentes visualmente.
- Integración con APIs: Comunicación con backend REST para gestión de datos.
- Generación de PDFs: Implementación de facturas y reportes con @react-pdf/renderer.
- Seguridad y autenticación: Implementación de roles, permisos y verificación en dos pasos (2FA).

Buenas prácticas de desarrollo: Uso de estructura modular, componentes reutilizables y gestión de dependencias.

Trabajo con herramientas modernas: Configuración de Vite, manejo de variables de entorno y optimización de desarrollo con npm scripts.


