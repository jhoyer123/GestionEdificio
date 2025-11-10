import axios from "axios";

// src/services/areasService.ts
export interface AreaComun {
  idAreaComun: number;
  tipoArea: string;
  nombreAreaComun: string;
  descripcion: string;
  capacidadMaxima: number;
  costoBase: number;
  horarioApertura: string;
  horarioCierre: string;
  requiereAprobacion: false;
  imageUrl?: string;
}

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_BASE_URL = `${BASE}/api/areas-comunes`; // Cambia esto por la URL de tu API
const API_RESERVAS_URL = `${BASE}/api/reservas`;

//crear areas comunes
export const crearAreaComun = async (data: FormData) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear área común:", error);
    throw error;
  }
};

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

// Actualizar área común
export const updateAreaComun = async (id: string, data: FormData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar área común:", error);
    throw error;
  }
};

// Eliminar área común
export const deleteAreaComun = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar área común:", error);
    throw error;
  }
};
