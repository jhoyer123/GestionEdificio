# Sistema de Gestión de Edificios – Frontend

Aplicación web desarrollada con **React** orientada a la gestión integral de edificios, residentes, personal y áreas comunes.  
Este frontend es la interfaz principal del sistema y se comunica con un backend mediante una API.

## ✨ Características
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

### Clonar el repositorio
  ```bash
  git clone https://github.com/jhoyer123/GestionEdificio.git
### ingresat a la carpeta
  cd frontend
### Instalar dependencias
  ```bash
  npm install
### Configurar variables de entorno en .env
    - Crea un archivo .env en la raíz del proyecto y agrega tus credenciales
        VITE_API_URL=url_de_tu_db
        VITE_RECAPTCHA_SITE_KEY=tu_clave_de_google_recaptcha
        #CLAVES DE GOOGLE RECAPTCHA con jhoyervega4@gmail.com
        CLAVE_DEL_SITIO=...    
        CLAVE_SECRETA=...
### Ejecución
  ```bash
  npm run dev
📂 Estructura del proyecto
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

🧠 Aprendizajes y Competencias Adquiridas

