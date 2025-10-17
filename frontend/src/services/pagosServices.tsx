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

//crear pago de planilla
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
    console.error("Error al crear el pago de planilla:", error);
    throw error;
  }
};

//confirmar pago de planilla subiendo el comprobante
export const confirmarPagoPlanilla = async (
  idPago: number,
  comprobante: File
) => {
  try {
    const formData = new FormData();
    formData.append("comprobante", comprobante);
    const response = await axios.put(
      `${API_URL}/api/pagos/confirmar/planilla/${idPago}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al confirmar el pago de planilla:", error);
    throw error;
  }
};
