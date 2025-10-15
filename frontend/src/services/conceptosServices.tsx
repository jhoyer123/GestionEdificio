import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los conceptos
export const getConceptos = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/concept-mantenimiento`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conceptos:", error);
    throw error;
  }
};

//crear concepto
export const createConcepto = async (concepto: {
  titulo: string;
  descripcion: string;
  monto: number;
  frecuencia: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/concept-mantenimiento`,
      concepto
    );
    return response.data;
  } catch (error) {
    console.error("Error creating concepto:", error);
    throw error;
  }
};

// Actualizar un concepto por ID
export const updateConcepto = async (
  id: number,
  concepto: {
    titulo: string;
    descripcion: string;
    monto: number;
    frecuencia: string;
  }
) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/concept-mantenimiento/${id}`,
      concepto
    );
    return response.data;
  } catch (error) {
    console.error("Error updating concepto:", error);
    throw error;
  }
};

//obteniendo un concepto por ID
export const getConceptoById = async (id: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/concept-mantenimiento/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching concepto by ID:", error);
    throw error;
  }
};

//eliminar un concepto por ID
export const deleteConcepto = async (id: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/concept-mantenimiento/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting concepto:", error);
    throw error;
  }
};
