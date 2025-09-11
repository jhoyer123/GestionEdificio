import axios from "axios";

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
