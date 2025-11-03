import axios from "axios";

const API_URL = "http://192.168.0.3:3000/api";

export const crearPago = async (pagoData: any) => {
  try {
    const response = await axios.post(`${API_URL}/pagos`, pagoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el pago:", error);
    throw error;
  }
};

export const obtenerPagoPorId = async (idPago?: number) => {
  try {
    const response = await axios.get(`${API_URL}/pagos/${idPago}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener pago:", error);
    throw error;
  }
};

export const confirmarPagoApi = async (idPago?: number) => {
  try {
    const response = await axios.put(`${API_URL}/pagos/confirmar/${idPago}`);
    return response.data;
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    throw error;
  }
};

export default { crearPago, obtenerPagoPorId, confirmarPagoApi };
