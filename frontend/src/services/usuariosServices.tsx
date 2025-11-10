import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_URL = `${BASE}/api/usuarios`;

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

//Cambiar contraseña
export const changePassword = async (passwordData: any) => {
  try {
    //traer id del usuario del localstorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    const response = await axios.put(
      `${API_URL}/${userId}/cambiar-contrasena`,
      passwordData
    );
    return response.data;
  } catch (error) {
    console.error("Error cambiando la contraseña:", error);
    throw error;
  }
};

// Actualizar un usuario
export const updateUsuario = async (id: number, usuarioData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, usuarioData);
    return response.data;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};


// Eliminar un usuario
export const deleteUsuario = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};