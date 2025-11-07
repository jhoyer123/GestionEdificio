import axios from "axios";
import { API_URL } from "../config/api";


//crear facturas
export const createFactura = async () => {
  try {
    // API_URL already contains '/api', avoid duplicating it -> /api/api
    const response = await axios.post(`${API_URL}/facturas`);
    return response.data;
  } catch (error) {
    console.error("Error creating factura:", error);
    throw error;
  }
};

//traer facturras
export const getFacturas = async () => {
  try {
  const response = await axios.get(`${API_URL}/facturas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching facturas:", error);
    throw error;
  }
};

//traer factura por id
export const getFacturaById = async (id: number | null) => {
  try {
  const response = await axios.get(`${API_URL}/facturas/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching factura:", error);
    throw error;
  }
};

//TRAER FACTURAS POR DEPARTAMENTO o id de usuario que es lo mismo
export const getFacturasByUsuario = async (usuarioId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/facturas/usuario/${usuarioId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching facturas by usuario:", error);
    throw error;
  }
};

//crear factura pra reserva
export const createFacturaForReserva = async (
  montoTotal: number,
  reservaId: number
) => {
  try {
    const response = await axios.post(`${API_URL}/facturas/reserva`, {
      montoTotal,
      reservaId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating factura for reserva:", error);
    throw error;
  }
};
