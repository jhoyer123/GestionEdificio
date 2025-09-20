import axios from "axios";

export interface Departamento {
  numero: number;
  descripcion: string;
  piso: number;
  alquilerPrecio: number;
}

const API_URL = "http://localhost:3000/api/departamentos";

// Obtener todos los departamentos
export const getDepartamentos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    throw error;
  }
};

//Crear un nuevo departamento
export const crearDepartamento = async (data: Departamento) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear departamento:", error);
    throw error;
  }
};

//Logica de negocio
//Obtener departamentos con usuarios
export const getDepartamentosConUsuarios = async () => {
  try {
    const response = await axios.get(`${API_URL}-cu`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener departamentos con usuarios:", error);
    throw error;
  }
};
