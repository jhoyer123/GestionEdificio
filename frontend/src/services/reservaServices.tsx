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

// Obtener todas las reservas
export const getReservas = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    throw error;
  }
};

// Actualizar una reserva existente
export const updateReserva = async (
  idReserva: number,
  reservaData: Partial<Reserva>
) => {
  try {
    console.log(
      "Actualizando reserva con IDssssssssssss:",
      `${API_BASE_URL}/${idReserva}`
    );
    const response = await axios.put(
      `${API_BASE_URL}/${idReserva}`,
      reservaData
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);
    throw error;
  }
};

//actualizar estado de una reserva
export const updateEstadoReserva = async (
  id: number,
  nuevoEstado: string
) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/estado/${id}`, {
      estado: nuevoEstado,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado de la reserva:", error);
    throw error;
  }
};
