// Centraliza la URL base de la API para el proyecto móvil.
// Usa la variable de entorno API_HOST si está presente, de lo contrario
// cae al valor por defecto '192.168.26.6'. No tocar otros archivos.

const HOST = process.env.API_HOST || '192.168.26.6';
const PORT = process.env.API_PORT || '3000';
const PREFIX = process.env.API_PREFIX || '/api';

export const API_URL = `http://${HOST}:${PORT}${PREFIX}`;

// Exporta también HOST por si acaso alguna parte del código necesita solo el host
export const API_HOST = HOST;
