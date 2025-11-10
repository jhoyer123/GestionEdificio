import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_URL = `${BASE}/api/funciones`;

//traer todas las funciones
export const getFunciones = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las funciones:", error);
    throw error;
  }
};
