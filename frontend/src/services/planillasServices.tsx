import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

//crear planillas
export const createPlanillas = async (tipo: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/planillas`, { tipo });
    return response.data;
  } catch (error) {
    console.error("Error al crear las planillas:", error);
    throw error;
  }
};

//obtener todas las planillas
export const getPlanillas = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/planillas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las planillas:", error);
    throw error;
  }
};

//obtener todas las planillas de un usuario personal
export const getPlanillasPersonal = async (personalId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/planillas/personal/${personalId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener las planillas personales:", error);
    throw error;
  }
};

//realizar pago
export const pagarPlanilla = async (
  usuarioId: number,
  monto: number,
  planillaId: number
) => {
  try {
    const response = await axios.post(`${API_URL}/api/pagos/planilla`, {
      usuarioId,
      monto,
      planillaId,
    });
    return response.data;
  } catch (error) {
    console.error("Error al realizar el pago:", error);
    throw error;
  }
};
