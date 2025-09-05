import axios from "axios";

const API_URL = "http://localhost:3000/api";

//Obterner todos los registros de personal
export const getPersonales = async () => {
  try {
    const response = await axios.get(`${API_URL}/personales`);
    return response.data;
  } catch (error) {
    console.error("Error fetching personal:", error);
    throw error;
  }
};
