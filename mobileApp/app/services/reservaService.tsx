import axios from "axios";

const API_RESERVAS_URL = "http://192.168.0.3:3000/api/reservas";

export interface CreateReservaPayload {
  usuarioId?: number | null;
  areaComunId?: number | null;
  fechaReserva: string;
  fechaFinReserva?: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  motivo?: string;
  numAsistentes?: number;
  cajaId?: number | null;
}

export const createReserva = async (payload: CreateReservaPayload) => {
  try {
    const response = await axios.post(API_RESERVAS_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating reserva:", error);
    throw error;
  }
};

export const getReservasByUsuario = async (idUsuario: number) => {
  try {
    const url = `${API_RESERVAS_URL}/usuario/${idUsuario}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservas by usuario:", error);
    throw error;
  }
};

export default {
  createReserva,
  getReservasByUsuario,
};
