import axios from "axios";
import { API_URL } from "../config/api";


//crear caja
export const createCaja = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/cajas`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la caja:", error);
    throw error;
  }
};

//obtener todas las cajas
export const getCajas = async () => {
  try {
    const response = await axios.get(`${API_URL}/cajas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las cajas:", error);
    throw error;
  }
};

//eliminar caja
export const deleteCaja = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/cajas/${id}`);
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
