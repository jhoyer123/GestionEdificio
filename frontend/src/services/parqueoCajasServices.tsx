import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_URL = `${BASE}/api/cajas`;

//crear caja
export const createCaja = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la caja:", error);
    throw error;
  }
};

//obtener todas las cajas
export const getCajas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las cajas:", error);
    throw error;
  }
};

//eliminar caja
export const deleteCaja = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la caja:", error);
    throw error;
  }
};

//editar cajas
export const editCaja = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al editar la caja:", error);
    throw error;
  }
};
