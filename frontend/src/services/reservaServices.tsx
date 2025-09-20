import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/reservas"; // Cambia esto por la URL de tu API

export interface Reserva {
  idReserva?: number;
  usuarioId: number;
  areaComunId: number | null;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  numAsistentes: number;
  // Otros campos relevantes
}
// Crear una nueva reserva
export const createReserva = async (reservaData: Reserva) => {
  try {
    const response = await axios.post(API_BASE_URL, reservaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    throw error;
  }
};
