import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_BASE_URL = `${BASE}/api/reservas`;

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
export const createReserva = async (reservaData: any) => {
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
export const updateEstadoReserva = async (id: number, nuevoEstado: string) => {
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

//traer las reservas de un usuario especifico
export const UserReservas = async (idUsuario: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuario/${idUsuario}`);
    //console.log("Response from UserReservas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las reservas del usuario:", error);
    throw error;
  }
};

//obtener reserva por id
export const getReservaById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener la reserva por ID:", error);
    throw error;
  }
};
