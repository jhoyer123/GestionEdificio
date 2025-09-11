import axios from "axios";

const API_URL = "http://localhost:3000/api/usuarios";

// Obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    throw error;
  }
};

// Crear un nuevo usuario
export const createUsuario = async (usuarioData: any) => {
  try {
    const response = await axios.post(API_URL, usuarioData);
    return response.data;
  } catch (error) {
    console.error("Error creating usuario:", error);
    throw error;
  }
};
