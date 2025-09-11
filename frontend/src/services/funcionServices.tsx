import axios from "axios";

const API_URL = "http://localhost:3000/api/funciones";

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
