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

//traer una funcion por id
export const getFuncionById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la función con id ${id}:`, error);
    throw error;
  }
};

//crear una nueva funcion
export const createFuncion = async (funcionData: {
  cargo: string;
  descripcion: string;
  salario: number;
}) => {
  try {
    const response = await axios.post(API_URL, funcionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la función:", error);
    throw error;
  }
};

//actualizar una funcion
export const updateFuncion = async (
  id: number,
  funcionData: {
    cargo?: string;
    descripcion?: string;
    salario?: number;
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, funcionData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la función con id ${id}:`, error);
    throw error;
  }
};

//eliminar una funcion
export const deleteFuncion = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la función con id ${id}:`, error);
    throw error;
  }
};
