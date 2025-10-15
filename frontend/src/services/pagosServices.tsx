import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

//crear pago
export const crearPago = async (pagoData: any) => {
  try {
    const response = await axios.post(`${API_URL}/api/pagos`, pagoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el pago:", error);
    throw error;
  }
};

//obtener un pago por id
export const obtenerPagoPorId = async (idPago: number | undefined) => {
  try {
    const response = await axios.get(`${API_URL}/api/pagos/${idPago}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el pago:", error);
    throw error;
  }
};
