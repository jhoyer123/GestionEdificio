import axios from "axios";

// src/services/areasService.ts
export interface AreaComun {
  idAreaComun: number;
  nombreAreaComun: string;
  descripcion: string;
  capacidadMaxima: number;
  costoPorHora: number;
  horarioInicio: string;
  horarioFin: string;
  requiereAprobacion: false;
  imagenUrl?: string;
}

const API_BASE_URL = "http://localhost:3000/api/areas-comunes"; // Cambia esto por la URL de tu API
const API_RESERVAS_URL = "http://localhost:3000/api/reservas";

//Traer areas comunes
export const getAreasComunes = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener áreas comunes:", error);
    throw error;
  }
};

// ✅ Obtener 1 área común por ID
export const getAreaById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data; // { id, nombre, descripcion, costoPorHora, horarioInicio, horarioFin, ... }
  } catch (error) {
    console.error("Error al obtener el área común:", error);
    throw error;
  }
};

// ✅ Obtener reservas de un área en una fecha
export const getReservasByFecha = async (areaId: string, fecha: Date) => {
  try {
    const dateStr = fecha.toISOString().split("T")[0]; // yyyy-mm-dd
    const response = await axios.get(
      `${API_RESERVAS_URL}?areaComunId=${areaId}&fecha=${dateStr}`
    );
    return response.data; // Array de reservas [{idReserva, horaInicio, horaFin, ...}]
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    throw error;
  }
};
