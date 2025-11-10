// Centraliza la URL base de la API para el proyecto móvil.
// Usa la variable de entorno API_HOST si está presente, de lo contrario
// cae al valor por defecto '192.168.26.6'. No tocar otros archivos.

// Prefer EXPO public env var (works with Expo). If not set, fall back to the
// deployed Railway URL. Keep backward-compatible API_HOST/API_PORT variables
// but don't rely on them by default.
const EXPO_URL = process.env.EXPO_PUBLIC_API_URL;
const HOST = process.env.API_HOST || '192.168.26.6';
const PORT = process.env.API_PORT || '3000';
const PREFIX = process.env.API_PREFIX || '/api';

export const API_URL = EXPO_URL
	? EXPO_URL.replace(/\/$/, '')
	: `https://gestionedificio-production.up.railway.app/api`;

// Keep exports in case other modules read them
export const API_HOST = HOST;
export const API_PORT = PORT;
